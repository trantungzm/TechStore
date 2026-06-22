# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM
# (SOFTWARE REQUIREMENTS SPECIFICATION – SRS)

## WEBSITE KINH DOANH THIẾT BỊ CÔNG NGHỆ
### (Tech Gadget & Electronics Store)

| | |
|---|---|
| **Phiên bản** | 1.0 |
| **Môn học** | Công nghệ phần mềm |
| **Giai đoạn** | Bước 1 – Requirements Engineering |
| **Trạng thái** | Draft |

---

# MỤC LỤC

**I. GIỚI THIỆU**
1.1. Mục đích tài liệu
1.2. Phạm vi tài liệu
1.3. Định nghĩa thuật ngữ và viết tắt
1.4. Vai trò và trách nhiệm
1.5. Mô tả tài liệu

**II. TỔNG QUAN HỆ THỐNG**
2.1. Phát biểu bài toán
2.2. Mục tiêu hệ thống
2.3. Phạm vi hệ thống
2.4. Người sử dụng hệ thống (Actor)
2.5. Mô hình phân rã chức năng và module nghiệp vụ
2.6. Biểu đồ hoạt động của hệ thống
&nbsp;&nbsp;&nbsp;&nbsp;2.6.1. Biểu đồ hoạt động chung
&nbsp;&nbsp;&nbsp;&nbsp;2.6.2. Biểu đồ hoạt động đặt hàng và thanh toán
&nbsp;&nbsp;&nbsp;&nbsp;2.6.3. Biểu đồ hoạt động bảo hành và sửa chữa
&nbsp;&nbsp;&nbsp;&nbsp;2.6.4. Biểu đồ hoạt động quản lý kho
2.7. Biểu đồ hoạt động quản trị hệ thống

**III. ĐẶC TẢ YÊU CẦU CHỨC NĂNG**
3.1. Biểu đồ Use-case tổng quan
3.2. Biểu đồ Use-case phân rã
&nbsp;&nbsp;&nbsp;&nbsp;3.2.1. Tác nhân Khách hàng
&nbsp;&nbsp;&nbsp;&nbsp;3.2.2. Tác nhân Kỹ thuật viên
&nbsp;&nbsp;&nbsp;&nbsp;3.2.3. Tác nhân Quản trị viên kho
&nbsp;&nbsp;&nbsp;&nbsp;3.2.4. Tác nhân Quản trị viên hệ thống
3.3. Đặc tả các Use-case
&nbsp;&nbsp;&nbsp;&nbsp;3.3.1. Use-case dùng chung
&nbsp;&nbsp;&nbsp;&nbsp;3.3.2. Use-case Khách hàng
&nbsp;&nbsp;&nbsp;&nbsp;3.3.3. Use-case Kỹ thuật viên
&nbsp;&nbsp;&nbsp;&nbsp;3.3.4. Use-case Quản trị viên kho
&nbsp;&nbsp;&nbsp;&nbsp;3.3.5. Use-case Quản trị viên hệ thống

**IV. YÊU CẦU PHI CHỨC NĂNG**
4.1. Yêu cầu về độ chính xác dữ liệu
4.2. Yêu cầu về bảo mật
4.3. Yêu cầu về hiệu năng
4.4. Yêu cầu về tính tin cậy
4.5. Yêu cầu về tính tương thích
4.6. Một số yêu cầu phi chức năng bổ trợ

---

# I. GIỚI THIỆU

## 1.1. Mục đích tài liệu

Tài liệu này được xây dựng dựa trên quá trình khảo sát, phân tích và tổng hợp yêu cầu thực tế của dự án **Website Kinh doanh Thiết bị Công nghệ (Tech Gadget & Electronics Store)**. Tài liệu đóng vai trò là cơ sở chính thức, thống nhất cho toàn bộ vòng đời phát triển phần mềm, bao gồm các hoạt động thiết kế, lập trình, kiểm thử, bàn giao và bảo trì hệ thống.

Nội dung tài liệu đặc tả đầy đủ các yêu cầu chức năng và yêu cầu phi chức năng của hệ thống. Cụ thể, hệ thống hướng tới việc cung cấp một nền tảng thương mại điện tử chuyên biệt cho ngành hàng công nghệ với các năng lực cốt lõi: quản lý thông số kỹ thuật động theo từng nhóm sản phẩm, công cụ so sánh sản phẩm, quản lý bảo hành điện tử thông qua số Serial/IMEI, kiểm soát tồn kho theo từng đơn vị thiết bị, cùng các phân hệ giao dịch và hậu mãi đi kèm.

Tài liệu nhằm bảo đảm sự thống nhất về yêu cầu giữa các bên liên quan, bao gồm nhóm phân tích, nhóm phát triển, nhóm kiểm thử và phía khách hàng. Mọi thay đổi về yêu cầu trong quá trình triển khai đều phải được phản ánh vào tài liệu này thông qua quy trình quản lý thay đổi chính thức, nhằm duy trì tính nhất quán và khả năng truy vết của yêu cầu.

## 1.2. Phạm vi tài liệu

Tài liệu áp dụng cho hệ thống **Tech Gadget & Electronics Store** – một nền tảng web (hỗ trợ đầy đủ trên trình duyệt di động) phục vụ hoạt động kinh doanh thiết bị công nghệ trực tuyến. Hệ thống được xây dựng để phục vụ **bốn nhóm người dùng** chính:

- **Khách hàng (Customer):** tra cứu thông số, so sánh sản phẩm, đặt hàng, lựa chọn phương thức thanh toán và theo dõi lịch sử bảo hành.
- **Kỹ thuật viên (Technical Staff):** tiếp nhận yêu cầu bảo hành, cập nhật tình trạng sửa chữa và hỗ trợ kỹ thuật.
- **Quản trị viên kho (Stock Manager):** quản lý nhập hàng theo lô, quản lý Serial/IMEI từng thiết bị và xử lý đổi trả.
- **Quản trị viên hệ thống (Admin):** quản lý danh mục kỹ thuật, thiết lập giá bán, quản lý vận hành và theo dõi báo cáo.

Phạm vi của tài liệu bao phủ các phân hệ nghiệp vụ trọng tâm: (i) quản lý sản phẩm và thông số kỹ thuật chuyên sâu; (ii) giao dịch và thanh toán; (iii) bảo hành và hậu mãi; (iv) quản trị kho theo từng đơn vị thiết bị; và (v) quản trị hệ thống. Tài liệu trình bày mô tả tổng quan hệ thống, sơ đồ phân rã chức năng, biểu đồ Use-case, đặc tả các use case và các yêu cầu phi chức năng.

Trong phạm vi **phiên bản 1.0**, một số chức năng được xác định là mục tiêu nghiệp vụ nhưng chưa nằm trong phạm vi triển khai hiện tại hoặc mới được hiện thực ở mức cơ bản, bao gồm: chức năng **trả góp (Installment)**, chức năng **quản lý đối tác vận chuyển**, và việc **tích hợp cổng thanh toán thẻ/ví điện tử thực tế** (phiên bản hiện tại hỗ trợ thanh toán chuyển khoản qua mã QR và thanh toán tại cửa hàng). Các chức năng này được ghi nhận trong lộ trình phát triển và sẽ được bổ sung ở các phiên bản kế tiếp. Tài liệu không bao gồm thiết kế kỹ thuật chi tiết (kiến trúc cơ sở dữ liệu, đặc tả API, thiết kế lớp, cấu hình triển khai).

## 1.3. Định nghĩa thuật ngữ và viết tắt

| STT | Thuật ngữ / Viết tắt | Ý nghĩa |
|-----|----------------------|---------|
| 1 | SRS | Software Requirements Specification – Tài liệu đặc tả yêu cầu phần mềm |
| 2 | UC | Use Case – Kịch bản sử dụng hệ thống |
| 3 | Actor | Tác nhân – Đối tượng tương tác với hệ thống (người dùng hoặc hệ thống ngoài) |
| 4 | IMEI | International Mobile Equipment Identity – Mã định danh duy nhất của thiết bị di động (15 chữ số) |
| 5 | Serial Number | Số sê-ri – Mã định danh duy nhất do nhà sản xuất gán cho từng thiết bị |
| 6 | SKU | Stock Keeping Unit – Mã đơn vị quản lý hàng hóa |
| 7 | Spec (Technical Spec) | Thông số kỹ thuật của sản phẩm |
| 8 | Dynamic Spec | Bộ thông số động – Cấu hình thông số riêng theo từng nhóm sản phẩm |
| 9 | Compare Tool | Công cụ so sánh sản phẩm theo các thông số kỹ thuật tương đương |
| 10 | Cross-sell | Bán kèm – Gợi ý các sản phẩm/phụ kiện tương thích với sản phẩm chính |
| 11 | Installment | Trả góp – Hình thức thanh toán theo kỳ với lãi suất hàng tháng |
| 12 | CRM | Customer Relationship Management – Quản lý quan hệ khách hàng |
| 13 | Ticket | Phiếu yêu cầu hỗ trợ kỹ thuật / báo lỗi sản phẩm |
| 14 | Warranty Claim | Phiếu yêu cầu bảo hành gắn với thiết bị cụ thể |
| 15 | Stock Item | Đơn vị tồn kho – Một thiết bị vật lý cụ thể được quản lý theo Serial/IMEI |
| 16 | Goods Receipt | Phiếu nhập hàng theo lô |
| 17 | Aged Stock | Hàng tồn kho lâu ngày |
| 18 | QR Payment | Thanh toán bằng cách quét mã QR (qua chuyển khoản ngân hàng) |
| 19 | COD | Cash on Delivery – Thanh toán khi nhận hàng |
| 20 | JWT | JSON Web Token – Cơ chế xác thực và phân quyền người dùng |
| 21 | RBAC | Role-Based Access Control – Phân quyền dựa trên vai trò |
| 22 | Dashboard | Màn hình tổng quan trực quan hiển thị các chỉ số vận hành |
| 23 | Guest | Khách vãng lai – Người dùng chưa đăng nhập |
| 24 | BA | Business Analyst – Chuyên viên phân tích nghiệp vụ |
| 25 | PM | Project Manager – Quản lý dự án |
| 26 | DL | Developer Lead – Trưởng nhóm phát triển |
| 27 | CR | Change Request – Yêu cầu thay đổi |
| 28 | ND | Người dùng hệ thống |

## 1.4. Vai trò và trách nhiệm

Tài liệu này được xây dựng dựa trên quá trình trao đổi, phân tích và thống nhất yêu cầu giữa nhóm thực hiện dự án và phía khách hàng/giảng viên hướng dẫn. Các bên có nghĩa vụ thực hiện đúng theo các nội dung đã được ghi nhận và thống nhất trong tài liệu.

| STT | Vai trò | Người đảm nhiệm | Trách nhiệm chính |
|-----|---------|-----------------|-------------------|
| 1 | Business Analyst (BA) | Nhóm phân tích | Khảo sát, phân tích và ghi nhận yêu cầu; soạn thảo và cập nhật tài liệu SRS |
| 2 | Project Manager (PM) | Quản lý dự án | Phê duyệt tài liệu; điều phối thay đổi yêu cầu; giám sát tiến độ |
| 3 | Developer Lead (DL) | Trưởng nhóm phát triển | Đánh giá tính khả thi kỹ thuật; phản hồi các yêu cầu chưa rõ ràng |
| 4 | Tester Lead | Trưởng nhóm kiểm thử | Dựa vào SRS để xây dựng kế hoạch và bộ test case kiểm thử |
| 5 | Khách hàng / Stakeholder | Bên yêu cầu | Xác nhận yêu cầu; cung cấp phản hồi và chấp thuận các thay đổi |

Tài liệu có thể được sửa đổi, bổ sung trong quá trình triển khai dự án dựa trên thỏa thuận giữa các bên liên quan, thông qua biểu mẫu **Yêu cầu Thay đổi (Change Request – CR)** được phê duyệt bởi PM.

## 1.5. Mô tả tài liệu

Tài liệu SRS của hệ thống **Tech Gadget & Electronics Store** được cấu trúc thành các phần chính như sau:

- **Phần I – Giới thiệu:** trình bày mục đích, phạm vi, định nghĩa thuật ngữ và viết tắt, vai trò trách nhiệm và cấu trúc tài liệu.
- **Phần II – Tổng quan hệ thống:** mô tả bài toán cần giải quyết, mục tiêu hệ thống, phạm vi triển khai, các nhóm người dùng, mô hình phân rã chức năng và biểu đồ hoạt động.
- **Phần III – Đặc tả yêu cầu chức năng:** trình bày biểu đồ Use-case tổng quan, biểu đồ Use-case phân rã theo từng tác nhân và đặc tả chi tiết các use case.
- **Phần IV – Yêu cầu phi chức năng:** đặc tả các ràng buộc về độ chính xác dữ liệu, bảo mật, hiệu năng, tính tin cậy và tính tương thích.

---

# II. TỔNG QUAN HỆ THỐNG

## 2.1. Phát biểu bài toán

Thiết bị công nghệ là nhóm hàng hóa có **giá trị cao** nhưng đồng thời có **vòng đời sản phẩm ngắn**, liên tục được thay thế bởi các thế hệ mới với cấu hình và công nghệ thay đổi nhanh chóng. Đặc thù này tạo ra những thách thức riêng cho cả người mua lẫn doanh nghiệp bán lẻ.

Về phía người mua, hành vi tiêu dùng trong ngành công nghệ có tính cân nhắc cao: khách hàng thường có thói quen so sánh cấu hình và giá cả giữa nhiều model trước khi ra quyết định, đồng thời đặc biệt quan tâm tới các dịch vụ đi kèm như bảo hành, trả góp và hỗ trợ kỹ thuật. Tuy nhiên, mỗi nhóm sản phẩm (điện thoại, laptop, máy tính để bàn) lại sở hữu một bộ thông số kỹ thuật khác biệt, khiến việc tra cứu và đối chiếu trở nên phức tạp nếu không có công cụ hỗ trợ phù hợp.

Về phía doanh nghiệp, việc kinh doanh thiết bị công nghệ đòi hỏi mức độ kiểm soát chặt chẽ tới **từng đơn vị thiết bị cụ thể**. Mỗi máy cần được định danh và truy vết bằng số Serial/IMEI xuyên suốt vòng đời, từ khi nhập kho đến khi bán ra và phục vụ bảo hành, đổi trả. Các phương thức quản lý truyền thống — sử dụng thẻ bảo hành giấy, theo dõi tồn kho theo số lượng tổng — bộc lộ nhiều hạn chế: dễ thất lạc, khó xác thực, không đồng bộ tức thời, dẫn tới sai lệch tồn kho và khó khăn trong xử lý hậu mãi.

Xuất phát từ thực trạng đó, hệ thống **Tech Gadget & Electronics Store** được xây dựng nhằm cung cấp một giải pháp thương mại điện tử chuyên biệt cho ngành hàng công nghệ. Hệ thống lấy bốn yếu tố làm khác biệt cốt lõi: (i) quản lý thông số kỹ thuật chuyên sâu và cấu hình động theo từng nhóm hàng; (ii) công cụ so sánh sản phẩm trực quan; (iii) số hóa bảo hành thông qua Serial/IMEI; và (iv) kiểm soát tồn kho tới từng đơn vị thiết bị. Qua đó, hệ thống hướng tới việc nâng cao trải nghiệm mua sắm minh bạch cho khách hàng và tối ưu hóa năng lực vận hành cho doanh nghiệp.

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

- **Quản lý sản phẩm và thông số kỹ thuật:** quản lý danh mục, sản phẩm, biến thể và bộ thông số kỹ thuật động theo từng nhóm hàng; cung cấp chức năng tìm kiếm, lọc, xem chi tiết, so sánh sản phẩm và gợi ý sản phẩm mua kèm.
- **Giao dịch và thanh toán:** quản lý giỏ hàng, đặt hàng, áp dụng mã giảm giá, thanh toán và theo dõi đơn hàng.
- **Bảo hành và hậu mãi:** tra cứu bảo hành điện tử theo Serial/IMEI, gửi yêu cầu bảo hành, tiếp nhận và xử lý phiếu hỗ trợ kỹ thuật, quản lý quy trình sửa chữa.
- **Quản trị kho:** nhập hàng theo lô, quản lý Serial/IMEI từng thiết bị, theo dõi tồn kho, xử lý đổi trả và cảnh báo hàng tồn lâu ngày.
- **Quản trị hệ thống:** quản lý người dùng và phân quyền, quản lý danh mục kỹ thuật, thiết lập giá bán, cấu hình gợi ý mua kèm và theo dõi báo cáo vận hành.

Trong phạm vi **phiên bản 1.0**, hệ thống hỗ trợ thanh toán qua hình thức **chuyển khoản ngân hàng bằng mã QR** và **thanh toán tại cửa hàng**. Các chức năng **trả góp**, **quản lý đối tác vận chuyển** và **tích hợp cổng thanh toán thẻ/ví điện tử thực tế** được xác định là mục tiêu nghiệp vụ thuộc lộ trình phát triển ở các phiên bản kế tiếp. Hệ thống không bao gồm phần thiết kế kỹ thuật chi tiết.

## 2.4. Người sử dụng hệ thống (Actor)

Hệ thống phục vụ bốn nhóm tác nhân chính, được phân tách rõ ràng về vai trò và quyền hạn nhằm bảo đảm an toàn và hiệu quả vận hành.

| STT | Người sử dụng | Vai trò và chức năng chính |
|-----|---------------|----------------------------|
| 1 | **Khách hàng (Customer)** | Tra cứu thông số và xem chi tiết sản phẩm; tìm kiếm, lọc và so sánh sản phẩm; xem gợi ý sản phẩm mua kèm; quản lý giỏ hàng và đặt hàng; lựa chọn phương thức thanh toán; theo dõi đơn hàng; tra cứu bảo hành điện tử theo Serial/IMEI; gửi yêu cầu bảo hành; gửi và theo dõi phiếu hỗ trợ kỹ thuật. |
| 2 | **Kỹ thuật viên (Technical Staff)** | Tiếp nhận yêu cầu bảo hành/sửa chữa; cập nhật tình trạng và tiến độ sửa chữa của từng thiết bị; xử lý phiếu hỗ trợ kỹ thuật của khách hàng; tư vấn, hỗ trợ kỹ thuật. |
| 3 | **Quản trị viên kho (Stock Manager)** | Quản lý nhập hàng theo lô; gán và quản lý Serial/IMEI cho từng thiết bị; theo dõi tồn kho theo từng đơn vị; xử lý nghiệp vụ đổi trả hàng hóa. |
| 4 | **Quản trị viên hệ thống (Admin)** | Quản lý danh mục kỹ thuật và cấu hình bộ thông số động; quản lý sản phẩm, thiết lập giá bán và cấu hình gợi ý sản phẩm mua kèm; quản lý tài khoản người dùng và phân quyền; quản lý cảnh báo hàng tồn kho lâu ngày; theo dõi báo cáo tài chính và kinh doanh. |

Bên cạnh bốn tác nhân chính, hệ thống còn tương tác với một số **tác nhân phụ và tác nhân ngoài** sau:

| STT | Tác nhân phụ / ngoài | Vai trò trong hệ thống |
|-----|----------------------|------------------------|
| 5 | **Khách vãng lai (Guest)** | Người dùng chưa đăng nhập; thực hiện các thao tác công khai: tìm kiếm, lọc, xem chi tiết, so sánh sản phẩm, sử dụng giỏ hàng, tra cứu bảo hành và gửi phiếu hỗ trợ. |
| 6 | **Đơn vị tài chính** | Đối tác ngoài tiếp nhận và phê duyệt hồ sơ trả góp. |
| 7 | **Cổng thanh toán / Ngân hàng** | Hệ thống ngoài xử lý và xác nhận giao dịch thanh toán (chuyển khoản qua mã QR). |
| 8 | **Đối tác vận chuyển** | Đơn vị ngoài thực hiện giao nhận hàng hóa tới khách hàng. |

**Nhận xét:** Đây là hệ thống đa vai trò vận hành (multi-role), không chỉ là website bán hàng B2C đơn thuần; quyền hạn của các tác nhân được phân tách rõ ràng, đòi hỏi cơ chế phân quyền dựa trên vai trò (RBAC).

## 2.5. Mô hình phân rã chức năng và module nghiệp vụ

Hệ thống được phân rã thành **năm phân hệ (module) nghiệp vụ** chính, mỗi phân hệ đảm nhiệm một nhóm chức năng độc lập nhưng có quan hệ tương tác chặt chẽ với nhau.

[CHÈN HÌNH 2.1 – SƠ ĐỒ PHÂN RÃ CHỨC NĂNG]

**(1) Module Quản lý sản phẩm**
- *Mục tiêu:* cung cấp dữ liệu sản phẩm chuyên sâu, hỗ trợ khách hàng tra cứu và lựa chọn thiết bị phù hợp.
- *Chức năng chính:* tìm kiếm sản phẩm; lọc theo thông số kỹ thuật; xem chi tiết và thông số; so sánh sản phẩm; xem gợi ý sản phẩm mua kèm (Cross-sell).

**(2) Module Giao dịch**
- *Mục tiêu:* xử lý luồng mua hàng và thanh toán cho các giao dịch giá trị cao.
- *Chức năng chính:* quản lý giỏ hàng; đặt hàng; tính và chọn trả góp *(lộ trình)*; thanh toán đơn hàng; theo dõi đơn hàng.

**(3) Module Bảo hành và hậu mãi (CRM)**
- *Mục tiêu:* số hóa hoạt động bảo hành và hỗ trợ khách hàng theo từng thiết bị.
- *Chức năng chính:* tra cứu bảo hành điện tử theo Serial/IMEI; gửi yêu cầu bảo hành; gửi và theo dõi phiếu hỗ trợ (Ticket).

**(4) Module Quản trị kho (Inventory Control)**
- *Mục tiêu:* kiểm soát tồn kho tới từng đơn vị thiết bị và bảo đảm dữ liệu kho nhất quán.
- *Chức năng chính:* nhập hàng theo lô; quản lý IMEI/Serial; theo dõi tồn kho; xử lý đổi trả.

**(5) Module Quản trị hệ thống**
- *Mục tiêu:* vận hành, cấu hình và giám sát toàn bộ hệ thống.
- *Chức năng chính:* quản lý danh mục kỹ thuật; cấu hình bộ thông số động; quản lý sản phẩm; thiết lập giá bán; quản lý đối tác vận chuyển *(lộ trình)*; quản lý cảnh báo hàng tồn kho lâu ngày; quản lý tài khoản người dùng; cấu hình gợi ý mua kèm; xem báo cáo tài chính / kinh doanh.

## 2.6. Biểu đồ hoạt động của hệ thống

### 2.6.1. Biểu đồ hoạt động chung

[CHÈN HÌNH 2.2 – BIỂU ĐỒ HOẠT ĐỘNG CHUNG CỦA HỆ THỐNG]

Người dùng truy cập website và thực hiện đăng nhập bằng tài khoản đã có. Hệ thống kiểm tra thông tin xác thực; nếu hợp lệ, hệ thống cấp phát phiên làm việc và hiển thị giao diện tương ứng với vai trò của người dùng (Khách hàng, Kỹ thuật viên, Quản trị viên kho hoặc Quản trị viên hệ thống). Trường hợp thông tin không hợp lệ, hệ thống hiển thị thông báo lỗi và yêu cầu nhập lại. Sau khi đăng nhập thành công, người dùng thực hiện các nghiệp vụ phù hợp với phân quyền; hệ thống ghi nhận và đồng bộ dữ liệu tức thời trước khi người dùng kết thúc phiên làm việc bằng thao tác đăng xuất.

### 2.6.2. Biểu đồ hoạt động đặt hàng và thanh toán

[CHÈN HÌNH 2.3 – BIỂU ĐỒ HOẠT ĐỘNG ĐẶT HÀNG VÀ THANH TOÁN]

Khách hàng lựa chọn sản phẩm, thêm vào giỏ hàng và tiến hành đặt hàng. Tại bước xác nhận đơn, khách hàng nhập thông tin giao nhận (chọn hình thức giao hàng tận nơi hoặc nhận tại cửa hàng), áp dụng mã giảm giá (nếu có) và lựa chọn phương thức thanh toán. Hệ thống kiểm tra tính sẵn có của hàng hóa và khóa tồn kho tương ứng nhằm bảo đảm tính nhất quán. Tại điểm quyết định "Phương thức thanh toán?", luồng tách thành hai nhánh: nếu chọn thanh toán chuyển khoản qua mã QR, hệ thống khởi tạo phiên thanh toán có thời hạn và chờ xác nhận giao dịch trước khi cập nhật trạng thái đơn hàng sang "Đã thanh toán"; nếu chọn thanh toán tại cửa hàng, hệ thống ghi nhận đơn ở trạng thái chờ và hoàn tất thanh toán khi khách nhận hàng. Sau khi đơn hàng được xác nhận, hệ thống ghi nhận tiến trình vào dòng thời gian đơn hàng để khách hàng theo dõi.

### 2.6.3. Biểu đồ hoạt động bảo hành và sửa chữa

[CHÈN HÌNH 2.4 – BIỂU ĐỒ HOẠT ĐỘNG BẢO HÀNH VÀ SỬA CHỮA]

Khách hàng tra cứu thông tin bảo hành bằng cách nhập số Serial/IMEI; hệ thống đối chiếu và hiển thị thời hạn bảo hành còn lại. Khi phát sinh sự cố, khách hàng gửi yêu cầu bảo hành hoặc phiếu hỗ trợ kèm mô tả lỗi và thông tin định danh thiết bị. Kỹ thuật viên tiếp nhận, lập hồ sơ sửa chữa gắn với thiết bị cụ thể và lần lượt cập nhật tình trạng theo các giai đoạn (tiếp nhận, chẩn đoán, chờ linh kiện/chờ phê duyệt, sửa chữa, kiểm thử, hoàn tất, bàn giao). Mỗi lần cập nhật, hệ thống đồng bộ trạng thái tương ứng giữa hồ sơ sửa chữa, phiếu hỗ trợ và trạng thái của đơn vị thiết bị trong kho, đồng thời gửi thông báo tới khách hàng. Quy trình kết thúc khi thiết bị được bàn giao cho khách hàng.

### 2.6.4. Biểu đồ hoạt động quản lý kho

[CHÈN HÌNH 2.5 – BIỂU ĐỒ HOẠT ĐỘNG QUẢN LÝ KHO]

Quản trị viên kho tạo phiếu nhập hàng theo lô, khai báo nhà cung cấp, kho nhận và danh sách hàng hóa. Tại điểm quyết định "Sản phẩm quản lý theo Serial/IMEI?", luồng tách thành hai nhánh: với sản phẩm quản lý theo từng thiết bị, hệ thống yêu cầu nhập/định danh Serial/IMEI cho từng đơn vị (kèm kiểm tra hợp lệ) và sinh đơn vị tồn kho tương ứng; với sản phẩm không quản lý theo serial, hệ thống cập nhật số lượng tồn theo phương thức thông thường. Sau khi nhập kho, hệ thống tính lại tồn kho và ghi nhận biến động kho. Trong quá trình vận hành, hệ thống tiếp tục theo dõi trạng thái của từng đơn vị thiết bị (tồn kho, đã bán, bảo hành, đổi trả…), xử lý nghiệp vụ đổi trả và cảnh báo các mặt hàng tồn kho vượt ngưỡng thời gian quy định.

## 2.7. Biểu đồ hoạt động quản trị hệ thống

[CHÈN HÌNH 2.6 – BIỂU ĐỒ HOẠT ĐỘNG QUẢN TRỊ HỆ THỐNG]

Sau khi đăng nhập với quyền quản trị, hệ thống hiển thị bảng điều khiển (Dashboard) cùng các chỉ số vận hành tổng quan. Tại điểm quyết định "Loại thao tác quản trị?", luồng tách thành các nhánh chính: (i) quản lý danh mục kỹ thuật và cấu hình bộ thông số động theo nhóm sản phẩm; (ii) quản lý sản phẩm, thiết lập giá bán và cấu hình gợi ý mua kèm; (iii) quản lý tài khoản người dùng và phân quyền; và (iv) theo dõi báo cáo vận hành cùng cảnh báo hàng tồn kho lâu ngày. Sau mỗi thao tác, hệ thống kiểm tra tính hợp lệ của dữ liệu, lưu thay đổi và cập nhật giao diện. Nếu còn thao tác tiếp theo, vòng lặp quay lại điểm quyết định; nếu không, Quản trị viên kết thúc phiên làm việc.

---

# III. ĐẶC TẢ YÊU CẦU CHỨC NĂNG

## 3.1. Biểu đồ Use-case tổng quan

[CHÈN HÌNH 3.1 – USE CASE TỔNG QUAN]

Biểu đồ Use-case tổng quan thể hiện mối quan hệ giữa bốn tác nhân chính (Khách hàng, Kỹ thuật viên, Quản trị viên kho, Quản trị viên hệ thống) và các tác nhân phụ/ngoài (Khách vãng lai, Đơn vị tài chính, Cổng thanh toán/Ngân hàng, Đối tác vận chuyển) với các nhóm chức năng tương ứng. Các use case dùng chung cho mọi tác nhân (đăng nhập, đăng xuất, thay đổi mật khẩu, cập nhật thông tin cá nhân) được tách riêng nhằm tránh trùng lặp.

## 3.2. Biểu đồ Use-case phân rã

### 3.2.1. Tác nhân Khách hàng

[CHÈN HÌNH 3.2 – USE CASE KHÁCH HÀNG]

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

### 3.2.2. Tác nhân Kỹ thuật viên

[CHÈN HÌNH 3.3 – USE CASE KỸ THUẬT VIÊN]

| Mã | Tên Use case |
|----|--------------|
| UC-T01 | Tiếp nhận yêu cầu bảo hành |
| UC-T02 | Cập nhật tình trạng sửa chữa |
| UC-T03 | Xử lý ticket hỗ trợ kỹ thuật |
| UC-T04 | Tư vấn kỹ thuật trực tuyến *(mở rộng của UC-T03)* |

### 3.2.3. Tác nhân Quản trị viên kho

[CHÈN HÌNH 3.4 – USE CASE QUẢN TRỊ VIÊN KHO]

| Mã | Tên Use case |
|----|--------------|
| UC-W01 | Nhập hàng theo lô |
| UC-W02 | Quản lý IMEI/Serial |
| UC-W03 | Theo dõi tồn kho |
| UC-W04 | Xử lý hàng đổi trả |

### 3.2.4. Tác nhân Quản trị viên hệ thống

[CHÈN HÌNH 3.5 – USE CASE QUẢN TRỊ VIÊN HỆ THỐNG]

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

## 3.3. Đặc tả các Use-case

> Mỗi use case được đặc tả theo các mục: Mã · Tên · Tác nhân · Mô tả · Sự kiện kích hoạt · Tiền điều kiện · Luồng sự kiện chính · Luồng sự kiện thay thế · Hậu điều kiện · Dữ liệu đầu vào.

### 3.3.1. Use-case dùng chung

#### 3.3.1.1. UC-G01 — Đăng nhập

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-G01 |
| **Tên** | Đăng nhập |
| **Tác nhân** | Khách hàng, Kỹ thuật viên, Quản trị viên kho, Quản trị viên hệ thống |
| **Mô tả** | Tác nhân đăng nhập vào hệ thống để sử dụng các chức năng phù hợp với vai trò. |
| **Sự kiện kích hoạt** | Kích nút "Đăng nhập" trên giao diện. |
| **Tiền điều kiện** | Tác nhân đã có tài khoản trên hệ thống. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Nhập tài khoản và mật khẩu. | Kiểm tra các trường đã hợp lệ chưa. |
| 2 | Yêu cầu đăng nhập. | Xác thực thông tin; cấp mã thông báo phiên (JWT). |
| 3 | | Hiển thị giao diện theo vai trò người dùng. |

**Luồng sự kiện thay thế:**

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

#### 3.3.1.2. UC-G02 — Đăng xuất

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-G02 |
| **Tên** | Đăng xuất |
| **Tác nhân** | Tất cả người dùng đã đăng nhập |
| **Mô tả** | Tác nhân kết thúc phiên làm việc và rời khỏi hệ thống. |
| **Sự kiện kích hoạt** | Kích nút "Đăng xuất". |
| **Tiền điều kiện** | Tác nhân đang đăng nhập. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Kích "Đăng xuất". | Hủy phiên làm việc, xóa mã thông báo phiên. |
| 2 | | Chuyển về trang chủ/đăng nhập. |

**Luồng sự kiện thay thế:** Không có.

**Hậu điều kiện:** Phiên làm việc kết thúc.

**Dữ liệu đầu vào:** Không có.

#### 3.3.1.3. UC-G03 — Thay đổi mật khẩu

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-G03 |
| **Tên** | Thay đổi mật khẩu |
| **Tác nhân** | Tất cả người dùng đã đăng nhập |
| **Mô tả** | Tác nhân thay đổi mật khẩu tài khoản. |
| **Sự kiện kích hoạt** | Kích "Thay đổi mật khẩu" trong menu hồ sơ. |
| **Tiền điều kiện** | Tác nhân đã đăng nhập thành công. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Nhập mật khẩu cũ, mật khẩu mới và xác nhận. | Kiểm tra các trường hợp lệ chưa. |
| 2 | Yêu cầu thay đổi. | Kiểm tra mật khẩu cũ đúng và xác nhận trùng khớp. |
| 3 | | Cập nhật mật khẩu mới; thông báo thành công. |

**Luồng sự kiện thay thế:**

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

#### 3.3.1.4. UC-G04 — Cập nhật thông tin cá nhân

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-G04 |
| **Tên** | Cập nhật thông tin cá nhân |
| **Tác nhân** | Tất cả người dùng đã đăng nhập |
| **Mô tả** | Tác nhân chỉnh sửa thông tin hồ sơ cá nhân. |
| **Sự kiện kích hoạt** | Kích "Cập nhật thông tin cá nhân" trong menu hồ sơ. |
| **Tiền điều kiện** | Tác nhân đã đăng nhập thành công. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Chỉnh sửa các trường thông tin. | Kiểm tra tính hợp lệ của dữ liệu. |
| 2 | Lưu thay đổi. | Cập nhật dữ liệu; thông báo thành công. |

**Luồng sự kiện thay thế:**

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

### 3.3.2. Use-case Khách hàng

#### 3.3.2.1. UC-C01 — Tìm kiếm sản phẩm

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-C01 |
| **Tên** | Tìm kiếm sản phẩm |
| **Tác nhân** | Khách hàng, Khách vãng lai |
| **Mô tả** | Tìm sản phẩm theo từ khóa (tên, thương hiệu, mã SKU…). |
| **Sự kiện kích hoạt** | Nhập từ khóa và kích "Tìm kiếm". |
| **Tiền điều kiện** | Hệ thống có dữ liệu sản phẩm. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Nhập từ khóa tìm kiếm. | Đối chiếu từ khóa với tên/mô tả/thương hiệu/SKU. |
| 2 | Yêu cầu tìm kiếm. | Trả về danh sách sản phẩm phù hợp, có phân trang. |

**Luồng sự kiện thay thế:**

| STT | Hệ thống |
|----|----------|
| 2a | Không có kết quả → thông báo "Không tìm thấy sản phẩm". |

**Hậu điều kiện:** Danh sách kết quả tìm kiếm được hiển thị.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Từ khóa | Input text | Có | Tối đa 200 ký tự. | iPhone 15 |

#### 3.3.2.2. UC-C02 — Lọc sản phẩm theo thông số kỹ thuật

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-C02 |
| **Tên** | Lọc sản phẩm theo thông số kỹ thuật |
| **Tác nhân** | Khách hàng, Khách vãng lai |
| **Mô tả** | Lọc danh sách sản phẩm theo thông số (CPU, RAM, dung lượng…), giá, thương hiệu. |
| **Sự kiện kích hoạt** | Chọn tiêu chí lọc trên trang danh sách sản phẩm. |
| **Tiền điều kiện** | Hệ thống có dữ liệu sản phẩm và thông số. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Chọn nhóm sản phẩm và thiết lập tiêu chí lọc. | Hiển thị bộ tiêu chí lọc theo nhóm. |
| 2 | Áp dụng bộ lọc. | Đối chiếu điều kiện và trả về danh sách phù hợp. |
| 3 | Xem kết quả. | Hiển thị danh sách thỏa điều kiện, có phân trang. |

**Luồng sự kiện thay thế:**

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

#### 3.3.2.3. UC-C03 — Xem chi tiết và thông số sản phẩm

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-C03 |
| **Tên** | Xem chi tiết và thông số sản phẩm |
| **Tác nhân** | Khách hàng, Khách vãng lai |
| **Mô tả** | Xem thông tin chi tiết: thông số kỹ thuật, biến thể, hình ảnh, đánh giá. |
| **Sự kiện kích hoạt** | Kích vào một sản phẩm trong danh sách. |
| **Tiền điều kiện** | Sản phẩm tồn tại trong hệ thống. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Chọn sản phẩm. | Truy xuất chi tiết kèm thông số, biến thể, hình ảnh. |
| 2 | Chọn biến thể (nếu có). | Cập nhật giá/tồn theo biến thể được chọn. |

**Luồng sự kiện thay thế:**

| STT | Hệ thống |
|----|----------|
| 1a | Sản phẩm không tồn tại/ngừng kinh doanh → thông báo phù hợp. |

**Hậu điều kiện:** Trang chi tiết sản phẩm được hiển thị đầy đủ.

**Dữ liệu đầu vào:** Không có (thao tác đọc dữ liệu).

#### 3.3.2.4. UC-C04 — So sánh sản phẩm

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-C04 |
| **Tên** | So sánh sản phẩm |
| **Tác nhân** | Khách hàng, Khách vãng lai |
| **Mô tả** | So sánh trực quan các thông số kỹ thuật tương đương giữa các model. Hệ thống hỗ trợ so sánh **tối thiểu 3 sản phẩm** cùng lúc trên một màn hình (theo yêu cầu). |
| **Sự kiện kích hoạt** | Kích "So sánh" / mở màn hình so sánh. |
| **Tiền điều kiện** | Đã chọn ít nhất hai sản phẩm để so sánh (hệ thống hỗ trợ tối thiểu 3 sản phẩm cùng lúc). |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Thêm sản phẩm vào danh sách so sánh. | Ghi nhận sản phẩm vào danh sách so sánh. |
| 2 | Mở màn hình so sánh. | Hiển thị bảng so sánh thông số tương đương. |
| 3 | Đối chiếu thông số. | Làm nổi bật điểm khác biệt giữa các sản phẩm. |

**Luồng sự kiện thay thế:**

| STT | Hệ thống |
|----|----------|
| 1a | Vượt số lượng tối đa cho phép so sánh → thông báo, không thêm. |

**Hậu điều kiện:** Bảng so sánh được hiển thị.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Danh sách sản phẩm so sánh | Lựa chọn nhiều | Có | Từ 2 đến tối thiểu 3 sản phẩm cùng lúc, cùng nhóm sản phẩm. | iPhone 15, Galaxy S24, Xiaomi 14 |

#### 3.3.2.5. UC-C05 — Xem gợi ý sản phẩm mua kèm

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-C05 |
| **Tên** | Xem gợi ý sản phẩm mua kèm |
| **Tác nhân** | Khách hàng, Khách vãng lai |
| **Mô tả** | Xem các sản phẩm/phụ kiện tương thích được gợi ý mua kèm (Cross-sell). |
| **Sự kiện kích hoạt** | Mở trang chi tiết sản phẩm. |
| **Tiền điều kiện** | Sản phẩm có cấu hình gợi ý hoặc thuộc nhóm có sản phẩm liên quan. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Xem trang chi tiết sản phẩm. | Trả về danh sách gợi ý mua kèm (cấu hình thủ công hoặc tự động theo cùng danh mục). |
| 2 | Kích vào sản phẩm gợi ý. | Chuyển tới trang chi tiết sản phẩm gợi ý. |

**Luồng sự kiện thay thế:**

| STT | Hệ thống |
|----|----------|
| 1a | Không có gợi ý phù hợp → ẩn khu vực gợi ý. |

**Hậu điều kiện:** Danh sách sản phẩm mua kèm được hiển thị.

**Dữ liệu đầu vào:** Không có (thao tác đọc dữ liệu).

#### 3.3.2.6. UC-C06 — Quản lý giỏ hàng

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-C06 |
| **Tên** | Quản lý giỏ hàng |
| **Tác nhân** | Khách hàng, Khách vãng lai |
| **Mô tả** | Thêm, cập nhật số lượng, xóa sản phẩm trong giỏ hàng. |
| **Sự kiện kích hoạt** | Kích "Thêm vào giỏ" hoặc mở giỏ hàng. |
| **Tiền điều kiện** | Không bắt buộc đăng nhập. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Thêm sản phẩm/biến thể vào giỏ. | Ghi nhận sản phẩm vào giỏ hàng. |
| 2 | Cập nhật số lượng hoặc xóa sản phẩm. | Cập nhật giỏ và tính lại tạm tính. |
| 3 | Xem giỏ hàng. | Hiển thị danh sách, số lượng, tạm tính, ưu đãi (nếu có). |

**Luồng sự kiện thay thế:**

| STT | Hệ thống |
|----|----------|
| 2a | Số lượng vượt tồn kho → cảnh báo và giới hạn số lượng. |

**Hậu điều kiện:** Giỏ hàng phản ánh đúng lựa chọn của khách hàng.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Sản phẩm/Biến thể | Lựa chọn | Có | Tồn tại trong hệ thống. | iPhone 15 128GB |
| 2 | Số lượng | Input number | Có | Số nguyên dương, ≤ tồn kho. | 1 |

#### 3.3.2.7. UC-C07 — Đặt hàng

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-C07 |
| **Tên** | Đặt hàng |
| **Tác nhân** | Khách hàng |
| **Mô tả** | Tạo và xác nhận đơn hàng, chọn hình thức giao nhận, áp mã giảm giá (nếu có). |
| **Sự kiện kích hoạt** | Kích "Đặt hàng"/"Thanh toán" tại giỏ hàng. |
| **Tiền điều kiện** | Giỏ hàng có ít nhất một sản phẩm; khách hàng đã đăng nhập. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Xác nhận sản phẩm và số lượng. | Kiểm tra tính sẵn có và tồn kho. |
| 2 | Chọn hình thức giao nhận và nhập thông tin. | Tính phí vận chuyển; chuẩn hóa địa chỉ. |
| 3 | Áp mã giảm giá (nếu có). | Kiểm tra hiệu lực và tính lại tổng tiền. |
| 4 | Xác nhận đặt hàng. | Khóa tồn kho, tạo đơn trong giao dịch nhất quán, ghi dòng thời gian đơn. |

**Luồng sự kiện thay thế:**

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

#### 3.3.2.8. UC-C08 — Tính và chọn trả góp *(lộ trình)*

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-C08 |
| **Tên** | Tính và chọn trả góp |
| **Tác nhân** | Khách hàng, Đơn vị tài chính (tác nhân ngoài) |
| **Mô tả** | Khách hàng lựa chọn gói trả góp; hệ thống tính số tiền trả trước và khoản trả hàng tháng theo lãi suất của đơn vị tài chính. *(Dự kiến triển khai ở phiên bản kế tiếp.)* |
| **Sự kiện kích hoạt** | Chọn "Trả góp" tại bước thanh toán. |
| **Tiền điều kiện** | Sản phẩm/đơn hàng đủ điều kiện trả góp. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Chọn đơn vị tài chính và kỳ hạn (3/6/12 tháng). | Hiển thị các gói trả góp khả dụng. |
| 2 | Nhập số tiền trả trước (nếu có). | Tính khoản trả hàng tháng theo lãi suất kỳ hạn. |
| 3 | Xác nhận gói trả góp. | Gắn thông tin trả góp vào đơn hàng. |

**Luồng sự kiện thay thế:**

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

#### 3.3.2.9. UC-C09 — Thanh toán đơn hàng

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-C09 |
| **Tên** | Thanh toán đơn hàng |
| **Tác nhân** | Khách hàng, Cổng thanh toán / Ngân hàng (tác nhân ngoài) |
| **Mô tả** | Thanh toán đơn hàng bằng chuyển khoản qua mã QR hoặc thanh toán tại cửa hàng. |
| **Sự kiện kích hoạt** | Chọn phương thức thanh toán và xác nhận. |
| **Tiền điều kiện** | Đơn hàng đã được tạo và đang chờ thanh toán. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Chọn phương thức thanh toán. | Hiển thị thông tin thanh toán tương ứng. |
| 2 | (QR) Quét mã và chuyển khoản. | Khởi tạo phiên thanh toán có thời hạn, chờ xác nhận. |
| 3 | | Khi giao dịch xác nhận → cập nhật trạng thái "Đã thanh toán". |

**Luồng sự kiện thay thế:**

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

#### 3.3.2.10. UC-C10 — Theo dõi đơn hàng

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-C10 |
| **Tên** | Theo dõi đơn hàng |
| **Tác nhân** | Khách hàng |
| **Mô tả** | Xem trạng thái và lịch sử tiến trình của đơn hàng. |
| **Sự kiện kích hoạt** | Mở mục "Đơn hàng của tôi" / chi tiết đơn. |
| **Tiền điều kiện** | Khách hàng đã đăng nhập và có đơn hàng. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Mở danh sách đơn hàng. | Hiển thị các đơn kèm trạng thái. |
| 2 | Chọn một đơn hàng. | Hiển thị chi tiết và dòng thời gian tiến trình đơn. |

**Luồng sự kiện thay thế:**

| STT | Hệ thống |
|----|----------|
| 1a | Chưa có đơn hàng → hiển thị danh sách trống. |

**Hậu điều kiện:** Thông tin trạng thái đơn hàng được hiển thị.

**Dữ liệu đầu vào:** Không có (thao tác đọc dữ liệu).

#### 3.3.2.11. UC-C11 — Tra cứu bảo hành điện tử

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-C11 |
| **Tên** | Tra cứu bảo hành điện tử |
| **Tác nhân** | Khách hàng, Khách vãng lai |
| **Mô tả** | Tra cứu thời hạn bảo hành còn lại của thiết bị qua Serial/IMEI. |
| **Sự kiện kích hoạt** | Nhập Serial/IMEI và kích "Tra cứu". |
| **Tiền điều kiện** | Thiết bị có hồ sơ bảo hành trong hệ thống. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Nhập Serial/IMEI (hoặc mã đơn/SĐT). | Đối chiếu với hồ sơ bảo hành. |
| 2 | Yêu cầu tra cứu. | Trả về thông tin thiết bị và thời hạn bảo hành còn lại. |

**Luồng sự kiện thay thế:**

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

#### 3.3.2.12. UC-C12 — Gửi yêu cầu hỗ trợ (Ticket)

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-C12 |
| **Tên** | Gửi yêu cầu hỗ trợ (Ticket) |
| **Tác nhân** | Khách hàng, Khách vãng lai |
| **Mô tả** | Gửi yêu cầu hỗ trợ kỹ thuật/báo lỗi kèm thông tin thiết bị và mô tả sự cố. |
| **Sự kiện kích hoạt** | Kích "Gửi yêu cầu hỗ trợ". |
| **Tiền điều kiện** | Cho phép gửi ẩn danh hoặc đã đăng nhập. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Chọn loại yêu cầu, nhập mô tả và thông tin sản phẩm/Serial. | Hiển thị biểu mẫu nhập liệu. |
| 2 | Đính kèm tệp (tùy chọn). | Kiểm tra định dạng và dung lượng tệp. |
| 3 | Gửi yêu cầu. | Tạo phiếu hỗ trợ trạng thái "Mở", sinh mã phiếu. |

**Luồng sự kiện thay thế:**

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

#### 3.3.2.13. UC-C13 — Theo dõi ticket hỗ trợ

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-C13 |
| **Tên** | Theo dõi ticket hỗ trợ |
| **Tác nhân** | Khách hàng |
| **Mô tả** | Theo dõi trạng thái và trao đổi trong các phiếu hỗ trợ đã gửi. |
| **Sự kiện kích hoạt** | Mở mục "Phiếu hỗ trợ của tôi". |
| **Tiền điều kiện** | Khách hàng đã đăng nhập và có phiếu hỗ trợ. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Mở danh sách phiếu hỗ trợ. | Hiển thị các phiếu kèm trạng thái. |
| 2 | Chọn một phiếu. | Hiển thị nội dung trao đổi và cập nhật theo thời gian thực. |
| 3 | Gửi phản hồi (nếu cần). | Ghi nhận phản hồi vào phiếu. |

**Luồng sự kiện thay thế:**

| STT | Hệ thống |
|----|----------|
| 1a | Chưa có phiếu → hiển thị danh sách trống. |

**Hậu điều kiện:** Trạng thái và nội dung trao đổi của phiếu được hiển thị.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Nội dung phản hồi | Textarea | Không | Không vượt giới hạn ký tự. | Đã thử khởi động lại… |

#### 3.3.2.14. UC-C14 — Gửi yêu cầu bảo hành

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-C14 |
| **Tên** | Gửi yêu cầu bảo hành |
| **Tác nhân** | Khách hàng (Khách vãng lai có thể gửi kèm thông tin định danh) |
| **Mô tả** | Khách hàng tạo yêu cầu bảo hành cho thiết bị đã mua (gắn Serial/IMEI). Khác với UC-C12, đây là phiếu bảo hành gắn trực tiếp với hồ sơ bảo hành của thiết bị. |
| **Sự kiện kích hoạt** | Kích "Yêu cầu bảo hành" từ kết quả tra cứu bảo hành hoặc lịch sử mua hàng. |
| **Tiền điều kiện** | Thiết bị có hồ sơ bảo hành và còn trong thời hạn bảo hành. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Chọn thiết bị (Serial/IMEI) và nhập mô tả lỗi. | Kiểm tra điều kiện và thời hạn bảo hành. |
| 2 | Gửi yêu cầu. | Tạo phiếu bảo hành trạng thái "Tiếp nhận", sinh mã phiếu. |
| 3 | | Thông báo tới bộ phận kỹ thuật/bảo hành. |

**Luồng sự kiện thay thế:**

| STT | Hệ thống |
|----|----------|
| 1a | Thiết bị hết hạn/không đủ điều kiện → thông báo và đề xuất gửi phiếu hỗ trợ chung (UC-C12). |

**Hậu điều kiện:** Phiếu bảo hành được tạo và sẵn sàng cho kỹ thuật viên tiếp nhận (UC-T01).

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Số Serial/IMEI | Input text | Có | Đúng định dạng, tồn tại hồ sơ bảo hành. | 356938035643809 |
| 2 | Mô tả lỗi | Textarea | Có | Tối thiểu 10 ký tự. | Pin chai nhanh… |
| 3 | Tệp đính kèm | File upload | Không | Định dạng & dung lượng cho phép. | loi_pin.jpg |

### 3.3.3. Use-case Kỹ thuật viên

#### 3.3.3.1. UC-T01 — Tiếp nhận yêu cầu bảo hành

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-T01 |
| **Tên** | Tiếp nhận yêu cầu bảo hành |
| **Tác nhân** | Kỹ thuật viên |
| **Mô tả** | Tiếp nhận thiết bị/yêu cầu bảo hành và lập hồ sơ sửa chữa gắn với thiết bị cụ thể. |
| **Sự kiện kích hoạt** | Kích "Tiếp nhận bảo hành". |
| **Tiền điều kiện** | Đã đăng nhập với vai trò Kỹ thuật viên. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Nhập nguồn yêu cầu (phiếu bảo hành/ticket/Serial-IMEI). | Truy xuất thông tin thiết bị tương ứng. |
| 2 | Xác nhận thông tin khách hàng và mô tả lỗi. | Tạo hồ sơ sửa chữa trạng thái "Tiếp nhận", sinh mã hồ sơ. |
| 3 | | Gửi thông báo tiếp nhận tới khách hàng. |

**Luồng sự kiện thay thế:**

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

#### 3.3.3.2. UC-T02 — Cập nhật tình trạng sửa chữa

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-T02 |
| **Tên** | Cập nhật tình trạng sửa chữa |
| **Tác nhân** | Kỹ thuật viên |
| **Mô tả** | Cập nhật tiến độ/trạng thái sửa chữa của thiết bị theo từng giai đoạn. |
| **Sự kiện kích hoạt** | Kích "Cập nhật trạng thái" trên hồ sơ sửa chữa. |
| **Tiền điều kiện** | Hồ sơ sửa chữa tồn tại và do kỹ thuật viên phụ trách. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Chọn trạng thái mới và ghi chú. | Kiểm tra tính hợp lệ chuyển trạng thái. |
| 2 | Lưu cập nhật. | Ghi lịch sử; đồng bộ trạng thái sang phiếu bảo hành, ticket, thiết bị trong kho. |
| 3 | | Gửi thông báo tiến độ tới khách hàng. |

**Luồng sự kiện thay thế:**

| STT | Hệ thống |
|----|----------|
| 1a | Chuyển trạng thái không hợp lệ → thông báo, giữ nguyên trạng thái. |

**Hậu điều kiện:** Trạng thái sửa chữa được cập nhật và đồng bộ.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Trạng thái | Lựa chọn | Có | Chẩn đoán/Chờ linh kiện/Sửa chữa/Kiểm thử/Hoàn tất… | Sửa chữa |
| 2 | Ghi chú | Textarea | Không | Tối đa giới hạn ký tự. | Đã thay màn hình |

#### 3.3.3.3. UC-T03 — Xử lý ticket hỗ trợ kỹ thuật

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-T03 |
| **Tên** | Xử lý ticket hỗ trợ kỹ thuật |
| **Tác nhân** | Kỹ thuật viên |
| **Mô tả** | Tiếp nhận, phản hồi, phân công và thay đổi trạng thái phiếu hỗ trợ. |
| **Sự kiện kích hoạt** | Mở phiếu hỗ trợ trong hàng đợi. |
| **Tiền điều kiện** | Đã đăng nhập với vai trò Kỹ thuật viên. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Mở phiếu và xem nội dung. | Hiển thị chi tiết phiếu và lịch sử trao đổi. |
| 2 | Phản hồi khách hàng hoặc ghi chú nội bộ. | Lưu cập nhật; gửi nội dung công khai tới khách theo thời gian thực. |
| 3 | Thay đổi trạng thái/phân công phiếu. | Cập nhật trạng thái/người phụ trách phiếu. |

**Luồng sự kiện thay thế:**

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

#### 3.3.3.4. UC-T04 — Tư vấn kỹ thuật trực tuyến

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-T04 |
| **Tên** | Tư vấn kỹ thuật trực tuyến |
| **Tác nhân** | Kỹ thuật viên, Khách hàng |
| **Mô tả** | Trao đổi, tư vấn kỹ thuật với khách hàng theo thời gian thực trong phạm vi phiếu hỗ trợ. Đây là **luồng mở rộng (`<<extend>>`) của UC-T03**, không phải kênh tư vấn độc lập. |
| **Sự kiện kích hoạt** | Mở phiên trao đổi của phiếu hỗ trợ. |
| **Tiền điều kiện** | Tồn tại phiếu hỗ trợ đang trao đổi. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Tham gia phòng trao đổi của phiếu. | Thiết lập kênh trao đổi thời gian thực. |
| 2 | Gửi nội dung tư vấn. | Chuyển tiếp tin nhắn tới khách hàng và lưu vào lịch sử phiếu. |

**Luồng sự kiện thay thế:**

| STT | Hệ thống |
|----|----------|
| 1a | Không đủ quyền truy cập phiếu → từ chối tham gia. |

**Hậu điều kiện:** Nội dung tư vấn được ghi nhận trong phiếu hỗ trợ.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Nội dung tin nhắn | Input text | Có | Không rỗng, trong giới hạn ký tự. | Anh thử sạc 15 phút… |

### 3.3.4. Use-case Quản trị viên kho

#### 3.3.4.1. UC-W01 — Nhập hàng theo lô

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-W01 |
| **Tên** | Nhập hàng theo lô |
| **Tác nhân** | Quản trị viên kho |
| **Mô tả** | Tạo phiếu nhập hàng theo lô với nhà cung cấp, kho nhận và danh sách hàng hóa, bao gồm gán Serial/IMEI cho các đơn vị tại thời điểm nhập. |
| **Sự kiện kích hoạt** | Kích "Tạo phiếu nhập kho". |
| **Tiền điều kiện** | Đã đăng nhập với vai trò Quản trị viên kho. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Khai báo nhà cung cấp, kho nhận, danh sách hàng nhập. | Kiểm tra dữ liệu hợp lệ. |
| 2 | (Sản phẩm theo serial) Nhập/định danh Serial/IMEI cho từng đơn vị. | Kiểm tra hợp lệ (IMEI 15 chữ số, đạt Luhn); sinh đơn vị tồn kho. |
| 3 | Xác nhận phiếu nhập. | Lưu phiếu, tính lại tồn kho, ghi nhận biến động kho. |

**Luồng sự kiện thay thế:**

| STT | Hệ thống |
|----|----------|
| 2a | Serial/IMEI không hợp lệ/trùng → báo lỗi, không tạo đơn vị. |
| 2b | Sản phẩm không quản lý theo serial → cập nhật số lượng tồn thông thường. |

**Hậu điều kiện:** Hàng hóa được nhập kho; tồn kho và Serial/IMEI từng thiết bị được cập nhật.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Nhà cung cấp | Dropdown | Có | Tồn tại trong hệ thống. | Công ty ABC |
| 2 | Kho nhận | Dropdown | Có | Tồn tại trong hệ thống. | Kho Hà Nội |
| 3 | Sản phẩm | Tìm kiếm/Dropdown | Có | Tồn tại trong hệ thống. | iPhone 15 |
| 4 | Số lượng | Input number | Có | Số nguyên dương. | 10 |
| 5 | Serial/IMEI | Input text | Có (với SP theo serial) | Hợp lệ, không trùng; IMEI 15 chữ số. | 356938035643809 |
| 6 | Giá nhập | Input number | Có | Số không âm. | 18000000 |

#### 3.3.4.2. UC-W02 — Quản lý IMEI/Serial

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-W02 |
| **Tên** | Quản lý IMEI/Serial |
| **Tác nhân** | Quản trị viên kho |
| **Mô tả** | Quản lý vòng đời của các đơn vị thiết bị đã tồn tại trong kho: tra cứu, đổi trạng thái, phân loại Serial/IMEI. Mỗi thiết bị tương ứng một đơn vị tồn kho. |
| **Sự kiện kích hoạt** | Tra cứu đơn vị thiết bị hoặc cập nhật trạng thái. |
| **Tiền điều kiện** | Đơn vị thiết bị đã tồn tại trong kho. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Tra cứu đơn vị theo Serial/IMEI. | Hiển thị thông tin và trạng thái thiết bị. |
| 2 | Cập nhật trạng thái/định danh đơn vị. | Kiểm tra hợp lệ và lưu thay đổi. |

**Luồng sự kiện thay thế:**

| STT | Hệ thống |
|----|----------|
| 1a | Không tìm thấy đơn vị → thông báo không có dữ liệu. |
| 2a | Định danh không hợp lệ/trùng → báo lỗi. |

**Hậu điều kiện:** Mỗi thiết bị được định danh và truy vết theo Serial/IMEI.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | IMEI | Input text | Không* | 15 chữ số, đạt kiểm tra Luhn. | 356938035643809 |
| 2 | Serial Number | Input text | Không* | Hợp lệ, không trùng. | SN-AB12CD34 |
| 3 | Trạng thái | Lựa chọn | Không | Tồn kho/Đã bán/Bảo hành/Lỗi… | Tồn kho |

*\*Phải cung cấp ít nhất một trong IMEI/Serial; nếu không, hệ thống sinh mã nội bộ tự động.*

#### 3.3.4.3. UC-W03 — Theo dõi tồn kho

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-W03 |
| **Tên** | Theo dõi tồn kho |
| **Tác nhân** | Quản trị viên kho |
| **Mô tả** | Theo dõi tồn kho theo từng đơn vị thiết bị và lịch sử biến động kho. |
| **Sự kiện kích hoạt** | Mở màn hình tồn kho/đơn vị thiết bị. |
| **Tiền điều kiện** | Đã đăng nhập với vai trò Quản trị viên kho. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Thiết lập tiêu chí lọc (từ khóa, sản phẩm, trạng thái, kho, thời gian). | Truy vấn đơn vị tồn kho theo tiêu chí. |
| 2 | Xem danh sách và lịch sử biến động. | Hiển thị danh sách đơn vị, trạng thái và lịch sử biến động kho. |

**Luồng sự kiện thay thế:**

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

#### 3.3.4.4. UC-W04 — Xử lý hàng đổi trả

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-W04 |
| **Tên** | Xử lý hàng đổi trả |
| **Tác nhân** | Quản trị viên kho |
| **Mô tả** | Tiếp nhận, xét duyệt và nhập lại kho hàng đổi trả theo từng thiết bị. |
| **Sự kiện kích hoạt** | Kích "Tạo phiếu đổi trả"/tiếp nhận yêu cầu. |
| **Tiền điều kiện** | Tồn tại đơn hàng/thiết bị liên quan. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Nhập thông tin đổi trả (Serial/IMEI, lý do, tình trạng). | Truy xuất đơn hàng/thiết bị; tạo phiếu "Chờ duyệt". |
| 2 | Xét duyệt phiếu. | Cập nhật Duyệt/Từ chối. |
| 3 | Nhập lại kho. | Nhập lại tồn (InStock) hoặc đánh dấu lỗi (Damaged); ghi biến động kho. |

**Luồng sự kiện thay thế:**

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

### 3.3.5. Use-case Quản trị viên hệ thống

#### 3.3.5.1. UC-A01 — Quản lý danh mục kỹ thuật

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-A01 |
| **Tên** | Quản lý danh mục kỹ thuật |
| **Tác nhân** | Quản trị viên hệ thống |
| **Mô tả** | Thêm, sửa, xóa danh mục sản phẩm. |
| **Sự kiện kích hoạt** | Mở mục "Quản lý danh mục". |
| **Tiền điều kiện** | Đã đăng nhập với quyền Admin. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Chọn thao tác (thêm/sửa/xóa) danh mục. | Hiển thị biểu mẫu tương ứng. |
| 2 | Nhập thông tin và lưu. | Kiểm tra hợp lệ và lưu danh mục. |

**Luồng sự kiện thay thế:**

| STT | Hệ thống |
|----|----------|
| 2a | Xóa danh mục đang chứa sản phẩm → cảnh báo/chặn theo ràng buộc. |

**Hậu điều kiện:** Danh mục được cập nhật.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Tên danh mục | Input text | Có | Không trùng, tối đa 100 ký tự. | Laptop |
| 2 | Mô tả | Textarea | Không | Tối đa giới hạn ký tự. | Máy tính xách tay |

#### 3.3.5.2. UC-A02 — Cấu hình bộ thông số động

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-A02 |
| **Tên** | Cấu hình bộ thông số động |
| **Tác nhân** | Quản trị viên hệ thống |
| **Mô tả** | Định nghĩa bộ thông số kỹ thuật riêng theo nhóm sản phẩm cùng các giá trị tùy chọn. |
| **Sự kiện kích hoạt** | Kích "Cấu hình thông số" trong quản lý danh mục. |
| **Tiền điều kiện** | Đã đăng nhập với quyền Admin. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Thêm/sửa định nghĩa thông số (tên, mã, kiểu dữ liệu, dùng để so sánh/làm trục biến thể). | Kiểm tra hợp lệ và lưu định nghĩa. |
| 2 | Thêm/sửa giá trị tùy chọn (nếu có). | Lưu danh sách giá trị tùy chọn. |
| 3 | Lưu cấu hình. | Áp dụng bộ thông số cho nhóm sản phẩm. |

**Luồng sự kiện thay thế:**

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

#### 3.3.5.3. UC-A03 — Quản lý sản phẩm

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-A03 |
| **Tên** | Quản lý sản phẩm |
| **Tác nhân** | Quản trị viên hệ thống |
| **Mô tả** | Thêm/sửa/xóa sản phẩm kèm hình ảnh, biến thể, thông số và danh mục. |
| **Sự kiện kích hoạt** | Mở mục "Quản lý sản phẩm". |
| **Tiền điều kiện** | Đã đăng nhập với quyền Admin. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Chọn thao tác và nhập thông tin sản phẩm. | Hiển thị biểu mẫu; kiểm tra hợp lệ. |
| 2 | Thêm hình ảnh, biến thể, gán thông số. | Lưu các thành phần liên quan. |
| 3 | Lưu sản phẩm. | Sinh SKU/Slug; lưu sản phẩm và quan hệ. |

**Luồng sự kiện thay thế:**

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

#### 3.3.5.4. UC-A04 — Thiết lập giá bán

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-A04 |
| **Tên** | Thiết lập giá bán |
| **Tác nhân** | Quản trị viên hệ thống |
| **Mô tả** | Cập nhật giá bán sản phẩm (giá gốc, giá bán, giá min/max). |
| **Sự kiện kích hoạt** | Kích "Cập nhật giá" trên sản phẩm. |
| **Tiền điều kiện** | Sản phẩm tồn tại; đã đăng nhập với quyền Admin. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Nhập giá bán và các mức giá liên quan. | Kiểm tra ràng buộc giá hợp lệ. |
| 2 | Lưu. | Cập nhật giá sản phẩm; thông báo thành công. |

**Luồng sự kiện thay thế:**

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

#### 3.3.5.5. UC-A05 — Quản lý đối tác vận chuyển *(lộ trình)*

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-A05 |
| **Tên** | Quản lý đối tác vận chuyển |
| **Tác nhân** | Quản trị viên hệ thống, Đối tác vận chuyển (tác nhân ngoài) |
| **Mô tả** | Quản lý danh sách đối tác vận chuyển, biểu phí và phạm vi giao nhận. *(Dự kiến triển khai ở phiên bản kế tiếp.)* |
| **Sự kiện kích hoạt** | Mở mục "Quản lý đối tác vận chuyển". |
| **Tiền điều kiện** | Đã đăng nhập với quyền Admin. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Thêm/sửa/xóa đối tác vận chuyển. | Hiển thị biểu mẫu; kiểm tra hợp lệ. |
| 2 | Thiết lập biểu phí/phạm vi giao nhận. | Lưu cấu hình đối tác. |

**Luồng sự kiện thay thế:**

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

#### 3.3.5.6. UC-A06 — Quản lý cảnh báo hàng tồn kho lâu ngày

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-A06 |
| **Tên** | Quản lý cảnh báo hàng tồn kho lâu ngày |
| **Tác nhân** | Quản trị viên hệ thống |
| **Mô tả** | Thống kê các mặt hàng tồn kho vượt ngưỡng thời gian để có phương án xử lý. |
| **Sự kiện kích hoạt** | Mở báo cáo "Hàng tồn lâu ngày" và đặt ngưỡng số ngày. |
| **Tiền điều kiện** | Đã đăng nhập với quyền Admin. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Đặt ngưỡng số ngày và tiêu chí lọc (danh mục/NCC/kho). | Truy vấn đơn vị tồn kho vượt ngưỡng. |
| 2 | Xem kết quả. | Hiển thị danh sách kèm số ngày tồn, giá vốn, giá trị tồn ước tính. |

**Luồng sự kiện thay thế:**

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

#### 3.3.5.7. UC-A07 — Quản lý tài khoản người dùng

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-A07 |
| **Tên** | Quản lý tài khoản người dùng |
| **Tác nhân** | Quản trị viên hệ thống |
| **Mô tả** | Tạo mới, chỉnh sửa, khóa/mở khóa và phân quyền tài khoản người dùng. |
| **Sự kiện kích hoạt** | Mở mục "Quản lý người dùng". |
| **Tiền điều kiện** | Đã đăng nhập với quyền Admin. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Mở danh sách người dùng. | Hiển thị tài khoản kèm tên, email, vai trò, trạng thái. |
| 2a | Tạo tài khoản mới, chọn vai trò. | Kiểm tra dữ liệu, tạo tài khoản. |
| 2b | Khóa/Mở khóa tài khoản. | Cập nhật trạng thái và ghi nhật ký. |
| 2c | Thay đổi vai trò. | Cập nhật phân quyền tức thì. |

**Luồng sự kiện thay thế:**

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

#### 3.3.5.8. UC-A08 — Xem báo cáo tài chính / kinh doanh

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-A08 |
| **Tên** | Xem báo cáo tài chính / kinh doanh |
| **Tác nhân** | Quản trị viên hệ thống |
| **Mô tả** | Xem bảng điều khiển với các chỉ số vận hành (doanh thu, đơn hàng, tồn kho, sản phẩm bán chạy). |
| **Sự kiện kích hoạt** | Mở bảng điều khiển (Dashboard). |
| **Tiền điều kiện** | Đã đăng nhập với quyền Admin. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Mở bảng điều khiển. | Tổng hợp và hiển thị các chỉ số vận hành. |
| 2 | Xem chi tiết theo nhóm chỉ số. | Hiển thị chi tiết tương ứng (đơn theo trạng thái, top sản phẩm, hàng sắp hết…). |

**Luồng sự kiện thay thế:**

| STT | Hệ thống |
|----|----------|
| 1a | Không có dữ liệu trong kỳ → hiển thị chỉ số bằng 0. |

**Hậu điều kiện:** Thông tin báo cáo được hiển thị phục vụ ra quyết định.

**Dữ liệu đầu vào:**

| STT | Trường | Mô tả | Bắt buộc | Điều kiện hợp lệ | Ví dụ |
|----|--------|-------|:--:|------------------|-------|
| 1 | Khoảng thời gian | Lựa chọn | Không | Khoảng ngày hợp lệ. | Tháng này |

#### 3.3.5.9. UC-A09 — Quản lý gợi ý sản phẩm mua kèm (Cross-sell)

| Mục | Nội dung |
|-----|----------|
| **Mã** | UC-A09 |
| **Tên** | Quản lý gợi ý sản phẩm mua kèm (Cross-sell) |
| **Tác nhân** | Quản trị viên hệ thống |
| **Mô tả** | Cấu hình danh sách sản phẩm mua kèm cho từng sản phẩm chính — đáp ứng yêu cầu "Quản lý linh kiện đi kèm". Là phần quản trị tương ứng với UC-C05. |
| **Sự kiện kích hoạt** | Mở mục "Quản lý gợi ý mua kèm" trên một sản phẩm. |
| **Tiền điều kiện** | Đã đăng nhập với quyền Admin. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hệ thống |
|----|----------|----------|
| 1 | Chọn sản phẩm chính. | Hiển thị danh sách sản phẩm gợi ý hiện có. |
| 2 | Thêm/xóa sản phẩm gợi ý kèm loại quan hệ. | Kiểm tra hợp lệ. |
| 3 | Lưu. | Cập nhật cấu hình gợi ý. |

**Luồng sự kiện thay thế:**

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

# IV. YÊU CẦU PHI CHỨC NĂNG

Bên cạnh các yêu cầu chức năng đã đặc tả ở Chương III, hệ thống **Tech Gadget & Electronics Store** phải thỏa mãn một tập các yêu cầu phi chức năng nhằm bảo đảm chất lượng vận hành, trải nghiệm người dùng và tính bền vững của hệ thống. Mỗi yêu cầu được kèm theo tiêu chí đánh giá làm cơ sở cho hoạt động kiểm thử và nghiệm thu.

## 4.1. Yêu cầu về độ chính xác dữ liệu (Accuracy)

- Thông tin cấu hình, thông số kỹ thuật của sản phẩm phải chính xác, nhất quán giữa trang danh sách, trang chi tiết và công cụ so sánh, tránh gây nhầm lẫn dẫn tới khiếu nại của khách hàng.
- Dữ liệu định danh thiết bị (Serial/IMEI) phải là duy nhất; số IMEI phải đúng định dạng 15 chữ số và đạt kiểm tra Luhn trước khi được ghi nhận.
- Số liệu tồn kho, giá bán, giá trị đơn hàng và các phép tính (tạm tính, giảm giá, phí vận chuyển, tổng tiền) phải chính xác tuyệt đối.

**Tiêu chí đánh giá:** Dữ liệu thông số hiển thị trùng khớp 100% với dữ liệu lưu trữ; không tồn tại Serial/IMEI trùng lặp; các phép tính tài chính cho kết quả chính xác trong mọi trường hợp kiểm thử.

## 4.2. Yêu cầu về bảo mật (Security)

- Bảo vệ tuyệt đối thông tin giao dịch và dữ liệu cá nhân của khách hàng, đặc biệt là số điện thoại và địa chỉ.
- Mật khẩu người dùng phải được lưu trữ dưới dạng băm (hash) kèm cơ chế bảo vệ phù hợp, không lưu mật khẩu dạng văn bản thuần.
- Hệ thống áp dụng cơ chế xác thực và phân quyền dựa trên vai trò (RBAC) thông qua mã thông báo phiên (JWT); mỗi tác nhân chỉ được truy cập các chức năng và dữ liệu thuộc phạm vi quyền hạn của mình.
- Áp dụng cơ chế phòng chống dò mật khẩu: tạm khóa tài khoản 5 phút sau 5 lần đăng nhập sai liên tiếp.
- Các phiên thanh toán phải có thời hạn hiệu lực và được xác thực bằng mã bí mật (token) nhằm chống giả mạo giao dịch.

**Tiêu chí đánh giá:** Người dùng không thể truy cập chức năng/dữ liệu ngoài phạm vi quyền hạn; mật khẩu không thể đọc được từ dữ liệu lưu trữ; cơ chế khóa tài khoản và hết hạn phiên thanh toán hoạt động đúng thiết kế.

## 4.3. Yêu cầu về hiệu năng (Performance)

- Công cụ tìm kiếm và lọc dữ liệu phải được tối ưu để hoạt động hiệu quả trên kho dữ liệu hàng nghìn sản phẩm.
- Thời gian phản hồi cho các thao tác phổ biến (tìm kiếm, xem chi tiết, lọc sản phẩm) cần được duy trì ở mức thấp trong điều kiện vận hành bình thường.
- Danh sách sản phẩm, đơn hàng, tồn kho cần áp dụng cơ chế phân trang nhằm hạn chế tải dữ liệu quá lớn trong một lần truy vấn.
- Hệ thống cần duy trì sự ổn định khi có nhiều người dùng thao tác đồng thời, đặc biệt trong các đợt khuyến mãi.

**Tiêu chí đánh giá:** Thời gian phản hồi của các truy vấn tìm kiếm/lọc trên tập dữ liệu lớn nằm trong ngưỡng cho phép; hệ thống vận hành ổn định dưới tải đồng thời theo kịch bản kiểm thử hiệu năng.

## 4.4. Yêu cầu về tính tin cậy (Reliability)

- Tồn kho phải được đồng bộ tức thời nhằm tránh tình trạng "vừa đặt xong thì báo hết hàng".
- Quy trình tạo đơn hàng phải được thực hiện trong một giao dịch nhất quán (transaction); việc trừ tồn kho áp dụng cơ chế khóa lạc quan (optimistic locking) để tránh xung đột khi nhiều người cùng đặt mua một sản phẩm.
- Trạng thái của thiết bị (Serial/IMEI) phải được đồng bộ nhất quán giữa các phân hệ kho, bảo hành và sửa chữa.
- Mọi biến động kho và thay đổi trạng thái quan trọng cần được ghi nhận lịch sử phục vụ truy vết.

**Tiêu chí đánh giá:** Không xảy ra tình trạng bán vượt tồn kho trong kịch bản đặt hàng đồng thời; dữ liệu tồn kho và trạng thái thiết bị nhất quán sau mọi nghiệp vụ; lịch sử biến động được ghi nhận đầy đủ.

## 4.5. Yêu cầu về tính tương thích (Compatibility)

- Giao diện phải hiển thị tốt các bảng thông số kỹ thuật và bảng so sánh phức tạp trên màn hình điện thoại nhỏ (thiết kế đáp ứng - responsive).
- Hệ thống hoạt động ổn định trên các trình duyệt phổ biến (Chrome, Firefox, Edge, Safari) ở các phiên bản hiện hành.
- Bố cục và thao tác cần thân thiện trên cả thiết bị di động và máy tính để bàn.

**Tiêu chí đánh giá:** Giao diện hiển thị đúng và sử dụng được trên các kích thước màn hình tiêu biểu; bảng thông số/so sánh không vỡ bố cục trên màn hình nhỏ.

## 4.6. Một số yêu cầu phi chức năng bổ trợ

| Yêu cầu | Mô tả | Tiêu chí định hướng |
|---------|-------|---------------------|
| **Tính khả dụng (Usability)** | Giao diện trực quan, luồng thao tác ngắn gọn, thông báo lỗi rõ ràng theo từng trường. | Người dùng mới hoàn thành các thao tác cơ bản mà không cần hướng dẫn chi tiết. |
| **Tính bảo trì (Maintainability)** | Hệ thống phân tách thành các phân hệ rõ ràng, thuận lợi cho việc sửa lỗi và nâng cấp. | Thay đổi một phân hệ không gây ảnh hưởng dây chuyền tới các phân hệ khác. |
| **Tính mở rộng (Scalability)** | Kiến trúc cho phép bổ sung các chức năng thuộc lộ trình (trả góp, đối tác vận chuyển, cổng thanh toán thẻ/ví) mà không phá vỡ thiết kế hiện có. | Bổ sung chức năng mới chủ yếu thông qua mở rộng, hạn chế sửa đổi phần lõi. |
| **Khả năng triển khai (Deployability)** | Hệ thống hỗ trợ triển khai trên các nền tảng điện toán đám mây phổ biến. | Triển khai được trên môi trường cloud thông dụng theo cấu hình tiêu chuẩn. |

---

> **Ghi chú về phạm vi và nguồn gốc use case:**
> - **Use case thuộc lộ trình (chưa hiện thực ở phiên bản 1.0):** UC-C08 (Tính và chọn trả góp), UC-A05 (Quản lý đối tác vận chuyển) — đặc tả mô tả hành vi dự kiến.
> - **Use case bổ sung theo kết quả rà soát:** UC-C14 (Gửi yêu cầu bảo hành), UC-A09 (Quản lý gợi ý sản phẩm mua kèm).
> - **Use case là chức năng nền tảng (không nêu tường minh trong yêu cầu gốc):** UC-G02, UC-G03, UC-G04.

---

# PHỤ LỤC A. BẢNG TRUY VẾT YÊU CẦU

Phụ lục này ánh xạ toàn bộ yêu cầu nêu trong tài liệu dự án (mục tiêu, yêu cầu chức năng, trách nhiệm tác nhân và yêu cầu phi chức năng) tới các use case / mục tương ứng trong SRS, kèm tình trạng hiện thực trong mã nguồn.

*Chú thích tình trạng nguồn:* ✓ = đã hiện thực đầy đủ · ~ = một phần · ✗ = chưa hiện thực (lộ trình).

## A.1. Truy vết mục tiêu hệ thống

| Mã YC | Yêu cầu (theo tài liệu dự án) | Đáp ứng trong SRS | Nguồn |
|-------|-------------------------------|-------------------|:---:|
| MT-1 | Chuyên sâu hóa dữ liệu: quản lý thông số kỹ thuật chi tiết theo nhóm hàng | UC-A02, UC-C02, UC-C03 (mục 2.2) | ✓ |
| MT-2 | Công cụ so sánh: so sánh trực quan ≥3 sản phẩm cùng lúc | UC-C04 | ~ |
| MT-3 | Số hóa bảo hành qua Serial/IMEI, loại bỏ thẻ giấy | UC-C11, UC-C14, UC-W02 | ✓ |

## A.2. Truy vết yêu cầu chức năng

| Mã YC | Yêu cầu (theo tài liệu dự án) | Đáp ứng trong SRS | Nguồn |
|-------|-------------------------------|-------------------|:---:|
| FR-4.1.1 | Cấu hình thông số động theo nhóm sản phẩm | UC-A02 | ✓ |
| FR-4.1.2 | Bộ so sánh sản phẩm (Compare Tool) | UC-C04 | ~ |
| FR-4.1.3 | Quản lý linh kiện đi kèm (Cross-sell) | UC-C05, UC-A09 | ~ |
| FR-4.2.1 | Hỗ trợ trả góp (trả trước & lãi suất) | UC-C08 | ✗ |
| FR-4.2.2 | Thanh toán đa kênh (thẻ/ví/chuyển khoản) | UC-C09 | ~ |
| FR-4.3.1 | Tra cứu bảo hành điện tử theo Serial/IMEI | UC-C11 | ✓ |
| FR-4.3.2 | Hệ thống Ticket hỗ trợ/báo lỗi | UC-C12, UC-C13, UC-T03 | ✓ |
| FR-4.4.1 | Quản lý IMEI/Serial – theo dõi từng máy (bắt buộc) | UC-W01, UC-W02, UC-W03 | ✓ |
| FR-4.4.2 | Cảnh báo hàng tồn kho lâu ngày | UC-A06 | ✓ |

## A.3. Truy vết trách nhiệm tác nhân

| Mã YC | Yêu cầu (theo tài liệu dự án) | Đáp ứng trong SRS | Nguồn |
|-------|-------------------------------|-------------------|:---:|
| AC-KH | Khách hàng: đặt hàng; chọn trả góp; theo dõi bảo hành | UC-C07, UC-C08, UC-C11, UC-C13 | ~ |
| AC-KT | Kỹ thuật viên: tiếp nhận máy bảo hành; cập nhật sửa chữa; tư vấn trực tuyến | UC-T01, UC-T02, UC-T04 | ~ |
| AC-Kho | QTV kho: nhập lô; quản lý Serial/IMEI; xử lý đổi trả | UC-W01, UC-W02, UC-W04 | ✓ |
| AC-Adm | Admin: danh mục kỹ thuật; giá; đối tác vận chuyển; báo cáo tài chính | UC-A01, UC-A04, UC-A05, UC-A08 | ~ |

## A.4. Truy vết yêu cầu phi chức năng

| Mã YC | Yêu cầu | Đáp ứng trong SRS | Nguồn |
|-------|---------|-------------------|:---:|
| NFR-1 | Độ chính xác dữ liệu (Accuracy) | Mục 4.1 | ✓ |
| NFR-2 | Bảo mật (Security) | Mục 4.2 | ✓ |
| NFR-3 | Hiệu năng (Performance) | Mục 4.3 | ✓ |
| NFR-4 | Tính tin cậy (Reliability) | Mục 4.4 | ✓ |
| NFR-5 | Tính tương thích (Compatibility) | Mục 4.5 | ✓ |

## A.5. Tổng hợp mức độ phủ

Toàn bộ yêu cầu trong tài liệu dự án đều được phản ánh trong SRS (**phủ 100% ở mức đặc tả**). Về hiện thực mã nguồn: phần lớn đã hoàn thiện (✓); một phần (~): so sánh (giới hạn 2 SP), thanh toán đa kênh (mới QR + tại cửa hàng), gợi ý mua kèm (chưa tích hợp đầy đủ ở giao diện), tư vấn trực tuyến (qua ticket), báo cáo (chưa có lọc/xuất); chưa hiện thực (✗): trả góp (FR-4.2.1) và quản lý đối tác vận chuyển (UC-A05).

---

*— HẾT —*
