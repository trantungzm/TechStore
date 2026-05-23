using BaseCore.APIService;
using BaseCore.DTO.Store;
using BaseCore.Entities;
using BaseCore.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BaseCore.APIService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SpecsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public SpecsController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet("definitions")]
        public async Task<IActionResult> GetDefinitions([FromQuery] int? categoryId)
        {
            var query = _db.SpecDefinitions.AsNoTracking().AsQueryable();
            if (categoryId.HasValue && categoryId.Value > 0)
            {
                query = query.Where(x => x.CategoryId == categoryId.Value);
            }

            var definitions = await query
                .OrderBy(x => x.SortOrder)
                .ThenBy(x => x.Id)
                .ToListAsync();

            return Ok(definitions.Select(StoreDtoMapper.ToSpecDefinitionDto));
        }

        [HttpPost("definitions")]
        [Authorize]
        public async Task<IActionResult> CreateDefinition([FromBody] SpecDefinitionDto dto)
        {
            var validation = await ValidateDefinition(dto);
            if (validation != null) return validation;

            var definition = new SpecDefinition
            {
                CategoryId = dto.CategoryId,
                Name = dto.Name.Trim(),
                Code = dto.Code.Trim(),
                DataType = string.IsNullOrWhiteSpace(dto.DataType) ? "text" : dto.DataType,
                Unit = dto.Unit?.Trim(),
                SortOrder = dto.SortOrder,
                IsComparable = dto.IsComparable,
                IsFilterable = dto.IsFilterable,
                IsRequired = dto.IsRequired,
                CreatedAt = DateTime.UtcNow
            };

            _db.SpecDefinitions.Add(definition);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetDefinitions), new { categoryId = definition.CategoryId }, StoreDtoMapper.ToSpecDefinitionDto(definition));
        }

        [HttpPut("definitions/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateDefinition(int id, [FromBody] SpecDefinitionDto dto)
        {
            var definition = await _db.SpecDefinitions.FindAsync(id);
            if (definition == null) return NotFound(new { message = "Spec definition not found" });

            var validation = await ValidateDefinition(dto, id);
            if (validation != null) return validation;

            definition.CategoryId = dto.CategoryId;
            definition.Name = dto.Name.Trim();
            definition.Code = dto.Code.Trim();
            definition.DataType = string.IsNullOrWhiteSpace(dto.DataType) ? "text" : dto.DataType;
            definition.Unit = dto.Unit?.Trim();
            definition.SortOrder = dto.SortOrder;
            definition.IsComparable = dto.IsComparable;
            definition.IsFilterable = dto.IsFilterable;
            definition.IsRequired = dto.IsRequired;
            definition.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return Ok(StoreDtoMapper.ToSpecDefinitionDto(definition));
        }

        [HttpDelete("definitions/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteDefinition(int id)
        {
            var definition = await _db.SpecDefinitions.FindAsync(id);
            if (definition == null) return NotFound(new { message = "Spec definition not found" });

            var isUsed = await _db.ProductSpecValues.AnyAsync(x => x.SpecDefinitionId == id);
            if (isUsed) return BadRequest(new { message = "Cannot delete spec definition because products are using it" });

            _db.SpecDefinitions.Remove(definition);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Spec definition deleted successfully" });
        }

        [HttpGet("products/{productId}")]
        public async Task<IActionResult> GetProductSpecs(int productId)
        {
            var specs = await _db.ProductSpecValues
                .AsNoTracking()
                .Include(x => x.SpecDefinition)
                .Where(x => x.ProductId == productId)
                .OrderBy(x => x.SpecDefinition.SortOrder)
                .ThenBy(x => x.Id)
                .ToListAsync();

            return Ok(specs.Select(StoreDtoMapper.ToSpecValueDto));
        }

        [HttpPut("products/{productId}")]
        [Authorize]
        public async Task<IActionResult> UpsertProductSpecs(int productId, [FromBody] List<ProductSpecValueUpsertDto> values)
        {
            var product = await _db.Products.AsNoTracking().FirstOrDefaultAsync(x => x.Id == productId);
            if (product == null) return NotFound(new { message = "Product not found" });

            var incoming = values
                .Where(x => x.SpecDefinitionId > 0)
                .GroupBy(x => x.SpecDefinitionId)
                .Select(x => x.Last())
                .ToList();

            var definitionIds = incoming.Select(x => x.SpecDefinitionId).ToList();
            var validDefinitionIds = await _db.SpecDefinitions
                .Where(x => x.CategoryId == product.CategoryId && definitionIds.Contains(x.Id))
                .Select(x => x.Id)
                .ToListAsync();

            var invalidDefinitionIds = definitionIds.Except(validDefinitionIds).ToList();
            if (invalidDefinitionIds.Count > 0)
            {
                return BadRequest(new { message = "Specs must belong to the product category", invalidDefinitionIds });
            }

            var categoryDefinitionIds = await _db.SpecDefinitions
                .Where(x => x.CategoryId == product.CategoryId)
                .Select(x => x.Id)
                .ToListAsync();

            var existing = await _db.ProductSpecValues
                .Where(x => x.ProductId == productId && categoryDefinitionIds.Contains(x.SpecDefinitionId))
                .ToListAsync();

            var incomingIds = incoming.Select(x => x.SpecDefinitionId).ToHashSet();
            foreach (var stale in existing.Where(x => !incomingIds.Contains(x.SpecDefinitionId)).ToList())
            {
                _db.ProductSpecValues.Remove(stale);
            }

            foreach (var item in incoming)
            {
                var value = existing.FirstOrDefault(x => x.SpecDefinitionId == item.SpecDefinitionId);
                var hasValue =
                    !string.IsNullOrWhiteSpace(item.ValueText) ||
                    item.ValueNumber.HasValue ||
                    item.ValueBool.HasValue;

                if (!hasValue)
                {
                    if (value != null) _db.ProductSpecValues.Remove(value);
                    continue;
                }

                if (value == null)
                {
                    value = new ProductSpecValue
                    {
                        ProductId = productId,
                        SpecDefinitionId = item.SpecDefinitionId,
                        CreatedAt = DateTime.UtcNow
                    };
                    _db.ProductSpecValues.Add(value);
                }

                value.ValueText = item.ValueText;
                value.ValueNumber = item.ValueNumber;
                value.ValueBool = item.ValueBool;
                value.UpdatedAt = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync();
            return await GetProductSpecs(productId);
        }

        private async Task<IActionResult?> ValidateDefinition(SpecDefinitionDto dto, int? currentId = null)
        {
            if (dto == null) return BadRequest(new { message = "Invalid request" });
            if (dto.CategoryId <= 0) return BadRequest(new { message = "Category is required" });
            if (string.IsNullOrWhiteSpace(dto.Name)) return BadRequest(new { message = "Spec name is required" });
            if (string.IsNullOrWhiteSpace(dto.Code)) return BadRequest(new { message = "Spec code is required" });

            var categoryExists = await _db.Categories.AnyAsync(x => x.Id == dto.CategoryId);
            if (!categoryExists) return BadRequest(new { message = "Category not found" });

            var code = dto.Code.Trim();
            var duplicate = await _db.SpecDefinitions.AnyAsync(x =>
                x.CategoryId == dto.CategoryId &&
                x.Code == code &&
                (!currentId.HasValue || x.Id != currentId.Value));

            if (duplicate) return Conflict(new { message = "Spec code already exists in this category" });

            return null;
        }
    }
}
