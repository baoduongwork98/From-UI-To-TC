# Testing Kit

Công cụ sinh tài liệu kiểm thử tự động từ URL thực tế — **không cần viết tay**.

Chỉ cần cung cấp URL module, AI sẽ tự:
1. Inspect DOM → sinh Requirements
2. Phân tích risk → sinh Test Cases (RBT)
3. Export file Excel hoàn chỉnh

---

## Cách dùng nhanh

**Bước 1** — Điền config vào `TASK.md`:

```
PROJECT_NAME=BDP
MODULE_CODE=DATA_DEF
MODULE_NAME=Định nghĩa dữ liệu
URL=https://your-app.com/module
OUTPUT_FOLDER=output_sonet
```

**Bước 2** — Chạy workflow trong Claude Code:

```
/generate_module_testcases_full
```

**Kết quả** trong `OUTPUT_FOLDER/`:
- `requirements_{module}.md` — đặc tả chức năng, danh sách fields, conditional UI
- `testcases_{module}.md` — bảng test cases 7 cột
- `testcases_{module}.xlsx` — file Excel sẵn dùng

---

## Output mẫu

Xem kết quả thực tế tại:
- [output_sonet/](output_sonet/) — module BDP Create New Data Definition (~40 TCs)
- [output_claude_workflow/](output_claude_workflow/) — module BDP Định nghĩa dữ liệu

---

## Workflow chi tiết

Workflow thực hiện 4 bước:

### Bước 1 — Thu thập Requirements từ UI
- Navigate đến URL, resize viewport 1920×1080
- Inspect DOM từng section/tab của form
- Khám phá **Conditional UI** — thao tác tất cả giá trị của mỗi trigger field (checkbox, dropdown, radio) để phát hiện field ẩn
- Ghi nhận validation messages chính xác từ DOM

### Bước 2 — Sinh Test Cases
Phân loại theo risk:
- **High** — validation bắt buộc, happy path, submit thành công/thất bại
- **Medium** — conditional UI, dropdown options, boundary values
- **Low** — edge cases, optional fields

Format bảng output chuẩn (7 cột):

| Test case ID | Item Test Main | Item Test Sub | Description | Pre-conditions | Step | Expected Results |
|---|---|---|---|---|---|---|
| TC - 1 | Định nghĩa dữ liệu | Thêm | Kiểm tra tính bắt buộc của trường [Mã] | 1. Đang ở form [Thêm mới] | 1. Để trống trường [Mã]`<br>`2. Nhấn [Lưu mới] | 2. Hiển thị lỗi: "Mã phải là bắt buộc" |

### Bước 3 — Export Excel

```bash
node scripts/convert_excel/md_to_xlsx.js output_sonet/testcases_module.md output_sonet/testcases_module.xlsx
```

### Bước 4 — Review (tùy chọn)
Checklist TC ID, format bảng, coverage, step quality.

---

## Cấu trúc dự án

```
├── .agent/
│   ├── workflows/generate_module_testcases_full.md   # Logic workflow
│   └── skills/
│       ├── requirements_analyzer/   # Phân tích requirements từ UI
│       ├── rbt_manual_testing/      # Sinh test cases theo RBT
│       └── ui_debug_agent/          # Inspect DOM, đọc locators
├── scripts/convert_excel/           # md_to_xlsx.js — export Excel
├── TASK.md                          # Input config (chỉnh trước khi chạy)
├── TASK.template.md                 # Template TASK.md cho module mới
└── Tc_sample.xlsx                   # File Excel mẫu tham khảo
```

---

## Yêu cầu

- [Claude Code](https://claude.ai/code) với MCP Playwright
- Node.js (cho script export Excel)

```bash
cd scripts/convert_excel && npm install
```

---

## Demo apps thực hành

| App | URL | Login |
|---|---|---|
| CRM (Perfex) | https://crm.anhtester.com | admin@example.com / 123456 |
| Ecommerce | https://ecommerce.anhtester.com | admin@example.com / 123456 |
