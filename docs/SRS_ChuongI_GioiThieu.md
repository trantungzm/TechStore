# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM
## Software Requirements Specification (SRS)
### Website Kinh Doanh Thiết Bị Công Nghệ (Tech Gadget & Electronics Store)

| | |
|---|---|
| **Phiên bản** | 1.0 |
| **Môn học** | Công nghệ phần mềm |
| **Giai đoạn** | Bước 1 – Requirements Engineering |
| **Trạng thái** | Draft |

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

Trong phạm vi **phiên bản 1.0**, một số chức năng được xác định là mục tiêu nghiệp vụ nhưng chưa nằm trong phạm vi triển khai hiện tại, hoặc mới được hiện thực ở mức cơ bản, bao gồm: chức năng **trả góp (Installment)**, chức năng **quản lý đối tác vận chuyển**, và việc **tích hợp cổng thanh toán thẻ/ví điện tử thực tế** (phiên bản hiện tại hỗ trợ thanh toán chuyển khoản qua mã QR và thanh toán tại cửa hàng). Các chức năng này được ghi nhận trong lộ trình phát triển và sẽ được bổ sung ở các phiên bản kế tiếp. Tài liệu không bao gồm thiết kế kỹ thuật chi tiết (kiến trúc cơ sở dữ liệu, đặc tả API, cấu hình triển khai).

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
| 14 | Warranty | Bảo hành – Cam kết sửa chữa/đổi trả trong thời hạn quy định |
| 15 | Stock Item | Đơn vị tồn kho – Một thiết bị vật lý cụ thể được quản lý theo Serial/IMEI |
| 16 | Goods Receipt | Phiếu nhập hàng theo lô |
| 17 | Aged Stock | Hàng tồn kho lâu ngày |
| 18 | QR Payment | Thanh toán bằng cách quét mã QR (qua chuyển khoản ngân hàng) |
| 19 | COD | Cash on Delivery – Thanh toán khi nhận hàng |
| 20 | JWT | JSON Web Token – Cơ chế xác thực và phân quyền người dùng |
| 21 | Dashboard | Màn hình tổng quan trực quan hiển thị các chỉ số vận hành |
| 22 | BA | Business Analyst – Chuyên viên phân tích nghiệp vụ |
| 23 | PM | Project Manager – Quản lý dự án |
| 24 | DL | Developer Lead – Trưởng nhóm phát triển |
| 25 | CR | Change Request – Yêu cầu thay đổi |
| 26 | ND | Người dùng hệ thống |

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
- **Phần II – Tổng quan hệ thống:** mô tả bài toán cần giải quyết, mục tiêu hệ thống, phạm vi triển khai, các nhóm người dùng, sơ đồ phân rã chức năng và biểu đồ hoạt động.
- **Phần III – Đặc tả yêu cầu chức năng:** trình bày biểu đồ Use-case tổng quan, biểu đồ Use-case phân rã theo từng tác nhân và đặc tả chi tiết các use case.
- **Phần IV – Thiết kế giao diện người dùng (UI Mockup):** các wireframe/mockup minh họa cho những giao diện chính của hệ thống.
- **Phần V – Yêu cầu phi chức năng:** đặc tả các ràng buộc về độ chính xác dữ liệu, bảo mật, hiệu năng, tính tin cậy và tính tương thích.
