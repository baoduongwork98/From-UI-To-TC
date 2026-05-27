# CLAUDE.md — Testing Kit

> Communication, explanations, reports: **Vietnamese**. Code & commit messages: **English**.

---

## Security (READ FIRST — HIGHEST PRIORITY)

- **NEVER** read the `.env` file with any tool (`Read`, `Bash cat`, `grep`, …) to extract credentials.
- Real credentials only exist in `.env` — never expose via logs, chat, or artifacts.
- `.env.example` is safe to read (contains no real credentials).
- Before running destructive commands (`rm -rf`, `git reset --hard`, `git push --force`): **ask user for confirmation**.

---

## Project Structure

```
antigravity-testing-kit/
├── .agent/
│   ├── skills/
│   │   ├── requirements_analyzer/   # Analyze requirements from websites/documents
│   │   ├── rbt_manual_testing/      # Generate manual test cases (QUICK / FULL RBT)
│   │   └── ui_debug_agent/          # Inspect DOM, collect real locators
│   └── workflows/
│       └── generate_module_testcases_full.md   # Main workflow
├── scripts/
│   └── convert_excel/               # Markdown → Excel (node md_to_xlsx.js)
├── output_sonet/                    # Sample output from Claude Sonnet
├── output_claude/                   # Sample output from Claude
├── output_claude_workflow/          # Sample output from workflow
├── TASK.md                          # Input config for workflow
├── TASK.template.md                 # Template for TASK.md
└── Tc_sample.xlsx                   # Sample Excel reference file
```

---

## Main Workflow

| Command | Description |
|---|---|
| `/generate_module_testcases_full` | End-to-end from URL → Requirements → Test Cases → Excel (reads TASK.md) |

---

## Browser & UI Debug

- Required viewport: **1920×1080** for all UI debug sessions
- Required debug order:
  ```
  navigate → resize(1920×1080) → wait_for_load → snapshot → interact → screenshot(on failure)
  ```
- **NEVER guess locators** — inspect real DOM before writing code

### Locator Priority Order

```
getByRole / getByLabel / getByPlaceholder
  → getByText / getByTestId
    → data-testid / id / name
      → CSS Selector
        → XPath (last resort)
```

---

## Tools

### Markdown → Excel

```bash
node scripts/convert_excel/md_to_xlsx.js <input.md> [output.xlsx]
```

### Demo Apps (Practice)

| App | URL | Login |
|---|---|---|
| CRM (Perfex) | https://crm.anhtester.com | admin@example.com / 123456 |
| Ecommerce | https://ecommerce.anhtester.com | admin@example.com / 123456 |

---

## Anti-Patterns (FORBIDDEN)

| Forbidden | Correct Alternative |
|---|---|
| Reading `.env` to get credentials | Use environment variables, ask user |
| Guessing locators without inspecting DOM | Inspect real DOM before writing code |
| Running destructive commands without asking | Always ask user for confirmation first |
