# TASK.md — Template for new module

> Copy this file as `TASK.md`, fill in the config, then run `/generate_module_testcases_full`

---

## Configuration

```
PROJECT_NAME=BDP
MODULE_CODE=PROMOTION
MODULE_NAME=Chương trình tích luỹ
URL=https://bdp-mini-app-admin.zminiapp.me/promotions
OUTPUT_FOLDER=output/promotions
```

---

## Steps

### Step 1: Generate Requirements from UI
- [ ] Navigate to URL, inspect real DOM
- [ ] Record all fields, validations, conditional UI
- [ ] Save: `{OUTPUT_FOLDER}/requirements_{module_slug}.md`

### Step 2: Generate Test Cases (RBT)
- [ ] Read generated requirements
- [ ] Generate TCs classified as High/Medium/Low risk
- [ ] TC ID format: `{PROJECT_NAME}_{MODULE_CODE}_TC_001`
- [ ] Save: `{OUTPUT_FOLDER}/testcases_{module_slug}.md`

### Step 3: Export Excel
- [ ] Run: `node scripts/convert_excel/md_to_xlsx.js {input.md} {output.xlsx}`
- [ ] Verify TC count in log output

### Step 4: Review (Optional)
- [ ] TC ID correct format, no duplicates
- [ ] Coverage for all required fields
- [ ] Specific test data, no placeholders

---

## Used Examples

| Field | Example |
|---|---|
| PROJECT_NAME | BDP |
| MODULE_CODE | DATA_DEF |
| MODULE_NAME | Create New Data Definition |
| URL | https://bdp-data-gate-admin.zminiapp.me/data/masters |
| OUTPUT_FOLDER | output_sonet |
| TC ID sample | BDP_DATA_DEF_TC_001 |
| TC count | 40 |
