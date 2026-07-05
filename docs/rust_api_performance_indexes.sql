USE [techstore];
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_ProductRecommendations_Product_Type_Sort'
      AND object_id = OBJECT_ID(N'dbo.ProductRecommendations')
)
BEGIN
    CREATE INDEX IX_ProductRecommendations_Product_Type_Sort
    ON dbo.ProductRecommendations (ProductId, Type, SortOrder)
    INCLUDE (RecommendedProductId);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_ProductVariants_Product_Active_Stock'
      AND object_id = OBJECT_ID(N'dbo.ProductVariants')
)
BEGIN
    CREATE INDEX IX_ProductVariants_Product_Active_Stock
    ON dbo.ProductVariants (ProductId, IsActive)
    INCLUDE (Stock);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_Products_Active_Category_Sort'
      AND object_id = OBJECT_ID(N'dbo.Products')
)
BEGIN
    CREATE INDEX IX_Products_Active_Category_Sort
    ON dbo.Products (IsActive, CategoryId, IsFeatured, IsBestSeller, Id)
    INCLUDE (TotalStock, BasePrice, MinPrice, OriginalPrice, Name, Slug, ImageUrl, Brand);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_Products_Active_HomeSort'
      AND object_id = OBJECT_ID(N'dbo.Products')
)
BEGIN
    CREATE INDEX IX_Products_Active_HomeSort
    ON dbo.Products (IsActive, IsBestSeller, IsFeatured, IsNewArrival, Id)
    INCLUDE (CategoryId, TotalStock, BasePrice, MinPrice, OriginalPrice, Name, Slug, ImageUrl, Brand);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_ProductSpecValues_Product_Definition'
      AND object_id = OBJECT_ID(N'dbo.ProductSpecValues')
)
BEGIN
    CREATE INDEX IX_ProductSpecValues_Product_Definition
    ON dbo.ProductSpecValues (ProductId, SpecDefinitionId)
    INCLUDE (SpecOptionId, ValueText, ValueNumber, ValueBool);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_SpecDefinitions_Sort_Name'
      AND object_id = OBJECT_ID(N'dbo.SpecDefinitions')
)
BEGIN
    CREATE INDEX IX_SpecDefinitions_Sort_Name
    ON dbo.SpecDefinitions (SortOrder, Name)
    INCLUDE (Code, DataType, InputType, Unit);
END
GO
