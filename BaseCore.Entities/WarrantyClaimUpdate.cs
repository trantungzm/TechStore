
namespace BaseCore.Entities
{
    public class WarrantyClaimUpdate
    {
        public int Id { get; set; }
        public int WarrantyClaimId { get; set; }
        public string Status { get; set; } = "";
        public string Title { get; set; } = "";
        public string? Message { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Guid? CreatedByUserId { get; set; }

        public WarrantyClaim? WarrantyClaim { get; set; }
    }
}
