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
        private readonly IStockItemRepositoryEF _stockItemRepository;

        public ProductService(IProductRepositoryEF productRepository, ICategoryRepositoryEF categoryRepository, ISupplierRepositoryEF supplierRepository, IStockItemRepositoryEF stockItemRepository)
        {
            _productRepository = productRepository;
            _categoryRepository = categoryRepository;
            _supplierRepository = supplierRepository;
            _stockItemRepository = stockItemRepository;
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

        public async Task<Product?> GetProductByIdAsync(int id, bool includeInactive = false)
        {
            var product = await _productRepository.GetDetailAsync(id, includeInactive);

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
                Stock = 0, // Tồn kho chỉ được tạo qua nghiệp vụ Nhập kho (Inventory), không set khi tạo sản phẩm
                CategoryId = dto.CategoryId,
                Slug = string.IsNullOrWhiteSpace(dto.Slug) ? ToSlug(dto.Name) : dto.Slug,
                Sku = dto.Sku,
                Brand = dto.Brand,
                SupplierId = await ResolveSupplierIdAsync(dto.SupplierId),
                BackupSupplierId = null,
                SupplyType = dto.SupplyType,
                WarrantyProvider = dto.WarrantyProvider,
                Description = dto.Description,
                LongDescription = dto.LongDescription,
                ImageUrl = string.Empty,
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

            product.Images = dto.Images.Select((image, index) => new ProductImage
            {
                ImageUrl = image.ImageUrl,
                AltText = image.AltText,
                SortOrder = image.SortOrder == 0 ? index : image.SortOrder,
                IsPrimary = image.IsPrimary
            }).ToList();

            product.Variants = BuildVariants(dto.Variants);
            product.ImageUrl = ResolvePrimaryImageUrl(dto.ImageUrl, product.Images);

            // Add product-category relationships for additional categories
            var allCategoryIds = dto.AdditionalCategoryIds
                .Where(id => id > 0 && id != dto.CategoryId)
                .Distinct()
                .ToList();
            product.ProductCategories = allCategoryIds.Select(catId => new ProductCategory
            {
                CategoryId = catId
            }).ToList();

            return await _productRepository.AddAsync(product);
        }

        public async Task<Product?> UpdateAsync(int id, ProductUpdateDto dto)
        {
            var product = await _productRepository.GetDetailAsync(id, includeInactive: true);
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
            // product.Stock KHÔNG cập nhật ở đây — tồn kho do nghiệp vụ Inventory (nhập kho) sở hữu.
            product.Brand = dto.Brand ?? product.Brand;
            product.SupplierId = dto.SupplierId.HasValue ? await ResolveSupplierIdAsync(dto.SupplierId) : product.SupplierId;
            product.BackupSupplierId = null;
            product.BackupSupplier = null;
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
                product.ImageUrl = ResolvePrimaryImageUrl(dto.ImageUrl, product.Images);
            }

            if (dto.Variants != null)
            {
                await MergeVariantsAsync(product, dto.Variants);
            }

            // Update additional categories
            if (dto.AdditionalCategoryIds != null)
            {
                var currentCategoryIds = product.ProductCategories
                    .Where(pc => pc.CategoryId != product.CategoryId)
                    .Select(pc => pc.CategoryId)
                    .ToHashSet();

                var requestedCategoryIds = dto.AdditionalCategoryIds
                    .Where(id => id > 0 && id != product.CategoryId)
                    .Distinct()
                    .ToHashSet();

                // Remove categories not in the new list
                var toRemove = product.ProductCategories
                    .Where(pc => pc.CategoryId != product.CategoryId && !requestedCategoryIds.Contains(pc.CategoryId))
                    .ToList();
                foreach (var pc in toRemove)
                {
                    product.ProductCategories.Remove(pc);
                }

                // Add new categories not already associated
                var existingIds = product.ProductCategories.Select(pc => pc.CategoryId).ToHashSet();
                var toAdd = requestedCategoryIds
                    .Where(id => !existingIds.Contains(id))
                    .Select(id => new ProductCategory { ProductId = product.Id, CategoryId = id })
                    .ToList();
                foreach (var pc in toAdd)
                {
                    product.ProductCategories.Add(pc);
                }
            }

            await _productRepository.UpdateAsync(product);
            return product;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var product = await _productRepository.GetDetailAsync(id, includeInactive: true);
            if (product == null)
            {
                return false;
            }

            product.IsActive = false;
            product.UpdatedAt = DateTime.UtcNow;
            await _productRepository.UpdateAsync(product);
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

        public async Task<ProductInventoryStats> GetInventoryStatsAsync(ProductSearchDto search)
        {
            var query = search ?? new ProductSearchDto();
            var first = await _productRepository.SearchAsync(new ProductSearchDto
            {
                Keyword = query.Keyword,
                CategoryId = query.CategoryId,
                CategoryIds = query.CategoryIds,
                CategorySlug = query.CategorySlug,
                Brand = query.Brand,
                MinPrice = query.MinPrice,
                MaxPrice = query.MaxPrice,
                InStock = query.InStock,
                IsFeatured = query.IsFeatured,
                IsBestSeller = query.IsBestSeller,
                IsNewArrival = query.IsNewArrival,
                IsDiscounted = query.IsDiscounted,
                IncludeInactive = query.IncludeInactive,
                SortBy = query.SortBy,
                Page = 1,
                PageSize = 100
            });

            var products = new List<Product>(first.Products);
            var totalPages = (int)Math.Ceiling(first.TotalCount / 100d);

            for (var page = 2; page <= totalPages; page++)
            {
                var next = await _productRepository.SearchAsync(new ProductSearchDto
                {
                    Keyword = query.Keyword,
                    CategoryId = query.CategoryId,
                    CategoryIds = query.CategoryIds,
                    CategorySlug = query.CategorySlug,
                    Brand = query.Brand,
                    MinPrice = query.MinPrice,
                    MaxPrice = query.MaxPrice,
                    InStock = query.InStock,
                    IsFeatured = query.IsFeatured,
                    IsBestSeller = query.IsBestSeller,
                    IsNewArrival = query.IsNewArrival,
                    IsDiscounted = query.IsDiscounted,
                    IncludeInactive = query.IncludeInactive,
                    SortBy = query.SortBy,
                    Page = page,
                    PageSize = 100
                });
                products.AddRange(next.Products);
            }

            var available = 0;
            var low = 0;
            var outOfStock = 0;

            foreach (var product in products)
            {
                var activeVariants = product.Variants?.Where(v => v.IsActive).ToList() ?? new List<ProductVariant>();
                var stock = activeVariants.Count > 0 ? activeVariants.Sum(v => v.Stock) : product.Stock;

                if (stock > 0) available++;
                if (stock <= 0) outOfStock++;
                else if (stock <= 5) low++;
            }

            return new ProductInventoryStats(first.TotalCount, available, low, outOfStock);
        }

        public Task<List<string>> GetBrandsAsync()
        {
            return _productRepository.GetBrandsAsync();
        }

        private static string ToSlug(string value)
        {
            var normalized = value.Trim().ToLowerInvariant();
            var chars = normalized.Select(ch => char.IsLetterOrDigit(ch) ? ch : '-').ToArray();
            var slug = new string(chars);
            while (slug.Contains("--")) slug = slug.Replace("--", "-");
            return slug.Trim('-');
        }

        private static string ResolvePrimaryImageUrl(string? imageUrl, IEnumerable<ProductImage> images)
        {
            if (!string.IsNullOrWhiteSpace(imageUrl))
            {
                return imageUrl.Trim();
            }

            return images.FirstOrDefault(image => image.IsPrimary)?.ImageUrl
                ?? images.OrderBy(image => image.SortOrder).FirstOrDefault()?.ImageUrl
                ?? string.Empty;
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
        }

        private static List<ProductVariant> BuildVariants(IEnumerable<ProductVariantDto>? variants, int productId = 0)
        {
            return (variants ?? Enumerable.Empty<ProductVariantDto>())
                .Where(v =>
                    !string.IsNullOrWhiteSpace(v.VariantName) ||
                    !string.IsNullOrWhiteSpace(v.ColorName) ||
                    !string.IsNullOrWhiteSpace(v.Storage) ||
                    !string.IsNullOrWhiteSpace(v.Ram) ||
                    !string.IsNullOrWhiteSpace(v.Sku))
                .Select(v => new ProductVariant
                {
                    ProductId = productId,
                    VariantName = Clean(v.VariantName),
                    ColorName = Clean(v.ColorName),
                    ColorCode = Clean(v.ColorCode),
                    Storage = Clean(v.Storage),
                    Ram = Clean(v.Ram),
                    Price = v.Price ?? 0,
                    OriginalPrice = v.OriginalPrice,
                    Stock = 0, // Tồn variant chỉ tăng qua Nhập kho (Inventory)
                    Sku = Clean(v.Sku),
                    ImageUrl = Clean(v.ImageUrl),
                    IsActive = v.IsActive,
                    CreatedAt = v.CreatedAt == default ? DateTime.UtcNow : v.CreatedAt,
                    UpdatedAt = DateTime.UtcNow
                })
                .ToList();
        }

        /// <summary>
        /// Hợp nhất danh sách variant từ DTO vào product hiện có mà KHÔNG xóa-tạo lại:
        /// - Variant khớp Id: cập nhật thuộc tính hiển thị, giữ nguyên Stock (do Inventory quản lý).
        /// - Variant mới (Id = 0): thêm với Stock = 0.
        /// - Variant bị bỏ: deactivate nếu đã có StockItem (tránh vi phạm FK Restrict), ngược lại xóa.
        /// </summary>
        private async Task MergeVariantsAsync(Product product, IEnumerable<ProductVariantDto> dtos)
        {
            var incoming = (dtos ?? Enumerable.Empty<ProductVariantDto>())
                .Where(v =>
                    !string.IsNullOrWhiteSpace(v.VariantName) ||
                    !string.IsNullOrWhiteSpace(v.ColorName) ||
                    !string.IsNullOrWhiteSpace(v.Storage) ||
                    !string.IsNullOrWhiteSpace(v.Ram) ||
                    !string.IsNullOrWhiteSpace(v.Sku))
                .ToList();

            var incomingIds = incoming.Where(v => v.Id > 0).Select(v => v.Id).ToHashSet();

            // Variant hiện có không còn trong DTO
            foreach (var existing in product.Variants.Where(v => v.Id > 0 && !incomingIds.Contains(v.Id)).ToList())
            {
                // Chặn: không cho bỏ biến thể đang còn hàng tồn (tránh thất lạc tồn kho).
                var inStock = await _stockItemRepository.CountInStockByVariantIdAsync(existing.Id);
                if (inStock > 0)
                {
                    throw new InvalidOperationException(
                        $"Không thể bỏ biến thể \"{VariantLabel(existing)}\" vì còn {inStock} sản phẩm tồn kho. " +
                        "Hãy chuyển kho hoặc bán/xuất hết tồn của biến thể này trước khi thay đổi.");
                }

                if (await _stockItemRepository.AnyByVariantAsync(existing.Id))
                {
                    existing.IsActive = false;
                    existing.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    product.Variants.Remove(existing);
                }
            }

            // Cập nhật / thêm mới
            foreach (var dto in incoming)
            {
                var existing = dto.Id > 0 ? product.Variants.FirstOrDefault(v => v.Id == dto.Id) : null;
                if (existing != null)
                {
                    // Chặn: không cho tắt (IsActive=false) biến thể đang còn hàng tồn.
                    if (existing.IsActive && !dto.IsActive)
                    {
                        var inStock = await _stockItemRepository.CountInStockByVariantIdAsync(existing.Id);
                        if (inStock > 0)
                        {
                            throw new InvalidOperationException(
                                $"Không thể tắt biến thể \"{VariantLabel(existing)}\" vì còn {inStock} sản phẩm tồn kho. " +
                                "Hãy chuyển kho hoặc bán/xuất hết tồn của biến thể này trước.");
                        }
                    }

                    existing.VariantName = Clean(dto.VariantName);
                    existing.ColorName = Clean(dto.ColorName);
                    existing.ColorCode = Clean(dto.ColorCode);
                    existing.Storage = Clean(dto.Storage);
                    existing.Ram = Clean(dto.Ram);
                    existing.Price = dto.Price ?? existing.Price;
                    existing.OriginalPrice = dto.OriginalPrice;
                    existing.Sku = Clean(dto.Sku);
                    existing.ImageUrl = Clean(dto.ImageUrl);
                    existing.IsActive = dto.IsActive;
                    existing.UpdatedAt = DateTime.UtcNow;
                    // Stock giữ nguyên — do Inventory quản lý.
                }
                else
                {
                    product.Variants.Add(new ProductVariant
                    {
                        ProductId = product.Id,
                        VariantName = Clean(dto.VariantName),
                        ColorName = Clean(dto.ColorName),
                        ColorCode = Clean(dto.ColorCode),
                        Storage = Clean(dto.Storage),
                        Ram = Clean(dto.Ram),
                        Price = dto.Price ?? product.BasePrice ?? product.MinPrice ?? 0,
                        OriginalPrice = dto.OriginalPrice,
                        Stock = 0,
                        Sku = Clean(dto.Sku),
                        ImageUrl = Clean(dto.ImageUrl),
                        IsActive = dto.IsActive,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                }
            }
        }

        private static string? Clean(string? value)
        {
            var text = value?.Trim();
            return string.IsNullOrWhiteSpace(text) ? null : text;
        }

        // Nhãn hiển thị cho biến thể trong thông báo lỗi.
        private static string VariantLabel(ProductVariant v)
        {
            var label = Clean(v.VariantName)
                ?? string.Join(" - ", new[] { Clean(v.ColorName), Clean(v.Storage), Clean(v.Ram) }.Where(x => x != null))
                ?? Clean(v.Sku);
            return string.IsNullOrWhiteSpace(label) ? $"#{v.Id}" : label!;
        }
    }
}
