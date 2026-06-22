namespace BaseCore.Entities
{
    /// <summary>
    /// Join table for many-to-many relationship between Product and Category.
    /// A product can belong to multiple categories.
    /// </summary>
    public class ProductCategory
    {
        public int ProductId { get; set; }
        public Product Product { get; set; } = null!;

        public int CategoryId { get; set; }
        public Category Category { get; set; } = null!;
    }
} 