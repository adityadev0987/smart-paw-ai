import fs from "node:fs/promises";
import path from "node:path";

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 48;
const NAVY = "0.07 0.15 0.25";
const MUTED = "0.35 0.40 0.47";
const ORANGE = "0.92 0.36 0.10";

function cleanPdfText(value) {
  return String(value ?? "—")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^\x20-\x7E]/g, "?")
    .replace(/[\\()]/g, "\\$&");
}

function wrapText(value, maxChars = 86) {
  const words = String(value || "—").split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    if (word.length > maxChars) {
      if (line) lines.push(line), (line = "");
      for (let offset = 0; offset < word.length; offset += maxChars) lines.push(word.slice(offset, offset + maxChars));
      continue;
    }
    if (line && `${line} ${word}`.length > maxChars) lines.push(line), (line = word);
    else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines.length ? lines : ["—"];
}

function makePage() {
  return { operations: [], y: 0 };
}

function rect(page, x, top, width, height, color) {
  page.operations.push(`${color} rg ${x} ${PAGE_HEIGHT - top - height} ${width} ${height} re f`);
}

function line(page, x1, top1, x2, top2, color = "0.87 0.89 0.92", width = 0.7) {
  page.operations.push(`${color} RG ${width} w ${x1} ${PAGE_HEIGHT - top1} m ${x2} ${PAGE_HEIGHT - top2} l S`);
}

function text(page, value, x, top, size = 10, font = "F1", color = NAVY) {
  page.operations.push(`BT /${font} ${size} Tf ${color} rg 1 0 0 1 ${x} ${PAGE_HEIGHT - top - size} Tm (${cleanPdfText(value)}) Tj ET`);
}

function makePdfBuffer(pages) {
  const objects = [];
  const catalogId = 1;
  const pagesId = 2;
  const regularFontId = 3;
  const boldFontId = 4;
  objects[catalogId] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[regularFontId] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
  objects[boldFontId] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";

  const pageObjectIds = pages.map((_, index) => 5 + index * 2);
  objects[pagesId] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`;
  pages.forEach((page, index) => {
    const pageId = pageObjectIds[index];
    const contentId = pageId + 1;
    text(page, `Page ${index + 1} of ${pages.length}`, PAGE_WIDTH - 108, 818, 8, "F1", MUTED);
    const stream = page.operations.join("\n");
    const streamLength = Buffer.byteLength(stream, "latin1");
    objects[pageId] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${regularFontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${contentId} 0 R >>`;
    objects[contentId] = `<< /Length ${streamLength} >>\nstream\n${stream}\nendstream`;
  });

  let output = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets = [0];
  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = Buffer.byteLength(output, "latin1");
    output += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(output, "latin1");
  output += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id += 1) output += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  output += `trailer\n<< /Size ${objects.length} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(output, "latin1");
}

export async function createConsultationReportPdf(report, relativeStoragePath) {
  const outputPath = path.resolve(process.cwd(), "uploads", relativeStoragePath);
  const pages = [];
  let page = null;

  const startPage = () => {
    page = makePage();
    pages.push(page);
    rect(page, 0, 0, PAGE_WIDTH, 104, NAVY);
    rect(page, 0, 102, PAGE_WIDTH, 4, ORANGE);
    text(page, report.clinicName || "Smart Paw AI Veterinary Center", MARGIN, 26, 17, "F2", "1 1 1");
    text(page, "VETERINARY CONSULTATION REPORT", MARGIN, 57, 10, "F2", "0.90 0.93 0.97");
    text(page, `Report ${report.consultationId || ""}`, PAGE_WIDTH - 230, 76, 8, "F1", "0.90 0.93 0.97");
    page.y = 128;
  };
  const ensureSpace = (height) => {
    if (!page) startPage();
    if (page.y + height > 790) startPage();
  };
  const addSection = (heading) => {
    ensureSpace(40);
    text(page, heading.toUpperCase(), MARGIN, page.y, 10, "F2", ORANGE);
    line(page, MARGIN, page.y + 18, PAGE_WIDTH - MARGIN, page.y + 18);
    page.y += 27;
  };
  const addField = (label, value) => {
    const rows = wrapText(value, 90);
    const height = 16 + rows.length * 13;
    ensureSpace(height + 9);
    text(page, label, MARGIN, page.y, 8, "F2", MUTED);
    page.y += 12;
    for (const row of rows) {
      text(page, row, MARGIN, page.y, 9.5, "F1", NAVY);
      page.y += 13;
    }
    page.y += 7;
  };

  startPage();
  text(page, "PATIENT & APPOINTMENT", MARGIN, page.y, 10, "F2", ORANGE);
  page.y += 20;
  addField("Pet", `${report.petName} · ${report.species}${report.breed ? ` · ${report.breed}` : ""}`);
  addField("Age / Gender", `${report.age || "Not recorded"} · ${report.gender || "Not recorded"}`);
  addField("Owner", report.ownerName);
  addField("Doctor", `${report.doctorName}${report.doctorRegistrationNumber ? ` · Registration ${report.doctorRegistrationNumber}` : ""}`);
  addField("Consultation date and time", `${report.consultationDateLabel || "Not recorded"} · ${report.consultationTime || "Time not recorded"}`);
  addField("Chief complaint", report.chiefComplaint);

  for (const [heading, fields] of [
    ["Clinical assessment", [["Symptoms / history", report.symptomsDiscussed], ["Clinical observations", report.observations], ["Diagnosis / assessment", report.diagnosis], ["Consultation summary", report.summary]]],
    ["Treatment plan", [["Treatment", report.treatment], ["Medication", report.medicines], ["Dosage", report.dosageInstructions], ["Frequency", report.frequency], ["Duration", report.medicationDuration]]],
    ["Care & follow-up", [["Additional instructions / home care", report.homeCare], ["Diet / hydration advice", report.dietHydration], ["Follow-up recommendation", report.followUp], ["Warning / emergency instructions", report.emergencyInstructions], ["Final remarks", report.finalRemarks], ["Additional notes", report.additionalNotes]]],
  ]) {
    addSection(heading);
    for (const [label, value] of fields) if (String(value || "").trim()) addField(label, value);
  }
  addSection("Report confirmation");
  addField("Doctor", report.doctorName);
  addField("Report generated", report.reportGeneratedLabel || new Date().toLocaleString());
  addField("Consultation ID", report.consultationId);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, makePdfBuffer(pages));
  return outputPath;
}
