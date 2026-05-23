using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BaseCore.Entities;
using BaseCore.Repository;
using BaseCore.Services.Authen;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaseCore.AuthService.Controllers
{
    [Route("api/users")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly AppDbContext _db;

        public UserController(IUserService userService, AppDbContext db)
        {
            _userService = userService;
            _db = db;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll([FromQuery] string keyword = "", [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var (users, totalCount) = await _userService.Search(keyword, page, pageSize);
            var roleNames = await GetRoleNamesAsync();

            var result = users.Select(u => new UserResponse
            {
                Id = u.Id.ToString(),
                Username = u.UserName,
                Name = u.Name,
                Email = u.Email,
                PhoneNumber = u.Phone,
                DateOfBirth = u.DateOfBirth,
                Position = u.Position,
                Role = ResolveRoleName(u.UserType, roleNames),
                UserType = u.UserType,
                IsActive = u.IsActive,
                CreatedAt = u.Created
            });

            return Ok(new
            {
                data = result,
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            if (!Guid.TryParse(id, out var guidId))
            {
                return BadRequest(new { message = "Invalid user ID format" });
            }

            var user = await _userService.GetById(guidId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var roleNames = await GetRoleNamesAsync();
            return Ok(new UserResponse
            {
                Id = user.Id.ToString(),
                Username = user.UserName,
                Name = user.Name,
                Email = user.Email,
                PhoneNumber = user.Phone,
                DateOfBirth = user.DateOfBirth,
                Position = user.Position,
                Role = ResolveRoleName(user.UserType, roleNames),
                UserType = user.UserType,
                IsActive = user.IsActive,
                CreatedAt = user.Created
            });
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
        {
            if (request == null)
            {
                return BadRequest(new { message = "Invalid request" });
            }

            if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { message = "Username and password are required" });
            }

            if (request.UserType == 1 && await ActiveAdminExistsAsync())
            {
                return BadRequest(new { message = "He thong chi cho phep 1 tai khoan admin." });
            }

            try
            {
                var user = new User
                {
                    UserName = request.Username,
                    Name = request.UserType == 1 ? string.Empty : request.Name,
                    Email = request.UserType == 1 ? string.Empty : request.Email,
                    Phone = request.Phone,
                    DateOfBirth = request.UserType == 1 ? null : request.DateOfBirth?.Date,
                    Position = request.Position,
                    UserType = request.UserType
                };

                var createdUser = await _userService.Create(user, request.Password);
                var roleNames = await GetRoleNamesAsync();

                return CreatedAtAction(nameof(GetById), new { id = createdUser.Id.ToString() }, new UserResponse
                {
                    Id = createdUser.Id.ToString(),
                    Username = createdUser.UserName,
                    Name = createdUser.Name,
                    Email = createdUser.Email,
                    PhoneNumber = createdUser.Phone,
                    DateOfBirth = createdUser.DateOfBirth,
                    Position = createdUser.Position,
                    Role = ResolveRoleName(createdUser.UserType, roleNames),
                    UserType = createdUser.UserType,
                    IsActive = createdUser.IsActive,
                    CreatedAt = createdUser.Created
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to create user: " + ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(string id, [FromBody] UpdateUserRequest request)
        {
            if (request == null)
            {
                return BadRequest(new { message = "Invalid request" });
            }

            if (!Guid.TryParse(id, out var guidId))
            {
                return BadRequest(new { message = "Invalid user ID format" });
            }

            var existingUser = await _userService.GetById(guidId);
            if (existingUser == null)
            {
                return NotFound(new { message = "User not found" });
            }

            if (existingUser.UserType == 1)
            {
                if (request.UserType.HasValue && request.UserType.Value != 1)
                {
                    return BadRequest(new { message = "Khong the doi vai tro cua admin duy nhat." });
                }

                if (request.IsActive.HasValue && !request.IsActive.Value)
                {
                    return BadRequest(new { message = "Khong the khoa admin duy nhat." });
                }
            }

            if (request.UserType == 1 && existingUser.UserType != 1 && await ActiveAdminExistsAsync())
            {
                return BadRequest(new { message = "He thong chi cho phep 1 tai khoan admin." });
            }

            if (existingUser.UserType != 1)
            {
                existingUser.Name = request.Name ?? existingUser.Name;
                existingUser.Email = request.Email ?? existingUser.Email;
                existingUser.DateOfBirth = request.DateOfBirth ?? existingUser.DateOfBirth;
            }

            existingUser.Phone = request.Phone ?? existingUser.Phone;
            existingUser.Position = request.Position ?? existingUser.Position;
            existingUser.UserType = request.UserType ?? existingUser.UserType;
            existingUser.IsActive = request.IsActive ?? existingUser.IsActive;

            await _userService.Update(existingUser, request.Password);
            var roleNames = await GetRoleNamesAsync();

            return Ok(new UserResponse
            {
                Id = existingUser.Id.ToString(),
                Username = existingUser.UserName,
                Name = existingUser.Name,
                Email = existingUser.Email,
                PhoneNumber = existingUser.Phone,
                DateOfBirth = existingUser.DateOfBirth,
                Position = existingUser.Position,
                Role = ResolveRoleName(existingUser.UserType, roleNames),
                UserType = existingUser.UserType,
                IsActive = existingUser.IsActive,
                CreatedAt = existingUser.Created
            });
        }

        [HttpPut("{id}/role")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateRole(string id, [FromBody] UpdateUserRoleRequest request)
        {
            if (request == null)
            {
                return BadRequest(new { message = "Invalid request" });
            }

            if (!Guid.TryParse(id, out var guidId))
            {
                return BadRequest(new { message = "Invalid user ID format" });
            }

            var role = await ResolveRoleAsync(request);
            if (role == null)
            {
                return BadRequest(new { message = "Role not found" });
            }

            var existingUser = await _userService.GetById(guidId);
            if (existingUser == null)
            {
                return NotFound(new { message = "User not found" });
            }

            if (existingUser.UserType == 1 && role.RoleType != 1)
            {
                return BadRequest(new { message = "Khong the doi vai tro cua admin duy nhat." });
            }

            if (role.RoleType == 1 && existingUser.UserType != 1 && await ActiveAdminExistsAsync())
            {
                return BadRequest(new { message = "He thong chi cho phep 1 tai khoan admin." });
            }

            existingUser.UserType = role.RoleType;
            await _userService.Update(existingUser);

            return Ok(new UserResponse
            {
                Id = existingUser.Id.ToString(),
                Username = existingUser.UserName,
                Name = existingUser.Name,
                Email = existingUser.Email,
                PhoneNumber = existingUser.Phone,
                DateOfBirth = existingUser.DateOfBirth,
                Position = existingUser.Position,
                Role = role.Name,
                UserType = existingUser.UserType,
                IsActive = existingUser.IsActive,
                CreatedAt = existingUser.Created
            });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(string id)
        {
            if (!Guid.TryParse(id, out var guidId))
            {
                return BadRequest(new { message = "Invalid user ID format" });
            }

            var existingUser = await _userService.GetById(guidId);
            if (existingUser == null)
            {
                return NotFound(new { message = "User not found" });
            }

            if (existingUser.UserType == 1)
            {
                return BadRequest(new { message = "Khong the xoa admin duy nhat." });
            }

            await _userService.Delete(guidId);
            return NoContent();
        }

        private async Task<bool> ActiveAdminExistsAsync()
        {
            return await _db.Users.AnyAsync(u => u.IsActive && u.UserType == 1);
        }

        private async Task<Dictionary<int, string>> GetRoleNamesAsync()
        {
            return await _db.Roles
                .Where(r => r.IsActive && !r.IsDeleted)
                .ToDictionaryAsync(r => r.RoleType, r => r.Name);
        }

        private static string ResolveRoleName(int userType, IReadOnlyDictionary<int, string> roleNames)
        {
            return roleNames.TryGetValue(userType, out var roleName) ? roleName : (userType == 1 ? "Admin" : "User");
        }

        private async Task<Role?> ResolveRoleAsync(UpdateUserRoleRequest request)
        {
            var query = _db.Roles.Where(r => r.IsActive && !r.IsDeleted);

            if (!string.IsNullOrWhiteSpace(request.RoleId))
            {
                var roleId = request.RoleId.Trim();
                return await query.FirstOrDefaultAsync(r => r.Id == roleId);
            }

            if (!string.IsNullOrWhiteSpace(request.Role))
            {
                var roleName = request.Role.Trim();
                return await query.FirstOrDefaultAsync(r => r.Name == roleName);
            }

            if (request.UserType.HasValue)
            {
                return await query.FirstOrDefaultAsync(r => r.RoleType == request.UserType.Value);
            }

            return null;
        }
    }

    public class UserResponse
    {
        public string Id { get; set; }
        public string Username { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string PhoneNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Position { get; set; }
        public string Role { get; set; }
        public int UserType { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateUserRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string Phone { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Position { get; set; }
        public int UserType { get; set; }
    }

    public class UpdateUserRequest
    {
        public string Password { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string Phone { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Position { get; set; }
        public int? UserType { get; set; }
        public bool? IsActive { get; set; }
    }

    public class UpdateUserRoleRequest
    {
        public string? RoleId { get; set; }
        public string? Role { get; set; }
        public int? UserType { get; set; }
    }
}
