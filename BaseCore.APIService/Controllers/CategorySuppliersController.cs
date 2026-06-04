using BaseCore.DTO.Inventory;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BaseCore.APIService.Controllers
{
    [Route("api/category-suppliers")]
    [ApiController]
    [Authorize(Roles = "Admin,Warehouse")]
    public class CategorySuppliersController : ControllerBase
    {
        private readonly ICategorySupplierRepositoryEF _categorySupplierRepository;
        private readonly ICategoryRepositoryEF _categoryRepository;
        private readonly ISupplierRepositoryEF _supplierRepository;

        public CategorySuppliersController(
            ICategorySupplierRepositoryEF categorySupplierRepository,
            ICategoryRepositoryEF categoryRepository,
            ISupplierRepositoryEF supplierRepository)
        {
            _categorySupplierRepository = categorySupplierRepository;
            _categoryRepository = categoryRepository;
            _supplierRepository = supplierRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _categorySupplierRepository.GetAllDetailAsync();
            return Ok(items.Select(ToDto));
        }

        [HttpGet("category/{categoryId}")]
        public async Task<IActionResult> GetByCategory(int categoryId)
        {
            var items = await _categorySupplierRepository.GetByCategoryAsync(categoryId);
            return Ok(items.Select(ToDto));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CategorySupplierUpsertDto dto)
        {
            await ValidateUpsert(dto);
            if (await _categorySupplierRepository.CountByCategoryAsync(dto.CategoryId) >= 2)
            {
                return BadRequest(new { message = "A category can have at most 2 suppliers" });
            }

            if (await _categorySupplierRepository.ExistsAsync(dto.CategoryId, dto.SupplierId))
            {
                return Conflict(new { message = "Supplier already belongs to this category" });
            }

            var entity = await _categorySupplierRepository.AddAsync(new CategorySupplier
            {
                CategoryId = dto.CategoryId,
                SupplierId = dto.SupplierId,
                SortOrder = dto.SortOrder,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow
            });

            var created = (await _categorySupplierRepository.GetByCategoryAsync(dto.CategoryId, activeOnly: false))
                .First(x => x.Id == entity.Id);
            return CreatedAtAction(nameof(GetByCategory), new { categoryId = dto.CategoryId }, ToDto(created));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CategorySupplierUpsertDto dto)
        {
            var entity = await _categorySupplierRepository.GetByIdAsync(id);
            if (entity == null) return NotFound(new { message = "Category supplier mapping not found" });

            await ValidateUpsert(dto);
            if (dto.IsActive && await _categorySupplierRepository.CountByCategoryAsync(dto.CategoryId, id) >= 2)
            {
                return BadRequest(new { message = "A category can have at most 2 suppliers" });
            }

            entity.CategoryId = dto.CategoryId;
            entity.SupplierId = dto.SupplierId;
            entity.SortOrder = dto.SortOrder;
            entity.IsActive = dto.IsActive;
            entity.UpdatedAt = DateTime.UtcNow;
            await _categorySupplierRepository.UpdateAsync(entity);

            var updated = (await _categorySupplierRepository.GetByCategoryAsync(dto.CategoryId, activeOnly: false))
                .First(x => x.Id == entity.Id);
            return Ok(ToDto(updated));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _categorySupplierRepository.GetByIdAsync(id);
            if (entity == null) return NotFound(new { message = "Category supplier mapping not found" });
            await _categorySupplierRepository.DeleteAsync(entity);
            return Ok(new { message = "Category supplier mapping deleted successfully" });
        }

        private async Task ValidateUpsert(CategorySupplierUpsertDto dto)
        {
            if (dto.CategoryId <= 0) throw new InvalidOperationException("Category is required");
            if (dto.SupplierId <= 0) throw new InvalidOperationException("Supplier is required");
            if (await _categoryRepository.GetByIdAsync(dto.CategoryId) == null) throw new InvalidOperationException("Category not found");
            var supplier = await _supplierRepository.GetByIdAsync(dto.SupplierId);
            if (supplier == null) throw new InvalidOperationException("Supplier not found");
            if (!supplier.IsActive) throw new InvalidOperationException("Supplier is inactive");
        }

        private static CategorySupplierDto ToDto(CategorySupplier item) => new()
        {
            Id = item.Id,
            CategoryId = item.CategoryId,
            CategoryName = item.Category?.Name,
            SupplierId = item.SupplierId,
            SupplierCode = item.Supplier?.SupplierCode,
            SupplierName = item.Supplier?.Name,
            SupplierType = item.Supplier?.SupplierType.ToString(),
            SortOrder = item.SortOrder,
            IsActive = item.IsActive
        };
    }
}
