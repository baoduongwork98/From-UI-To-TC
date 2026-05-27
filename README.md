# Testing Kit

Automated test documentation generator from live web UIs — **no manual writing needed**.

Just provide the module URL, and the AI will automatically:
1. Inspect DOM → generate Requirements
2. Analyze risk → generate Test Cases (RBT)
3. Export a complete Excel file

---

## Quick Start

**Step 1** — Fill in config in `TASK.md`:

```
PROJECT_NAME=BDP
MODULE_CODE=DATA_DEF
MODULE_NAME=Create New Data Definition
URL=https://your-app.com/module
OUTPUT_FOLDER=output_sonet
```

**Step 2** — Run the workflow in Claude Code:

```
/generate_module_testcases_full
```

**Output** in `OUTPUT_FOLDER/`:
- `requirements_{module}.md` — functional specs, field list, conditional UI
- `testcases_{module}.md` — 7-column test case table
- `testcases_{module}.xlsx` — ready-to-use Excel file

---

## Sample Output

See real results at:
- [output_sonet/](output_sonet/) — BDP Create New Data Definition module (~40 TCs)
- [output_claude_workflow/](output_claude_workflow/) — BDP Data Definition module

---

## Detailed Workflow

The workflow runs in 4 steps:

### Step 1 — Collect Requirements from UI
- Navigate to URL, resize viewport to 1920×1080
- Inspect DOM for each section/tab of the form
- Explore **Conditional UI** — interact with all values of each trigger field (checkbox, dropdown, radio) to discover hidden fields
- Record exact validation messages from DOM

### Step 2 — Generate Test Cases
Classified by risk:
- **High** — required field validation, happy path, successful/failed submit
- **Medium** — conditional UI, dropdown options, boundary values
- **Low** — edge cases, optional fields

Standard output table format (7 columns):

| Test case ID | Item Test Main | Item Test Sub | Description | Pre-conditions | Step | Expected Results |
|---|---|---|---|---|---|---|
| TC - 1 | Định nghĩa dữ liệu | Thêm | Kiểm tra tính bắt buộc của trường [Mã] | 1. Đang ở form [Thêm mới] | 1. Để trống trường [Mã]`<br>`2. Nhấn [Lưu mới] | 2. Hiển thị lỗi: "Mã phải là bắt buộc" |

### Step 3 — Export Excel

```bash
node scripts/convert_excel/md_to_xlsx.js output_sonet/testcases_module.md output_sonet/testcases_module.xlsx
```

### Step 4 — Review (Optional)
Checklist: TC ID, table format, coverage, step quality.

---

## Project Structure

```
├── .agent/
│   ├── workflows/generate_module_testcases_full.md   # Workflow logic
│   └── skills/
│       ├── requirements_analyzer/   # Analyze requirements from UI
│       ├── rbt_manual_testing/      # Generate test cases using RBT
│       └── ui_debug_agent/          # Inspect DOM, read locators
├── scripts/convert_excel/           # md_to_xlsx.js — export Excel
├── TASK.md                          # Input config (edit before running)
├── TASK.template.md                 # Template TASK.md for new modules
└── Tc_sample.xlsx                   # Sample Excel reference file
```

---

## Requirements

- [Claude Code](https://claude.ai/code) with MCP Playwright
- Node.js (for Excel export script)

```bash
cd scripts/convert_excel && npm install
```

---

## Demo Apps (Practice)

| App | URL | Login |
|---|---|---|
| CRM (Perfex) | https://crm.anhtester.com | admin@example.com / 123456 |
| Ecommerce | https://ecommerce.anhtester.com | admin@example.com / 123456 |
