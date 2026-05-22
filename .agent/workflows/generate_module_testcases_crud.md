---
description: Workflow đầu-cuối sinh Test Cases cho toàn bộ module CRUD (Danh sách + Thêm + Xem + Sửa + Xóa + Hành động phụ). Được đúc kết từ thực tế.
skills:
  - requirements_analyzer
  - rbt_manual_testing
  - ui_debug_agent
---

# Workflow: Generate Full CRUD Module Test Cases

> **Mục đích:** Sinh toàn bộ test cases cho module có bố cục chuẩn:
> - Màn hình danh sách (search + list + pagination)
> - Thêm mới (form drawer/modal)
> - Xem chi tiết (read-only drawer)
> - Chỉnh sửa (form drawer pre-filled)
> - Xóa (confirm dialog)
> - Các hành động phụ theo trạng thái (tuỳ module)

---

## Cấu hình đầu vào (TASK Config)

Đọc `TASK.md` hoặc yêu cầu user cung cấp:

```
MODULE_NAME=<Tên module, vd: Phân khúc khách hàng>
ITEM_TEST_MAIN=<Nhóm chính, vd: Phân khúc khách hàng>
URL=<URL trang danh sách>
OUTPUT_FOLDER=<Thư mục output, vd: output_claude_workflow>
START_NUMBER=<Số bắt đầu TC ID, mặc định: 1>
```

**Tên file output:**
- Requirements: `{OUTPUT_FOLDER}/requirements_{module_slug}.md`
- Test Cases MD: `{OUTPUT_FOLDER}/testcases_{module_slug}.md`
- Test Cases XLSX: `{OUTPUT_FOLDER}/testcases_{module_slug}.xlsx`

**TC ID format:** `TC - {số thứ tự}` bắt đầu từ `START_NUMBER`

---

## Bước 0: Chuẩn bị Browser

```
navigate(URL) → resize(1920×1080) → wait_for_load → snapshot
```

Kill browser lock nếu cần:
```bash
pkill -f "mcp-chrome" ; rm -f ~/Library/Caches/ms-playwright/mcp-chrome-*/SingletonLock
```

---

## Bước 1: Khám phá Trang Danh Sách

### 1.1 Chụp screenshot toàn trang

Lưu: `{OUTPUT_FOLDER}/screenshot_list_page.png`

### 1.2 Ghi nhận Filter/Search

Với **mỗi filter field**:
- Loại field (text, dropdown, date range, ...)
- Placeholder
- Mở dropdown để lấy danh sách options (nếu là dropdown)

### 1.3 Ghi nhận bảng danh sách

- Số cột và tên cột
- Tên phần heading danh sách
- Có button "Thêm mới" không?

### 1.4 Ghi nhận Pagination

- Format hiển thị: "Hiển thị từ X đến Y, trong tổng số Z dữ liệu"
- Buttons: trang trước, trang sau, số trang

### 1.5 Ghi nhận Action Buttons theo từng row

Dùng JS để map buttons theo SVG icon:

```javascript
const rows = document.querySelectorAll('tbody tr');
rows.forEach(row => {
  const id = row.querySelector('td')?.textContent?.trim();
  const statusCells = Array.from(row.querySelectorAll('td'));
  const btns = row.querySelectorAll('button');
  const btnInfo = Array.from(btns).map((b, i) => ({
    i,
    path: b.querySelector('path')?.getAttribute('d')?.substring(0, 40) || '',
    polyline: b.querySelector('polyline')?.getAttribute('points') || '',
    hasLine: !!b.querySelector('line'),
    hasCircle: !!b.querySelector('circle'),
  }));
  console.log(id, btns.length, 'buttons', JSON.stringify(btnInfo));
});
```

**Icon nhận diện phổ biến (Lucide/Feather icons):**

| SVG signature | Icon | Chức năng thường gặp |
|---|---|---|
| `has-line + has-circle` (no path/polyline) | Eye | Xem chi tiết |
| `polyline "12 6 12 12 16 14" + circle` | Clock | Lịch sử / Log |
| `path "M17 21v-2a4 4..."` | Users | Danh sách thành viên |
| `path "M11 4H4a2 2 0 0 0-2..."` | Edit/Pencil | Chỉnh sửa |
| `path "M19 6v14..." + polyline "3 6 5 6 21 6"` | Trash | Xóa |
| `has-line + has-circle` (in extra btn) | Ban/Circle-slash | Huỷ / Vô hiệu hoá |

Click **từng button** lần lượt để xác nhận:
```javascript
row.querySelectorAll('button')[N]?.click();
```
Snapshot → ghi nhận tiêu đề drawer/modal mở ra.

---

## Bước 2: Khám phá Form Thêm Mới

### 2.1 Mở form

Click button "Thêm mới" → wait 1s → snapshot.

### 2.2 Ghi nhận title và buttons

- Title của form (drawer/modal header)
- Tên button submit ("Lưu mới" / "Tạo mới" / ...)
- Tên button đóng ("Huỷ bỏ" / "×" / "Close" / ...)

### 2.3 Ghi nhận từng field

Với mỗi field:
- Label + required (`*`)
- Loại input (text, select, radio, checkbox, date, drag-and-drop, ...)
- Placeholder
- Default value

Kiểm tra required markers:
```javascript
document.querySelectorAll('.ant-form-item-required, [class*="required"]')
  .forEach(el => console.log(el.textContent));
```

### 2.4 Khám phá Conditional UI

Với **mỗi trigger field** (radio, checkbox, dropdown):
1. Ghi trạng thái hiện tại (snapshot)
2. Thay đổi giá trị
3. Snapshot lại → xác định field nào xuất hiện/ẩn
4. Screenshot: `screenshot_conditional_{field}_{value}.png`
5. Trả về trạng thái mặc định trước khi test trigger tiếp theo

### 2.5 Test Validation

Submit form rỗng → kiểm tra tất cả lỗi:
```javascript
const alerts = document.querySelectorAll('[role="alert"], .ant-form-item-explain-error');
Array.from(alerts).map(el => el.textContent.trim()).filter(t => t);
```

Screenshot: `screenshot_validation_add.png`

### 2.6 Test Submit thành công

Điền tất cả required fields → submit → ghi nhận:
- Success notification message
- Trạng thái record mới trong danh sách

---

## Bước 3: Khám phá Form Xem Chi tiết

### 3.1 Mở Xem chi tiết

Click button Eye trên một record → wait 1s → snapshot.

### 3.2 Ghi nhận

- Title drawer
- Danh sách fields hiển thị (label + value)
- Có button submit không? (nếu có → xem chi tiết bao gồm edit)
- Screenshot: `screenshot_view_detail.png`

---

## Bước 4: Khám phá Form Chỉnh Sửa

### 4.1 Xác định record có thể sửa

Dựa trên button map đã lập ở Bước 1 — tìm record có Edit (Pencil) button.

### 4.2 Mở form Sửa

Click Edit button → wait 1s → snapshot.

### 4.3 Ghi nhận

- Title: "Chỉnh sửa {tên module}"
- Fields đã pre-filled với dữ liệu cũ (same fields as Add)
- Button submit: "Cập nhật" (hoặc tên tương đương)
- Screenshot: `screenshot_edit_form.png`

### 4.4 Test Validation sửa

Xoá required field → submit → kiểm tra lỗi tương tự Add form.

### 4.5 Test Submit sửa thành công

Thay đổi một field → submit → ghi nhận:
- Success notification
- Dữ liệu cập nhật trong danh sách/chi tiết

---

## Bước 5: Khám phá Xóa

### 5.1 Mở confirm Xóa

Click Trash button trên một record → wait 0.5s → kiểm tra confirm dialog:
```javascript
document.querySelector('.ant-modal-confirm, [role="alertdialog"]')?.textContent?.substring(0, 300)
```

### 5.2 Ghi nhận

- Title confirm: "Xác nhận xóa {tên module}"
- Nội dung message xác nhận
- Buttons: "Đóng" / "Xác nhận" (hoặc tương đương)
- Trạng thái nào của record thì có nút Xóa

### 5.3 Đóng confirm (không xóa thật)

Click "Đóng" để cancel.

---

## Bước 6: Khám phá Hành động phụ (theo trạng thái)

Với mỗi button không thuộc CRUD cơ bản:
1. Click button → ghi nhận tên drawer/modal mở ra
2. Ghi nhận fields, buttons trong dialog đó
3. Đóng không submit

Ví dụ các hành động phụ phổ biến:
- Lịch sử xử lý / Log
- Danh sách thành viên / khách hàng
- Huỷ / Vô hiệu hoá / Kích hoạt
- Xử lý ngay / Trigger thủ công

---

## Bước 7: Viết Requirements

Lưu vào `{OUTPUT_FOLDER}/requirements_{module_slug}.md` với cấu trúc:

```markdown
# Requirements: {MODULE_NAME}

## 1. Tổng quan
## 2. Yêu cầu chức năng (US-01 ... US-N)
## 3. Đặc tả trường dữ liệu
### 3.1 Form Thêm mới / Chỉnh sửa
### 3.2 Màn hình Xem chi tiết
### 3.3 Trang danh sách
## 4. Luồng xử lý & Validation
## 5. Action Buttons theo trạng thái
## 6. Câu hỏi làm rõ (Ambiguities)
```

---

## Bước 8: Sinh Test Cases

### 8.1 Thứ tự nhóm TC (từ trên xuống trong bảng)

```
1.  [DANH SÁCH] Hiển thị danh sách
2.  [DANH SÁCH] Filter / Search từng field
3.  [DANH SÁCH] Pagination
4.  [THÊM]      Required field validation — từng field bắt buộc
5.  [THÊM]      Boundary values — giới hạn ký tự
6.  [THÊM]      Optional fields / default values
7.  [THÊM]      Dropdown options count
8.  [THÊM]      Conditional UI (radio/checkbox: ON/OFF/cascade)
9.  [THÊM]      Multi-value / drag-and-drop (nếu có)
10. [THÊM]      Nút đóng form
11. [THÊM]      Happy Path Thêm mới
12. [XEM]       Xem chi tiết — verify fields hiển thị đúng
13. [SỬA]       Required field validation khi sửa
14. [SỬA]       Conditional UI trong form sửa
15. [SỬA]       Nút đóng form sửa
16. [SỬA]       Happy Path Cập nhật thành công
17. [XÓA]       Confirm Xóa — click Đóng (cancel)
18. [XÓA]       Confirm Xóa — click Xác nhận (delete)
19. [HÀNH ĐỘNG] Các tính năng phụ theo trạng thái (nếu có)
```

### 8.2 Item Test Sub mapping

| Nhóm TC | Item Test Sub |
|---|---|
| Danh sách, filter, pagination | Danh sách |
| Thêm mới | Thêm |
| Xem chi tiết | Xem |
| Chỉnh sửa | Sửa |
| Xóa | Xóa |
| Hành động phụ | theo tên (Lịch sử, Huỷ, ...) |

### 8.3 Format bảng output bắt buộc

```markdown
| Test case ID | Item Test Main | Item Test Sub | Description | Pre-conditions | Step | Expected Results |
|---|---|---|---|---|---|---|
```

**7 cột, thứ tự cố định. Không thêm không bớt.**

### 8.4 Quy tắc viết

#### TC ID
- `TC - {N}` bắt đầu từ START_NUMBER
- Liên tiếp, không nhảy số

#### Merge ô
- **Item Test Main/Sub**: chỉ ghi ở TC đầu tiên của nhóm, các TC tiếp theo để trống
- **Description**: chỉ ghi ở TC đầu của cùng nhóm chức năng (vd: ON/OFF cùng feature)

#### Pre-conditions
- Ngắn gọn: `1. Đang ở trang danh sách [Module]`
- Ghi trạng thái cụ thể khi test conditional: `Checkbox "X" = OFF`
- Ghi trạng thái record khi test sửa/xóa: `Record có Trạng thái = "Chờ xử lý"`

#### Step
- Đánh số, dùng `<br>` để xuống dòng trong cell
- Tên field/button: bọc `[brackets]`
- Dùng "Nhập các trường khác hợp lệ" thay vì ghi test data cụ thể (trừ Happy Path, Boundary)

#### Expected Results
- Pattern validation: `N. Hệ thống hiển thị lỗi tại trường dữ liệu: "Nội dung lỗi".`
- Pattern success: `Hệ thống hiển thị thông báo: "Nội dung thông báo".`
- Pattern xóa thành công: `Bản ghi không còn hiển thị trong danh sách.`

#### Thứ tự ưu tiên
- **Happy Path Thêm mới** và **Happy Path Sửa** luôn đặt cuối nhóm tương ứng
- **Xóa - Xác nhận** là TC cuối cùng trong nhóm Xóa

---

## Bước 9: Export Excel

```bash
node scripts/convert_excel/md_to_xlsx.js \
  {OUTPUT_FOLDER}/testcases_{module_slug}.md \
  {OUTPUT_FOLDER}/testcases_{module_slug}.xlsx
```

Verify log: `Tìm thấy N bảng, tổng M test cases → Đã xuất M test cases`

---

## Bước 10: Review Checklist

### TC ID
- [ ] Format đúng: `TC - N`, liên tiếp từ START_NUMBER
- [ ] Không trùng số

### Format bảng
- [ ] Đúng 7 cột
- [ ] Main/Sub/Description merge đúng (chỉ ghi ở TC đầu nhóm)
- [ ] Step dùng `<br>`, không tách dòng

### Coverage CRUD
- [ ] **Danh sách**: hiển thị đúng cột, số bản ghi
- [ ] **Search/Filter**: từng filter field
- [ ] **Pagination**: next/prev, số trang
- [ ] **Thêm**: validate từng required field, Happy Path
- [ ] **Xem chi tiết**: verify tất cả fields
- [ ] **Sửa**: validate, cập nhật thành công, đúng record sửa
- [ ] **Xóa**: cancel + confirm
- [ ] **Hành động phụ**: mỗi action button có ≥ 1 TC

### Action button coverage
- [ ] Mỗi button trên mỗi trạng thái có ít nhất 1 TC
- [ ] TC ghi rõ Pre-condition: record phải ở đúng trạng thái để button hiện

---

## Xử lý sự cố thường gặp

| Vấn đề | Giải pháp |
|---|---|
| Modal cũ còn trong DOM | `document.querySelectorAll('.ant-modal-close').forEach(b => b.click())` + Escape |
| Drag-and-drop không hoạt động qua `mcp__playwright__browser_click` | Dùng `mcp__playwright__browser_drag` với startTarget/endTarget |
| Button không có title/tooltip | Inspect SVG path/polyline để nhận dạng icon |
| Nút Edit chỉ hiện với một số status | Ghi rõ Pre-condition status trong TC |
| `Ref not found` sau interaction | Snapshot lại để lấy ref mới |

---

## Ví dụ thực tế — Phân khúc khách hàng

| Config | Giá trị |
|---|---|
| MODULE_NAME | Phân khúc khách hàng |
| ITEM_TEST_MAIN | Phân khúc khách hàng |
| URL | https://bdp-mini-app-admin.zminiapp.me/segments |
| OUTPUT_FOLDER | output_claude_workflow |

### Action Buttons theo trạng thái (kết quả inspect thực tế)

| Trạng thái xử lý lặp lại | Trạng thái | Số btn | Buttons |
|---|---|---|---|
| Không xử lý | Hoàn tất | 4 | Xem chi tiết, Lịch sử, Danh sách KH, Xóa |
| Chờ lần xử lý tiếp theo | Hoàn tất | 5 | Xem chi tiết, Lịch sử, Danh sách KH, Huỷ cập nhật lặp lại, Xóa |
| Không xử lý | Chờ xử lý | 3 | Xem chi tiết, Sửa, Lịch sử |
| Không xử lý | Đã Huỷ | 2 | Xem chi tiết, Lịch sử |

### Delete Confirm Dialog
- Title: "Xác nhận xóa Phân khúc khách hàng"
- Message: "Bạn có chắc chắn muốn xóa Phân khúc khách hàng {tên} không?"
- Buttons: "Đóng" (cancel) / "Xác nhận" (delete)

### Form Chỉnh sửa
- Title: "Chỉnh sửa phân khúc khách hàng"
- Fields: giống Thêm mới, pre-filled với dữ liệu hiện tại
- Button submit: "Cập nhật"
