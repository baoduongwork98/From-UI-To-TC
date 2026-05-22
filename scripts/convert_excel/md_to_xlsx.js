/**
 * Script: md_to_xlsx.js
 * Mô tả:  Convert file Markdown Test Cases sang Excel (.xlsx) theo format chuẩn Tc_sample.
 *         - 7 cột: Test case ID | Item Test (Main+Sub) | Description | Pre-conditions | Step | Expected Results
 *         - 2-row header với sub-header Main/Sub cho cột Item Test
 *         - Tự động merge ô: Main, Sub (giống nhau liên tiếp), Description (ô trống kế tiếp)
 * Cách dùng:
 *   node scripts/convert_excel/md_to_xlsx.js <input.md> [output.xlsx]
 */

const fs = require("fs");
const path = require("path");

let XLSX;
try {
  XLSX = require("xlsx");
} catch {
  console.error("❌ Thiếu thư viện xlsx. Cài đặt bằng lệnh:");
  console.error("   npm install xlsx");
  process.exit(1);
}

let ExcelJS;
try {
  ExcelJS = require("exceljs");
} catch {
  console.error("❌ Thiếu thư viện exceljs. Cài đặt bằng lệnh:");
  console.error("   npm install exceljs");
  process.exit(1);
}

// ── Helpers ────────────────────────────────────────────────────────────────

function stripEmoji(text) {
  return text.replace(/[\u{1F534}\u{1F7E1}\u{1F7E2}✅❌\u{1F525}]/gu, "").trim();
}

/** Convert <br> → newline, strip backticks & emoji */
function cleanCell(text) {
  let out = text.replace(/<br\s*\/?>/gi, "\n");
  out = out.replace(/`([^`]*)`/g, "$1");
  return stripEmoji(out).trim();
}

// ── Parse Markdown tables ──────────────────────────────────────────────────

/**
 * Detect table format from header line.
 * Returns "new" for 7-col format (Test case ID), "legacy" for 9-col format (TC ID).
 */
function detectTableFormat(headerLine) {
  if (headerLine.includes("Test case ID")) return "new";
  if (headerLine.includes("TC ID")) return "legacy";
  return null;
}

function parseMdTables(filepath) {
  const content = fs.readFileSync(filepath, "utf-8");
  const lines = content.split("\n");

  const tables = [];
  let currentTable = null;
  let currentFormat = null;
  let headerFound = false;

  for (const line of lines) {
    const stripped = line.trim();

    // Detect header row
    if (stripped.startsWith("|")) {
      const fmt = detectTableFormat(stripped);
      if (fmt) {
        headerFound = true;
        currentFormat = fmt;
        currentTable = [];
        continue;
      }
    }

    // Skip separator row
    if (headerFound && /^\|[\s\-|]+\|$/.test(stripped)) {
      headerFound = false;
      continue;
    }

    // Data rows
    if (currentTable !== null && stripped.startsWith("|")) {
      const cells = stripped
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());
      if (cells.length > 0) {
        currentTable.push(cells);
      }
    } else if (currentTable !== null && !stripped.startsWith("|")) {
      if (currentTable.length > 0) {
        tables.push({ rows: currentTable, format: currentFormat });
      }
      currentTable = null;
      currentFormat = null;
    }
  }

  if (currentTable && currentTable.length > 0) {
    tables.push({ rows: currentTable, format: currentFormat });
  }

  return tables;
}

// ── Merge logic ────────────────────────────────────────────────────────────

/**
 * Find merge ranges for a column in data rows.
 * Applies to Main (col 1), Sub (col 2), Description (col 3).
 * Rule: empty cell = continuation of the previous non-empty group → merge all into one.
 */
function findMergeRanges(rows, dataStartRow, colIdx) {
  const ranges = [];
  let groupStart = -1;

  for (let i = 0; i < rows.length; i++) {
    const val = rows[i][colIdx] || "";
    if (val !== "") {
      // Start of a new group
      groupStart = i;
    } else if (groupStart >= 0) {
      // Empty = continuation — scan to end of this empty run
      let j = i;
      while (j < rows.length && (rows[j][colIdx] || "") === "") {
        j++;
      }
      // Merge from groupStart to j-1
      if (j - 1 > groupStart) {
        ranges.push({
          s: { r: dataStartRow + groupStart, c: colIdx },
          e: { r: dataStartRow + j - 1, c: colIdx },
        });
      }
      i = j - 1;
      groupStart = j < rows.length ? j : -1;
    }
  }

  return ranges;
}

// ── Style helpers ─────────────────────────────────────────────────────────

const THIN_BORDER = { style: "thin", color: { argb: "FF000000" } };
const BORDER_ALL = {
  top: THIN_BORDER,
  left: THIN_BORDER,
  bottom: THIN_BORDER,
  right: THIN_BORDER,
};

function applyHeaderStyle(cell) {
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9D9D9" } };
  cell.font = { bold: true, color: { argb: "FF000000" } };
  cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  cell.border = BORDER_ALL;
}

function applyDataStyle(cell) {
  cell.alignment = { vertical: "top", wrapText: true };
  cell.border = BORDER_ALL;
}

// ── Build Excel (new 7-col format) ────────────────────────────────────────

async function buildXlsxNew(tables, outputPath) {
  // Collect all data rows (7 cols each)
  const allRows = [];
  for (const table of tables) {
    for (const row of table.rows) {
      const cleaned = [];
      for (let i = 0; i < 7; i++) {
        cleaned.push(cleanCell(row[i] || ""));
      }
      allRows.push(cleaned);
    }
  }

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Test Cases");

  // Col widths: A, B, C, D, E, F, G
  ws.columns = [
    { width: 15 },
    { width: 22 },
    { width: 14 },
    { width: 48 },
    { width: 38 },
    { width: 58 },
    { width: 58 },
  ];

  // ── Header row 1 ──────────────────────────────────────────────────────
  const row1 = ws.addRow(["Test case ID", "Item Test", "", "Description", "Pre-conditions", "Step", "Expected Results"]);
  row1.height = 30;
  for (let c = 1; c <= 7; c++) applyHeaderStyle(row1.getCell(c));

  // ── Header row 2 ──────────────────────────────────────────────────────
  const row2 = ws.addRow(["", "Main", "Sub", "", "", "", ""]);
  row2.height = 22;
  for (let c = 1; c <= 7; c++) applyHeaderStyle(row2.getCell(c));

  // ── Header merges ─────────────────────────────────────────────────────
  ws.mergeCells("A1:A2"); // Test case ID
  ws.mergeCells("B1:C1"); // Item Test
  ws.mergeCells("D1:D2"); // Description
  ws.mergeCells("E1:E2"); // Pre-conditions
  ws.mergeCells("F1:F2"); // Step
  ws.mergeCells("G1:G2"); // Expected Results

  // ── Data rows ─────────────────────────────────────────────────────────
  const DATA_START_EXCEL_ROW = 3; // rows 1-2 are headers
  for (const rowData of allRows) {
    const row = ws.addRow(rowData);
    for (let c = 1; c <= 7; c++) applyDataStyle(row.getCell(c));
  }

  // ── Data merges for cols B(1), C(2), D(3) — 0-indexed ────────────────
  // findMergeRanges returns 0-indexed absolute row positions
  for (const colIdx of [1, 2, 3]) {
    const ranges = findMergeRanges(allRows, DATA_START_EXCEL_ROW - 1, colIdx);
    for (const range of ranges) {
      const startRow = range.s.r + 1; // convert 0-indexed → 1-indexed Excel
      const endRow = range.e.r + 1;
      const col = String.fromCharCode(65 + range.s.c);
      ws.mergeCells(`${col}${startRow}:${col}${endRow}`);
    }
  }

  // ── Freeze top 2 rows ─────────────────────────────────────────────────
  ws.views = [{ state: "frozen", xSplit: 0, ySplit: 2 }];

  // ── Auto filter on row 2 ──────────────────────────────────────────────
  ws.autoFilter = { from: "A2", to: `G${allRows.length + 2}` };

  await wb.xlsx.writeFile(outputPath);
  return allRows.length;
}

// ── Build Excel (legacy 9-col format) ─────────────────────────────────────

function buildXlsxLegacy(tables, outputPath) {
  const headers = [
    "TC ID", "Module", "Risk Level", "Test Title",
    "Pre-Condition", "Test Steps", "Expected Result", "Priority", "Test Data",
  ];
  const colWidths = [22, 22, 14, 50, 35, 60, 60, 12, 40];

  const allRows = [];
  for (const table of tables) {
    for (const row of table.rows) {
      const cleaned = [];
      for (let i = 0; i < 9; i++) {
        cleaned.push(cleanCell(row[i] || ""));
      }
      allRows.push(cleaned);
    }
  }

  const wsData = [headers, ...allRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws["!cols"] = colWidths.map((w) => ({ wch: w }));
  ws["!freeze"] = { xSplit: 0, ySplit: 1, topLeftCell: "A2", state: "frozen" };
  ws["!autofilter"] = { ref: `A1:I${allRows.length + 1}` };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Test Cases");
  XLSX.writeFile(wb, outputPath);

  return allRows.length;
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log("Cách dùng: node scripts/convert_excel/md_to_xlsx.js <input.md> [output.xlsx]");
    process.exit(1);
  }

  const inputPath = path.resolve(args[0]);
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ File không tồn tại: ${inputPath}`);
    process.exit(1);
  }

  const outputPath = args[1]
    ? path.resolve(args[1])
    : inputPath.replace(/\.md$/i, ".xlsx");

  console.log(`📖 Đang đọc: ${inputPath}`);
  const tables = parseMdTables(inputPath);

  if (tables.length === 0) {
    console.error("❌ Không tìm thấy bảng Test Cases nào trong file markdown.");
    process.exit(1);
  }

  const totalRows = tables.reduce((sum, t) => sum + t.rows.length, 0);
  console.log(`📊 Tìm thấy ${tables.length} bảng, tổng ${totalRows} test cases`);

  // Determine format from first table
  const format = tables[0].format;
  console.log(`📋 Format: ${format === "new" ? "7-cột (Test case ID)" : "9-cột legacy (TC ID)"}`);

  let count;
  if (format === "new") {
    count = await buildXlsxNew(tables, outputPath);
  } else {
    count = buildXlsxLegacy(tables, outputPath);
  }

  console.log(`✅ Đã xuất ${count} test cases → ${outputPath}`);
}

main().catch((err) => {
  console.error("❌ Lỗi:", err.message);
  process.exit(1);
});
