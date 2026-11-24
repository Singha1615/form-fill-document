// Thai -> English using Google Translate's public web endpoint.
// Only the texts passed in are sent; the request goes straight from the
// visitor's browser to Google.

const ENDPOINT = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=th&tl=en&dt=t";

/**
 * Translate several single-line Thai texts in one request.
 * @param {string[]} texts
 * @returns {Promise<string[]>} English texts, same order
 */
export async function translateThToEn(texts) {
  const clean = texts.map((t) => String(t || "").replace(/\s*\n\s*/g, " ").trim());
  const res = await fetch(ENDPOINT, {
    method: "POST",
    body: new URLSearchParams({ q: clean.join("\n") }),
  });
  if (!res.ok) throw new Error("บริการแปลตอบกลับผิดพลาด (" + res.status + ")");
  const json = await res.json();
  const joined = (json[0] || []).map((part) => part[0] || "").join("");
  const lines = joined.split("\n").map((l) => l.trim());
  if (lines.length !== clean.length) {
    // fall back to one request per text if Google merged lines
    return Promise.all(clean.map(async (t) => (t ? (await translateThToEn([t]))[0] : "")));
  }
  return lines;
}
