using BaseCore.DTO.Inventory;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BaseCore.APIService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin,Warehouse")]
    public class SuppliersController : ControllerBase
    {
        private readonly ISupplierRepositoryEF _supplierRepository;

        public SuppliersController(ISupplierRepositoryEF supplierRepository)
        {
            _supplierRepository = supplierRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? keyword, [FromQuery] bool? isActive, [FromQuery] int page = 1, [FromQuery] int pageSize = 100)
        {
            var result = await _supplierRepository.SearchAsync(new SupplierSearchDto
            {
                Keyword = keyword,
                IsActive = isActive,
                Page = Math.Max(1, page),
                PageSize = Math.Clamp(pageSize, 1, 100)
            });

            return Ok(new
            {
                items = result.Items.Select(ToDto),
                totalCount = result.TotalCount,
                page = Math.Max(1, page),
                pageSize = Math.Clamp(pageSize, 1, 100),
                totalPages = (int)Math.Ceiling(result.TotalCount / (double)Math.Clamp(pageSize, 1, 100))
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var supplier = await _supplierRepository.GetDetailAsync(id);
            return supplier == null ? NotFound(new { message = "Supplier not found" }) : Ok(ToDto(supplier));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SupplierUpsertDto dto)
        {
            var entity = new Supplier
            {
                Name = dto.Name.Trim(),
                SupplierCode = ResolveCode(dto),
                Phone = dto.Phone?.Trim(),
                Email = dto.Email?.Trim(),
                Address = dto.Address?.Trim(),
                TaxCode = dto.TaxCode?.Trim(),
                ContactPerson = dto.ContactPerson?.Trim(),
                SupplierType = ParseSupplierType(dto.SupplierType),
                Note = dto.Note?.Trim(),
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            await _supplierRepository.AddAsync(entity);
            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, ToDto(entity));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] SupplierUpsertDto dto)
        {
            var entity = await _supplierRepository.GetByIdAsync(id);
            if (entity == null) return NotFound(new { message = "Supplier not found" });

            entity.Name = dto.Name.Trim();
            entity.SupplierCode = string.IsNullOrWhiteSpace(dto.SupplierCode ?? dto.Code) ? entity.SupplierCode : (dto.SupplierCode ?? dto.Code)!.Trim();
            entity.Phone = dto.Phone?.Trim();
            entity.Email = dto.Email?.Trim();
            entity.Address = dto.Address?.Trim();
            entity.TaxCode = dto.TaxCode?.Trim();
            entity.ContactPerson = dto.ContactPerson?.Trim();
            entity.SupplierType = ParseSupplierType(dto.SupplierType);
            entity.Note = dto.Note?.Trim();
            entity.IsActive = dto.IsActive;
            entity.UpdatedAt = DateTime.UtcNow;

            await _supplierRepository.UpdateAsync(entity);
            return Ok(ToDto(entity));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _supplierRepository.GetByIdAsync(id);
            if (entity == null) return NotFound(new { message = "Supplier not found" });

            if (!await _supplierRepository.IsUsedAsync(id))
            {
                await _supplierRepository.DeleteAsync(entity);
                return Ok(new { message = "Supplier deleted successfully" });
            }

            entity.IsActive = false;
            entity.UpdatedAt = DateTime.UtcNow;
            await _supplierRepository.UpdateAsync(entity);
            return Ok(new { message = "Supplier deactivated successfully" });
        }

        [HttpPut("{id}/toggle-active")]
        public async Task<IActionResult> ToggleActive(int id)
        {
            var entity = await _supplierRepository.GetByIdAsync(id);
            if (entity == null) return NotFound(new { message = "Supplier not found" });

            entity.IsActive = !entity.IsActive;
            entity.UpdatedAt = DateTime.UtcNow;
            await _supplierRepository.UpdateAsync(entity);
            return Ok(ToDto(entity));
        }

        private static SupplierDto ToDto(Supplier supplier) => new()
        {
            Id = supplier.Id,
            SupplierCode = supplier.SupplierCode,
            Code = supplier.SupplierCode,
            Name = supplier.Name,
            Phone = supplier.Phone,
            Email = supplier.Email,
            Address = supplier.Address,
            TaxCode = supplier.TaxCode,
            ContactPerson = supplier.ContactPerson,
            SupplierType = supplier.SupplierType.ToString(),
            Note = supplier.Note,
            IsActive = supplier.IsActive,
            CreatedAt = supplier.CreatedAt,
            UpdatedAt = supplier.UpdatedAt
        };

        private static string ResolveCode(SupplierUpsertDto dto)
        {
            var code = dto.SupplierCode ?? dto.Code;
            return string.IsNullOrWhiteSpace(code) ? GenerateCode(dto.Name) : code.Trim();
        }

        private static SupplierType ParseSupplierType(string? value)
        {
            return Enum.TryParse<SupplierType>(value, true, out var result)
                ? result
                : SupplierType.AuthorizedDistributor;
        }

        private static string GenerateCode(string value)
        {
            var text = new string((value ?? string.Empty).Trim().ToUpperInvariant().Select(ch => char.IsLetterOrDigit(ch) ? ch : '-').ToArray());
            while (text.Contains("--")) text = text.Replace("--", "-");
            var baseCode = text.Trim('-');
            return string.IsNullOrWhiteSpace(baseCode) ? $"SUP-{DateTime.UtcNow:yyyyMMddHHmmss}" : $"SUP-{baseCode[..Math.Min(baseCode.Length, 20)]}";
        }
    }
}
