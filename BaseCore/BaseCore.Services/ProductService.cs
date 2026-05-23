using BaseCore.DTO.Store;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaseCore.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepositoryEF _productRepository;
        private readonly ICategoryRepositoryEF _categoryRepository;
        private readonly ISupplierRepositoryEF _supplierRepository;

        public ProductService(IProductRepositoryEF productRepository, ICategoryRepositoryEF categoryRepository, ISupplierRepositoryEF supplierRepository)
        {
            _productRepository = productRepository;
            _categoryRepository = categoryRepository;
            _supplierRepository = supplierRepository;
        }

        public async Task<List<Product>> GetAllProductsAsync()
        {
            var products = await _productRepository.GetAllAsync();
            var list = products.ToList();
            foreach (var product in list)
            {
                product.Category = await _categoryRepository.GetByIdAsync(product.CategoryId);
                await AttachSuppliersAsync(product);
            }
            return list;
        }

        public async Task<Product?> GetProductByIdAsync(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);

            if (product != null)
            {
                product.Category = await _categoryRepository.GetByIdAsync(product.CategoryId);
                await AttachSuppliersAsync(product);
            }

            return product;
        }

        public async Task<Product> CreateAsync(ProductCreateDto dto)
        {
            var category = await _categoryRepository.GetByIdAsync(dto.CategoryId);
            if (category == null)
            {
                throw new InvalidOperationException("Category not found");
            }

            var product = new Product
            {
                Name = dto.Name,
                Price = dto.Price,
                OriginalPrice = dto.OriginalPrice,
                Stock = dto.Stock,
                CategoryId = dto.CategoryId,
                Slug = string.IsNullOrWhiteSpace(dto.Slug) ? ToSlug(dto.Name) : dto.Slug,
                Sku = dto.Sku,
                Brand = dto.Brand,
                SupplierId = await ResolveSupplierIdAsync(dto.SupplierId),
                BackupSupplierId = await ResolveSupplierIdAsync(dto.BackupSupplierId),
                SupplyType = dto.SupplyType,
                WarrantyProvider = dto.WarrantyProvider,
                Description = dto.Description,
                LongDescription = dto.LongDescription,
                ImageUrl = dto.ImageUrl ?? string.Empty,
                IsActive = dto.IsActive,
                IsFeatured = dto.IsFeatured,
                IsBestSeller = dto.IsBestSeller,
                IsNewArrival = dto.IsNewArrival,
                IsDiscounted = dto.IsDiscounted,
                RequiresSerialTracking = dto.RequiresSerialTracking,
                WarrantyMonths = dto.WarrantyMonths <= 0 ? 12 : dto.WarrantyMonths,
                CreatedAt = DateTime.UtcNow,
                Category = category
            };

            EnsureSupplierPair(product.SupplierId, product.BackupSupplierId);

            product.Images = dto.Images.Select((image, index) => new ProductImage
            {
                ImageUrl = image.ImageUrl,
                AltText = image.AltText,
                SortOrder = image.SortOrder == 0 ? index : image.SortOrder,
                IsPrimary = image.IsPrimary
            }).ToList();

            product.Variants = dto.Variants.Select(variant => new ProductVariant
            {
                VariantName = variant.VariantName,
                ColorName = variant.ColorName,
                ColorCode = variant.ColorCode,
                Storage = variant.Storage,
                Ram = variant.Ram,
                Price = variant.Price,
                OriginalPrice = variant.OriginalPrice,
                Stock = variant.Stock,
                Sku = variant.Sku,
                ImageUrl = variant.ImageUrl,
                IsActive = variant.IsActive,
                CreatedAt = DateTime.UtcNow
            }).ToList();

            return await _productRepository.AddAsync(product);
        }

        public async Task<Product?> UpdateAsync(int id, ProductUpdateDto dto)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
            {
                return null;
            }

            if (dto.CategoryId.HasValue)
            {
                var category = await _categoryRepository.GetByIdAsync(dto.CategoryId.Value);
                if (category == null)
                {
                    throw new InvalidOperationException("Category not found");
                }
                product.CategoryId = dto.CategoryId.Value;
                product.Category = category;
            }

            product.Name = dto.Name ?? product.Name;
            product.Slug = dto.Slug ?? product.Slug ?? ToSlug(product.Name);
            product.Sku = dto.Sku ?? product.Sku;
            product.Price = dto.Price ?? product.Price;
            product.OriginalPrice = dto.OriginalPrice ?? product.OriginalPrice;
            product.Stock = dto.Stock ?? product.Stock;
            product.Brand = dto.Brand ?? product.Brand;
            product.SupplierId = dto.SupplierId.HasValue ? await ResolveSupplierIdAsync(dto.SupplierId) : product.SupplierId;
            product.BackupSupplierId = dto.BackupSupplierId.HasValue ? await ResolveSupplierIdAsync(dto.BackupSupplierId) : product.BackupSupplierId;
            product.SupplyType = dto.SupplyType ?? product.SupplyType;
            product.WarrantyProvider = dto.WarrantyProvider ?? product.WarrantyProvider;
            product.Description = dto.Description ?? product.Description;
            product.LongDescription = dto.LongDescription ?? product.LongDescription;
            product.ImageUrl = dto.ImageUrl ?? product.ImageUrl;
            product.IsActive = dto.IsActive ?? product.IsActive;
            product.IsFeatured = dto.IsFeatured ?? product.IsFeatured;
            product.IsBestSeller = dto.IsBestSeller ?? product.IsBestSeller;
            product.IsNewArrival = dto.IsNewArrival ?? product.IsNewArrival;
            product.IsDiscounted = dto.IsDiscounted ?? product.IsDiscounted;
            product.RequiresSerialTracking = dto.RequiresSerialTracking ?? product.RequiresSerialTracking;
            product.WarrantyMonths = dto.WarrantyMonths ?? product.WarrantyMonths;
            EnsureSupplierPair(product.SupplierId, product.BackupSupplierId);
            product.UpdatedAt = DateTime.UtcNow;

            if (dto.Images != null)
            {
                product.Images.Clear();
                product.Images.AddRange(dto.Images.Select((image, index) => new ProductImage
                {
                    ProductId = product.Id,
                    ImageUrl = image.ImageUrl,
                    AltText = image.AltText,
                    SortOrder = image.SortOrder == 0 ? index : image.SortOrder,
                    IsPrimary = image.IsPrimary,
                    CreatedAt = image.CreatedAt == default ? DateTime.UtcNow : image.CreatedAt
                }));
            }

            if (dto.Variants != null)
            {
                product.Variants.Clear();
                product.Variants.AddRange(dto.Variants.Select(variant => new ProductVariant
                {
                    ProductId = product.Id,
                    VariantName = variant.VariantName,
                    ColorName = variant.ColorName,
                    ColorCode = variant.ColorCode,
                    Storage = variant.Storage,
                    Ram = variant.Ram,
                    Price = variant.Price,
                    OriginalPrice = variant.OriginalPrice,
                    Stock = variant.Stock,
                    Sku = variant.Sku,
                    ImageUrl = variant.ImageUrl,
                    IsActive = variant.IsActive,
                    CreatedAt = variant.CreatedAt == default ? DateTime.UtcNow : variant.CreatedAt,
                    UpdatedAt = DateTime.UtcNow
                }));
            }

            await _productRepository.UpdateAsync(product);
            return product;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
            {
                return false;
            }

            if (await _productRepository.HasOrderDetailsAsync(id))
            {
                product.IsActive = false;
                product.UpdatedAt = DateTime.UtcNow;
                await _productRepository.UpdateAsync(product);
                return true;
            }

            await _productRepository.DeleteAsync(product);
            return true;
        }

        public async Task<(List<Product> Products, int TotalCount)> SearchAsync(string? keyword, int? categoryId, int page, int pageSize)
        {
            var (products, totalCount) = await _productRepository.SearchAsync(keyword, categoryId, page, pageSize);
            return (products, totalCount);
        }

        public async Task<(List<Product> Products, int TotalCount)> SearchAsync(ProductSearchDto search)
        {
            return await _productRepository.SearchAsync(search);
        }

        private static string ToSlug(string value)
        {
            var normalized = value.Trim().ToLowerInvariant();
            var chars = normalized.Select(ch => char.IsLetterOrDigit(ch) ? ch : '-').ToArray();
            var slug = new string(chars);
            while (slug.Contains("--")) slug = slug.Replace("--", "-");
            return slug.Trim('-');
        }

        private async Task<int?> ResolveSupplierIdAsync(int? supplierId)
        {
            if (!supplierId.HasValue || supplierId.Value <= 0) return null;
            var supplier = await _supplierRepository.GetByIdAsync(supplierId.Value);
            if (supplier == null) throw new InvalidOperationException("Supplier not found");
            if (!supplier.IsActive) throw new InvalidOperationException("Supplier is inactive");
            return supplier.Id;
        }

        private async Task AttachSuppliersAsync(Product product)
        {
            if (product.Supplier == null && product.SupplierId.HasValue)
            {
                product.Supplier = await _supplierRepository.GetByIdAsync(product.SupplierId.Value);
            }

            if (product.BackupSupplier == null && product.BackupSupplierId.HasValue)
            {
                product.BackupSupplier = await _supplierRepository.GetByIdAsync(product.BackupSupplierId.Value);
            }
        }

        private static void EnsureSupplierPair(int? supplierId, int? backupSupplierId)
        {
            if (supplierId.HasValue && backupSupplierId.HasValue && supplierId.Value == backupSupplierId.Value)
            {
                throw new InvalidOperationException("Backup supplier must be different from supplier");
            }
        }
    }
}
