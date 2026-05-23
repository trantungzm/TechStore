namespace BaseCore.Entities
{
    public class CategorySupplier
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public int SupplierId { get; set; }
        public int SortOrder { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public Category? Category { get; set; }
        public Supplier? Supplier { get; set; }
    }
}
