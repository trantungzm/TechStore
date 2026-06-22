# Quy ước làm việc nhóm — TechStore (BaseCore)

> Tài liệu này quy định cách cả nhóm dùng **Git/GitHub** và **Trello** để đảm bảo
> tiến độ minh bạch, không bị trừ điểm theo yêu cầu môn Thực tập nhóm CNTT59.
>
> Repo: https://github.com/trantungzm/TechStore

## 1. Thành viên & phân công

| Thành viên | Vai trò | Module phụ trách |
|---|---|---|
| **TV1 – Backend/Auth** | Lead backend | AuthService (Auth, User, Roles), ApiGateway, phân quyền, DB/Migration |
| **TV2 – Backend nghiệp vụ** | API nghiệp vụ | Products, Categories, Orders, Payments, Coupons, Inventory, Warranty, Repairs, Tickets, Suppliers |
| **TV3 – Frontend + Tài liệu** | Frontend & báo cáo | Giao diện (Vite), tích hợp API, Banners/Notifications UI, slide + tài liệu + biên bản họp |

> Phân công có thể đổi theo tuần, nhưng **mỗi card Trello luôn phải có người phụ trách**.

## 2. Quy trình Git

### Mô hình nhánh

```
main          ← nhánh ổn định, CHỈ merge qua Pull Request
 └─ dev       ← nhánh tích hợp (gộp việc 3 người trước khi lên main)
     ├─ feature/<ten-viec>     (mỗi tính năng 1 nhánh)
     ├─ fix/<ten-loi>          (mỗi bug 1 nhánh)
     └─ docs/<ten-tai-lieu>
```

**Quy tắc:**
- **KHÔNG commit thẳng vào `main`.** `main` chỉ nhận merge từ `dev` qua Pull Request.
- Mỗi người làm trên nhánh `feature/...` riêng, đặt tên rõ ràng, ví dụ:
  `feature/product-filter`, `feature/auth-login`, `fix/inventory-stock`.
- Trước khi tạo nhánh mới, luôn cập nhật code mới nhất:
  ```bash
  git checkout dev
  git pull origin dev
  git checkout -b feature/ten-viec
  ```

### Quy ước commit message (Conventional Commits)

```
<loại>: mô tả ngắn gọn (tiếng Việt, dưới 72 ký tự)
```

| Loại | Dùng khi |
|------|----------|
| `feat` | Thêm tính năng mới |
| `fix` | Sửa lỗi |
| `docs` | Tài liệu, README, comment |
| `refactor` | Sửa cấu trúc code, không đổi hành vi |
| `style` | Format, đặt tên, không đổi logic |
| `test` | Thêm/sửa test |
| `chore` | Cấu hình, dependency, dọn dẹp |

Ví dụ:
```
feat: thêm API lọc sản phẩm theo danh mục
fix: sửa lỗi tính tồn kho khi xuất hóa đơn
docs: cập nhật hướng dẫn chạy dự án trong README
```

### Pull Request (PR)

1. Push nhánh feature lên GitHub.
2. Tạo PR từ `feature/...` → `dev`.
3. **Ít nhất 1 thành viên khác review** rồi mới merge.
4. Dán **link PR vào card Trello** tương ứng.
5. Xóa nhánh feature sau khi merge.

### Nguyên tắc tránh bị trừ điểm

- **Mỗi thành viên commit đều đặn** (tối thiểu vài lần/tuần). Giảng viên xem được
  ở tab **Insights → Contributors** trên GitHub.
- Commit nhỏ, có ý nghĩa — không gộp cả tuần vào 1 commit khổng lồ.
- Mỗi card Trello "Done" phải có link commit/PR chứng minh.

## 3. Quy trình Trello

**Các cột (list):** `Backlog` → `To Do (Sprint tuần này)` → `Doing` → `Review/Testing` → `Done`

**Quy ước card:**
- Tiêu đề: `[Module] Việc cần làm` — ví dụ `[Products] API lọc theo category`
- Gán **member** phụ trách (bắt buộc).
- **Label màu:** 🟦 Backend/API · 🟩 Frontend · 🟨 Database/Migration · 🟥 Bug · ⬜ Tài liệu
- Có **due date** và **checklist** chia nhỏ bước.
- Đính kèm **link commit/PR GitHub** khi xong.

Danh sách card mẫu xem ở file `docs/trello-cards.md`.

## 4. Họp nhóm

- Họp định kỳ **hàng tuần**, có **biên bản** lưu trên Google Drive.
- Sau mỗi buổi họp: cập nhật Trello cho sprint tuần kế tiếp.

---
_Cập nhật quy ước này khi nhóm thống nhất thay đổi._
