// Document definitions: the form fields shown on the page, and where each value
// is printed on the PDF.
//
// Coordinates are in PDF points (1/72 inch), measured from the TOP-LEFT corner of
// the page. y is the text baseline. To nudge one field, change its numbers here.

import {
  thaiDate, enDate, todayISO, PROVINCES, NATIONALITIES, BUSINESS_TYPES, WORK_TYPES,
  JOB_NATURES, ALIEN_GROUPS, POSITIONS,
} from "./common.js";

// ---------- placement helpers ----------
// text in the space x1..x2 on baseline y (shrinks to fit)
const T = (p, x1, x2, y, v, o = {}) => ({ t: "text", p, x: x1 + 2, w: x2 - x1 - 2, y, v, ...o });
// text centred at cx, max width w
const TC = (p, cx, w, y, v, o = {}) => ({ t: "text", p, x: cx - w / 2, w, y, v, align: "center", ...o });
// tick mark centred at (x, y) when v(d) is true
const C = (p, x, y, v) => ({ t: "check", p, x, y, v });
// image in box x1..x2, bottom at yb, height h
const IMG = (p, x1, x2, yb, h, v) => ({ t: "img", p, x: x1, w: x2 - x1, y: yb - h, h, v });
// text that wraps over several lines: lines = [[x, y, width], ...]
const F = (p, lines, v, o = {}) => ({ t: "flow", p, lines, v, ...o });

const join = (...a) => a.filter(Boolean).join(" ");

// =====================================================================
// บต.46
// =====================================================================
const bt46 = {
  id: "bt46",
  code: "บต.46",
  title: "หนังสือรับรองการจ้าง",
  desc: "แบบแจ้งความต้องการจ้างคนต่างด้าว ระบุข้อมูลนายจ้าง ข้อมูลกิจการ และรายละเอียดการจ้าง",
  pages: 1,
  file: "บต46.pdf",
  size: 10,
  sections: [
    {
      title: "ข้อมูลนายจ้าง",
      fields: [
        {
          id: "empType", label: "ประเภทนายจ้าง", type: "radio", def: "natural", w: "full",
          opts: [["natural", "บุคคลธรรมดา"], ["thai", "นิติบุคคลไทย"], ["foreign", "นิติบุคคลต่างด้าว"]],
        },
        { id: "idCard", label: "เลขบัตรประจำตัวประชาชน", req: true, show: (d) => d.empType === "natural", inputmode: "numeric" },
        { id: "empWP", label: "ใบอนุญาตทำงานเลขที่ (ถ้ามี)", show: (d) => d.empType === "natural" },
        { id: "regDate", label: "จดทะเบียนเมื่อ", type: "date", show: (d) => d.empType !== "natural" },
        { id: "regNo", label: "เลขทะเบียนนิติบุคคล", show: (d) => d.empType === "thai" },
        { id: "capital", label: "ทุนจดทะเบียนชำระแล้ว (บาท)", show: (d) => d.empType === "thai" },
        { id: "foreignCapital", label: "จำนวนเงินที่นำเข้ามา (บาท)", show: (d) => d.empType === "foreign" },
        { id: "empName", label: "ชื่อนายจ้าง / สถานประกอบการ", req: true, w: "full" },
        { id: "empAddr", label: "ที่ตั้งสถานประกอบการ", req: true, type: "textarea", w: "full", hint: "พิมพ์ยาวได้ ระบบจะตัดขึ้นบรรทัดที่ 2 ให้เอง" },
        { id: "business", label: "ประเภทกิจการ", req: true, list: BUSINESS_TYPES, w: "full" },
      ],
    },
    {
      title: "สถานะด้านการเงิน",
      optional: true,
      fields: [
        { id: "finYear", label: "ปี พ.ศ.", w: "third" },
        { id: "finIncome", label: "รายได้ (บาท)", w: "third" },
        { id: "finTax", label: "ภาษีเงินได้ (บาท)", w: "third" },
        { id: "curIncome", label: "รายได้ปัจจุบัน (บาท)" },
        { id: "curMonths", label: "ในช่วงระยะเวลา (เดือน)" },
        { id: "exportValue", label: "มูลค่าการส่งออก (บาท)" },
        { id: "tourists", label: "นำคนต่างประเทศเข้ามาท่องเที่ยว (คน)" },
        { id: "thaiEmployees", label: "พนักงานคนไทย (คน)" },
        { id: "foreignEmployees", label: "คนต่างด้าวที่ทำงานอยู่แล้ว (คน)" },
        { id: "classrooms", label: "จำนวนห้องเรียน (ห้อง)" },
        { id: "students", label: "จำนวนนักเรียน (คน)" },
      ],
    },
    {
      title: "ข้อมูลคนต่างด้าวที่ต้องการจ้าง",
      fields: [
        { id: "alienName", label: "ชื่อคนต่างด้าว", req: true, w: "full" },
        { id: "nationality", label: "สัญชาติ", req: true, list: NATIONALITIES },
        { id: "bloodType", label: "หมู่โลหิต", list: ["A", "B", "AB", "O"] },
        { id: "alienAddr", label: "ที่อยู่ในประเทศไทย", req: true, w: "full", copy: { from: "empAddr", label: "ดึงจากที่ตั้งสถานประกอบการ" } },
        { id: "workType", label: "ประเภทงาน", req: true, list: WORK_TYPES },
        { id: "jobNature", label: "ลักษณะงาน", req: true, list: JOB_NATURES },
        { id: "workplace", label: "สถานที่ทำงานของคนต่างด้าว", req: true, w: "full", copy: { from: "empAddr", label: "ดึงจากที่ตั้งสถานประกอบการ" } },
        { id: "periodY", label: "ระยะเวลาการจ้าง (ปี)", w: "third", list: ["1", "2"] },
        { id: "periodM", label: "(เดือน)", w: "third" },
        { id: "periodD", label: "(วัน)", w: "third" },
        { id: "contractUntil", label: "มีสัญญาจ้างถึงวันที่", type: "date" },
        { id: "wage", label: "ค่าจ้าง (บาท)", req: true, list: ["400", "12,000"] },
        { id: "wageUnit", label: "ค่าจ้างคิดเป็น", type: "radio", def: "day", opts: [["day", "ต่อวัน"], ["month", "ต่อเดือน"]] },
        { id: "benefits", label: "ผลประโยชน์อื่น วันละ/เดือนละ (บาท)" },
        { id: "education", label: "ระดับการศึกษาสูงสุด", list: ["ไม่ได้รับการศึกษา", "ประถมศึกษา", "มัธยมศึกษา"] },
        { id: "experience", label: "ประสบการณ์ทำงาน (ปี)" },
        { id: "marital", label: "สถานภาพ", type: "radio", opts: [["single", "โสด"], ["married", "สมรส"]] },
      ],
    },
    {
      title: "เหตุผลที่ไม่จ้างบุคคลสัญชาติไทย",
      fields: [
        { id: "reason", label: "เหตุผล", req: true, type: "textarea", w: "full", def: "ขาดแคลนแรงงานไทย", list: ["ขาดแคลนแรงงานไทย", "ไม่มีคนไทยมาสมัครงาน"] },
      ],
    },
    {
      title: "ผู้ลงนาม",
      fields: [
        { id: "signerName", label: "ชื่อผู้ลงนาม", req: true, copy: { from: "empName", label: "ดึงจากชื่อนายจ้าง" } },
        { id: "signerTitle", label: "ตำแหน่ง", req: true, list: POSITIONS },
        { id: "signDate", label: "วันที่ลงนาม", type: "date", def: todayISO },
        { id: "sigImg", label: "รูปลายเซ็น (ไม่บังคับ)", type: "image" },
        { id: "stampImg", label: "รูปตราประทับ (ไม่บังคับ)", type: "image" },
      ],
    },
  ],
  placements: (d) => [
    // 1.1 employer type
    C(1, 86, 91.4, (d) => d.empType === "thai"),
    T(1, 200, 293, 94, (d) => (d.empType === "thai" ? thaiDate(d.regDate) : "")),
    T(1, 327, 371, 94, (d) => (d.empType === "thai" ? d.regNo : "")),
    T(1, 462, 527, 94, (d) => (d.empType === "thai" ? d.capital : "")),
    C(1, 86, 119.5, (d) => d.empType === "foreign"),
    T(1, 220, 293, 121.5, (d) => (d.empType === "foreign" ? thaiDate(d.regDate) : "")),
    T(1, 444, 527, 121.5, (d) => (d.empType === "foreign" ? d.foreignCapital : "")),
    C(1, 86, 146, (d) => d.empType === "natural"),
    T(1, 281, 387, 148.8, (d) => (d.empType === "natural" ? d.idCard : "")),
    T(1, 475, 551, 148.8, (d) => (d.empType === "natural" ? d.empWP : "")),
    T(1, 246, 551, 176.2, "empName"),
    F(1, [[178, 191.6, 373], [61, 205.1, 490]], "empAddr"),
    T(1, 180, 551, 220.1, "business"),
    // 1.2 financial status
    TC(1, 80, 70, 284.7, "finYear"),
    TC(1, 230, 190, 284.7, "finIncome"),
    TC(1, 448, 190, 284.7, "finTax"),
    T(1, 195, 252, 305, "curIncome"),
    T(1, 426, 500, 305, "curMonths", { align: "center" }),
    C(1, 64, 317.2, (d) => !!d.exportValue),
    T(1, 250, 394, 320, "exportValue"),
    C(1, 64, 331.2, (d) => !!d.tourists),
    T(1, 312, 394, 335.4, "tourists"),
    C(1, 64, 360.2, (d) => !!d.thaiEmployees),
    T(1, 275, 394, 362.8, "thaiEmployees"),
    C(1, 64, 374.2, (d) => !!d.foreignEmployees),
    T(1, 320, 394, 378.1, "foreignEmployees"),
    C(1, 64, 391.4, (d) => !!d.classrooms),
    T(1, 223, 262, 393.8, "classrooms", { align: "center" }),
    C(1, 322, 391.4, (d) => !!d.students),
    T(1, 465, 491, 393.8, "students", { align: "center" }),
    // 2. employment
    T(1, 332, 551, 427.3, "alienName"),
    T(1, 130, 267, 442.9, "nationality"),
    T(1, 406, 551, 442.9, "bloodType"),
    T(1, 203, 551, 458.2, "alienAddr"),
    T(1, 168, 551, 473.7, "workType"),
    F(1, [[166, 489.1, 385], [61, 502.6, 490]], "jobNature"),
    T(1, 285, 551, 517.5, "workplace"),
    TC(1, 151.5, 48, 532.8, "periodY"),
    TC(1, 208.5, 42, 532.8, "periodM"),
    TC(1, 281.5, 52, 532.8, "periodD"),
    T(1, 426, 551, 532.8, (d) => thaiDate(d.contractUntil)),
    T(1, 188, 266, 560.8, (d) => (d.wage ? `${d.wage} (${d.wageUnit === "month" ? "ต่อเดือน" : "ต่อวัน"})` : "")),
    T(1, 434, 527, 560.8, "benefits"),
    T(1, 137, 258, 588.4, "education"),
    TC(1, 356.5, 22, 588.4, "experience"),
    C(1, 451.6, 584.4, (d) => d.marital === "single"),
    C(1, 487.5, 584.4, (d) => d.marital === "married"),
    // 3. reason
    F(1, [[61, 631, 490], [61, 644.2, 490]], "reason"),
    // signature
    IMG(1, 290, 420, 709, 30, "sigImg"),
    IMG(1, 420, 500, 735, 60, "stampImg"),
    TC(1, 360, 120, 738, "signerName"),
    T(1, 319, 422, 753.1, "signerTitle"),
    T(1, 317, 422, 767.8, (d) => thaiDate(d.signDate)),
  ],
};

// =====================================================================
// หนังสือชี้แจงกรณีนายจ้างเดิมยังไม่แจ้งออก
// =====================================================================
const EXIT_REASONS = [
  ["resign", "ลาออกจากงาน"],
  ["runaway", "หลบหนี / ขาดงาน"],
  ["bankrupt", "นายจ้างเดิมล้มละลาย / ปิดกิจการ"],
  ["abuse", "นายจ้างเดิมกระทำทารุณ ไม่ปฏิบัติตามกฎหมายคุ้มครองแรงงาน"],
];

const exit = {
  id: "exit",
  code: "หนังสือชี้แจง",
  title: "หนังสือชี้แจงกรณีนายจ้างเดิมยังไม่แจ้งออก",
  desc: "ชี้แจงการเปลี่ยนนายจ้าง พร้อมเหตุผลการออก ข้อมูลนายจ้างใหม่ และผู้ลงนามทั้งสี่ฝ่าย",
  pages: 1,
  file: "หนังสือชี้แจงกรณีนายจ้างเดิมยังไม่แจ้งออก.pdf",
  size: 12,
  textDy: -2, // text sits just above the dotted lines
  sections: [
    {
      title: "ข้อมูลคนต่างด้าว",
      fields: [
        { id: "alienName", label: "ชื่อคนต่างด้าว", req: true, w: "full" },
        { id: "nationality", label: "สัญชาติ", req: true, list: NATIONALITIES },
        { id: "alienId", label: "เลขประจำตัวคนต่างด้าว", req: true, inputmode: "numeric" },
        { id: "passport", label: "หนังสือเดินทางเลขที่", req: true },
        { id: "alienGroup", label: "เป็นคนต่างด้าวกลุ่ม", req: true, list: ALIEN_GROUPS },
      ],
    },
    {
      title: "เหตุผลการออกจากงาน",
      fields: [
        { id: "reason", label: "ได้ออกจากงานด้วยสาเหตุ", type: "radio", def: "resign", opts: EXIT_REASONS, w: "full", vertical: true },
        { id: "leaveDate", label: "ตั้งแต่วันที่", type: "date", req: true },
      ],
    },
    {
      title: "นายจ้างใหม่และสถานที่ทำงาน",
      fields: [
        { id: "newEmployer", label: "ชื่อนายจ้างใหม่", req: true, w: "full" },
        { id: "startDate", label: "เริ่มงานตั้งแต่วันที่", type: "date", req: true },
        { id: "workNo", label: "สถานที่ทำงานเลขที่", req: true },
        { id: "road", label: "ถนน" },
        { id: "subdistrict", label: "แขวง/ตำบล", req: true },
        { id: "district", label: "เขต/อำเภอ", req: true },
        { id: "province", label: "จังหวัด", req: true, list: PROVINCES },
      ],
    },
    {
      title: "การติดต่อนายจ้างเดิม",
      fields: [
        { id: "contact", label: "ได้ประสานนายจ้างเดิมแล้ว", type: "radio", def: "unable", opts: [["unable", "ไม่สามารถติดต่อได้"], ["contacted", "ประสานนายจ้างเดิมแล้ว"]], w: "full" },
        { id: "contactDate", label: "ประสานเมื่อวันที่", type: "date", show: (d) => d.contact === "contacted" },
        { id: "phone", label: "หมายเลขโทรศัพท์", show: (d) => d.contact === "contacted", inputmode: "tel" },
      ],
    },
    {
      title: "ผู้ลงนาม",
      fields: [
        { id: "signAlien", label: "คนต่างด้าว", req: true, copy: { from: "alienName", label: "ดึงจากชื่อคนต่างด้าว" } },
        { id: "signEmployer", label: "นายจ้างใหม่", req: true, copy: { from: "newEmployer", label: "ดึงจากชื่อนายจ้างใหม่" } },
        { id: "witness1", label: "พยานคนที่ 1" },
        { id: "witness2", label: "พยานคนที่ 2" },
        { id: "sigAlien", label: "ลายเซ็นคนต่างด้าว", type: "image" },
        { id: "sigEmployer", label: "ลายเซ็นนายจ้างใหม่", type: "image" },
        { id: "sigW1", label: "ลายเซ็นพยานคนที่ 1", type: "image" },
        { id: "sigW2", label: "ลายเซ็นพยานคนที่ 2", type: "image" },
        { id: "stampImg", label: "ตราประทับนายจ้างใหม่", type: "image" },
      ],
    },
  ],
  placements: (d) => {
    const reasonY = { resign: 228.7, runaway: 255.5, bankrupt: 282.3, abuse: 309.1 };
    const reasonX = { resign: 237, runaway: 250, bankrupt: 318, abuse: 436 };
    const signY = [549.2, 594.9, 640.8, 686.5];
    const nameY = [568.1, 613.9, 659.7, 705.3];
    const names = ["signAlien", "signEmployer", "witness1", "witness2"];
    const sigs = ["sigAlien", "sigEmployer", "sigW1", "sigW2"];
    const out = [
      T(1, 206, 522, 152.9, "alienName"),
      T(1, 100, 159, 171.8, "nationality"),
      T(1, 282, 522, 171.8, "alienId"),
      T(1, 178, 288, 190.9, "passport"),
      T(1, 384, 522, 190.9, "alienGroup"),
      T(1, 82, 284, 354.9, "newEmployer"),
      T(1, 376, 522, 354.9, "workNo"),
      T(1, 88, 185, 373.9, "road"),
      T(1, 214, 310, 373.9, "subdistrict"),
      T(1, 342, 410, 373.9, "district"),
      T(1, 446, 522, 373.9, "province"),
      T(1, 113, 356, 392.9, (d) => thaiDate(d.startDate)),
      C(1, 218.2, 405.4, (d) => d.contact === "unable"),
      C(1, 218.2, 424.4, (d) => d.contact === "contacted"),
      T(1, 365, 522, 430.9, (d) => (d.contact === "contacted" ? thaiDate(d.contactDate) : "")),
      T(1, 307, 522, 449.7, (d) => (d.contact === "contacted" ? d.phone : "")),
      IMG(1, 420, 500, 560, 60, "stampImg"),
    ];
    for (const [key] of EXIT_REASONS) {
      out.push(C(1, 113, reasonY[key] - 5.5, (d) => d.reason === key));
      out.push(T(1, reasonX[key], 522, reasonY[key], (d) => (d.reason === key ? thaiDate(d.leaveDate) : "")));
    }
    names.forEach((k, i) => {
      out.push(IMG(1, 275, 412, signY[i] - 3, 30, sigs[i]));
      out.push(TC(1, 345, 145, nameY[i], k));
    });
    return out;
  },
};

// =====================================================================
// สัญญาจ้างแรงงาน (กัมพูชา / ลาว / เมียนมา) — Thai on the left; English in both the
// English and the Khmer/Lao/Myanmar blanks on the right
// =====================================================================
const CONTRACT_FILES = {
  kh: "สัญญาจ้างแรงงาน สัญชาติกัมพูชา.pdf",
  la: "สัญญาจ้างแรงงาน สัญชาติลาว.pdf",
  mm: "สัญญาจ้างแรงงาน สัญชาติเมียนมา.pdf",
};

// Positions differ slightly between the three scanned files.
// Each entry is [x1, x2, y]; signature rows are [x1, x2, y]; names are [centreX, y].
export const CONTRACT_LAYOUT = {
  kh: {
    p1th: { made: [234, 300, 167], prov: [57, 137, 190.8], emp1: [183, 273, 190.8], emp2: [46, 273, 214.6], addr1: [102, 273, 238], addr2: [46, 273, 262.1], employee: [46, 273, 309.7], eaddr1: [72, 273, 333], eaddr2: [46, 273, 357.1], pos: [227, 282, 496.9], wage: [105, 160, 520.6], pay: [164, 233, 544.4], dur: [212, 248, 615.2], wp1: [91, 275, 662.3], wp2: [48, 275, 686.3] },
    p1en: { made: [452, 540, 167.3], prov: [322, 376, 180.3], emp1: [430, 540, 180.5], emp2: [313, 540, 193.3], addr1: [347, 540, 206], addr2: [313, 540, 219], employee: [313, 540, 244.5], eaddr1: [347, 540, 341.3], eaddr2: [313, 540, 354], pos: [360, 532, 495], wage: [364, 449, 508], pay: [417, 449, 520.5], dur: [482, 540, 620.3], wp: [313, 540, 657.9] },
    p2th: { hours: [191, 252, 90.5], days: [194, 233, 114.5], weekly: [203, 254, 208.3], trad: [203, 254, 255.8], annual: [84, 109, 326.8], ot: [66, 262, 446], hol: [47, 86, 518] },
    p2en: { hours: [312, 370, 99.8], days: [425, 464, 99.3], weekly: [351, 372, 177.5], trad: [353, 394, 229], annual: [434, 525, 293.3], ot: [312, 400, 434.8], hol: [363, 400, 512] },
    p5th: { sign: [[90, 242, 345.5], [90, 242, 407], [90, 242, 468.4], [90, 242, 530.6]], name: [[163, 374.8], [163, 436.3], [163, 497.8], [163, 559.5]] },
    p5en: { sign: [[363, 506, 312.3], [363, 506, 401.7], [363, 506, 491.7], [363, 506, 581.3]], name: [[432, 333], [432, 421.8], [432, 512.2], [432, 601]] },
    // third-language (Khmer) blanks — filled with the English values
    p1x: { made: [455, 536, 257.1], prov: [327, 404, 270.4], emp1: [421, 539, 270.1], emp2: [312, 535, 281.4], addr1: [355, 538, 293.8], addr2: [312, 535, 305.1], employee: [312, 535, 328.9], eaddr1: [355, 539, 392.1], eaddr2: [312, 537, 403.1], pos: [379, 504, 545.8], wage: [330, 390, 558.6], pay: [340, 410, 571.1], dur: [333, 390, 682.9], wp1: [445, 535, 694.5], wp2: [312, 535, 706.1] },
    p2x: { hours: [447, 496, 111.9], days: [383, 449, 125.4], weekly: [351, 405, 203.6], trad: [336, 378, 267.6], annual: [471, 530, 331.6], ot: [312, 370, 473.1], hol: [451, 515, 537.1] },
    p5x: { sign: [[362, 507, 357], [362, 507, 446.3], [362, 507, 536.4], [362, 507, 625.1]], name: [[431, 378], [431, 467.8], [431, 557.5], [431, 645.5]] },
  },
  la: {
    p1th: { made: [237, 282, 175.4], prov: [66, 156, 198.4], emp1: [199, 282, 198.4], emp2: [58, 282, 221.7], addr1: [113, 283, 244.8], addr2: [58, 283, 267.5], employee: [58, 283, 312.8], eaddr1: [78, 283, 335.7], eaddr2: [58, 283, 359.2], pos: [234, 284, 496.3], wage: [117, 168, 518.8], pay: [173, 238, 541.9], dur: [215, 250, 610.4], wp1: [102, 281, 656.4], wp2: [58, 281, 679.5] },
    p1en: { made: [453, 540, 164.1], prov: [324, 390, 177.4], emp1: [434, 540, 176.6], emp2: [316, 540, 189.3], addr1: [350, 540, 202.1], addr2: [316, 540, 214.5], employee: [316, 540, 239.5], eaddr1: [350, 540, 346], eaddr2: [316, 540, 358.5], pos: [367, 530, 511.1], wage: [367, 455, 523.2], pay: [420, 453, 535.7], dur: [488, 540, 638.3], wp: [316, 540, 675] },
    p2th: { hours: [212, 273, 101.5], days: [199, 238, 124.4], weekly: [211, 258, 215.3], trad: [215, 262, 261.6], annual: [92, 117, 328.5], ot: [78, 273, 444.6], hol: [60, 100, 512.4] },
    p2en: { hours: [316, 353, 114.3], days: [418, 444, 113.8], weekly: [353, 383, 196.3], trad: [355, 398, 250.3], annual: [414, 500, 302.8], ot: [316, 394, 433.3], hol: [363, 406, 498.7] },
    p5th: { sign: [[101, 242, 347.8], [101, 242, 408.3], [101, 242, 468.7], [101, 242, 528.7]], name: [[172, 376.5], [172, 437.2], [172, 497.3], [172, 557.5]] },
    p5en: { sign: [[367, 506, 323.3], [367, 506, 418.3], [367, 506, 512.9], [367, 506, 607.4]], name: [[434, 343], [434, 437.9], [434, 532.9], [434, 627.1]] },
    // third-language (Lao) blanks — filled with the English values
    p1x: { made: [455, 534, 252.5], prov: [325, 414, 267.4], emp1: [446, 534, 267.3], emp2: [317, 531, 280.8], addr1: [357, 533, 294.3], addr2: [317, 531, 306.6], employee: [317, 535, 333.3], eaddr1: [331, 534, 397.1], eaddr2: [317, 535, 410.4], pos: [460, 522, 562.9], wage: [342, 383, 577.6], pay: [354, 402, 591.6], dur: [442, 513, 688.8], wp1: [337, 537, 716.3], wp2: [316, 535, 729.4] },
    p2x: { hours: [463, 500, 126.8], days: [397, 494, 142], weekly: [395, 447, 224.1], trad: [394, 446, 289.9], annual: [470, 508, 354.9], ot: [513, 542, 460.8], hol: [459, 497, 526.6] },
    p5x: { sign: [[356, 507, 369.6], [356, 507, 464.6], [356, 507, 560], [356, 507, 652.4]], name: [[433, 394.3], [433, 490.3], [433, 585.1], [433, 676.8]] },
  },
  mm: {
    p1th: { made: [242, 283, 174.2], prov: [66, 148, 196.9], emp1: [195, 283, 197.4], emp2: [58, 283, 220.7], addr1: [113, 283, 244.2], addr2: [58, 283, 267.3], employee: [58, 283, 313], eaddr1: [78, 283, 335.4], eaddr2: [58, 283, 358.4], pos: [234, 284, 495.1], wage: [105, 160, 517.3], pay: [172, 240, 541.1], dur: [212, 250, 609.2], wp1: [102, 281, 654.8], wp2: [58, 281, 678.2] },
    p1en: { made: [444, 540, 175.2], prov: [324, 387, 187], emp1: [418, 540, 186.5], emp2: [316, 540, 197.9], addr1: [346, 540, 209.4], addr2: [316, 540, 220.8], employee: [316, 540, 243.7], eaddr1: [346, 540, 346.7], eaddr2: [316, 540, 358], pos: [316, 468, 512.2], wage: [316, 400, 523], pay: [405, 437, 534.8], dur: [480, 540, 652.6], wp: [316, 540, 689.5] },
    p2th: { hours: [199, 254, 102], days: [195, 234, 125.4], weekly: [203, 252, 216.8], trad: [207, 258, 263.3], annual: [90, 116, 331.9], ot: [72, 266, 447.7], hol: [66, 103, 516.6] },
    p2en: { hours: [477, 508, 96.8], days: [332, 361, 109.3], weekly: [316, 344, 196], trad: [316, 344, 244.7], annual: [410, 484, 305.3], ot: [450, 540, 438.5], hol: [337, 373, 510.3] },
    p5th: { sign: [[94, 242, 410], [94, 242, 470.2], [94, 242, 530.1], [94, 242, 589.9]], name: [[168, 438.7], [168, 498.8], [168, 558.7], [168, 618.9]] },
    p5en: { sign: [[363, 500, 354.9], [363, 500, 442.8], [363, 500, 535.5], [363, 500, 624.5]], name: [[427, 374.7], [427, 462], [427, 554.9], [427, 643.2]] },
    // third-language (Myanmar) blanks — filled with the English values
    p1x: { made: [414, 534, 257], prov: [338, 412, 273.1], emp1: [453, 532, 273], emp2: [317, 533, 287], addr1: [362, 533, 298.6], addr2: [317, 534, 312.1], employee: [317, 533, 336.8], eaddr1: [362, 533, 393.8], eaddr2: [317, 533, 408], pos: [316, 398, 560.8], wage: [317, 372, 574.8], pay: [429, 472, 588.9], dur: [431, 494, 701.3], wp1: [409, 459, 729.6] },
    p2x: { hours: [412, 442, 119.9], days: [340, 371, 133.4], weekly: [312, 334, 219.9], trad: [421, 440, 279.1], annual: [414, 436, 350.9], ot: [361, 390, 474.3], hol: [313, 353, 548] },
    p5x: { sign: [[351, 504, 397.4], [364, 485, 487.1], [352, 503, 578.8], [352, 503, 666.1]], name: [[428, 419.3], [428, 512.5], [428, 601.6], [428, 688.8]] },
  },
};

const contract = {
  id: "contract",
  code: "สัญญาจ้าง",
  title: "สัญญาจ้างแรงงาน (ไทย-อังกฤษ)",
  desc: "สัญญาจ้างระหว่างนายจ้างกับลูกจ้างต่างด้าว เลือกฟอร์มตามสัญชาติ กัมพูชา ลาว หรือเมียนมา ฝั่งซ้ายกรอกภาษาไทย ฝั่งขวาใช้ภาษาอังกฤษทั้งช่องอังกฤษและช่องภาษาของลูกจ้าง",
  pages: 5,
  file: (d) => CONTRACT_FILES[d.nat] || CONTRACT_FILES.mm,
  size: 11,
  sections: [
    {
      title: "สัญชาติของลูกจ้างและคู่สัญญา",
      fields: [
        { id: "nat", label: "สัญชาติลูกจ้าง (เลือกแบบฟอร์ม)", type: "radio", def: "mm", req: true, w: "full", opts: [["mm", "เมียนมา"], ["la", "ลาว"], ["kh", "กัมพูชา"]] },
        { id: "madeDate", label: "สัญญานี้ทำขึ้นเมื่อ", type: "date", def: todayISO },
        { id: "employeeName", label: "ชื่อลูกจ้าง", req: true, hint: "ใช้ทั้งฝั่งไทยและอังกฤษ" },
        { id: "employerName", label: "ชื่อนายจ้าง / สถานประกอบการ (ไทย)", req: true },
        { id: "employerName2", label: "ชื่อนายจ้าง (ไทย) บรรทัดที่ 2" },
        { id: "employerNameEn", tr: "employerName", label: "ชื่อนายจ้าง / บริษัท (อังกฤษ)" },
        { id: "employerNameEn2", tr: "employerName2", label: "ชื่อนายจ้าง (อังกฤษ) บรรทัดที่ 2" },
      ],
    },
    {
      title: "ที่ตั้งสถานประกอบการ",
      fields: [
        { id: "provinceTh", label: "ทำสัญญาที่ (จังหวัด)", list: PROVINCES },
        { id: "provinceEn", tr: "provinceTh", label: "ทำสัญญาที่ (จังหวัด อังกฤษ)" },
        { id: "addrTh1", label: "ที่อยู่ภาษาไทย บรรทัดที่ 1", req: true },
        { id: "addrTh2", label: "ที่อยู่ภาษาไทย บรรทัดที่ 2" },
        { id: "addrEn1", tr: "addrTh1", label: "ที่อยู่ภาษาอังกฤษ บรรทัดที่ 1" },
        { id: "addrEn2", tr: "addrTh2", label: "ที่อยู่ภาษาอังกฤษ บรรทัดที่ 2" },
      ],
    },
    {
      title: "ที่อยู่ลูกจ้าง",
      optional: true,
      copy: { label: "ใช้ที่อยู่เดียวกับนายจ้าง", map: { empAddrTh1: "addrTh1", empAddrTh2: "addrTh2", empAddrEn1: "addrEn1", empAddrEn2: "addrEn2" } },
      fields: [
        { id: "empAddrTh1", label: "ที่อยู่ลูกจ้าง (ไทย) บรรทัดที่ 1" },
        { id: "empAddrTh2", label: "ที่อยู่ลูกจ้าง (ไทย) บรรทัดที่ 2" },
        { id: "empAddrEn1", tr: "empAddrTh1", label: "ที่อยู่ลูกจ้าง (อังกฤษ) บรรทัดที่ 1" },
        { id: "empAddrEn2", tr: "empAddrTh2", label: "ที่อยู่ลูกจ้าง (อังกฤษ) บรรทัดที่ 2" },
      ],
    },
    {
      title: "เงื่อนไขการจ้าง",
      fields: [
        { id: "positionTh", label: "ตำแหน่ง (ไทย)", req: true, list: ["กรรมกร", "พนักงานทั่วไป", "แม่บ้าน"] },
        { id: "positionEn", tr: "positionTh", label: "ตำแหน่ง (อังกฤษ)", list: ["Labourer", "General worker", "Housekeeper"] },
        { id: "wageTh", label: "อัตราค่าจ้าง (ไทย)", req: true, list: ["400 บาท/วัน"] },
        { id: "wageEn", tr: "wageTh", label: "อัตราค่าจ้าง (อังกฤษ)", list: ["400 baht/day"] },
        { id: "payDayTh", label: "วันที่จ่ายค่าจ้าง (ไทย)", list: ["1 และ 16", "สิ้นเดือน"] },
        { id: "payDayEn", tr: "payDayTh", label: "วันที่จ่ายค่าจ้าง (อังกฤษ)", list: ["1st and 16th", "last"] },
        { id: "durationTh", label: "ระยะเวลาจ้าง (ไทย)", list: ["2 ปี", "1 ปี"], hint: "ช่องนี้มีคำว่า เดือน/ปี พิมพ์อยู่แล้ว" },
        { id: "durationEn", tr: "durationTh", label: "ระยะเวลาจ้าง (อังกฤษ)", list: ["2 years", "1 year"] },
        { id: "wpTh1", label: "สถานที่ทำงาน (ไทย) บรรทัดที่ 1", hint: "เว้นว่างไว้ = ใช้ที่อยู่สถานประกอบการ" },
        { id: "wpTh2", label: "สถานที่ทำงาน (ไทย) บรรทัดที่ 2" },
        { id: "wpEn", tr: ["wpTh1", "wpTh2"], label: "สถานที่ทำงาน (อังกฤษ)", w: "full", hint: "เว้นว่างไว้ = ใช้ที่อยู่ภาษาอังกฤษ" },
        { id: "hours", label: "ชั่วโมงทำงาน (ชั่วโมง/วัน)", def: "8", w: "third" },
        { id: "days", label: "วันทำงาน (วัน/สัปดาห์)", def: "6", w: "third" },
        { id: "weeklyOff", label: "วันหยุดประจำสัปดาห์ (วัน)", def: "1", w: "third" },
        { id: "tradHolidays", label: "วันหยุดตามประเพณี (วัน/ปี)", def: "13", w: "third" },
        { id: "annualLeave", label: "วันหยุดพักผ่อนประจำปี (วัน/ปี)", def: "6", w: "third" },
        { id: "otTh", label: "ค่าล่วงเวลา ข้อ 5.1 (ไทย)", list: ["1.5 เท่าของอัตราค่าจ้างต่อชั่วโมง"] },
        { id: "otEn", tr: "otTh", label: "ค่าล่วงเวลา ข้อ 5.1 (อังกฤษ)", list: ["1.5 times of the hourly wage"] },
        { id: "holTh", label: "ค่าทำงานในวันหยุด ข้อ 5.2 (ไทย)", list: ["2 เท่า"] },
        { id: "holEn", tr: "holTh", label: "ค่าทำงานในวันหยุด ข้อ 5.2 (อังกฤษ)", list: ["2 times"] },
      ],
    },
    {
      title: "ผู้ลงนามและพยาน",
      fields: [
        { id: "signerTh", label: "ชื่อผู้ลงนามฝ่ายนายจ้าง (ไทย)", req: true, copy: { from: "employerName", label: "ดึงจากชื่อนายจ้าง" } },
        { id: "signerEn", tr: "signerTh", label: "ชื่อผู้ลงนามฝ่ายนายจ้าง (อังกฤษ)" },
        { id: "witness1Th", label: "ชื่อพยานคนที่ 1 (ไทย)" },
        { id: "witness1En", tr: "witness1Th", label: "ชื่อพยานคนที่ 1 (อังกฤษ)" },
        { id: "witness2Th", label: "ชื่อพยานคนที่ 2 (ไทย)" },
        { id: "witness2En", tr: "witness2Th", label: "ชื่อพยานคนที่ 2 (อังกฤษ)" },
      ],
    },
    {
      title: "ลายเซ็นและตราประทับ",
      optional: true,
      fields: [
        { id: "sigEmployer", label: "ลายเซ็นนายจ้าง", type: "image" },
        { id: "sigEmployee", label: "ลายเซ็นลูกจ้าง", type: "image" },
        { id: "sigW1", label: "ลายเซ็นพยานคนที่ 1", type: "image" },
        { id: "sigW2", label: "ลายเซ็นพยานคนที่ 2", type: "image" },
        { id: "stampImg", label: "ตราประทับบริษัท", type: "image" },
      ],
    },
  ],
  placements: (d) => {
    const L = CONTRACT_LAYOUT[d.nat] || CONTRACT_LAYOUT.mm;
    const th = { size: 11 };
    const en = { size: 9 };
    const P = (p, pos, v, o) => T(p, pos[0], pos[1], pos[2], v, o);
    const a = L.p1th, b = L.p1en, c = L.p2th, e = L.p2en;
    const out = [
      // page 1 — Thai
      P(1, a.made, (d) => thaiDate(d.madeDate), th),
      P(1, a.prov, "provinceTh", th),
      P(1, a.emp1, "employerName", th),
      P(1, a.emp2, "employerName2", th),
      P(1, a.addr1, "addrTh1", th),
      P(1, a.addr2, "addrTh2", th),
      P(1, a.employee, "employeeName", th),
      P(1, a.eaddr1, "empAddrTh1", th),
      P(1, a.eaddr2, "empAddrTh2", th),
      P(1, a.pos, "positionTh", th),
      P(1, a.wage, "wageTh", th),
      P(1, a.pay, "payDayTh", th),
      P(1, a.dur, "durationTh", th),
      P(1, a.wp1, (d) => d.wpTh1 || d.addrTh1, th),
      P(1, a.wp2, (d) => (d.wpTh1 ? d.wpTh2 : d.addrTh2), th),
      // page 1 — English
      P(1, b.made, (d) => enDate(d.madeDate), en),
      P(1, b.prov, "provinceEn", en),
      P(1, b.emp1, "employerNameEn", en),
      P(1, b.emp2, "employerNameEn2", en),
      P(1, b.addr1, "addrEn1", en),
      P(1, b.addr2, "addrEn2", en),
      P(1, b.employee, "employeeName", en),
      P(1, b.eaddr1, "empAddrEn1", en),
      P(1, b.eaddr2, "empAddrEn2", en),
      P(1, b.pos, "positionEn", en),
      P(1, b.wage, "wageEn", en),
      P(1, b.pay, "payDayEn", en),
      P(1, b.dur, "durationEn", en),
      P(1, b.wp, (d) => d.wpEn || join(d.addrEn1, d.addrEn2), en),
      // page 2
      P(2, c.hours, "hours", { ...th, align: "center" }),
      P(2, c.days, "days", { ...th, align: "center" }),
      P(2, c.weekly, "weeklyOff", { ...th, align: "center" }),
      P(2, c.trad, "tradHolidays", { ...th, align: "center" }),
      P(2, c.annual, "annualLeave", { ...th, align: "center" }),
      P(2, c.ot, "otTh", th),
      P(2, c.hol, "holTh", th),
      P(2, e.hours, "hours", { ...en, align: "center" }),
      P(2, e.days, "days", { ...en, align: "center" }),
      P(2, e.weekly, "weeklyOff", { ...en, align: "center" }),
      P(2, e.trad, "tradHolidays", { ...en, align: "center" }),
      P(2, e.annual, "annualLeave", { ...en, align: "center" }),
      P(2, e.ot, "otEn", en),
      P(2, e.hol, "holEn", en),
    ];
    // third-language column (Khmer / Lao / Myanmar) — English text in those blanks too
    const x1 = L.p1x, x2 = L.p2x;
    const X = (p, pos, v, o) => pos && out.push(T(p, pos[0], pos[1], pos[2], v, o));
    X(1, x1.made, (d) => enDate(d.madeDate), en);
    X(1, x1.prov, "provinceEn", en);
    X(1, x1.emp1, "employerNameEn", en);
    X(1, x1.emp2, "employerNameEn2", en);
    X(1, x1.addr1, "addrEn1", en);
    X(1, x1.addr2, "addrEn2", en);
    X(1, x1.employee, "employeeName", en);
    X(1, x1.eaddr1, "empAddrEn1", en);
    X(1, x1.eaddr2, "empAddrEn2", en);
    X(1, x1.pos, "positionEn", en);
    X(1, x1.wage, "wageEn", en);
    X(1, x1.pay, "payDayEn", en);
    X(1, x1.dur, "durationEn", en);
    if (x1.wp2) {
      X(1, x1.wp1, (d) => d.wpEn || d.addrEn1, en);
      X(1, x1.wp2, (d) => (d.wpEn ? "" : d.addrEn2), en);
    } else X(1, x1.wp1, (d) => d.wpEn || join(d.addrEn1, d.addrEn2), en);
    X(2, x2.hours, "hours", { ...en, align: "center" });
    X(2, x2.days, "days", { ...en, align: "center" });
    X(2, x2.weekly, "weeklyOff", { ...en, align: "center" });
    X(2, x2.trad, "tradHolidays", { ...en, align: "center" });
    X(2, x2.annual, "annualLeave", { ...en, align: "center" });
    X(2, x2.ot, "otEn", en);
    X(2, x2.hol, "holEn", en);
    // page 5 — signatures
    const thNames = ["signerTh", "employeeName", "witness1Th", "witness2Th"];
    const enNames = ["signerEn", "employeeName", "witness1En", "witness2En"];
    const sigs = ["sigEmployer", "sigEmployee", "sigW1", "sigW2"];
    for (let i = 0; i < 4; i++) {
      const [tx1, tx2, ty] = L.p5th.sign[i];
      const [ex1, ex2, ey] = L.p5en.sign[i];
      out.push(IMG(5, tx1, tx2, ty - 2, 28, sigs[i]));
      out.push(IMG(5, ex1, ex2, ey - 2, 24, sigs[i]));
      out.push(TC(5, L.p5th.name[i][0], 150, L.p5th.name[i][1], thNames[i], th));
      out.push(TC(5, L.p5en.name[i][0], 150, L.p5en.name[i][1], enNames[i], en));
      const [kx1, kx2, ky] = L.p5x.sign[i];
      out.push(IMG(5, kx1, kx2, ky - 2, 22, sigs[i]));
      out.push(TC(5, L.p5x.name[i][0], 150, L.p5x.name[i][1], enNames[i], en));
    }
    const [sx1, sx2, sy] = L.p5th.sign[0];
    out.push(IMG(5, sx2 - 45, sx2 + 25, sy + 18, 62, "stampImg"));
    return out;
  },
};

// =====================================================================
// บต.44
// =====================================================================
const addrFields = (prefix, withEmail) => [
  { id: prefix + "No", label: "เลขที่", w: "third" },
  { id: prefix + "Moo", label: "หมู่ที่/อาคาร", w: "third" },
  { id: prefix + "Soi", label: "ซอย", w: "third" },
  { id: prefix + "Road", label: "ถนน", w: "third" },
  { id: prefix + "Sub", label: "ตำบล/แขวง", w: "third" },
  { id: prefix + "Dist", label: "อำเภอ/เขต", w: "third" },
  { id: prefix + "Prov", label: "จังหวัด", list: PROVINCES, w: "third" },
  { id: prefix + "Post", label: "รหัสไปรษณีย์", w: "third", inputmode: "numeric" },
  { id: prefix + "Phone", label: "โทรศัพท์", w: "third", inputmode: "tel" },
  { id: prefix + "Fax", label: "โทรสาร", w: withEmail ? "third" : "full" },
  ...(withEmail ? [{ id: prefix + "Email", label: "อีเมล", w: "half", type: "email" }] : []),
];

const bt44 = {
  id: "bt44",
  code: "บต.44",
  title: "คำขอเปลี่ยนรายการในใบอนุญาตทำงาน",
  desc: "แจ้งเปลี่ยนหรือแก้ไขรายการในใบอนุญาตทำงาน ระบุข้อมูลคนต่างด้าว นายจ้าง สถานที่ทำงาน และรายการที่ขอเปลี่ยน",
  pages: 3,
  file: "บต44.pdf",
  size: 10,
  textDy: -1.5,
  sections: [
    {
      title: "1. ข้อมูลคนต่างด้าว",
      fields: [
        { id: "alienName", label: "ชื่อผู้ยื่นคำขอ (นาย/นาง/นางสาว)", req: true, w: "full" },
        { id: "alienId", label: "หมายเลขประจำตัวคนต่างด้าว", inputmode: "numeric" },
        { id: "nationality", label: "สัญชาติ", req: true, list: NATIONALITIES },
        { id: "alienType", label: "ประเภทของคนต่างด้าว", list: ALIEN_GROUPS },
        { id: "wpNo", label: "ใบอนุญาตทำงานเลขที่" },
        { id: "wpProv", label: "ออกให้ที่ (จังหวัด)", list: PROVINCES },
        { id: "wpIssue", label: "ออกให้วันที่", type: "date" },
        { id: "wpExpire", label: "ใช้ได้ถึงวันที่", type: "date" },
      ],
    },
    { title: "ที่อยู่ในประเทศไทยของคนต่างด้าว", fields: addrFields("a", true) },
    {
      title: "2.1 ข้อมูลนายจ้าง",
      fields: [{ id: "eName", label: "ชื่อนายจ้าง", req: true, w: "full" }, ...addrFields("e", false)],
    },
    {
      title: "2.2 สถานที่ทำงานของคนต่างด้าว",
      copy: {
        label: "ใช้ที่อยู่เดียวกับนายจ้าง",
        map: { wNo: "eNo", wMoo: "eMoo", wSoi: "eSoi", wRoad: "eRoad", wSub: "eSub", wDist: "eDist", wProv: "eProv", wPost: "ePost", wPhone: "ePhone", wFax: "eFax" },
      },
      fields: addrFields("w", false),
    },
    {
      title: "3. รายการที่ขอเปลี่ยน",
      fields: [
        { id: "changeFrom", label: "เปลี่ยนหรือแก้ไข (จาก)", req: true, w: "full" },
        { id: "changeTo", label: "เป็น", req: true, w: "full" },
        { id: "reason", label: "เนื่องจาก", req: true, type: "textarea", w: "full", hint: "พิมพ์ได้ยาวสูงสุด 4 บรรทัดบนแบบฟอร์ม" },
      ],
    },
    {
      title: "4. เอกสารที่แนบ",
      fields: [
        { id: "doc1", label: "สำเนาเอกสารสำคัญประจำตัวของคนต่างด้าว", type: "checkbox", def: true, w: "full" },
        { id: "doc2", label: "สำเนาเอกสารหรือหลักฐานที่แสดงว่ามีการเปลี่ยนรายการจริง", type: "checkbox", def: true, w: "full" },
        { id: "doc3", label: "ใบอนุญาตทำงาน", type: "checkbox", def: true, w: "full" },
      ],
    },
    {
      title: "ผู้ยื่นคำขอ",
      fields: [
        { id: "signDate", label: "วันที่ยื่น", type: "date", def: todayISO },
        { id: "sigImg", label: "รูปลายเซ็นผู้ยื่นคำขอ (ไม่บังคับ)", type: "image" },
      ],
    },
  ],
  placements: (d) => [
    T(1, 452, 566, 198, "alienId", { size: 9 }),
    T(1, 226, 551, 280.5, "alienName"),
    T(1, 94, 282, 308.6, "nationality"),
    T(1, 372, 555, 308.6, "alienType"),
    T(1, 155, 315, 342.5, "wpNo"),
    T(1, 392, 556, 342.5, "wpProv"),
    T(1, 108, 295, 370.7, (d) => thaiDate(d.wpIssue)),
    T(1, 346, 556, 370.7, (d) => thaiDate(d.wpExpire)),
    T(1, 160, 225, 404.5, "aNo"),
    T(1, 282, 409, 404.5, "aMoo"),
    T(1, 425, 557, 404.5, "aSoi"),
    T(1, 84, 210, 432.6, "aRoad"),
    T(1, 260, 380, 432.6, "aSub"),
    T(1, 436, 558, 432.6, "aDist"),
    T(1, 92, 210, 460.7, "aProv"),
    T(1, 274, 356, 460.7, "aPost"),
    T(1, 400, 555, 460.7, "aPhone"),
    T(1, 96, 238, 485.4, "aFax"),
    T(1, 332, 557, 485.4, "aEmail"),
    T(1, 106, 560, 565.9, "eName"),
    T(1, 105, 174, 593.3, "eNo"),
    T(1, 223, 352, 593.3, "eMoo"),
    T(1, 373, 560, 593.3, "eSoi"),
    T(1, 83, 190, 620.8, "eRoad"),
    T(1, 239, 366, 620.8, "eSub"),
    T(1, 412, 560, 620.8, "eDist"),
    T(1, 91, 191, 647.8, "eProv"),
    T(1, 243, 283, 647.8, "ePost"),
    T(1, 318, 420, 647.8, "ePhone"),
    T(1, 451, 560, 647.8, "eFax"),
    T(1, 195, 241, 681, "wNo"),
    T(1, 290, 410, 681, "wMoo"),
    T(1, 429, 560, 681, "wSoi"),
    T(1, 83, 193, 708.5, "wRoad"),
    T(1, 242, 367, 708.5, "wSub"),
    T(1, 412, 560, 708.5, "wDist"),
    T(1, 91, 194, 736.4, "wProv"),
    T(1, 245, 304, 736.4, "wPost"),
    T(1, 339, 437, 736.4, "wPhone"),
    T(1, 469, 560, 736.4, "wFax"),
    // page 2
    T(2, 112, 556, 113.2, "changeFrom"),
    T(2, 66, 556, 142.6, "changeTo"),
    F(2, [[47, 204.3, 510], [47, 226.2, 510], [47, 248, 510], [47, 269.8, 510]], "reason"),
    C(2, 89, 375.8, "doc1"),
    C(2, 89, 409.6, "doc2"),
    C(2, 89, 445, "doc3"),
    IMG(2, 300, 465, 548, 32, "sigImg"),
    T(2, 280, 473, 586.2, (d) => thaiDate(d.signDate), { align: "center" }),
  ],
};

export const DOCS = { bt44, bt46, contract, exit };
export const DOC_ORDER = ["bt46", "contract", "exit", "bt44"];
