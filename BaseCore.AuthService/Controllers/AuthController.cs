using Microsoft.AspNetCore.Mvc;
using BaseCore.Common;
using BaseCore.Repository;
using BaseCore.Services.Authen;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace BaseCore.AuthService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IConfiguration _configuration;
        private readonly IServiceProvider _serviceProvider;
        private const int TokenExpirationMinutes = 480; // 8 hours

        public AuthController(IUserService userService, IConfiguration configuration, IServiceProvider serviceProvider)
        {
            _userService = userService;
            _configuration = configuration;
            _serviceProvider = serviceProvider;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { message = "Username and password are required" });
            }

            var user = await _userService.Authenticate(request.Username, request.Password);

            if (user == null)
            {
                return Unauthorized(new { message = "Invalid username or password" });
            }

            // Generate JWT token
            var secretKey = _configuration["Jwt:SecretKey"] ?? _configuration["AppSettings:Secret"] ?? "CHANGE_ME_TO_A_LONG_RANDOM_SECRET";
            var issuer = _configuration["Jwt:Issuer"] ?? "BaseCore";
            var audience = _configuration["Jwt:Audience"] ?? "BaseCore.WebClient";
            var roleName = await ResolveRoleName(user.UserType);
            var token = TokenHelper.GenerateToken(
                secretKey,
                TokenExpirationMinutes,
                user.Id.ToString(),
                user.UserName,
                roleName,
                issuer,
                audience
            );

            return Ok(new LoginResponse
            {
                Token = token,
                UserId = user.Id.ToString(),
                Username = user.UserName,
                Name = user.Name,
                Email = user.Email,
                Role = roleName,
                ExpiresIn = TokenExpirationMinutes * 60,
                User = new LoginUserDto
                {
                    Id = user.Id.ToString(),
                    UserName = user.UserName,
                    Email = user.Email,
                    PhoneNumber = user.Phone,
                    DateOfBirth = user.DateOfBirth,
                    Role = roleName,
                    IsActive = user.IsActive,
                    CreatedAt = user.Created
                }
            });
        }

        private async Task<string> ResolveRoleName(int userType)
        {
            var db = _serviceProvider.GetService<AppDbContext>();
            if (db == null)
            {
                return userType == 1 ? "Admin" : "User";
            }

            var roleName = await db.Roles
                .Where(r => r.IsActive && !r.IsDeleted && r.RoleType == userType)
                .Select(r => r.Name)
                .FirstOrDefaultAsync();

            return roleName ?? (userType == 1 ? "Admin" : "User");
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (request == null)
            {
                return BadRequest(new { message = "Invalid request" });
            }

            if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { message = "Username and password are required" });
            }

            if (request.Password.Length < 6)
            {
                return BadRequest(new { message = "Password must be at least 6 characters" });
            }

            try
            {
                var user = new BaseCore.Entities.User
                {
                    UserName = request.Username,
                    Name = request.Name ?? request.Username,
                    Email = request.Email,
                    Phone = request.Phone,
                    DateOfBirth = request.DateOfBirth?.Date,
                    UserType = 0 // Default to regular user
                };

                var createdUser = await _userService.Create(user, request.Password);

                return Ok(new { message = "Registration successful", userId = createdUser.Id });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = "Registration failed: " + ex.Message });
            }
        }
    }

    public class LoginRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    public class LoginResponse
    {
        public string Token { get; set; }
        public string UserId { get; set; }
        public string Username { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public int ExpiresIn { get; set; }
        public LoginUserDto User { get; set; }
    }

    public class LoginUserDto
    {
        public string Id { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Role { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class RegisterRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public DateTime? DateOfBirth { get; set; }
    }
}
