namespace BaseCore.Entities
{
    public class SpecDefinition
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public string Name { get; set; } = "";
        public string Code { get; set; } = "";
        public string DataType { get; set; } = "text";
        public string? Unit { get; set; }
        public int SortOrder { get; set; }
        public bool IsComparable { get; set; } = true;
        public bool IsFilterable { get; set; }
        public bool IsRequired { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public Category Category { get; set; }
        public List<ProductSpecValue> ProductSpecValues { get; set; } = new();
    }
}
