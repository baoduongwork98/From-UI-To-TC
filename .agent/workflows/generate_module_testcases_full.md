---
description: Workflow đầu-cuối sinh Requirements + Test Cases + Excel cho một module từ URL — dựa trên thực tế kiểm thử module BDP Data Definition.
skills:
  - requirements_analyzer
  - rbt_manual_testing
  - ui_debug_agent
---

# Workflow: Generate Full Module Test Cases (End-to-End)

> **Mục đích:** Sinh toàn bộ tài liệu kiểm thử (Requirements → Test Cases → Excel) cho một module từ URL thực tế.
> Workflow này được đúc kết từ thực tế kiểm thử module BDP Create New Data Definition.

---

## Cấu hình đầu vào (TASK Config)

Trước khi bắt đầu, đọc file `TASK.md` (nếu có) hoặc yêu cầu user cung cấp:

```
MODULE_NAME=<Tên module tiếng Việt, vd: Thêm mới Định nghĩa dữ liệu>
ITEM_TEST_MAIN=<Nhóm chính, vd: Định nghĩa dữ liệu>
ITEM_TEST_SUB=<Nhóm con, vd: Thêm>
URL=<URL module cần kiểm thử>
OUTPUT_FOLDER=<Thư mục output, vd: output_sonet>
START_NUMBER=<Số bắt đầu TC ID, mặc định: 1>
```

**Tên file output** (tự suy ra từ MODULE_NAME, viết thường, dấu cách → dấu gạch dưới):
- Requirements: `{OUTPUT_FOLDER}/requirements_{module_slug}.md`
- Test Cases MD: `{OUTPUT_FOLDER}/testcases_{module_slug}.md`
- Test Cases XLSX: `{OUTPUT_FOLDER}/testcases_{module_slug}.xlsx`

**TC ID format bắt buộc:** `TC - {số thứ tự}` bắt đầu từ `START_NUMBER` — vd: `TC - 1`, `TC - 2`, `TC - 25`

---

## Bước 0: Chuẩn bị Browser

### 0.1 Kiểm tra và giải phóng browser lock (nếu cần)

Nếu gặp lỗi `Browser is already in use`:
```bash
# Kill browser process cũ
pkill -f "mcp-chrome" ; pkill -f "playwright"
# Xóa singleton lock
rm -f ~/Library/Caches/ms-playwright/mcp-chrome-*/SingletonLock
```
Sau đó thử navigate lại.

### 0.2 Khởi động browser đúng cách

Thực hiện **theo thứ tự bắt buộc:**
```
navigate(URL) → resize(1920×1080) → wait_for_load → snapshot → screenshot
```

> **Lưu ý:** Luôn resize về 1920×1080 ngay sau navigate. Không tự đoán locator trước khi có snapshot.

---

## Bước 1: Thu thập Requirements từ UI

### 1.1 Inspect trang danh sách (List Page)

- Snapshot trang danh sách → ghi nhận tiêu đề, nút hành động, filter, pagination
- Screenshot lưu: `{OUTPUT_FOLDER}/screenshot_list_page.png`

### 1.2 Mở form tạo mới

- Click nút "Thêm mới" / "Tạo mới" / button tương ứng
- Nếu click bị chặn bởi pointer-events, dùng JavaScript:
  ```javascript
  // Thay vì click trực tiếp, dùng evaluate:
  element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  // Hoặc:
  document.querySelector('selector').click()
  ```
- Snapshot form → screenshot lưu: `{OUTPUT_FOLDER}/screenshot_01_form_open.png`

### 1.3 Kiểm tra từng section của form

Với **mỗi section / tab / accordion** trong form:

1. **Snapshot DOM** — ghi nhận đầy đủ các field hiển thị ở trạng thái mặc định
2. **Xác định trường bắt buộc** — kiểm tra asterisk (`*`) trong DOM thực tế, KHÔNG giả định
   ```javascript
   // Tìm label có asterisk
   document.querySelectorAll('.ant-form-item-required, [class*="required"]')
   ```
3. **Với Dropdown/Select** — mở bằng JS mousedown/click qua `.ant-select-selector`, đọc options, rồi **đóng bằng JS blur** (KHÔNG dùng `keyboard.press('Escape')` vì sẽ đóng cả modal/drawer):
   ```javascript
   // Mở dropdown
   const selector = formItem.querySelector('.ant-select-selector');
   selector.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
   selector.click();

   // Đọc options (sau khi đợi 1s)
   const opts = document.querySelectorAll('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option');

   // Đóng dropdown — dùng blur hoặc click tiêu đề form, KHÔNG dùng Escape
   document.querySelector('.ant-form-item-label')?.click();
   // Hoặc:
   selector.dispatchEvent(new MouseEvent('blur', { bubbles: true }));
   ```
4. **Scroll virtual list** để không bỏ sót options:
   ```javascript
   // Với rc-virtual-list (Ant Design):
   const holder = document.querySelector('.rc-virtual-list-holder')
   if (holder) holder.scrollTop = holder.scrollHeight
   ```
5. **Screenshot** mỗi section quan trọng

### 1.4 Khám phá Conditional UI — BẮT BUỘC thực hiện đầy đủ

> **Nguyên tắc cốt lõi:** Mỗi field có thể điều kiện đều phải được thao tác với **tất cả giá trị có thể** để phát hiện field ẩn. Không được bỏ qua bước này.

#### A. Nhận diện các field điều kiện (Trigger Fields)

Các loại field thường gây ra conditional UI:

| Loại field | Cách phát hiện |
|---|---|
| Checkbox / Toggle / Switch | Trạng thái OFF (mặc định) → ON |
| Dropdown / Select | Mỗi option có thể render UI khác nhau |
| Radio button | Mỗi lựa chọn có thể mở/đóng fields |
| Tab / Accordion | Nội dung mỗi tab có thể khác nhau |
| Numeric input | Giá trị > 0 hoặc > N có thể mở thêm fields |

#### B. Quy trình khám phá từng Trigger Field

Với **mỗi field điều kiện**, thực hiện **lần lượt từng giá trị**:

```
1. Ghi nhận trạng thái hiện tại (snapshot)
2. Thao tác giá trị mới (click checkbox / chọn option dropdown)
3. Snapshot lại → so sánh với trạng thái trước
4. Ghi nhận: fields mới xuất hiện / fields bị ẩn / fields thay đổi thuộc tính
5. Screenshot (đặt tên theo quy tắc: screenshot_{field}_{value}.png)
6. Nếu field mới xuất hiện → lặp lại B cho field đó (kiểm tra cascading)
7. Trả field về trạng thái mặc định trước khi sang field tiếp theo
```

#### C. Ví dụ thực tế (BDP Data Definition)

```
Dropdown "Loại dữ liệu":
  → Chọn "String"   → xuất hiện field "Điều kiện: Bằng, Khác, Chứa, Không chứa..."
  → Chọn "Number"   → xuất hiện field "Điều kiện: =, ≠, >, >=, <, <=..."
  → Chọn "Boolean"  → xuất hiện field "Điều kiện: True, False"
  → Chọn "DateTime" → xuất hiện field "Điều kiện: Trước, Sau, Trong khoảng..."

Checkbox "Thông số sắp xếp":
  → OFF (mặc định) → không có field nào thêm
  → ON             → xuất hiện: "Tên trường sắp xếp", "Chiều sắp xếp" (checkbox con)
    → "Chiều sắp xếp" ON → xuất hiện: "Giá trị mặc định" dropdown (ASC/DESC)
```

#### D. Ghi chép Conditional UI Map

Sau khi khám phá xong, lập **bảng mapping** trong requirements:

```markdown
### Conditional UI Map

| Trigger Field | Giá trị | Fields xuất hiện | Fields bị ẩn | Ghi chú |
|---|---|---|---|---|
| Checkbox "Sắp xếp" | ON  | Tên trường, Chiều sắp xếp | — | — |
| Checkbox "Sắp xếp" | OFF | — | Tên trường, Chiều sắp xếp | Trạng thái mặc định |
| Dropdown "Loại" | String | Điều kiện (text ops) | — | 4 operators |
| Dropdown "Loại" | Number | Điều kiện (number ops) | — | 6 operators |
```

#### E. Test Cases bắt buộc từ Conditional UI

Với **mỗi dòng** trong Conditional UI Map, phải có ít nhất:
- 1 TC: Trigger → verify field mới xuất hiện + có thể nhập liệu
- 1 TC: Untrigger → verify field bị ẩn + không được submit giá trị của nó
- 1 TC: Điền field ẩn → trigger ON → verify data được lưu đúng

### 1.5 Kiểm tra validation

- Submit form rỗng → snapshot messages lỗi → ghi nhận **nội dung chính xác** của từng message
- Test từng trường với dữ liệu invalid (quá dài, ký tự đặc biệt, sai format)
- Screenshot: `{OUTPUT_FOLDER}/screenshot_04_validation.png`

### 1.6 Viết file Requirements

Lưu vào `{OUTPUT_FOLDER}/requirements_{module_slug}.md` với cấu trúc:

```markdown
# Requirements: {MODULE_NAME}

## 1. Tổng quan
[Mô tả mục đích module]

## 2. Yêu cầu chức năng
| Mã | Mô tả |
|---|---|
| US-01 | ... |

## 3. Đặc tả trường dữ liệu

### 3.1 {Tên Section 1}
| Trường | Loại | Bắt buộc | Giá trị/Ràng buộc | Ghi chú |
|---|---|---|---|---|

## 4. Luồng xử lý & Validation
[Mô tả luồng Happy Path + Validation rules]

## 5. Câu hỏi làm rõ (Ambiguities)
[Các điểm chưa rõ cần confirm với PO/BA]
```

---

## Bước 2: Sinh Test Cases

### 2.1 Phân tích risk và scope

Dựa trên requirements, phân loại risk:
- **High:** Validation bắt buộc, submit thành công/thất bại, luồng chính
- **Medium:** Conditional UI, dropdown options, boundary values
- **Low:** UI cosmetic, optional fields, edge cases hiếm gặp

### 2.2 Xác định các nhóm test case và cách nhóm Description

| Nhóm TC | Kỹ thuật | Description nhóm | Ví dụ |
|---|---|---|---|
| Happy Path | Normal flow | `Xác minh luồng chính khi nhập dữ liệu hợp lệ` | Điền đủ → submit → thành công |
| Negative / Validation field | EP, BVA | `Kiểm tra tính bắt buộc của trường [X]` | Từng field bắt buộc = 1 TC riêng |
| Boundary values | BVA | `Kiểm tra giới hạn ký tự trường [X]` | 1 TC per field có max length |
| Dropdown options | Verification | `Dropdown [X] — kiểm tra đủ N options` | 1 TC per dropdown quan trọng |
| Conditional UI — bật/tắt | State Transition | `[Component] — [Tên thông số]` | Merge Description cho TC ON + TC OFF + TC cascade |
| Cancel / Close | Normal flow | `Kiểm tra nút [Huỷ bỏ]` | Đóng form, không lưu |

**Quy tắc nhóm Description (để merge ô trong Excel):**
- Các TC kiểm tra cùng 1 tính năng (vd: Checkbox Sắp xếp ON, OFF, cascade) → **cùng Description**, chỉ ghi ở TC đầu tiên
- Các TC kiểm tra field/dropdown khác nhau → **Description riêng**

### 2.3 Format bảng output bắt buộc

```markdown
| Test case ID | Item Test Main | Item Test Sub | Description | Pre-conditions | Step | Expected Results |
|---|---|---|---|---|---|---|
| TC - 1 | Định nghĩa dữ liệu | Thêm | Kiểm tra tính bắt buộc của trường [Mã] | 1. Đang ở form [Thêm mới Định nghĩa dữ liệu] | 1. Để trống trường [Mã]<br>2. Nhập các trường khác hợp lệ<br>3. Nhấn [Lưu mới] | 3. Hệ thống hiển thị lỗi tại trường dữ liệu: "Mã phải là bắt buộc". |
```

**Thứ tự cột không được thay đổi. 7 cột, không thêm không bớt.**

### 2.4 Quy tắc viết test case

#### TC ID
- Format: `TC - {số thứ tự}` bắt đầu từ `START_NUMBER` (mặc định 1)
- Ví dụ: `TC - 1`, `TC - 2`, ..., `TC - 25`, `TC - 26`

#### Item Test Main / Sub
- **Main:** Nhóm tính năng cấp cao — vd: `Định nghĩa dữ liệu`, `Khách hàng`
- **Sub:** Hành động cụ thể — vd: `Thêm`, `Sửa`, `Xóa`, `Xem`
- **Quy tắc merge:** Nếu nhiều TC liên tiếp cùng Main/Sub, **chỉ ghi ở TC đầu tiên**, các TC tiếp theo để **trống** → script sẽ tự merge ô trong Excel

#### Description
- Mô tả ngắn gọn mục tiêu kiểm tra (≤ 80 ký tự)
- Patterns chuẩn:
  - `Kiểm tra tính bắt buộc của trường [TênTrường]`
  - `Kiểm tra giới hạn ký tự trường [TênTrường]`
  - `Dropdown [TênDropdown] — kiểm tra đủ N options`
  - `Toggle [TênToggle] — bật/tắt [chức năng]`
  - `[ComponentName] — [hành động kiểm tra]`
- Tên trường, nút, section UI → luôn bọc trong `[brackets]`
- **Quy tắc merge:** Nếu nhiều TC liên tiếp cùng nhóm/chức năng (vd: TC sắp xếp ON/OFF/cascade đều thuộc "Thông số sắp xếp"), **chỉ ghi ở TC đầu tiên**, các TC tiếp theo để **trống**

#### Pre-conditions
- Dùng số thứ tự: `1. Điều kiện A`
- Nếu nhiều điều kiện: `1. ...\n2. ...\n3. ...` (dùng `\n` để xuống dòng trong cell)
- Ghi trạng thái ban đầu cụ thể: `Checkbox "X" = OFF`, `Đang ở form [Y]`

#### Step
- Đánh số: `1. Hành động A\n2. Hành động B\n3. Hành động C`
- Dùng `\n` để xuống dòng trong cùng cell (không tách thành nhiều dòng bảng)
- Tên nút/link: bọc `[brackets]` — vd: `Nhấn [Lưu mới]`, `Click [Thêm thuộc tính]`
- Dùng dạng `<br>` thay cho `\n` trong bảng Markdown để script xử lý đúng

#### Expected Results
- Có thể tham chiếu số bước: `3. Hệ thống hiển thị lỗi...`
- Hoặc kết quả tổng thể: `Hệ thống hiển thị danh sách...`
- Mô tả cụ thể, có thể bao gồm nội dung thông báo lỗi chính xác trong dấu `"ngoặc kép"`
- Nếu nhiều kết quả: dùng `\n` hoặc `<br>` để xuống dòng

### 2.5 Lưu file

Lưu vào `{OUTPUT_FOLDER}/testcases_{module_slug}.md`

---

## Bước 3: Export Excel

Chạy lệnh sau khi đã có file MD hoàn chỉnh:

```bash
node scripts/convert_excel/md_to_xlsx.js \
  {OUTPUT_FOLDER}/testcases_{module_slug}.md \
  {OUTPUT_FOLDER}/testcases_{module_slug}.xlsx
```

Kiểm tra output log: `Tìm thấy N bảng, tổng M test cases → Đã xuất M test cases`

---

## Bước 4 (Tùy chọn): Review & QA

Sau khi có đủ 3 file output, thực hiện review:

### 4.1 Checklist TC ID
- [ ] Format đúng: `TC - N` (số thứ tự liên tiếp, bắt đầu từ START_NUMBER)
- [ ] Không trùng số thứ tự
- [ ] Đánh số liên tiếp (không nhảy)

### 4.2 Checklist Format bảng MD
- [ ] Đúng 7 cột: `Test case ID | Item Test Main | Item Test Sub | Description | Pre-conditions | Step | Expected Results`
- [ ] Main/Sub: chỉ ghi ở dòng đầu tiên, các dòng sau để trống
- [ ] Description: chỉ ghi ở TC đầu của nhóm, các TC trong nhóm để trống
- [ ] Step và Pre-conditions: dùng `<br>` để xuống dòng (không tách nhiều dòng bảng)
- [ ] Tên field/button/section: luôn bọc trong `[brackets]`

### 4.3 Checklist Coverage
- [ ] Mỗi trường bắt buộc có ít nhất 1 TC kiểm tra validation
- [ ] Mỗi dropdown quan trọng có TC kiểm tra danh sách options
- [ ] Mỗi conditional UI (checkbox/switch) có TC kiểm tra ON và OFF
- [ ] Có TC kiểm tra Happy Path đầy đủ
- [ ] Có TC nút Huỷ bỏ / Đóng form

### 4.4 Checklist Step Quality
- [ ] Step mô tả hành động cụ thể (không mơ hồ)
- [ ] Expected Result nêu rõ thông báo/trạng thái cụ thể
- [ ] Pre-condition ghi trạng thái ban đầu chính xác (vd: `Checkbox "X" = OFF`)

---

## Xử lý sự cố thường gặp

| Vấn đề | Giải pháp |
|---|---|
| Browser lock: `Browser is already in use` | `pkill -f "mcp-chrome"` + xóa `SingletonLock` |
| Click bị chặn (pointer-events) | Dùng `evaluate` với `element.click()` hoặc `dispatchEvent` |
| Dropdown thiếu options (virtual scroll) | Scroll `rc-virtual-list-holder` về `scrollHeight` rồi query lại |
| Ref stale sau interaction | Snapshot lại trước khi dùng ref mới |
| Nhiều element cùng text/selector | Dùng JS `querySelectorAll` + filter theo index hoặc parent |
| Form không trigger validation | Submit bằng nút chính thức, không dùng keyboard shortcut |
| `Escape` đóng mất modal/drawer | **KHÔNG BAO GIỜ** dùng `keyboard.press('Escape')` khi đang trong modal — thay bằng JS blur hoặc click ra vùng tiêu đề form |
| Dropdown không đóng sau khi lấy options | Dùng `selector.dispatchEvent(new MouseEvent('blur', { bubbles: true }))` hoặc click label của một field khác |

---

## Checklist hoàn thành

- [ ] `requirements_{module_slug}.md` — đầy đủ sections, validated từ DOM thực tế
- [ ] `testcases_{module_slug}.md` — đúng format, đủ coverage, TC ID đúng
- [ ] `testcases_{module_slug}.xlsx` — export thành công, đủ số lượng TC
- [ ] Screenshots đã lưu cho reference
- [ ] Không còn câu hỏi làm rõ quan trọng nào bị bỏ ngỏ

---

## Ví dụ thực tế

| Config | Giá trị |
|---|---|
| MODULE_NAME | Thêm mới Định nghĩa dữ liệu |
| ITEM_TEST_MAIN | Định nghĩa dữ liệu |
| ITEM_TEST_SUB | Thêm |
| URL | https://bdp-data-gate-admin.zminiapp.me/data/masters |
| OUTPUT_FOLDER | output_sonet |
| START_NUMBER | 1 |
| TC ID mẫu | TC - 1, TC - 2, ..., TC - 30 |
| Files đã sinh | requirements_them_moi_dinh_nghia_du_lieu.md, testcases_them_moi_dinh_nghia_du_lieu.md, .xlsx |

### Ví dụ bảng MD mẫu

```markdown
| Test case ID | Item Test Main | Item Test Sub | Description | Pre-conditions | Step | Expected Results |
|---|---|---|---|---|---|---|
| TC - 1 | Định nghĩa dữ liệu | Thêm | Kiểm tra tính bắt buộc của trường [Mã] | 1. Đang ở form [Thêm mới Định nghĩa dữ liệu] | 1. Để trống trường [Mã]<br>2. Nhập các trường khác hợp lệ<br>3. Nhấn [Lưu mới] | 3. Hệ thống hiển thị lỗi tại trường dữ liệu: "Mã phải là bắt buộc". |
| TC - 2 |  |  | Kiểm tra tính bắt buộc của trường [Tên] | 1. Đang ở form [Thêm mới Định nghĩa dữ liệu] | 1. Để trống trường [Tên]<br>2. Nhập các trường khác hợp lệ<br>3. Nhấn [Lưu mới] | 3. Hệ thống hiển thị lỗi tại trường dữ liệu: "Tên phải là bắt buộc". |
| TC - 3 |  |  | Dropdown [Method] — kiểm tra đủ 5 options | Card config đang hiển thị | 1. Mở dropdown [Method] | Dropdown hiển thị đúng 5 options: GET, POST, PUT, PATCH, DELETE |
| TC - 4 |  |  | Cấu hình đồng bộ chủ động — Thông số sắp xếp | Checkbox "Thông số sắp xếp" = OFF | 1. Click checkbox [Thông số sắp xếp] để bật ON | Sub-section "Sắp xếp theo" xuất hiện với các field: Tham số kết nối, Tham số, Giá trị |
| TC - 5 |  |  |  | Checkbox "Thông số sắp xếp" = ON | 1. Click checkbox [Thông số sắp xếp] để tắt OFF | Sub-section "Sắp xếp theo" và toàn bộ fields bị ẩn |
```

> **Lưu ý:** TC - 4 và TC - 5 cùng nhóm "Thông số sắp xếp" → Description TC - 5 để trống → script tự merge 2 ô D trong Excel.
