using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BaseCore.DTO.Store;
using BaseCore.Services;

namespace BaseCore.APIService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoriesController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _categoryService.GetAllAsync();
            return Ok(categories.Select(StoreDtoMapper.ToCategoryDto));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var category = await _categoryService.GetByIdAsync(id);
            if (category == null)
            {
                return NotFound(new { message = "Category not found" });
            }

            return Ok(StoreDtoMapper.ToCategoryDto(category));
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CategoryUpsertDto dto)
        {
            var existing = await _categoryService.GetByNameAsync(dto.Name);
            if (existing != null)
            {
                return BadRequest(new { message = "Category name already exists" });
            }

            var category = await _categoryService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = category.Id }, StoreDtoMapper.ToCategoryDto(category));
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] CategoryUpsertDto dto)
        {
            var category = await _categoryService.UpdateAsync(id, dto);
            if (category == null)
            {
                return NotFound(new { message = "Category not found" });
            }

            return Ok(StoreDtoMapper.ToCategoryDto(category));
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _categoryService.DeleteAsync(id);
            if (!deleted)
            {
                return NotFound(new { message = "Category not found" });
            }

            return Ok(new { message = "Category deleted successfully" });
        }
    }
}
