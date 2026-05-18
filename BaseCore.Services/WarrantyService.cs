using BaseCore.DTO.Support;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;

namespace BaseCore.Services
{
    public class WarrantyService : IWarrantyService
    {
        private readonly IWarrantyRecordRepositoryEF _warrantyRepository;
        private readonly IWarrantyClaimRepositoryEF _claimRepository;
        private readonly IWarrantyClaimUpdateRepositoryEF _updateRepository;
        private readonly IOrderRepositoryEF _orderRepository;
        private readonly IOrderDetailRepositoryEF _orderDetailRepository;
        private readonly IProductRepositoryEF _productRepository;
        private readonly IStockItemRepositoryEF _stockItemRepository;
        private readonly INotificationService _notificationService;

        public WarrantyService(
            IWarrantyRecordRepositoryEF warrantyRepository,
            IWarrantyClaimRepositoryEF claimRepository,
            IWarrantyClaimUpdateRepositoryEF updateRepository,
            IOrderRepositoryEF orderRepository,
            IOrderDetailRepositoryEF orderDetailRepository,
            IProductRepositoryEF productRepository,
            IStockItemRepositoryEF stockItemRepository,
            INotificationService notificationService)
        {
            _warrantyRepository = warrantyRepository;
            _claimRepository = claimRepository;
            _updateRepository = updateRepository;
            _orderRepository = orderRepository;
            _orderDetailRepository = orderDetailRepository;
            _productRepository = productRepository;
            _stockItemRepository = stockItemRepository;
            _notificationService = notificationService;
        }

        public async Task EnsureWarrantiesForCompletedOrderAsync(int orderId)
        {
            var order = await _orderRepository.GetWithDetailsAsync(orderId);
            if (order == null) return;
            var details = await _orderDetailRepository.GetByOrderAsync(orderId);
            var start = order.UpdatedAt ?? DateTime.UtcNow;

            foreach (var detail in details)
            {
                var product = await _productRepository.GetByIdAsync(detail.ProductId);
                if (product == null) continue;
                var months = product.WarrantyMonths <= 0 ? 12 : product.WarrantyMonths;
                var serials = SplitSerials(detail.SerialOrImei);
                if (serials.Count == 0) serials.Add(null);

                foreach (var serial in serials)
                {
                    StockItem? stockItem = null;
                    if (!string.IsNullOrWhiteSpace(serial)) stockItem = await _stockItemRepository.GetBySerialAsync(serial);
                    if (await _warrantyRepository.ExistsForOrderDetailAsync(detail.Id, stockItem?.Id)) continue;

                    var record = await _warrantyRepository.AddAsync(new WarrantyRecord
                    {
                        UserId = order.UserId,
                        OrderId = order.Id,
                        OrderDetailId = detail.Id,
                        ProductId = detail.ProductId,
                        VariantId = detail.VariantId,
                        StockItemId = stockItem?.Id,
                        SerialOrImei = serial,
                        CustomerName = order.CustomerName,
                        CustomerPhone = order.CustomerPhone,
                        CustomerEmail = order.CustomerEmail,
                        ProductName = detail.ProductName ?? product.Name,
                        ProductImage = detail.ProductImage ?? product.ImageUrl,
                        WarrantyMonths = months,
                        StartDate = start,
                        EndDate = start.AddMonths(months),
                        Status = "Active",
                        CreatedAt = DateTime.UtcNow
                    });
                    record.WarrantyCode = $"BH-{start:yyyyMMdd}-{record.Id:0000}";
                    await _warrantyRepository.UpdateAsync(record);
                }
            }
        }

        public async Task<WarrantyLookupResultDto> LookupAsync(string? serialOrImei, string? orderCode, string? phone)
        {
            var items = await _warrantyRepository.LookupAsync(serialOrImei, orderCode, phone);
            if (items.Count == 0) return new WarrantyLookupResultDto { Found = false, Message = "Khong tim thay thong tin bao hanh phu hop." };
            return new WarrantyLookupResultDto { Found = true, Warranties = await ToWarrantyDtos(items) };
        }

        public async Task<List<WarrantyRecordDto>> GetMyAsync(Guid userId)
        {
            return await ToWarrantyDtos(await _warrantyRepository.GetByUserAsync(userId));
        }

        public async Task<WarrantyClaimDto> CreateClaimAsync(CreateWarrantyClaimDto dto, Guid? userId)
        {
            ValidateClaim(dto);
            WarrantyRecord? warranty = null;
            if (dto.WarrantyId.HasValue) warranty = await _warrantyRepository.GetDetailAsync(dto.WarrantyId.Value);
            if (warranty == null && !string.IsNullOrWhiteSpace(dto.SerialOrImei))
                warranty = (await _warrantyRepository.LookupAsync(dto.SerialOrImei, null, null)).FirstOrDefault();
            if (warranty == null && !string.IsNullOrWhiteSpace(dto.OrderCode))
                warranty = (await _warrantyRepository.LookupAsync(null, dto.OrderCode, dto.CustomerPhone)).FirstOrDefault();

            StockItem? stockItem = null;
            if (warranty?.StockItemId.HasValue == true) stockItem = await _stockItemRepository.GetDetailAsync(warranty.StockItemId.Value);
            if (stockItem == null && !string.IsNullOrWhiteSpace(dto.SerialOrImei)) stockItem = await _stockItemRepository.GetBySerialAsync(dto.SerialOrImei);

            var productId = warranty?.ProductId ?? stockItem?.ProductId ?? 0;
            if (productId <= 0) throw new InvalidOperationException("Khong tim thay san pham bao hanh.");
            var product = await _productRepository.GetByIdAsync(productId);

            var claim = await _claimRepository.AddAsync(new WarrantyClaim
            {
                WarrantyId = warranty?.Id,
                UserId = userId ?? warranty?.UserId,
                OrderId = warranty?.OrderId ?? stockItem?.OrderId,
                OrderDetailId = warranty?.OrderDetailId ?? stockItem?.OrderDetailId,
                ProductId = productId,
                VariantId = warranty?.VariantId ?? stockItem?.VariantId,
                StockItemId = warranty?.StockItemId ?? stockItem?.Id,
                SerialOrImei = dto.SerialOrImei?.Trim() ?? warranty?.SerialOrImei ?? stockItem?.SerialOrImei,
                CustomerName = dto.CustomerName?.Trim() ?? warranty?.CustomerName,
                CustomerPhone = dto.CustomerPhone?.Trim() ?? warranty?.CustomerPhone,
                CustomerEmail = dto.CustomerEmail?.Trim() ?? warranty?.CustomerEmail,
                IssueDescription = dto.IssueDescription!.Trim(),
                ReceiveMethod = NormalizeReceiveMethod(dto.ReceiveMethod),
                ReturnAddress = dto.ReturnAddress?.Trim(),
                Status = "Pending",
                Priority = "Normal",
                CreatedAt = DateTime.UtcNow
            });
            claim.ClaimCode = $"WC-{claim.CreatedAt:yyyyMMdd}-{claim.Id:0000}";
            await _claimRepository.UpdateAsync(claim);
            await AddUpdate(claim.Id, "Pending", "Yeu cau bao hanh da duoc gui", "Chung toi se lien he lai trong thoi gian som nhat.", userId);
            await _notificationService.CreateAsync(claim.UserId, "Yeu cau bao hanh da duoc gui", claim.ClaimCode, "Warranty", "WarrantyClaim", claim.Id);
            return (await GetClaimAsync(claim.Id))!;
        }

        public async Task<(List<WarrantyClaimDto> Items, int TotalCount)> GetClaimsAsync(SupportSearchDto search)
        {
            var result = await _claimRepository.SearchAsync(search);
            return (result.Items.Select(ToClaimDto).ToList(), result.TotalCount);
        }

        public async Task<WarrantyClaimDto?> GetClaimAsync(int id)
        {
            var claim = await _claimRepository.GetDetailAsync(id);
            return claim == null ? null : ToClaimDto(claim);
        }

        public async Task<WarrantyClaimDto?> UpdateClaimStatusAsync(int id, UpdateWarrantyClaimStatusDto dto, Guid? userId)
        {
            var claim = await _claimRepository.GetDetailAsync(id);
            if (claim == null) return null;
            var status = NormalizeClaimStatus(dto.Status);
            claim.Status = status;
            claim.Note = dto.Note?.Trim() ?? claim.Note;
            claim.RejectedReason = status == "Rejected" ? dto.RejectedReason?.Trim() : claim.RejectedReason;
            claim.UpdatedAt = DateTime.UtcNow;
            if (status == "Received") claim.ReceivedAt = DateTime.UtcNow;
            if (status is "Completed" or "Delivered" or "Rejected" or "Cancelled") claim.CompletedAt = DateTime.UtcNow;
            await _claimRepository.UpdateAsync(claim);
            if (claim.StockItemId.HasValue && status is "Received" or "Diagnosing" or "SentToBrand" or "Repairing" or "WaitingParts")
            {
                var stockItem = await _stockItemRepository.GetDetailAsync(claim.StockItemId.Value);
                if (stockItem != null)
                {
                    stockItem.Status = status == "Repairing" || status == "WaitingParts" ? "Repairing" : "Warranty";
                    stockItem.UpdatedAt = DateTime.UtcNow;
                    await _stockItemRepository.UpdateAsync(stockItem);
                }
            }
            await AddUpdate(claim.Id, status, ClaimTitle(status), dto.Note ?? dto.RejectedReason, userId);
            await _notificationService.CreateAsync(claim.UserId, ClaimTitle(status), claim.ClaimCode, "Warranty", "WarrantyClaim", claim.Id);
            return await GetClaimAsync(id);
        }

        public Task<List<WarrantyClaimUpdateDto>> GetClaimUpdatesAsync(int claimId)
        {
            return _updateRepository.GetByClaimAsync(claimId).ContinueWith(t => t.Result.Select(ToUpdateDto).ToList());
        }

        private async Task<List<WarrantyRecordDto>> ToWarrantyDtos(List<WarrantyRecord> items)
        {
            var result = new List<WarrantyRecordDto>();
            foreach (var item in items)
            {
                var latest = await _claimRepository.GetLatestByWarrantyAsync(item.Id);
                result.Add(ToWarrantyDto(item, latest?.Status));
            }
            return result;
        }

        private async Task AddUpdate(int claimId, string status, string title, string? message, Guid? userId)
        {
            await _updateRepository.AddAsync(new WarrantyClaimUpdate
            {
                WarrantyClaimId = claimId,
                Status = status,
                Title = title,
                Message = message,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = userId
            });
        }

        private static void ValidateClaim(CreateWarrantyClaimDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CustomerName)) throw new InvalidOperationException("Vui long nhap ten khach hang.");
            if (string.IsNullOrWhiteSpace(dto.CustomerPhone)) throw new InvalidOperationException("Vui long nhap so dien thoai.");
            if (string.IsNullOrWhiteSpace(dto.IssueDescription) || dto.IssueDescription.Trim().Length < 15) throw new InvalidOperationException("Vui long nhap mo ta loi toi thieu 15 ky tu.");
            if (string.IsNullOrWhiteSpace(dto.ReceiveMethod)) throw new InvalidOperationException("Vui long chon hinh thuc tiep nhan.");
            if (NormalizeReceiveMethod(dto.ReceiveMethod) == "Shipping" && string.IsNullOrWhiteSpace(dto.ReturnAddress)) throw new InvalidOperationException("Vui long nhap dia chi gui/nhan hang.");
            if (!dto.WarrantyId.HasValue && string.IsNullOrWhiteSpace(dto.SerialOrImei) && string.IsNullOrWhiteSpace(dto.OrderCode)) throw new InvalidOperationException("Can co ma bao hanh, serial/IMEI hoac ma don hang.");
        }

        private static string NormalizeReceiveMethod(string? value) => string.Equals(value?.Trim(), "Shipping", StringComparison.OrdinalIgnoreCase) ? "Shipping" : "StoreDropOff";
        private static string NormalizeClaimStatus(string status)
        {
            var allowed = new[] { "Pending", "Confirmed", "Received", "Diagnosing", "SentToBrand", "Repairing", "WaitingParts", "ReadyToReturn", "Delivered", "Completed", "Rejected", "Cancelled" };
            return allowed.FirstOrDefault(x => string.Equals(x, status, StringComparison.OrdinalIgnoreCase)) ?? throw new InvalidOperationException("Trang thai bao hanh khong hop le.");
        }

        private static string ClaimTitle(string status) => status switch
        {
            "Confirmed" => "Nhan vien da xac nhan yeu cau",
            "Received" => "San pham da duoc tiep nhan",
            "Diagnosing" => "Ky thuat dang kiem tra",
            "Repairing" => "San pham dang duoc sua chua",
            "ReadyToReturn" => "San pham san sang tra khach",
            "Rejected" => "Yeu cau bao hanh bi tu choi",
            _ => "Cap nhat yeu cau bao hanh"
        };

        private static List<string?> SplitSerials(string? serials) => string.IsNullOrWhiteSpace(serials) ? new() : serials.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).Cast<string?>().ToList();

        private static WarrantyRecordDto ToWarrantyDto(WarrantyRecord item, string? latestClaimStatus)
        {
            var days = (int)Math.Ceiling((item.EndDate.Date - DateTime.UtcNow.Date).TotalDays);
            return new WarrantyRecordDto
            {
                Id = item.Id,
                WarrantyCode = item.WarrantyCode,
                UserId = item.UserId,
                OrderId = item.OrderId,
                OrderCode = item.Order?.OrderCode,
                OrderDetailId = item.OrderDetailId,
                ProductId = item.ProductId,
                VariantId = item.VariantId,
                StockItemId = item.StockItemId,
                SerialOrImei = item.SerialOrImei,
                CustomerName = item.CustomerName,
                CustomerPhone = item.CustomerPhone,
                CustomerEmail = item.CustomerEmail,
                ProductName = item.ProductName ?? item.Product?.Name,
                ProductImage = item.ProductImage ?? item.Product?.ImageUrl,
                WarrantyMonths = item.WarrantyMonths,
                StartDate = item.StartDate,
                EndDate = item.EndDate,
                Status = item.EndDate < DateTime.UtcNow && item.Status == "Active" ? "Expired" : item.Status,
                IsExpired = item.EndDate < DateTime.UtcNow,
                DaysRemaining = Math.Max(0, days),
                LatestClaimStatus = latestClaimStatus,
                Note = item.Note
            };
        }

        private static WarrantyClaimDto ToClaimDto(WarrantyClaim item) => new()
        {
            Id = item.Id,
            ClaimCode = item.ClaimCode,
            WarrantyId = item.WarrantyId,
            WarrantyCode = item.Warranty?.WarrantyCode,
            UserId = item.UserId,
            OrderId = item.OrderId,
            OrderDetailId = item.OrderDetailId,
            ProductId = item.ProductId,
            ProductName = item.Product?.Name ?? item.Warranty?.ProductName,
            VariantId = item.VariantId,
            StockItemId = item.StockItemId,
            SerialOrImei = item.SerialOrImei,
            CustomerName = item.CustomerName,
            CustomerPhone = item.CustomerPhone,
            CustomerEmail = item.CustomerEmail,
            IssueDescription = item.IssueDescription,
            ReceiveMethod = item.ReceiveMethod,
            ReturnAddress = item.ReturnAddress,
            Status = item.Status,
            Priority = item.Priority,
            CreatedAt = item.CreatedAt,
            UpdatedAt = item.UpdatedAt,
            ReceivedAt = item.ReceivedAt,
            CompletedAt = item.CompletedAt,
            RejectedReason = item.RejectedReason,
            Note = item.Note,
            Updates = item.Updates.OrderBy(x => x.CreatedAt).Select(ToUpdateDto).ToList()
        };

        private static WarrantyClaimUpdateDto ToUpdateDto(WarrantyClaimUpdate item) => new()
        {
            Id = item.Id,
            WarrantyClaimId = item.WarrantyClaimId,
            Status = item.Status,
            Title = item.Title,
            Message = item.Message,
            CreatedAt = item.CreatedAt,
            CreatedByUserId = item.CreatedByUserId
        };
    }
}
