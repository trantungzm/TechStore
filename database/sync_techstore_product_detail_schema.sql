-- Synchronize product detail tables with the current EF Core model.
-- This fixes /api/products/{id} failures caused by legacy SQL columns.

USE [techstore];
GO

IF COL_LENGTH('dbo.Products', 'CategoryId') IS NOT NULL
BEGIN
    UPDATE [dbo].[Products]
    SET
        [CategoryId] = COALESCE([CategoryId], 1),
        [Stock] = COALESCE([Stock], 0),
        [IsActive] = COALESCE([IsActive], 1),
        [IsFeatured] = COALESCE([IsFeatured], 0),
        [IsBestSeller] = COALESCE([IsBestSeller], 0),
        [IsNewArrival] = COALESCE([IsNewArrival], 0),
        [IsDiscounted] = COALESCE([IsDiscounted], 0),
        [RequiresSerialTracking] = COALESCE([RequiresSerialTracking], 0),
        [WarrantyMonths] = COALESCE([WarrantyMonths], 12),
        [CreatedAt] = COALESCE([CreatedAt], SYSUTCDATETIME())
    WHERE [CategoryId] IS NULL
       OR [Stock] IS NULL
       OR [IsActive] IS NULL
       OR [IsFeatured] IS NULL
       OR [IsBestSeller] IS NULL
       OR [IsNewArrival] IS NULL
       OR [IsDiscounted] IS NULL
       OR [RequiresSerialTracking] IS NULL
       OR [WarrantyMonths] IS NULL
       OR [CreatedAt] IS NULL;
END
GO

IF OBJECT_ID(N'[dbo].[ProductImages]', N'U') IS NOT NULL
BEGIN
    IF COL_LENGTH('dbo.ProductImages', 'CreatedAt') IS NULL
        ALTER TABLE [dbo].[ProductImages] ADD [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [DF_ProductImages_CreatedAt_Legacy] DEFAULT SYSUTCDATETIME();

    EXEC(N'UPDATE [dbo].[ProductImages]
        SET
            [SortOrder] = COALESCE([SortOrder], 0),
            [IsPrimary] = COALESCE([IsPrimary], 0),
            [CreatedAt] = COALESCE([CreatedAt], SYSUTCDATETIME())
        WHERE [SortOrder] IS NULL OR [IsPrimary] IS NULL OR [CreatedAt] IS NULL;');
END
GO

IF OBJECT_ID(N'[dbo].[ProductVariants]', N'U') IS NOT NULL
BEGIN
    IF COL_LENGTH('dbo.ProductVariants', 'CreatedAt') IS NULL
        ALTER TABLE [dbo].[ProductVariants] ADD [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [DF_ProductVariants_CreatedAt_Legacy] DEFAULT SYSUTCDATETIME();
    IF COL_LENGTH('dbo.ProductVariants', 'UpdatedAt') IS NULL
        ALTER TABLE [dbo].[ProductVariants] ADD [UpdatedAt] DATETIME2 NULL;

    EXEC(N'UPDATE [dbo].[ProductVariants]
        SET
            [Stock] = COALESCE([Stock], 0),
            [IsActive] = COALESCE([IsActive], 1),
            [CreatedAt] = COALESCE([CreatedAt], SYSUTCDATETIME())
        WHERE [Stock] IS NULL OR [IsActive] IS NULL OR [CreatedAt] IS NULL;');
END
GO

IF OBJECT_ID(N'[dbo].[SpecDefinitions]', N'U') IS NOT NULL
BEGIN
    IF COL_LENGTH('dbo.SpecDefinitions', 'IsRequired') IS NULL
        ALTER TABLE [dbo].[SpecDefinitions] ADD [IsRequired] BIT NOT NULL CONSTRAINT [DF_SpecDefinitions_IsRequired_Legacy] DEFAULT 0;

    EXEC(N'UPDATE [dbo].[SpecDefinitions]
        SET
            [CategoryId] = COALESCE([CategoryId], 1),
            [DataType] = COALESCE([DataType], N''text''),
            [InputType] = COALESCE([InputType], COALESCE([DataType], N''text'')),
            [AllowCustomValue] = COALESCE([AllowCustomValue], 1),
            [IsComparable] = COALESCE([IsComparable], 1),
            [IsFilterable] = COALESCE([IsFilterable], 0),
            [SortOrder] = COALESCE([SortOrder], 0),
            [IsActive] = COALESCE([IsActive], 1),
            [CreatedAt] = COALESCE([CreatedAt], SYSUTCDATETIME())
        WHERE [CategoryId] IS NULL
           OR [DataType] IS NULL
           OR [InputType] IS NULL
           OR [AllowCustomValue] IS NULL
           OR [IsComparable] IS NULL
           OR [IsFilterable] IS NULL
           OR [SortOrder] IS NULL
           OR [IsActive] IS NULL
           OR [CreatedAt] IS NULL;');
END
GO

IF OBJECT_ID(N'[dbo].[SpecOptions]', N'U') IS NOT NULL
BEGIN
    UPDATE [dbo].[SpecOptions]
    SET
        [DisplayOrder] = COALESCE([DisplayOrder], 0),
        [IsActive] = COALESCE([IsActive], 1),
        [CreatedAt] = COALESCE([CreatedAt], SYSUTCDATETIME())
    WHERE [DisplayOrder] IS NULL OR [IsActive] IS NULL OR [CreatedAt] IS NULL;
END
GO

IF OBJECT_ID(N'[dbo].[ProductSpecValues]', N'U') IS NOT NULL
BEGIN
    UPDATE [dbo].[ProductSpecValues]
    SET [CreatedAt] = COALESCE([CreatedAt], SYSUTCDATETIME())
    WHERE [CreatedAt] IS NULL;
END
GO

IF OBJECT_ID(N'[dbo].[ProductRecommendations]', N'U') IS NOT NULL
BEGIN
    IF COL_LENGTH('dbo.ProductRecommendations', 'Type') IS NULL
        ALTER TABLE [dbo].[ProductRecommendations] ADD [Type] NVARCHAR(40) NOT NULL CONSTRAINT [DF_ProductRecommendations_Type_Legacy] DEFAULT N'CrossSell';

    EXEC(N'UPDATE [dbo].[ProductRecommendations]
        SET
            [Type] = COALESCE([Type], N''CrossSell''),
            [SortOrder] = COALESCE([SortOrder], 0),
            [CreatedAt] = COALESCE([CreatedAt], SYSUTCDATETIME())
        WHERE [Type] IS NULL OR [SortOrder] IS NULL OR [CreatedAt] IS NULL;');
END
GO

IF OBJECT_ID(N'[dbo].[Categories]', N'U') IS NOT NULL
BEGIN
    UPDATE [dbo].[Categories]
    SET [Name] = COALESCE([Name], CONCAT(N'Category ', [Id]))
    WHERE [Name] IS NULL;
END
GO

IF OBJECT_ID(N'[dbo].[Suppliers]', N'U') IS NOT NULL
BEGIN
    UPDATE [dbo].[Suppliers]
    SET
        [SupplierType] = COALESCE([SupplierType], 0),
        [IsActive] = COALESCE([IsActive], 1),
        [CreatedAt] = COALESCE([CreatedAt], SYSUTCDATETIME())
    WHERE [SupplierType] IS NULL OR [IsActive] IS NULL OR [CreatedAt] IS NULL;
END
GO

PRINT 'TechStore product detail schema synchronized.';
GO
