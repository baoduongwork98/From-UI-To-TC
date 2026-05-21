# Tài liệu Yêu cầu: Thêm mới Định nghĩa dữ liệu

## 1. Tổng quan

Module "Thêm mới Định nghĩa dữ liệu" cho phép người dùng tạo cấu hình định nghĩa dữ liệu trong hệ thống BDP Data Gate. Một định nghĩa dữ liệu bao gồm thông tin cơ bản và tối đa 3 nhóm cấu hình:

- Cấu hình đồng bộ chủ động: hệ thống chủ động gọi API bên ngoài để lấy dữ liệu theo chu kỳ.
- Cấu hình đồng bộ tự động: hệ thống tạo webhook endpoint để nhận dữ liệu từ bên ngoài đẩy vào.
- Cấu hình chuyển tiếp dữ liệu: hệ thống chuyển tiếp dữ liệu đến hệ thống khác khi có điều kiện thỏa mãn.

URL module: https://bdp-data-gate-admin.zminiapp.me/data/masters

---

## 2. Yêu cầu chức năng

### US-01: Thêm mới định nghĩa dữ liệu cơ bản

Người dùng có thể nhập Mã và Tên để tạo một định nghĩa dữ liệu mới. Nút "Thêm mới" mở drawer form ở góc phải màn hình.

Acceptance Criteria:
- Drawer có tiêu đề "Thêm mới Định nghĩa dữ liệu" và nút "Lưu mới".
- Trường Mã và Tên đều bắt buộc (có dấu *).
- Khi submit thiếu Mã: hiển thị "Mã phải là bắt buộc".
- Khi submit thiếu Tên: hiển thị "Tên phải là bắt buộc".
- Khi lưu thành công: bản ghi mới xuất hiện trong danh sách.

### US-02: Cấu hình thuộc tính duy nhất và kết nối

Người dùng có thể chỉ định thuộc tính dùng để nhận dạng duy nhất bản ghi và chọn hệ thống kết nối.

Acceptance Criteria:
- Thuộc tính duy nhất mặc định là "id", có thể sửa/xóa và thêm nhiều thuộc tính.
- Kết nối là dropdown tùy chọn, không bắt buộc.

### US-03: Cấu hình đồng bộ chủ động

Người dùng có thể thêm và cấu hình một hoặc nhiều cấu hình đồng bộ chủ động.

Acceptance Criteria:
- Mặc định không có cấu hình nào. Nhấn "Thêm cấu hình" để thêm.
- Mỗi cấu hình có switch Hoạt động (bật/tắt), tên cấu hình, nút sao chép, nút xóa.
- Các trường URL và Đường dẫn dữ liệu là bắt buộc khi cấu hình được bật.
- Checkbox Thông số sắp xếp, Thông số phân trang hiển thị các trường con khi được chọn.

### US-04: Cấu hình đồng bộ tự động (webhook)

Người dùng có thể thêm và cấu hình một hoặc nhiều webhook endpoint để nhận dữ liệu.

Acceptance Criteria:
- Hệ thống tự sinh URL webhook (prefix cố định + suffix người dùng nhập).
- Có thể lọc request theo Queries, Headers, Payload với điều kiện tùy chỉnh.
- Hành động dữ liệu và Đường dẫn dữ liệu là bắt buộc.

### US-05: Cấu hình chuyển tiếp dữ liệu

Người dùng có thể cấu hình hệ thống tự động chuyển tiếp dữ liệu sang endpoint khác khi đáp ứng điều kiện.

Acceptance Criteria:
- Có thể chọn trigger từ đồng bộ chủ động hoặc tự động.
- Có thể lọc theo loại thao tác dữ liệu (Thêm mới/Cập nhật/Xóa bỏ).
- URL nhận tiếp nhận và Method là bắt buộc.

---

## 3. Đặc tả trường dữ liệu

### 3.1. Thông tin cơ bản

| Tên trường | Loại | Bắt buộc | Mặc định | Ghi chú |
|---|---|---|---|---|
| Mã | Text | Có | Trống | Mã duy nhất cho định nghĩa dữ liệu |
| Tên | Text | Có | Trống | Tên hiển thị |
| Thuộc tính duy nhất | Tags input | Không | id | Có thể thêm nhiều thuộc tính, nút X xóa từng thuộc tính, link "Thêm thuộc tính" |
| Kết nối | Dropdown | Không | Vui lòng chọn | Danh sách kết nối đã cấu hình trong hệ thống |

### 3.2. Cấu hình đồng bộ chủ động

Mỗi cấu hình gồm header (switch + tên) và nội dung có thể thu gọn/mở rộng.

#### 3.2.1. Header cấu hình

| Tên trường | Loại | Bắt buộc | Mặc định | Ghi chú |
|---|---|---|---|---|
| ID | Text (read-only) | — | Trống khi tạo mới | Hệ thống sinh sau khi lưu |
| Hoạt động | Switch | Có | Bật | Bật/tắt cấu hình |
| Tên cấu hình | Text | Không | Cấu hình 1 | Placeholder mặc định |
| Nút sao chép | Button | — | — | Nhân đôi cấu hình |
| Nút xóa | Button | — | — | Xóa cấu hình |

#### 3.2.2. Thông số kết nối

| Tên trường | Loại | Bắt buộc | Mặc định | Ghi chú |
|---|---|---|---|---|
| URL | Text | Có | Trống | Endpoint API cần gọi |
| Method | Dropdown | Có | GET | Tùy chọn: GET, POST, PUT, PATCH, DELETE |

#### 3.2.3. Thông số sắp xếp (checkbox — ẩn mặc định)

Khi checkbox "Thông số sắp xếp" được chọn, hiển thị:

| Tên trường | Loại | Bắt buộc | Mặc định | Ghi chú |
|---|---|---|---|---|
| Tham số kết nối | Dropdown | Không | Query | Tùy chọn: Query, Header, Payload |
| Tham số thuộc tính | Text | Không | order_by | Tên tham số sắp xếp gửi lên API |
| Giá trị thuộc tính | Text | Không | id | Giá trị mặc định gửi lên API |

Khi checkbox con "Với chiều" được chọn, hiển thị thêm:

| Tên trường | Loại | Bắt buộc | Mặc định | Ghi chú |
|---|---|---|---|---|
| Tham số kết nối (chiều) | Dropdown | Không | Query | Tùy chọn: Query, Header, Payload |
| Loại chiều | Radio | Không | Tăng dần | Tùy chọn: Tăng dần, Giảm dần |
| Tham số chiều | Text | Không | order_dir | Tên tham số chiều sắp xếp |
| Giá trị chiều | Text | Không | desc | Giá trị chiều gửi lên API |

#### 3.2.4. Thông số phân trang (checkbox — ẩn mặc định)

Khi checkbox "Thông số phân trang" được chọn, hiển thị:

| Tên trường | Loại | Bắt buộc | Mặc định | Ghi chú |
|---|---|---|---|---|
| Tham số kết nối (loại) | Dropdown | Không | Query | Tùy chọn: Query, Header, Payload |
| Loại phân trang | Radio | Không | Trang (page) | Tùy chọn: Trang (page), Vị trí (offset) |
| Tham số loại | Text | Không | — | Tên tham số loại phân trang |

Nhóm "Bắt đầu":

| Tên trường | Loại | Bắt buộc | Mặc định | Ghi chú |
|---|---|---|---|---|
| Tham số kết nối (bắt đầu) | Dropdown | Không | Query | Query, Header, Payload |
| Tham số bắt đầu | Text | Không | — | Tên tham số thời gian bắt đầu |

Nhóm "Kết thúc":

| Tên trường | Loại | Bắt buộc | Mặc định | Ghi chú |
|---|---|---|---|---|
| Tham số kết nối (kết thúc) | Dropdown | Không | Query | Query, Header, Payload |
| Tham số kết thúc | Text | Không | — | Tên tham số thời gian kết thúc |

Nhóm "Phạm vi tối đa":

| Tên trường | Loại | Bắt buộc | Mặc định | Ghi chú |
|---|---|---|---|---|
| Phạm vi tối đa | Number | Không | — | Giá trị số nguyên dương |
| Đơn vị | Dropdown | Không | Ngày | Tùy chọn: Giây, Phút, Giờ, Ngày, Tuần, Tháng, Năm |

#### 3.2.5. Hành động dữ liệu và Đường dẫn

| Tên trường | Loại | Bắt buộc | Mặc định | Ghi chú |
|---|---|---|---|---|
| Hành động dữ liệu | Dropdown | Có | Tồn tại thì cập nhật, không thì thêm mới | Tùy chọn: (1) Tồn tại thì cập nhật; (2) Tồn tại thì cập nhật, không thì thêm mới; (3) Tồn tại thì xóa bỏ; (4) Không tồn tại thì thêm mới |
| Đường dẫn dữ liệu | Text | Có | * | JSON path trích xuất dữ liệu từ response, mặc định * lấy toàn bộ |
| Chu kỳ đồng bộ | Dropdown | Không | Mỗi giờ | Tùy chọn: Mỗi phút, 5 phút, 15 phút, 30 phút, Mỗi giờ, Mỗi ngày, Mỗi tuần, Mỗi tháng |

#### 3.2.6. Dữ liệu lưu thêm (Thêm dữ liệu — nhiều dòng)

| Tên trường | Loại | Bắt buộc | Mặc định | Ghi chú |
|---|---|---|---|---|
| Khóa | Text | Có | — | Tên thuộc tính sẽ lưu thêm |
| Loại | Dropdown | Có | — | Tùy chọn: Cấu hình kết nối, Dữ liệu đã lưu, Mảng toàn bộ dữ liệu, Một thuộc tính dữ liệu, Giá trị cố định, Mảng cố định, Ngày hiện tại, Thời gian hiện tại, NULL |
| Giá trị | Dynamic | Phụ thuộc Loại | — | Trường nhập liệu tương ứng với Loại đã chọn |

---

### 3.3. Cấu hình đồng bộ tự động

Mỗi cấu hình tạo ra một webhook endpoint để nhận dữ liệu từ hệ thống bên ngoài.

#### 3.3.1. Header cấu hình

Cấu trúc giống mục 3.2.1 (ID read-only, Switch Hoạt động, Tên cấu hình, Sao chép, Xóa).

#### 3.3.2. URL Webhook và Method

| Tên trường | Loại | Bắt buộc | Mặc định | Ghi chú |
|---|---|---|---|---|
| URL prefix | Text (read-only) | — | https://bdp-data-gate-api.zminiapp.me/webhook/bdp/ | Tiền tố cố định hệ thống sinh |
| URL suffix | Text | Không | Trống | Phần hậu tố người dùng tùy chỉnh |
| Method | Dropdown | Có | POST | Tùy chọn: GET, POST, PUT, PATCH, DELETE |

#### 3.3.3. Điều kiện lọc — Queries, Headers, Payload

Mỗi tab có link "Thêm điều kiện". Mỗi dòng điều kiện:

| Tên trường | Loại | Bắt buộc | Mặc định | Ghi chú |
|---|---|---|---|---|
| Khóa | Text | Có | — | Tên key/thuộc tính cần kiểm tra |
| Loại dữ liệu | Dropdown | Có | Văn bản | Văn bản, Thời gian, Chữ số, Boolean, Mảng, Số điện thoại, Email, URL |
| Điều kiện so khớp | Dropdown | Không | Trống | Operators tùy theo Loại dữ liệu (xem Phụ lục A) |
| Giá trị so khớp | Dynamic | Không | — | Nhập giá trị so sánh |
| Nút xóa dòng | Button | — | — | Xóa dòng điều kiện |

#### 3.3.4. Hành động dữ liệu và Đường dẫn

| Tên trường | Loại | Bắt buộc | Mặc định | Ghi chú |
|---|---|---|---|---|
| Hành động dữ liệu | Dropdown | Có | Tồn tại thì cập nhật, không thì thêm mới | 4 tùy chọn giống mục 3.2.5 |
| Đường dẫn dữ liệu | Text | Có | * | JSON path, mặc định * |

#### 3.3.5. Dữ liệu lưu thêm

Cấu trúc giống mục 3.2.6 (Khóa, Loại 9 tùy chọn, Giá trị).

---

### 3.4. Cấu hình chuyển tiếp dữ liệu

#### 3.4.1. Header cấu hình

Cấu trúc giống mục 3.2.1.

#### 3.4.2. Điều kiện kích hoạt

| Tên trường | Loại | Bắt buộc | Mặc định | Ghi chú |
|---|---|---|---|---|
| Khi đồng bộ chủ động | Dropdown | Không | Chọn đồng bộ chủ động | Chọn cấu hình Pulling đã tạo trong form này |
| Khi đồng bộ tự động | Dropdown | Không | Chọn đồng bộ bị động | Chọn cấu hình Pushing đã tạo trong form này |
| Khi dữ liệu được | Multi-select | Không | Trống | Tùy chọn: Thêm mới, Cập nhật, Xóa bỏ |

#### 3.4.3. Điều kiện thuộc tính dữ liệu

Link "Thêm điều kiện". Cấu trúc mỗi dòng:

| Tên trường | Loại | Bắt buộc | Mặc định | Ghi chú |
|---|---|---|---|---|
| Khóa | Text | Có | — | Tên thuộc tính dữ liệu cần lọc |
| Loại dữ liệu | Dropdown | Có | — | Văn bản, Thời gian, Chữ số, Boolean, Mảng, Số điện thoại, Email, URL |
| Điều kiện so khớp | Dropdown | Không | Trống | Operators tùy theo loại (xem Phụ lục A) |
| Nút xóa dòng | Button | — | — | Xóa dòng |

#### 3.4.4. Thông số kết nối đích

| Tên trường | Loại | Bắt buộc | Mặc định | Ghi chú |
|---|---|---|---|---|
| URL | Text | Có | — | Endpoint nhận dữ liệu chuyển tiếp |
| Method | Dropdown | Có | POST | Tùy chọn: GET, POST, PUT, PATCH, DELETE |

---

## 4. Luồng xử lý và Validation

### 4.1. Validation khi submit

| Trường | Điều kiện | Thông báo lỗi |
|---|---|---|
| Mã | Trống | "Mã phải là bắt buộc" |
| Tên | Trống | "Tên phải là bắt buộc" |
| Pulling: URL | Trống khi cấu hình bật | Validation error (trường highlight đỏ) |
| Pulling: Đường dẫn dữ liệu | Trống khi cấu hình bật | Validation error |
| Pushing: Hành động dữ liệu | Không chọn | Validation error |
| Pushing: Đường dẫn dữ liệu | Trống | Validation error |
| Forwarding: URL | Trống | Validation error |

### 4.2. Happy Path — Tạo mới cơ bản

1. Nhấn "Thêm mới" → Drawer mở, form trống, Thuộc tính duy nhất = "id".
2. Nhập Mã và Tên.
3. Nhấn "Lưu mới" → Lưu thành công, bản ghi xuất hiện trong danh sách.

### 4.3. Happy Path — Với Pulling Config

1. Thêm cấu hình đồng bộ chủ động.
2. Nhập URL API. Chọn Method.
3. (Tùy chọn) Bật Thông số sắp xếp → cấu hình tham số.
4. (Tùy chọn) Bật Thông số phân trang → cấu hình tham số và phạm vi.
5. Chọn Chu kỳ đồng bộ.
6. Lưu mới.

### 4.4. Happy Path — Với Pushing Config

1. Thêm cấu hình đồng bộ tự động.
2. (Tùy chọn) Nhập URL suffix cho webhook.
3. (Tùy chọn) Thêm điều kiện lọc Queries/Headers/Payload.
4. Xác nhận Hành động dữ liệu và Đường dẫn dữ liệu.
5. Lưu mới.

### 4.5. Happy Path — Với Forwarding Config

1. Thêm cấu hình chuyển tiếp.
2. (Tùy chọn) Chọn trigger từ Pulling/Pushing đã cấu hình.
3. (Tùy chọn) Chọn loại hành động dữ liệu kích hoạt chuyển tiếp.
4. (Tùy chọn) Thêm điều kiện thuộc tính.
5. Nhập URL endpoint đích và Method.
6. Lưu mới.

---

## 5. Câu hỏi làm rõ

1. Trường Mã có unique constraint không? Hệ thống báo lỗi gì khi trùng Mã?
2. Khi switch Hoạt động = tắt, các trường bắt buộc bên trong có được bỏ qua validate không?
3. Số lượng tối đa Pulling/Pushing/Forwarding configs cho một định nghĩa là bao nhiêu?
4. URL suffix của webhook có giới hạn ký tự hoặc regex format không?
5. Trường Chu kỳ đồng bộ không bắt buộc — nếu không chọn thì cấu hình có chạy không?

---

## Phụ lục A: Operators theo Loại dữ liệu (điều kiện Pushing và Forwarding)

| Loại dữ liệu | Số operators | Danh sách operators |
|---|---|---|
| Văn bản | 9 | Rỗng, Không rỗng, Chứa, Không chứa, Bắt đầu với, Không bắt đầu với, Kết thúc với, Không kết thúc với, Chính xác là |
| Thời gian | 9 | Chính xác là, Không chính xác là, Lớn hơn, Lớn hơn hoặc bằng, Nhỏ hơn, Nhỏ hơn hoặc bằng, Nằm trong khoảng, Không nằm trong khoảng, Có định dạng |
| Chữ số | 11 | Chính xác là, Không chính xác là, Lớn hơn, Lớn hơn hoặc bằng, Nhỏ hơn, Nhỏ hơn hoặc bằng, Nằm trong khoảng, Không nằm trong khoảng, Là số nguyên, Chứa trong mảng, Không chứa trong mảng |
| Boolean | 1 | Chính xác là |
| Mảng | 11 | Chính xác là, Không chính xác là, Có kích thước là, Có kích thước lớn hơn, Có kích thước lớn hơn hoặc bằng, Có kích thước nhỏ hơn, Có kích thước nhỏ hơn hoặc bằng, Rỗng, Không rỗng, Chứa, Không chứa |
| Số điện thoại | 12 | Chứa, Không chứa, Bắt đầu với, Không bắt đầu với, Kết thúc với, Không kết thúc với, Chính xác là, Không chính xác là, Chứa trong mảng, Không chứa trong mảng, Là số di động, Là số điện thoại bàn |
| Email | 17 | Rỗng, Không rỗng, Chứa, Không chứa, Bắt đầu với, Không bắt đầu với, Kết thúc với, Không kết thúc với, Chính xác là, Không chính xác là, Có kích thước là, Có kích thước lớn hơn, Có kích thước lớn hơn hoặc bằng, Có kích thước nhỏ hơn, Có kích thước nhỏ hơn hoặc bằng, Chứa trong mảng, Không chứa trong mảng |
| URL | 17 | Rỗng, Không rỗng, Chứa, Không chứa, Bắt đầu với, Không bắt đầu với, Kết thúc với, Không kết thúc với, Chính xác là, Không chính xác là, Có kích thước là, Có kích thước lớn hơn, Có kích thước lớn hơn hoặc bằng, Có kích thước nhỏ hơn, Có kích thước nhỏ hơn hoặc bằng, Chứa trong mảng, Không chứa trong mảng |
