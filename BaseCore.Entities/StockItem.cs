
namespace BaseCore.Entities
{
    public class StockItem
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int? VariantId { get; set; }
        public int? WarehouseId { get; set; }
        public int? SupplierId { get; set; }
        // Mã định danh chính (giữ tương thích nghiệp vụ cũ) = Imei ?? SerialNumber ?? InternalCode
        public string SerialOrImei { get; set; } = "";
        // Serial thật từ hãng (chữ + số, không bắt 15 số)
        public string? SerialNumber { get; set; }
        // IMEI thật (15 chữ số + Luhn)
        public string? Imei { get; set; }
        // Mã tem kho nội bộ do hệ thống sinh — mọi StockItem đều có
        public string? InternalCode { get; set; }
        public string? Sku { get; set; }
        // true = mã tem kho tự sinh (không phải Serial/IMEI thật của nhà sản xuất)
        public bool IsAutoTag { get; set; }
        public string Status { get; set; } = "InStock";
        public decimal UnitCost { get; set; }
        public string? SupplierName { get; set; }
        public DateTime ReceivedAt { get; set; } = DateTime.UtcNow;
        public DateTime? SoldAt { get; set; }
        public int? OrderId { get; set; }
        public int? OrderDetailId { get; set; }

        public Guid? CustomerId { get; set; }

        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public Supplier? Supplier { get; set; }

        public Product? Product { get; set; }

        public ProductVariant? Variant { get; set; }

        public Warehouse? Warehouse { get; set; }

        public Order? Order { get; set; }

        public OrderDetail? OrderDetail { get; set; }
    }
}
