using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BaseCore.Entities
{
    public class StockItem
    {
        [BsonId]
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int? VariantId { get; set; }
        public int? WarehouseId { get; set; }
        public int? SupplierId { get; set; }
        public string SerialOrImei { get; set; } = "";
        public string? Sku { get; set; }
        public string Status { get; set; } = "InStock";
        public decimal UnitCost { get; set; }
        public string? SupplierName { get; set; }
        public DateTime ReceivedAt { get; set; } = DateTime.UtcNow;
        public DateTime? SoldAt { get; set; }
        public int? OrderId { get; set; }
        public int? OrderDetailId { get; set; }

        [BsonRepresentation(BsonType.String)]
        public Guid? CustomerId { get; set; }

        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        [BsonIgnore]
        public Supplier? Supplier { get; set; }

        [BsonIgnore]
        public Product? Product { get; set; }

        [BsonIgnore]
        public ProductVariant? Variant { get; set; }

        [BsonIgnore]
        public Warehouse? Warehouse { get; set; }

        [BsonIgnore]
        public Order? Order { get; set; }

        [BsonIgnore]
        public OrderDetail? OrderDetail { get; set; }
    }
}
