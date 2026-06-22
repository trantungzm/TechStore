# III. ĐẶC TẢ YÊU CẦU CHỨC NĂNG

## 3.1. Biểu đồ Use-case tổng quan

> *Hình 3.1: Biểu đồ Use-case tổng quan hệ thống Tech Gadget & Electronics Store*

Biểu đồ Use-case tổng quan thể hiện mối quan hệ giữa bốn tác nhân chính của hệ thống (Khách hàng, Kỹ thuật viên, Quản trị viên kho, Quản trị viên hệ thống) với các nhóm chức năng mà mỗi tác nhân được phép sử dụng. Các use case dùng chung cho mọi tác nhân (đăng nhập, đăng xuất, thay đổi mật khẩu, cập nhật thông tin cá nhân) được tách riêng nhằm tránh trùng lặp.

Ngoài bốn tác nhân chính, hệ thống còn có các **tác nhân phụ/ngoài hệ thống**, bao gồm: **Khách vãng lai (Guest)** — thực hiện các thao tác công khai không yêu cầu đăng nhập (tìm kiếm, lọc, xem chi tiết, so sánh, giỏ hàng, tra cứu bảo hành, gửi phiếu hỗ trợ); **Đơn vị tài chính** — đối tác xử lý hồ sơ trả góp (UC-C08); **Cổng thanh toán / Ngân hàng** — xử lý giao dịch thanh toán (UC-C09); và **Đối tác vận chuyển** — thực hiện giao nhận hàng hóa (liên quan UC-A05). Các tác nhân ngoài này tham gia vào các luồng tích hợp tương ứng của hệ thống.

## 3.2. Biểu đồ Use-case phân rã

### 3.2.1. Phân rã Use-case tác nhân "Khách hàng" (Customer)

> *Hình 3.2: Biểu đồ Use-case phân rã tác nhân Khách hàng*

| Mã | Tên Use case |
|----|--------------|
| UC-C01 | Tìm kiếm sản phẩm |
| UC-C02 | Lọc sản phẩm theo thông số kỹ thuật |
| UC-C03 | Xem chi tiết và thông số sản phẩm |
| UC-C04 | So sánh sản phẩm |
| UC-C05 | Xem gợi ý sản phẩm mua kèm |
| UC-C06 | Quản lý giỏ hàng |
| UC-C07 | Đặt hàng |
| UC-C08 | Tính và chọn trả góp *(lộ trình)* |
| UC-C09 | Thanh toán đơn hàng |
| UC-C10 | Theo dõi đơn hàng |
| UC-C11 | Tra cứu bảo hành điện tử |
| UC-C12 | Gửi yêu cầu hỗ trợ (Ticket) |
| UC-C13 | Theo dõi ticket hỗ trợ |
| UC-C14 | Gửi yêu cầu bảo hành |

### 3.2.2. Phân rã Use-case tác nhân "Kỹ thuật viên" (Technical Staff)

> *Hình 3.3: Biểu đồ Use-case phân rã tác nhân Kỹ thuật viên*

| Mã | Tên Use case |
|----|--------------|
| UC-T01 | Tiếp nhận yêu cầu bảo hành |
| UC-T02 | Cập nhật tình trạng sửa chữa |
| UC-T03 | Xử lý ticket hỗ trợ kỹ thuật |
| UC-T04 | Tư vấn kỹ thuật trực tuyến |

### 3.2.3. Phân rã Use-case tác nhân "Quản trị viên kho" (Stock Manager)

> *Hình 3.4: Biểu đồ Use-case phân rã tác nhân Quản trị viên kho*

| Mã | Tên Use case |
|----|--------------|
| UC-W01 | Nhập hàng theo lô |
| UC-W02 | Quản lý IMEI/Serial |
| UC-W03 | Theo dõi tồn kho |
| UC-W04 | Xử lý hàng đổi trả |

### 3.2.4. Phân rã Use-case tác nhân "Quản trị viên hệ thống" (Admin)

> *Hình 3.5: Biểu đồ Use-case phân rã tác nhân Quản trị viên hệ thống*

| Mã | Tên Use case |
|----|--------------|
| UC-A01 | Quản lý danh mục kỹ thuật |
| UC-A02 | Cấu hình bộ thông số động |
| UC-A03 | Quản lý sản phẩm |
| UC-A04 | Thiết lập giá bán |
| UC-A05 | Quản lý đối tác vận chuyển *(lộ trình)* |
| UC-A06 | Quản lý cảnh báo hàng tồn kho lâu ngày |
| UC-A07 | Quản lý tài khoản người dùng |
| UC-A08 | Xem báo cáo tài chính / kinh doanh |
| UC-A09 | Quản lý gợi ý sản phẩm mua kèm (Cross-sell) |

---

## 3.3. Đặc tả các Use-case

### 3.3.1. Use-case dành cho tất cả người dùng

#### a. Đăng nhập

| | | | |
|---|---|---|---|
| **Mã Use case** | UC-G01 | **Tên Use case** | Đăng nhập |
| **Tác nhân** | Khách hàng, Kỹ thuật viên, Quản trị viên kho, Quản trị viên hệ thống ||| 
| **Mô tả** | Tác nhân đăng nhập vào hệ thống để sử dụng các chức năng phù hợp với vai trò của mình. ||| 
| **Sự kiện kích hoạt** | Kích vào nút "Đăng nhập" trên giao diện. ||| 
| **Tiền điều kiện** | Tác nhân đã có tài khoản trên hệ thống. ||| 

**Luồng sự kiện chính (Thành công):**

| STT | Tác nhân | Hệ thống |
|-----|----------|----------|
| 1 | Nhập tài khoản và mật khẩu vào ô nhập liệu trên giao diện. | Kiểm tra các trường đăng nhập đã hợp lệ hay chưa. |
| 2 | Yêu cầu đăng nhập. | Xác thực tài khoản và mật khẩu; cấp phát mã thông báo phiên (JWT). |
| 3 | | Hiển thị giao diện và chức năng tương ứng với vai trò của người dùng. |

**Luồng sự kiện thay thế:**

| STT | Hệ thống |
|-----|----------|
| 2a | Trường bắt buộc bỏ trống → hiển thị thông báo lỗi yêu cầu nhập đầy đủ. |
| 2b | Tài khoản hoặc mật khẩu không đúng → hiển thị thông báo lỗi. |
| 2c | Nhập sai mật khẩu quá 5 lần liên tiếp → tài khoản bị tạm khóa 5 phút. |

**Hậu điều kiện:** Tác nhân đăng nhập thành công vào hệ thống.

*Dữ liệu đầu vào gồm các trường sau:*

| STT | Trường dữ liệu | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|-----|----------------|-------|:--------:|------------------|-------|
| 1 | Tên tài khoản | Input text field | Có | Chữ cái, chữ số; không chứa dấu cách. | nguyen_van_a |
| 2 | Mật khẩu | Input password field | Có | Tối thiểu 6 ký tự. | Abc123 |

#### b. Thay đổi mật khẩu

| | | | |
|---|---|---|---|
| **Mã Use case** | UC-G03 | **Tên Use case** | Thay đổi mật khẩu |
| **Tác nhân** | Tất cả người dùng đã đăng nhập ||| 
| **Mô tả** | Tác nhân thay đổi mật khẩu tài khoản cho phù hợp với cá nhân mình. ||| 
| **Sự kiện kích hoạt** | Kích vào mục "Thay đổi mật khẩu" trong menu hồ sơ người dùng. ||| 
| **Tiền điều kiện** | Tác nhân đã đăng nhập thành công. ||| 

**Luồng sự kiện chính (Thành công):**

| STT | Tác nhân | Hệ thống |
|-----|----------|----------|
| 1 | Nhập mật khẩu cũ, mật khẩu mới và xác nhận lại mật khẩu mới. | Kiểm tra các trường đã hợp lệ hay chưa. |
| 2 | Yêu cầu thay đổi mật khẩu. | Kiểm tra mật khẩu cũ chính xác và mật khẩu xác nhận trùng khớp. |
| 3 | | Cập nhật mật khẩu mới; hiển thị thông báo thành công. |

**Luồng sự kiện thay thế:**

| STT | Hệ thống |
|-----|----------|
| 2a | Mật khẩu cũ không đúng hoặc mật khẩu xác nhận không trùng khớp → hiển thị thông báo lỗi. |

**Hậu điều kiện:** Mật khẩu mới được cập nhật vào hệ thống.

*Dữ liệu đầu vào gồm các trường sau:*

| STT | Trường dữ liệu | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|-----|----------------|-------|:--------:|------------------|-------|
| 1 | Mật khẩu cũ | Input password field | Có | Tối thiểu 6 ký tự. | Abc123 |
| 2 | Mật khẩu mới | Input password field | Có | Tối thiểu 6 ký tự, có chữ hoa và chữ thường. | NewAbc123 |
| 3 | Nhập lại mật khẩu mới | Input password field | Có | Trùng khớp với mật khẩu mới. | NewAbc123 |

---

### 3.3.2. Use-case dành cho Khách hàng

#### a. Lọc sản phẩm theo thông số kỹ thuật

| | | | |
|---|---|---|---|
| **Mã Use case** | UC-C02 | **Tên Use case** | Lọc sản phẩm theo thông số kỹ thuật |
| **Tác nhân** | Khách hàng ||| 
| **Mô tả** | Khách hàng lọc danh sách sản phẩm theo các thông số kỹ thuật (CPU, RAM, dung lượng, kích thước màn hình…) và tiêu chí giá, thương hiệu nhằm tìm thiết bị phù hợp nhu cầu. ||| 
| **Sự kiện kích hoạt** | Chọn các tiêu chí lọc trong khu vực bộ lọc trên trang danh sách sản phẩm. ||| 
| **Tiền điều kiện** | Hệ thống đã có dữ liệu sản phẩm và thông số tương ứng. ||| 

**Luồng sự kiện chính (Thành công):**

| STT | Tác nhân | Hệ thống |
|-----|----------|----------|
| 1 | Chọn nhóm sản phẩm và thiết lập các tiêu chí lọc theo thông số. | Hiển thị bộ tiêu chí lọc tương ứng với nhóm sản phẩm đã chọn. |
| 2 | Áp dụng bộ lọc. | Đối chiếu điều kiện lọc với dữ liệu thông số và trả về danh sách sản phẩm phù hợp. |
| 3 | Xem kết quả lọc. | Hiển thị danh sách sản phẩm thỏa điều kiện, có phân trang. |

**Luồng sự kiện thay thế:**

| STT | Hệ thống |
|-----|----------|
| 2a | Không có sản phẩm thỏa điều kiện → hiển thị thông báo "Không tìm thấy sản phẩm phù hợp". |

**Hậu điều kiện:** Danh sách sản phẩm được hiển thị theo đúng tiêu chí lọc.

#### b. So sánh sản phẩm

| | | | |
|---|---|---|---|
| **Mã Use case** | UC-C04 | **Tên Use case** | So sánh sản phẩm |
| **Tác nhân** | Khách hàng ||| 
| **Mô tả** | Khách hàng so sánh trực quan các thông số kỹ thuật tương đương giữa nhiều model được chọn để hỗ trợ ra quyết định mua hàng. Hệ thống hỗ trợ so sánh **tối thiểu 3 sản phẩm** cùng lúc trên một màn hình (theo yêu cầu). ||| 
| **Sự kiện kích hoạt** | Kích nút "So sánh" trên sản phẩm hoặc mở màn hình so sánh. ||| 
| **Tiền điều kiện** | Khách hàng đã chọn ít nhất hai sản phẩm để so sánh (hệ thống hỗ trợ tối thiểu 3 sản phẩm cùng lúc). ||| 

**Luồng sự kiện chính (Thành công):**

| STT | Tác nhân | Hệ thống |
|-----|----------|----------|
| 1 | Thêm các sản phẩm cần so sánh vào danh sách so sánh. | Ghi nhận sản phẩm vào danh sách so sánh. |
| 2 | Mở màn hình so sánh. | Hiển thị bảng so sánh các thông số kỹ thuật tương đương giữa các sản phẩm được chọn. |
| 3 | Xem và đối chiếu các thông số. | Làm nổi bật các điểm khác biệt giữa các sản phẩm (nếu có). |

**Luồng sự kiện thay thế:**

| STT | Hệ thống |
|-----|----------|
| 1a | Vượt quá số lượng sản phẩm tối đa cho phép so sánh → thông báo và không thêm sản phẩm mới. |

**Hậu điều kiện:** Bảng so sánh được hiển thị cho khách hàng.

#### c. Đặt hàng

| | | | |
|---|---|---|---|
| **Mã Use case** | UC-C07 | **Tên Use case** | Đặt hàng |
| **Tác nhân** | Khách hàng ||| 
| **Mô tả** | Khách hàng tạo và xác nhận đơn hàng từ các sản phẩm trong giỏ hàng, lựa chọn hình thức giao nhận và áp dụng mã giảm giá (nếu có). ||| 
| **Sự kiện kích hoạt** | Kích nút "Đặt hàng" / "Thanh toán" tại giỏ hàng. ||| 
| **Tiền điều kiện** | Giỏ hàng có ít nhất một sản phẩm; khách hàng đã đăng nhập. ||| 

**Luồng sự kiện chính (Thành công):**

| STT | Tác nhân | Hệ thống |
|-----|----------|----------|
| 1 | Xác nhận danh sách sản phẩm và số lượng. | Kiểm tra tính sẵn có và tồn kho của từng sản phẩm. |
| 2 | Chọn hình thức giao nhận (giao tận nơi hoặc nhận tại cửa hàng) và nhập thông tin liên quan. | Tính phí vận chuyển tương ứng; chuẩn hóa thông tin địa chỉ. |
| 3 | Áp dụng mã giảm giá (nếu có). | Kiểm tra hiệu lực mã và tính lại tổng tiền. |
| 4 | Xác nhận đặt hàng. | Khóa tồn kho, tạo đơn hàng trong một giao dịch nhất quán và ghi nhận dòng thời gian đơn hàng. |

**Luồng sự kiện thay thế:**

| STT | Hệ thống |
|-----|----------|
| 1a | Sản phẩm hết hàng hoặc không đủ tồn → thông báo và yêu cầu điều chỉnh giỏ hàng. |
| 3a | Mã giảm giá không hợp lệ/ hết hạn → thông báo và bỏ áp dụng mã. |

**Hậu điều kiện:** Đơn hàng được tạo ở trạng thái chờ thanh toán/xử lý; tồn kho được cập nhật.

*Dữ liệu đầu vào gồm các trường sau:*

| STT | Trường dữ liệu | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|-----|----------------|-------|:--------:|------------------|-------|
| 1 | Họ tên người nhận | Input text field | Có | Tối đa 100 ký tự. | Nguyễn Văn A |
| 2 | Số điện thoại | Input text field | Có | Gồm ký tự số, đúng định dạng SĐT. | 0987324456 |
| 3 | Hình thức giao nhận | Lựa chọn | Có | Giao tận nơi / Nhận tại cửa hàng. | Giao tận nơi |
| 4 | Địa chỉ giao hàng | Input text field | Có (khi giao tận nơi) | Tỉnh/Thành, Phường/Xã, địa chỉ chi tiết. | 123 Lê Lợi, … |
| 5 | Mã giảm giá | Input text field | Không | Mã còn hiệu lực và thỏa điều kiện áp dụng. | SALE10 |

#### d. Thanh toán đơn hàng

| | | | |
|---|---|---|---|
| **Mã Use case** | UC-C09 | **Tên Use case** | Thanh toán đơn hàng |
| **Tác nhân** | Khách hàng ||| 
| **Mô tả** | Khách hàng thanh toán cho đơn hàng đã tạo bằng hình thức chuyển khoản qua mã QR hoặc thanh toán tại cửa hàng. ||| 
| **Sự kiện kích hoạt** | Chọn phương thức thanh toán và xác nhận tại bước thanh toán. ||| 
| **Tiền điều kiện** | Đơn hàng đã được tạo và đang chờ thanh toán. ||| 

**Luồng sự kiện chính (Thành công):**

| STT | Tác nhân | Hệ thống |
|-----|----------|----------|
| 1 | Chọn phương thức thanh toán. | Hiển thị thông tin thanh toán tương ứng với phương thức đã chọn. |
| 2 | (Chuyển khoản QR) Quét mã QR và thực hiện chuyển khoản. | Khởi tạo phiên thanh toán có thời hạn và chờ xác nhận giao dịch. |
| 3 | | Khi giao dịch được xác nhận, cập nhật trạng thái đơn hàng sang "Đã thanh toán". |

**Luồng sự kiện thay thế:**

| STT | Hệ thống |
|-----|----------|
| 2a | Phiên thanh toán hết hạn trước khi giao dịch được xác nhận → hủy phiên và cho phép khởi tạo lại. |
| 1a | (Thanh toán tại cửa hàng) Ghi nhận đơn ở trạng thái chờ; thanh toán hoàn tất khi khách nhận hàng. |

**Hậu điều kiện:** Trạng thái thanh toán của đơn hàng được cập nhật chính xác.

#### e. Tra cứu bảo hành điện tử

| | | | |
|---|---|---|---|
| **Mã Use case** | UC-C11 | **Tên Use case** | Tra cứu bảo hành điện tử |
| **Tác nhân** | Khách hàng ||| 
| **Mô tả** | Khách hàng tra cứu thông tin và thời hạn bảo hành còn lại của thiết bị thông qua số Serial/IMEI. ||| 
| **Sự kiện kích hoạt** | Nhập số Serial/IMEI và kích "Tra cứu" trên trang bảo hành. ||| 
| **Tiền điều kiện** | Thiết bị có hồ sơ bảo hành trong hệ thống. ||| 

**Luồng sự kiện chính (Thành công):**

| STT | Tác nhân | Hệ thống |
|-----|----------|----------|
| 1 | Nhập số Serial/IMEI (hoặc mã đơn hàng / số điện thoại). | Đối chiếu thông tin với hồ sơ bảo hành. |
| 2 | Yêu cầu tra cứu. | Trả về thông tin thiết bị, ngày kích hoạt và thời hạn bảo hành còn lại. |

**Luồng sự kiện thay thế:**

| STT | Hệ thống |
|-----|----------|
| 1a | Không tìm thấy hồ sơ bảo hành tương ứng → thông báo không có dữ liệu. |
| 2a | Thiết bị đủ điều kiện kích hoạt → tự động kích hoạt bảo hành theo chính sách. |

**Hậu điều kiện:** Thông tin bảo hành của thiết bị được hiển thị cho khách hàng.

*Dữ liệu đầu vào gồm các trường sau:*

| STT | Trường dữ liệu | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|-----|----------------|-------|:--------:|------------------|-------|
| 1 | Số Serial/IMEI | Input text field | Có (hoặc thay bằng mã đơn/SĐT) | Đúng định dạng Serial hoặc IMEI (15 chữ số). | 356938035643809 |
| 2 | Mã đơn hàng | Input text field | Không | Mã đơn hợp lệ. | DH00123 |
| 3 | Số điện thoại | Input text field | Không | Ký tự số. | 0987324456 |

#### f. Gửi yêu cầu hỗ trợ (Ticket)

| | | | |
|---|---|---|---|
| **Mã Use case** | UC-C12 | **Tên Use case** | Gửi yêu cầu hỗ trợ (Ticket) |
| **Tác nhân** | Khách hàng ||| 
| **Mô tả** | Khách hàng gửi yêu cầu hỗ trợ kỹ thuật hoặc báo lỗi sản phẩm trực tuyến, kèm thông tin định danh thiết bị và mô tả sự cố. ||| 
| **Sự kiện kích hoạt** | Kích nút "Gửi yêu cầu hỗ trợ". ||| 
| **Tiền điều kiện** | Không bắt buộc đăng nhập (cho phép gửi ẩn danh) hoặc đã đăng nhập. ||| 

**Luồng sự kiện chính (Thành công):**

| STT | Tác nhân | Hệ thống |
|-----|----------|----------|
| 1 | Chọn loại yêu cầu, nhập mô tả sự cố và thông tin sản phẩm/Serial (nếu có). | Hiển thị biểu mẫu nhập liệu tương ứng. |
| 2 | Đính kèm tệp minh họa (tùy chọn). | Kiểm tra định dạng và dung lượng tệp đính kèm. |
| 3 | Gửi yêu cầu. | Tạo phiếu hỗ trợ ở trạng thái "Mở" và sinh mã phiếu. |

**Luồng sự kiện thay thế:**

| STT | Hệ thống |
|-----|----------|
| 3a | Mô tả quá ngắn (dưới mức tối thiểu) → thông báo yêu cầu bổ sung nội dung. |

**Hậu điều kiện:** Phiếu hỗ trợ được tạo và sẵn sàng cho kỹ thuật viên tiếp nhận.

---

### 3.3.3. Use-case dành cho Kỹ thuật viên

#### a. Tiếp nhận yêu cầu bảo hành

| | | | |
|---|---|---|---|
| **Mã Use case** | UC-T01 | **Tên Use case** | Tiếp nhận yêu cầu bảo hành |
| **Tác nhân** | Kỹ thuật viên ||| 
| **Mô tả** | Kỹ thuật viên tiếp nhận thiết bị/yêu cầu bảo hành, lập hồ sơ sửa chữa gắn với thiết bị cụ thể. ||| 
| **Sự kiện kích hoạt** | Kích "Tiếp nhận bảo hành" trên giao diện kỹ thuật. ||| 
| **Tiền điều kiện** | Kỹ thuật viên đã đăng nhập với vai trò Kỹ thuật viên. ||| 

**Luồng sự kiện chính (Thành công):**

| STT | Tác nhân | Hệ thống |
|-----|----------|----------|
| 1 | Nhập thông tin nguồn yêu cầu (phiếu bảo hành, ticket hoặc Serial/IMEI). | Truy xuất thông tin thiết bị tương ứng. |
| 2 | Xác nhận thông tin khách hàng và mô tả lỗi. | Tạo hồ sơ sửa chữa (Repair Case) ở trạng thái "Tiếp nhận" và sinh mã hồ sơ. |
| 3 | | Gửi thông báo tới khách hàng về việc đã tiếp nhận thiết bị. |

**Luồng sự kiện thay thế:**

| STT | Hệ thống |
|-----|----------|
| 1a | Không tìm thấy thiết bị theo thông tin cung cấp → yêu cầu nhập lại hoặc tạo mới. |

**Hậu điều kiện:** Hồ sơ sửa chữa được tạo và liên kết với thiết bị, phiếu bảo hành/ticket liên quan.

#### b. Cập nhật tình trạng sửa chữa

| | | | |
|---|---|---|---|
| **Mã Use case** | UC-T02 | **Tên Use case** | Cập nhật tình trạng sửa chữa |
| **Tác nhân** | Kỹ thuật viên ||| 
| **Mô tả** | Kỹ thuật viên cập nhật tiến độ và trạng thái sửa chữa của thiết bị theo từng giai đoạn. ||| 
| **Sự kiện kích hoạt** | Kích "Cập nhật trạng thái" trên hồ sơ sửa chữa. ||| 
| **Tiền điều kiện** | Hồ sơ sửa chữa đang tồn tại và do kỹ thuật viên phụ trách. ||| 

**Luồng sự kiện chính (Thành công):**

| STT | Tác nhân | Hệ thống |
|-----|----------|----------|
| 1 | Chọn trạng thái mới (chẩn đoán, chờ linh kiện, sửa chữa, kiểm thử, hoàn tất…) và ghi chú. | Kiểm tra tính hợp lệ của chuyển trạng thái. |
| 2 | Lưu cập nhật. | Ghi nhận cập nhật vào lịch sử; đồng bộ trạng thái sang phiếu bảo hành, ticket và đơn vị thiết bị trong kho. |
| 3 | | Gửi thông báo tiến độ tới khách hàng. |

**Luồng sự kiện thay thế:**

| STT | Hệ thống |
|-----|----------|
| 1a | Chuyển trạng thái không hợp lệ → thông báo và giữ nguyên trạng thái hiện tại. |

**Hậu điều kiện:** Trạng thái sửa chữa được cập nhật và đồng bộ trên toàn hệ thống.

---

### 3.3.4. Use-case dành cho Quản trị viên kho

#### a. Nhập hàng theo lô và quản lý Serial/IMEI

| | | | |
|---|---|---|---|
| **Mã Use case** | UC-W01 | **Tên Use case** | Nhập hàng theo lô và quản lý Serial/IMEI |
| **Tác nhân** | Quản trị viên kho ||| 
| **Mô tả** | Quản trị viên kho tạo phiếu nhập hàng theo lô; với sản phẩm quản lý theo từng thiết bị, hệ thống định danh từng đơn vị bằng Serial/IMEI. ||| 
| **Sự kiện kích hoạt** | Kích "Tạo phiếu nhập kho". ||| 
| **Tiền điều kiện** | Quản trị viên kho đã đăng nhập với vai trò tương ứng. ||| 

**Luồng sự kiện chính (Thành công):**

| STT | Tác nhân | Hệ thống |
|-----|----------|----------|
| 1 | Khai báo nhà cung cấp, kho nhận và danh sách hàng hóa nhập. | Kiểm tra dữ liệu hợp lệ. |
| 2 | (Sản phẩm theo serial) Nhập/định danh Serial/IMEI cho từng đơn vị. | Kiểm tra hợp lệ Serial/IMEI (IMEI gồm 15 chữ số, đạt kiểm tra Luhn); sinh đơn vị tồn kho (Stock Item). |
| 3 | Xác nhận phiếu nhập. | Lưu phiếu nhập, tính lại tồn kho và ghi nhận biến động kho (Stock Movement). |

**Luồng sự kiện thay thế:**

| STT | Hệ thống |
|-----|----------|
| 2a | Serial/IMEI không hợp lệ hoặc trùng lặp → thông báo lỗi, không tạo đơn vị tồn kho tương ứng. |
| 2b | Sản phẩm không quản lý theo serial → cập nhật số lượng tồn theo phương thức thông thường. |

**Hậu điều kiện:** Hàng hóa được nhập kho; tồn kho và Serial/IMEI từng thiết bị được cập nhật.

*Dữ liệu đầu vào gồm các trường sau:*

| STT | Trường dữ liệu | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|-----|----------------|-------|:--------:|------------------|-------|
| 1 | Nhà cung cấp | Dropdown | Có | Tồn tại trong hệ thống. | Công ty ABC |
| 2 | Kho nhận | Dropdown | Có | Tồn tại trong hệ thống. | Kho Hà Nội |
| 3 | Sản phẩm | Dropdown/Tìm kiếm | Có | Tồn tại trong hệ thống. | iPhone 15 |
| 4 | Số lượng | Input number | Có | Số nguyên dương. | 10 |
| 5 | Serial/IMEI | Input text field | Có (với SP theo serial) | Hợp lệ, không trùng; IMEI gồm 15 chữ số. | 356938035643809 |
| 6 | Giá nhập | Input number | Có | Số không âm. | 18000000 |

#### b. Xử lý hàng đổi trả

| | | | |
|---|---|---|---|
| **Mã Use case** | UC-W04 | **Tên Use case** | Xử lý hàng đổi trả |
| **Tác nhân** | Quản trị viên kho ||| 
| **Mô tả** | Quản trị viên kho tiếp nhận, xét duyệt và nhập lại kho đối với hàng đổi trả, gắn với từng thiết bị theo Serial/IMEI. ||| 
| **Sự kiện kích hoạt** | Kích "Tạo phiếu đổi trả" hoặc tiếp nhận yêu cầu đổi trả. ||| 
| **Tiền điều kiện** | Tồn tại đơn hàng/thiết bị liên quan đến yêu cầu đổi trả. ||| 

**Luồng sự kiện chính (Thành công):**

| STT | Tác nhân | Hệ thống |
|-----|----------|----------|
| 1 | Nhập thông tin đổi trả (Serial/IMEI, lý do, tình trạng hàng). | Truy xuất thông tin đơn hàng và thiết bị; tạo phiếu đổi trả ở trạng thái "Chờ duyệt". |
| 2 | Xét duyệt phiếu đổi trả. | Cập nhật trạng thái Duyệt/Từ chối. |
| 3 | Thực hiện nhập lại kho. | Nhập lại tồn (InStock) hoặc đánh dấu hàng lỗi (Damaged) tùy tình trạng; ghi nhận biến động kho. |

**Luồng sự kiện thay thế:**

| STT | Hệ thống |
|-----|----------|
| 2a | Phiếu bị từ chối → kết thúc quy trình, không thay đổi tồn kho. |

**Hậu điều kiện:** Phiếu đổi trả được xử lý; trạng thái thiết bị và tồn kho được cập nhật tương ứng.

---

### 3.3.5. Use-case dành cho Quản trị viên hệ thống

#### a. Cấu hình bộ thông số động

| | | | |
|---|---|---|---|
| **Mã Use case** | UC-A02 | **Tên Use case** | Cấu hình bộ thông số động |
| **Tác nhân** | Quản trị viên hệ thống ||| 
| **Mô tả** | Quản trị viên định nghĩa bộ thông số kỹ thuật riêng cho từng nhóm sản phẩm, bao gồm tên thông số, kiểu dữ liệu và các giá trị tùy chọn. ||| 
| **Sự kiện kích hoạt** | Kích "Cấu hình thông số" trong quản lý danh mục. ||| 
| **Tiền điều kiện** | Quản trị viên đã đăng nhập với quyền Admin. ||| 

**Luồng sự kiện chính (Thành công):**

| STT | Tác nhân | Hệ thống |
|-----|----------|----------|
| 1 | Chọn nhóm sản phẩm và thêm/sửa định nghĩa thông số (tên, mã, kiểu dữ liệu, có dùng để so sánh/làm trục biến thể hay không). | Kiểm tra dữ liệu hợp lệ và lưu định nghĩa thông số. |
| 2 | Thêm/sửa các giá trị tùy chọn cho thông số (nếu có). | Lưu danh sách giá trị tùy chọn. |
| 3 | Lưu cấu hình. | Áp dụng bộ thông số cho nhóm sản phẩm tương ứng. |

**Luồng sự kiện thay thế:**

| STT | Hệ thống |
|-----|----------|
| 1a | Xóa thông số đang được sử dụng bởi sản phẩm → vô hiệu hóa mềm thay vì xóa cứng. |

**Hậu điều kiện:** Bộ thông số động của nhóm sản phẩm được cập nhật.

#### b. Quản lý tài khoản người dùng

| | | | |
|---|---|---|---|
| **Mã Use case** | UC-A07 | **Tên Use case** | Quản lý tài khoản người dùng |
| **Tác nhân** | Quản trị viên hệ thống ||| 
| **Mô tả** | Quản trị viên tạo mới, chỉnh sửa, khóa/mở khóa và phân quyền tài khoản người dùng. ||| 
| **Sự kiện kích hoạt** | Kích mục "Quản lý người dùng" trên bảng điều khiển. ||| 
| **Tiền điều kiện** | Quản trị viên đã đăng nhập với quyền Admin. ||| 

**Luồng sự kiện chính (Thành công):**

| STT | Tác nhân | Hệ thống |
|-----|----------|----------|
| 1 | Mở mục Quản lý người dùng. | Hiển thị danh sách tài khoản kèm thông tin (tên, email, vai trò, trạng thái). |
| 2a | Tạo tài khoản mới, nhập thông tin và chọn vai trò. | Kiểm tra dữ liệu, tạo tài khoản. |
| 2b | Khóa/Mở khóa tài khoản. | Cập nhật trạng thái tài khoản và ghi nhật ký. |
| 2c | Thay đổi vai trò tài khoản. | Cập nhật phân quyền tức thì. |

**Luồng sự kiện thay thế:**

| STT | Hệ thống |
|-----|----------|
| 2a.1 | Email đã tồn tại → thông báo lỗi, không tạo tài khoản. |
| 2b.1 | Không cho phép khóa tài khoản quản trị viên cuối cùng trong hệ thống. |

**Hậu điều kiện:** Tài khoản được tạo/cập nhật/khóa thành công; thay đổi có hiệu lực tức thì.

*Dữ liệu đầu vào gồm các trường sau:*

| STT | Trường dữ liệu | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|-----|----------------|-------|:--------:|------------------|-------|
| 1 | Họ tên | Input text field | Có | Tối đa 100 ký tự. | Nguyễn Văn A |
| 2 | Email | Input email field | Có | Đúng định dạng email, chưa tồn tại. | nva@email.com |
| 3 | Vai trò | Dropdown | Có | Khách hàng / Kỹ thuật viên / QTV kho / Admin. | Kỹ thuật viên |

#### c. Quản lý cảnh báo hàng tồn kho lâu ngày

| | | | |
|---|---|---|---|
| **Mã Use case** | UC-A06 | **Tên Use case** | Quản lý cảnh báo hàng tồn kho lâu ngày |
| **Tác nhân** | Quản trị viên hệ thống ||| 
| **Mô tả** | Quản trị viên thống kê và theo dõi các mặt hàng tồn kho vượt ngưỡng thời gian quy định để có phương án xử lý (xả hàng, khuyến mãi). ||| 
| **Sự kiện kích hoạt** | Mở báo cáo "Hàng tồn lâu ngày" và thiết lập ngưỡng số ngày. ||| 
| **Tiền điều kiện** | Quản trị viên đã đăng nhập với quyền Admin. ||| 

**Luồng sự kiện chính (Thành công):**

| STT | Tác nhân | Hệ thống |
|-----|----------|----------|
| 1 | Thiết lập ngưỡng số ngày tồn kho và các tiêu chí lọc (danh mục, nhà cung cấp, kho). | Truy vấn các đơn vị tồn kho có thời gian lưu kho vượt ngưỡng. |
| 2 | Xem kết quả thống kê. | Hiển thị danh sách kèm số ngày tồn, giá vốn và giá trị tồn ước tính. |

**Luồng sự kiện thay thế:**

| STT | Hệ thống |
|-----|----------|
| 1a | Không có hàng tồn vượt ngưỡng → hiển thị thông báo không có dữ liệu phù hợp. |

**Hậu điều kiện:** Danh sách hàng tồn kho lâu ngày được hiển thị phục vụ ra quyết định.

---

> **Ghi chú phạm vi:**
> - Hai use case **UC-C08 (Tính và chọn trả góp)** và **UC-A05 (Quản lý đối tác vận chuyển)** thuộc lộ trình phát triển ở phiên bản kế tiếp; được liệt kê trong biểu đồ phân rã (mục 3.2) nhưng chưa đặc tả chi tiết trong phiên bản 1.0.
> - Hai use case **UC-C14 (Gửi yêu cầu bảo hành)** và **UC-A09 (Quản lý gợi ý sản phẩm mua kèm)** được **bổ sung theo kết quả rà soát SRS** nhằm phủ đủ các yêu cầu "theo dõi lịch sử bảo hành" và "quản lý linh kiện đi kèm". Đặc tả chi tiết của hai use case này được trình bày trong tài liệu *Đặc tả chi tiết toàn bộ Use Case*.
> - Đặc tả chi tiết đầy đủ của tất cả use case (gồm cả UC-C14, UC-A09) xem tại tài liệu *Đặc tả chi tiết toàn bộ Use Case* (35 use case).
