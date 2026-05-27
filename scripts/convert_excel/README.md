# 📊 MD to XLSX Converter

Convert Markdown Test Cases to formatted Excel (`.xlsx`) files, ready to share.

## Requirements

- **Node.js** ≥ 16

## Installation

```bash
cd scripts/convert_excel
npm install
```

## Usage

```bash
# From project root
node scripts/convert_excel/md_to_xlsx.js <input.md> [output.xlsx]
```

### Examples

```bash
# Auto output in same directory, same name (with .xlsx extension)
node scripts/convert_excel/md_to_xlsx.js requirements/crm/test_cases_crm_login.md

# Specify output path
node scripts/convert_excel/md_to_xlsx.js requirements/crm/test_cases_crm_login.md output/crm_login.xlsx
```

## Input

Markdown file containing test case tables in the following format:

```markdown
| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data |
|-------|--------|-----------|------------|---------------|------------|-----------------|----------|-----------| 
| TC_001 | ... | 🔴 High | ... | ... | Step 1<br>Step 2 | ... | Critical | ... |
```

> **Note:** The script automatically detects all tables with a `TC ID` column in the file.

## Output

`.xlsx` file with the following features:

| Feature | Description |
|-----------|-------|
| **Column widths** | Auto-set appropriate width for each column |
| **Freeze panes** | Freeze header row when scrolling |
| **AutoFilter** | Auto-filter on header row |
| **Line breaks** | Test steps (`<br>`) converted to line breaks within cells |
| **Clean text** | Automatically removes emojis, markdown backticks |
