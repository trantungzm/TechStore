# BÁO CÁO PHÂN TÍCH YÊU CẦU
## Website kinh doanh thiết bị công nghệ (Tech Gadget & Electronics Store)

> **Giai đoạn 1 – Phân tích yêu cầu phần mềm**
> Tài liệu này là **báo cáo phân tích** dựa trên các tài liệu yêu cầu đã cung cấp.
> *Không phải SRS, không bao gồm Use Case.*
>
> Nguồn: `Website kinh doanh thiết bị công nghệ.docx`, `yêu cầu website kinh doanh công nghệ.docx`
> (Hai file `tài liệu mẫu đặc tả.docx` và `detaildesigntemplate.docx` chỉ là biểu mẫu/template tham khảo, không chứa yêu cầu của dự án.)

---

## 1. Xác định bài toán (Problem Statement)

**Bối cảnh nghiệp vụ:**
Thiết bị công nghệ là mặt hàng **giá trị cao** nhưng có **vòng đời sản phẩm ngắn**. Đặc thù hành vi mua hàng:

- Khách hàng có thói quen **so sánh cấu hình và giá** giữa nhiều model trước khi quyết định.
- Các **dịch vụ đi kèm** (bảo hành, trả góp, cài đặt phần mềm) là yếu tố then chốt, không chỉ là bán thiết bị đơn thuần.
- Mỗi nhóm hàng (Mobile, Laptop, PC) có **bộ thông số kỹ thuật khác nhau**, khó quản lý bằng mô hình sản phẩm thông thường.
- Việc theo dõi từng máy cụ thể (qua **Serial/IMEI**) là bắt buộc nhưng thường bị bỏ ngỏ.

**Vấn đề cần giải quyết:**

| # | Bài toán | Hệ quả nếu không xử lý |
|---|----------|------------------------|
| 1 | Thông số kỹ thuật phức tạp, không đồng nhất giữa các nhóm hàng | Khách khó tìm đúng thiết bị theo nhu cầu (Gaming / Văn phòng / Đồ họa) |
| 2 | Thiếu công cụ so sánh trực quan | Khách phải tự đối chiếu thủ công, dễ rời bỏ |
| 3 | Bảo hành bằng thẻ giấy | Thất lạc, khó tra cứu, không xác thực được |
| 4 | Không theo dõi được từng máy cụ thể | Khó xử lý đổi trả, bảo hành, thất thoát kho |
| 5 | Tồn kho không đồng bộ tức thời | Tình trạng "vừa đặt xong thì báo hết hàng" |
| 6 | Giá trị giao dịch lớn | Cần đa dạng phương thức thanh toán + trả góp |

**Tóm tắt bài toán:** Xây dựng một hệ thống thương mại điện tử chuyên biệt cho ngành hàng công nghệ, lấy **dữ liệu thông số chuyên sâu**, **công cụ so sánh**, **bảo hành điện tử theo Serial/IMEI** và **quản lý kho theo từng máy** làm khác biệt cốt lõi.

---

## 2. Xác định mục tiêu hệ thống (System Objectives)

**Tầm nhìn:** Trở thành điểm đến tin cậy của cộng đồng yêu công nghệ — cung cấp giải pháp thiết bị toàn diện với **thông tin minh bạch nhất**.

**Mục tiêu cụ thể:**

| Mục tiêu | Mô tả | Tiêu chí đo lường (gợi ý) |
|----------|-------|----------------------------|
| **Chuyên sâu hóa dữ liệu** | Quản lý thông số kỹ thuật chi tiết cho từng nhóm hàng | Mỗi nhóm hàng có bộ thông số riêng được cấu hình động |
| **Công cụ so sánh mạnh mẽ** | So sánh trực quan sản phẩm cùng lúc | So sánh **tối thiểu 3 sản phẩm** trên một màn hình |
| **Số hóa bảo hành** | Bảo hành điện tử qua Serial/IMEI | Loại bỏ hoàn toàn thẻ bảo hành giấy |
| **Theo dõi từng máy** | Quản lý IMEI/Serial từ nhập kho đến tay khách | Truy vết được toàn bộ vòng đời mỗi máy |
| **Đồng bộ tồn kho** | Cập nhật tồn kho tức thời | Tránh bán vượt số lượng tồn thực |

---

## 3. Xác định Actor (Tác nhân)

Hệ thống có **4 nhóm tác nhân chính**:

| Actor | Vai trò | Hành vi / Trách nhiệm chính |
|-------|---------|------------------------------|
| **Khách hàng** (Customer) | Người mua | Tra cứu thông số · So sánh sản phẩm · Đặt hàng · Chọn hình thức trả góp · Theo dõi lịch sử bảo hành |
| **Kỹ thuật viên** (Technical Staff) | Hỗ trợ kỹ thuật & sửa chữa | Tiếp nhận máy bảo hành · Cập nhật tình trạng sửa chữa · Tư vấn kỹ thuật trực tuyến |
| **Quản trị viên kho** (Stock Manager) | Vận hành kho | Quản lý nhập hàng theo lô · Quản lý Serial/IMEI từng máy · Xử lý hàng đổi trả |
| **Quản trị viên hệ thống** (Admin) | Quản trị tổng thể | Quản lý danh mục kỹ thuật · Thiết lập giá bán · Quản lý đối tác vận chuyển · Xem báo cáo tài chính |

Ngoài ra, hệ thống tương tác với các **tác nhân phụ / ngoài hệ thống**:

| Tác nhân phụ / ngoài | Vai trò |
|----------------------|---------|
| **Khách vãng lai** (Guest) | Người dùng chưa đăng nhập; thực hiện thao tác công khai (tìm kiếm, lọc, xem chi tiết, so sánh, giỏ hàng, tra cứu bảo hành, gửi phiếu hỗ trợ) |
| **Đơn vị tài chính** | Đối tác ngoài xử lý hồ sơ trả góp |
| **Cổng thanh toán / Ngân hàng** | Hệ thống ngoài xác nhận giao dịch thanh toán (QR) |
| **Đối tác vận chuyển** | Đơn vị ngoài thực hiện giao nhận hàng hóa |

**Nhận xét phân tích:**
- Đây là hệ thống **đa vai trò vận hành** (multi-role back-office), không chỉ là website bán hàng B2C đơn giản.
- Quyền hạn phân tách rõ: nghiệp vụ kho (Stock Manager) tách biệt với nghiệp vụ kỹ thuật (Technical Staff) và quản trị (Admin) → cần cơ chế **phân quyền theo vai trò (RBAC)**.
- Hệ thống hỗ trợ thao tác công khai cho **Khách vãng lai** và tích hợp với các **tác nhân ngoài** (tài chính, thanh toán, vận chuyển).

---

## 4. Xác định các Module chức năng (Functional Modules)

Hệ thống được chia thành **4 phân hệ chức năng** chính:

### 4.1. Phân hệ Quản lý sản phẩm & thông số kỹ thuật
- **Cấu hình thông số động:** mỗi nhóm sản phẩm (Mobile, Laptop, PC) có bộ thông số riêng (VD: Laptop có "Số khe RAM", Mobile có "Số SIM").
- **Bộ so sánh sản phẩm (Compare Tool):** bảng so sánh các thông số kỹ thuật tương đương giữa các model được chọn.
- **Quản lý linh kiện đi kèm (Cross-sell):** gợi ý sản phẩm mua kèm (bao da, chuột, lót phím) tương thích với sản phẩm chính — gồm cả phần **khách hàng xem gợi ý** và **Admin cấu hình danh sách mua kèm**.

### 4.2. Phân hệ Giao dịch & tài chính
- **Hỗ trợ trả góp (Installment):** công cụ tính số tiền trả trước và lãi suất hàng tháng theo các đơn vị tài chính.
- **Thanh toán đa kênh:** thẻ, ví điện tử, chuyển khoản ngân hàng — phục vụ giao dịch giá trị lớn.

### 4.3. Phân hệ Bảo hành & hậu mãi (CRM)
- **Tra cứu bảo hành điện tử:** khách nhập Serial/IMEI để biết thời hạn bảo hành còn lại.
- **Yêu cầu bảo hành (Warranty Claim):** khách gửi yêu cầu bảo hành gắn với thiết bị (Serial/IMEI), tách biệt với phiếu hỗ trợ chung.
- **Hệ thống Ticket:** gửi yêu cầu hỗ trợ kỹ thuật / báo lỗi sản phẩm trực tuyến.

### 4.4. Phân hệ Quản trị kho (Inventory Control)
- **Quản lý IMEI/Serial:** *(bắt buộc)* theo dõi từng chiếc máy cụ thể từ lúc nhập kho đến tay khách hàng.
- **Cảnh báo hàng tồn kho lâu ngày:** thống kê mẫu máy lỗi thời để Marketing xả hàng.

**Sơ đồ tổng quan module:**

```
                    HỆ THỐNG TECH STORE
                            │
   ┌────────────┬───────────┴───────────┬──────────────┐
   │            │                       │              │
[4.1]        [4.2]                   [4.3]          [4.4]
Sản phẩm    Giao dịch              Bảo hành        Quản trị kho
& Thông số  & Tài chính            & CRM           (Inventory)
   │            │                       │              │
- Specs động  - Trả góp             - Tra cứu BH    - IMEI/Serial
- Compare     - Thanh toán          - Ticket        - Cảnh báo tồn
- Cross-sell    đa kênh                              
```

---

## 5. Yêu cầu phi chức năng (Non-functional Requirements)

| # | Yêu cầu | Nội dung | Hàm ý kỹ thuật (phân tích) |
|---|---------|----------|----------------------------|
| 1 | **Độ chính xác (Accuracy)** | Thông tin cấu hình phải chính xác 100%, tránh khiếu nại | Kiểm soát chất lượng dữ liệu specs; quy trình duyệt nội dung |
| 2 | **Bảo mật (Security)** | Bảo vệ tuyệt đối thông tin giao dịch & dữ liệu cá nhân (SĐT, địa chỉ) | Mã hóa dữ liệu nhạy cảm; phân quyền; tuân thủ bảo vệ dữ liệu |
| 3 | **Hiệu năng (Performance)** | Tối ưu tìm kiếm & lọc trên **hàng nghìn sản phẩm** | Lập chỉ mục (index), bộ lọc theo thông số, caching |
| 4 | **Tin cậy (Reliability)** | Đồng bộ tồn kho **tức thời**, tránh "đặt xong báo hết hàng" | Khóa tồn kho khi đặt hàng; nhất quán dữ liệu kho |
| 5 | **Tương thích (Compatibility)** | Hiển thị tốt bảng thông số phức tạp trên **màn hình điện thoại nhỏ** | Thiết kế responsive cho bảng dữ liệu dày đặc |

---

## 6. Nhận xét & kết luận phân tích

**Điểm đặc thù tạo nên độ phức tạp của hệ thống:**

1. **Thông số động theo nhóm hàng** — không thể dùng một schema sản phẩm cố định; cần mô hình thuộc tính linh hoạt (EAV / cấu hình theo danh mục).
2. **Quản lý theo từng máy (IMEI/Serial)** — đơn vị tồn kho không phải "loại sản phẩm" mà là "từng thiết bị cụ thể", ảnh hưởng đến toàn bộ luồng nhập kho → bán → bảo hành → đổi trả.
3. **Bảo hành điện tử + Ticket** — gắn vòng đời hậu mãi vào từng Serial/IMEI, liên kết Customer ↔ Technical Staff.
4. **Trả góp & thanh toán đa kênh** — tích hợp đối tác tài chính bên ngoài, phát sinh yêu cầu về bảo mật và đối soát.

**Mối liên hệ Actor – Module (ma trận tổng quan):**

| Module \ Actor | Khách hàng | Kỹ thuật viên | QTV Kho | Admin |
|----------------|:----------:|:-------------:|:-------:|:-----:|
| 4.1 Sản phẩm & Specs | Xem / So sánh | — | — | Quản lý |
| 4.2 Giao dịch & Tài chính | Mua / Trả góp | — | — | Cấu hình giá |
| 4.3 Bảo hành & CRM | Tra cứu / Gửi ticket | Xử lý ticket / sửa chữa | — | Giám sát |
| 4.4 Quản trị kho | — | — | Nhập kho / IMEI / Đổi trả | Báo cáo |

**Kết luận:** Yêu cầu đã đủ rõ để xác định phạm vi hệ thống ở mức phân tích. Bốn phân hệ chức năng, bốn nhóm tác nhân và năm yêu cầu phi chức năng tạo thành khung nền cho các giai đoạn tiếp theo (đặc tả chi tiết, thiết kế). Yếu tố cốt lõi cần được ưu tiên thiết kế kỹ là **mô hình thông số động** và **quản lý kho theo IMEI/Serial**, vì hai yếu tố này chi phối hầu hết các phân hệ còn lại.
