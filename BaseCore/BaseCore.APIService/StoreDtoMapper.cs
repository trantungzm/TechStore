using BaseCore.DTO.Store;
using BaseCore.Entities;

namespace BaseCore.APIService
{
    public static class StoreDtoMapper
    {
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
            Stock = product.Stock,
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
                Stock = product.Stock,
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

        public static ProductVariantDto ToVariantDto(ProductVariant variant) => new()
        {
            Id = variant.Id,
            ProductId = variant.ProductId,
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
            CreatedAt = variant.CreatedAt,
            UpdatedAt = variant.UpdatedAt
        };

        public static SpecDefinitionDto ToSpecDefinitionDto(SpecDefinition definition) => new()
        {
            Id = definition.Id,
            CategoryId = definition.CategoryId,
            Name = definition.Name,
            Code = definition.Code,
            DataType = definition.DataType,
            Unit = definition.Unit,
            SortOrder = definition.SortOrder,
            IsComparable = definition.IsComparable,
            IsFilterable = definition.IsFilterable,
            IsRequired = definition.IsRequired,
            CreatedAt = definition.CreatedAt,
            UpdatedAt = definition.UpdatedAt
        };

        public static ProductSpecValueDto ToSpecValueDto(ProductSpecValue spec)
        {
            object? value = spec.ValueText;
            if (spec.ValueNumber.HasValue) value = spec.ValueNumber.Value;
            if (spec.ValueBool.HasValue) value = spec.ValueBool.Value;

            return new ProductSpecValueDto
            {
                Id = spec.Id,
                ProductId = spec.ProductId,
                SpecDefinitionId = spec.SpecDefinitionId,
                Name = spec.SpecDefinition?.Name,
                Code = spec.SpecDefinition?.Code,
                DataType = spec.SpecDefinition?.DataType,
                Unit = spec.SpecDefinition?.Unit,
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
