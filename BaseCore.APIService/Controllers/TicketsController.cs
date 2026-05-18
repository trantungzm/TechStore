using BaseCore.DTO.Support;
using BaseCore.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BaseCore.APIService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TicketsController : ControllerBase
    {
        private readonly ITicketService _service;
        public TicketsController(ITicketService service) => _service = service;

        [HttpGet("my")]
        [Authorize]
        public async Task<IActionResult> My()
        {
            var userId = CurrentUserId();
            return userId.HasValue ? Ok(await _service.GetMyAsync(userId.Value)) : Unauthorized();
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> All([FromQuery] SupportSearchDto search)
        {
            var result = await _service.GetAllAsync(search);
            return Ok(Paged(result.Items, result.TotalCount, search.Page, search.PageSize));
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> Get(int id)
        {
            var item = await _service.GetAsync(id);
            return item == null ? NotFound(new { message = "Ticket khong ton tai." }) : Ok(item);
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromBody] CreateSupportTicketDto dto)
        {
            var item = await _service.CreateAsync(dto, CurrentUserId());
            return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
        }

        [HttpPost("{id}/updates")]
        [Authorize]
        public async Task<IActionResult> AddUpdate(int id, [FromBody] CreateTicketUpdateDto dto)
        {
            return Ok(await _service.AddUpdateAsync(id, dto, CurrentUserId(), User.IsInRole("Admin")));
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Status(int id, [FromBody] UpdateTicketStatusDto dto)
        {
            var item = await _service.UpdateStatusAsync(id, dto, CurrentUserId());
            return item == null ? NotFound(new { message = "Ticket khong ton tai." }) : Ok(item);
        }

        [HttpPut("{id}/assign")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Assign(int id, [FromBody] AssignTicketDto dto)
        {
            var item = await _service.AssignAsync(id, dto, CurrentUserId());
            return item == null ? NotFound(new { message = "Ticket khong ton tai." }) : Ok(item);
        }

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
