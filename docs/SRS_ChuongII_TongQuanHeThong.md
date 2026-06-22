# II. TỔNG QUAN HỆ THỐNG

## 2.1. Phát biểu bài toán

Thiết bị công nghệ là nhóm hàng hóa có **giá trị cao** nhưng đồng thời có **vòng đời sản phẩm ngắn**, liên tục được thay thế bởi các thế hệ mới với cấu hình và công nghệ thay đổi nhanh chóng. Đặc thù này tạo ra những thách thức riêng cho cả người mua lẫn doanh nghiệp bán lẻ.

Về phía người mua, hành vi tiêu dùng trong ngành công nghệ có tính cân nhắc cao: khách hàng thường có thói quen so sánh cấu hình và giá cả giữa nhiều model trước khi ra quyết định, đồng thời đặc biệt quan tâm tới các dịch vụ đi kèm như bảo hành, trả góp và hỗ trợ kỹ thuật. Tuy nhiên, mỗi nhóm sản phẩm (điện thoại, laptop, máy tính để bàn) lại sở hữu một bộ thông số kỹ thuật khác biệt, khiến việc tra cứu và đối chiếu trở nên phức tạp nếu không có công cụ hỗ trợ phù hợp.

Về phía doanh nghiệp, việc kinh doanh thiết bị công nghệ đòi hỏi mức độ kiểm soát chặt chẽ tới **từng đơn vị thiết bị cụ thể**. Mỗi máy cần được định danh và truy vết bằng số Serial/IMEI xuyên suốt vòng đời, từ khi nhập kho đến khi bán ra và phục vụ bảo hành, đổi trả. Các phương thức quản lý truyền thống — sử dụng thẻ bảo hành giấy, theo dõi tồn kho theo số lượng tổng — bộc lộ nhiều hạn chế: dễ thất lạc, khó xác thực, không đồng bộ tức thời, dẫn tới tình trạng sai lệch tồn kho và khó khăn trong xử lý hậu mãi.

Xuất phát từ thực trạng đó, hệ thống **Website Kinh doanh Thiết bị Công nghệ (Tech Gadget & Electronics Store)** được xây dựng nhằm cung cấp một giải pháp thương mại điện tử chuyên biệt cho ngành hàng công nghệ. Hệ thống lấy bốn yếu tố làm khác biệt cốt lõi: (i) quản lý thông số kỹ thuật chuyên sâu và cấu hình động theo từng nhóm hàng; (ii) công cụ so sánh sản phẩm trực quan; (iii) số hóa bảo hành thông qua Serial/IMEI; và (iv) kiểm soát tồn kho tới từng đơn vị thiết bị. Qua đó, hệ thống hướng tới việc nâng cao trải nghiệm mua sắm minh bạch cho khách hàng và tối ưu hóa năng lực vận hành cho doanh nghiệp.

## 2.2. Mục tiêu hệ thống

Hệ thống được xây dựng với tầm nhìn trở thành một điểm đến tin cậy cho cộng đồng người dùng công nghệ, nơi cung cấp thông tin minh bạch và dịch vụ toàn diện. Để hiện thực hóa tầm nhìn này, hệ thống đặt ra các mục tiêu cụ thể sau:

| STT | Mục tiêu | Mô tả chi tiết |
|-----|----------|----------------|
| 1 | Chuyên sâu hóa dữ liệu sản phẩm | Xây dựng cơ chế quản lý thông số kỹ thuật động, cho phép mỗi nhóm sản phẩm (điện thoại, laptop, PC…) có bộ thông số riêng, bảo đảm dữ liệu cấu hình chi tiết và chuẩn hóa. |
| 2 | Hỗ trợ ra quyết định mua sắm | Cung cấp công cụ tìm kiếm, lọc theo thông số kỹ thuật và so sánh trực quan nhiều sản phẩm cùng lúc, giúp người dùng lựa chọn thiết bị phù hợp với nhu cầu (Gaming, Văn phòng, Đồ họa). |
| 3 | Số hóa quản lý bảo hành | Quản lý bảo hành điện tử dựa trên số Serial/IMEI, cho phép tra cứu trực tuyến thời hạn bảo hành và loại bỏ hoàn toàn thẻ bảo hành giấy. |
| 4 | Kiểm soát tồn kho tới từng thiết bị | Quản lý nhập hàng theo lô và định danh từng máy bằng Serial/IMEI, truy vết trạng thái thiết bị xuyên suốt vòng đời và đồng bộ tồn kho tức thời. |
| 5 | Hoàn thiện quy trình hậu mãi | Cung cấp hệ thống tiếp nhận và xử lý yêu cầu hỗ trợ (Ticket), quy trình tiếp nhận và cập nhật tình trạng sửa chữa dành cho kỹ thuật viên. |
| 6 | Tối ưu vận hành và quản trị | Hỗ trợ quản trị danh mục kỹ thuật, thiết lập giá bán, cảnh báo hàng tồn kho lâu ngày và cung cấp báo cáo phục vụ ra quyết định kinh doanh. |

## 2.3. Phạm vi hệ thống

Hệ thống được xây dựng dưới dạng **ứng dụng web** (hỗ trợ đầy đủ trên trình duyệt di động), phục vụ hoạt động kinh doanh thiết bị công nghệ trực tuyến. Phạm vi hệ thống bao phủ các khía cạnh nghiệp vụ sau:

- **Quản lý sản phẩm và thông số kỹ thuật:** quản lý danh mục, sản phẩm, biến thể (variant) và bộ thông số kỹ thuật động theo từng nhóm hàng; cung cấp chức năng tìm kiếm, lọc, xem chi tiết, so sánh sản phẩm và gợi ý sản phẩm mua kèm.
- **Giao dịch và thanh toán:** quản lý giỏ hàng, đặt hàng, áp dụng mã giảm giá, thanh toán và theo dõi đơn hàng.
- **Bảo hành và hậu mãi:** tra cứu bảo hành điện tử theo Serial/IMEI, tiếp nhận và xử lý phiếu hỗ trợ kỹ thuật, quản lý quy trình sửa chữa.
- **Quản trị kho:** nhập hàng theo lô, quản lý Serial/IMEI từng thiết bị, theo dõi tồn kho, xử lý đổi trả và cảnh báo hàng tồn lâu ngày.
- **Quản trị hệ thống:** quản lý người dùng và phân quyền, quản lý danh mục kỹ thuật, thiết lập giá bán, cấu hình hệ thống và theo dõi báo cáo vận hành.

Trong phạm vi **phiên bản 1.0**, hệ thống hỗ trợ thanh toán qua hình thức **chuyển khoản ngân hàng bằng mã QR** và **thanh toán tại cửa hàng**. Các chức năng **trả góp**, **quản lý đối tác vận chuyển** và **tích hợp cổng thanh toán thẻ/ví điện tử thực tế** được xác định là mục tiêu nghiệp vụ thuộc lộ trình phát triển ở các phiên bản kế tiếp. Hệ thống không bao gồm phần thiết kế kỹ thuật chi tiết (kiến trúc cơ sở dữ liệu, đặc tả API, cấu hình triển khai).

## 2.4. Người sử dụng hệ thống

Hệ thống phục vụ bốn nhóm tác nhân chính, được phân tách rõ ràng về vai trò và quyền hạn nhằm bảo đảm an toàn và hiệu quả vận hành.

| STT | Người sử dụng | Vai trò và chức năng chính |
|-----|---------------|----------------------------|
| 1 | **Khách hàng (Customer)** | Tra cứu thông số và xem chi tiết sản phẩm; tìm kiếm, lọc và so sánh sản phẩm; xem gợi ý sản phẩm mua kèm; quản lý giỏ hàng và đặt hàng; lựa chọn phương thức thanh toán; theo dõi đơn hàng; tra cứu bảo hành điện tử theo Serial/IMEI; gửi và theo dõi phiếu hỗ trợ kỹ thuật. |
| 2 | **Kỹ thuật viên (Technical Staff)** | Tiếp nhận yêu cầu bảo hành/sửa chữa; cập nhật tình trạng và tiến độ sửa chữa của từng thiết bị; xử lý phiếu hỗ trợ kỹ thuật của khách hàng; tư vấn, hỗ trợ kỹ thuật. |
| 3 | **Quản trị viên kho (Stock Manager)** | Quản lý nhập hàng theo lô; gán và quản lý Serial/IMEI cho từng thiết bị; theo dõi tồn kho theo từng đơn vị; xử lý nghiệp vụ đổi trả hàng hóa. |
| 4 | **Quản trị viên hệ thống (Admin)** | Quản lý danh mục kỹ thuật và cấu hình bộ thông số động; quản lý sản phẩm, thiết lập giá bán và cấu hình gợi ý sản phẩm mua kèm; quản lý tài khoản người dùng và phân quyền; quản lý cảnh báo hàng tồn kho lâu ngày; theo dõi báo cáo tài chính và kinh doanh. |

Bên cạnh bốn tác nhân chính nêu trên, hệ thống còn tương tác với một số **tác nhân phụ và tác nhân ngoài**:

| STT | Tác nhân phụ / ngoài | Vai trò trong hệ thống |
|-----|----------------------|------------------------|
| 5 | **Khách vãng lai (Guest)** | Người dùng chưa đăng nhập; thực hiện các thao tác công khai: tìm kiếm, lọc, xem chi tiết, so sánh sản phẩm, sử dụng giỏ hàng, tra cứu bảo hành và gửi phiếu hỗ trợ. |
| 6 | **Đơn vị tài chính** | Đối tác ngoài tiếp nhận và phê duyệt hồ sơ trả góp (liên quan chức năng trả góp). |
| 7 | **Cổng thanh toán / Ngân hàng** | Hệ thống ngoài xử lý và xác nhận giao dịch thanh toán (chuyển khoản qua mã QR). |
| 8 | **Đối tác vận chuyển** | Đơn vị ngoài thực hiện giao nhận hàng hóa tới khách hàng. |

## 2.5. Mô hình phân rã chức năng hệ thống

Hệ thống được phân rã thành năm phân hệ chức năng chính, mỗi phân hệ đảm nhiệm một nhóm nghiệp vụ độc lập nhưng có quan hệ tương tác chặt chẽ với nhau.

> *Hình 2.1: Sơ đồ phân rã chức năng hệ thống Tech Gadget & Electronics Store*

```
                       TECH GADGET & ELECTRONICS STORE
                                     │
   ┌───────────────┬────────────────┼────────────────┬───────────────────┐
   │               │                │                │                   │
[1] QUẢN LÝ     [2] GIAO DỊCH    [3] BẢO HÀNH     [4] QUẢN TRỊ        [5] QUẢN TRỊ
   SẢN PHẨM                       & HẬU MÃI          KHO                HỆ THỐNG
   │               │                │                │                   │
- Tìm kiếm SP    - Giỏ hàng       - Tra cứu bảo     - Nhập hàng theo    - Quản lý danh mục
- Lọc theo       - Đặt hàng         hành điện tử      lô                  kỹ thuật
  thông số       - Áp mã giảm       (Serial/IMEI)   - Quản lý IMEI/     - Cấu hình thông
- Xem chi tiết     giá            - Gửi & theo dõi    Serial              số động
  & thông số     - Thanh toán       Ticket          - Theo dõi tồn kho  - Quản lý sản phẩm
- So sánh SP     - Theo dõi       - Tiếp nhận bảo   - Xử lý đổi trả     - Thiết lập giá bán
- Gợi ý mua        đơn hàng         hành            - Cảnh báo tồn      - Quản lý tài khoản
  kèm                             - Cập nhật sửa      kho lâu ngày      - Báo cáo vận hành
                                    chữa
```

## 2.6. Biểu đồ hoạt động của hệ thống

### 2.6.1. Biểu đồ hoạt động chung của hệ thống

> *Hình 2.2: Biểu đồ hoạt động chung của hệ thống*

Hình 2.2 mô tả luồng hoạt động chung của hệ thống. Người dùng truy cập website và thực hiện đăng nhập bằng tài khoản đã có. Hệ thống kiểm tra thông tin xác thực; nếu hợp lệ, hệ thống cấp phát phiên làm việc và hiển thị giao diện tương ứng với vai trò của người dùng (Khách hàng, Kỹ thuật viên, Quản trị viên kho hoặc Quản trị viên hệ thống). Trường hợp thông tin không hợp lệ, hệ thống hiển thị thông báo lỗi và yêu cầu nhập lại. Sau khi đăng nhập thành công, người dùng thực hiện các nghiệp vụ phù hợp với phân quyền; hệ thống ghi nhận và đồng bộ dữ liệu tức thời trước khi người dùng kết thúc phiên làm việc bằng thao tác đăng xuất.

### 2.6.2. Biểu đồ hoạt động đặt hàng và thanh toán

> *Hình 2.3: Biểu đồ hoạt động đặt hàng và thanh toán*

Hình 2.3 mô tả luồng đặt hàng và thanh toán của khách hàng. Khách hàng lựa chọn sản phẩm, thêm vào giỏ hàng và tiến hành đặt hàng. Tại bước xác nhận đơn, khách hàng nhập thông tin giao nhận (chọn hình thức giao hàng tận nơi hoặc nhận tại cửa hàng), áp dụng mã giảm giá (nếu có) và lựa chọn phương thức thanh toán. Hệ thống kiểm tra tính sẵn có của hàng hóa và khóa tồn kho tương ứng nhằm bảo đảm tính nhất quán. Tại điểm quyết định "Phương thức thanh toán?", luồng tách thành hai nhánh: nếu chọn thanh toán chuyển khoản qua mã QR, hệ thống khởi tạo phiên thanh toán có thời hạn và chờ xác nhận giao dịch trước khi cập nhật trạng thái đơn hàng sang "Đã thanh toán"; nếu chọn thanh toán tại cửa hàng, hệ thống ghi nhận đơn ở trạng thái chờ và hoàn tất thanh toán khi khách nhận hàng. Sau khi đơn hàng được xác nhận, hệ thống ghi nhận tiến trình vào dòng thời gian đơn hàng để khách hàng theo dõi.

### 2.6.3. Biểu đồ hoạt động bảo hành và sửa chữa

> *Hình 2.4: Biểu đồ hoạt động bảo hành và sửa chữa*

Hình 2.4 mô tả luồng bảo hành và sửa chữa. Khách hàng tra cứu thông tin bảo hành bằng cách nhập số Serial/IMEI; hệ thống đối chiếu và hiển thị thời hạn bảo hành còn lại. Khi phát sinh sự cố, khách hàng gửi phiếu yêu cầu hỗ trợ (Ticket) kèm mô tả lỗi và thông tin định danh thiết bị. Kỹ thuật viên tiếp nhận phiếu, lập hồ sơ sửa chữa (Repair Case) gắn với thiết bị cụ thể và lần lượt cập nhật tình trạng theo các giai đoạn (tiếp nhận, chẩn đoán, chờ linh kiện/chờ phê duyệt, sửa chữa, kiểm thử, hoàn tất, bàn giao). Mỗi lần cập nhật, hệ thống đồng bộ trạng thái tương ứng giữa hồ sơ sửa chữa, phiếu hỗ trợ và trạng thái của đơn vị thiết bị trong kho, đồng thời gửi thông báo tới khách hàng. Quy trình kết thúc khi thiết bị được bàn giao cho khách hàng.

### 2.6.4. Biểu đồ hoạt động quản lý kho

> *Hình 2.5: Biểu đồ hoạt động quản lý kho và Serial/IMEI*

Hình 2.5 mô tả luồng quản lý kho của Quản trị viên kho. Quản trị viên kho tạo phiếu nhập hàng theo lô, khai báo nhà cung cấp, kho nhận và danh sách hàng hóa. Tại điểm quyết định "Sản phẩm quản lý theo Serial/IMEI?", luồng tách thành hai nhánh: với sản phẩm quản lý theo từng thiết bị, hệ thống yêu cầu nhập/định danh Serial/IMEI cho từng đơn vị (kèm kiểm tra hợp lệ) và sinh đơn vị tồn kho (Stock Item) tương ứng; với sản phẩm không quản lý theo serial, hệ thống cập nhật số lượng tồn theo phương thức thông thường. Sau khi nhập kho, hệ thống tính lại tồn kho và ghi nhận biến động (Stock Movement). Trong quá trình vận hành, hệ thống tiếp tục theo dõi trạng thái của từng đơn vị thiết bị (tồn kho, đã bán, bảo hành, đổi trả…), xử lý nghiệp vụ đổi trả và cảnh báo các mặt hàng tồn kho vượt ngưỡng thời gian quy định.

## 2.7. Biểu đồ hoạt động quản trị hệ thống

> *Hình 2.6: Biểu đồ hoạt động quản trị hệ thống*

Hình 2.6 mô tả luồng quản trị hệ thống của Quản trị viên (Admin). Sau khi đăng nhập với quyền quản trị, hệ thống hiển thị bảng điều khiển (Dashboard) cùng các chỉ số vận hành tổng quan. Tại điểm quyết định "Loại thao tác quản trị?", luồng tách thành các nhánh chính: (i) quản lý danh mục kỹ thuật và cấu hình bộ thông số động theo nhóm sản phẩm; (ii) quản lý sản phẩm và thiết lập giá bán; (iii) quản lý tài khoản người dùng và phân quyền (tạo mới, khóa/mở khóa, thay đổi vai trò); và (iv) theo dõi báo cáo vận hành cùng cảnh báo hàng tồn kho lâu ngày. Sau mỗi thao tác, hệ thống kiểm tra tính hợp lệ của dữ liệu, lưu thay đổi và cập nhật giao diện. Nếu còn thao tác tiếp theo, vòng lặp quay lại điểm quyết định; nếu không, Quản trị viên kết thúc phiên làm việc.
