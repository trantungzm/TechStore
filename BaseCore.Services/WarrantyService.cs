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
        private readonly IAttachmentRepositoryEF _attachmentRepository;
        private readonly IOrderRepositoryEF _orderRepository;
        private readonly IOrderDetailRepositoryEF _orderDetailRepository;
        private readonly IProductRepositoryEF _productRepository;
        private readonly IStockItemRepositoryEF _stockItemRepository;
        private readonly INotificationService _notificationService;

        public WarrantyService(
            IWarrantyRecordRepositoryEF warrantyRepository,
            IWarrantyClaimRepositoryEF claimRepository,
            IWarrantyClaimUpdateRepositoryEF updateRepository,
            IAttachmentRepositoryEF attachmentRepository,
            IOrderRepositoryEF orderRepository,
            IOrderDetailRepositoryEF orderDetailRepository,
            IProductRepositoryEF productRepository,
            IStockItemRepositoryEF stockItemRepository,
            INotificationService notificationService)
        {
            _warrantyRepository = warrantyRepository;
            _claimRepository = claimRepository;
            _updateRepository = updateRepository;
            _attachmentRepository = attachmentRepository;
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
            var purchaseDate = order.UpdatedAt ?? order.CreatedAt;

            foreach (var detail in details)
            {
                var product = await _productRepository.GetByIdAsync(detail.ProductId);
                if (product == null) continue;
                var months = product.WarrantyMonths <= 0 ? 12 : product.WarrantyMonths;

                var assignedPairs = detail.StockItems
                    .Select(x => x.StockItem)
                    .Where(x => x != null && !string.IsNullOrWhiteSpace(x.SerialOrImei))
                    .Select(x => new { StockItemId = (int?)x!.Id, Serial = x!.SerialOrImei.Trim() })
                    .GroupBy(x => x.StockItemId)
                    .Select(g => g.First())
                    .ToList();

                if (assignedPairs.Count == 0)
                {
                    assignedPairs = SplitSerials(detail.SerialOrImei)
                        .Where(x => !string.IsNullOrWhiteSpace(x))
                        .Select(x => x!.Trim())
                        .Distinct(StringComparer.OrdinalIgnoreCase)
                        .Select(x => new { StockItemId = (int?)null, Serial = x })
                        .ToList();
                }

                if (assignedPairs.Count == 0)
                {
                    if (await _warrantyRepository.ExistsForOrderDetailAsync(detail.Id, null)) continue;
                    var empty = await _warrantyRepository.AddAsync(new WarrantyRecord
                    {
                        UserId = order.UserId,
                        OrderId = order.Id,
                        OrderDetailId = detail.Id,
                        ProductId = detail.ProductId,
                        VariantId = detail.VariantId,
                        StockItemId = null,
                        SerialOrImei = "",
                        CustomerName = order.CustomerName,
                        CustomerPhone = order.CustomerPhone,
                        CustomerEmail = order.CustomerEmail,
                        ProductName = detail.ProductName ?? product.Name,
                        ProductImage = detail.ProductImage ?? product.ImageUrl,
                        WarrantyMonths = months,
                        StartDate = null,
                        EndDate = null,
                        Status = "NotActivated",
                        CreatedAt = DateTime.UtcNow
                    });
                    empty.WarrantyCode = $"BH-{purchaseDate:yyyyMMdd}-{empty.Id:0000}";
                    await _warrantyRepository.UpdateAsync(empty);
                    continue;
                }

                var unassigned = await _warrantyRepository.GetUnassignedByOrderDetailAsync(detail.Id);

                foreach (var pair in assignedPairs)
                {
                    StockItem? stockItem = null;
                    if (pair.StockItemId.HasValue)
                    {
                        stockItem = await _stockItemRepository.GetDetailAsync(pair.StockItemId.Value);
                    }
                    else if (!string.IsNullOrWhiteSpace(pair.Serial))
                    {
                        stockItem = await _stockItemRepository.GetBySerialAsync(pair.Serial);
                    }
                    var stockItemId = stockItem?.Id;
                    var serial = !string.IsNullOrWhiteSpace(stockItem?.SerialOrImei) ? stockItem!.SerialOrImei.Trim() : pair.Serial;
                    if (string.IsNullOrWhiteSpace(serial)) continue;
                    if (await _warrantyRepository.ExistsForOrderDetailAsync(detail.Id, stockItemId)) continue;

                    var reuse = unassigned.FirstOrDefault();
                    if (reuse != null)
                    {
                        unassigned.RemoveAt(0);
                        reuse.UserId = order.UserId;
                        reuse.OrderId = order.Id;
                        reuse.OrderDetailId = detail.Id;
                        reuse.ProductId = detail.ProductId;
                        reuse.VariantId = detail.VariantId;
                        reuse.StockItemId = stockItemId;
                        reuse.SerialOrImei = serial;
                        reuse.CustomerName = order.CustomerName;
                        reuse.CustomerPhone = order.CustomerPhone;
                        reuse.CustomerEmail = order.CustomerEmail;
                        reuse.ProductName = detail.ProductName ?? product.Name;
                        reuse.ProductImage = detail.ProductImage ?? product.ImageUrl;
                        reuse.WarrantyMonths = months;
                        reuse.Status = string.IsNullOrWhiteSpace(reuse.Status) ? "NotActivated" : reuse.Status;
                        reuse.UpdatedAt = DateTime.UtcNow;
                        if (string.IsNullOrWhiteSpace(reuse.WarrantyCode))
                        {
                            reuse.WarrantyCode = $"BH-{purchaseDate:yyyyMMdd}-{reuse.Id:0000}";
                        }
                        await _warrantyRepository.UpdateAsync(reuse);
                        continue;
                    }

                    var created = await _warrantyRepository.AddAsync(new WarrantyRecord
                    {
                        UserId = order.UserId,
                        OrderId = order.Id,
                        OrderDetailId = detail.Id,
                        ProductId = detail.ProductId,
                        VariantId = detail.VariantId,
                        StockItemId = stockItemId,
                        SerialOrImei = serial,
                        CustomerName = order.CustomerName,
                        CustomerPhone = order.CustomerPhone,
                        CustomerEmail = order.CustomerEmail,
                        ProductName = detail.ProductName ?? product.Name,
                        ProductImage = detail.ProductImage ?? product.ImageUrl,
                        WarrantyMonths = months,
                        StartDate = null,
                        EndDate = null,
                        Status = "NotActivated",
                        CreatedAt = DateTime.UtcNow
                    });
                    created.WarrantyCode = $"BH-{purchaseDate:yyyyMMdd}-{created.Id:0000}";
                    await _warrantyRepository.UpdateAsync(created);
                }
            }
        }

        public async Task<WarrantyLookupResultDto> LookupAsync(string? serialOrImei, string? orderCode, string? phone)
        {
            var items = await _warrantyRepository.LookupAsync(serialOrImei, orderCode, phone);
            if (items.Count == 0) return new WarrantyLookupResultDto { Found = false, Message = "Không tìm thấy thông tin bảo hành ph hợp." };
            return new WarrantyLookupResultDto { Found = true, Warranties = await ToWarrantyDtos(items) };
        }

        public async Task<List<WarrantyRecordDto>> GetMyAsync(Guid userId)
        {
            return await ToWarrantyDtos(await _warrantyRepository.GetByUserAsync(userId));
        }

        public async Task<(List<WarrantyRecordDto> Items, int TotalCount)> GetAllWarrantiesAsync(SupportSearchDto search)
        {
            var result = await _warrantyRepository.SearchAsync(search);
            return (await ToWarrantyDtos(result.Items), result.TotalCount);
        }

        public async Task<WarrantyRecordDto?> ActivateAsync(int warrantyId, Guid userId)
        {
            var item = await _warrantyRepository.GetDetailAsync(warrantyId);
            if (item == null) return null;
            if (item.UserId != userId) throw new InvalidOperationException("Không có quyền kích hoạt bảo hành này.");
            if (string.Equals(item.Status, "Active", StringComparison.OrdinalIgnoreCase)) return ToWarrantyDto(item, null);

            var now = DateTime.UtcNow;
            item.ActivatedAt = now;
            item.ExpiresAt = now.AddMonths(item.WarrantyMonths <= 0 ? 12 : item.WarrantyMonths);
            item.StartDate = item.ActivatedAt;
            item.EndDate = item.ExpiresAt;
            item.Status = "Active";
            item.UpdatedAt = now;
            await _warrantyRepository.UpdateAsync(item);
            await _notificationService.CreateAsync(item.UserId, "Bảo hành đã được kích hoạt", item.WarrantyCode, "Warranty", "WarrantyRecord", item.Id);
            var latest = await _claimRepository.GetLatestByWarrantyAsync(item.Id);
            return ToWarrantyDto(item, latest?.Status);
        }

        public async Task<WarrantyRecordDto?> ActivateAsStaffAsync(int warrantyId, Guid? userId)
        {
            var item = await _warrantyRepository.GetDetailAsync(warrantyId);
            if (item == null) return null;
            if (string.Equals(item.Status, "Active", StringComparison.OrdinalIgnoreCase)) return ToWarrantyDto(item, null);

            var now = DateTime.UtcNow;
            item.ActivatedAt = now;
            item.ExpiresAt = now.AddMonths(item.WarrantyMonths <= 0 ? 12 : item.WarrantyMonths);
            item.StartDate = item.ActivatedAt;
            item.EndDate = item.ExpiresAt;
            item.Status = "Active";
            item.UpdatedAt = now;
            await _warrantyRepository.UpdateAsync(item);
            await _notificationService.CreateAsync(item.UserId, "Bảo hành đã được kích hoạt", item.WarrantyCode, "Warranty", "WarrantyRecord", item.Id);
            var latest = await _claimRepository.GetLatestByWarrantyAsync(item.Id);
            return ToWarrantyDto(item, latest?.Status);
        }

        public async Task<WarrantyRecordDto?> ActivatePublicAsync(ActivateWarrantyPublicDto dto)
        {
            if (dto == null) throw new InvalidOperationException("Dữ liệu không hợp lệ.");
            var serial = dto.SerialOrImei?.Trim();
            var phone = dto.Phone?.Trim();
            var orderCode = dto.OrderCode?.Trim();
            if (string.IsNullOrWhiteSpace(serial)) throw new InvalidOperationException("Vui lòng nhập Serial/IMEI.");
            if (string.IsNullOrWhiteSpace(phone)) throw new InvalidOperationException("Vui lòng nhập số điện thoại.");

            var records = await _warrantyRepository.LookupAsync(serial, null, null);
            var item = records.FirstOrDefault();
            if (item == null) return null;

            if (!string.Equals(item.CustomerPhone?.Trim(), phone, StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Thông tin kích hoạt không đúng.");
            }

            if (!string.IsNullOrWhiteSpace(orderCode) && !string.Equals(item.Order?.OrderCode?.Trim(), orderCode, StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Thông tin kích hoạt không đúng.");
            }

            if (item.StockItem != null && !string.Equals(item.StockItem.Status, "Sold", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Thiết bị chưa xuất bán, không thể kích hoạt.");
            }

            if (string.Equals(item.Status, "Active", StringComparison.OrdinalIgnoreCase)) return ToWarrantyDto(item, null);

            var now = DateTime.UtcNow;
            item.ActivatedAt = now;
            item.ExpiresAt = now.AddMonths(item.WarrantyMonths <= 0 ? 12 : item.WarrantyMonths);
            item.StartDate = item.ActivatedAt;
            item.EndDate = item.ExpiresAt;
            item.Status = "Active";
            item.UpdatedAt = now;
            await _warrantyRepository.UpdateAsync(item);
            await _notificationService.CreateAsync(item.UserId, "Bảo hành đã kích hoạt", item.WarrantyCode, "Warranty", "WarrantyRecord", item.Id);
            var latest = await _claimRepository.GetLatestByWarrantyAsync(item.Id);
            return ToWarrantyDto(item, latest?.Status);
        }

        public async Task<List<WarrantyClaimDto>> GetMyClaimsAsync(Guid userId, int? warrantyId)
        {
            var claims = await _claimRepository.GetByUserAsync(userId, warrantyId);
            return claims.Select(ToClaimDto).ToList();
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
            if (productId <= 0) throw new InvalidOperationException("Không tìm thấy sản phẩm bảo hành.");
            var product = await _productRepository.GetByIdAsync(productId);
            if (warranty == null)
            {
                if (stockItem == null) throw new InvalidOperationException("Không tìm thấy thông tin thiết bị để bảo hành.");
                var serial = dto.SerialOrImei?.Trim() ?? stockItem.SerialOrImei.Trim();
                if (string.IsNullOrWhiteSpace(serial)) throw new InvalidOperationException("Serial/IMEI không hợp lệ.");

                warranty = (await _warrantyRepository.LookupAsync(serial, null, null)).FirstOrDefault();
                if (warranty == null)
                {
                    Order? order = null;
                    OrderDetail? detail = null;
                    if (stockItem.OrderId.HasValue) order = await _orderRepository.GetByIdAsync(stockItem.OrderId.Value);
                    if (stockItem.OrderDetailId.HasValue) detail = await _orderDetailRepository.GetByIdAsync(stockItem.OrderDetailId.Value);
                    var months = product?.WarrantyMonths > 0 ? product.WarrantyMonths : 12;
                    var now = DateTime.UtcNow;

                    var created = await _warrantyRepository.AddAsync(new WarrantyRecord
                    {
                        UserId = order?.UserId ?? userId ?? stockItem.CustomerId,
                        OrderId = stockItem.OrderId,
                        OrderDetailId = stockItem.OrderDetailId,
                        ProductId = productId,
                        VariantId = stockItem.VariantId,
                        StockItemId = stockItem.Id,
                        SerialOrImei = serial,
                        CustomerName = dto.CustomerName?.Trim() ?? order?.CustomerName,
                        CustomerPhone = dto.CustomerPhone?.Trim() ?? order?.CustomerPhone,
                        CustomerEmail = dto.CustomerEmail?.Trim() ?? order?.CustomerEmail,
                        ProductName = detail?.ProductName ?? product?.Name,
                        ProductImage = detail?.ProductImage ?? product?.ImageUrl,
                        WarrantyMonths = months,
                        StartDate = null,
                        EndDate = null,
                        Status = "NotActivated",
                        CreatedAt = now
                    });
                    created.WarrantyCode = $"BH-{now:yyyyMMdd}-{created.Id:0000}";
                    await _warrantyRepository.UpdateAsync(created);
                    warranty = created;
                }
            }

            var claim = await _claimRepository.AddAsync(new WarrantyClaim
            {
                WarrantyId = warranty.Id,
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
            await AddUpdate(claim.Id, "Pending", "Yêu cầu bảo hành đã được gửi", "Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.", userId);
            if (dto.Attachments.Count > 0)
            {
                foreach (var url in dto.Attachments.Where(x => !string.IsNullOrWhiteSpace(x)).Distinct())
                {
                    var fileUrl = url.Trim();
                    var fileName = Path.GetFileName(fileUrl);
                    var ext = Path.GetExtension(fileName);
                    var contentType = string.Equals(ext, ".pdf", StringComparison.OrdinalIgnoreCase) ? "application/pdf" : "image/*";
                    await _attachmentRepository.AddAsync(new Attachment
                    {
                        EntityType = "WarrantyClaim",
                        EntityId = claim.Id,
                        FileName = string.IsNullOrWhiteSpace(fileName) ? fileUrl : fileName,
                        FileUrl = fileUrl,
                        ContentType = contentType,
                        Size = 0,
                        UploadedByUserId = userId,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }
            await _notificationService.CreateAsync(claim.UserId, "Yêu cầu bảo hành đã được gửi", claim.ClaimCode, "Warranty", "WarrantyClaim", claim.Id);
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
            "Confirmed" => "Nhân viên đã xác nhận yêu cầu",
            "Received" => "Sản phẩm đã được tiếp nhận",
            "Diagnosing" => "Kỹ thuật đang kiểm tra",
            "Repairing" => "Sản phẩm đang được sửa chữa",
            "ReadyToReturn" => "Sản phẩm sẵn sàng trả khách",
            "Rejected" => "Yêu cầu bảo hành bị từ chối",
            _ => "Cập nhật yêu cầu bảo hành"
        };

        private static List<string?> SplitSerials(string? serials) => string.IsNullOrWhiteSpace(serials) ? new() : serials.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).Cast<string?>().ToList();

        private static WarrantyRecordDto ToWarrantyDto(WarrantyRecord item, string? latestClaimStatus)
        {
            var purchase = item.Order?.CreatedAt ?? item.CreatedAt;
            var activatedAt = item.ActivatedAt ?? (item.Status == "Active" ? item.StartDate : null);
            var expiresAt = item.ExpiresAt ?? (item.Status == "Active" ? item.EndDate : null);
            if (!expiresAt.HasValue)
            {
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
                    PurchaseDate = purchase,
                    ActivatedAt = activatedAt,
                    ExpiresAt = expiresAt,
                    StartDate = item.StartDate,
                    EndDate = item.EndDate,
                    Status = item.Status,
                    IsExpired = false,
                    DaysRemaining = 0,
                    LatestClaimStatus = latestClaimStatus,
                    Note = item.Note
                };
            }

            var exp = expiresAt.Value;
            var days = (int)Math.Ceiling((exp.Date - DateTime.UtcNow.Date).TotalDays);
            var expired = exp < DateTime.UtcNow;
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
                PurchaseDate = purchase,
                ActivatedAt = activatedAt,
                ExpiresAt = expiresAt,
                StartDate = item.StartDate,
                EndDate = item.EndDate,
                Status = expired && item.Status == "Active" ? "Expired" : item.Status,
                IsExpired = expired,
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
