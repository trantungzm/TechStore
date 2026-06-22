using BaseCore.DTO.Support;

namespace BaseCore.Services
{
    // Contract cho module bảo hành: tra cứu warranty, kích hoạt,
    // tạo claim và theo dõi tiến độ xử lý bảo hành.
    public interface IWarrantyService
    {
        // Đồng bộ warranty record cho các sản phẩm thuộc đơn đã hoàn tất.
        Task EnsureWarrantiesForCompletedOrderAsync(int orderId);
        // Tra cứu bảo hành công khai theo serial/order/phone.
        Task<WarrantyLookupResultDto> LookupAsync(string? serialOrImei, string? orderCode, string? phone);
        // Danh sách warranty của user đăng nhập.
        Task<List<WarrantyRecordDto>> GetMyAsync(Guid userId);
        // User tự kích hoạt bảo hành của thiết bị thuộc mình.
        Task<WarrantyRecordDto?> ActivateAsync(int warrantyId, Guid userId);
        // Nhân viên kích hoạt bảo hành thay cho khách.
        Task<WarrantyRecordDto?> ActivateAsStaffAsync(int warrantyId, Guid? userId);
        // Luồng kích hoạt public không cần đăng nhập.
        Task<WarrantyRecordDto?> ActivatePublicAsync(ActivateWarrantyPublicDto dto);
        // Search/paging toàn bộ warranty record cho admin.
        Task<(List<WarrantyRecordDto> Items, int TotalCount)> GetAllWarrantiesAsync(SupportSearchDto search);
        // Tạo mới yêu cầu bảo hành/claim.
        Task<WarrantyClaimDto> CreateClaimAsync(CreateWarrantyClaimDto dto, Guid? userId);
        // Lấy claim của user hiện tại, có thể lọc theo warranty.
        Task<List<WarrantyClaimDto>> GetMyClaimsAsync(Guid userId, int? warrantyId);
        // Search/paging claim bảo hành ở phía admin.
        Task<(List<WarrantyClaimDto> Items, int TotalCount)> GetClaimsAsync(SupportSearchDto search);
        // Lấy chi tiết một claim bảo hành.
        Task<WarrantyClaimDto?> GetClaimAsync(int id);
        // Cập nhật trạng thái xử lý claim bảo hành.
        Task<WarrantyClaimDto?> UpdateClaimStatusAsync(int id, UpdateWarrantyClaimStatusDto dto, Guid? userId);
        // Lấy timeline cập nhật của claim.
        Task<List<WarrantyClaimUpdateDto>> GetClaimUpdatesAsync(int claimId);
    }

    // Contract cho module sửa chữa: tiếp nhận máy, cập nhật tiến độ
    // và cung cấp lịch sử sửa chữa cho admin hoặc khách hàng.
    public interface IRepairService
    {
        // Search/paging toàn bộ ca sửa chữa.
        Task<(List<RepairCaseDto> Items, int TotalCount)> GetRepairsAsync(SupportSearchDto search);
        // Search/paging các ca sửa chữa của user hiện tại.
        Task<(List<RepairCaseDto> Items, int TotalCount)> GetMyRepairsAsync(Guid userId, SupportSearchDto search);
        // Lấy chi tiết một repair case thuộc user hiện tại.
        Task<RepairCaseDto?> GetMyRepairAsync(Guid userId, int id);
        // Lấy chi tiết repair case cho admin/staff.
        Task<RepairCaseDto?> GetRepairAsync(int id);
        // Tạo phiếu tiếp nhận sửa chữa mới.
        Task<RepairCaseDto> IntakeAsync(CreateRepairIntakeDto dto, Guid? userId);
        // Cập nhật thông tin kỹ thuật của ca sửa chữa.
        Task<RepairCaseDto?> UpdateAsync(int id, UpdateRepairCaseDto dto);
        // Chuyển trạng thái workflow sửa chữa.
        Task<RepairCaseDto?> UpdateStatusAsync(int id, UpdateRepairStatusDto dto, Guid? userId);
        // Đọc lịch sử update/timeline của ca sửa chữa.
        Task<List<RepairUpdateDto>> GetUpdatesAsync(int repairId);
    }

    // Contract cho module ticket hỗ trợ khách hàng.
    public interface ITicketService
    {
        // Lấy danh sách ticket của user đăng nhập.
        Task<List<SupportTicketDto>> GetMyAsync(Guid userId);
        // Search/paging toàn bộ ticket cho admin.
        Task<(List<SupportTicketDto> Items, int TotalCount)> GetAllAsync(SupportSearchDto search);
        // Lấy chi tiết một ticket.
        Task<SupportTicketDto?> GetAsync(int id);
        // Tạo ticket hỗ trợ mới.
        Task<SupportTicketDto> CreateAsync(CreateSupportTicketDto dto, Guid? userId);
        // Thêm phản hồi/update vào hội thoại ticket.
        Task<SupportTicketUpdateDto> AddUpdateAsync(int id, CreateTicketUpdateDto dto, Guid? userId, bool isAdmin);
        // Cập nhật nhanh trạng thái ticket.
        Task<SupportTicketDto?> UpdateStatusAsync(int id, UpdateTicketStatusDto dto, Guid? userId);
        // Gán ticket cho nhân sự xử lý.
        Task<SupportTicketDto?> AssignAsync(int id, AssignTicketDto dto, Guid? userId);
    }

    // Contract cho module notification người dùng.
    public interface INotificationService
    {
        // Tạo notification gắn với một entity nghiệp vụ cụ thể.
        Task CreateAsync(Guid? userId, string title, string message, string type, string referenceType, int? referenceId);
        // Lấy danh sách notification của user hiện tại.
        Task<(List<NotificationDto> Items, int TotalCount)> GetMyAsync(Guid userId, NotificationSearchDto search);
        // Đếm số notification chưa đọc.
        Task<int> CountUnreadAsync(Guid userId);
        // Đánh dấu một notification là đã đọc.
        Task<NotificationDto?> MarkReadAsync(int id, Guid userId);
        // Đánh dấu toàn bộ notification của user là đã đọc.
        Task MarkAllReadAsync(Guid userId);
        // Xóa một notification thuộc quyền user.
        Task<bool> DeleteAsync(int id, Guid userId);
    }
}
