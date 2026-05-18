using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BaseCore.Entities
{
    public class WarrantyRecord
    {
        public int Id { get; set; }
        public string WarrantyCode { get; set; } = "";

        [BsonRepresentation(BsonType.String)]
        public Guid? UserId { get; set; }

        public int? OrderId { get; set; }
        public int? OrderDetailId { get; set; }
        public int ProductId { get; set; }
        public int? VariantId { get; set; }
        public int? StockItemId { get; set; }
        public string? SerialOrImei { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string? CustomerEmail { get; set; }
        public string? ProductName { get; set; }
        public string? ProductImage { get; set; }
        public int WarrantyMonths { get; set; } = 12;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = "Active";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public string? Note { get; set; }

        [BsonIgnore] public Order? Order { get; set; }
        [BsonIgnore] public OrderDetail? OrderDetail { get; set; }
        [BsonIgnore] public Product? Product { get; set; }
        [BsonIgnore] public ProductVariant? Variant { get; set; }
        [BsonIgnore] public StockItem? StockItem { get; set; }
    }
}
