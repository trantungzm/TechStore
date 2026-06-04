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
        private const string FixedSpecInputType = "select";
        private readonly AppDbContext _db;

        public SpecsController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet("definitions")]
        public async Task<IActionResult> GetDefinitions([FromQuery] int? categoryId)
        {
            var query = _db.SpecDefinitions
                .AsNoTracking()
                .Include(x => x.Options.Where(o => o.IsActive))
                .Where(x => x.IsActive)
                .AsQueryable();
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

            var optionValidation = ValidateDefinitionOptions(dto.Options);
            if (optionValidation != null) return optionValidation;

            var definition = new SpecDefinition
            {
                CategoryId = dto.CategoryId,
                Name = dto.Name.Trim(),
                Code = dto.Code.Trim(),
                DataType = FixedSpecInputType,
                InputType = FixedSpecInputType,
                SortOrder = await GetNextSortOrder(dto.CategoryId),
                IsComparable = true,
                AllowCustomValue = false,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            if (dto.Options != null)
            {
                definition.Options = dto.Options
                    .Where(x => !string.IsNullOrWhiteSpace(x.Value))
                    .Select((x, index) => CreateOptionEntity(x, index))
                    .ToList();
            }

            _db.SpecDefinitions.Add(definition);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetDefinitions), new { categoryId = definition.CategoryId }, StoreDtoMapper.ToSpecDefinitionDto(definition));
        }

        [HttpPut("definitions/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateDefinition(int id, [FromBody] SpecDefinitionDto dto)
        {
            var definition = await _db.SpecDefinitions
                .Include(x => x.Options)
                .FirstOrDefaultAsync(x => x.Id == id);
            if (definition == null) return NotFound(new { message = "Spec definition not found" });

            var validation = await ValidateDefinition(dto, id);
            if (validation != null) return validation;

            var optionValidation = ValidateDefinitionOptions(dto.Options);
            if (optionValidation != null) return optionValidation;

            definition.CategoryId = dto.CategoryId;
            definition.Name = dto.Name.Trim();
            definition.Code = dto.Code.Trim();
            definition.UpdatedAt = DateTime.UtcNow;

            if (dto.Options != null)
            {
                await SyncDefinitionOptions(definition, dto.Options);
            }

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
            if (isUsed)
            {
                definition.IsActive = false;
                definition.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
                return Ok(StoreDtoMapper.ToSpecDefinitionDto(definition));
            }

            _db.SpecDefinitions.Remove(definition);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Spec definition deleted successfully" });
        }

        [HttpPost("options")]
        [Authorize]
        public async Task<IActionResult> CreateOption([FromBody] SpecOptionDto dto)
        {
            var validation = await ValidateOption(dto);
            if (validation != null) return validation;

            var option = new SpecOption
            {
                SpecDefinitionId = dto.SpecDefinitionId,
                Value = dto.Value.Trim(),
                DisplayOrder = dto.DisplayOrder,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _db.SpecOptions.Add(option);
            await _db.SaveChangesAsync();
            return Ok(StoreDtoMapper.ToSpecOptionDto(option));
        }

        [HttpPut("options/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateOption(int id, [FromBody] SpecOptionDto dto)
        {
            var option = await _db.SpecOptions.FindAsync(id);
            if (option == null) return NotFound(new { message = "Spec option not found" });

            dto.SpecDefinitionId = dto.SpecDefinitionId <= 0 ? option.SpecDefinitionId : dto.SpecDefinitionId;
            var validation = await ValidateOption(dto, id);
            if (validation != null) return validation;

            option.SpecDefinitionId = dto.SpecDefinitionId;
            option.Value = dto.Value.Trim();
            option.DisplayOrder = dto.DisplayOrder;
            option.IsActive = dto.IsActive;
            option.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return Ok(StoreDtoMapper.ToSpecOptionDto(option));
        }

        [HttpDelete("options/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteOption(int id)
        {
            var option = await _db.SpecOptions.FindAsync(id);
            if (option == null) return NotFound(new { message = "Spec option not found" });

            var isUsed = await _db.ProductSpecValues.AnyAsync(x => x.SpecOptionId == id);
            if (isUsed)
            {
                option.IsActive = false;
                option.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
                return Ok(StoreDtoMapper.ToSpecOptionDto(option));
            }

            _db.SpecOptions.Remove(option);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Spec option deleted successfully" });
        }

        [HttpGet("products/{productId}")]
        public async Task<IActionResult> GetProductSpecs(int productId)
        {
            var specs = await _db.ProductSpecValues
                .AsNoTracking()
                .Include(x => x.SpecDefinition)
                .Include(x => x.SpecOption)
                .Where(x => x.ProductId == productId)
                .Where(x => x.SpecDefinition.IsActive)
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
            var definitions = await _db.SpecDefinitions
                .Include(x => x.Options)
                .Where(x => x.CategoryId == product.CategoryId && definitionIds.Contains(x.Id))
                .ToListAsync();
            var validDefinitionIds = definitions.Select(x => x.Id).ToList();

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
                var definition = definitions.First(x => x.Id == item.SpecDefinitionId);
                if (item.SpecOptionId.HasValue)
                {
                    var optionIsValid = definition.Options.Any(x => x.Id == item.SpecOptionId.Value && x.IsActive);
                    if (!optionIsValid)
                    {
                        return BadRequest(new { message = "Spec option must belong to the selected definition", item.SpecDefinitionId, item.SpecOptionId });
                    }
                }

                var value = existing.FirstOrDefault(x => x.SpecDefinitionId == item.SpecDefinitionId);
                var hasValue =
                    item.SpecOptionId.HasValue ||
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

                value.SpecOptionId = item.SpecOptionId;
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

        private async Task<IActionResult?> ValidateOption(SpecOptionDto dto, int? currentId = null)
        {
            if (dto == null) return BadRequest(new { message = "Invalid request" });
            if (dto.SpecDefinitionId <= 0) return BadRequest(new { message = "Spec definition is required" });
            if (string.IsNullOrWhiteSpace(dto.Value)) return BadRequest(new { message = "Option value is required" });

            var definitionExists = await _db.SpecDefinitions.AnyAsync(x => x.Id == dto.SpecDefinitionId);
            if (!definitionExists) return BadRequest(new { message = "Spec definition not found" });

            var value = dto.Value.Trim();
            var duplicate = await _db.SpecOptions.AnyAsync(x =>
                x.SpecDefinitionId == dto.SpecDefinitionId &&
                x.Value == value &&
                (!currentId.HasValue || x.Id != currentId.Value));
            if (duplicate) return Conflict(new { message = "Spec option already exists in this definition" });

            return null;
        }

        private BadRequestObjectResult? ValidateDefinitionOptions(List<SpecOptionDto>? options)
        {
            if (options == null) return null;

            var values = options
                .Where(x => !string.IsNullOrWhiteSpace(x.Value))
                .Select(x => x.Value.Trim())
                .ToList();

            var duplicateValues = values
                .GroupBy(x => x, StringComparer.OrdinalIgnoreCase)
                .Where(x => x.Count() > 1)
                .Select(x => x.Key)
                .ToList();

            return duplicateValues.Count == 0
                ? null
                : BadRequest(new { message = "Spec options must be unique", duplicateValues });
        }

        private async Task SyncDefinitionOptions(SpecDefinition definition, List<SpecOptionDto> options)
        {
            var incoming = options
                .Where(x => !string.IsNullOrWhiteSpace(x.Value))
                .Select((option, index) => new { Option = option, Index = index })
                .ToList();
            var incomingIds = incoming
                .Where(x => x.Option.Id > 0)
                .Select(x => x.Option.Id)
                .ToHashSet();

            foreach (var existing in definition.Options.Where(x => !incomingIds.Contains(x.Id)).ToList())
            {
                var isUsed = await _db.ProductSpecValues.AnyAsync(x => x.SpecOptionId == existing.Id);
                if (isUsed)
                {
                    existing.IsActive = false;
                    existing.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    _db.SpecOptions.Remove(existing);
                }
            }

            foreach (var item in incoming)
            {
                var dto = item.Option;
                var existing = dto.Id > 0
                    ? definition.Options.FirstOrDefault(x => x.Id == dto.Id)
                    : null;

                if (existing == null)
                {
                    definition.Options.Add(CreateOptionEntity(dto, item.Index));
                    continue;
                }

                existing.Value = dto.Value.Trim();
                existing.DisplayOrder = dto.DisplayOrder > 0 ? dto.DisplayOrder : item.Index + 1;
                existing.IsActive = dto.IsActive;
                existing.UpdatedAt = DateTime.UtcNow;
            }
        }

        private static SpecOption CreateOptionEntity(SpecOptionDto dto, int index) => new()
        {
            Value = dto.Value.Trim(),
            DisplayOrder = dto.DisplayOrder > 0 ? dto.DisplayOrder : index + 1,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        private async Task<int> GetNextSortOrder(int categoryId)
        {
            var maxSortOrder = await _db.SpecDefinitions
                .Where(x => x.CategoryId == categoryId)
                .Select(x => (int?)x.SortOrder)
                .MaxAsync();
            return (maxSortOrder ?? 0) + 1;
        }
    }
}
