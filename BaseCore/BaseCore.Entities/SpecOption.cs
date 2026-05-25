namespace BaseCore.Entities
{
    public class SpecOption
    {
        public int Id { get; set; }
        public int SpecDefinitionId { get; set; }
        public string Value { get; set; } = "";
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public SpecDefinition SpecDefinition { get; set; }
        public List<ProductSpecValue> ProductSpecValues { get; set; } = new();
    }
}
