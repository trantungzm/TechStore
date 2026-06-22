# Danh sách card Trello — TechStore (lộ trình 5 tuần)

Card được nhóm theo **tuần**. Mỗi dòng là 1 card.
Định dạng: `[Module] Việc` — **(Người phụ trách)** — `Label`

Quy ước nhãn (label):
🟦 Backend/API · 🟩 Frontend · 🟨 DB/Migration · 🟥 Bug · ⬜ Tài liệu

---

## Tuần 1 — Khởi tạo & Xác thực

- `[Setup]` Khởi tạo repo, cấu trúc solution, `.gitignore`, README — **(TV1)** — ⬜
- `[Setup]` Viết CONTRIBUTING.md (quy ước nhánh + commit) — **(TV1)** — ⬜
- `[DB]` Kết nối database, cấu hình `appsettings.json`, migration entity — **(TV1)** — 🟨
- `[Gateway]` Cấu hình ApiGateway định tuyến tới các service — **(TV1)** — 🟦
- `[Auth]` API đăng ký / đăng nhập + JWT (AuthController) — **(TV1)** — 🟦
- `[Auth]` Quản lý User & phân quyền (UserController, RolesController) — **(TV1)** — 🟦
- `[Frontend]` Khởi tạo Vite, cấu hình proxy `/api` & `/uploads` — **(TV3)** — 🟩
- `[Frontend]` Trang đăng nhập / đăng ký, lưu token — **(TV3)** — 🟩
- `[Docs]` Tạo Google Drive, mẫu biên bản họp — **(TV3)** — ⬜

## Tuần 2 — Sản phẩm & Danh mục

- `[Products]` API CRUD + lọc sản phẩm theo danh mục/từ khóa — **(TV2)** — 🟦
- `[Products]` API biến thể & thông số (ProductVariant, SpecsController) — **(TV2)** — 🟦
- `[Categories]` API CRUD danh mục (CategoriesController) — **(TV2)** — 🟦
- `[Brands]` / `[Suppliers]` API thương hiệu & nhà cung cấp — **(TV2)** — 🟦
- `[Uploads]` API upload ảnh sản phẩm (UploadsController) — **(TV2)** — 🟦
- `[Frontend]` Trang danh sách sản phẩm + bộ lọc — **(TV3)** — 🟩
- `[Frontend]` Trang chi tiết sản phẩm — **(TV3)** — 🟩
- `[Banners]` API banner trang chủ (BannersController) — **(TV1)** — 🟦

## Tuần 3 — Giỏ hàng, Đặt hàng, Thanh toán

- `[Orders]` API tạo & quản lý đơn hàng (OrdersController) — **(TV2)** — 🟦
- `[Inventory]` API tồn kho, đồng bộ StockItems (InventoryController) — **(TV2)** — 🟦
- `[Coupons]` API mã giảm giá (CouponsController) — **(TV2)** — 🟦
- `[Payments]` API thanh toán QR mock (PaymentsController) — **(TV2)** — 🟦
- `[Frontend]` Giỏ hàng (thêm/xóa/cập nhật số lượng) — **(TV3)** — 🟩
- `[Frontend]` Luồng checkout (địa chỉ / nhận tại cửa hàng) — **(TV3)** — 🟩
- `[Frontend]` Màn hình thanh toán QR + polling trạng thái — **(TV3)** — 🟩

## Tuần 4 — Mở rộng nghiệp vụ & Quản trị

- `[Warranty]` / `[Repairs]` API bảo hành & sửa chữa — **(TV2)** — 🟦
- `[Tickets]` API yêu cầu hỗ trợ (TicketsController) — **(TV2)** — 🟦
- `[Notifications]` API thông báo (NotificationsController) — **(TV1)** — 🟦
- `[Recommendations]` API gợi ý sản phẩm (RecommendationsController) — **(TV2)** — 🟦
- `[AuditLog]` Ghi nhật ký thao tác (AuditLog service) — **(TV1)** — 🟦
- `[Frontend]` Trang chủ: banner, sản phẩm gợi ý — **(TV3)** — 🟩
- `[Frontend]` Trang quản trị (admin): sản phẩm, đơn hàng — **(TV3)** — 🟩

## Tuần 5 — Kiểm thử, Hoàn thiện & Báo cáo

- `[Test]` Kiểm thử luồng đăng nhập → mua hàng → thanh toán — **(Cả nhóm)** — 🟥
- `[Test]` Kiểm thử API bằng Postman, lưu collection — **(TV2)** — ⬜
- `[Bug]` Sửa lỗi tồn kho / hiển thị ảnh / phân quyền — **(Cả nhóm)** — 🟥
- `[Chore]` Dọn code, xóa file thừa, cập nhật README — **(TV1)** — ⬜
- `[Docs]` Viết tài liệu báo cáo cuối kỳ — **(TV3)** — ⬜
- `[Docs]` Làm slide trình bày — **(Cả nhóm)** — ⬜
- `[Demo]` Chuẩn bị kịch bản demo sản phẩm — **(Cả nhóm)** — ⬜
- `[Release]` Gắn tag phiên bản, merge `dev` → `main` — **(TV1)** — 🟦

---

> **Lưu ý chấm điểm:** mỗi card khi chuyển sang `Done` phải đính kèm link commit/PR.
> Mỗi thành viên cần commit đều đặn hàng tuần (xem GitHub → Insights → Contributors).
