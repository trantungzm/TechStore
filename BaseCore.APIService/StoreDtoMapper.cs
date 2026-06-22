using BaseCore.DTO.Store;
using BaseCore.Entities;

namespace BaseCore.APIService
{
    public static class StoreDtoMapper
    {
        private static int GetDisplayStock(Product product)
        {
            var variants = product.Variants ?? new List<ProductVariant>();
            return variants.Count > 0
                ? variants.Where(v => v.IsActive).Sum(v => v.Stock)
                : product.Stock;
        }

        public static CategoryDto ToCategoryDto(Category category) => new()
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description
        };

        public static ProductListDto ToListDto(Product product) => new()
        {
            Id = product.Id,
            Name = product.Name,
            Slug = product.Slug,
            Sku = product.Sku,
            Price = product.Price,
            OriginalPrice = product.OriginalPrice,
            Stock = GetDisplayStock(product),
            ImageUrl = product.ImageUrl,
            Description = product.Description,
            Brand = product.Brand,
            SupplierId = product.SupplierId,
            SupplierName = product.Supplier?.Name,
            BackupSupplierId = product.BackupSupplierId,
            BackupSupplierName = product.BackupSupplier?.Name,
            SupplyType = product.SupplyType,
            WarrantyProvider = product.WarrantyProvider,
            CategoryId = product.CategoryId,
            CategoryName = product.Category?.Name,
            RatingAverage = 0,
            RatingCount = 0,
            IsActive = product.IsActive,
            IsFeatured = product.IsFeatured,
            IsBestSeller = product.IsBestSeller,
            IsNewArrival = product.IsNewArrival,
            IsDiscounted = product.IsDiscounted,
            RequiresSerialTracking = product.RequiresSerialTracking,
            WarrantyMonths = product.WarrantyMonths,
            CreatedAt = product.CreatedAt,
            UpdatedAt = product.UpdatedAt,
            Variants = (product.Variants ?? new()).Select(ToVariantDto).ToList(),
            Specs = (product.SpecValues ?? new()).OrderBy(x => x.SpecDefinition?.SortOrder ?? 0).Select(ToSpecValueDto).ToList()
        };

        public static ProductListDto ToListDto(Product product, double ratingAverage, int ratingCount)
        {
            var dto = ToListDto(product);
            dto.RatingAverage = ratingAverage;
            dto.RatingCount = ratingCount;
            return dto;
        }

        public static ProductDetailDto ToDetailDto(Product product)
        {
            var dto = new ProductDetailDto
            {
                Id = product.Id,
                Name = product.Name,
                Slug = product.Slug,
                Sku = product.Sku,
                Price = product.Price,
                OriginalPrice = product.OriginalPrice,
                Stock = GetDisplayStock(product),
                ImageUrl = product.ImageUrl,
                Description = product.Description,
                LongDescription = product.LongDescription,
                Brand = product.Brand,
                SupplierId = product.SupplierId,
                SupplierName = product.Supplier?.Name,
                BackupSupplierId = product.BackupSupplierId,
                BackupSupplierName = product.BackupSupplier?.Name,
                SupplyType = product.SupplyType,
                WarrantyProvider = product.WarrantyProvider,
                CategoryId = product.CategoryId,
                CategoryName = product.Category?.Name,
                IsActive = product.IsActive,
                IsFeatured = product.IsFeatured,
                IsBestSeller = product.IsBestSeller,
                IsNewArrival = product.IsNewArrival,
                IsDiscounted = product.IsDiscounted,
                RequiresSerialTracking = product.RequiresSerialTracking,
                WarrantyMonths = product.WarrantyMonths,
                CreatedAt = product.CreatedAt,
                UpdatedAt = product.UpdatedAt
            };

            dto.Images = (product.Images ?? new()).OrderBy(x => x.SortOrder).Select(ToImageDto).ToList();
            dto.Variants = (product.Variants ?? new()).Select(ToVariantDto).ToList();
            dto.Specs = (product.SpecValues ?? new()).OrderBy(x => x.SpecDefinition?.SortOrder ?? 0).Select(ToSpecValueDto).ToList();
            dto.Recommendations = (product.Recommendations ?? new()).OrderBy(x => x.SortOrder).Select(ToRecommendationDto).ToList();
            return dto;
        }

        public static ProductImageDto ToImageDto(ProductImage image) => new()
        {
            Id = image.Id,
            ProductId = image.ProductId,
            ImageUrl = image.ImageUrl,
            AltText = image.AltText,
            SortOrder = image.SortOrder,
            IsPrimary = image.IsPrimary,
            CreatedAt = image.CreatedAt
        };

        public static ProductVariantDto ToVariantDto(ProductVariant variant)
        {
            // Các cột ColorName/Storage/Ram đã bị bỏ khỏi DB, nên tách lại từ VariantName
            // (định dạng "RAM - Storage - Màu", vd "12GB - 256GB - Xanh dương").
            // VariantName được ưu tiên (giữ dấu tiếng Việt); thiếu phần nào thì lấy từ mã SKU.
            var (ram, storage, color) = ParseVariantOptions(variant.VariantName);
            var (skuRam, skuStorage, skuColor) = ParseSkuOptions(variant.Sku);
            ram ??= skuRam;
            storage ??= skuStorage;
            color ??= skuColor;
            return new()
            {
                Id = variant.Id,
                ProductId = variant.ProductId,
                VariantName = variant.VariantName,
                ColorName = string.IsNullOrWhiteSpace(variant.ColorName) ? color : variant.ColorName,
                ColorCode = string.IsNullOrWhiteSpace(variant.ColorCode) ? GuessColorHex(color) : variant.ColorCode,
                Storage = string.IsNullOrWhiteSpace(variant.Storage) ? storage : variant.Storage,
                Ram = string.IsNullOrWhiteSpace(variant.Ram) ? ram : variant.Ram,
                Price = variant.Price,
                OriginalPrice = variant.OriginalPrice,
                Stock = variant.Stock,
                Sku = variant.Sku,
                ImageUrl = variant.ImageUrl,
                IsActive = variant.IsActive,
                CreatedAt = variant.CreatedAt,
                UpdatedAt = variant.UpdatedAt
            };
        }

        private static readonly System.Text.RegularExpressions.Regex CapacityRegex =
            new(@"^\d+\s*(GB|TB)", System.Text.RegularExpressions.RegexOptions.IgnoreCase | System.Text.RegularExpressions.RegexOptions.Compiled);

        // Tách "RAM - Storage - Màu" từ tên biến thể. Hỗ trợ cả "16GB/512GB" và các phần phụ
        // (vd "12GB - 256GB - WiFi + Cellular - Xám"). Nếu chỉ có 1 dung lượng thì coi là Storage.
        private static (string? ram, string? storage, string? color) ParseVariantOptions(string? variantName)
        {
            if (string.IsNullOrWhiteSpace(variantName)) return (null, null, null);

            var segments = variantName
                .Replace("/", " - ")
                .Split(new[] { " - " }, StringSplitOptions.RemoveEmptyEntries)
                .Select(s => s.Trim())
                .Where(s => s.Length > 0)
                .ToList();

            var caps = new List<string>();
            var others = new List<string>();
            foreach (var seg in segments)
            {
                var m = CapacityRegex.Match(seg);
                if (m.Success) caps.Add(m.Value.Replace(" ", "").ToUpperInvariant());
                else others.Add(seg);
            }

            string? ram = null, storage = null;
            if (caps.Count >= 2) { ram = caps[0]; storage = caps[1]; }
            else if (caps.Count == 1) { storage = caps[0]; }

            string? color = others.Count > 0 ? others[^1] : null;
            return (ram, storage, color);
        }

        // Tách RAM/Storage/Màu từ mã SKU (token nối bằng "-"), dùng khi VariantName thiếu thông tin.
        // Vd "EL-SAMSUNGGALAXYS24ULTRA-256GB-ONYX-BLACK" -> storage 256GB, màu "Onyx Black".
        private static (string? ram, string? storage, string? color) ParseSkuOptions(string? sku)
        {
            if (string.IsNullOrWhiteSpace(sku)) return (null, null, null);

            var tokens = sku
                .Split('-', StringSplitOptions.RemoveEmptyEntries)
                .Select(t => t.Trim())
                .Where(t => t.Length > 0)
                .ToList();

            var capIdx = new List<int>();
            for (var i = 0; i < tokens.Count; i++)
                if (CapacityRegex.IsMatch(tokens[i])) capIdx.Add(i);

            string? ram = null, storage = null, color = null;
            if (capIdx.Count >= 2) { ram = tokens[capIdx[0]].ToUpperInvariant(); storage = tokens[capIdx[1]].ToUpperInvariant(); }
            else if (capIdx.Count == 1) { storage = tokens[capIdx[0]].ToUpperInvariant(); }

            if (capIdx.Count > 0)
            {
                var colorTokens = tokens.Skip(capIdx[^1] + 1).ToList();
                if (colorTokens.Count > 0) color = TitleCase(string.Join(" ", colorTokens));
            }
            return (ram, storage, color);
        }

        private static string TitleCase(string text)
        {
            var words = text.ToLowerInvariant().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            return string.Join(" ", words.Select(w => char.ToUpperInvariant(w[0]) + w.Substring(1)));
        }

        // Ánh xạ tên màu tiếng Việt -> mã hex để hiển thị ô màu (swatch).
        private static string? GuessColorHex(string? colorName)
        {
            if (string.IsNullOrWhiteSpace(colorName)) return null;
            var key = colorName.Trim().ToLowerInvariant();
            return key switch
            {
                var k when k.Contains("titan trắng") || k.Contains("trắng bạc") || k.Contains("bạc") || k.Contains("silver") || k.Contains("platinum") => "#E5E7EB",
                var k when k.Contains("trắng") || k.Contains("white") => "#F8FAFC",
                var k when k.Contains("titan đen") || k.Contains("đen") || k.Contains("black") => "#1F2937",
                var k when k.Contains("xám") || k.Contains("gray") || k.Contains("grey") => "#9CA3AF",
                var k when k.Contains("vàng") || k.Contains("gold") || k.Contains("kem") => "#FCD34D",
                var k when k.Contains("hồng") || k.Contains("pink") => "#F9A8D4",
                var k when k.Contains("tím") || k.Contains("purple") || k.Contains("violet") => "#A78BFA",
                var k when k.Contains("đỏ") || k.Contains("red") => "#EF4444",
                var k when k.Contains("cam") || k.Contains("orange") => "#FB923C",
                var k when k.Contains("xanh lá") || k.Contains("green") => "#34D399",
                var k when k.Contains("xanh dương") || k.Contains("xanh đậm") || k.Contains("xanh sky") || k.Contains("xanh") || k.Contains("blue") || k.Contains("cobalt") || k.Contains("navy") => "#60A5FA",
                _ => null
            };
        }

        public static SpecDefinitionDto ToSpecDefinitionDto(SpecDefinition definition) => new()
        {
            Id = definition.Id,
            CategoryId = definition.CategoryId,
            Name = definition.Name,
            Code = definition.Code,
            DataType = definition.DataType,
            InputType = definition.InputType,
            Unit = definition.Unit,
            AllowCustomValue = definition.AllowCustomValue,
            IsVariantAxis = definition.IsVariantAxis,
            CreatedAt = definition.CreatedAt,
            UpdatedAt = definition.UpdatedAt,
            Options = (definition.Options ?? new()).OrderBy(x => x.DisplayOrder).ThenBy(x => x.Id).Select(ToSpecOptionDto).ToList()
        };

        public static SpecOptionDto ToSpecOptionDto(SpecOption option) => new()
        {
            Id = option.Id,
            SpecDefinitionId = option.SpecDefinitionId,
            Value = option.Value,
            DisplayOrder = option.DisplayOrder,
            IsActive = option.IsActive,
            CreatedAt = option.CreatedAt,
            UpdatedAt = option.UpdatedAt
        };

        public static ProductSpecValueDto ToSpecValueDto(ProductSpecValue spec)
        {
            object? value = spec.SpecOption?.Value ?? spec.ValueText;
            if (spec.ValueNumber.HasValue) value = spec.ValueNumber.Value;
            if (spec.ValueBool.HasValue) value = spec.ValueBool.Value;

            return new ProductSpecValueDto
            {
                Id = spec.Id,
                ProductId = spec.ProductId,
                SpecDefinitionId = spec.SpecDefinitionId,
                SpecOptionId = spec.SpecOptionId,
                Name = spec.SpecDefinition?.Name,
                Code = spec.SpecDefinition?.Code,
                DataType = spec.SpecDefinition?.DataType,
                InputType = spec.SpecDefinition == null ? null : (string.IsNullOrWhiteSpace(spec.SpecDefinition.InputType) ? spec.SpecDefinition.DataType : spec.SpecDefinition.InputType),
                Unit = spec.SpecDefinition?.Unit,
                OptionValue = spec.SpecOption?.Value,
                ValueText = spec.ValueText,
                ValueNumber = spec.ValueNumber,
                ValueBool = spec.ValueBool,
                Value = value
            };
        }

        public static RecommendationDto ToRecommendationDto(ProductRecommendation recommendation) => new()
        {
            Id = recommendation.Id,
            ProductId = recommendation.ProductId,
            RecommendedProductId = recommendation.RecommendedProductId,
            Type = recommendation.Type,
            SortOrder = recommendation.SortOrder,
            Product = recommendation.RecommendedProduct == null ? null : ToListDto(recommendation.RecommendedProduct)
        };
    }
}
