using BaseCore.DTO.Support;

namespace BaseCore.Services
{
    public interface IWarrantyService
    {
        Task EnsureWarrantiesForCompletedOrderAsync(int orderId);
        Task<WarrantyLookupResultDto> LookupAsync(string? serialOrImei, string? orderCode, string? phone);
        Task<List<WarrantyRecordDto>> GetMyAsync(Guid userId);
        Task<WarrantyClaimDto> CreateClaimAsync(CreateWarrantyClaimDto dto, Guid? userId);
        Task<(List<WarrantyClaimDto> Items, int TotalCount)> GetClaimsAsync(SupportSearchDto search);
        Task<WarrantyClaimDto?> GetClaimAsync(int id);
        Task<WarrantyClaimDto?> UpdateClaimStatusAsync(int id, UpdateWarrantyClaimStatusDto dto, Guid? userId);
        Task<List<WarrantyClaimUpdateDto>> GetClaimUpdatesAsync(int claimId);
    }

    public interface IRepairService
    {
        Task<(List<RepairCaseDto> Items, int TotalCount)> GetRepairsAsync(SupportSearchDto search);
        Task<RepairCaseDto?> GetRepairAsync(int id);
        Task<RepairCaseDto> IntakeAsync(CreateRepairIntakeDto dto, Guid? userId);
        Task<RepairCaseDto?> UpdateAsync(int id, UpdateRepairCaseDto dto);
        Task<RepairCaseDto?> UpdateStatusAsync(int id, UpdateRepairStatusDto dto, Guid? userId);
        Task<List<RepairUpdateDto>> GetUpdatesAsync(int repairId);
    }

    public interface ITicketService
    {
        Task<List<SupportTicketDto>> GetMyAsync(Guid userId);
        Task<(List<SupportTicketDto> Items, int TotalCount)> GetAllAsync(SupportSearchDto search);
        Task<SupportTicketDto?> GetAsync(int id);
        Task<SupportTicketDto> CreateAsync(CreateSupportTicketDto dto, Guid? userId);
        Task<SupportTicketUpdateDto> AddUpdateAsync(int id, CreateTicketUpdateDto dto, Guid? userId, bool isAdmin);
        Task<SupportTicketDto?> UpdateStatusAsync(int id, UpdateTicketStatusDto dto, Guid? userId);
        Task<SupportTicketDto?> AssignAsync(int id, AssignTicketDto dto, Guid? userId);
    }

    public interface INotificationService
    {
        Task CreateAsync(Guid? userId, string title, string message, string type, string referenceType, int? referenceId);
        Task<(List<NotificationDto> Items, int TotalCount)> GetMyAsync(Guid userId, NotificationSearchDto search);
        Task<int> CountUnreadAsync(Guid userId);
        Task<NotificationDto?> MarkReadAsync(int id, Guid userId);
        Task MarkAllReadAsync(Guid userId);
        Task<bool> DeleteAsync(int id, Guid userId);
    }
}
