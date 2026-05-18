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
            new Category { Id = 4, Name = "Gaming", Description = "Thiet bi cho game thu" }
        ];

        public List<Product> Products { get; } =
        [
            new Product { Id = 1, Name = "iPhone 15 Pro", Price = 28990000, Stock = 12, CategoryId = 1, Description = "Flagship Apple smartphone", ImageUrl = "", RequiresSerialTracking = true },
            new Product { Id = 2, Name = "Samsung Galaxy S24", Price = 21990000, Stock = 15, CategoryId = 1, Description = "Android flagship phone", ImageUrl = "", RequiresSerialTracking = true },
            new Product { Id = 3, Name = "Dell XPS 15", Price = 35990000, Stock = 8, CategoryId = 2, Description = "High-end productivity laptop", ImageUrl = "", RequiresSerialTracking = true },
            new Product { Id = 4, Name = "MacBook Air M3", Price = 31990000, Stock = 10, CategoryId = 2, Description = "Lightweight Apple laptop", ImageUrl = "", RequiresSerialTracking = true },
            new Product { Id = 5, Name = "AirPods Pro", Price = 5990000, Stock = 25, CategoryId = 3, Description = "Wireless earbuds", ImageUrl = "" },
            new Product { Id = 6, Name = "Mechanical Keyboard", Price = 2490000, Stock = 18, CategoryId = 4, Description = "RGB mechanical keyboard", ImageUrl = "" }
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
        public List<StockItem> StockItems { get; } = [];
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
        public int NextStockItemId => StockItems.Count == 0 ? 1 : StockItems.Max(x => x.Id) + 1;
        public int NextGoodsReceiptId => GoodsReceipts.Count == 0 ? 1 : GoodsReceipts.Max(x => x.Id) + 1;
        public int NextGoodsReceiptLineId => GoodsReceiptLines.Count == 0 ? 1 : GoodsReceiptLines.Max(x => x.Id) + 1;
        public int NextGoodsReceiptSerialId => GoodsReceiptSerials.Count == 0 ? 1 : GoodsReceiptSerials.Max(x => x.Id) + 1;
        public int NextStockMovementId => StockMovements.Count == 0 ? 1 : StockMovements.Max(x => x.Id) + 1;
        public int NextInventoryReturnId => InventoryReturns.Count == 0 ? 1 : InventoryReturns.Max(x => x.Id) + 1;
        public int NextOrderDetailStockItemId => OrderDetailStockItems.Count == 0 ? 1 : OrderDetailStockItems.Max(x => x.Id) + 1;
    }
}
