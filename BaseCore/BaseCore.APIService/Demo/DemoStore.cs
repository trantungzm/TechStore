using BaseCore.Entities;

namespace BaseCore.APIService.Demo
{
    public class DemoStore
    {
        public List<Category> Categories { get; } =
        [
            new Category { Id = 1, Name = "Smartphone", Description = "Dien thoai va thiet bi di dong" },
            new Category { Id = 2, Name = "Laptop", Description = "Laptop va may tinh xach tay" },
            new Category { Id = 3, Name = "Accessories", Description = "Phu kien dien tu" },
            new Category { Id = 4, Name = "Tablet", Description = "May tinh bang" },
            new Category { Id = 5, Name = "Dong ho thong minh", Description = "Dong ho thong minh" },
            new Category { Id = 6, Name = "May anh", Description = "May anh va thiet bi quay video" },
            new Category { Id = 7, Name = "Tai nghe", Description = "Tai nghe va thiet bi am thanh" }
        ];

        public List<Product> Products { get; } =
        [
            new Product { Id = 1, Name = "iPhone 15 Pro", Price = 28990000, Stock = 12, CategoryId = 1, Description = "Flagship Apple smartphone", ImageUrl = "", RequiresSerialTracking = true, SupplierId = 1, BackupSupplierId = 2, SupplyType = "Official", WarrantyProvider = "Apple" },
            new Product { Id = 2, Name = "Samsung Galaxy S24", Price = 21990000, Stock = 15, CategoryId = 1, Description = "Android flagship phone", ImageUrl = "", RequiresSerialTracking = true, SupplierId = 4, BackupSupplierId = 1, SupplyType = "Official", WarrantyProvider = "Samsung Viet Nam" },
            new Product { Id = 3, Name = "Dell XPS 15", Price = 35990000, Stock = 8, CategoryId = 2, Description = "High-end productivity laptop", ImageUrl = "", RequiresSerialTracking = true, SupplierId = 1, BackupSupplierId = 2, SupplyType = "Distributor", WarrantyProvider = "Hang san xuat" },
            new Product { Id = 4, Name = "MacBook Air M3", Price = 31990000, Stock = 10, CategoryId = 2, Description = "Lightweight Apple laptop", ImageUrl = "", RequiresSerialTracking = true, SupplierId = 1, BackupSupplierId = 2, SupplyType = "Official", WarrantyProvider = "Apple" },
            new Product { Id = 5, Name = "AirPods Pro", Price = 5990000, Stock = 25, CategoryId = 7, Description = "Wireless earbuds", ImageUrl = "" },
            new Product { Id = 6, Name = "iPad Pro 12.9", Price = 25990000, Stock = 14, CategoryId = 4, Description = "Large tablet for professionals", ImageUrl = "", RequiresSerialTracking = true }
        ];

        public List<Order> Orders { get; } = [];
        public List<OrderDetail> OrderDetails { get; } = [];
        public List<OrderTimeline> OrderTimelines { get; } = [];
        public List<OrderCancellation> OrderCancellations { get; } = [];
        public List<ProductImage> ProductImages { get; } = [];
        public List<ProductVariant> ProductVariants { get; } = [];
        public List<SpecDefinition> SpecDefinitions { get; } = [];
        public List<ProductSpecValue> ProductSpecValues { get; } = [];
        public List<ProductRecommendation> ProductRecommendations { get; } = [];
        public List<Warehouse> Warehouses { get; } = [new Warehouse { Id = 1, Name = "CNTHHT Main Store", Code = "MAIN", Address = "Main store" }];
        public List<Supplier> Suppliers { get; } =
        [
            new Supplier { Id = 1, SupplierCode = "SUP-SYNNEX-FPT", Name = "Synnex FPT", SupplierType = SupplierType.AuthorizedDistributor, Phone = "19006600", Email = "contact@synnexfpt.com", Address = "Vietnam", IsActive = true },
            new Supplier { Id = 2, SupplierCode = "SUP-DIGIWORLD", Name = "Digiworld", SupplierType = SupplierType.AuthorizedDistributor, Phone = "02839299959", Email = "contact@digiworld.com.vn", Address = "Vietnam", IsActive = true },
            new Supplier { Id = 3, SupplierCode = "SUP-PETROSETCO", Name = "Petrosetco", SupplierType = SupplierType.Tier1Distributor, Phone = "02854168686", Email = "contact@petrosetco.com.vn", Address = "Vietnam", IsActive = true },
            new Supplier { Id = 4, SupplierCode = "SUP-SAMSUNG-VN", Name = "Samsung Viet Nam", SupplierType = SupplierType.OfficialBrand, Phone = "1800588899", Email = "support.vn@samsung.com", Address = "Vietnam", IsActive = true },
            new Supplier { Id = 5, SupplierCode = "SUP-XIAOMI-VN", Name = "Xiaomi Viet Nam", SupplierType = SupplierType.OfficialBrand, Phone = "1800400410", Email = "service.vn@xiaomi.com", Address = "Vietnam", IsActive = true },
            new Supplier { Id = 6, SupplierCode = "SUP-OPPO-VN", Name = "OPPO Viet Nam", SupplierType = SupplierType.OfficialBrand, Phone = "1800577776", Email = "support.vn@oppo.com", Address = "Vietnam", IsActive = true },
            new Supplier { Id = 7, SupplierCode = "SUP-SONY-VN", Name = "Sony Viet Nam", SupplierType = SupplierType.OfficialBrand, Phone = "1800585885", Email = "support.vn@sony.com", Address = "Vietnam", IsActive = true },
            new Supplier { Id = 8, SupplierCode = "SUP-CANON-VN", Name = "Canon Viet Nam", SupplierType = SupplierType.OfficialBrand, Phone = "1900558800", Email = "support@canon.com.vn", Address = "Vietnam", IsActive = true }
        ];
        public List<StockItem> StockItems { get; } = [];
        public List<CategorySupplier> CategorySuppliers { get; } =
        [
            new CategorySupplier { Id = 1, CategoryId = 1, SupplierId = 1, SortOrder = 1, IsActive = true },
            new CategorySupplier { Id = 2, CategoryId = 1, SupplierId = 2, SortOrder = 2, IsActive = true },
            new CategorySupplier { Id = 3, CategoryId = 2, SupplierId = 1, SortOrder = 1, IsActive = true },
            new CategorySupplier { Id = 4, CategoryId = 2, SupplierId = 2, SortOrder = 2, IsActive = true },
            new CategorySupplier { Id = 5, CategoryId = 4, SupplierId = 2, SortOrder = 1, IsActive = true },
            new CategorySupplier { Id = 6, CategoryId = 4, SupplierId = 4, SortOrder = 2, IsActive = true },
            new CategorySupplier { Id = 7, CategoryId = 5, SupplierId = 2, SortOrder = 1, IsActive = true },
            new CategorySupplier { Id = 8, CategoryId = 5, SupplierId = 4, SortOrder = 2, IsActive = true },
            new CategorySupplier { Id = 9, CategoryId = 6, SupplierId = 7, SortOrder = 1, IsActive = true },
            new CategorySupplier { Id = 10, CategoryId = 6, SupplierId = 8, SortOrder = 2, IsActive = true },
            new CategorySupplier { Id = 11, CategoryId = 7, SupplierId = 7, SortOrder = 1, IsActive = true },
            new CategorySupplier { Id = 12, CategoryId = 7, SupplierId = 2, SortOrder = 2, IsActive = true }
        ];
        public List<GoodsReceipt> GoodsReceipts { get; } = [];
        public List<GoodsReceiptLine> GoodsReceiptLines { get; } = [];
        public List<GoodsReceiptSerial> GoodsReceiptSerials { get; } = [];
        public List<StockMovement> StockMovements { get; } = [];
        public List<InventoryReturn> InventoryReturns { get; } = [];
        public List<OrderDetailStockItem> OrderDetailStockItems { get; } = [];

        public int NextProductId => Products.Count == 0 ? 1 : Products.Max(x => x.Id) + 1;
        public int NextCategoryId => Categories.Count == 0 ? 1 : Categories.Max(x => x.Id) + 1;
        public int NextOrderId => Orders.Count == 0 ? 1 : Orders.Max(x => x.Id) + 1;
        public int NextOrderDetailId => OrderDetails.Count == 0 ? 1 : OrderDetails.Max(x => x.Id) + 1;
        public int NextOrderTimelineId => OrderTimelines.Count == 0 ? 1 : OrderTimelines.Max(x => x.Id) + 1;
        public int NextOrderCancellationId => OrderCancellations.Count == 0 ? 1 : OrderCancellations.Max(x => x.Id) + 1;
        public int NextProductImageId => ProductImages.Count == 0 ? 1 : ProductImages.Max(x => x.Id) + 1;
        public int NextProductVariantId => ProductVariants.Count == 0 ? 1 : ProductVariants.Max(x => x.Id) + 1;
        public int NextWarehouseId => Warehouses.Count == 0 ? 1 : Warehouses.Max(x => x.Id) + 1;
        public int NextSupplierId => Suppliers.Count == 0 ? 1 : Suppliers.Max(x => x.Id) + 1;
        public int NextCategorySupplierId => CategorySuppliers.Count == 0 ? 1 : CategorySuppliers.Max(x => x.Id) + 1;
        public int NextStockItemId => StockItems.Count == 0 ? 1 : StockItems.Max(x => x.Id) + 1;
        public int NextGoodsReceiptId => GoodsReceipts.Count == 0 ? 1 : GoodsReceipts.Max(x => x.Id) + 1;
        public int NextGoodsReceiptLineId => GoodsReceiptLines.Count == 0 ? 1 : GoodsReceiptLines.Max(x => x.Id) + 1;
        public int NextGoodsReceiptSerialId => GoodsReceiptSerials.Count == 0 ? 1 : GoodsReceiptSerials.Max(x => x.Id) + 1;
        public int NextStockMovementId => StockMovements.Count == 0 ? 1 : StockMovements.Max(x => x.Id) + 1;
        public int NextInventoryReturnId => InventoryReturns.Count == 0 ? 1 : InventoryReturns.Max(x => x.Id) + 1;
        public int NextOrderDetailStockItemId => OrderDetailStockItems.Count == 0 ? 1 : OrderDetailStockItems.Max(x => x.Id) + 1;
    }
}
