# ĐẶC TẢ CHI TIẾT TOÀN BỘ USE CASE
### Website Kinh Doanh Thiết Bị Công Nghệ (Tech Gadget & Electronics Store)

> Mỗi use case gồm: Mã · Tên · Actor · Mô tả · Sự kiện kích hoạt · Tiền điều kiện · Luồng chính · Luồng thay thế · Hậu điều kiện · Dữ liệu đầu vào.
> Tổng cộng **35 use case** (đã bổ sung **UC-C14** và **UC-A09** theo kết quả rà soát SRS). UC-C08, UC-A05 thuộc lộ trình phiên bản kế tiếp — vẫn được đặc tả ở mức dự kiến.

> **Tác nhân của hệ thống:** Ngoài 4 tác nhân chính (Khách hàng, Kỹ thuật viên, Quản trị viên kho, Quản trị viên hệ thống), hệ thống có các **tác nhân phụ/ngoài**: **Khách vãng lai (Guest)** — thực hiện các thao tác công khai không cần đăng nhập (UC-C01→C06, C11, C12); **Đơn vị tài chính** (trả góp – UC-C08); **Cổng thanh toán / Ngân hàng** (UC-C09); **Đối tác vận chuyển** (giao hàng – UC-A05).

---

# A. NHÓM CHUNG (TẤT CẢ NGƯỜI DÙNG)

## UC-G01 — Đăng nhập

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-G01 |
| **Tên** | Đăng nhập |
| **Actor** | Khách hàng, Kỹ thuật viên, Quản trị viên kho, Quản trị viên hệ thống |
| **Mô tả** | Tác nhân đăng nhập vào hệ thống để sử dụng các chức năng phù hợp với vai trò. |
| **Sự kiện kích hoạt** | Kích nút "Đăng nhập" trên giao diện. |
| **Tiền điều kiện** | Tác nhân đã có tài khoản trên hệ thống. |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Nhập tài khoản và mật khẩu. | Kiểm tra các trường đã hợp lệ chưa. |
| 2 | Yêu cầu đăng nhập. | Xác thực thông tin; cấp mã thông báo phiên (JWT). |
| 3 | | Hiển thị giao diện theo vai trò người dùng. |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 2a | Trường bắt buộc bỏ trống → thông báo lỗi. |
| 2b | Tài khoản/mật khẩu sai → thông báo lỗi. |
| 2c | Sai mật khẩu quá 5 lần liên tiếp → tạm khóa tài khoản 5 phút. |

**Hậu điều kiện:** Tác nhân đăng nhập thành công vào hệ thống.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Tên tài khoản | Input text | Có | Chữ cái, chữ số; không dấu cách. | nguyen_van_a |
| 2 | Mật khẩu | Password | Có | Tối thiểu 6 ký tự. | Abc123 |

## UC-G02 — Đăng xuất

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-G02 |
| **Tên** | Đăng xuất |
| **Actor** | Tất cả người dùng đã đăng nhập |
| **Mô tả** | Tác nhân kết thúc phiên làm việc và rời khỏi hệ thống. |
| **Sự kiện kích hoạt** | Kích nút "Đăng xuất". |
| **Tiền điều kiện** | Tác nhân đang đăng nhập. |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Kích "Đăng xuất". | Hủy phiên làm việc, xóa mã thông báo phiên ở phía client. |
| 2 | | Chuyển về trang chủ/đăng nhập. |

**Luồng thay thế:** Không có.

**Hậu điều kiện:** Phiên làm việc kết thúc; người dùng cần đăng nhập lại để tiếp tục.

**Dữ liệu đầu vào:** Không có.

## UC-G03 — Thay đổi mật khẩu

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-G03 |
| **Tên** | Thay đổi mật khẩu |
| **Actor** | Tất cả người dùng đã đăng nhập |
| **Mô tả** | Tác nhân thay đổi mật khẩu tài khoản. |
| **Sự kiện kích hoạt** | Kích "Thay đổi mật khẩu" trong menu hồ sơ. |
| **Tiền điều kiện** | Tác nhân đã đăng nhập thành công. |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Nhập mật khẩu cũ, mật khẩu mới và xác nhận. | Kiểm tra các trường hợp lệ chưa. |
| 2 | Yêu cầu thay đổi. | Kiểm tra mật khẩu cũ đúng và xác nhận trùng khớp. |
| 3 | | Cập nhật mật khẩu mới; thông báo thành công. |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 2a | Mật khẩu cũ sai hoặc xác nhận không khớp → thông báo lỗi. |

**Hậu điều kiện:** Mật khẩu mới được cập nhật.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Mật khẩu cũ | Password | Có | Tối thiểu 6 ký tự. | Abc123 |
| 2 | Mật khẩu mới | Password | Có | Tối thiểu 6 ký tự, có hoa & thường. | NewAbc123 |
| 3 | Nhập lại mật khẩu mới | Password | Có | Trùng mật khẩu mới. | NewAbc123 |

## UC-G04 — Cập nhật thông tin cá nhân

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-G04 |
| **Tên** | Cập nhật thông tin cá nhân |
| **Actor** | Tất cả người dùng đã đăng nhập |
| **Mô tả** | Tác nhân chỉnh sửa thông tin hồ sơ cá nhân. |
| **Sự kiện kích hoạt** | Kích "Cập nhật thông tin cá nhân" trong menu hồ sơ. |
| **Tiền điều kiện** | Tác nhân đã đăng nhập thành công. |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Chỉnh sửa các trường thông tin mong muốn. | Kiểm tra tính hợp lệ của dữ liệu. |
| 2 | Lưu thay đổi. | Cập nhật dữ liệu; thông báo thành công. |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 1a | Dữ liệu không hợp lệ → thông báo lỗi theo từng trường. |

**Hậu điều kiện:** Thông tin cá nhân được cập nhật.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Họ tên | Input text | Có | Tối đa 100 ký tự. | Nguyễn Văn A |
| 2 | Email | Input email | Không | Đúng định dạng email. | nva@email.com |
| 3 | Số điện thoại | Input text | Không | Ký tự số. | 0987324456 |
| 4 | Địa chỉ | Input text | Không | Tối đa 200 ký tự. | 123 Lê Lợi, … |

---

# B. NHÓM KHÁCH HÀNG (CUSTOMER)

## UC-C01 — Tìm kiếm sản phẩm

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-C01 |
| **Tên** | Tìm kiếm sản phẩm |
| **Actor** | Khách hàng |
| **Mô tả** | Khách hàng tìm sản phẩm theo từ khóa (tên, thương hiệu, mã SKU…). |
| **Sự kiện kích hoạt** | Nhập từ khóa và kích "Tìm kiếm". |
| **Tiền điều kiện** | Hệ thống có dữ liệu sản phẩm. |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Nhập từ khóa tìm kiếm. | Đối chiếu từ khóa với tên/mô tả/thương hiệu/SKU. |
| 2 | Yêu cầu tìm kiếm. | Trả về danh sách sản phẩm phù hợp, có phân trang. |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 2a | Không có kết quả → thông báo "Không tìm thấy sản phẩm". |

**Hậu điều kiện:** Danh sách kết quả tìm kiếm được hiển thị.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Từ khóa | Input text | Có | Tối đa 200 ký tự. | iPhone 15 |

## UC-C02 — Lọc sản phẩm theo thông số kỹ thuật

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-C02 |
| **Tên** | Lọc sản phẩm theo thông số kỹ thuật |
| **Actor** | Khách hàng |
| **Mô tả** | Lọc danh sách sản phẩm theo thông số (CPU, RAM, dung lượng…), giá, thương hiệu. |
| **Sự kiện kích hoạt** | Chọn tiêu chí lọc trên trang danh sách sản phẩm. |
| **Tiền điều kiện** | Hệ thống có dữ liệu sản phẩm và thông số. |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Chọn nhóm sản phẩm và thiết lập tiêu chí lọc. | Hiển thị bộ tiêu chí lọc theo nhóm. |
| 2 | Áp dụng bộ lọc. | Đối chiếu điều kiện và trả về danh sách phù hợp. |
| 3 | Xem kết quả. | Hiển thị danh sách thỏa điều kiện, có phân trang. |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 2a | Không có sản phẩm thỏa điều kiện → thông báo phù hợp. |

**Hậu điều kiện:** Danh sách hiển thị theo đúng tiêu chí lọc.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Nhóm sản phẩm | Lựa chọn | Không | Thuộc danh mục hệ thống. | Laptop |
| 2 | Khoảng giá | Range | Không | Min ≤ Max, không âm. | 10–20 triệu |
| 3 | Thương hiệu | Lựa chọn | Không | Tồn tại trong hệ thống. | Asus |
| 4 | Tiêu chí thông số | Lựa chọn | Không | Theo định nghĩa thông số của nhóm. | RAM 16GB |

## UC-C03 — Xem chi tiết và thông số sản phẩm

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-C03 |
| **Tên** | Xem chi tiết và thông số sản phẩm |
| **Actor** | Khách hàng |
| **Mô tả** | Xem thông tin chi tiết: thông số kỹ thuật, biến thể, hình ảnh, đánh giá. |
| **Sự kiện kích hoạt** | Kích vào một sản phẩm trong danh sách. |
| **Tiền điều kiện** | Sản phẩm tồn tại trong hệ thống. |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Chọn sản phẩm. | Truy xuất chi tiết kèm thông số, biến thể, hình ảnh. |
| 2 | Xem thông tin và chọn biến thể (nếu có). | Cập nhật giá/tồn theo biến thể được chọn. |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 1a | Sản phẩm không tồn tại/ngừng kinh doanh → thông báo phù hợp. |

**Hậu điều kiện:** Trang chi tiết sản phẩm được hiển thị đầy đủ.

**Dữ liệu đầu vào:** Không có (thao tác đọc dữ liệu).

## UC-C04 — So sánh sản phẩm

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-C04 |
| **Tên** | So sánh sản phẩm |
| **Actor** | Khách hàng |
| **Mô tả** | So sánh trực quan các thông số kỹ thuật tương đương giữa các model. Hệ thống hỗ trợ so sánh **tối thiểu 3 sản phẩm** cùng lúc trên một màn hình (theo yêu cầu). |
| **Sự kiện kích hoạt** | Kích "So sánh" / mở màn hình so sánh. |
| **Tiền điều kiện** | Đã chọn ít nhất hai sản phẩm để so sánh (hệ thống hỗ trợ tối thiểu 3 sản phẩm cùng lúc). |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Thêm sản phẩm vào danh sách so sánh. | Ghi nhận sản phẩm vào danh sách so sánh. |
| 2 | Mở màn hình so sánh. | Hiển thị bảng so sánh thông số tương đương. |
| 3 | Đối chiếu thông số. | Làm nổi bật điểm khác biệt giữa các sản phẩm. |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 1a | Vượt số lượng tối đa cho phép so sánh → thông báo, không thêm. |

**Hậu điều kiện:** Bảng so sánh được hiển thị.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Danh sách sản phẩm so sánh | Lựa chọn nhiều | Có | Từ 2 đến tối thiểu 3 sản phẩm cùng lúc, cùng nhóm sản phẩm. | iPhone 15, Galaxy S24, Xiaomi 14 |

## UC-C05 — Xem gợi ý sản phẩm mua kèm

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-C05 |
| **Tên** | Xem gợi ý sản phẩm mua kèm |
| **Actor** | Khách hàng |
| **Mô tả** | Xem các sản phẩm/phụ kiện tương thích được gợi ý mua kèm (Cross-sell). |
| **Sự kiện kích hoạt** | Mở trang chi tiết sản phẩm. |
| **Tiền điều kiện** | Sản phẩm có cấu hình gợi ý hoặc thuộc nhóm có sản phẩm liên quan. |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Xem trang chi tiết sản phẩm. | Trả về danh sách gợi ý mua kèm (cấu hình thủ công hoặc tự động theo cùng danh mục). |
| 2 | Kích vào sản phẩm gợi ý. | Chuyển tới trang chi tiết sản phẩm gợi ý. |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 1a | Không có gợi ý phù hợp → ẩn khu vực gợi ý. |

**Hậu điều kiện:** Danh sách sản phẩm mua kèm được hiển thị.

**Dữ liệu đầu vào:** Không có (thao tác đọc dữ liệu).

## UC-C06 — Quản lý giỏ hàng

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-C06 |
| **Tên** | Quản lý giỏ hàng |
| **Actor** | Khách hàng |
| **Mô tả** | Thêm, cập nhật số lượng, xóa sản phẩm trong giỏ hàng. |
| **Sự kiện kích hoạt** | Kích "Thêm vào giỏ" hoặc mở giỏ hàng. |
| **Tiền điều kiện** | Không bắt buộc đăng nhập (giỏ hàng lưu cục bộ). |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Thêm sản phẩm/biến thể vào giỏ. | Ghi nhận sản phẩm vào giỏ hàng. |
| 2 | Cập nhật số lượng hoặc xóa sản phẩm. | Cập nhật giỏ và tính lại tạm tính. |
| 3 | Xem giỏ hàng. | Hiển thị danh sách, số lượng, tạm tính, ưu đãi (nếu có). |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 2a | Số lượng vượt tồn kho → cảnh báo và giới hạn số lượng. |

**Hậu điều kiện:** Giỏ hàng phản ánh đúng lựa chọn của khách hàng.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Sản phẩm/Biến thể | Lựa chọn | Có | Tồn tại trong hệ thống. | iPhone 15 128GB |
| 2 | Số lượng | Input number | Có | Số nguyên dương, ≤ tồn kho. | 1 |

## UC-C07 — Đặt hàng

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-C07 |
| **Tên** | Đặt hàng |
| **Actor** | Khách hàng |
| **Mô tả** | Tạo và xác nhận đơn hàng, chọn hình thức giao nhận, áp mã giảm giá (nếu có). |
| **Sự kiện kích hoạt** | Kích "Đặt hàng"/"Thanh toán" tại giỏ hàng. |
| **Tiền điều kiện** | Giỏ hàng có ít nhất một sản phẩm; khách hàng đã đăng nhập. |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Xác nhận sản phẩm và số lượng. | Kiểm tra tính sẵn có và tồn kho. |
| 2 | Chọn hình thức giao nhận và nhập thông tin. | Tính phí vận chuyển; chuẩn hóa địa chỉ. |
| 3 | Áp mã giảm giá (nếu có). | Kiểm tra hiệu lực và tính lại tổng tiền. |
| 4 | Xác nhận đặt hàng. | Khóa tồn kho, tạo đơn trong giao dịch nhất quán, ghi dòng thời gian đơn. |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 1a | Hết hàng/không đủ tồn → yêu cầu điều chỉnh giỏ. |
| 3a | Mã giảm giá không hợp lệ/hết hạn → bỏ áp dụng. |

**Hậu điều kiện:** Đơn hàng được tạo ở trạng thái chờ thanh toán/xử lý; tồn kho cập nhật.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Họ tên người nhận | Input text | Có | Tối đa 100 ký tự. | Nguyễn Văn A |
| 2 | Số điện thoại | Input text | Có | Đúng định dạng SĐT. | 0987324456 |
| 3 | Hình thức giao nhận | Lựa chọn | Có | Giao tận nơi / Nhận tại cửa hàng. | Giao tận nơi |
| 4 | Địa chỉ giao hàng | Input text | Có (khi giao tận nơi) | Tỉnh/Thành, Phường/Xã, địa chỉ chi tiết. | 123 Lê Lợi, … |
| 5 | Mã giảm giá | Input text | Không | Mã còn hiệu lực. | SALE10 |

## UC-C08 — Tính và chọn trả góp *(lộ trình)*

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-C08 |
| **Tên** | Tính và chọn trả góp |
| **Actor** | Khách hàng |
| **Mô tả** | Khách hàng lựa chọn gói trả góp, hệ thống tính số tiền trả trước và khoản trả hàng tháng theo lãi suất của đơn vị tài chính. *(Dự kiến triển khai ở phiên bản kế tiếp.)* |
| **Sự kiện kích hoạt** | Chọn "Trả góp" tại bước thanh toán. |
| **Tiền điều kiện** | Sản phẩm/đơn hàng đủ điều kiện trả góp. |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Chọn đơn vị tài chính và kỳ hạn (3/6/12 tháng). | Hiển thị các gói trả góp khả dụng. |
| 2 | Nhập số tiền trả trước (nếu có). | Tính khoản trả hàng tháng theo lãi suất kỳ hạn. |
| 3 | Xác nhận gói trả góp. | Gắn thông tin trả góp vào đơn hàng. |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 1a | Đơn hàng không đủ điều kiện trả góp → ẩn lựa chọn. |
| 3a | Hồ sơ trả góp bị từ chối bởi đơn vị tài chính → thông báo và đề xuất phương thức khác. |

**Hậu điều kiện:** Gói trả góp được gắn với đơn hàng (khi triển khai).

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Đơn vị tài chính | Lựa chọn | Có | Đối tác hỗ trợ trả góp. | Home Credit |
| 2 | Kỳ hạn | Lựa chọn | Có | 3 / 6 / 12 tháng. | 6 tháng |
| 3 | Số tiền trả trước | Input number | Không | Không âm, ≤ giá trị đơn. | 5.000.000 |

## UC-C09 — Thanh toán đơn hàng

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-C09 |
| **Tên** | Thanh toán đơn hàng |
| **Actor** | Khách hàng |
| **Mô tả** | Thanh toán đơn hàng bằng chuyển khoản qua mã QR hoặc thanh toán tại cửa hàng. |
| **Sự kiện kích hoạt** | Chọn phương thức thanh toán và xác nhận. |
| **Tiền điều kiện** | Đơn hàng đã được tạo và đang chờ thanh toán. |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Chọn phương thức thanh toán. | Hiển thị thông tin thanh toán tương ứng. |
| 2 | (QR) Quét mã và chuyển khoản. | Khởi tạo phiên thanh toán có thời hạn, chờ xác nhận. |
| 3 | | Khi giao dịch xác nhận → cập nhật trạng thái "Đã thanh toán". |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 2a | Phiên thanh toán hết hạn → hủy phiên, cho phép tạo lại. |
| 1a | (Tại cửa hàng) Ghi nhận đơn chờ; thanh toán khi nhận hàng. |

**Hậu điều kiện:** Trạng thái thanh toán của đơn hàng được cập nhật chính xác.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Phương thức thanh toán | Lựa chọn | Có | Chuyển khoản QR / Tại cửa hàng. | Chuyển khoản QR |
| 2 | Ngân hàng | Lựa chọn | Có (khi QR) | Thuộc danh sách hỗ trợ. | Vietcombank |

## UC-C10 — Theo dõi đơn hàng

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-C10 |
| **Tên** | Theo dõi đơn hàng |
| **Actor** | Khách hàng |
| **Mô tả** | Xem trạng thái và lịch sử tiến trình của đơn hàng. |
| **Sự kiện kích hoạt** | Mở mục "Đơn hàng của tôi" / chi tiết đơn. |
| **Tiền điều kiện** | Khách hàng đã đăng nhập và có đơn hàng. |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Mở danh sách đơn hàng. | Hiển thị các đơn kèm trạng thái. |
| 2 | Chọn một đơn hàng. | Hiển thị chi tiết và dòng thời gian tiến trình đơn. |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 1a | Chưa có đơn hàng → hiển thị thông báo danh sách trống. |

**Hậu điều kiện:** Thông tin trạng thái đơn hàng được hiển thị.

**Dữ liệu đầu vào:** Không có (thao tác đọc dữ liệu).

## UC-C11 — Tra cứu bảo hành điện tử

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-C11 |
| **Tên** | Tra cứu bảo hành điện tử |
| **Actor** | Khách hàng |
| **Mô tả** | Tra cứu thời hạn bảo hành còn lại của thiết bị qua Serial/IMEI. |
| **Sự kiện kích hoạt** | Nhập Serial/IMEI và kích "Tra cứu". |
| **Tiền điều kiện** | Thiết bị có hồ sơ bảo hành trong hệ thống. |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Nhập Serial/IMEI (hoặc mã đơn/SĐT). | Đối chiếu với hồ sơ bảo hành. |
| 2 | Yêu cầu tra cứu. | Trả về thông tin thiết bị và thời hạn bảo hành còn lại. |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 1a | Không tìm thấy hồ sơ → thông báo không có dữ liệu. |
| 2a | Đủ điều kiện kích hoạt → tự động kích hoạt bảo hành theo chính sách. |

**Hậu điều kiện:** Thông tin bảo hành được hiển thị.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Số Serial/IMEI | Input text | Có (hoặc thay bằng mã đơn/SĐT) | Đúng định dạng; IMEI gồm 15 chữ số. | 356938035643809 |
| 2 | Mã đơn hàng | Input text | Không | Mã đơn hợp lệ. | DH00123 |
| 3 | Số điện thoại | Input text | Không | Ký tự số. | 0987324456 |

## UC-C12 — Gửi yêu cầu hỗ trợ (Ticket)

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-C12 |
| **Tên** | Gửi yêu cầu hỗ trợ (Ticket) |
| **Actor** | Khách hàng |
| **Mô tả** | Gửi yêu cầu hỗ trợ kỹ thuật/báo lỗi kèm thông tin thiết bị và mô tả sự cố. |
| **Sự kiện kích hoạt** | Kích "Gửi yêu cầu hỗ trợ". |
| **Tiền điều kiện** | Cho phép gửi ẩn danh hoặc đã đăng nhập. |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Chọn loại yêu cầu, nhập mô tả và thông tin sản phẩm/Serial. | Hiển thị biểu mẫu nhập liệu. |
| 2 | Đính kèm tệp (tùy chọn). | Kiểm tra định dạng và dung lượng tệp. |
| 3 | Gửi yêu cầu. | Tạo phiếu hỗ trợ trạng thái "Mở", sinh mã phiếu. |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 3a | Mô tả quá ngắn (dưới mức tối thiểu) → yêu cầu bổ sung. |

**Hậu điều kiện:** Phiếu hỗ trợ được tạo, sẵn sàng cho kỹ thuật viên tiếp nhận.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Loại yêu cầu | Lựa chọn | Có | Theo danh mục phân loại. | Lỗi phần cứng |
| 2 | Sản phẩm liên quan | Lựa chọn | Không | Tồn tại trong hệ thống. | iPhone 15 |
| 3 | Số Serial/IMEI | Input text | Không | Đúng định dạng. | 356938035643809 |
| 4 | Mô tả sự cố | Textarea | Có | Tối thiểu 10 ký tự. | Máy không lên nguồn… |
| 5 | Tệp đính kèm | File upload | Không | Định dạng & dung lượng cho phép. | loi.jpg |

## UC-C13 — Theo dõi ticket hỗ trợ

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-C13 |
| **Tên** | Theo dõi ticket hỗ trợ |
| **Actor** | Khách hàng |
| **Mô tả** | Theo dõi trạng thái và trao đổi trong các phiếu hỗ trợ đã gửi. |
| **Sự kiện kích hoạt** | Mở mục "Phiếu hỗ trợ của tôi". |
| **Tiền điều kiện** | Khách hàng đã đăng nhập và có phiếu hỗ trợ. |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Mở danh sách phiếu hỗ trợ. | Hiển thị các phiếu kèm trạng thái. |
| 2 | Chọn một phiếu. | Hiển thị nội dung trao đổi và cập nhật theo thời gian thực. |
| 3 | Gửi phản hồi (nếu cần). | Ghi nhận phản hồi vào phiếu. |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 1a | Chưa có phiếu → hiển thị danh sách trống. |

**Hậu điều kiện:** Trạng thái và nội dung trao đổi của phiếu được hiển thị.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Nội dung phản hồi | Textarea | Không | Không vượt giới hạn ký tự. | Đã thử khởi động lại… |

## UC-C14 — Gửi yêu cầu bảo hành

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-C14 |
| **Tên** | Gửi yêu cầu bảo hành |
| **Actor** | Khách hàng (Guest có thể gửi kèm thông tin định danh) |
| **Mô tả** | Khách hàng tạo yêu cầu bảo hành cho thiết bị đã mua (gắn Serial/IMEI). Khác với UC-C12 (phiếu hỗ trợ chung), đây là phiếu bảo hành (Warranty Claim) gắn trực tiếp với hồ sơ bảo hành của thiết bị. |
| **Sự kiện kích hoạt** | Kích "Yêu cầu bảo hành" từ kết quả tra cứu bảo hành (UC-C11) hoặc từ lịch sử mua hàng. |
| **Tiền điều kiện** | Thiết bị có hồ sơ bảo hành và còn trong thời hạn bảo hành. |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Chọn thiết bị (Serial/IMEI) và nhập mô tả lỗi. | Kiểm tra điều kiện và thời hạn bảo hành. |
| 2 | Gửi yêu cầu. | Tạo phiếu bảo hành (Warranty Claim) trạng thái "Tiếp nhận", sinh mã phiếu. |
| 3 | | Thông báo tới bộ phận kỹ thuật/bảo hành. |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 1a | Thiết bị hết hạn/không đủ điều kiện bảo hành → thông báo và đề xuất gửi phiếu hỗ trợ chung (UC-C12). |

**Hậu điều kiện:** Phiếu bảo hành được tạo và sẵn sàng cho kỹ thuật viên tiếp nhận (UC-T01).

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Số Serial/IMEI | Input text | Có | Đúng định dạng, tồn tại hồ sơ bảo hành. | 356938035643809 |
| 2 | Mô tả lỗi | Textarea | Có | Tối thiểu 10 ký tự. | Pin chai nhanh… |
| 3 | Tệp đính kèm | File upload | Không | Định dạng & dung lượng cho phép. | loi_pin.jpg |

---

# C. NHÓM KỸ THUẬT VIÊN (TECHNICAL STAFF)

## UC-T01 — Tiếp nhận yêu cầu bảo hành

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-T01 |
| **Tên** | Tiếp nhận yêu cầu bảo hành |
| **Actor** | Kỹ thuật viên |
| **Mô tả** | Tiếp nhận thiết bị/yêu cầu bảo hành và lập hồ sơ sửa chữa gắn với thiết bị cụ thể. |
| **Sự kiện kích hoạt** | Kích "Tiếp nhận bảo hành". |
| **Tiền điều kiện** | Đã đăng nhập với vai trò Kỹ thuật viên. |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Nhập nguồn yêu cầu (phiếu bảo hành/ticket/Serial-IMEI). | Truy xuất thông tin thiết bị tương ứng. |
| 2 | Xác nhận thông tin khách hàng và mô tả lỗi. | Tạo hồ sơ sửa chữa trạng thái "Tiếp nhận", sinh mã hồ sơ. |
| 3 | | Gửi thông báo tiếp nhận tới khách hàng. |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 1a | Không tìm thấy thiết bị → yêu cầu nhập lại hoặc tạo mới. |

**Hậu điều kiện:** Hồ sơ sửa chữa được tạo và liên kết thiết bị/phiếu liên quan.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Nguồn tiếp nhận | Lựa chọn | Có | Phiếu bảo hành / Ticket / Serial-IMEI. | Serial-IMEI |
| 2 | Serial/IMEI | Input text | Có (nếu chọn Serial) | Đúng định dạng. | 356938035643809 |
| 3 | Tên khách hàng | Input text | Có | Tối đa 100 ký tự. | Nguyễn Văn A |
| 4 | Số điện thoại | Input text | Có | Ký tự số. | 0987324456 |
| 5 | Mô tả lỗi | Textarea | Có | Tối thiểu 10 ký tự. | Màn hình bị sọc… |

## UC-T02 — Cập nhật tình trạng sửa chữa

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-T02 |
| **Tên** | Cập nhật tình trạng sửa chữa |
| **Actor** | Kỹ thuật viên |
| **Mô tả** | Cập nhật tiến độ/trạng thái sửa chữa của thiết bị theo từng giai đoạn. |
| **Sự kiện kích hoạt** | Kích "Cập nhật trạng thái" trên hồ sơ sửa chữa. |
| **Tiền điều kiện** | Hồ sơ sửa chữa tồn tại và do kỹ thuật viên phụ trách. |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Chọn trạng thái mới và ghi chú. | Kiểm tra tính hợp lệ chuyển trạng thái. |
| 2 | Lưu cập nhật. | Ghi lịch sử; đồng bộ trạng thái sang phiếu bảo hành, ticket, thiết bị trong kho. |
| 3 | | Gửi thông báo tiến độ tới khách hàng. |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 1a | Chuyển trạng thái không hợp lệ → thông báo, giữ nguyên trạng thái. |

**Hậu điều kiện:** Trạng thái sửa chữa được cập nhật và đồng bộ.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Trạng thái | Lựa chọn | Có | Chẩn đoán/Chờ linh kiện/Sửa chữa/Kiểm thử/Hoàn tất… | Sửa chữa |
| 2 | Ghi chú | Textarea | Không | Tối đa giới hạn ký tự. | Đã thay màn hình |

## UC-T03 — Xử lý ticket hỗ trợ kỹ thuật

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-T03 |
| **Tên** | Xử lý ticket hỗ trợ kỹ thuật |
| **Actor** | Kỹ thuật viên |
| **Mô tả** | Tiếp nhận, phản hồi, phân công và thay đổi trạng thái phiếu hỗ trợ. |
| **Sự kiện kích hoạt** | Mở phiếu hỗ trợ trong hàng đợi. |
| **Tiền điều kiện** | Đã đăng nhập với vai trò Kỹ thuật viên. |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Mở phiếu và xem nội dung. | Hiển thị chi tiết phiếu và lịch sử trao đổi. |
| 2 | Phản hồi khách hàng hoặc ghi chú nội bộ. | Lưu cập nhật; gửi nội dung công khai tới khách theo thời gian thực. |
| 3 | Thay đổi trạng thái/phân công phiếu. | Cập nhật trạng thái/người phụ trách phiếu. |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 2a | Người dùng không đủ quyền ghi chú nội bộ → từ chối thao tác. |

**Hậu điều kiện:** Phiếu hỗ trợ được cập nhật nội dung/trạng thái/phân công.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Nội dung phản hồi | Textarea | Không | Trong giới hạn ký tự. | Vui lòng mang máy đến… |
| 2 | Ghi chú nội bộ | Checkbox + Textarea | Không | Chỉ vai trò kỹ thuật. | (nội bộ) |
| 3 | Trạng thái phiếu | Lựa chọn | Không | Mở/Đang xử lý/Chờ khách/Đã xử lý/Đóng. | Đang xử lý |

## UC-T04 — Tư vấn kỹ thuật trực tuyến

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-T04 |
| **Tên** | Tư vấn kỹ thuật trực tuyến |
| **Actor** | Kỹ thuật viên |
| **Mô tả** | Trao đổi, tư vấn kỹ thuật với khách hàng theo thời gian thực **trong phạm vi phiếu hỗ trợ**. Đây là **luồng mở rộng (`<<extend>>`) của UC-T03** (không phải kênh tư vấn độc lập); source hiện thực bằng nhắn tin thời gian thực (SignalR) trong ticket. |
| **Sự kiện kích hoạt** | Mở phiên trao đổi của phiếu hỗ trợ. |
| **Tiền điều kiện** | Tồn tại phiếu hỗ trợ đang trao đổi. |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Tham gia phòng trao đổi của phiếu. | Thiết lập kênh trao đổi thời gian thực. |
| 2 | Gửi nội dung tư vấn. | Chuyển tiếp tin nhắn tới khách hàng và lưu vào lịch sử phiếu. |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 1a | Không đủ quyền truy cập phiếu → từ chối tham gia. |

**Hậu điều kiện:** Nội dung tư vấn được ghi nhận trong phiếu hỗ trợ.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Nội dung tin nhắn | Input text | Có | Không rỗng, trong giới hạn ký tự. | Anh thử sạc 15 phút… |

---

# D. NHÓM QUẢN TRỊ VIÊN KHO (STOCK MANAGER)

## UC-W01 — Nhập hàng theo lô

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-W01 |
| **Tên** | Nhập hàng theo lô |
| **Actor** | Quản trị viên kho |
| **Mô tả** | Tạo phiếu nhập hàng theo lô với nhà cung cấp, kho nhận và danh sách hàng hóa. *(Ranh giới: W01 phụ trách **tạo phiếu nhập lô** — gồm gán Serial/IMEI cho các đơn vị **tại thời điểm nhập**; việc quản lý vòng đời các đơn vị **đã tồn tại** thuộc UC-W02.)* |
| **Sự kiện kích hoạt** | Kích "Tạo phiếu nhập kho". |
| **Tiền điều kiện** | Đã đăng nhập với vai trò Quản trị viên kho. |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Khai báo nhà cung cấp, kho nhận, danh sách hàng nhập. | Kiểm tra dữ liệu hợp lệ. |
| 2 | Xác nhận phiếu nhập. | Lưu phiếu, tính lại tồn kho, ghi nhận biến động kho. |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 1a | Dữ liệu thiếu/không hợp lệ → thông báo lỗi theo trường. |

**Hậu điều kiện:** Phiếu nhập được lưu; tồn kho cập nhật.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Nhà cung cấp | Dropdown | Có | Tồn tại trong hệ thống. | Công ty ABC |
| 2 | Kho nhận | Dropdown | Có | Tồn tại trong hệ thống. | Kho Hà Nội |
| 3 | Sản phẩm | Tìm kiếm/Dropdown | Có | Tồn tại trong hệ thống. | iPhone 15 |
| 4 | Số lượng | Input number | Có | Số nguyên dương. | 10 |
| 5 | Giá nhập | Input number | Có | Số không âm. | 18000000 |

## UC-W02 — Quản lý IMEI/Serial

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-W02 |
| **Tên** | Quản lý IMEI/Serial |
| **Actor** | Quản trị viên kho |
| **Mô tả** | Quản lý **vòng đời của các đơn vị thiết bị đã tồn tại** trong kho: tra cứu, đổi trạng thái, phân loại/backfill Serial/IMEI. Mỗi thiết bị tương ứng một đơn vị tồn kho. *(Khác với UC-W01: W01 gán Serial/IMEI lúc nhập; W02 quản lý sau khi đơn vị đã được tạo. Việc xem tồn kho tổng hợp & lịch sử biến động thuộc UC-W03.)* |
| **Sự kiện kích hoạt** | Nhập Serial/IMEI khi nhập kho hoặc tra cứu đơn vị thiết bị. |
| **Tiền điều kiện** | Sản phẩm được cấu hình quản lý theo serial. |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Nhập/định danh Serial/IMEI cho từng đơn vị. | Kiểm tra hợp lệ (IMEI 15 chữ số, đạt Luhn); chống trùng lặp. |
| 2 | Lưu. | Sinh đơn vị tồn kho (Stock Item) gắn Serial/IMEI và mã nội bộ. |
| 3 | Tra cứu/đổi trạng thái đơn vị (nếu cần). | Hiển thị/cập nhật trạng thái thiết bị (Tồn kho/Đã bán/Bảo hành…). |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 1a | Serial/IMEI sai định dạng hoặc trùng → báo lỗi, không tạo đơn vị. |
| 1b | Không nhập serial thật → sinh mã nội bộ tự động (auto-tag). |

**Hậu điều kiện:** Mỗi thiết bị được định danh và truy vết theo Serial/IMEI.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | IMEI | Input text | Không* | 15 chữ số, đạt kiểm tra Luhn. | 356938035643809 |
| 2 | Serial Number | Input text | Không* | Hợp lệ, không trùng. | SN-AB12CD34 |
| 3 | Trạng thái | Lựa chọn | Không | Tồn kho/Đã bán/Bảo hành/Lỗi… | Tồn kho |

*\*Phải cung cấp ít nhất một trong IMEI/Serial; nếu không, hệ thống sinh mã nội bộ tự động.*

## UC-W03 — Theo dõi tồn kho

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-W03 |
| **Tên** | Theo dõi tồn kho |
| **Actor** | Quản trị viên kho |
| **Mô tả** | Theo dõi tồn kho theo từng đơn vị thiết bị và lịch sử biến động kho. |
| **Sự kiện kích hoạt** | Mở màn hình tồn kho/đơn vị thiết bị. |
| **Tiền điều kiện** | Đã đăng nhập với vai trò Quản trị viên kho. |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Thiết lập tiêu chí lọc (từ khóa, sản phẩm, trạng thái, kho, thời gian). | Truy vấn đơn vị tồn kho theo tiêu chí. |
| 2 | Xem danh sách và lịch sử biến động. | Hiển thị danh sách đơn vị, trạng thái và lịch sử biến động kho. |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 1a | Không có dữ liệu phù hợp → thông báo danh sách trống. |

**Hậu điều kiện:** Thông tin tồn kho được hiển thị.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Từ khóa/Serial | Input text | Không | Trong giới hạn ký tự. | 35693803… |
| 2 | Trạng thái | Lựa chọn | Không | Theo danh mục trạng thái. | Tồn kho |
| 3 | Kho | Lựa chọn | Không | Tồn tại trong hệ thống. | Kho Hà Nội |

## UC-W04 — Xử lý hàng đổi trả

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-W04 |
| **Tên** | Xử lý hàng đổi trả |
| **Actor** | Quản trị viên kho |
| **Mô tả** | Tiếp nhận, xét duyệt và nhập lại kho hàng đổi trả theo từng thiết bị. |
| **Sự kiện kích hoạt** | Kích "Tạo phiếu đổi trả"/tiếp nhận yêu cầu. |
| **Tiền điều kiện** | Tồn tại đơn hàng/thiết bị liên quan. |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Nhập thông tin đổi trả (Serial/IMEI, lý do, tình trạng). | Truy xuất đơn hàng/thiết bị; tạo phiếu "Chờ duyệt". |
| 2 | Xét duyệt phiếu. | Cập nhật Duyệt/Từ chối. |
| 3 | Nhập lại kho. | Nhập lại tồn (InStock) hoặc đánh dấu lỗi (Damaged); ghi biến động kho. |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 2a | Phiếu bị từ chối → kết thúc, không thay đổi tồn kho. |

**Hậu điều kiện:** Phiếu đổi trả được xử lý; trạng thái thiết bị và tồn kho cập nhật.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Serial/IMEI | Input text | Có | Tồn tại trong hệ thống. | 356938035643809 |
| 2 | Lý do đổi trả | Textarea | Có | Tối thiểu 10 ký tự. | Lỗi nhà sản xuất |
| 3 | Tình trạng hàng | Lựa chọn | Có | Đã dùng/Hỏng/Mất/Bảo hành… | Hỏng |
| 4 | Số tiền hoàn | Input number | Không | Không âm. | 18000000 |

---

# E. NHÓM QUẢN TRỊ VIÊN HỆ THỐNG (ADMIN)

## UC-A01 — Quản lý danh mục kỹ thuật

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-A01 |
| **Tên** | Quản lý danh mục kỹ thuật |
| **Actor** | Quản trị viên hệ thống |
| **Mô tả** | Thêm, sửa, xóa danh mục sản phẩm. |
| **Sự kiện kích hoạt** | Mở mục "Quản lý danh mục". |
| **Tiền điều kiện** | Đã đăng nhập với quyền Admin. |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Chọn thao tác (thêm/sửa/xóa) danh mục. | Hiển thị biểu mẫu tương ứng. |
| 2 | Nhập thông tin và lưu. | Kiểm tra hợp lệ và lưu danh mục. |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 2a | Xóa danh mục đang chứa sản phẩm → cảnh báo/chặn theo ràng buộc. |

**Hậu điều kiện:** Danh mục được cập nhật.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Tên danh mục | Input text | Có | Không trùng, tối đa 100 ký tự. | Laptop |
| 2 | Mô tả | Textarea | Không | Tối đa giới hạn ký tự. | Máy tính xách tay |

## UC-A02 — Cấu hình bộ thông số động

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-A02 |
| **Tên** | Cấu hình bộ thông số động |
| **Actor** | Quản trị viên hệ thống |
| **Mô tả** | Định nghĩa bộ thông số kỹ thuật riêng theo nhóm sản phẩm cùng các giá trị tùy chọn. |
| **Sự kiện kích hoạt** | Kích "Cấu hình thông số" trong quản lý danh mục. |
| **Tiền điều kiện** | Đã đăng nhập với quyền Admin. |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Thêm/sửa định nghĩa thông số (tên, mã, kiểu dữ liệu, dùng để so sánh/làm trục biến thể). | Kiểm tra hợp lệ và lưu định nghĩa. |
| 2 | Thêm/sửa giá trị tùy chọn (nếu có). | Lưu danh sách giá trị tùy chọn. |
| 3 | Lưu cấu hình. | Áp dụng bộ thông số cho nhóm sản phẩm. |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 1a | Xóa thông số đang được sử dụng → vô hiệu hóa mềm thay vì xóa cứng. |

**Hậu điều kiện:** Bộ thông số động của nhóm sản phẩm được cập nhật.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Tên thông số | Input text | Có | Không trùng trong nhóm. | Số khe RAM |
| 2 | Mã thông số | Input text | Có | Duy nhất, không dấu cách. | ram_slots |
| 3 | Kiểu dữ liệu | Lựa chọn | Có | Text/Number/Bool. | Number |
| 4 | Dùng để so sánh | Checkbox | Không | true/false. | true |
| 5 | Giá trị tùy chọn | Danh sách | Không | Theo kiểu dữ liệu. | 2, 4 |

## UC-A03 — Quản lý sản phẩm

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-A03 |
| **Tên** | Quản lý sản phẩm |
| **Actor** | Quản trị viên hệ thống |
| **Mô tả** | Thêm/sửa/xóa sản phẩm kèm hình ảnh, biến thể, thông số và danh mục. |
| **Sự kiện kích hoạt** | Mở mục "Quản lý sản phẩm". |
| **Tiền điều kiện** | Đã đăng nhập với quyền Admin. |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Chọn thao tác và nhập thông tin sản phẩm (tên, danh mục, giá, mô tả). | Hiển thị biểu mẫu; kiểm tra hợp lệ. |
| 2 | Thêm hình ảnh, biến thể, gán thông số. | Lưu các thành phần liên quan. |
| 3 | Lưu sản phẩm. | Sinh SKU/Slug; lưu sản phẩm và quan hệ. |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 1a | Thiếu trường bắt buộc → highlight và chặn lưu. |

**Hậu điều kiện:** Sản phẩm được tạo/cập nhật cùng các thành phần liên quan.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Tên sản phẩm | Input text | Có | Tối đa 200 ký tự. | iPhone 15 |
| 2 | Danh mục | Dropdown | Có | Tồn tại trong hệ thống. | Điện thoại |
| 3 | Giá bán | Input number | Có | Số không âm. | 22990000 |
| 4 | Hình ảnh | File upload | Không | Định dạng ảnh hợp lệ. | iphone15.jpg |
| 5 | Biến thể | Danh sách | Không | Theo trục biến thể đã định nghĩa. | 128GB/256GB |

## UC-A04 — Thiết lập giá bán

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-A04 |
| **Tên** | Thiết lập giá bán |
| **Actor** | Quản trị viên hệ thống |
| **Mô tả** | Cập nhật giá bán sản phẩm (giá gốc, giá bán, giá min/max). |
| **Sự kiện kích hoạt** | Kích "Cập nhật giá" trên sản phẩm. |
| **Tiền điều kiện** | Sản phẩm tồn tại; đã đăng nhập với quyền Admin. |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Nhập giá bán và các mức giá liên quan. | Kiểm tra ràng buộc giá hợp lệ. |
| 2 | Lưu. | Cập nhật giá sản phẩm; thông báo thành công. |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 1a | Giá min > giá max hoặc giá âm → thông báo lỗi. |

**Hậu điều kiện:** Giá bán sản phẩm được cập nhật.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Giá bán | Input number | Có | Số không âm. | 22990000 |
| 2 | Giá gốc | Input number | Không | ≥ giá bán. | 24990000 |
| 3 | Giá min/max | Input number | Không | min ≤ max, không âm. | 21–25 triệu |

## UC-A05 — Quản lý đối tác vận chuyển *(lộ trình)*

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-A05 |
| **Tên** | Quản lý đối tác vận chuyển |
| **Actor** | Quản trị viên hệ thống |
| **Mô tả** | Quản lý danh sách đối tác vận chuyển, biểu phí và phạm vi giao nhận. *(Dự kiến triển khai ở phiên bản kế tiếp.)* |
| **Sự kiện kích hoạt** | Mở mục "Quản lý đối tác vận chuyển". |
| **Tiền điều kiện** | Đã đăng nhập với quyền Admin. |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Thêm/sửa/xóa đối tác vận chuyển. | Hiển thị biểu mẫu; kiểm tra hợp lệ. |
| 2 | Thiết lập biểu phí/phạm vi giao nhận. | Lưu cấu hình đối tác. |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 1a | Xóa đối tác đang gắn với đơn hàng → cảnh báo/chặn. |

**Hậu điều kiện:** Danh sách đối tác vận chuyển được cập nhật (khi triển khai).

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Tên đối tác | Input text | Có | Không trùng. | GHN |
| 2 | Biểu phí | Input number/Bảng | Có | Số không âm. | 30000 |
| 3 | Phạm vi giao nhận | Lựa chọn | Không | Theo khu vực hỗ trợ. | Toàn quốc |

## UC-A06 — Quản lý cảnh báo hàng tồn kho lâu ngày

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-A06 |
| **Tên** | Quản lý cảnh báo hàng tồn kho lâu ngày |
| **Actor** | Quản trị viên hệ thống |
| **Mô tả** | Thống kê các mặt hàng tồn kho vượt ngưỡng thời gian để có phương án xử lý. |
| **Sự kiện kích hoạt** | Mở báo cáo "Hàng tồn lâu ngày" và đặt ngưỡng số ngày. |
| **Tiền điều kiện** | Đã đăng nhập với quyền Admin. |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Đặt ngưỡng số ngày và tiêu chí lọc (danh mục/NCC/kho). | Truy vấn đơn vị tồn kho vượt ngưỡng. |
| 2 | Xem kết quả. | Hiển thị danh sách kèm số ngày tồn, giá vốn, giá trị tồn ước tính. |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 1a | Không có hàng tồn vượt ngưỡng → thông báo không có dữ liệu. |

**Hậu điều kiện:** Danh sách hàng tồn kho lâu ngày được hiển thị.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Ngưỡng số ngày | Input number | Có | Số nguyên ≥ 0 (mặc định 30). | 90 |
| 2 | Danh mục | Lựa chọn | Không | Tồn tại trong hệ thống. | Laptop |
| 3 | Nhà cung cấp/Kho | Lựa chọn | Không | Tồn tại trong hệ thống. | Kho Hà Nội |

## UC-A07 — Quản lý tài khoản người dùng

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-A07 |
| **Tên** | Quản lý tài khoản người dùng |
| **Actor** | Quản trị viên hệ thống |
| **Mô tả** | Tạo mới, chỉnh sửa, khóa/mở khóa và phân quyền tài khoản người dùng. |
| **Sự kiện kích hoạt** | Mở mục "Quản lý người dùng". |
| **Tiền điều kiện** | Đã đăng nhập với quyền Admin. |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Mở danh sách người dùng. | Hiển thị tài khoản kèm tên, email, vai trò, trạng thái. |
| 2a | Tạo tài khoản mới, chọn vai trò. | Kiểm tra dữ liệu, tạo tài khoản. |
| 2b | Khóa/Mở khóa tài khoản. | Cập nhật trạng thái và ghi nhật ký. |
| 2c | Thay đổi vai trò. | Cập nhật phân quyền tức thì. |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 2a.1 | Email đã tồn tại → thông báo lỗi. |
| 2b.1 | Không cho khóa tài khoản Admin cuối cùng. |

**Hậu điều kiện:** Tài khoản được tạo/cập nhật/khóa; thay đổi có hiệu lực tức thì.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Họ tên | Input text | Có | Tối đa 100 ký tự. | Nguyễn Văn A |
| 2 | Email | Input email | Có | Đúng định dạng, chưa tồn tại. | nva@email.com |
| 3 | Vai trò | Dropdown | Có | Khách hàng/Kỹ thuật viên/QTV kho/Admin. | Kỹ thuật viên |

## UC-A08 — Xem báo cáo tài chính / kinh doanh

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-A08 |
| **Tên** | Xem báo cáo tài chính / kinh doanh |
| **Actor** | Quản trị viên hệ thống |
| **Mô tả** | Xem bảng điều khiển với các chỉ số vận hành (doanh thu, đơn hàng, tồn kho, sản phẩm bán chạy). |
| **Sự kiện kích hoạt** | Mở bảng điều khiển (Dashboard). |
| **Tiền điều kiện** | Đã đăng nhập với quyền Admin. |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Mở bảng điều khiển. | Tổng hợp và hiển thị các chỉ số vận hành. |
| 2 | Xem chi tiết theo nhóm chỉ số. | Hiển thị chi tiết tương ứng (đơn theo trạng thái, top sản phẩm, hàng sắp hết…). |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 1a | Không có dữ liệu trong kỳ → hiển thị chỉ số bằng 0. |

**Hậu điều kiện:** Thông tin báo cáo được hiển thị phục vụ ra quyết định.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Khoảng thời gian | Lựa chọn | Không | Khoảng ngày hợp lệ. | Tháng này |

## UC-A09 — Quản lý gợi ý sản phẩm mua kèm

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-A09 |
| **Tên** | Quản lý gợi ý sản phẩm mua kèm (Cross-sell) |
| **Actor** | Quản trị viên hệ thống |
| **Mô tả** | Cấu hình danh sách sản phẩm mua kèm (linh kiện/phụ kiện tương thích) cho từng sản phẩm chính — đáp ứng yêu cầu "Quản lý linh kiện đi kèm". Là phần quản trị tương ứng với UC-C05 (khách hàng xem gợi ý). |
| **Sự kiện kích hoạt** | Mở mục "Quản lý gợi ý mua kèm" trên một sản phẩm. |
| **Tiền điều kiện** | Đã đăng nhập với quyền Admin. |

**Luồng chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Chọn sản phẩm chính. | Hiển thị danh sách sản phẩm gợi ý hiện có. |
| 2 | Thêm/xóa sản phẩm gợi ý kèm loại quan hệ (Cross-sell). | Kiểm tra hợp lệ. |
| 3 | Lưu. | Cập nhật cấu hình gợi ý (ProductRecommendation). |

**Luồng thay thế:**

| STT | Hệ thống |
|----|----------|
| 2a | Thêm chính sản phẩm vào danh sách gợi ý của nó → từ chối. |
| 2b | Sản phẩm gợi ý không tồn tại/ngừng kinh doanh → cảnh báo, không thêm. |

**Hậu điều kiện:** Danh sách sản phẩm mua kèm của sản phẩm chính được cập nhật.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Sản phẩm chính | Lựa chọn | Có | Tồn tại trong hệ thống. | iPhone 15 |
| 2 | Sản phẩm gợi ý | Lựa chọn nhiều | Có | Tồn tại, khác sản phẩm chính. | Ốp lưng, Sạc nhanh |
| 3 | Loại quan hệ | Lựa chọn | Có | Cross-sell (mua kèm). | Cross-sell |

---

> **Ghi chú phạm vi và nguồn gốc use case:**
> - **Use case lộ trình (chưa hiện thực ở v1.0):** UC-C08 (Trả góp) và UC-A05 (Quản lý đối tác vận chuyển) — đặc tả ở trên mô tả hành vi **dự kiến**.
> - **Use case bổ sung theo rà soát:** UC-C14 (Gửi yêu cầu bảo hành) và UC-A09 (Quản lý gợi ý mua kèm) — bổ sung để phủ đủ yêu cầu "theo dõi lịch sử bảo hành" và "quản lý linh kiện đi kèm".
> - **Chức năng nền tảng (ngầm định, không nêu tường minh trong yêu cầu gốc):** UC-G02, UC-G03, UC-G04.
> - **Chức năng có trong source nhưng ngoài yêu cầu gốc** (cần xác nhận qua Change Request nếu giữ trong phạm vi): **Mã giảm giá/Coupon** (trong UC-C07) và **UC-A07 Quản lý tài khoản người dùng**.
