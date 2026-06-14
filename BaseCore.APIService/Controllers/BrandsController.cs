using BaseCore.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BaseCore.APIService.Controllers
{
    [Route("api/brands")]
    [ApiController]
    public class BrandsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public BrandsController(AppDbContext db)
        {
            _db = db;
        }

        /// <summary>
        /// Danh sách hãng đang hoạt động, lọc theo danh mục (dùng cho dropdown ở form sản phẩm).
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> Get([FromQuery] int? categoryId)
        {
            var query = _db.Brands.AsNoTracking().Where(b => b.IsActive);
            if (categoryId.HasValue && categoryId.Value > 0)
            {
                query = query.Where(b => b.CategoryId == categoryId.Value);
            }

            var brands = await query
                .OrderBy(b => b.Name)
                .Select(b => new BrandDto { Id = b.Id, Name = b.Name, CategoryId = b.CategoryId })
                .ToListAsync();

            return Ok(brands);
        }
    }

    public class BrandDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public int CategoryId { get; set; }
    }
}
