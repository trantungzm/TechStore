using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BaseCore.APIService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UploadsController : ControllerBase
    {
        private const long MaxFileSize = 5 * 1024 * 1024;
        private readonly IWebHostEnvironment _environment;

        public UploadsController(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        [HttpPost("product-images")]
        [Authorize]
        [RequestSizeLimit(MaxFileSize * 10)]
        public async Task<IActionResult> UploadProductImages([FromForm] List<IFormFile> files)
        {
            if (files == null || files.Count == 0)
            {
                return BadRequest(new { message = "No files uploaded" });
            }

            var uploadRoot = Path.Combine(_environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot"), "uploads", "products");
            Directory.CreateDirectory(uploadRoot);

            var urls = new List<string>();
            foreach (var file in files)
            {
                if (file.Length <= 0) continue;
                if (file.Length > MaxFileSize) return BadRequest(new { message = "File size must be 5MB or less" });
                if (!file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(new { message = "Only image files are allowed" });
                }

                var extension = Path.GetExtension(file.FileName);
                var fileName = $"{Guid.NewGuid():N}{extension}";
                var fullPath = Path.Combine(uploadRoot, fileName);
                await using var stream = System.IO.File.Create(fullPath);
                await file.CopyToAsync(stream);
                urls.Add($"/uploads/products/{fileName}");
            }

            return Ok(new { url = urls.FirstOrDefault(), urls });
        }

        [HttpPost("ticket-attachments")]
        [AllowAnonymous]
        [RequestSizeLimit(10 * 1024 * 1024)]
        public async Task<IActionResult> UploadTicketAttachments([FromForm] List<IFormFile> files)
        {
            if (files == null || files.Count == 0)
            {
                return BadRequest(new { message = "No files uploaded" });
            }

            var uploadRoot = Path.Combine(_environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot"), "uploads", "tickets");
            Directory.CreateDirectory(uploadRoot);

            var urls = new List<string>();
            foreach (var file in files)
            {
                if (file.Length <= 0) continue;
                if (file.Length > 10 * 1024 * 1024) return BadRequest(new { message = "File size must be 10MB or less" });
                var isAllowed = file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase) ||
                                string.Equals(file.ContentType, "application/pdf", StringComparison.OrdinalIgnoreCase);
                if (!isAllowed) return BadRequest(new { message = "Only image or PDF files are allowed" });

                var extension = Path.GetExtension(file.FileName);
                var fileName = $"{Guid.NewGuid():N}{extension}";
                var fullPath = Path.Combine(uploadRoot, fileName);
                await using var stream = System.IO.File.Create(fullPath);
                await file.CopyToAsync(stream);
                urls.Add($"/uploads/tickets/{fileName}");
            }

            return Ok(new { url = urls.FirstOrDefault(), urls });
        }
    }
}
