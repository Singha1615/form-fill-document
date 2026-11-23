// Builds the filled PDF in the browser.
// Each page's filled-in text is drawn on a transparent canvas (so Thai vowels and
// tone marks render correctly) and laid over the original page with pdf-lib.
// Nothing is uploaded anywhere.

const SCALE = 3; // canvas pixels per PDF point (~216 dpi)
const FONT = "Sarabun";
let fontsReady;

function loadFonts() {
  if (!fontsReady) {
    fontsReady = Promise.all([
      document.fonts.load(`400 40px ${FONT}`, "กขค abc 123"),
      document.fonts.load(`600 40px ${FONT}`, "กขค abc 123"),
    ]);
  }
  return fontsReady;
}

function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

const segmenter =
  typeof Intl !== "undefined" && Intl.Segmenter ? new Intl.Segmenter("th", { granularity: "word" }) : null;

function words(text) {
  if (segmenter) return [...segmenter.segment(text)].map((s) => s.segment);
  return text.split(/(\s+)/);
}

/** Split text into lines that fit the given widths (Thai-aware word breaks). */
function wrap(ctx, text, widths) {
  const out = [];
  const paragraphs = String(text).split(/\n/);
  let li = 0;
  for (const para of paragraphs) {
    let line = "";
    for (const w of words(para)) {
      const maxW = widths[Math.min(li, widths.length - 1)];
      if (line && ctx.measureText(line + w).width > maxW) {
        out.push(line.trimEnd());
        li++;
        line = w.trimStart();
      } else {
        line += w;
      }
    }
    out.push(line.trimEnd());
    li++;
  }
  return out;
}

function valueOf(item, d) {
  const v = typeof item.v === "function" ? item.v(d) : d[item.v];
  return v == null ? "" : v;
}

async function drawItem(ctx, item, d, s) {
  const x = item.x + s.offX;
  const y = item.y + s.offY;

  if (item.t === "check") {
    if (!valueOf(item, d)) return;
    ctx.save();
    ctx.lineWidth = 1.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x - 3.6, y + 0.2);
    ctx.lineTo(x - 1, y + 3.2);
    ctx.lineTo(x + 4.2, y - 4.2);
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (item.t === "img") {
    const src = valueOf(item, d);
    if (!src) return;
    const img = await loadImage(src);
    const k = Math.min(item.w / img.width, item.h / img.height);
    const w = img.width * k;
    const h = img.height * k;
    ctx.drawImage(img, x + (item.w - w) / 2, y + item.h - h, w, h);
    return;
  }

  const text = String(valueOf(item, d)).trim();
  if (!text) return;
  const base = (item.size || s.size) * s.fontScale;
  const weight = item.bold ? 600 : 400;

  if (item.t === "flow") {
    ctx.font = `${weight} ${base}px ${FONT}`;
    const lines = wrap(ctx, text, item.lines.map((l) => l[2]));
    lines.slice(0, item.lines.length).forEach((ln, i) => {
      const [lx, ly] = item.lines[i];
      ctx.fillText(ln, lx + s.offX, ly + s.offY + s.textDy);
    });
    return;
  }

  // single-line text, shrunk to fit its space if needed
  let size = base;
  ctx.font = `${weight} ${size}px ${FONT}`;
  if (item.w) {
    while (ctx.measureText(text).width > item.w && size > 6) {
      size -= 0.25;
      ctx.font = `${weight} ${size}px ${FONT}`;
    }
  }
  const tw = ctx.measureText(text).width;
  let tx = x;
  if (item.align === "center" && item.w) tx = x + (item.w - tw) / 2;
  if (item.align === "right" && item.w) tx = x + item.w - tw;
  ctx.fillText(text, tx, y + s.textDy);
}

/**
 * @param {object} doc   document definition (file, size, placements)
 * @param {object} d     form values
 * @param {object} s     settings { offX, offY, fontScale, ink }
 * @returns {Promise<Uint8Array>}
 */
export async function buildPdf(doc, d, s) {
  await loadFonts();
  const file = typeof doc.file === "function" ? doc.file(d) : doc.file;
  // PDFs live in the site root, one level above this script
  const res = await fetch(new URL("../" + encodeURI(file), import.meta.url));
  if (!res.ok) throw new Error("โหลดไฟล์ต้นฉบับไม่ได้: " + file);
  const bytes = await res.arrayBuffer();

  const { PDFDocument } = window.PDFLib;
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const settings = { size: doc.size || 12, offX: 0, offY: 0, fontScale: 1, ...s, textDy: doc.textDy || 0 };
  const items = doc.placements(d);

  const byPage = new Map();
  for (const it of items) {
    if (!byPage.has(it.p)) byPage.set(it.p, []);
    byPage.get(it.p).push(it);
  }

  for (const [p, list] of byPage) {
    const page = pages[p - 1];
    if (!page) continue;
    const box = page.getCropBox();
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(box.width * SCALE);
    canvas.height = Math.round(box.height * SCALE);
    const ctx = canvas.getContext("2d");
    ctx.scale(SCALE, SCALE);
    ctx.textBaseline = "alphabetic";
    const ink = settings.ink === "blue" ? "#1638a8" : "#111111";
    ctx.fillStyle = ink;
    ctx.strokeStyle = ink;

    for (const it of list) await drawItem(ctx, it, d, settings);

    const blob = await new Promise((r) => canvas.toBlob(r, "image/png"));
    const png = await pdf.embedPng(await blob.arrayBuffer());
    page.drawImage(png, { x: box.x, y: box.y, width: box.width, height: box.height });
  }

  return pdf.save();
}
