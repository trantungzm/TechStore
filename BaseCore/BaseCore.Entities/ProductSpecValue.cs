namespace BaseCore.Entities
{
    public class ProductSpecValue
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int SpecDefinitionId { get; set; }
        public int? SpecOptionId { get; set; }
        public string? ValueText { get; set; }
        public decimal? ValueNumber { get; set; }
        public bool? ValueBool { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public Product Product { get; set; }
        public SpecDefinition SpecDefinition { get; set; }
        public SpecOption? SpecOption { get; set; }
    }
}
