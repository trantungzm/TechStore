namespace BaseCore.Entities
{
    public class OrderDetailStockItem
    {
        public int Id { get; set; }
        public int OrderDetailId { get; set; }
        public int StockItemId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public OrderDetail? OrderDetail { get; set; }
        public StockItem? StockItem { get; set; }
    }
}
