using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BaseCore.Entities
{
    public enum SupplierType
    {
        OfficialBrand = 0,
        AuthorizedDistributor = 1,
        Tier1Distributor = 2,
        WholesalePartner = 3
    }

    public class Supplier
    {
        [BsonId]
        public int Id { get; set; }

        public string SupplierCode { get; set; } = "";
        public string Name { get; set; } = "";
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? TaxCode { get; set; }
        public string? ContactPerson { get; set; }
        public SupplierType SupplierType { get; set; } = SupplierType.AuthorizedDistributor;
        public string? Note { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        [BsonIgnore]
        public string Code
        {
            get => SupplierCode;
            set => SupplierCode = value;
        }

        [BsonIgnore]
        public List<GoodsReceipt> GoodsReceipts { get; set; } = new();

        [BsonIgnore]
        public List<StockItem> StockItems { get; set; } = new();

        [BsonIgnore]
        public List<Product> Products { get; set; } = new();

        [BsonIgnore]
        public List<Product> BackupProducts { get; set; } = new();
    }
}
