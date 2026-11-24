import { DOCS, DOC_ORDER } from "./docs.js";
import { debounce } from "./common.js";
import { buildPdf } from "./pdfgen.js";
import { translateThToEn } from "./translate.js";

const docId = new URLSearchParams(location.search).get("doc");
const doc = DOCS[docId];
if (!doc) location.replace("index.html");

const STORE = `docform2:${docId}`;
const SETTINGS_STORE = `docform2:${docId}:settings`;
const $ = (s) => document.querySelector(s);
const form = $("#form");

// ---------- header & nav ----------
document.title = `${doc.code} | กรอกฟอร์มเอกสาร`;
$("#doc-code").textContent = doc.code;
$("#doc-title").textContent = doc.title;
$("#doc-desc").textContent = doc.desc;
const nav = $("#nav-links");
nav.innerHTML = `<li><a href="index.html">หน้าแรก</a></li>`;
for (const id of DOC_ORDER) {
  nav.insertAdjacentHTML(
    "beforeend",
    `<li><a href="form.html?doc=${id}" class="${id === docId ? "active" : ""}">${DOCS[id].code}</a></li>`
  );
}

// ---------- state ----------
const allFields = doc.sections.flatMap((s) => s.fields);
const defaults = () => {
  const d = {};
  for (const f of allFields) {
    if (f.def !== undefined) d[f.id] = typeof f.def === "function" ? f.def() : f.def;
    else d[f.id] = f.type === "checkbox" ? false : "";
  }
  return d;
};
let data = defaults();
try {
  Object.assign(data, JSON.parse(localStorage.getItem(STORE) || "{}"));
} catch {}

const save = debounce(() => {
  try {
    localStorage.setItem(STORE, JSON.stringify(data));
  } catch {
    // storage full (large images) — keep working without saving
  }
}, 300);

// ---------- build form ----------
let uid = 0;
const inputs = new Map(); // field id -> element(s)
const fieldBoxes = new Map(); // field id -> wrapper

function fieldEl(f) {
  const box = document.createElement("div");
  box.className = "field" + (f.w === "full" ? " full" : f.w === "third" ? " third" : "");
  const htmlId = `f-${f.id}`;

  if (f.type === "checkbox") {
    box.innerHTML = `<label class="check"><input type="checkbox" id="${htmlId}" /><span></span></label>`;
    box.querySelector("span").textContent = f.label;
    const cb = box.querySelector("input");
    cb.checked = !!data[f.id];
    cb.addEventListener("change", () => set(f.id, cb.checked));
    inputs.set(f.id, cb);
    return box;
  }

  const row = document.createElement("div");
  row.className = "label-row";
  const lbl = document.createElement("label");
  lbl.className = "lbl";
  lbl.htmlFor = htmlId;
  lbl.textContent = f.label;
  if (f.req) lbl.insertAdjacentHTML("beforeend", ' <span class="req">*</span>');
  row.appendChild(lbl);
  if (f.copy) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "link-btn";
    b.textContent = f.copy.label;
    b.addEventListener("click", () => {
      set(f.id, data[f.copy.from] || "");
      syncInput(f.id);
    });
    row.appendChild(b);
  }
  if (f.tr) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "link-btn";
    b.textContent = "แปลจากภาษาไทย";
    b.title = "แปลข้อความจากช่องภาษาไทยที่คู่กันด้วย Google Translate";
    b.addEventListener("click", () => runTranslate([f], true, b));
    row.appendChild(b);
  }
  box.appendChild(row);

  let el;
  if (f.type === "radio") {
    el = document.createElement("div");
    el.className = "radios" + (f.vertical ? " vertical" : "");
    const name = `r-${f.id}-${uid++}`;
    for (const [val, text] of f.opts) {
      const l = document.createElement("label");
      l.className = "radio";
      l.innerHTML = `<input type="radio" name="${name}" value="${val}" /><span></span>`;
      l.querySelector("span").textContent = text;
      const r = l.querySelector("input");
      r.checked = data[f.id] === val;
      r.addEventListener("change", () => r.checked && set(f.id, val));
      el.appendChild(l);
    }
    lbl.removeAttribute("for");
  } else if (f.type === "image") {
    el = document.createElement("div");
    el.className = "img-field";
    el.innerHTML = `
      <div class="preview">ไม่มีรูป</div>
      <label class="chip-btn" for="${htmlId}">เลือกรูป</label>
      <input type="file" id="${htmlId}" accept="image/png,image/jpeg,image/webp" />
      <button type="button" class="link-btn" hidden>ลบรูป</button>`;
    const prev = el.querySelector(".preview");
    const file = el.querySelector("input");
    const del = el.querySelector("button");
    const show = () => {
      const v = data[f.id];
      prev.style.backgroundImage = v ? `url("${v}")` : "";
      prev.textContent = v ? "" : "ไม่มีรูป";
      del.hidden = !v;
    };
    file.addEventListener("change", () => {
      const fl = file.files[0];
      if (!fl) return;
      const rd = new FileReader();
      rd.onload = () => {
        set(f.id, rd.result);
        show();
      };
      rd.readAsDataURL(fl);
      file.value = "";
    });
    del.addEventListener("click", () => {
      set(f.id, "");
      show();
    });
    show();
    el._refresh = show;
    lbl.removeAttribute("for");
    box.appendChild(el);
    box.insertAdjacentHTML("beforeend", `<span class="hint">ใช้รูปพื้นหลังโปร่งใส (PNG) จะดูดีที่สุด</span>`);
    inputs.set(f.id, el);
    return box;
  } else if (f.type === "textarea") {
    el = document.createElement("textarea");
    el.rows = 2;
  } else {
    el = document.createElement("input");
    el.type = f.type === "date" ? "date" : f.type === "email" ? "email" : "text";
    if (f.inputmode) el.inputMode = f.inputmode;
  }

  if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
    el.id = htmlId;
    el.value = data[f.id] ?? "";
    if (f.list) {
      if (el.tagName === "INPUT") {
        const dl = document.createElement("datalist");
        dl.id = `dl-${f.id}`;
        dl.innerHTML = f.list.map((o) => `<option value="${o}"></option>`).join("");
        box.appendChild(dl);
        el.setAttribute("list", dl.id);
        el.placeholder = "เลือกหรือพิมพ์";
      } else {
        el.placeholder = f.list.join(" / ");
      }
    }
    el.addEventListener("input", () => set(f.id, el.value));
  }
  box.appendChild(el);
  if (f.hint) box.insertAdjacentHTML("beforeend", `<span class="hint"></span>`), (box.lastChild.textContent = f.hint);
  inputs.set(f.id, el);
  return box;
}

doc.sections.forEach((sec, i) => {
  const s = document.createElement("section");
  s.className = "section";
  const head = document.createElement("div");
  head.className = "section-head";
  head.innerHTML = `<h2><span class="num">${i + 1}</span><span></span></h2>`;
  head.querySelector("h2 span:last-child").textContent = sec.title;
  if (sec.optional) head.querySelector("h2").insertAdjacentHTML("beforeend", `<span class="tag">ไม่บังคับ</span>`);
  if (sec.copy) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip-btn";
    b.textContent = sec.copy.label;
    b.addEventListener("click", () => {
      for (const [dst, src] of Object.entries(sec.copy.map)) {
        data[dst] = data[src] || "";
        syncInput(dst);
      }
      save();
    });
    head.appendChild(b);
  }
  s.appendChild(head);
  const grid = document.createElement("div");
  grid.className = "grid";
  for (const f of sec.fields) {
    const box = fieldEl(f);
    fieldBoxes.set(f.id, box);
    grid.appendChild(box);
  }
  s.appendChild(grid);
  form.appendChild(s);
});

function syncInput(id) {
  const el = inputs.get(id);
  if (!el) return;
  if (el._refresh) el._refresh();
  else if (el.type === "checkbox") el.checked = !!data[id];
  else if (el.classList?.contains("radios")) el.querySelectorAll("input").forEach((r) => (r.checked = r.value === data[id]));
  else el.value = data[id] ?? "";
}

function set(id, value) {
  data[id] = value;
  fieldBoxes.get(id)?.classList.remove("missing");
  save();
  refresh();
}

function refresh() {
  for (const f of allFields) {
    if (f.show) fieldBoxes.get(f.id).classList.toggle("hidden", !f.show(data));
  }
  const file = typeof doc.file === "function" ? doc.file(data) : doc.file;
  $("#btn-blank").href = encodeURI(file);
}
refresh();

// ---------- Thai -> English translation ----------
const trFields = allFields.filter((f) => f.tr);
const srcText = (f) => [].concat(f.tr).map((k) => String(data[k] || "").trim()).filter(Boolean).join(" ");
const isEmpty = (id) => !String(data[id] ?? "").trim();

async function runTranslate(fields, overwrite, btn) {
  const jobs = fields.filter((f) => srcText(f) && (overwrite || isEmpty(f.id)));
  if (!jobs.length) {
    toast(fields.length === 1 ? "กรอกช่องภาษาไทยที่คู่กันก่อน แล้วกดแปลอีกครั้ง" : "ไม่มีช่องที่ต้องแปล");
    return 0;
  }
  const old = btn.textContent;
  btn.disabled = true;
  btn.textContent = "กำลังแปล…";
  try {
    const out = await translateThToEn(jobs.map(srcText));
    jobs.forEach((f, i) => {
      data[f.id] = out[i];
      syncInput(f.id);
      fieldBoxes.get(f.id)?.classList.remove("missing");
    });
    save();
    toast(`แปลแล้ว ${jobs.length} ช่อง — ตรวจทานคำแปลก่อนใช้งาน`);
  } catch (e) {
    console.error(e);
    toast("แปลไม่สำเร็จ — ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่");
  } finally {
    btn.disabled = false;
    btn.textContent = old;
  }
  return jobs.length;
}

if (trFields.length) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "btn btn-primary";
  b.textContent = "แปลไทย → อังกฤษ ทั้งหมด";
  b.addEventListener("click", async () => {
    const pending = trFields.filter((f) => srcText(f) && isEmpty(f.id));
    if (pending.length) return runTranslate(pending, false, b);
    const filled = trFields.filter((f) => srcText(f));
    if (!filled.length) return toast("กรอกช่องภาษาไทยก่อน แล้วกดแปล");
    if (confirm("ช่องภาษาอังกฤษกรอกไว้แล้วทั้งหมด ต้องการแปลใหม่และเขียนทับหรือไม่?")) runTranslate(filled, true, b);
  });
  $(".head-actions").prepend(b);
  $("#doc-desc").insertAdjacentHTML(
    "afterend",
    `<p class="hint" style="margin-top:6px">ปุ่ม "แปล" จะเติมช่องภาษาอังกฤษจากช่องภาษาไทยให้อัตโนมัติ (ส่งเฉพาะข้อความที่แปลไปที่ Google Translate) แปลเสร็จแล้วแก้ไขได้ตามต้องการ</p>`
  );
}

// ---------- settings ----------
const defSettings = { offX: 0, offY: 0, font: 100, ink: "black" };
let settings = { ...defSettings };
try {
  Object.assign(settings, JSON.parse(localStorage.getItem(SETTINGS_STORE) || "{}"));
} catch {}
const sEls = { offX: $("#s-offX"), offY: $("#s-offY"), font: $("#s-font"), ink: $("#s-ink") };
const showSettings = () => Object.entries(sEls).forEach(([k, el]) => (el.value = settings[k]));
showSettings();
for (const [k, el] of Object.entries(sEls)) {
  el.addEventListener("input", () => {
    settings[k] = k === "ink" ? el.value : Number(el.value) || 0;
    localStorage.setItem(SETTINGS_STORE, JSON.stringify(settings));
  });
}
$("#s-reset").addEventListener("click", () => {
  settings = { ...defSettings };
  localStorage.removeItem(SETTINGS_STORE);
  showSettings();
});

// ---------- actions ----------
const toastEl = $("#toast");
let toastTimer;
function toast(text) {
  toastEl.textContent = text;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toastEl.hidden = true), 3500);
}

function checkRequired() {
  const missing = [];
  for (const f of allFields) {
    const box = fieldBoxes.get(f.id);
    const visible = !f.show || f.show(data);
    const empty = !String(data[f.id] ?? "").trim();
    box.classList.toggle("missing", !!(f.req && visible && empty));
    if (f.req && visible && empty) missing.push(f.label);
  }
  const msg = $("#msg");
  if (missing.length) {
    msg.textContent = `ยังไม่ได้กรอก ${missing.length} ช่องที่จำเป็น (ช่องสีแดง) — สร้าง PDF ได้ แต่ช่องนั้นจะว่าง`;
    msg.classList.add("warn");
  } else {
    msg.textContent = "ข้อมูลบันทึกอัตโนมัติในเบราว์เซอร์นี้";
    msg.classList.remove("warn");
  }
  return missing;
}

let lastUrl;
async function makePdf() {
  checkRequired();
  const btns = [$("#btn-preview"), $("#btn-download")];
  btns.forEach((b) => (b.disabled = true));
  const old = $("#btn-download").textContent;
  $("#btn-download").textContent = "กำลังสร้าง…";
  try {
    const bytes = await buildPdf(doc, data, {
      offX: settings.offX,
      offY: settings.offY,
      fontScale: (settings.font || 100) / 100,
      ink: settings.ink,
    });
    if (lastUrl) URL.revokeObjectURL(lastUrl);
    lastUrl = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    return lastUrl;
  } catch (e) {
    console.error(e);
    toast("สร้าง PDF ไม่สำเร็จ: " + e.message);
    return null;
  } finally {
    btns.forEach((b) => (b.disabled = false));
    $("#btn-download").textContent = old;
  }
}

function fileName() {
  const who = data.alienName || data.employeeName || data.empName || data.eName || "";
  return `${doc.code}${who ? "-" + who : ""}.pdf`.replace(/[\\/:*?"<>|]/g, "");
}

function download(url) {
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName();
  document.body.appendChild(a);
  a.click();
  a.remove();
}

const modal = $("#modal");
$("#btn-preview").addEventListener("click", async () => {
  const url = await makePdf();
  if (!url) return;
  $("#viewer").src = url;
  $("#modal-download").href = url;
  $("#modal-download").download = fileName();
  $("#modal-title").textContent = `ตัวอย่าง ${doc.code}`;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
});
$("#btn-download").addEventListener("click", async () => {
  const url = await makePdf();
  if (url) download(url);
});
function closeModal() {
  modal.hidden = true;
  $("#viewer").src = "about:blank";
  document.body.style.overflow = "";
}
modal.addEventListener("click", (e) => e.target.closest("[data-close]") && closeModal());
document.addEventListener("keydown", (e) => e.key === "Escape" && !modal.hidden && closeModal());

$("#btn-clear").addEventListener("click", () => {
  if (!confirm("ล้างข้อมูลทั้งหมดในฟอร์มนี้?")) return;
  data = defaults();
  localStorage.removeItem(STORE);
  for (const f of allFields) {
    syncInput(f.id);
    fieldBoxes.get(f.id).classList.remove("missing");
  }
  refresh();
  checkRequired();
  $("#msg").textContent = "ล้างข้อมูลแล้ว";
});
