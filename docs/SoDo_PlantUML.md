# MÃ NGUỒN SƠ ĐỒ (PlantUML) – Tech Gadget & Electronics Store

> **Cách dùng:** Dán từng khối mã `@startuml … @enduml` vào một trong các công cụ sau để render thành hình:
> - **PlantUML online:** https://www.plantuml.com/plantuml
> - **VS Code:** cài extension *PlantUML* (Alt+D để xem trước)
> - **draw.io / diagrams.net:** Arrange → Insert → Advanced → **PlantUML**
> - **StarUML / Visual Paradigm:** import PlantUML
>
> Sau khi render, xuất ảnh PNG/SVG rồi chèn vào đúng vị trí `[CHÈN HÌNH x.y]` trong file Word.
> Mã đã dùng UTF-8 (tiếng Việt có dấu) — giữ nguyên khi lưu file.

---

## HÌNH 2.1 – SƠ ĐỒ PHÂN RÃ CHỨC NĂNG

```plantuml
@startwbs
* TechStore
** 1. Quản lý sản phẩm
*** Tìm kiếm sản phẩm
*** Lọc theo thông số
*** Xem chi tiết & thông số
*** So sánh sản phẩm
*** Gợi ý mua kèm (Cross-sell)
** 2. Giao dịch
*** Quản lý giỏ hàng
*** Đặt hàng
*** Trả góp (lộ trình)
*** Thanh toán đơn hàng
*** Theo dõi đơn hàng
** 3. Bảo hành & hậu mãi
*** Tra cứu bảo hành điện tử
*** Gửi yêu cầu bảo hành
*** Gửi & theo dõi Ticket
** 4. Quản trị kho
*** Nhập hàng theo lô
*** Quản lý IMEI/Serial
*** Theo dõi tồn kho
*** Xử lý đổi trả
** 5. Quản trị hệ thống
*** Quản lý danh mục kỹ thuật
*** Cấu hình thông số động
*** Quản lý sản phẩm
*** Thiết lập giá bán
*** Quản lý đối tác vận chuyển (lộ trình)
*** Cảnh báo hàng tồn lâu ngày
*** Quản lý tài khoản
*** Cấu hình gợi ý mua kèm
*** Báo cáo tài chính/kinh doanh
@endwbs
```

---

## HÌNH 2.2 – BIỂU ĐỒ HOẠT ĐỘNG CHUNG CỦA HỆ THỐNG

```plantuml
@startuml
title Biểu đồ hoạt động chung của hệ thống
start
:Truy cập website;
repeat
  :Nhập tài khoản & mật khẩu;
  :Hệ thống kiểm tra xác thực;
backward:Hiển thị thông báo lỗi;
repeat while (Thông tin hợp lệ?) is (Không)
->Có;
:Cấp phát phiên làm việc (JWT);
:Hiển thị giao diện theo vai trò;
:Thực hiện nghiệp vụ theo phân quyền;
:Đồng bộ dữ liệu tức thời;
:Đăng xuất;
stop
@enduml
```

---

## HÌNH 2.3 – BIỂU ĐỒ HOẠT ĐỘNG ĐẶT HÀNG VÀ THANH TOÁN

```plantuml
@startuml
title Biểu đồ hoạt động đặt hàng và thanh toán
start
:Chọn sản phẩm, thêm vào giỏ;
:Đặt hàng;
:Nhập thông tin giao nhận;
:Áp mã giảm giá (nếu có);
:Kiểm tra tồn kho & khóa tồn;
if (Phương thức thanh toán?) then (Chuyển khoản QR)
  :Khởi tạo phiên thanh toán (có thời hạn);
  if (Giao dịch được xác nhận?) then (Thành công)
    :Cập nhật trạng thái "Đã thanh toán";
  else (Hết hạn)
    :Hủy phiên, cho phép tạo lại;
    stop
  endif
else (Tại cửa hàng)
  :Ghi nhận đơn ở trạng thái chờ;
  :Hoàn tất thanh toán khi nhận hàng;
endif
:Ghi nhận dòng thời gian đơn hàng;
stop
@enduml
```

---

## HÌNH 2.4 – BIỂU ĐỒ HOẠT ĐỘNG BẢO HÀNH VÀ SỬA CHỮA

```plantuml
@startuml
title Biểu đồ hoạt động bảo hành và sửa chữa
|Khách hàng|
start
:Tra cứu bảo hành (Serial/IMEI);
:Xem thời hạn bảo hành còn lại;
:Gửi yêu cầu bảo hành / phiếu hỗ trợ;
|Kỹ thuật viên|
:Tiếp nhận, lập hồ sơ sửa chữa;
repeat
  :Cập nhật trạng thái sửa chữa;
  :Đồng bộ Repair ↔ Ticket ↔ Stock Item;
  :Gửi thông báo cho khách hàng;
repeat while (Đã hoàn tất?) is (Chưa)
->Đã hoàn tất;
:Bàn giao thiết bị cho khách hàng;
stop
@enduml
```

---

## HÌNH 2.5 – BIỂU ĐỒ HOẠT ĐỘNG QUẢN LÝ KHO

```plantuml
@startuml
title Biểu đồ hoạt động quản lý kho
start
:Tạo phiếu nhập hàng theo lô;
:Khai báo NCC, kho nhận, danh sách hàng;
if (Sản phẩm quản lý theo Serial/IMEI?) then (Có)
  :Nhập/định danh Serial/IMEI từng đơn vị;
  :Kiểm tra hợp lệ (IMEI 15 số, Luhn);
  :Sinh đơn vị tồn kho (Stock Item);
else (Không)
  :Cập nhật số lượng tồn thông thường;
endif
:Tính lại tồn kho;
:Ghi nhận biến động kho (Stock Movement);
:Theo dõi trạng thái thiết bị / xử lý đổi trả;
:Cảnh báo hàng tồn vượt ngưỡng;
stop
@enduml
```

---

## HÌNH 2.6 – BIỂU ĐỒ HOẠT ĐỘNG QUẢN TRỊ HỆ THỐNG

```plantuml
@startuml
title Biểu đồ hoạt động quản trị hệ thống
start
:Đăng nhập quyền quản trị;
:Hiển thị Dashboard;
repeat
  if (Loại thao tác quản trị?) then (Danh mục / Thông số)
    :Quản lý danh mục & cấu hình thông số động;
  elseif (Sản phẩm / Giá / Gợi ý) then (—)
    :Quản lý sản phẩm, giá bán, gợi ý mua kèm;
  elseif (Tài khoản) then (—)
    :Quản lý tài khoản & phân quyền;
  else (Báo cáo)
    :Xem báo cáo & cảnh báo hàng tồn;
  endif
  :Kiểm tra hợp lệ & lưu thay đổi;
repeat while (Còn thao tác?) is (Có)
->Không;
stop
@enduml
```

---

## HÌNH 3.1 – USE CASE TỔNG QUAN

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle
actor "Khách hàng" as C
actor "Khách vãng lai" as G
actor "Kỹ thuật viên" as T
actor "QTV kho" as W
actor "Admin" as A
actor "Đơn vị tài chính" as F
actor "Cổng TT / Ngân hàng" as P
actor "Đối tác vận chuyển" as S

C --|> G

rectangle "HỆ THỐNG TECHSTORE" {
  usecase "Đăng nhập / Đăng xuất\nĐổi mật khẩu / Cập nhật hồ sơ" as UG
  usecase "Mua sắm & Giao dịch\n(tìm kiếm, so sánh, đặt hàng,\nthanh toán, theo dõi đơn)" as UC_SHOP
  usecase "Bảo hành & Hỗ trợ\n(tra cứu, yêu cầu BH, ticket)" as UC_WAR
  usecase "Xử lý kỹ thuật\n(tiếp nhận, sửa chữa, ticket)" as UC_TECH
  usecase "Quản trị kho\n(nhập lô, IMEI/Serial, đổi trả)" as UC_INV
  usecase "Quản trị hệ thống\n(danh mục, giá, báo cáo, tài khoản)" as UC_ADM
}

G --> UC_SHOP
G --> UC_WAR
C --> UG
C --> UC_SHOP
C --> UC_WAR
T --> UG
T --> UC_TECH
W --> UG
W --> UC_INV
A --> UG
A --> UC_ADM
UC_SHOP ..> F : <<trả góp>>
UC_SHOP ..> P : <<thanh toán>>
UC_ADM ..> S : <<vận chuyển>>
@enduml
```

---

## HÌNH 3.2 – USE CASE KHÁCH HÀNG

```plantuml
  @startuml
  left to right direction
  actor "Khách hàng" as C
  actor "Khách vãng lai" as G
  actor "Đơn vị tài chính" as F
  actor "Cổng TT / Ngân hàng" as P
  C --|> G

  rectangle "Chức năng Khách hàng" {
    usecase "UC-C01 Tìm kiếm sản phẩm" as C1
    usecase "UC-C02 Lọc theo thông số" as C2
    usecase "UC-C03 Xem chi tiết & thông số" as C3
    usecase "UC-C04 So sánh sản phẩm" as C4
    usecase "UC-C05 Xem gợi ý mua kèm" as C5
    usecase "UC-C06 Quản lý giỏ hàng" as C6
    usecase "UC-C07 Đặt hàng" as C7
    usecase "UC-C08 Tính & chọn trả góp" as C8
    usecase "UC-C09 Thanh toán đơn hàng" as C9
    usecase "UC-C10 Theo dõi đơn hàng" as C10
    usecase "UC-C11 Tra cứu bảo hành" as C11
    usecase "UC-C12 Gửi ticket hỗ trợ" as C12
    usecase "UC-C13 Theo dõi ticket" as C13
    usecase "UC-C14 Gửi yêu cầu bảo hành" as C14
  }

  G --> C1
  G --> C2
  G --> C3
  G --> C4
  G --> C5
  G --> C6
  G --> C11
  G --> C12
  C --> C7
  C --> C8
  C --> C9
  C --> C10
  C --> C13
  C --> C14
  C8 ..> F : <<include>>
  C9 ..> P : <<include>>
  @enduml
```

---

## HÌNH 3.3 – USE CASE KỸ THUẬT VIÊN

```plantuml
@startuml
left to right direction
actor "Kỹ thuật viên" as T
actor "Khách hàng" as C

rectangle "Chức năng Kỹ thuật viên" {
  usecase "UC-T01 Tiếp nhận yêu cầu bảo hành" as T1
  usecase "UC-T02 Cập nhật tình trạng sửa chữa" as T2
  usecase "UC-T03 Xử lý ticket hỗ trợ" as T3
  usecase "UC-T04 Tư vấn kỹ thuật trực tuyến" as T4
}

T --> T1
T --> T2
T --> T3
T4 .> T3 : <<extend>>
T --> T4
C --> T4
@enduml
```

---

## HÌNH 3.4 – USE CASE QUẢN TRỊ VIÊN KHO

```plantuml
@startuml
left to right direction
actor "QTV kho" as W

rectangle "Chức năng Quản trị viên kho" {
  usecase "UC-W01 Nhập hàng theo lô" as W1
  usecase "UC-W02 Quản lý IMEI/Serial" as W2
  usecase "UC-W03 Theo dõi tồn kho" as W3
  usecase "UC-W04 Xử lý hàng đổi trả" as W4
}

W --> W1
W --> W2
W --> W3
W --> W4
W1 ..> W2 : <<include>>
@enduml
```

---

## HÌNH 3.5 – USE CASE QUẢN TRỊ VIÊN HỆ THỐNG

```plantuml
@startuml
left to right direction
actor "Admin" as A
actor "Đối tác vận chuyển" as S

rectangle "Chức năng Quản trị viên hệ thống" {
  usecase "UC-A01 Quản lý danh mục kỹ thuật" as A1
  usecase "UC-A02 Cấu hình bộ thông số động" as A2
  usecase "UC-A03 Quản lý sản phẩm" as A3
  usecase "UC-A04 Thiết lập giá bán" as A4
  usecase "UC-A05 Quản lý đối tác vận chuyển" as A5
  usecase "UC-A06 Cảnh báo hàng tồn lâu ngày" as A6
  usecase "UC-A07 Quản lý tài khoản người dùng" as A7
  usecase "UC-A08 Xem báo cáo tài chính/KD" as A8
  usecase "UC-A09 Quản lý gợi ý mua kèm" as A9
}

A --> A1
A --> A2
A --> A3
A --> A4
A --> A5
A --> A6
A --> A7
A --> A8
A --> A9
A5 ..> S : <<communicate>>
A2 ..> A1 : <<extend>>
@enduml
```

---

## GHI CHÚ
- Các quan hệ `<<include>>`, `<<extend>>` đã được thể hiện đúng theo phần đặc tả (ví dụ UC-T04 mở rộng UC-T03; UC-C08/C09 include tới tác nhân ngoài).
- Quan hệ `C --|> G` (Khách hàng kế thừa Khách vãng lai) thể hiện: khách đã đăng nhập làm được mọi thao tác công khai của khách vãng lai, cộng thêm các chức năng cá nhân.
- Nếu bạn muốn, tôi có thể chuyển sang **Mermaid** (dùng cho Markdown/Notion) hoặc xuất **file .drawio** để bạn mở thẳng bằng draw.io.
```
