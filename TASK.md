# TASK.md — Template cho module mới

> Copy file này thành `TASK.md`, điền config, rồi chạy `/generate_module_testcases_full`

---

## Cấu hình

```
PROJECT_NAME=BDP
MODULE_CODE=DATA_MASTER
MODULE_NAME=Định nghĩa dữ liệu
URL=https://bdp-data-gate-admin.zminiapp.me/data/masters
OUTPUT_FOLDER=output_claude_workflow
```

---

## Bước thực hiện

### Bước 1: Sinh Requirements từ UI
- [ ] Navigate đến URL, inspect DOM thực tế
- [ ] Ghi nhận đầy đủ fields, validations, conditional UI
- [ ] Lưu: `{OUTPUT_FOLDER}/requirements_{module_slug}.md`

### Bước 2: Sinh Test Cases (RBT)
- [ ] Đọc requirements đã sinh
- [ ] Sinh TC theo phân loại High/Medium/Low risk
- [ ] TC ID format: `{PROJECT_NAME}_{MODULE_CODE}_TC_001`
- [ ] Lưu: `{OUTPUT_FOLDER}/testcases_{module_slug}.md`

### Bước 3: Export Excel
- [ ] Chạy: `node scripts/convert_excel/md_to_xlsx.js {input.md} {output.xlsx}`
- [ ] Verify đủ số lượng TC trong log output

### Bước 4: Review (Tùy chọn)
- [ ] TC ID đúng format, không trùng
- [ ] Coverage đủ cho mọi trường bắt buộc
- [ ] Test data cụ thể, không placeholder

---

## Ví dụ đã dùng

| Trường | Ví dụ |
|---|---|
| PROJECT_NAME | BDP |
| MODULE_CODE | DATA_DEF |
| MODULE_NAME | Create New Data Definition |
| URL | https://bdp-data-gate-admin.zminiapp.me/data/masters |
| OUTPUT_FOLDER | output_sonet |
| TC ID mẫu | BDP_DATA_DEF_TC_001 |
| Số TC | 40 |
