using Microsoft.EntityFrameworkCore;
using BaseCore.Entities;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace BaseCore.Repository.Authen
{
    public interface IUserRepository
    {
        Task<User> GetByUsernameAsync(string username);
        Task<User> GetByIdAsync(Guid id);
        Task<List<User>> GetAllAsync();
        Task CreateAsync(User user);
        Task UpdateAsync(User user);
        Task DeleteAsync(Guid id);
        Task<(List<User> Users, int TotalCount)> SearchAsync(string keyword, int page, int pageSize);
    }

    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<User> GetByUsernameAsync(string username)
        {
            var connection = _context.Database.GetDbConnection();
            var shouldClose = connection.State != ConnectionState.Open;

            if (shouldClose)
            {
                await connection.OpenAsync();
            }

            try
            {
                await using var command = connection.CreateCommand();
                command.CommandText = @"
                    SELECT TOP(1) *
                    FROM [Users]
                    WHERE IsActive = 1
                      AND (UserName = @value OR Email = @value OR Phone = @value)";

                var parameter = command.CreateParameter();
                parameter.ParameterName = "@value";
                parameter.Value = username;
                command.Parameters.Add(parameter);

                await using var reader = await command.ExecuteReaderAsync();
                if (!await reader.ReadAsync())
                {
                    return null;
                }

                return MapUser(reader);
            }
            finally
            {
                if (shouldClose)
                {
                    await connection.CloseAsync();
                }
            }
        }

        public async Task<User> GetByIdAsync(Guid id)
        {
            return await GetSingleUserBySqlAsync("Id = @value", id.ToString());
        }

        private async Task<User> GetSingleUserBySqlAsync(string whereClause, string value)
        {
            var connection = _context.Database.GetDbConnection();
            var shouldClose = connection.State != ConnectionState.Open;

            if (shouldClose)
            {
                await connection.OpenAsync();
            }

            try
            {
                await using var command = connection.CreateCommand();
                command.CommandText = $"SELECT TOP(1) * FROM [Users] WHERE {whereClause}";

                var parameter = command.CreateParameter();
                parameter.ParameterName = "@value";
                parameter.Value = value;
                command.Parameters.Add(parameter);

                await using var reader = await command.ExecuteReaderAsync();
                if (!await reader.ReadAsync())
                {
                    return null;
                }

                return MapUser(reader);
            }
            finally
            {
                if (shouldClose)
                {
                    await connection.CloseAsync();
                }
            }
        }

        private static User MapUser(IDataRecord record)
        {
            return new User
            {
                Id = ReadGuid(record, "Id"),
                UserName = ReadString(record, "UserName") ?? string.Empty,
                Password = ReadString(record, "Password") ?? string.Empty,
                Salt = ReadBytes(record, "Salt"),
                Name = ReadString(record, "Name"),
                Contact = ReadString(record, "Contact"),
                Email = ReadString(record, "Email"),
                Phone = ReadString(record, "Phone"),
                DateOfBirth = ReadDateTime(record, "DateOfBirth"),
                Position = ReadString(record, "Position"),
                Image = ReadString(record, "Image"),
                IsActive = ReadBool(record, "IsActive"),
                UserType = ReadInt(record, "UserType"),
                Created = ReadDateTime(record, "Created") ?? DateTime.Now,
            };
        }

        private static int GetOrdinalOrDefault(IDataRecord record, string name)
        {
            for (var i = 0; i < record.FieldCount; i++)
            {
                if (string.Equals(record.GetName(i), name, StringComparison.OrdinalIgnoreCase))
                {
                    return i;
                }
            }

            return -1;
        }

        private static object ReadValue(IDataRecord record, string name)
        {
            var ordinal = GetOrdinalOrDefault(record, name);
            return ordinal < 0 || record.IsDBNull(ordinal) ? null : record.GetValue(ordinal);
        }

        private static string ReadString(IDataRecord record, string name) => ReadValue(record, name)?.ToString();

        private static byte[] ReadBytes(IDataRecord record, string name)
        {
            var value = ReadValue(record, name);
            if (value is byte[] bytes) return bytes;
            if (value is string text && !string.IsNullOrWhiteSpace(text))
            {
                try
                {
                    return Convert.FromBase64String(text);
                }
                catch
                {
                    return Encoding.UTF8.GetBytes(text);
                }
            }

            return null;
        }

        private static Guid ReadGuid(IDataRecord record, string name)
        {
            var value = ReadValue(record, name);
            if (value is Guid guid) return guid;
            var text = value?.ToString();
            if (Guid.TryParse(text, out var parsed)) return parsed;

            using var md5 = MD5.Create();
            return new Guid(md5.ComputeHash(Encoding.UTF8.GetBytes(text ?? string.Empty)));
        }

        private static bool ReadBool(IDataRecord record, string name)
        {
            var value = ReadValue(record, name);
            if (value is bool boolean) return boolean;
            if (value is int integer) return integer != 0;
            if (bool.TryParse(value?.ToString(), out var parsed)) return parsed;
            return false;
        }

        private static int ReadInt(IDataRecord record, string name)
        {
            var value = ReadValue(record, name);
            return int.TryParse(value?.ToString(), out var parsed) ? parsed : 0;
        }

        private static DateTime? ReadDateTime(IDataRecord record, string name)
        {
            var value = ReadValue(record, name);
            if (value is DateTime dateTime) return dateTime;
            return DateTime.TryParse(value?.ToString(), out var parsed) ? parsed : null;
        }

        public async Task<List<User>> GetAllAsync()
        {
            var (users, _) = await SearchAsync(string.Empty, 1, int.MaxValue);
            return users;
        }

        public async Task CreateAsync(User user)
        {
            user.Id = Guid.NewGuid();
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user != null)
            {
                user.IsActive = false;
                _context.Users.Update(user);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<(List<User> Users, int TotalCount)> SearchAsync(string keyword, int page, int pageSize)
        {
            page = page <= 0 ? 1 : page;
            pageSize = pageSize <= 0 ? 10 : pageSize;
            var offset = (page - 1) * pageSize;
            var hasKeyword = !string.IsNullOrWhiteSpace(keyword);
            var keywordValue = $"%{keyword?.Trim().ToLowerInvariant()}%";

            var connection = _context.Database.GetDbConnection();
            var shouldClose = connection.State != ConnectionState.Open;

            if (shouldClose)
            {
                await connection.OpenAsync();
            }

            try
            {
                var whereClause = hasKeyword
                    ? @"IsActive = 1 AND (
                        LOWER(COALESCE(UserName, '')) LIKE @keyword OR
                        LOWER(COALESCE(Name, '')) LIKE @keyword OR
                        LOWER(COALESCE(Email, '')) LIKE @keyword OR
                        LOWER(COALESCE(Phone, '')) LIKE @keyword)"
                    : "IsActive = 1";

                await using var countCommand = connection.CreateCommand();
                countCommand.CommandText = $"SELECT COUNT(1) FROM [Users] WHERE {whereClause}";
                if (hasKeyword)
                {
                    var countKeyword = countCommand.CreateParameter();
                    countKeyword.ParameterName = "@keyword";
                    countKeyword.Value = keywordValue;
                    countCommand.Parameters.Add(countKeyword);
                }

                var totalCount = Convert.ToInt32(await countCommand.ExecuteScalarAsync());

                await using var command = connection.CreateCommand();
                command.CommandText = $@"
                    SELECT *
                    FROM [Users]
                    WHERE {whereClause}
                    ORDER BY Created DESC
                    OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY";

                if (hasKeyword)
                {
                    var searchKeyword = command.CreateParameter();
                    searchKeyword.ParameterName = "@keyword";
                    searchKeyword.Value = keywordValue;
                    command.Parameters.Add(searchKeyword);
                }

                var offsetParameter = command.CreateParameter();
                offsetParameter.ParameterName = "@offset";
                offsetParameter.Value = offset;
                command.Parameters.Add(offsetParameter);

                var pageSizeParameter = command.CreateParameter();
                pageSizeParameter.ParameterName = "@pageSize";
                pageSizeParameter.Value = pageSize;
                command.Parameters.Add(pageSizeParameter);

                var users = new List<User>();
                await using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    users.Add(MapUser(reader));
                }

                return (users, totalCount);
            }
            finally
            {
                if (shouldClose)
                {
                    await connection.CloseAsync();
                }
            }
        }
    }
}
