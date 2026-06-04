# Inventory Management Module

## Tổng quan
Module quản trị kho trong dự án BaseCore quản lý:
- Nhập hàng (goods receipts)
- Quản lý tồn kho theo serial/IMEI
- Tra cứu hàng tồn, kiểm kê, hàng lâu tồn (aged stock)
- Điều chỉnh trạng thái kho của từng stock item
- Gắn serial cho đơn hàng
- Xử lý trả hàng và nhập lại kho
- Ghi nhận lịch sử di chuyển tồn kho (stock movements)

## Thành phần chính

### Backend
- `BaseCore.APIService.Controllers.InventoryController.cs`
  - Route chính: `api/inventory`
  - Các endpoint quan trọng:
    - `POST /inventory/receipts` - tạo phiếu nhập kho
    - `GET /inventory/receipts` - lấy danh sách phiếu nhập
    - `GET /inventory/receipts/{id}` - chi tiết phiếu nhập
    - `GET /inventory/stock-items` - danh sách stock item
    - `GET /inventory/stock-items/lookup` - tra cứu theo serial/IMEI
    - `GET /inventory/stock-items/{id}` - chi tiết stock item
    - `PUT /inventory/stock-items/{id}/status` - cập nhật trạng thái stock item
    - `POST /inventory/assign-stock-items` - gắn stock item vào đơn hàng
    - `GET /inventory/aged-stock` - xem hàng tồn lâu
    - `POST /inventory/returns` - tạo yêu cầu trả hàng
    - `GET /inventory/returns` - danh sách yêu cầu trả hàng
    - `GET /inventory/returns/{id}` - chi tiết trả hàng
    - `PUT /inventory/returns/{id}/review` - duyệt yêu cầu trả hàng
    - `PUT /inventory/returns/{id}/restock` - xử lý nhập lại kho sau trả hàng
    - `GET /inventory/movements` - lấy lịch sử di chuyển kho
  - Phân quyền:
    - `Admin`, `Warehouse` được phép tạo/đọc phiếu nhập và tham chiếu tồn kho
    - `Admin`, `Warehouse`, `Technical` được phép xem danh sách và tra cứu stock item
    - `Admin`, `Technical` được phép tạo và xử lý trả hàng

- `BaseCore.Services.InventoryService.cs`
  - Cài đặt logic nghiệp vụ cho module kho.
  - Xử lý validate và tạo `GoodsReceipt`, `StockItem`, `StockMovement`, `InventoryReturn`.
  - Cập nhật số lượng và trạng thái sản phẩm/variant.
  - Kiểm tra serial/IMEI trùng lặp và bắt buộc với sản phẩm cần theo dõi serial.
  - Ghi nhận các movement type như: `Receipt`, `Sale`, `Return`, `Adjust`, `Damage`, `Repair`, `Warranty`.
  - Sinh mã phiếu:
    - Receipt: `GR-{yyyyMMdd}-{id}`
    - Return: `RT-{yyyyMMdd}-{id}`

- `BaseCore.Services.IInventoryService.cs`
  - Định nghĩa API service để controller sử dụng.

- `BaseCore.DTO.Inventory.InventoryDtos.cs`
  - Định nghĩa tất cả DTO đầu vào / đầu ra liên quan đến kho:
    - `CreateGoodsReceiptDto`, `GoodsReceiptDto`, `GoodsReceiptLineDto`
    - `StockItemDto`, `StockItemLookupDto`, `UpdateStockItemStatusDto`, `AssignStockItemsDto`
    - `AgedStockDto`
    - `CreateInventoryReturnDto`, `InventoryReturnDto`, `ReviewInventoryReturnDto`, `RestockReturnDto`
    - `StockMovementDto`
    - `InventorySearchDto`, `InventoryReturnSearchDto`, `AgedStockSearchDto`

- `BaseCore.Repository.EFCore.InventoryRepository.cs`
  - Repository truy cập dữ liệu cho thành phần kho.
  - Tìm kiếm stock item, nhận hàng, trả hàng, aged stock, movement.

## Luồng nghiệp vụ chính

### 1. Tạo phiếu nhập kho
- Người dùng `Admin` hoặc `Warehouse` gửi `CreateGoodsReceiptDto`.
- Hệ thống kiểm tra:
  - `CategoryId`, `SupplierId` và `Lines` phải hợp lệ.
  - Nếu sản phẩm yêu cầu serial tracking, số serial phải bằng số lượng và không trùng.
- Cập nhật tồn kho cho product/variant.
- Tạo `StockItem` nếu sản phẩm có serial.
- Ghi log di chuyển kho `StockMovement`.

### 2. Quản lý stock item
- `GET /inventory/stock-items`: tìm kiếm theo keyword, status, productId, minDays, warehouse.
- `GET /inventory/stock-items/lookup`: tra cứu theo `serialOrImei`.
- `PUT /inventory/stock-items/{id}/status`: cập nhật trạng thái hiện tại.
- `POST /inventory/assign-stock-items`: gắn stock item đã có vào order detail, chuyển trạng thái sang `Sold`.

### 3. Hàng tồn lâu (Aged Stock)
- `GET /inventory/aged-stock` trả về list các stock item đã nằm trong kho quá số ngày tối thiểu `minDays`.

### 4. Trả hàng
- `POST /inventory/returns`: tạo yêu cầu trả hàng với trạng thái `Pending`.
- `PUT /inventory/returns/{id}/review`: duyệt hoặc từ chối trả hàng.
- `PUT /inventory/returns/{id}/restock`: sau khi duyệt, có thể nhập lại hàng với trạng thái `InStock` hoặc `Damaged`.
- Nếu restock lại về `InStock`, sản phẩm được cộng lại vào tồn kho và ghi log movement.

### 5. Lịch sử di chuyển kho
- `GET /inventory/movements` trả về danh sách `StockMovementDto` với các thông tin:
  - `Type`, `Quantity`, `FromStatus`, `ToStatus`, `ReferenceType`, `ReferenceId`, `Note`.

## Frontend liên quan

### `BaseCore.WebClient/src/pages/AdminInventory.jsx`
- Trang quản trị kho cho Admin/Warehouse/Technical.
- Hiển thị:
  - menu điều hướng nhập kho / trả hàng
  - bộ lọc tồn kho
  - bảng stock items
  - tìm kiếm serial nhanh
  - xem preview đơn hàng/trả hàng
- Logic quan trọng:
  - `loadProducts()`, `loadCategories()`, `loadSuppliers()`, `loadStock()`
  - `serialValidation` để kiểm tra file serial và serial nhập thủ công
  - phân quyền hiển thị: chỉ Admin/Warehouse mới thấy phần nhập kho, Admin/Technical thấy phần trả hàng

### `BaseCore.WebClient/src/services/api.js`
- `inventoryApi` sử dụng các endpoint backend:
  - `createReceipt`
  - `getStockItems`
  - `getAgedStock`
  - `lookupStockItem`
  - `returnItem`
  - `reviewReturn`
  - `restockReturn`
- Ngoài ra còn có API nhà cung cấp (`/suppliers`) để lấy/danh sách và quản lý supplier.

## Quy tắc trạng thái và điều kiện

### Stock statuses
- `InStock`
- `Reserved`
- `Sold`
- `Returned`
- `Repairing`
- `Warranty`
- `Damaged`
- `Lost`

### Return statuses
- `Pending`
- `Approved`
- `Rejected`
- `Restocked`
- `Damaged`

### Return conditions
- `New`
- `OpenBox`
- `Used`
- `Damaged`
- `Defective`

## Ghi chú triển khai
- Phân quyền được kiểm soát cả ở controller và frontend.
- Serial/IMEI là bắt buộc với sản phẩm cần tracking và phải không trùng.
- `AssignStockItemsAsync` bảo đảm số lượng stock item bằng số lượng order detail và chỉ gán stock item đang `InStock` hoặc `Reserved`.
- `RestockReturnAsync` chỉ cho phép với trả hàng đã duyệt (`Approved`).

## File liên quan
- `BaseCore.APIService/Controllers/InventoryController.cs`
- `BaseCore.Services/InventoryService.cs`
- `BaseCore.Services/IInventoryService.cs`
- `BaseCore.DTO/Inventory/InventoryDtos.cs`
- `BaseCore.Repository/EFCore/InventoryRepository.cs`
- `BaseCore.WebClient/src/pages/AdminInventory.jsx`
- `BaseCore.WebClient/src/services/api.js`
- `database/sync_techstore_inventory_schema.sql`

## Kết luận
Module kho của BaseCore hiện đã hỗ trợ đủ luồng nhập kho, theo dõi serial, gán hàng cho đơn, kiểm kê tồn lâu, và xử lý trả hàng. Nếu cần, tôi có thể tiếp tục mở rộng bằng sơ đồ Use Case hoặc tạo tài liệu HTML/chi tiết cụ thể cho từng API endpoint.