namespace BaseCore.Entities
{
    public class GoodsReceiptSerial
    {
        public int Id { get; set; }
        public int GoodsReceiptLineId { get; set; }
        public int StockItemId { get; set; }
        public string SerialOrImei { get; set; } = "";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public GoodsReceiptLine? GoodsReceiptLine { get; set; }
        public StockItem? StockItem { get; set; }
    }
}
