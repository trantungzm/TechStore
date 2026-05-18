using BaseCore.DTO.Store;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaseCore.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepositoryEF _categoryRepository;

        public CategoryService(ICategoryRepositoryEF categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        public async Task<List<Category>> GetAllAsync()
        {
            var categories = await _categoryRepository.GetAllAsync();
            return categories.ToList();
        }

        public async Task<Category?> GetByIdAsync(int id)
        {
            return await _categoryRepository.GetByIdAsync(id);
        }

        public Task<Category> CreateAsync(CategoryUpsertDto dto)
        {
            var category = new Category
            {
                Name = dto.Name,
                Description = dto.Description ?? string.Empty
            };
            return _categoryRepository.AddAsync(category);
        }

        public async Task<Category?> UpdateAsync(int id, CategoryUpsertDto dto)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
            {
                return null;
            }

            category.Name = dto.Name ?? category.Name;
            category.Description = dto.Description ?? category.Description;
            await _categoryRepository.UpdateAsync(category);
            return category;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
            {
                return false;
            }

            await _categoryRepository.DeleteAsync(category);
            return true;
        }

        public Task<Category?> GetByNameAsync(string name) => _categoryRepository.GetByNameAsync(name);
    }
}
