namespace BaseCore.DTO.Support
{
    public class WarrantyRecordDto
    {
        public int Id { get; set; }
        public string WarrantyCode { get; set; } = "";
        public Guid? UserId { get; set; }
        public int? OrderId { get; set; }
        public string? OrderCode { get; set; }
        public int? OrderDetailId { get; set; }
        public int ProductId { get; set; }
        public int? VariantId { get; set; }
        public int? StockItemId { get; set; }
        public string? SerialOrImei { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string? CustomerEmail { get; set; }
        public string? ProductName { get; set; }
        public string? ProductImage { get; set; }
        public int WarrantyMonths { get; set; }
        public DateTime? PurchaseDate { get; set; }
        public DateTime? ActivatedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Status { get; set; } = "";
        public bool IsExpired { get; set; }
        public int DaysRemaining { get; set; }
        public string? LatestClaimStatus { get; set; }
        public string? Note { get; set; }
    }

    public class WarrantyLookupResultDto
    {
        public bool Found { get; set; }
        public string? Message { get; set; }
        public List<WarrantyRecordDto> Warranties { get; set; } = new();
    }

    public class ActivateWarrantyDto
    {
        public int WarrantyId { get; set; }
    }

    public class ActivateWarrantyPublicDto
    {
        public string SerialOrImei { get; set; } = "";
        public string Phone { get; set; } = "";
        public string? OrderCode { get; set; }
    }

    public class CreateWarrantyClaimDto
    {
        public int? WarrantyId { get; set; }
        public string? SerialOrImei { get; set; }
        public string? OrderCode { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string? CustomerEmail { get; set; }
        public string? IssueDescription { get; set; }
        public string? ReceiveMethod { get; set; }
        public string? ReturnAddress { get; set; }
        public List<string> Attachments { get; set; } = new();
    }

    public class WarrantyClaimDto
    {
        public int Id { get; set; }
        public string ClaimCode { get; set; } = "";
        public int? WarrantyId { get; set; }
        public string? WarrantyCode { get; set; }
        public Guid? UserId { get; set; }
        public int? OrderId { get; set; }
        public int? OrderDetailId { get; set; }
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public int? VariantId { get; set; }
        public int? StockItemId { get; set; }
        public string? SerialOrImei { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string? CustomerEmail { get; set; }
        public string IssueDescription { get; set; } = "";
        public string ReceiveMethod { get; set; } = "";
        public string? ReturnAddress { get; set; }
        public string Status { get; set; } = "";
        public string Priority { get; set; } = "";
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? ReceivedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string? RejectedReason { get; set; }
        public string? Note { get; set; }
        public List<WarrantyClaimUpdateDto> Updates { get; set; } = new();
    }

    public class UpdateWarrantyClaimStatusDto
    {
        public string Status { get; set; } = "";
        public string? Note { get; set; }
        public string? RejectedReason { get; set; }
    }

    public class WarrantyClaimUpdateDto
    {
        public int Id { get; set; }
        public int WarrantyClaimId { get; set; }
        public string Status { get; set; } = "";
        public string Title { get; set; } = "";
        public string? Message { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid? CreatedByUserId { get; set; }
    }

    public class RepairCaseDto
    {
        public int Id { get; set; }
        public string RepairCode { get; set; } = "";
        public int? WarrantyClaimId { get; set; }
        public int? TicketId { get; set; }
        public int? StockItemId { get; set; }
        public int ProductId { get; set; }
        public int? VariantId { get; set; }
        public string? SerialOrImei { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string? ProductName { get; set; }
        public string IssueDescription { get; set; } = "";
        public string? Diagnosis { get; set; }
        public string? Solution { get; set; }
        public Guid? TechnicianId { get; set; }
        public string Status { get; set; } = "";
        public string Priority { get; set; } = "";
        public DateTime ReceivedAt { get; set; }
        public DateTime? EstimatedCompletionAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public decimal CostEstimate { get; set; }
        public decimal FinalCost { get; set; }
        public bool IsWarrantyCovered { get; set; }
        public bool CustomerApprovedCost { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class RepairUpdateDto
    {
        public int Id { get; set; }
        public int RepairCaseId { get; set; }
        public string Status { get; set; } = "";
        public string Title { get; set; } = "";
        public string? Message { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid? CreatedByUserId { get; set; }
    }

    public class CreateRepairIntakeDto
    {
        public int? WarrantyClaimId { get; set; }
        public int? TicketId { get; set; }
        public string? SerialOrImei { get; set; }
        public int? ProductId { get; set; }
        public int? VariantId { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string? IssueDescription { get; set; }
        public string? Priority { get; set; }
        public DateTime? EstimatedCompletionAt { get; set; }
        public string? Note { get; set; }
    }

    public class UpdateRepairCaseDto
    {
        public string? Diagnosis { get; set; }
        public string? Solution { get; set; }
        public Guid? TechnicianId { get; set; }
        public decimal? CostEstimate { get; set; }
        public decimal? FinalCost { get; set; }
        public bool? IsWarrantyCovered { get; set; }
        public bool? CustomerApprovedCost { get; set; }
        public DateTime? EstimatedCompletionAt { get; set; }
        public string? Note { get; set; }
        public string? Priority { get; set; }
    }

    public class UpdateRepairStatusDto
    {
        public string Status { get; set; } = "";
        public string? Note { get; set; }
    }

    public class SupportTicketDto
    {
        public int Id { get; set; }
        public string TicketCode { get; set; } = "";
        public Guid? UserId { get; set; }
        public string Subject { get; set; } = "";
        public string Description { get; set; } = "";
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string? CustomerEmail { get; set; }
        public int? RelatedOrderId { get; set; }
        public int? RelatedProductId { get; set; }
        public int? RelatedWarrantyId { get; set; }
        public string? SerialOrImei { get; set; }
        public string? UserSessionId { get; set; }
        public string Status { get; set; } = "";
        public string Priority { get; set; } = "";
        public string Category { get; set; } = "";
        public Guid? AssignedToUserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? ClosedAt { get; set; }
        public List<SupportTicketUpdateDto> Updates { get; set; } = new();
    }

    public class CreateSupportTicketDto
    {
        public string? Subject { get; set; }
        public string? Description { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string? CustomerEmail { get; set; }
        public string? Category { get; set; }
        public int? RelatedOrderId { get; set; }
        public int? RelatedProductId { get; set; }
        public string? SerialOrImei { get; set; }
        public string? UserSessionId { get; set; }
        public string? Priority { get; set; }
        public List<string> Attachments { get; set; } = new();
    }

    public class SupportTicketUpdateDto
    {
        public int Id { get; set; }
        public int TicketId { get; set; }
        public int? ParentMessageId { get; set; }
        public string Message { get; set; } = "";
        public string SenderName { get; set; } = "";
        public string? StatusAfter { get; set; }
        public string? PriorityAfter { get; set; }
        public Guid? CreatedByUserId { get; set; }
        public bool CreatedByIsStaff { get; set; }
        public bool IsAdminReply { get; set; }
        public bool IsInternalNote { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class SupportTicketUpdateTreeDto : SupportTicketUpdateDto
    {
        public List<SupportTicketUpdateTreeDto> Replies { get; set; } = new();
    }

    public class CreateTicketUpdateDto
    {
        public string? Message { get; set; }
        public string? SenderName { get; set; }
        public int? ParentMessageId { get; set; }
        public string? StatusAfter { get; set; }
        public string? PriorityAfter { get; set; }
        public bool IsInternalNote { get; set; }
    }

    public class UpdateTicketStatusDto
    {
        public string Status { get; set; } = "";
        public string? Note { get; set; }
    }

    public class AssignTicketDto
    {
        public Guid? AssignedToUserId { get; set; }
        public string? Note { get; set; }
    }

    public class NotificationDto
    {
        public int Id { get; set; }
        public Guid? UserId { get; set; }
        public string Title { get; set; } = "";
        public string Message { get; set; } = "";
        public string Type { get; set; } = "";
        public string ReferenceType { get; set; } = "";
        public int? ReferenceId { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ReadAt { get; set; }
    }

    public class UnreadNotificationCountDto
    {
        public int Count { get; set; }
    }

    public class UploadResultDto
    {
        public string Url { get; set; } = "";
        public List<string> Urls { get; set; } = new();
    }

    public class SupportSearchDto
    {
        public string? Keyword { get; set; }
        public string? Status { get; set; }
        public string? Priority { get; set; }
        public string? Category { get; set; }
        public Guid? AssignedToUserId { get; set; }
        public Guid? TechnicianId { get; set; }
        public string? Phone { get; set; }
        public string? CustomerPhone { get; set; }
        public int? RelatedProductId { get; set; }
        public string? SerialOrImei { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
        public string? SortBy { get; set; } = "newest";
    }

    public class NotificationSearchDto
    {
        public bool UnreadOnly { get; set; }
        public string? Type { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }
}
