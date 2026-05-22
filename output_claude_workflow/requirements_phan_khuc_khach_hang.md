# Requirements: Thêm mới Phân khúc khách hàng

## 1. Tổng quan

Module **Phân khúc khách hàng** cho phép quản trị viên tạo mới phân khúc để phân loại khách hàng theo các điều kiện tùy chỉnh (thông tin khách hàng, hoá đơn, công nợ). Phân khúc có thể được xử lý tức thì hoặc theo lịch, và có thể lặp lại hằng ngày.

**URL:** https://bdp-mini-app-admin.zminiapp.me/segments

---

## 2. Yêu cầu chức năng

| Mã | Mô tả |
|---|---|
| US-01 | Người dùng có thể mở form Thêm mới phân khúc từ trang danh sách |
| US-02 | Người dùng phải nhập Tên phân khúc (bắt buộc) |
| US-03 | Người dùng có thể chọn Thời gian xử lý: Tức thì hoặc Đặt lịch tương lai |
| US-04 | Khi chọn "Đặt lịch tương lai", người dùng có thể chỉ định Thời điểm xử lý |
| US-05 | Người dùng có thể bật/tắt tùy chọn "Lặp lại hằng ngày" |
| US-06 | Khi "Lặp lại hằng ngày" được bật, người dùng có thể đặt ngày kết thúc lặp lại |
| US-07 | Người dùng có thể thêm điều kiện phân loại bằng cách kéo-thả từ panel trái vào panel phải |
| US-08 | Mỗi điều kiện được thêm vào yêu cầu nhập Giá trị |
| US-09 | Người dùng có thể xóa từng điều kiện đã thêm |
| US-10 | Sau khi lưu thành công, hệ thống hiển thị thông báo và bản ghi mới xuất hiện trong danh sách |
| US-11 | Người dùng có thể đóng form mà không lưu dữ liệu |

---

## 3. Đặc tả trường dữ liệu

### 3.1 Thông tin chung

| Trường | Loại | Bắt buộc | Giá trị / Ràng buộc | Ghi chú |
|---|---|---|---|---|
| Tên phân khúc | Text input | **Có** | Chuỗi ký tự tự do | Placeholder: "Nhập tên phân khúc"; Lỗi: "Vui lòng nhập tên phân khúc" |
| Thời gian xử lý | Radio group | Không | "Tức thì" (mặc định) / "Đặt lịch tương lai" | Mặc định: Tức thì |
| Kiểu xử lý | Checkbox | Không | "Lặp lại hằng ngày" (mặc định: tích) | Mặc định: checked |

### 3.2 Conditional Fields

| Trường | Loại | Bắt buộc | Điều kiện hiển thị | Ghi chú |
|---|---|---|---|---|
| Thời điểm xử lý | DateTime picker | Không | Thời gian xử lý = "Đặt lịch tương lai" | Placeholder: "Chọn thời điểm xử lý" |
| Lặp lại đến ngày | Date picker | Không | Checkbox "Lặp lại hằng ngày" = ON | Placeholder: "Không chọn nếu lặp lại hằng ngày" |

### 3.3 Điều kiện phân loại (Drag-and-drop)

**Giao diện:** Panel 2 cột
- **Trái** — danh sách điều kiện theo 4 tab
- **Phải** — vùng "Điều kiện đã chọn"; empty state: *"Kéo điều kiện từ bên trái vào khu vực này"*

**Trạng thái bắt buộc:** Có dấu `*` trong UI nhưng **không enforce** khi submit (form lưu thành công dù không có điều kiện nào).

#### Tab 1 — Thông tin khách hàng (7 điều kiện)

| Điều kiện |
|---|
| Chi nhánh |
| Hạng |
| Nhóm khách hàng |
| Danh sách khách hàng |
| Loại trừ danh sách khách hàng |
| Khu vực: Tỉnh Thành, Phường Xã |
| Ngày khởi tạo tài khoản |

#### Tab 2 — Hoá đơn (4 điều kiện)

| Điều kiện |
|---|
| Ngày mua hàng hoá đơn |
| Giá trị đơn hàng |
| Mã hàng hoá |
| Tổng doanh thu |

#### Tab 3 — Công nợ (1 điều kiện)

| Điều kiện |
|---|
| Tổng công nợ |

#### Tab 4 — Công nợ theo hoá đơn (2 điều kiện)

| Điều kiện |
|---|
| Số ngày nợ quá hạn |
| Ưu đãi thanh toán |

#### Card điều kiện đã thêm

Mỗi card hiển thị: tên điều kiện, tên tab cha, nút xóa (×), field **Giá trị** (bắt buộc, combobox).
- Validation khi Giá trị trống: **"Vui lòng nhập giá trị"**

---

## 4. Luồng xử lý & Validation

### 4.1 Happy Path

```
1. Click [Thêm mới] trên trang danh sách
2. Form drawer "Thêm mới phân khúc khách hàng" mở ra
3. Nhập [Tên phân khúc]
4. (Tuỳ chọn) Cấu hình Thời gian xử lý, Kiểu xử lý, Điều kiện phân loại
5. Click [Lưu mới]
6. Hệ thống lưu thành công → đóng form → hiển thị notification "Tạo phân khúc khách hàng thành công"
7. Bản ghi mới xuất hiện đầu danh sách với Trạng thái = "Chờ xử lý"
```

### 4.2 Validation Rules

| Field | Rule | Message lỗi |
|---|---|---|
| Tên phân khúc | Bắt buộc, không được để trống | "Vui lòng nhập tên phân khúc" |
| Giá trị (điều kiện) | Bắt buộc nếu đã kéo điều kiện vào | "Vui lòng nhập giá trị" |

### 4.3 Kết quả sau khi tạo thành công

- Notification: **"Tạo phân khúc khách hàng thành công"**
- Cột **Trạng thái xử lý lặp lại**: "Chờ xử lý" (khi chưa có lần xử lý nào)
- Cột **Trạng thái**: "Chờ xử lý"

---

## 5. Conditional UI Map

| Trigger Field | Giá trị | Fields xuất hiện | Fields bị ẩn | Ghi chú |
|---|---|---|---|---|
| Radio "Thời gian xử lý" | Đặt lịch tương lai | Thời điểm xử lý | — | Optional field |
| Radio "Thời gian xử lý" | Tức thì (default) | — | Thời điểm xử lý | Trạng thái mặc định |
| Checkbox "Lặp lại hằng ngày" | ON (default) | Lặp lại đến ngày | — | Mặc định checked |
| Checkbox "Lặp lại hằng ngày" | OFF | — | Lặp lại đến ngày | Ẩn hoàn toàn |

---

## 6. Trang danh sách (List Page)

### 6.1 Filter

| Field | Loại |
|---|---|
| Tên phân khúc thành viên | Text search |
| Trạng thái xử lý lặp lại | Dropdown |
| Thời gian tạo | Date range (từ - đến) |

### 6.2 Columns bảng

| Cột | Ghi chú |
|---|---|
| ID | Auto-generated |
| Tên phân khúc | — |
| Tổng số khách hàng | — |
| Trạng thái xử lý lặp lại | Không xử lý / Chờ lần xử lý tiếp theo / Chờ xử lý |
| Trạng thái | Hoàn tất / Chờ xử lý / Đã Huỷ |
| Ngày thêm | — |
| Ngày cập nhật | — |
| Hành động | Xem chi tiết, Sửa, Lịch sử xử lý, Huỷ cập nhật lặp lại (tuỳ trạng thái) |

---

## 7. Câu hỏi làm rõ (Ambiguities)

| # | Vấn đề | Ảnh hưởng |
|---|---|---|
| Q1 | "Điều kiện phân loại" có dấu `*` nhưng không enforce validation khi submit — có phải bug UI hay thiết kế cố ý? | Nếu bắt buộc → cần thêm TC validation |
| Q2 | "Thời điểm xử lý" (khi chọn "Đặt lịch tương lai") có bắt buộc không? Form không show lỗi khi để trống | Cần xác nhận |
| Q3 | Giới hạn ký tự tối đa cho "Tên phân khúc" là bao nhiêu? | TC boundary value |
| Q4 | Có thể thêm nhiều điều kiện cùng loại không (vd: 2 điều kiện "Chi nhánh")? | TC multi-condition |
| Q5 | Trạng thái khởi tạo "Chờ xử lý" của cột "Trạng thái xử lý lặp lại" có ý nghĩa khác "Chờ xử lý" của cột "Trạng thái" không? | Hiểu đúng nghĩa để viết Expected Result |
