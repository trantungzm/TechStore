# IV. YÊU CẦU PHI CHỨC NĂNG

Bên cạnh các yêu cầu chức năng đã đặc tả ở Chương III, hệ thống **Tech Gadget & Electronics Store** phải thỏa mãn một tập các yêu cầu phi chức năng nhằm bảo đảm chất lượng vận hành, trải nghiệm người dùng và tính bền vững của hệ thống. Các yêu cầu phi chức năng được trình bày dưới đây, kèm theo tiêu chí đánh giá làm cơ sở cho hoạt động kiểm thử và nghiệm thu.

## 4.1. Yêu cầu về độ chính xác dữ liệu (Accuracy)

Đặc thù của ngành hàng công nghệ là dữ liệu thông số kỹ thuật phức tạp và có tính quyết định đối với hành vi mua hàng; do đó độ chính xác của dữ liệu được xem là yêu cầu hàng đầu.

- Thông tin cấu hình, thông số kỹ thuật của sản phẩm phải được bảo đảm chính xác, nhất quán giữa trang danh sách, trang chi tiết và công cụ so sánh, tránh gây nhầm lẫn dẫn tới khiếu nại của khách hàng.
- Dữ liệu định danh thiết bị (Serial/IMEI) phải là duy nhất; số IMEI phải đúng định dạng 15 chữ số và đạt kiểm tra Luhn trước khi được ghi nhận.
- Số liệu tồn kho, giá bán, giá trị đơn hàng và các phép tính (tạm tính, giảm giá, phí vận chuyển, tổng tiền) phải chính xác tuyệt đối.

**Tiêu chí đánh giá:** Dữ liệu thông số hiển thị trùng khớp 100% với dữ liệu lưu trữ; không tồn tại Serial/IMEI trùng lặp trong hệ thống; các phép tính tài chính cho kết quả chính xác trong mọi trường hợp kiểm thử.

## 4.2. Yêu cầu về bảo mật (Security)

Hệ thống xử lý các giao dịch giá trị lớn và lưu trữ dữ liệu cá nhân của khách hàng, do đó cần được bảo vệ chặt chẽ.

- Bảo vệ tuyệt đối thông tin giao dịch và dữ liệu cá nhân của khách hàng, đặc biệt là số điện thoại và địa chỉ.
- Mật khẩu người dùng phải được lưu trữ dưới dạng băm (hash) kèm cơ chế bảo vệ phù hợp, không lưu mật khẩu dạng văn bản thuần.
- Hệ thống áp dụng cơ chế xác thực và phân quyền dựa trên vai trò (RBAC) thông qua mã thông báo phiên (JWT); mỗi tác nhân chỉ được truy cập các chức năng và dữ liệu thuộc phạm vi quyền hạn của mình.
- Áp dụng cơ chế phòng chống dò mật khẩu: tạm khóa tài khoản 5 phút sau 5 lần đăng nhập sai liên tiếp.
- Các phiên thanh toán phải có thời hạn hiệu lực và được xác thực bằng mã bí mật (token) nhằm chống giả mạo giao dịch.

**Tiêu chí đánh giá:** Người dùng không thể truy cập chức năng/dữ liệu ngoài phạm vi quyền hạn; mật khẩu không thể đọc được từ cơ sở dữ liệu; cơ chế khóa tài khoản và hết hạn phiên thanh toán hoạt động đúng thiết kế.

## 4.3. Yêu cầu về hiệu năng (Performance)

Hệ thống phải duy trì khả năng đáp ứng tốt khi quy mô dữ liệu sản phẩm lớn và lượng truy cập đồng thời cao.

- Công cụ tìm kiếm và lọc dữ liệu phải được tối ưu để hoạt động hiệu quả trên kho dữ liệu hàng nghìn sản phẩm.
- Thời gian phản hồi cho các thao tác phổ biến (tìm kiếm, xem chi tiết, lọc sản phẩm) cần được duy trì ở mức thấp trong điều kiện vận hành bình thường.
- Danh sách sản phẩm, đơn hàng, tồn kho cần áp dụng cơ chế phân trang nhằm hạn chế tải dữ liệu quá lớn trong một lần truy vấn.
- Hệ thống cần duy trì sự ổn định khi có nhiều người dùng thao tác đồng thời, đặc biệt trong các đợt khuyến mãi.

**Tiêu chí đánh giá:** Thời gian phản hồi của các truy vấn tìm kiếm/lọc trên tập dữ liệu lớn nằm trong ngưỡng cho phép; hệ thống vận hành ổn định dưới tải đồng thời theo kịch bản kiểm thử hiệu năng.

## 4.4. Yêu cầu về tính tin cậy (Reliability)

Tính tin cậy bảo đảm dữ liệu nghiệp vụ luôn nhất quán và hệ thống vận hành liên tục, đặc biệt đối với tồn kho và giao dịch.

- Tồn kho phải được đồng bộ tức thời nhằm tránh tình trạng "vừa đặt xong thì báo hết hàng".
- Quy trình tạo đơn hàng phải được thực hiện trong một giao dịch nhất quán (transaction); việc trừ tồn kho áp dụng cơ chế khóa lạc quan (optimistic locking) để tránh xung đột khi nhiều người cùng đặt mua một sản phẩm.
- Trạng thái của thiết bị (Serial/IMEI) phải được đồng bộ nhất quán giữa các phân hệ kho, bảo hành và sửa chữa.
- Mọi biến động kho và thay đổi trạng thái quan trọng cần được ghi nhận lịch sử (audit/movement) phục vụ truy vết.

**Tiêu chí đánh giá:** Không xảy ra tình trạng bán vượt tồn kho trong kịch bản đặt hàng đồng thời; dữ liệu tồn kho và trạng thái thiết bị nhất quán sau mọi nghiệp vụ; lịch sử biến động được ghi nhận đầy đủ.

## 4.5. Yêu cầu về tính tương thích (Compatibility)

Hệ thống cần hiển thị tốt trên nhiều thiết bị và trình duyệt, đặc biệt với các bảng thông số kỹ thuật phức tạp.

- Giao diện phải hiển thị tốt các bảng thông số kỹ thuật và bảng so sánh phức tạp trên màn hình điện thoại nhỏ (thiết kế đáp ứng - responsive).
- Hệ thống hoạt động ổn định trên các trình duyệt phổ biến (Chrome, Firefox, Edge, Safari) ở các phiên bản hiện hành.
- Bố cục và thao tác cần thân thiện trên cả thiết bị di động và máy tính để bàn.

**Tiêu chí đánh giá:** Giao diện hiển thị đúng và sử dụng được trên các kích thước màn hình tiêu biểu (điện thoại, máy tính bảng, máy tính); bảng thông số/so sánh không vỡ bố cục trên màn hình nhỏ.

## 4.6. Một số yêu cầu phi chức năng bổ trợ

Ngoài năm nhóm yêu cầu trọng tâm nêu trên, hệ thống hướng tới đáp ứng thêm các yêu cầu sau nhằm nâng cao chất lượng tổng thể:

| Yêu cầu | Mô tả | Tiêu chí định hướng |
|---------|-------|---------------------|
| **Tính khả dụng (Usability)** | Giao diện trực quan, luồng thao tác ngắn gọn, thông báo lỗi rõ ràng theo từng trường. | Người dùng mới hoàn thành các thao tác cơ bản (tìm kiếm, đặt hàng, tra cứu bảo hành) mà không cần hướng dẫn chi tiết. |
| **Tính bảo trì (Maintainability)** | Hệ thống phân tách thành các phân hệ/dịch vụ rõ ràng, thuận lợi cho việc sửa lỗi và nâng cấp. | Thay đổi một phân hệ không gây ảnh hưởng dây chuyền tới các phân hệ khác. |
| **Tính mở rộng (Scalability)** | Kiến trúc cho phép bổ sung các chức năng thuộc lộ trình (trả góp, đối tác vận chuyển, cổng thanh toán thẻ/ví) mà không phá vỡ thiết kế hiện có. | Bổ sung chức năng mới chủ yếu thông qua mở rộng, hạn chế sửa đổi phần lõi. |
| **Khả năng triển khai (Deployability)** | Hệ thống hỗ trợ triển khai trên các nền tảng điện toán đám mây phổ biến. | Triển khai được trên môi trường cloud thông dụng theo cấu hình tiêu chuẩn. |

---

> **Ghi chú:** Các tiêu chí định lượng cụ thể (ngưỡng thời gian phản hồi, số người dùng đồng thời mục tiêu, mức độ phủ kiểm thử…) sẽ được thống nhất và chi tiết hóa trong kế hoạch kiểm thử (Test Plan) ở các giai đoạn sau, dựa trên thỏa thuận giữa các bên liên quan.
