-- Synchronize required SQL Server data for TechStore.
-- Run this against SQL Server database [techstore] when a local DB is missing coupon tables/data.

USE [techstore];
GO

IF OBJECT_ID(N'[dbo].[Coupons]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Coupons] (
        [Id] INT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_Coupons] PRIMARY KEY,
        [Code] NVARCHAR(60) NOT NULL,
        [Name] NVARCHAR(200) NOT NULL,
        [Description] NVARCHAR(1000) NULL,
        [Type] NVARCHAR(40) NOT NULL,
        [DiscountType] NVARCHAR(40) NOT NULL,
        [DiscountValue] DECIMAL(18,2) NOT NULL,
        [MaxDiscountAmount] DECIMAL(18,2) NULL,
        [MinOrderAmount] DECIMAL(18,2) NOT NULL,
        [StartAt] DATETIME2 NOT NULL,
        [EndAt] DATETIME2 NOT NULL,
        [TotalQuantity] INT NOT NULL,
        [UsedQuantity] INT NOT NULL CONSTRAINT [DF_Coupons_UsedQuantity] DEFAULT 0,
        [ClaimedQuantity] INT NOT NULL CONSTRAINT [DF_Coupons_ClaimedQuantity] DEFAULT 0,
        [PerUserLimit] INT NOT NULL CONSTRAINT [DF_Coupons_PerUserLimit] DEFAULT 1,
        [IsActive] BIT NOT NULL CONSTRAINT [DF_Coupons_IsActive] DEFAULT 1,
        [IsPublic] BIT NOT NULL CONSTRAINT [DF_Coupons_IsPublic] DEFAULT 1,
        [IsAutoClaimable] BIT NOT NULL CONSTRAINT [DF_Coupons_IsAutoClaimable] DEFAULT 1,
        [IsStackable] BIT NOT NULL CONSTRAINT [DF_Coupons_IsStackable] DEFAULT 0,
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [DF_Coupons_CreatedAt] DEFAULT SYSUTCDATETIME(),
        [UpdatedAt] DATETIME2 NULL,
        [CreatedByUserId] UNIQUEIDENTIFIER NULL
    );
END
GO

IF COL_LENGTH('dbo.Coupons', 'Name') IS NULL ALTER TABLE [dbo].[Coupons] ADD [Name] NVARCHAR(200) NOT NULL CONSTRAINT [DF_Coupons_Name] DEFAULT N'';
IF COL_LENGTH('dbo.Coupons', 'Description') IS NULL ALTER TABLE [dbo].[Coupons] ADD [Description] NVARCHAR(1000) NULL;
IF COL_LENGTH('dbo.Coupons', 'Type') IS NULL ALTER TABLE [dbo].[Coupons] ADD [Type] NVARCHAR(40) NOT NULL CONSTRAINT [DF_Coupons_Type] DEFAULT N'Product';
IF COL_LENGTH('dbo.Coupons', 'DiscountType') IS NULL ALTER TABLE [dbo].[Coupons] ADD [DiscountType] NVARCHAR(40) NOT NULL CONSTRAINT [DF_Coupons_DiscountType] DEFAULT N'Amount';
IF COL_LENGTH('dbo.Coupons', 'DiscountValue') IS NULL ALTER TABLE [dbo].[Coupons] ADD [DiscountValue] DECIMAL(18,2) NOT NULL CONSTRAINT [DF_Coupons_DiscountValue] DEFAULT 0;
IF COL_LENGTH('dbo.Coupons', 'MaxDiscountAmount') IS NULL ALTER TABLE [dbo].[Coupons] ADD [MaxDiscountAmount] DECIMAL(18,2) NULL;
IF COL_LENGTH('dbo.Coupons', 'MinOrderAmount') IS NULL ALTER TABLE [dbo].[Coupons] ADD [MinOrderAmount] DECIMAL(18,2) NOT NULL CONSTRAINT [DF_Coupons_MinOrderAmount] DEFAULT 0;
IF COL_LENGTH('dbo.Coupons', 'StartAt') IS NULL ALTER TABLE [dbo].[Coupons] ADD [StartAt] DATETIME2 NOT NULL CONSTRAINT [DF_Coupons_StartAt] DEFAULT '2026-01-01T00:00:00';
IF COL_LENGTH('dbo.Coupons', 'EndAt') IS NULL ALTER TABLE [dbo].[Coupons] ADD [EndAt] DATETIME2 NOT NULL CONSTRAINT [DF_Coupons_EndAt] DEFAULT '2026-12-31T23:59:59';
IF COL_LENGTH('dbo.Coupons', 'TotalQuantity') IS NULL ALTER TABLE [dbo].[Coupons] ADD [TotalQuantity] INT NOT NULL CONSTRAINT [DF_Coupons_TotalQuantity] DEFAULT 1000;
IF COL_LENGTH('dbo.Coupons', 'UsedQuantity') IS NULL ALTER TABLE [dbo].[Coupons] ADD [UsedQuantity] INT NOT NULL CONSTRAINT [DF_Coupons_UsedQuantity_Legacy] DEFAULT 0;
IF COL_LENGTH('dbo.Coupons', 'ClaimedQuantity') IS NULL ALTER TABLE [dbo].[Coupons] ADD [ClaimedQuantity] INT NOT NULL CONSTRAINT [DF_Coupons_ClaimedQuantity_Legacy] DEFAULT 0;
IF COL_LENGTH('dbo.Coupons', 'PerUserLimit') IS NULL ALTER TABLE [dbo].[Coupons] ADD [PerUserLimit] INT NOT NULL CONSTRAINT [DF_Coupons_PerUserLimit_Legacy] DEFAULT 1;
IF COL_LENGTH('dbo.Coupons', 'IsPublic') IS NULL ALTER TABLE [dbo].[Coupons] ADD [IsPublic] BIT NOT NULL CONSTRAINT [DF_Coupons_IsPublic_Legacy] DEFAULT 1;
IF COL_LENGTH('dbo.Coupons', 'IsAutoClaimable') IS NULL ALTER TABLE [dbo].[Coupons] ADD [IsAutoClaimable] BIT NOT NULL CONSTRAINT [DF_Coupons_IsAutoClaimable_Legacy] DEFAULT 1;
IF COL_LENGTH('dbo.Coupons', 'IsStackable') IS NULL ALTER TABLE [dbo].[Coupons] ADD [IsStackable] BIT NOT NULL CONSTRAINT [DF_Coupons_IsStackable_Legacy] DEFAULT 0;
IF COL_LENGTH('dbo.Coupons', 'CreatedAt') IS NULL ALTER TABLE [dbo].[Coupons] ADD [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [DF_Coupons_CreatedAt_Legacy] DEFAULT SYSUTCDATETIME();
IF COL_LENGTH('dbo.Coupons', 'UpdatedAt') IS NULL ALTER TABLE [dbo].[Coupons] ADD [UpdatedAt] DATETIME2 NULL;
IF COL_LENGTH('dbo.Coupons', 'CreatedByUserId') IS NULL ALTER TABLE [dbo].[Coupons] ADD [CreatedByUserId] UNIQUEIDENTIFIER NULL;
GO

UPDATE [dbo].[Coupons]
SET
    [Name] = COALESCE(NULLIF([Name], N''), [Code], N'Coupon'),
    [IsActive] = COALESCE([IsActive], 1),
    [IsPublic] = COALESCE([IsPublic], 1),
    [IsAutoClaimable] = COALESCE([IsAutoClaimable], 1),
    [UpdatedAt] = SYSUTCDATETIME()
WHERE [Code] IS NOT NULL;
GO

IF COL_LENGTH('dbo.Coupons', 'Discount') IS NOT NULL
BEGIN
    EXEC(N'UPDATE [dbo].[Coupons] SET [DiscountValue] = COALESCE([Discount], [DiscountValue]) WHERE [Code] IS NOT NULL;');
END

IF COL_LENGTH('dbo.Coupons', 'ExpiredAt') IS NOT NULL
BEGIN
    EXEC(N'UPDATE [dbo].[Coupons] SET [EndAt] = COALESCE([ExpiredAt], [EndAt]) WHERE [Code] IS NOT NULL;');
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Coupons_Code' AND object_id = OBJECT_ID(N'[dbo].[Coupons]'))
BEGIN
    CREATE UNIQUE INDEX [IX_Coupons_Code] ON [dbo].[Coupons]([Code]);
END
GO

IF OBJECT_ID(N'[dbo].[CouponScopes]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[CouponScopes] (
        [Id] INT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_CouponScopes] PRIMARY KEY,
        [CouponId] INT NOT NULL,
        [ScopeType] NVARCHAR(40) NOT NULL,
        [ProductId] INT NULL,
        [CategoryId] INT NULL,
        [Brand] NVARCHAR(120) NULL,
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [DF_CouponScopes_CreatedAt] DEFAULT SYSUTCDATETIME(),
        CONSTRAINT [FK_CouponScopes_Coupons_CouponId] FOREIGN KEY ([CouponId]) REFERENCES [dbo].[Coupons]([Id]) ON DELETE CASCADE
    );
END
GO

IF COL_LENGTH('dbo.CouponScopes', 'ProductId') IS NULL ALTER TABLE [dbo].[CouponScopes] ADD [ProductId] INT NULL;
IF COL_LENGTH('dbo.CouponScopes', 'CategoryId') IS NULL ALTER TABLE [dbo].[CouponScopes] ADD [CategoryId] INT NULL;
IF COL_LENGTH('dbo.CouponScopes', 'Brand') IS NULL ALTER TABLE [dbo].[CouponScopes] ADD [Brand] NVARCHAR(120) NULL;
IF COL_LENGTH('dbo.CouponScopes', 'ScopeValue') IS NOT NULL
BEGIN
    EXEC(N'UPDATE [dbo].[CouponScopes]
        SET [CategoryId] = TRY_CONVERT(INT, [ScopeValue])
        WHERE [CategoryId] IS NULL AND [ScopeType] = N''Category'';');
END
GO

IF OBJECT_ID(N'[dbo].[UserCoupons]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[UserCoupons] (
        [Id] INT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_UserCoupons] PRIMARY KEY,
        [UserId] UNIQUEIDENTIFIER NOT NULL,
        [CouponId] INT NOT NULL,
        [ClaimedAt] DATETIME2 NOT NULL,
        [UsedAt] DATETIME2 NULL,
        [Status] NVARCHAR(40) NOT NULL CONSTRAINT [DF_UserCoupons_Status] DEFAULT N'Claimed',
        [ExpiredAt] DATETIME2 NULL,
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [DF_UserCoupons_CreatedAt] DEFAULT SYSUTCDATETIME(),
        [UpdatedAt] DATETIME2 NULL,
        CONSTRAINT [FK_UserCoupons_Coupons_CouponId] FOREIGN KEY ([CouponId]) REFERENCES [dbo].[Coupons]([Id])
    );
END
GO

IF COL_LENGTH('dbo.UserCoupons', 'ClaimedAt') IS NULL ALTER TABLE [dbo].[UserCoupons] ADD [ClaimedAt] DATETIME2 NOT NULL CONSTRAINT [DF_UserCoupons_ClaimedAt_Legacy] DEFAULT SYSUTCDATETIME();
IF COL_LENGTH('dbo.UserCoupons', 'Status') IS NULL ALTER TABLE [dbo].[UserCoupons] ADD [Status] NVARCHAR(40) NOT NULL CONSTRAINT [DF_UserCoupons_Status_Legacy] DEFAULT N'Claimed';
IF COL_LENGTH('dbo.UserCoupons', 'ExpiredAt') IS NULL ALTER TABLE [dbo].[UserCoupons] ADD [ExpiredAt] DATETIME2 NULL;
IF COL_LENGTH('dbo.UserCoupons', 'UpdatedAt') IS NULL ALTER TABLE [dbo].[UserCoupons] ADD [UpdatedAt] DATETIME2 NULL;
GO

IF OBJECT_ID(N'[dbo].[VoucherSpins]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[VoucherSpins] (
        [Id] INT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_VoucherSpins] PRIMARY KEY,
        [UserId] UNIQUEIDENTIFIER NOT NULL,
        [SpinDate] DATETIME2 NOT NULL,
        [RewardCouponId] INT NULL,
        [RewardCode] NVARCHAR(60) NULL,
        [ResultType] NVARCHAR(40) NOT NULL,
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [DF_VoucherSpins_CreatedAt] DEFAULT SYSUTCDATETIME(),
        CONSTRAINT [FK_VoucherSpins_Coupons_RewardCouponId] FOREIGN KEY ([RewardCouponId]) REFERENCES [dbo].[Coupons]([Id]) ON DELETE SET NULL
    );
END
GO

IF COL_LENGTH('dbo.VoucherSpins', 'RewardCouponId') IS NULL ALTER TABLE [dbo].[VoucherSpins] ADD [RewardCouponId] INT NULL;
IF COL_LENGTH('dbo.VoucherSpins', 'RewardCode') IS NULL ALTER TABLE [dbo].[VoucherSpins] ADD [RewardCode] NVARCHAR(60) NULL;
IF COL_LENGTH('dbo.VoucherSpins', 'ResultType') IS NULL ALTER TABLE [dbo].[VoucherSpins] ADD [ResultType] NVARCHAR(40) NOT NULL CONSTRAINT [DF_VoucherSpins_ResultType_Legacy] DEFAULT N'NoReward';
IF COL_LENGTH('dbo.VoucherSpins', 'CreatedAt') IS NULL ALTER TABLE [dbo].[VoucherSpins] ADD [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [DF_VoucherSpins_CreatedAt_Legacy] DEFAULT SYSUTCDATETIME();
GO

IF COL_LENGTH('dbo.VoucherSpins', 'CouponId') IS NOT NULL
BEGIN
    UPDATE [dbo].[VoucherSpins]
    SET [RewardCouponId] = COALESCE([RewardCouponId], [CouponId])
    WHERE [CouponId] IS NOT NULL;
END
GO

IF OBJECT_ID(N'[dbo].[OrderCoupons]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[OrderCoupons] (
        [Id] INT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_OrderCoupons] PRIMARY KEY,
        [OrderId] INT NOT NULL,
        [CouponId] INT NOT NULL,
        [UserCouponId] INT NULL,
        [CouponCode] NVARCHAR(60) NOT NULL,
        [CouponName] NVARCHAR(200) NOT NULL,
        [CouponType] NVARCHAR(40) NOT NULL,
        [DiscountType] NVARCHAR(40) NOT NULL,
        [DiscountValue] DECIMAL(18,2) NOT NULL,
        [DiscountAmount] DECIMAL(18,2) NOT NULL,
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [DF_OrderCoupons_CreatedAt] DEFAULT SYSUTCDATETIME()
    );
END
GO

IF COL_LENGTH('dbo.OrderCoupons', 'UserCouponId') IS NULL ALTER TABLE [dbo].[OrderCoupons] ADD [UserCouponId] INT NULL;
IF COL_LENGTH('dbo.OrderCoupons', 'CouponCode') IS NULL ALTER TABLE [dbo].[OrderCoupons] ADD [CouponCode] NVARCHAR(60) NOT NULL CONSTRAINT [DF_OrderCoupons_CouponCode_Legacy] DEFAULT N'';
IF COL_LENGTH('dbo.OrderCoupons', 'CouponName') IS NULL ALTER TABLE [dbo].[OrderCoupons] ADD [CouponName] NVARCHAR(200) NOT NULL CONSTRAINT [DF_OrderCoupons_CouponName_Legacy] DEFAULT N'';
IF COL_LENGTH('dbo.OrderCoupons', 'CouponType') IS NULL ALTER TABLE [dbo].[OrderCoupons] ADD [CouponType] NVARCHAR(40) NOT NULL CONSTRAINT [DF_OrderCoupons_CouponType_Legacy] DEFAULT N'Product';
IF COL_LENGTH('dbo.OrderCoupons', 'DiscountType') IS NULL ALTER TABLE [dbo].[OrderCoupons] ADD [DiscountType] NVARCHAR(40) NOT NULL CONSTRAINT [DF_OrderCoupons_DiscountType_Legacy] DEFAULT N'Amount';
IF COL_LENGTH('dbo.OrderCoupons', 'DiscountValue') IS NULL ALTER TABLE [dbo].[OrderCoupons] ADD [DiscountValue] DECIMAL(18,2) NOT NULL CONSTRAINT [DF_OrderCoupons_DiscountValue_Legacy] DEFAULT 0;
GO

UPDATE oc
SET
    [CouponCode] = COALESCE(NULLIF(oc.[CouponCode], N''), c.[Code], N''),
    [CouponName] = COALESCE(NULLIF(oc.[CouponName], N''), c.[Name], c.[Code], N''),
    [CouponType] = COALESCE(NULLIF(oc.[CouponType], N''), c.[Type], N'Product'),
    [DiscountType] = COALESCE(NULLIF(oc.[DiscountType], N''), c.[DiscountType], N'Amount'),
    [DiscountValue] = CASE WHEN oc.[DiscountValue] = 0 THEN COALESCE(c.[DiscountValue], oc.[DiscountAmount], 0) ELSE oc.[DiscountValue] END
FROM [dbo].[OrderCoupons] oc
LEFT JOIN [dbo].[Coupons] c ON c.[Id] = oc.[CouponId];
GO

UPDATE [dbo].[Coupons]
SET
    [Code] = COALESCE([Code], CONCAT(N'COUPON-', [Id])),
    [IsActive] = COALESCE([IsActive], 1)
WHERE [Code] IS NULL OR [IsActive] IS NULL;
GO

UPDATE [dbo].[CouponScopes]
SET
    [ScopeType] = COALESCE([ScopeType], N'All'),
    [CreatedAt] = COALESCE([CreatedAt], SYSUTCDATETIME())
WHERE [ScopeType] IS NULL OR [CreatedAt] IS NULL;
GO

IF COL_LENGTH('dbo.UserCoupons', 'IsUsed') IS NOT NULL
BEGIN
    EXEC(N'UPDATE [dbo].[UserCoupons]
        SET
            [ClaimedAt] = COALESCE([ClaimedAt], [CreatedAt], SYSUTCDATETIME()),
            [Status] = COALESCE([Status], CASE WHEN [IsUsed] = 1 THEN N''Used'' ELSE N''Claimed'' END),
            [CreatedAt] = COALESCE([CreatedAt], SYSUTCDATETIME())
        WHERE [ClaimedAt] IS NULL OR [Status] IS NULL OR [CreatedAt] IS NULL;');
END
ELSE
BEGIN
    UPDATE [dbo].[UserCoupons]
    SET
        [ClaimedAt] = COALESCE([ClaimedAt], [CreatedAt], SYSUTCDATETIME()),
        [Status] = COALESCE([Status], N'Claimed'),
        [CreatedAt] = COALESCE([CreatedAt], SYSUTCDATETIME())
    WHERE [ClaimedAt] IS NULL OR [Status] IS NULL OR [CreatedAt] IS NULL;
END
GO

UPDATE [dbo].[OrderCoupons]
SET
    [DiscountAmount] = COALESCE([DiscountAmount], 0),
    [CreatedAt] = COALESCE([CreatedAt], SYSUTCDATETIME())
WHERE [DiscountAmount] IS NULL OR [CreatedAt] IS NULL;
GO

UPDATE [dbo].[VoucherSpins]
SET
    [SpinDate] = COALESCE([SpinDate], [CreatedAt], SYSUTCDATETIME()),
    [ResultType] = COALESCE([ResultType], CASE WHEN [RewardCouponId] IS NULL THEN N'NoReward' ELSE N'Coupon' END),
    [CreatedAt] = COALESCE([CreatedAt], SYSUTCDATETIME())
WHERE [SpinDate] IS NULL OR [ResultType] IS NULL OR [CreatedAt] IS NULL;
GO

DECLARE @Now DATETIME2 = SYSUTCDATETIME();
DECLARE @Start DATETIME2 = '2026-01-01T00:00:00';
DECLARE @End DATETIME2 = '2026-12-31T23:59:59';

MERGE [dbo].[Coupons] AS target
USING (VALUES
    (N'FREESHIP', N'Mien phi van chuyen', N'Mien phi van chuyen cho don tu 300.000d', N'Shipping', N'FreeShipping', 0.00, NULL, 300000.00, 150),
    (N'GIAM10', N'Giam 10%', N'Giam 10% cho don tu 500.000d', N'Product', N'Percent', 10.00, 100000.00, 500000.00, 100),
    (N'SALE50K', N'Giam 50.000d', N'Giam 50.000d cho don tu 1.000.000d', N'Product', N'Amount', 50000.00, NULL, 1000000.00, 100),
    (N'MUA2GIAM', N'Mua 2 giam them 5%', N'Giam 5% khi gio hang co tu 2 san pham', N'Product', N'Percent', 5.00, 50000.00, 0.00, 80),
    (N'LAPTOP5', N'Giam 5% laptop', N'Giam 5% cho laptop, don tu 3.000.000d', N'Product', N'Percent', 5.00, 200000.00, 3000000.00, 60),
    (N'PHUKIEN20', N'Giam 20% phu kien', N'Giam 20% cho phu kien, don tu 100.000d', N'Product', N'Percent', 20.00, 50000.00, 100000.00, 90),
    (N'SHIP20K', N'Giam 20.000d phi van chuyen', N'Giam 20.000d phi van chuyen cho don tu 200.000d', N'Shipping', N'Amount', 20000.00, NULL, 200000.00, 80),
    (N'FLASH12H', N'Flash voucher 100.000d', N'Giam 100.000d cho don tu 2.000.000d', N'Product', N'Amount', 100000.00, NULL, 2000000.00, 50)
) AS source ([Code], [Name], [Description], [Type], [DiscountType], [DiscountValue], [MaxDiscountAmount], [MinOrderAmount], [TotalQuantity])
ON target.[Code] = source.[Code]
WHEN MATCHED THEN UPDATE SET
    [Name] = source.[Name],
    [Description] = source.[Description],
    [Type] = source.[Type],
    [DiscountType] = source.[DiscountType],
    [DiscountValue] = source.[DiscountValue],
    [MaxDiscountAmount] = source.[MaxDiscountAmount],
    [MinOrderAmount] = source.[MinOrderAmount],
    [TotalQuantity] = source.[TotalQuantity],
    [StartAt] = @Start,
    [EndAt] = @End,
    [IsActive] = 1,
    [IsPublic] = 1,
    [IsAutoClaimable] = 1,
    [UpdatedAt] = @Now
WHEN NOT MATCHED THEN INSERT
    ([Code], [Name], [Description], [Type], [DiscountType], [DiscountValue], [MaxDiscountAmount], [MinOrderAmount], [StartAt], [EndAt], [TotalQuantity], [UsedQuantity], [ClaimedQuantity], [PerUserLimit], [IsActive], [IsPublic], [IsAutoClaimable], [IsStackable], [CreatedAt])
VALUES
    (source.[Code], source.[Name], source.[Description], source.[Type], source.[DiscountType], source.[DiscountValue], source.[MaxDiscountAmount], source.[MinOrderAmount], @Start, @End, source.[TotalQuantity], 0, 0, 1, 1, 1, 1, 0, @Now);
GO

DECLARE @LaptopCouponId INT = (SELECT [Id] FROM [dbo].[Coupons] WHERE [Code] = N'LAPTOP5');
DECLARE @AccessoryCouponId INT = (SELECT [Id] FROM [dbo].[Coupons] WHERE [Code] = N'PHUKIEN20');

IF @LaptopCouponId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [dbo].[CouponScopes] WHERE [CouponId] = @LaptopCouponId)
BEGIN
    INSERT INTO [dbo].[CouponScopes] ([CouponId], [ScopeType], [CategoryId], [CreatedAt])
    SELECT @LaptopCouponId, N'Category', [Id], SYSUTCDATETIME()
    FROM [dbo].[Categories]
    WHERE LOWER([Name]) LIKE N'%laptop%';
END

IF @AccessoryCouponId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [dbo].[CouponScopes] WHERE [CouponId] = @AccessoryCouponId)
BEGIN
    INSERT INTO [dbo].[CouponScopes] ([CouponId], [ScopeType], [CategoryId], [CreatedAt])
    SELECT @AccessoryCouponId, N'Category', [Id], SYSUTCDATETIME()
    FROM [dbo].[Categories]
    WHERE LOWER([Name]) LIKE N'%phu kien%' OR LOWER([Name]) LIKE N'%accessor%';
END
GO

PRINT 'TechStore SQL Server required data synchronized.';
GO
