using MongoDB.Bson.Serialization.Attributes;

namespace BaseCore.Entities
{
    public class OrderDetail
    {
        [BsonId]
        public int Id { get; set; }

        public int OrderId { get; set; }

        public int ProductId { get; set; }
        public int? VariantId { get; set; }

        public string? ProductName { get; set; }
        public string? ProductImage { get; set; }
        public string? Sku { get; set; }
        public string? SelectedColor { get; set; }
        public string? SelectedVersion { get; set; }

        public int Quantity { get; set; }

        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public string? SerialOrImei { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonIgnore]
        public Order? Order { get; set; }

        [BsonIgnore]
        public Product? Product { get; set; }

        [BsonIgnore]
        public ProductVariant? Variant { get; set; }

        [BsonIgnore]
        public List<OrderDetailStockItem> StockItems { get; set; } = new();
    }
}
