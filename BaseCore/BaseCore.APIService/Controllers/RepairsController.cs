using BaseCore.DTO.Support;
using BaseCore.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BaseCore.APIService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin,Warranty,Technical,CustomerService")]
    public class RepairsController : ControllerBase
    {
        private readonly IRepairService _service;
        public RepairsController(IRepairService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] SupportSearchDto search)
        {
            var result = await _service.GetRepairsAsync(search);
            return Ok(Paged(result.Items, result.TotalCount, search.Page, search.PageSize));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _service.GetRepairAsync(id);
            return item == null ? NotFound(new { message = "Repair khong ton tai." }) : Ok(item);
        }

        [HttpPost("intake")]
        public async Task<IActionResult> Intake([FromBody] CreateRepairIntakeDto dto)
        {
            var item = await _service.IntakeAsync(dto, CurrentUserId());
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateRepairCaseDto dto)
        {
            var item = await _service.UpdateAsync(id, dto);
            return item == null ? NotFound(new { message = "Repair khong ton tai." }) : Ok(item);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> Status(int id, [FromBody] UpdateRepairStatusDto dto)
        {
            var item = await _service.UpdateStatusAsync(id, dto, CurrentUserId());
            return item == null ? NotFound(new { message = "Repair khong ton tai." }) : Ok(item);
        }

        [HttpGet("{id}/updates")]
        public async Task<IActionResult> Updates(int id) => Ok(await _service.GetUpdatesAsync(id));

        private Guid? CurrentUserId()
        {
            var raw = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
            return Guid.TryParse(raw, out var value) ? value : null;
        }
        private static object Paged<T>(List<T> items, int totalCount, int page, int pageSize)
        {
            var size = Math.Clamp(pageSize, 1, 100);
            return new { items, totalCount, page = Math.Max(1, page), pageSize = size, totalPages = (int)Math.Ceiling(totalCount / (double)size) };
        }
    }
}
