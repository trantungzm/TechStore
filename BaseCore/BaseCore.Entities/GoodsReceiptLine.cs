namespace BaseCore.Entities
{
    public class GoodsReceiptLine
    {
        public int Id { get; set; }
        public int GoodsReceiptId { get; set; }
        public int ProductId { get; set; }
        public int? VariantId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitCost { get; set; }
        public decimal TotalCost { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public GoodsReceipt? GoodsReceipt { get; set; }
        public Product? Product { get; set; }
        public ProductVariant? Variant { get; set; }
        public List<GoodsReceiptSerial> Serials { get; set; } = new();
    }
}
