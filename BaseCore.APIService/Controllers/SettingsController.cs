using System.Net.Mail;
using System.Text.Json;
using BaseCore.Entities;
using BaseCore.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BaseCore.APIService.Controllers
{
    [Route("api/settings")]
    [ApiController]
    public class SettingsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public SettingsController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> Get()
        {
            var setting = await GetOrCreateDefaultAsync();
            return Ok(ToDto(setting));
        }

        [HttpGet("pickup-branches")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPickupBranches()
        {
            var branches = await _db.Warehouses
                .AsNoTracking()
                .Where(x => x.IsActive)
                .OrderBy(x => x.Id)
                .Select(x => new PickupBranchDto
                {
                    Id = x.Id,
                    Code = x.Code,
                    Name = x.Name,
                    Address = x.Address
                })
                .ToListAsync();
            return Ok(branches);
        }

        [HttpPut]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update([FromBody] StoreSettingRequest request)
        {
            var validation = ValidateRequest(request);
            if (validation != null)
            {
                return validation;
            }

            var setting = await GetOrCreateDefaultAsync();
            setting.StoreName = request.StoreName.Trim();
            setting.Hotline = request.Hotline.Trim();
            setting.SupportEmail = NormalizeOptional(request.SupportEmail);
            setting.Address = NormalizeOptional(request.Address);
            setting.WarrantyAddress = NormalizeOptional(request.WarrantyAddress);
            setting.DefaultShippingFee = request.DefaultShippingFee;
            setting.FreeShippingThreshold = request.FreeShippingThreshold;
            setting.SupportTime = NormalizeOptional(request.SupportTime);
            setting.LogoUrl = NormalizeOptional(request.LogoUrl);
            setting.FacebookUrl = NormalizeOptional(request.FacebookUrl);
            setting.ZaloUrl = NormalizeOptional(request.ZaloUrl);
            setting.BankName = NormalizeOptional(request.BankName);
            setting.BankAccountNumber = NormalizeOptional(request.BankAccountNumber);
            setting.BankAccountHolder = NormalizeOptional(request.BankAccountHolder);
            setting.BankAccountsJson = SerializeBankAccounts(request.BankAccounts);
            setting.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return Ok(ToDto(setting));
        }

        private async Task<StoreSetting> GetOrCreateDefaultAsync()
        {
            var setting = await _db.StoreSettings.FirstOrDefaultAsync();
            if (setting != null)
            {
                return setting;
            }

            setting = new StoreSetting
            {
                Id = 1,
                StoreName = "CNTHHT Store",
                Hotline = "0327 188 459",
                SupportEmail = "support@cnthht.vn",
                Address = string.Empty,
                WarrantyAddress = string.Empty,
                DefaultShippingFee = 0,
                SupportTime = string.Empty,
                LogoUrl = string.Empty,
                FacebookUrl = string.Empty,
                ZaloUrl = string.Empty,
                BankName = string.Empty,
                BankAccountNumber = string.Empty,
                BankAccountHolder = string.Empty,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.StoreSettings.Add(setting);
            await _db.SaveChangesAsync();
            return setting;
        }

        private static IActionResult? ValidateRequest(StoreSettingRequest? request)
        {
            if (request == null)
            {
                return new BadRequestObjectResult(new { message = "Invalid request" });
            }

            if (string.IsNullOrWhiteSpace(request.StoreName))
            {
                return new BadRequestObjectResult(new { message = "Store name is required" });
            }

            if (string.IsNullOrWhiteSpace(request.Hotline))
            {
                return new BadRequestObjectResult(new { message = "Hotline is required" });
            }

            if (request.DefaultShippingFee < 0)
            {
                return new BadRequestObjectResult(new { message = "Default shipping fee must be greater than or equal to 0" });
            }

            if (request.FreeShippingThreshold.HasValue && request.FreeShippingThreshold.Value < 0)
            {
                return new BadRequestObjectResult(new { message = "Free shipping threshold must be greater than or equal to 0" });
            }

            var email = NormalizeOptional(request.SupportEmail);
            if (!string.IsNullOrWhiteSpace(email) && !IsValidEmail(email))
            {
                return new BadRequestObjectResult(new { message = "Support email is invalid" });
            }

            return null;
        }

        private static bool IsValidEmail(string email)
        {
            try
            {
                var address = new MailAddress(email);
                return string.Equals(address.Address, email, StringComparison.OrdinalIgnoreCase);
            }
            catch
            {
                return false;
            }
        }

        private static string? NormalizeOptional(string? value)
        {
            var normalized = value?.Trim();
            return string.IsNullOrEmpty(normalized) ? string.Empty : normalized;
        }

        private static StoreSettingDto ToDto(StoreSetting setting)
        {
            return new StoreSettingDto
            {
                Id = setting.Id,
                StoreName = setting.StoreName,
                Hotline = setting.Hotline,
                SupportEmail = setting.SupportEmail,
                Address = setting.Address,
                WarrantyAddress = setting.WarrantyAddress,
                DefaultShippingFee = setting.DefaultShippingFee,
                FreeShippingThreshold = setting.FreeShippingThreshold,
                SupportTime = setting.SupportTime,
                LogoUrl = setting.LogoUrl,
                FacebookUrl = setting.FacebookUrl,
                ZaloUrl = setting.ZaloUrl,
                BankName = setting.BankName,
                BankAccountNumber = setting.BankAccountNumber,
                BankAccountHolder = setting.BankAccountHolder,
                BankAccounts = DeserializeBankAccounts(setting.BankAccountsJson),
                CreatedAt = setting.CreatedAt,
                UpdatedAt = setting.UpdatedAt
            };
        }

        private static readonly JsonSerializerOptions BankJsonOptions = new(JsonSerializerDefaults.Web);

        private static string? SerializeBankAccounts(List<BankAccountDto>? list)
        {
            var clean = (list ?? new List<BankAccountDto>())
                .Where(b => b != null && !string.IsNullOrWhiteSpace(b.BankName) && !string.IsNullOrWhiteSpace(b.AccountNumber))
                .Select(b => new BankAccountDto
                {
                    BankName = b.BankName!.Trim(),
                    AccountNumber = b.AccountNumber!.Trim(),
                    AccountHolder = b.AccountHolder?.Trim()
                })
                .ToList();
            return clean.Count == 0 ? null : JsonSerializer.Serialize(clean, BankJsonOptions);
        }

        private static List<BankAccountDto> DeserializeBankAccounts(string? json)
        {
            if (string.IsNullOrWhiteSpace(json)) return new List<BankAccountDto>();
            try { return JsonSerializer.Deserialize<List<BankAccountDto>>(json, BankJsonOptions) ?? new List<BankAccountDto>(); }
            catch { return new List<BankAccountDto>(); }
        }
    }

    public class BankAccountDto
    {
        public string? BankName { get; set; }
        public string? AccountNumber { get; set; }
        public string? AccountHolder { get; set; }
    }

    public class StoreSettingRequest
    {
        public string StoreName { get; set; } = string.Empty;
        public string Hotline { get; set; } = string.Empty;
        public string? SupportEmail { get; set; }
        public string? Address { get; set; }
        public string? WarrantyAddress { get; set; }
        public decimal DefaultShippingFee { get; set; }
        public decimal? FreeShippingThreshold { get; set; }
        public string? SupportTime { get; set; }
        public string? LogoUrl { get; set; }
        public string? FacebookUrl { get; set; }
        public string? ZaloUrl { get; set; }
        public string? BankName { get; set; }
        public string? BankAccountNumber { get; set; }
        public string? BankAccountHolder { get; set; }
        public List<BankAccountDto>? BankAccounts { get; set; }
    }

    public class StoreSettingDto : StoreSettingRequest
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class PickupBranchDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Address { get; set; }
    }
}
