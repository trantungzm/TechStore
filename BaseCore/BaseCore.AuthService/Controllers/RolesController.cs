using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BaseCore.Entities;
using BaseCore.Repository;

namespace BaseCore.AuthService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class RolesController : ControllerBase
    {
        private static readonly HashSet<string> ProtectedRoleNames = new(StringComparer.OrdinalIgnoreCase)
        {
            "Admin",
            "User",
            "Warehouse",
            "Technical"
        };

        private readonly AppDbContext _db;

        public RolesController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var roles = await QueryRoles()
                .OrderByDescending(r => r.RoleType == 1)
                .ThenBy(r => r.RoleType == 0 ? 1 : 0)
                .ThenBy(r => r.Name)
                .ToListAsync();

            var userCounts = await _db.Users
                .GroupBy(u => u.UserType)
                .Select(g => new { UserType = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.UserType, x => x.Count);

            return Ok(roles.Select(r => ToDto(r, userCounts.GetValueOrDefault(r.RoleType))));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var role = await QueryRoles().FirstOrDefaultAsync(r => r.Id == id);
            if (role == null)
            {
                return NotFound(new { message = "Role not found" });
            }

            var userCount = await _db.Users.CountAsync(u => u.UserType == role.RoleType);
            return Ok(ToDto(role, userCount));
        }

        [HttpGet("by-usertype/{userType:int}")]
        public async Task<IActionResult> GetByUserType(int userType)
        {
            var role = await QueryRoles().FirstOrDefaultAsync(r => r.RoleType == userType);
            if (role == null)
            {
                return NotFound(new { message = "Role not found for this UserType" });
            }

            var userCount = await _db.Users.CountAsync(u => u.UserType == role.RoleType);
            return Ok(ToDto(role, userCount));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] RoleRequest request)
        {
            return BadRequest(new { message = "He thong chi su dung 4 vai tro co dinh: Admin, User, Warehouse, Technical." });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] RoleRequest request)
        {
            var validation = ValidateRequest(request);
            if (validation != null)
            {
                return validation;
            }

            var role = await QueryRoles().FirstOrDefaultAsync(r => r.Id == id);
            if (role == null)
            {
                return NotFound(new { message = "Role not found" });
            }

            var name = request.Name.Trim();
            if (ProtectedRoleNames.Contains(role.Name) && !string.Equals(role.Name, name, StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Vai tro he thong co dinh khong duoc doi ten." });
            }

            var duplicate = await QueryRoles().AnyAsync(r => r.Id != id && r.Name == name);
            if (duplicate)
            {
                return Conflict(new { message = "Role name already exists" });
            }

            role.Name = name;
            role.Description = request.Description?.Trim() ?? string.Empty;
            role.ModifiedBy = User.Identity?.Name ?? "system";
            role.Modified = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            var userCount = await _db.Users.CountAsync(u => u.UserType == role.RoleType);
            return Ok(ToDto(role, userCount));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var role = await QueryRoles().FirstOrDefaultAsync(r => r.Id == id);
            if (role == null)
            {
                return NotFound(new { message = "Role not found" });
            }

            if (ProtectedRoleNames.Contains(role.Name))
            {
                return BadRequest(new { message = "4 vai tro he thong khong duoc xoa." });
            }

            var userCount = await _db.Users.CountAsync(u => u.UserType == role.RoleType);
            if (userCount > 0)
            {
                return BadRequest(new { message = "Cannot delete role because users are assigned to it" });
            }

            role.IsDeleted = true;
            role.IsActive = false;
            role.ModifiedBy = User.Identity?.Name ?? "system";
            role.Modified = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("{id}/permissions")]
        public async Task<IActionResult> GetPermissions(string id)
        {
            var role = await QueryRoles().FirstOrDefaultAsync(r => r.Id == id);
            if (role == null)
            {
                return NotFound(new { message = "Role not found" });
            }

            var permissions = string.Equals(role.Name, "Admin", StringComparison.OrdinalIgnoreCase)
                ? new[] { "users.read", "users.write", "users.delete", "products.read", "products.write", "products.delete", "orders.read", "orders.write", "categories.read", "categories.write", "categories.delete", "roles.read", "roles.write" }
                : new[] { "products.read", "orders.read", "categories.read" };

            return Ok(new { role = role.Name, permissions });
        }

        private IQueryable<Role> QueryRoles()
        {
            return _db.Roles.Where(r => r.IsActive && !r.IsDeleted);
        }

        private static IActionResult? ValidateRequest(RoleRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Name))
            {
                return new BadRequestObjectResult(new { message = "Role name is required" });
            }

            return null;
        }

        private static RoleDto ToDto(Role role, int userCount)
        {
            return new RoleDto
            {
                Id = role.Id,
                Name = role.Name,
                Description = role.Description,
                UserType = role.RoleType,
                UserCount = userCount,
                IsSystem = ProtectedRoleNames.Contains(role.Name),
                IsActive = role.IsActive
            };
        }
    }

    public class RoleRequest
    {
        public string Name { get; set; } = "";
        public string? Description { get; set; }
        public int? UserType { get; set; }
    }

    public class RoleDto
    {
        public string Id { get; set; } = "";
        public string Name { get; set; } = "";
        public string? Description { get; set; }
        public int UserType { get; set; }
        public int UserCount { get; set; }
        public bool IsSystem { get; set; }
        public bool IsActive { get; set; }
    }
}
