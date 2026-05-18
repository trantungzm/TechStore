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
            var definition = new SpecDefinition
            {
                CategoryId = dto.CategoryId,
                Name = dto.Name,
                Code = dto.Code,
                DataType = string.IsNullOrWhiteSpace(dto.DataType) ? "text" : dto.DataType,
                Unit = dto.Unit,
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

            definition.CategoryId = dto.CategoryId;
            definition.Name = dto.Name;
            definition.Code = dto.Code;
            definition.DataType = string.IsNullOrWhiteSpace(dto.DataType) ? "text" : dto.DataType;
            definition.Unit = dto.Unit;
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
            var productExists = await _db.Products.AnyAsync(x => x.Id == productId);
            if (!productExists) return NotFound(new { message = "Product not found" });

            var incoming = values
                .Where(x => x.SpecDefinitionId > 0)
                .GroupBy(x => x.SpecDefinitionId)
                .Select(x => x.Last())
                .ToList();

            var definitionIds = incoming.Select(x => x.SpecDefinitionId).ToList();
            var existing = await _db.ProductSpecValues
                .Where(x => x.ProductId == productId && definitionIds.Contains(x.SpecDefinitionId))
                .ToListAsync();

            foreach (var item in incoming)
            {
                var value = existing.FirstOrDefault(x => x.SpecDefinitionId == item.SpecDefinitionId);
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
    }
}
