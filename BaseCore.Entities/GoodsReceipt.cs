using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BaseCore.Entities
{
    public class GoodsReceipt
    {
        [BsonId]
        public int Id { get; set; }
        public string ReceiptCode { get; set; } = "";
        public string SupplierName { get; set; } = "";
        public int? WarehouseId { get; set; }
        public DateTime ReceivedAt { get; set; } = DateTime.UtcNow;

        [BsonRepresentation(BsonType.String)]
        public Guid? CreatedByUserId { get; set; }

        public string? Note { get; set; }
        public int TotalQuantity { get; set; }
        public decimal TotalCost { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        [BsonIgnore]
        public Warehouse? Warehouse { get; set; }

        [BsonIgnore]
        public List<GoodsReceiptLine> Lines { get; set; } = new();
    }
}
