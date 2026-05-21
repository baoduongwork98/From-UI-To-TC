# Requirements: Định nghĩa dữ liệu (Data Master)

> **Dự án:** BDP | **Module:** DATA_MASTER | **URL:** https://bdp-data-gate-admin.zminiapp.me/data/masters
> **Ngày khảo sát:** 2026-05-19 | **Nguồn:** DOM inspection thực tế

---

## 1. Tổng quan

Module "Định nghĩa dữ liệu" cho phép quản trị viên tạo và cấu hình các định nghĩa dữ liệu (Data Master), bao gồm:
- Thông tin cơ bản (mã, tên, thuộc tính duy nhất, kết nối nguồn)
- Cấu hình đồng bộ **chủ động** (polling theo lịch từ API ngoài)
- Cấu hình đồng bộ **tự động** (webhook trigger)
- Cấu hình **chuyển tiếp dữ liệu** (forward sang hệ thống khác)

---

## 2. Yêu cầu chức năng

| Mã | Mô tả |
|---|---|
| US-01 | Người dùng có thể xem danh sách Định nghĩa dữ liệu với filter và phân trang |
| US-02 | Người dùng có thể tạo mới Định nghĩa dữ liệu với thông tin cơ bản |
| US-03 | Người dùng có thể thêm nhiều thuộc tính duy nhất vào một định nghĩa |
| US-04 | Người dùng có thể thêm một hoặc nhiều cấu hình đồng bộ chủ động |
| US-05 | Người dùng có thể cấu hình thông số sắp xếp cho đồng bộ chủ động |
| US-06 | Người dùng có thể cấu hình thông số phân trang cho đồng bộ chủ động |
| US-07 | Người dùng có thể thêm một hoặc nhiều cấu hình đồng bộ tự động (webhook) |
| US-08 | Người dùng có thể thêm một hoặc nhiều cấu hình chuyển tiếp dữ liệu |
| US-09 | Hệ thống validate các trường bắt buộc trước khi lưu |
| US-10 | Người dùng có thể bật/tắt từng cấu hình đồng bộ/chuyển tiếp độc lập |

---

## 3. Đặc tả trường dữ liệu

### 3.1 Trang danh sách (List Page)

**Filter:**

| Trường | Loại | Mô tả |
|---|---|---|
| Từ khóa | Text input | Tìm theo ID, mã, hoặc tên |
| Kết nối | Dropdown | Lọc theo kết nối nguồn |
| Trạng thái cuối thành công | Dropdown | Lọc theo trạng thái đồng bộ cuối |

**Cột bảng:**

| Cột | Mô tả |
|---|---|
| #ID | Số thứ tự, có sort |
| Mã | Mã định nghĩa |
| Tên | Tên định nghĩa |
| Thuộc tính duy nhất | Trường dùng để phân biệt dữ liệu |
| Kết nối | Tên kết nối nguồn |
| Tổng số dữ liệu | Số bản ghi đã đồng bộ |
| Trạng thái đồng bộ chủ động | Tên cấu hình + trạng thái + chu kỳ + thời gian sync gần nhất |
| Trạng thái đồng bộ tự động | Tên cấu hình + trạng thái + thời gian trigger gần nhất |
| Trạng thái chuyển tiếp | Tên cấu hình + trạng thái |
| Thời gian cập nhật | Datetime, có sort |
| Tài khoản thêm | Username + tên hiển thị |
| Hành động | 4 buttons: Xem, Sửa, Xóa, Đồng bộ |

---

### 3.2 Form Thêm mới — Thông tin cơ bản

| Trường | Loại | Bắt buộc | Giá trị mặc định | Validation | Ghi chú |
|---|---|---|---|---|---|
| Mã | Text | ✓ | — | "Mã phải là bắt buộc" | — |
| Tên | Text | ✓ | — | "Tên phải là bắt buộc" | — |
| Thuộc tính duy nhất | Multi text | — | `id` | — | Có thể thêm nhiều, xóa từng thuộc tính; hint: "Dùng để phân biệt giữa các dữ liệu" |
| Kết nối | Dropdown | — | Vui lòng chọn | — | Chọn kết nối nguồn dữ liệu |

---

### 3.3 Cấu hình đồng bộ chủ động

Mỗi card cấu hình có:

| Trường | Loại | Bắt buộc | Mặc định | Ghi chú |
|---|---|---|---|---|
| ID | Auto | — | Auto-generated | Hiển thị sau khi lưu |
| Hoạt động | Toggle/Switch | — | ON | Bật/tắt cấu hình này |
| Tên cấu hình | Text | — | `Cấu hình 1` | Đặt tên để phân biệt |
| URL | Text | ✓ | — | Placeholder: `https://`; Error: "URL phải là bắt buộc" |
| Method | Dropdown | — | GET | Options: GET, POST, PUT, PATCH, DELETE |
| Hành động dữ liệu | Dropdown | ✓ | Tồn tại thì cập nhật, không thì thêm mới | 4 options (xem 3.3.1) |
| Chu kỳ đồng bộ | Dropdown | — | Mỗi giờ | 15 options (xem 3.3.2) |
| Đường dẫn dữ liệu | Text | — | `*` | Path đến mảng data trong response; mỗi cấp cách nhau bằng dấu chấm |
| Dữ liệu lưu thêm | Multi key-value | — | — | "Thêm dữ liệu" — dữ liệu bổ sung khi lưu |

**3.3.1 Hành động dữ liệu options:**
- Không tồn tại thì thêm mới
- Tồn tại thì cập nhật
- Tồn tại thì cập nhật, không thì thêm mới *(default)*
- Tồn tại thì xóa bỏ

**3.3.2 Chu kỳ đồng bộ options (15 options):**
Mỗi 5 phút · Mỗi 10 phút · Mỗi 15 phút · Mỗi 30 phút · Mỗi giờ *(default)* · Mỗi 2 giờ · Mỗi 3 giờ · Mỗi 4 giờ · Mỗi 6 giờ · Mỗi ngày · Mỗi tuần · Mỗi tháng · Mỗi 3 tháng · Mỗi 6 tháng · Mỗi năm

#### 3.3.3 Thông số sắp xếp (Checkbox — Conditional UI)

**OFF (default):** Không hiển thị thêm field nào.

**ON:** Hiện sub-section "Sắp xếp theo":

| Trường | Loại | Mặc định | Ghi chú |
|---|---|---|---|
| Tham số kết nối | Dropdown | Query | Options: Query, Header, Payload |
| Tham số | Text | `order_by` | Placeholder: `order_by` |
| Giá trị | Text | `id` | Placeholder: `updated_at` |
| Với chiều | Checkbox | ON | Xem 3.3.4 |

#### 3.3.4 Với chiều (Checkbox — nested Conditional UI)

**OFF:** Ẩn direction fields.

**ON (default khi Sắp xếp = ON):** Hiện các field:

| Trường | Loại | Mặc định | Ghi chú |
|---|---|---|---|
| Tham số kết nối | Dropdown | Query | Options: Query, Header, Payload |
| Loại | Radio | Giảm dần | Options: Tăng dần / Giảm dần |
| Tham số | Text | `order_dir` | Placeholder: `order_direction` |
| Giá trị | Text | `desc` | Placeholder: `asc` |

#### 3.3.5 Thông số phân trang (Checkbox — Conditional UI)

**OFF (default):** Không hiển thị thêm field nào.

**ON:** Hiện sub-section phân trang:

| Trường | Loại | Mặc định | Ghi chú |
|---|---|---|---|
| Dựa theo — Tham số kết nối | Dropdown | Query | Options: Query, Header, Payload |
| Loại phân trang | Radio | Số trang | Options: Số trang (page) / Vị trí (offset) |
| Tham số loại | Text | — | — |
| Tham số tối đa — Tham số kết nối | Dropdown | Query | — |
| Tham số tối đa | Text | — | — |
| Giá trị tối đa | Text | `50` | Placeholder: `50` |
| Bắt đầu (checkbox) — Tham số kết nối | Dropdown | Query | — |
| Bắt đầu — Tham số bắt đầu | Text | — | — |
| Bắt đầu — Giá trị tối thiểu | Text | — | Placeholder: "Chọn giá trị tối thiểu" |
| Kết thúc (checkbox) — Tham số kết nối | Dropdown | Query | — |
| Kết thúc — Tham số kết thúc | Text | — | — |
| Phạm vi tối đa | Checkbox | — | — |

---

### 3.4 Cấu hình đồng bộ tự động

Mỗi card cấu hình có:

| Trường | Loại | Bắt buộc | Mặc định | Ghi chú |
|---|---|---|---|---|
| ID | Auto | — | Auto-generated | — |
| Hoạt động | Toggle | — | ON | — |
| Tên cấu hình | Text | — | `Cấu hình 1` | — |

**Điều kiện thỏa mãn** (Webhook trigger):

| Trường | Loại | Bắt buộc | Mặc định | Ghi chú |
|---|---|---|---|---|
| URL (base) | Static text | — | `https://bdp-data-gate-api.zminiapp.me/webhook/bdp/` | Pre-filled, read-only base |
| URL (path suffix) | Text | — | — | Nhập path sau base URL |
| Method | Dropdown | — | POST | Options: GET, POST, PUT, PATCH, DELETE |
| Queries | Multi key-value | — | — | "Thêm điều kiện" |
| Headers | Multi key-value | — | — | "Thêm điều kiện" |
| Payload | Multi key-value | — | — | "Thêm điều kiện" |

**Xử lý dữ liệu:**

| Trường | Loại | Bắt buộc | Mặc định |
|---|---|---|---|
| Hành động dữ liệu | Dropdown | ✓ | Tồn tại thì cập nhật, không thì thêm mới |
| Đường dẫn dữ liệu | Text | — | `*` |
| Dữ liệu lưu thêm | Multi key-value | — | — |

> **Khác biệt so với Đồng bộ chủ động:** Không có Chu kỳ đồng bộ, Thông số sắp xếp, Thông số phân trang — thay bằng webhook trigger condition.

---

### 3.5 Cấu hình chuyển tiếp dữ liệu

Mỗi card cấu hình có:

| Trường | Loại | Bắt buộc | Mặc định | Ghi chú |
|---|---|---|---|---|
| ID | Auto | — | Auto-generated | — |
| Hoạt động | Toggle | — | ON | — |
| Tên cấu hình | Text | — | `Cấu hình 1` | — |

**Điều kiện thỏa mãn** (trigger condition):

| Trường | Loại | Bắt buộc | Mặc định | Ghi chú |
|---|---|---|---|---|
| Khi đồng bộ chủ động | Dropdown | — | — | Placeholder: "Chọn đồng bộ chủ động" |
| Khi đồng bộ tự động | Dropdown | — | — | Placeholder: "Chọn đồng bộ bị động" |
| Khi dữ liệu được | Dropdown | — | — | Placeholder: "Chọn hành động dữ liệu (không bắt buộc)" |
| Với thuộc tính dữ liệu | Multi condition | — | — | "Thêm điều kiện" |

**Thông số kết nối (đích):**

| Trường | Loại | Bắt buộc | Mặc định | Ghi chú |
|---|---|---|---|---|
| URL | Text | ✓ | — | Placeholder: `https://`; Error: "URL phải là bắt buộc" |
| Method | Dropdown | — | POST | Options: GET, POST, PUT, PATCH, DELETE |

---

## 4. Luồng xử lý & Validation

### 4.1 Happy Path — Tạo mới cơ bản

```
1. Click "Thêm mới"
2. Điền Mã (bắt buộc)
3. Điền Tên (bắt buộc)
4. (Tùy chọn) Thêm/xóa thuộc tính duy nhất, chọn Kết nối
5. Click "Lưu mới"
→ Kết quả: Tạo thành công, xuất hiện trong danh sách
```

### 4.2 Happy Path — Tạo mới với Đồng bộ chủ động

```
1. Điền thông tin cơ bản
2. Click "Thêm cấu hình" trong section "Cấu hình đồng bộ chủ động"
3. Điền URL, chọn Method, Hành động dữ liệu, Chu kỳ đồng bộ
4. (Tùy chọn) Bật "Thông số sắp xếp" → điền Tham số, Giá trị, bật "Với chiều"
5. (Tùy chọn) Bật "Thông số phân trang" → chọn Loại, điền Tham số
6. Click "Lưu mới"
→ Kết quả: Tạo thành công, cột "Trạng thái đồng bộ chủ động" hiển thị tên cấu hình + trạng thái
```

### 4.3 Validation Rules

| Trường | Rule | Error message |
|---|---|---|
| Mã | Required | "Mã phải là bắt buộc" |
| Tên | Required | "Tên phải là bắt buộc" |
| URL (mọi section) | Required khi config tồn tại | "URL phải là bắt buộc" |
| Hành động dữ liệu | Required khi config tồn tại | (cần xác nhận thêm) |

### 4.4 Conditional UI Map

| Trigger | Giá trị | Fields xuất hiện | Fields ẩn |
|---|---|---|---|
| Checkbox "Thông số sắp xếp" | ON | Sắp xếp theo (Tham số kết nối + Tham số + Giá trị + checkbox Với chiều) | — |
| Checkbox "Thông số sắp xếp" | OFF (default) | — | Toàn bộ Sắp xếp theo |
| Checkbox "Với chiều" | ON (default khi Sắp xếp ON) | Tham số kết nối + Loại + Tham số + Giá trị cho chiều | — |
| Checkbox "Với chiều" | OFF | — | Direction fields |
| Checkbox "Thông số phân trang" | ON | Dựa theo + Loại phân trang + Tham số loại + Tối đa + Bắt đầu + Kết thúc | — |
| Checkbox "Thông số phân trang" | OFF (default) | — | Toàn bộ section phân trang |

---

## 5. Câu hỏi làm rõ (Ambiguities)

| # | Câu hỏi | Mức ưu tiên |
|---|---|---|
| Q1 | Mã có phân biệt hoa/thường không? Có kiểm tra trùng lặp không? | High |
| Q2 | Độ dài tối đa của trường Mã và Tên? | High |
| Q3 | Thuộc tính duy nhất có thể để trống hoàn toàn (xóa hết) không? | Medium |
| Q4 | Loại phân trang "Số trang" vs "Vị trí" — có trigger thêm/ẩn fields khác nhau không? | Medium |
| Q5 | "Khi đồng bộ chủ động" dropdown trong Chuyển tiếp lấy data từ đâu? | Medium |
| Q6 | Có giới hạn số lượng config trong mỗi section không? | Low |
| Q7 | Thứ tự ưu tiên nếu nhiều cấu hình đồng bộ cùng lúc? | Low |
