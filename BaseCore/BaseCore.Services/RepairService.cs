using BaseCore.DTO.Support;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;

namespace BaseCore.Services
{
    public class RepairService : IRepairService
    {
        private readonly IRepairCaseRepositoryEF _repairRepository;
        private readonly IRepairUpdateRepositoryEF _updateRepository;
        private readonly IWarrantyClaimRepositoryEF _claimRepository;
        private readonly ISupportTicketRepositoryEF _ticketRepository;
        private readonly IProductRepositoryEF _productRepository;
        private readonly IStockItemRepositoryEF _stockItemRepository;
        private readonly INotificationService _notificationService;

        public RepairService(IRepairCaseRepositoryEF repairRepository, IRepairUpdateRepositoryEF updateRepository, IWarrantyClaimRepositoryEF claimRepository, ISupportTicketRepositoryEF ticketRepository, IProductRepositoryEF productRepository, IStockItemRepositoryEF stockItemRepository, INotificationService notificationService)
        {
            _repairRepository = repairRepository;
            _updateRepository = updateRepository;
            _claimRepository = claimRepository;
            _ticketRepository = ticketRepository;
            _productRepository = productRepository;
            _stockItemRepository = stockItemRepository;
            _notificationService = notificationService;
        }

        public async Task<(List<RepairCaseDto> Items, int TotalCount)> GetRepairsAsync(SupportSearchDto search)
        {
            var result = await _repairRepository.SearchAsync(search);
            return (result.Items.Select(ToDto).ToList(), result.TotalCount);
        }

        public async Task<RepairCaseDto?> GetRepairAsync(int id)
        {
            var item = await _repairRepository.GetDetailAsync(id);
            return item == null ? null : ToDto(item);
        }

        public async Task<RepairCaseDto> IntakeAsync(CreateRepairIntakeDto dto, Guid? userId)
        {
            WarrantyClaim? claim = dto.WarrantyClaimId.HasValue ? await _claimRepository.GetDetailAsync(dto.WarrantyClaimId.Value) : null;
            SupportTicket? ticket = dto.TicketId.HasValue ? await _ticketRepository.GetDetailAsync(dto.TicketId.Value) : null;
            StockItem? stockItem = null;
            if (!string.IsNullOrWhiteSpace(dto.SerialOrImei)) stockItem = await _stockItemRepository.GetBySerialAsync(dto.SerialOrImei.Trim());

            var productId = claim?.ProductId ?? ticket?.RelatedProductId ?? stockItem?.ProductId ?? dto.ProductId ?? 0;
            if (productId <= 0) throw new InvalidOperationException("Vui long chon san pham sua chua.");
            var product = await _productRepository.GetByIdAsync(productId) ?? throw new InvalidOperationException("San pham khong ton tai.");
            var now = DateTime.UtcNow;
            var item = await _repairRepository.AddAsync(new RepairCase
            {
                WarrantyClaimId = claim?.Id,
                TicketId = ticket?.Id,
                StockItemId = stockItem?.Id,
                ProductId = product.Id,
                VariantId = claim?.VariantId ?? stockItem?.VariantId ?? dto.VariantId,
                SerialOrImei = dto.SerialOrImei?.Trim() ?? claim?.SerialOrImei ?? stockItem?.SerialOrImei,
                CustomerName = dto.CustomerName?.Trim() ?? claim?.CustomerName ?? ticket?.CustomerName,
                CustomerPhone = dto.CustomerPhone?.Trim() ?? claim?.CustomerPhone ?? ticket?.CustomerPhone,
                ProductName = product.Name,
                IssueDescription = dto.IssueDescription?.Trim() ?? claim?.IssueDescription ?? ticket?.Description ?? "",
                Status = "Intake",
                Priority = NormalizePriority(dto.Priority ?? claim?.Priority ?? ticket?.Priority),
                ReceivedAt = now,
                EstimatedCompletionAt = dto.EstimatedCompletionAt,
                IsWarrantyCovered = claim != null,
                Note = dto.Note?.Trim(),
                CreatedAt = now
            });
            item.RepairCode = $"RP-{now:yyyyMMdd}-{item.Id:0000}";
            await _repairRepository.UpdateAsync(item);
            await AddUpdate(item.Id, "Intake", "Da tiep nhan sua chua", dto.Note, userId);
            if (claim != null)
            {
                claim.Status = "Diagnosing";
                claim.UpdatedAt = now;
                await _claimRepository.UpdateAsync(claim);
                await _notificationService.CreateAsync(claim.UserId, "San pham da duoc tiep nhan sua chua", item.RepairCode, "Repair", "RepairCase", item.Id);
            }
            if (ticket != null) await _notificationService.CreateAsync(ticket.UserId, "Ticket da duoc chuyen xu ly sua chua", item.RepairCode, "Repair", "RepairCase", item.Id);
            return (await GetRepairAsync(item.Id))!;
        }

        public async Task<RepairCaseDto?> UpdateAsync(int id, UpdateRepairCaseDto dto)
        {
            var item = await _repairRepository.GetDetailAsync(id);
            if (item == null) return null;
            item.Diagnosis = dto.Diagnosis?.Trim() ?? item.Diagnosis;
            item.Solution = dto.Solution?.Trim() ?? item.Solution;
            item.TechnicianId = dto.TechnicianId ?? item.TechnicianId;
            item.CostEstimate = dto.CostEstimate ?? item.CostEstimate;
            item.FinalCost = dto.FinalCost ?? item.FinalCost;
            item.IsWarrantyCovered = dto.IsWarrantyCovered ?? item.IsWarrantyCovered;
            item.CustomerApprovedCost = dto.CustomerApprovedCost ?? item.CustomerApprovedCost;
            item.EstimatedCompletionAt = dto.EstimatedCompletionAt ?? item.EstimatedCompletionAt;
            item.Note = dto.Note?.Trim() ?? item.Note;
            item.Priority = string.IsNullOrWhiteSpace(dto.Priority) ? item.Priority : NormalizePriority(dto.Priority);
            item.UpdatedAt = DateTime.UtcNow;
            await _repairRepository.UpdateAsync(item);
            return await GetRepairAsync(id);
        }

        public async Task<RepairCaseDto?> UpdateStatusAsync(int id, UpdateRepairStatusDto dto, Guid? userId)
        {
            var item = await _repairRepository.GetDetailAsync(id);
            if (item == null) return null;
            var status = NormalizeStatus(dto.Status);
            item.Status = status;
            item.UpdatedAt = DateTime.UtcNow;
            if (status is "Completed" or "Delivered") item.CompletedAt = DateTime.UtcNow;
            await _repairRepository.UpdateAsync(item);
            await AddUpdate(item.Id, status, RepairTitle(status), dto.Note, userId);
            if (item.WarrantyClaimId.HasValue)
            {
                var claim = await _claimRepository.GetDetailAsync(item.WarrantyClaimId.Value);
                if (claim != null)
                {
                    claim.Status = status == "Delivered" ? "Completed" : status == "Completed" ? "ReadyToReturn" : status;
                    claim.UpdatedAt = DateTime.UtcNow;
                    await _claimRepository.UpdateAsync(claim);
                    await _notificationService.CreateAsync(claim.UserId, RepairTitle(status), item.RepairCode, "Repair", "RepairCase", item.Id);
                }
            }
            if (item.StockItemId.HasValue)
            {
                var stockItem = await _stockItemRepository.GetDetailAsync(item.StockItemId.Value);
                if (stockItem != null)
                {
                    stockItem.Status = status is "Completed" or "Delivered" ? "Sold" : status == "Rejected" ? "Damaged" : "Repairing";
                    stockItem.UpdatedAt = DateTime.UtcNow;
                    await _stockItemRepository.UpdateAsync(stockItem);
                }
            }
            return await GetRepairAsync(id);
        }

        public Task<List<RepairUpdateDto>> GetUpdatesAsync(int repairId) => _updateRepository.GetByRepairAsync(repairId).ContinueWith(t => t.Result.Select(ToUpdateDto).ToList());

        private async Task AddUpdate(int repairId, string status, string title, string? message, Guid? userId)
        {
            await _updateRepository.AddAsync(new RepairUpdate { RepairCaseId = repairId, Status = status, Title = title, Message = message, CreatedAt = DateTime.UtcNow, CreatedByUserId = userId });
        }

        private static string NormalizePriority(string? value)
        {
            var allowed = new[] { "Low", "Normal", "High", "Urgent" };
            return allowed.FirstOrDefault(x => string.Equals(x, value, StringComparison.OrdinalIgnoreCase)) ?? "Normal";
        }

        private static string NormalizeStatus(string value)
        {
            var allowed = new[] { "Pending", "Intake", "Diagnosing", "WaitingCustomerApproval", "WaitingParts", "Repairing", "Testing", "Completed", "Delivered", "Cancelled", "Rejected" };
            return allowed.FirstOrDefault(x => string.Equals(x, value, StringComparison.OrdinalIgnoreCase)) ?? throw new InvalidOperationException("Trang thai sua chua khong hop le.");
        }

        private static string RepairTitle(string status) => status switch
        {
            "Diagnosing" => "Ky thuat dang kiem tra",
            "Repairing" => "San pham dang sua chua",
            "Testing" => "San pham dang kiem thu",
            "Completed" => "Sua chua da hoan tat",
            "Delivered" => "San pham da tra khach",
            _ => "Cap nhat sua chua"
        };

        private static RepairCaseDto ToDto(RepairCase item) => new()
        {
            Id = item.Id, RepairCode = item.RepairCode, WarrantyClaimId = item.WarrantyClaimId, TicketId = item.TicketId, StockItemId = item.StockItemId, ProductId = item.ProductId, VariantId = item.VariantId, SerialOrImei = item.SerialOrImei, CustomerName = item.CustomerName, CustomerPhone = item.CustomerPhone, ProductName = item.ProductName ?? item.Product?.Name, IssueDescription = item.IssueDescription, Diagnosis = item.Diagnosis, Solution = item.Solution, TechnicianId = item.TechnicianId, Status = item.Status, Priority = item.Priority, ReceivedAt = item.ReceivedAt, EstimatedCompletionAt = item.EstimatedCompletionAt, CompletedAt = item.CompletedAt, CostEstimate = item.CostEstimate, FinalCost = item.FinalCost, IsWarrantyCovered = item.IsWarrantyCovered, CustomerApprovedCost = item.CustomerApprovedCost, Note = item.Note, CreatedAt = item.CreatedAt, UpdatedAt = item.UpdatedAt
        };

        private static RepairUpdateDto ToUpdateDto(RepairUpdate item) => new() { Id = item.Id, RepairCaseId = item.RepairCaseId, Status = item.Status, Title = item.Title, Message = item.Message, CreatedAt = item.CreatedAt, CreatedByUserId = item.CreatedByUserId };
    }
}
