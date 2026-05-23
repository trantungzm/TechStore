using BaseCore.Common;
using BaseCore.Entities;
using BaseCore.Repository.Authen;

namespace BaseCore.AuthService.Demo
{
    public class DemoUserRepository : IUserRepository
    {
        private readonly List<User> _users;

        public DemoUserRepository()
        {
            byte[] adminSalt;
            byte[] userSalt;

            _users =
            [
                new User
                {
                    Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                    UserName = "admin",
                    Password = TokenHelper.HashPassword("admin123", out adminSalt),
                    Salt = adminSalt,
                    Name = string.Empty,
                    Email = string.Empty,
                    Phone = "0123456789",
                    DateOfBirth = null,
                    Position = "Admin",
                    IsActive = true,
                    UserType = 1,
                    Created = DateTime.Now.AddDays(-10)
                },
                new User
                {
                    Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                    UserName = "user",
                    Password = TokenHelper.HashPassword("user123", out userSalt),
                    Salt = userSalt,
                    Name = "Demo User",
                    Email = "user@basecore.local",
                    Phone = "0987654321",
                    DateOfBirth = DateTime.Today.AddYears(-24),
                    Position = "Customer",
                    IsActive = true,
                    UserType = 0,
                    Created = DateTime.Now.AddDays(-5)
                }
            ];
        }

        public Task<User> GetByUsernameAsync(string username) =>
            Task.FromResult(_users.FirstOrDefault(u => u.UserName == username && u.IsActive));

        public Task<User> GetByIdAsync(Guid id) =>
            Task.FromResult(_users.FirstOrDefault(u => u.Id == id));

        public Task<List<User>> GetAllAsync() =>
            Task.FromResult(_users.Where(u => u.IsActive).ToList());

        public Task CreateAsync(User user)
        {
            if (user.Id == Guid.Empty)
            {
                user.Id = Guid.NewGuid();
            }

            user.Created = user.Created == default ? DateTime.Now : user.Created;
            user.IsActive = true;
            _users.Add(user);
            return Task.CompletedTask;
        }

        public Task UpdateAsync(User user)
        {
            var existing = _users.FirstOrDefault(x => x.Id == user.Id);
            if (existing != null)
            {
                existing.Name = user.Name;
                existing.Email = user.Email;
                existing.Phone = user.Phone;
                existing.DateOfBirth = user.DateOfBirth;
                existing.Position = user.Position;
                existing.UserType = user.UserType;
                existing.IsActive = user.IsActive;
                existing.Password = user.Password;
                existing.Salt = user.Salt;
            }

            return Task.CompletedTask;
        }

        public Task DeleteAsync(Guid id)
        {
            var existing = _users.FirstOrDefault(x => x.Id == id);
            if (existing != null)
            {
                _users.Remove(existing);
            }

            return Task.CompletedTask;
        }

        public Task<(List<User> Users, int TotalCount)> SearchAsync(string keyword, int page, int pageSize)
        {
            IEnumerable<User> query = _users.Where(u => u.IsActive);

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var lowered = keyword.ToLower();
                query = query.Where(u =>
                    (u.UserName ?? string.Empty).ToLower().Contains(lowered) ||
                    (u.Name ?? string.Empty).ToLower().Contains(lowered) ||
                    (u.Email ?? string.Empty).ToLower().Contains(lowered) ||
                    (u.Phone ?? string.Empty).ToLower().Contains(lowered));
            }

            var totalCount = query.Count();
            var users = query
                .OrderByDescending(u => u.Created)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return Task.FromResult((users, totalCount));
        }
    }
}
