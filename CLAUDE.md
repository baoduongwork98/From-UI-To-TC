# CLAUDE.md — Testing Kit

> Giao tiếp, giải thích, báo cáo: **Tiếng Việt**. Code & commit message: **Tiếng Anh**.

---

## Bảo mật (ĐỌC TRƯỚC — ƯU TIÊN CAO NHẤT)

- **KHÔNG BAO GIỜ** đọc file `.env` bằng bất kỳ tool nào (`Read`, `Bash cat`, `grep`, …) để lấy credentials.
- Credentials thật chỉ tồn tại trong `.env` — không được expose qua log, chat, hay artifact.
- File `.env.example` được phép đọc (không chứa credentials thật).
- Trước khi chạy lệnh destructive (`rm -rf`, `git reset --hard`, `git push --force`): **hỏi user xác nhận**.

---

## Cấu Trúc Dự Án

```
antigravity-testing-kit/
├── .agent/
│   ├── skills/
│   │   ├── requirements_analyzer/   # Phân tích requirements từ website/tài liệu
│   │   ├── rbt_manual_testing/      # Sinh manual test cases (QUICK / FULL RBT)
│   │   └── ui_debug_agent/          # Inspect DOM, thu thập locators thực tế
│   └── workflows/
│       └── generate_module_testcases_full.md   # Workflow chính
├── scripts/
│   └── convert_excel/               # Markdown → Excel (node md_to_xlsx.js)
├── output_sonet/                    # Kết quả mẫu từ Claude Sonnet
├── output_claude/                   # Kết quả mẫu từ Claude
├── output_claude_workflow/          # Kết quả mẫu từ workflow
├── TASK.md                          # Input config cho workflow
├── TASK.template.md                 # Template TASK.md
└── Tc_sample.xlsx                   # File Excel mẫu tham khảo
```

---

## Workflow Chính

| Command | Mô tả |
|---|---|
| `/generate_module_testcases_full` | Đầu-cuối từ URL → Requirements → Test Cases → Excel (đọc TASK.md) |

---

## Browser & UI Debug

- Viewport bắt buộc: **1920×1080** cho mọi UI debug
- Thứ tự debug bắt buộc:
  ```
  navigate → resize(1920×1080) → wait_for_load → snapshot → interact → screenshot(khi fail)
  ```
- **KHÔNG đoán locator** — phải inspect DOM thực tế trước khi viết code

### Thứ Tự Ưu Tiên Locator

```
getByRole / getByLabel / getByPlaceholder
  → getByText / getByTestId
    → data-testid / id / name
      → CSS Selector
        → XPath (cuối cùng)
```

---

## Công Cụ

### Markdown → Excel

```bash
node scripts/convert_excel/md_to_xlsx.js <input.md> [output.xlsx]
```

### Demo Apps (Thực Hành)

| App | URL | Login |
|---|---|---|
| CRM (Perfex) | https://crm.anhtester.com | admin@example.com / 123456 |
| Ecommerce | https://ecommerce.anhtester.com | admin@example.com / 123456 |

---

## Anti-Patterns (FORBIDDEN)

| Cấm | Thay thế đúng |
|---|---|
| Đọc `.env` để lấy credentials | Dùng biến môi trường, hỏi user |
| Đoán locator không inspect DOM | Inspect DOM thực tế trước khi code |
| Chạy lệnh destructive không hỏi | Hỏi user xác nhận trước |
