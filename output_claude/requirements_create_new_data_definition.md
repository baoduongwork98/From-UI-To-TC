# Tài liệu Yêu cầu: Tính năng Thêm mới Định nghĩa dữ liệu

## 1. Tổng quan (Overview)
Tính năng Thêm mới Định nghĩa dữ liệu cho phép người dùng tạo ra các định nghĩa dữ liệu mới trong hệ thống, phục vụ cho việc kết nối, đồng bộ chủ động, đồng bộ tự động và chuyển tiếp dữ liệu giữa các hệ thống.

## 2. Yêu cầu Chức năng (Functional Requirements)
- Tạo định nghĩa dữ liệu với các trường cơ bản (Mã, Tên, Thuộc tính duy nhất, Kết nối).
- Bật/tắt và cấu hình "Đồng bộ chủ động" bao gồm phân trang, sắp xếp, dữ liệu lưu thêm.
- Bật/tắt và cấu hình "Đồng bộ tự động" bao gồm các bộ lọc Queries, Headers, Payload.
- Cấu hình "Chuyển tiếp dữ liệu" sang hệ thống khác dựa trên các điều kiện lọc nâng cao.

## 3. Đặc tả Trường Dữ liệu (Field Specifications)

### 3.1. Các trường thông tin cơ bản
| Tên Trường | Loại | Bắt buộc | Ghi chú |
| --- | --- | --- | --- |
| Mã | Text | Có | Mã duy nhất xác định định nghĩa dữ liệu. |
| Tên | Text | Có | Tên gọi của định nghĩa dữ liệu. |
| Thuộc tính duy nhất | Text | Không | Dùng để phân biệt các bản ghi dữ liệu. Giá trị mặc định là id. Có nút X để xóa nhanh. |
| Kết nối | Dropdown | Không | Chọn hệ thống kết nối đã cấu hình trước (ví dụ: SAP, Bidiphar, v.v.). |

### 3.2. Cấu hình đồng bộ chủ động
Nội dung hiển thị khi có dòng "Cấu hình 1":
| Tên Trường | Loại | Bắt buộc | Ghi chú |
| --- | --- | --- | --- |
| Hoạt động | Switch | Có | Bật/tắt cấu hình. (Nút sao chép/xóa cấu hình có sẵn). |
| Thông số kết nối: URL | Text | Có | URL endpoint của API đồng bộ (ví dụ: https://api.example.com). |
| Thông số kết nối: Method | Dropdown | Có | Mặc định là GET. Tùy chọn: POST, PUT, DELETE, PATCH, OPTIONS, HEAD. |
| Thông số sắp xếp | Checkbox | Không | Khi check, hiện các trường con: Sắp xếp theo (Dropdown: Query, Header, Payload), Tham số (Text, mặc định: order_by), Giá trị (Text, mặc định: id). |
| Thông số sắp xếp: Với chiều | Checkbox | Không | Khi check, hiện trường con: Với chiều (Dropdown), Loại (Dropdown: Tăng dần, Giảm dần), Tham số (Text, mặc định: order_dir), Giá trị (Text, mặc định: desc). |
| Thông số phân trang | Checkbox | Không | Khi check, hệ thống ghi nhận nhưng không hiển thị thêm trường con giao diện. |
| Hành động dữ liệu | Dropdown | Không | Tồn tại thì cập nhật, không thì thêm mới (mặc định); Luôn luôn thêm mới; Chỉ cập nhật nếu đã tồn tại. |
| Đường dẫn dữ liệu | Text | Có | Đường dẫn JSON path để trích xuất (mặc định là *). |
| Chu kỳ đồng bộ | Dropdown | Không | Tần suất chạy: Mỗi phút, 5 phút, 15 phút, 30 phút, Mỗi giờ (mặc định), Mỗi ngày, Mỗi tuần, Mỗi tháng. |
| Dữ liệu lưu thêm: Loại | Dropdown | Không | Tùy chọn "Một thuộc tính dữ liệu" và các loại khác. |

### 3.3. Cấu hình đồng bộ tự động
Nội dung hiển thị khi kích hoạt:
| Tên Trường | Loại | Bắt buộc | Ghi chú |
| --- | --- | --- | --- |
| URL | Text | Có | Endpoint (link sinh ra để nhận webhook). |
| Method | Dropdown | Có | Mặc định POST (tùy chọn GET, PUT, v.v.). |
| Điều kiện: Queries / Headers / Payload | Động | Không | Nút "Thêm điều kiện" cho phép tạo dòng mới với các trường: Khóa, Loại, So khớp, Giá trị. |
| Dòng điều kiện: Khóa | Text | Có | Tên khóa/thuộc tính cần kiểm tra. |
| Dòng điều kiện: Loại điều kiện | Dropdown | Có | Văn bản, Thời gian, Chữ số, Boolean, Mảng, Số điện thoại, Email, URL. |
| Dòng điều kiện: Điều kiện so khớp | Dropdown | Có | Boolean: "Chính xác là". Chữ số: ">", ">=", "<", "<=", "Nằm trong khoảng", v.v. Văn bản: "Chứa", "Bắt đầu với", "Kết thúc với", v.v. |
| Dòng điều kiện: Giá trị so khớp | Động | Có | Nhập giá trị để so sánh. |
| Hành động dữ liệu | Dropdown | Không | Tương tự đồng bộ chủ động. |
| Đường dẫn dữ liệu | Text | Có | JSON path (mặc định là *). |

### 3.4. Cấu hình chuyển tiếp dữ liệu
Nội dung hiển thị khi kích hoạt:
| Tên Trường | Loại | Bắt buộc | Ghi chú |
| --- | --- | --- | --- |
| Khi đồng bộ chủ động | Dropdown | Không | Chọn cấu hình đồng bộ chủ động kích hoạt. |
| Khi đồng bộ tự động | Dropdown | Không | Chọn cấu hình đồng bộ tự động kích hoạt. |
| Khi dữ liệu được | Dropdown | Không | Tùy chọn nhiều giá trị (tags): Thêm mới, Cập nhật, Xóa bỏ. |
| Với thuộc tính dữ liệu | Động | Không | Nút "Thêm điều kiện" hoạt động giống bảng điều kiện ở phần đồng bộ tự động. |
| Thông số kết nối: URL | Text | Có | Endpoint nhận dữ liệu chuyển tiếp. |
| Thông số kết nối: Method | Dropdown | Có | Mặc định POST. |

## 4. Luồng xử lý và Báo lỗi (Processing Flows & Validations)

### Quy tắc xác thực (Validations)
- Nếu người dùng bấm Lưu mà bỏ trống trường Mã: Hiển thị lỗi Mã phải là bắt buộc.
- Nếu bỏ trống trường Tên: Hiển thị lỗi Tên phải là bắt buộc.
- Các trường URL trong thông số kết nối cũng yêu cầu nhập đầy đủ nếu cấu hình đó được bật.
