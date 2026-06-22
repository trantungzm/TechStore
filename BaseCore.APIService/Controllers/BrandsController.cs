using BaseCore.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BaseCore.APIService.Controllers
{
    [Route("api/brands")]
    [ApiController]
    public class BrandsController : ControllerBase
    {
        private readonly IBrandService _brandService;

        public BrandsController(IBrandService brandService)
        {
            _brandService = brandService;
        }

        /// <summary>
        /// Danh sách hãng đang hoạt động, lọc theo danh mục (dùng cho dropdown ở form sản phẩm).
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> Get([FromQuery] int? categoryId)
            => Ok(await _brandService.GetActiveBrandsAsync(categoryId));
    }
}
