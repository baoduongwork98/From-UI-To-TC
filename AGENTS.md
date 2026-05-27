# AGENTS.md — Testing Kit

> Communication, explanations, reports: **Vietnamese**. Code & commits: **English**.

---

## Security

- **NEVER** read `.env` with any tool (`Read`, `cat`, `grep`, …). Real credentials live only there.
- `.env.example` is safe to read.
- Ask user confirmation before destructive commands (`rm -rf`, `git reset --hard`, `git push --force`).

---

## What this repo does

Generates test documentation from live web UIs — no manual writing.
Given a module URL, the workflow inspects DOM → writes requirements → generates RBT test cases → exports Excel.

---

## Main workflow

```bash
# 1. Configure: copy TASK.template.md → TASK.md, fill in PROJECT_NAME, MODULE_CODE, URL, OUTPUT_FOLDER
# 2. Run the slash command:
/generate_module_testcases_full
```

Config keys in `TASK.md`:
```
PROJECT_NAME=<UPPERCASE project code, e.g. BDP>
MODULE_CODE=<UPPERCASE module code, e.g. DATA_DEF>
MODULE_NAME=<Vietnamese module name>
URL=<full module URL>
OUTPUT_FOLDER=<output directory name>
```

TC ID format: `{PROJECT_NAME}_{MODULE_CODE}_TC_001`

---

## Markdown → Excel

```bash
node scripts/convert_excel/md_to_xlsx.js <input.md> [output.xlsx]
```

Requires Node.js. One-time setup: `cd scripts/convert_excel && npm install`

---

## Browser / UI debugging

- Viewport: **1920×1080** mandatory for every session.
- Workflow order: `navigate → resize(1920×1080) → wait_for_load → snapshot → interact → screenshot (on failure)`
- **Never guess locators** — inspect real DOM first.

### Locator priority

```
getByRole / getByLabel / getByPlaceholder
  → getByText / getByTestId
    → data-testid / id / name
      → CSS Selector
        → XPath (last resort)
```

---

## Project structure

| Path | Purpose |
|---|---|
| `.agent/workflows/` | Workflow definitions (`generate_module_testcases_full.md`) |
| `.agent/skills/` | Agent skills: `requirements_analyzer`, `rbt_manual_testing`, `ui_debug_agent` |
| `.claude/commands/` | Slash commands (triggers workflows) |
| `scripts/convert_excel/` | `md_to_xlsx.js` — markdown table → `.xlsx` |
| `TASK.md` | Active config (edit before running) |
| `TASK.template.md` | Template for new modules |

---

## Demo apps (practice)

| App | URL | Login |
|---|---|---|
| CRM (Perfex) | https://crm.anhtester.com | admin@example.com / 123456 |
| Ecommerce | https://ecommerce.anhtester.com | admin@example.com / 123456 |

---

## Output format

Test case tables use 7 columns:

| Test case ID | Item Test Main | Item Test Sub | Description | Pre-conditions | Step | Expected Results |
|---|---|---|---|---|---|---|

Steps use `<br>` for line breaks within a cell (converted to newlines in Excel).
