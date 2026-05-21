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

// ── Build Excel (new 7-col format) ────────────────────────────────────────

function buildXlsxNew(tables, outputPath) {
  // 2-row header
  const headerRow1 = ["Test case ID", "Item Test", "", "Description", "Pre-conditions", "Step", "Expected Results"];
  const headerRow2 = ["", "Main", "Sub", "", "", "", ""];

  // Col widths (characters): A, B, C, D, E, F, G
  const colWidths = [15, 22, 14, 48, 38, 58, 58];

  // Collect all rows (7 cols each)
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

  const wsData = [headerRow1, headerRow2, ...allRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // ── Header merges ──────────────────────────────────────────────────────
  const merges = [
    { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, // A1:A2 — Test case ID
    { s: { r: 0, c: 1 }, e: { r: 0, c: 2 } }, // B1:C1 — Item Test
    { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } }, // D1:D2 — Description
    { s: { r: 0, c: 4 }, e: { r: 1, c: 4 } }, // E1:E2 — Pre-conditions
    { s: { r: 0, c: 5 }, e: { r: 1, c: 5 } }, // F1:F2 — Step
    { s: { r: 0, c: 6 }, e: { r: 1, c: 6 } }, // G1:G2 — Expected Results
  ];

  // ── Data merges (row index 2 = first data row) ─────────────────────────
  const dataStartRow = 2;
  for (const colIdx of [1, 2, 3]) {
    const ranges = findMergeRanges(allRows, dataStartRow, colIdx);
    merges.push(...ranges);
  }

  ws["!merges"] = merges;
  ws["!cols"] = colWidths.map((w) => ({ wch: w }));

  // Freeze first 2 header rows
  ws["!freeze"] = { xSplit: 0, ySplit: 2, topLeftCell: "A3", state: "frozen" };

  // AutoFilter on data start row
  ws["!autofilter"] = { ref: `A2:G${allRows.length + 2}` };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Test Cases");
  XLSX.writeFile(wb, outputPath);

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

function main() {
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
    count = buildXlsxNew(tables, outputPath);
  } else {
    count = buildXlsxLegacy(tables, outputPath);
  }

  console.log(`✅ Đã xuất ${count} test cases → ${outputPath}`);
}

main();
