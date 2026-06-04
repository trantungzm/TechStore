-- Synchronize supplier and inventory schema for TechStore SQL Server.
-- Run this against SQL Server database [techstore] when supplier/inventory APIs return 500 due to legacy schema drift.

USE [techstore];
GO

DECLARE @Now DATETIME2 = SYSUTCDATETIME();
DECLARE @DefaultProductId INT = (SELECT TOP (1) [Id] FROM [dbo].[Products] ORDER BY [Id]);
DECLARE @DefaultStockItemId INT = (SELECT TOP (1) [Id] FROM [dbo].[StockItems] ORDER BY [Id]);
GO

IF OBJECT_ID(N'[dbo].[Warehouses]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Warehouses] (
        [Id] INT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_Warehouses] PRIMARY KEY,
        [Name] NVARCHAR(160) NOT NULL,
        [Code] NVARCHAR(40) NOT NULL,
        [Address] NVARCHAR(300) NULL,
        [IsActive] BIT NOT NULL CONSTRAINT [DF_Warehouses_IsActive] DEFAULT 1,
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [DF_Warehouses_CreatedAt] DEFAULT SYSUTCDATETIME(),
        [UpdatedAt] DATETIME2 NULL
    );
END
GO

IF COL_LENGTH('dbo.Warehouses', 'UpdatedAt') IS NULL ALTER TABLE [dbo].[Warehouses] ADD [UpdatedAt] DATETIME2 NULL;
UPDATE [dbo].[Warehouses] SET [IsActive] = 1 WHERE [IsActive] IS NULL;
UPDATE [dbo].[Warehouses] SET [CreatedAt] = SYSUTCDATETIME() WHERE [CreatedAt] IS NULL;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Warehouses_Code' AND object_id = OBJECT_ID(N'[dbo].[Warehouses]'))
BEGIN
    CREATE UNIQUE INDEX [IX_Warehouses_Code] ON [dbo].[Warehouses]([Code]);
END
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[Warehouses] WHERE [Code] = N'MAIN')
BEGIN
    INSERT INTO [dbo].[Warehouses] ([Name], [Code], [Address], [IsActive], [CreatedAt])
    VALUES (N'TechStore Main Warehouse', N'MAIN', N'Main warehouse', 1, SYSUTCDATETIME());
END
GO

IF OBJECT_ID(N'[dbo].[Suppliers]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Suppliers] (
        [Id] INT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_Suppliers] PRIMARY KEY,
        [SupplierCode] NVARCHAR(40) NOT NULL,
        [Name] NVARCHAR(200) NOT NULL,
        [Phone] NVARCHAR(30) NULL,
        [Email] NVARCHAR(160) NULL,
        [Address] NVARCHAR(300) NULL,
        [TaxCode] NVARCHAR(40) NULL,
        [ContactPerson] NVARCHAR(160) NULL,
        [SupplierType] NVARCHAR(40) NOT NULL CONSTRAINT [DF_Suppliers_SupplierType] DEFAULT N'AuthorizedDistributor',
        [Note] NVARCHAR(1000) NULL,
        [IsActive] BIT NOT NULL CONSTRAINT [DF_Suppliers_IsActive] DEFAULT 1,
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [DF_Suppliers_CreatedAt] DEFAULT SYSUTCDATETIME(),
        [UpdatedAt] DATETIME2 NULL
    );
END
GO

IF COL_LENGTH('dbo.Suppliers', 'SupplierCode') IS NULL ALTER TABLE [dbo].[Suppliers] ADD [SupplierCode] NVARCHAR(40) NULL;
IF COL_LENGTH('dbo.Suppliers', 'Phone') IS NULL ALTER TABLE [dbo].[Suppliers] ADD [Phone] NVARCHAR(30) NULL;
IF COL_LENGTH('dbo.Suppliers', 'Email') IS NULL ALTER TABLE [dbo].[Suppliers] ADD [Email] NVARCHAR(160) NULL;
IF COL_LENGTH('dbo.Suppliers', 'Address') IS NULL ALTER TABLE [dbo].[Suppliers] ADD [Address] NVARCHAR(300) NULL;
IF COL_LENGTH('dbo.Suppliers', 'TaxCode') IS NULL ALTER TABLE [dbo].[Suppliers] ADD [TaxCode] NVARCHAR(40) NULL;
IF COL_LENGTH('dbo.Suppliers', 'ContactPerson') IS NULL ALTER TABLE [dbo].[Suppliers] ADD [ContactPerson] NVARCHAR(160) NULL;
IF COL_LENGTH('dbo.Suppliers', 'SupplierType') IS NULL ALTER TABLE [dbo].[Suppliers] ADD [SupplierType] NVARCHAR(40) NULL;
IF COL_LENGTH('dbo.Suppliers', 'Note') IS NULL ALTER TABLE [dbo].[Suppliers] ADD [Note] NVARCHAR(1000) NULL;
IF COL_LENGTH('dbo.Suppliers', 'IsActive') IS NULL ALTER TABLE [dbo].[Suppliers] ADD [IsActive] BIT NULL;
IF COL_LENGTH('dbo.Suppliers', 'CreatedAt') IS NULL ALTER TABLE [dbo].[Suppliers] ADD [CreatedAt] DATETIME2 NULL;
IF COL_LENGTH('dbo.Suppliers', 'UpdatedAt') IS NULL ALTER TABLE [dbo].[Suppliers] ADD [UpdatedAt] DATETIME2 NULL;
GO

DECLARE @SupplierTypeDefaultConstraint SYSNAME;
SELECT @SupplierTypeDefaultConstraint = dc.[name]
FROM sys.default_constraints dc
JOIN sys.columns c ON c.default_object_id = dc.object_id
WHERE dc.parent_object_id = OBJECT_ID(N'[dbo].[Suppliers]')
  AND c.[name] = N'SupplierType';

IF @SupplierTypeDefaultConstraint IS NOT NULL
BEGIN
    EXEC(N'ALTER TABLE [dbo].[Suppliers] DROP CONSTRAINT [' + @SupplierTypeDefaultConstraint + N']');
END
GO

IF EXISTS (
    SELECT 1
    FROM sys.columns c
    JOIN sys.types t ON t.user_type_id = c.user_type_id
    WHERE c.object_id = OBJECT_ID(N'[dbo].[Suppliers]')
      AND c.name = N'SupplierType'
      AND t.name <> N'nvarchar'
)
BEGIN
    ALTER TABLE [dbo].[Suppliers] ALTER COLUMN [SupplierType] NVARCHAR(40) NULL;
END
GO

UPDATE [dbo].[Suppliers]
SET [SupplierCode] = COALESCE(NULLIF([SupplierCode], N''), CONCAT(N'SUP-', [Id])),
    [Name] = COALESCE(NULLIF([Name], N''), CONCAT(N'Supplier ', [Id])),
    [SupplierType] = CASE
        WHEN [SupplierType] IN (N'0', N'OfficialBrand') THEN N'OfficialBrand'
        WHEN [SupplierType] IN (N'1', N'AuthorizedDistributor') THEN N'AuthorizedDistributor'
        WHEN [SupplierType] IN (N'2', N'Tier1Distributor') THEN N'Tier1Distributor'
        WHEN [SupplierType] IN (N'3', N'WholesalePartner') THEN N'WholesalePartner'
        ELSE N'AuthorizedDistributor'
    END,
    [IsActive] = COALESCE([IsActive], 1),
    [CreatedAt] = COALESCE([CreatedAt], SYSUTCDATETIME());
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[Suppliers] WHERE [SupplierCode] = N'SUP-SYNNEX-FPT')
BEGIN
    INSERT INTO [dbo].[Suppliers] ([SupplierCode], [Name], [SupplierType], [Phone], [Email], [Address], [IsActive], [CreatedAt])
    VALUES (N'SUP-SYNNEX-FPT', N'Synnex FPT', N'AuthorizedDistributor', N'19006600', N'contact@synnexfpt.com', N'Vietnam', 1, SYSUTCDATETIME());
END

IF NOT EXISTS (SELECT 1 FROM [dbo].[Suppliers] WHERE [SupplierCode] = N'SUP-DIGIWORLD')
BEGIN
    INSERT INTO [dbo].[Suppliers] ([SupplierCode], [Name], [SupplierType], [Phone], [Email], [Address], [IsActive], [CreatedAt])
    VALUES (N'SUP-DIGIWORLD', N'Digiworld', N'AuthorizedDistributor', N'02839299959', N'contact@digiworld.com.vn', N'Vietnam', 1, SYSUTCDATETIME());
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Suppliers_SupplierCode' AND object_id = OBJECT_ID(N'[dbo].[Suppliers]'))
BEGIN
    CREATE UNIQUE INDEX [IX_Suppliers_SupplierCode] ON [dbo].[Suppliers]([SupplierCode]);
END
GO

IF OBJECT_ID(N'[dbo].[StockItems]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[StockItems] (
        [Id] INT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_StockItems] PRIMARY KEY,
        [ProductId] INT NOT NULL,
        [VariantId] INT NULL,
        [WarehouseId] INT NULL,
        [SupplierId] INT NULL,
        [SerialOrImei] NVARCHAR(120) NOT NULL,
        [Sku] NVARCHAR(100) NULL,
        [Status] NVARCHAR(40) NOT NULL CONSTRAINT [DF_StockItems_Status] DEFAULT N'InStock',
        [UnitCost] DECIMAL(18,2) NOT NULL CONSTRAINT [DF_StockItems_UnitCost] DEFAULT 0,
        [SupplierName] NVARCHAR(200) NULL,
        [ReceivedAt] DATETIME2 NOT NULL CONSTRAINT [DF_StockItems_ReceivedAt] DEFAULT SYSUTCDATETIME(),
        [SoldAt] DATETIME2 NULL,
        [OrderId] INT NULL,
        [OrderDetailId] INT NULL,
        [CustomerId] UNIQUEIDENTIFIER NULL,
        [Note] NVARCHAR(1000) NULL,
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [DF_StockItems_CreatedAt] DEFAULT SYSUTCDATETIME(),
        [UpdatedAt] DATETIME2 NULL
    );
END
GO

IF COL_LENGTH('dbo.StockItems', 'WarehouseId') IS NULL ALTER TABLE [dbo].[StockItems] ADD [WarehouseId] INT NULL;
IF COL_LENGTH('dbo.StockItems', 'SupplierId') IS NULL ALTER TABLE [dbo].[StockItems] ADD [SupplierId] INT NULL;
IF COL_LENGTH('dbo.StockItems', 'ReceivedAt') IS NULL ALTER TABLE [dbo].[StockItems] ADD [ReceivedAt] DATETIME2 NULL;
IF COL_LENGTH('dbo.StockItems', 'SoldAt') IS NULL ALTER TABLE [dbo].[StockItems] ADD [SoldAt] DATETIME2 NULL;
IF COL_LENGTH('dbo.StockItems', 'CustomerId') IS NULL ALTER TABLE [dbo].[StockItems] ADD [CustomerId] UNIQUEIDENTIFIER NULL;
IF COL_LENGTH('dbo.StockItems', 'UpdatedAt') IS NULL ALTER TABLE [dbo].[StockItems] ADD [UpdatedAt] DATETIME2 NULL;
GO

DECLARE @DefaultProductId INT = (SELECT TOP (1) [Id] FROM [dbo].[Products] ORDER BY [Id]);
UPDATE [dbo].[StockItems]
SET [ProductId] = COALESCE([ProductId], @DefaultProductId),
    [SerialOrImei] = COALESCE(NULLIF([SerialOrImei], N''), CONCAT(N'STOCK-', [Id])),
    [Status] = COALESCE(NULLIF([Status], N''), N'InStock'),
    [UnitCost] = COALESCE([UnitCost], 0),
    [ReceivedAt] = COALESCE([ReceivedAt], [CreatedAt], SYSUTCDATETIME()),
    [CreatedAt] = COALESCE([CreatedAt], SYSUTCDATETIME())
WHERE @DefaultProductId IS NOT NULL;
GO

IF OBJECT_ID(N'[dbo].[GoodsReceipts]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[GoodsReceipts] (
        [Id] INT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_GoodsReceipts] PRIMARY KEY,
        [ReceiptCode] NVARCHAR(40) NOT NULL,
        [SupplierId] INT NULL,
        [SupplierName] NVARCHAR(200) NOT NULL,
        [WarehouseId] INT NULL,
        [ReceivedAt] DATETIME2 NOT NULL CONSTRAINT [DF_GoodsReceipts_ReceivedAt] DEFAULT SYSUTCDATETIME(),
        [CreatedByUserId] UNIQUEIDENTIFIER NULL,
        [Note] NVARCHAR(1000) NULL,
        [TotalQuantity] INT NOT NULL CONSTRAINT [DF_GoodsReceipts_TotalQuantity] DEFAULT 0,
        [TotalCost] DECIMAL(18,2) NOT NULL CONSTRAINT [DF_GoodsReceipts_TotalCost] DEFAULT 0,
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [DF_GoodsReceipts_CreatedAt] DEFAULT SYSUTCDATETIME(),
        [UpdatedAt] DATETIME2 NULL
    );
END
GO

IF COL_LENGTH('dbo.GoodsReceipts', 'ReceivedAt') IS NULL ALTER TABLE [dbo].[GoodsReceipts] ADD [ReceivedAt] DATETIME2 NULL;
IF COL_LENGTH('dbo.GoodsReceipts', 'CreatedByUserId') IS NULL ALTER TABLE [dbo].[GoodsReceipts] ADD [CreatedByUserId] UNIQUEIDENTIFIER NULL;
IF COL_LENGTH('dbo.GoodsReceipts', 'TotalQuantity') IS NULL ALTER TABLE [dbo].[GoodsReceipts] ADD [TotalQuantity] INT NULL;
IF COL_LENGTH('dbo.GoodsReceipts', 'UpdatedAt') IS NULL ALTER TABLE [dbo].[GoodsReceipts] ADD [UpdatedAt] DATETIME2 NULL;
GO

UPDATE [dbo].[GoodsReceipts]
SET [ReceiptCode] = COALESCE(NULLIF([ReceiptCode], N''), CONCAT(N'GR-', [Id])),
    [SupplierName] = COALESCE(NULLIF([SupplierName], N''), N'Unknown supplier'),
    [ReceivedAt] = COALESCE([ReceivedAt], [CreatedAt], SYSUTCDATETIME()),
    [TotalQuantity] = COALESCE([TotalQuantity], 0),
    [TotalCost] = COALESCE([TotalCost], 0),
    [CreatedAt] = COALESCE([CreatedAt], SYSUTCDATETIME());
GO

IF OBJECT_ID(N'[dbo].[GoodsReceiptLines]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[GoodsReceiptLines] (
        [Id] INT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_GoodsReceiptLines] PRIMARY KEY,
        [GoodsReceiptId] INT NOT NULL,
        [ProductId] INT NOT NULL,
        [VariantId] INT NULL,
        [Quantity] INT NOT NULL,
        [UnitCost] DECIMAL(18,2) NOT NULL CONSTRAINT [DF_GoodsReceiptLines_UnitCost] DEFAULT 0,
        [TotalCost] DECIMAL(18,2) NOT NULL CONSTRAINT [DF_GoodsReceiptLines_TotalCost] DEFAULT 0,
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [DF_GoodsReceiptLines_CreatedAt] DEFAULT SYSUTCDATETIME()
    );
END
GO

DECLARE @DefaultProductId INT = (SELECT TOP (1) [Id] FROM [dbo].[Products] ORDER BY [Id]);
UPDATE [dbo].[GoodsReceiptLines]
SET [ProductId] = COALESCE([ProductId], @DefaultProductId),
    [Quantity] = COALESCE([Quantity], 0),
    [UnitCost] = COALESCE([UnitCost], 0),
    [TotalCost] = COALESCE([TotalCost], COALESCE([Quantity], 0) * COALESCE([UnitCost], 0)),
    [CreatedAt] = COALESCE([CreatedAt], SYSUTCDATETIME())
WHERE @DefaultProductId IS NOT NULL;
GO

IF OBJECT_ID(N'[dbo].[GoodsReceiptSerials]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[GoodsReceiptSerials] (
        [Id] INT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_GoodsReceiptSerials] PRIMARY KEY,
        [GoodsReceiptLineId] INT NOT NULL,
        [StockItemId] INT NOT NULL,
        [SerialOrImei] NVARCHAR(120) NOT NULL,
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [DF_GoodsReceiptSerials_CreatedAt] DEFAULT SYSUTCDATETIME()
    );
END
GO

IF COL_LENGTH('dbo.GoodsReceiptSerials', 'StockItemId') IS NULL ALTER TABLE [dbo].[GoodsReceiptSerials] ADD [StockItemId] INT NULL;
GO

DECLARE @DefaultStockItemId INT = (SELECT TOP (1) [Id] FROM [dbo].[StockItems] ORDER BY [Id]);
UPDATE grs
SET [StockItemId] = COALESCE(grs.[StockItemId], si.[Id], @DefaultStockItemId),
    [SerialOrImei] = COALESCE(NULLIF(grs.[SerialOrImei], N''), CONCAT(N'GRS-', grs.[Id])),
    [CreatedAt] = COALESCE(grs.[CreatedAt], SYSUTCDATETIME())
FROM [dbo].[GoodsReceiptSerials] grs
LEFT JOIN [dbo].[StockItems] si ON si.[SerialOrImei] = grs.[SerialOrImei]
WHERE @DefaultStockItemId IS NOT NULL;
GO

IF OBJECT_ID(N'[dbo].[StockMovements]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[StockMovements] (
        [Id] INT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_StockMovements] PRIMARY KEY,
        [ProductId] INT NOT NULL,
        [VariantId] INT NULL,
        [StockItemId] INT NULL,
        [WarehouseId] INT NULL,
        [Type] NVARCHAR(40) NOT NULL,
        [Quantity] INT NOT NULL,
        [FromStatus] NVARCHAR(40) NULL,
        [ToStatus] NVARCHAR(40) NULL,
        [ReferenceType] NVARCHAR(40) NOT NULL,
        [ReferenceId] INT NULL,
        [Note] NVARCHAR(1000) NULL,
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [DF_StockMovements_CreatedAt] DEFAULT SYSUTCDATETIME(),
        [CreatedByUserId] UNIQUEIDENTIFIER NULL
    );
END
GO

IF COL_LENGTH('dbo.StockMovements', 'ProductId') IS NULL ALTER TABLE [dbo].[StockMovements] ADD [ProductId] INT NULL;
IF COL_LENGTH('dbo.StockMovements', 'VariantId') IS NULL ALTER TABLE [dbo].[StockMovements] ADD [VariantId] INT NULL;
IF COL_LENGTH('dbo.StockMovements', 'WarehouseId') IS NULL ALTER TABLE [dbo].[StockMovements] ADD [WarehouseId] INT NULL;
IF COL_LENGTH('dbo.StockMovements', 'Type') IS NULL ALTER TABLE [dbo].[StockMovements] ADD [Type] NVARCHAR(40) NULL;
IF COL_LENGTH('dbo.StockMovements', 'FromStatus') IS NULL ALTER TABLE [dbo].[StockMovements] ADD [FromStatus] NVARCHAR(40) NULL;
IF COL_LENGTH('dbo.StockMovements', 'ToStatus') IS NULL ALTER TABLE [dbo].[StockMovements] ADD [ToStatus] NVARCHAR(40) NULL;
IF COL_LENGTH('dbo.StockMovements', 'CreatedByUserId') IS NULL ALTER TABLE [dbo].[StockMovements] ADD [CreatedByUserId] UNIQUEIDENTIFIER NULL;
GO

IF COL_LENGTH('dbo.StockMovements', 'MovementType') IS NOT NULL
BEGIN
    EXEC(N'
        UPDATE [dbo].[StockMovements]
        SET [Type] = COALESCE(NULLIF([Type], N''''), NULLIF([MovementType], N''''))
        WHERE [Type] IS NULL OR [Type] = N'''';
    ');
END
GO

DECLARE @DefaultProductId INT = (SELECT TOP (1) [Id] FROM [dbo].[Products] ORDER BY [Id]);
UPDATE sm
SET [ProductId] = COALESCE(sm.[ProductId], si.[ProductId], @DefaultProductId),
    [VariantId] = COALESCE(sm.[VariantId], si.[VariantId]),
    [WarehouseId] = COALESCE(sm.[WarehouseId], si.[WarehouseId]),
    [Type] = COALESCE(NULLIF(sm.[Type], N''), N'Adjustment'),
    [Quantity] = COALESCE(sm.[Quantity], 0),
    [ReferenceType] = COALESCE(NULLIF(sm.[ReferenceType], N''), N'Manual'),
    [CreatedAt] = COALESCE(sm.[CreatedAt], SYSUTCDATETIME())
FROM [dbo].[StockMovements] sm
LEFT JOIN [dbo].[StockItems] si ON si.[Id] = sm.[StockItemId]
WHERE @DefaultProductId IS NOT NULL;
GO

IF OBJECT_ID(N'[dbo].[InventoryReturns]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[InventoryReturns] (
        [Id] INT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_InventoryReturns] PRIMARY KEY,
        [ReturnCode] NVARCHAR(40) NOT NULL,
        [OrderId] INT NULL,
        [OrderDetailId] INT NULL,
        [ProductId] INT NOT NULL,
        [VariantId] INT NULL,
        [StockItemId] INT NULL,
        [SerialOrImei] NVARCHAR(120) NULL,
        [CustomerName] NVARCHAR(160) NULL,
        [CustomerPhone] NVARCHAR(30) NULL,
        [Reason] NVARCHAR(1000) NOT NULL,
        [Condition] NVARCHAR(40) NOT NULL CONSTRAINT [DF_InventoryReturns_Condition] DEFAULT N'Used',
        [Status] NVARCHAR(40) NOT NULL CONSTRAINT [DF_InventoryReturns_Status] DEFAULT N'Pending',
        [RefundAmount] DECIMAL(18,2) NOT NULL CONSTRAINT [DF_InventoryReturns_RefundAmount] DEFAULT 0,
        [Note] NVARCHAR(1000) NULL,
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [DF_InventoryReturns_CreatedAt] DEFAULT SYSUTCDATETIME(),
        [UpdatedAt] DATETIME2 NULL,
        [CreatedByUserId] UNIQUEIDENTIFIER NULL,
        [ReviewedByUserId] UNIQUEIDENTIFIER NULL,
        [ReviewNote] NVARCHAR(1000) NULL
    );
END
GO

IF COL_LENGTH('dbo.InventoryReturns', 'OrderId') IS NULL ALTER TABLE [dbo].[InventoryReturns] ADD [OrderId] INT NULL;
IF COL_LENGTH('dbo.InventoryReturns', 'OrderDetailId') IS NULL ALTER TABLE [dbo].[InventoryReturns] ADD [OrderDetailId] INT NULL;
IF COL_LENGTH('dbo.InventoryReturns', 'ProductId') IS NULL ALTER TABLE [dbo].[InventoryReturns] ADD [ProductId] INT NULL;
IF COL_LENGTH('dbo.InventoryReturns', 'VariantId') IS NULL ALTER TABLE [dbo].[InventoryReturns] ADD [VariantId] INT NULL;
IF COL_LENGTH('dbo.InventoryReturns', 'SerialOrImei') IS NULL ALTER TABLE [dbo].[InventoryReturns] ADD [SerialOrImei] NVARCHAR(120) NULL;
IF COL_LENGTH('dbo.InventoryReturns', 'CustomerName') IS NULL ALTER TABLE [dbo].[InventoryReturns] ADD [CustomerName] NVARCHAR(160) NULL;
IF COL_LENGTH('dbo.InventoryReturns', 'CustomerPhone') IS NULL ALTER TABLE [dbo].[InventoryReturns] ADD [CustomerPhone] NVARCHAR(30) NULL;
IF COL_LENGTH('dbo.InventoryReturns', 'Condition') IS NULL ALTER TABLE [dbo].[InventoryReturns] ADD [Condition] NVARCHAR(40) NULL;
IF COL_LENGTH('dbo.InventoryReturns', 'RefundAmount') IS NULL ALTER TABLE [dbo].[InventoryReturns] ADD [RefundAmount] DECIMAL(18,2) NULL;
IF COL_LENGTH('dbo.InventoryReturns', 'Note') IS NULL ALTER TABLE [dbo].[InventoryReturns] ADD [Note] NVARCHAR(1000) NULL;
IF COL_LENGTH('dbo.InventoryReturns', 'UpdatedAt') IS NULL ALTER TABLE [dbo].[InventoryReturns] ADD [UpdatedAt] DATETIME2 NULL;
IF COL_LENGTH('dbo.InventoryReturns', 'CreatedByUserId') IS NULL ALTER TABLE [dbo].[InventoryReturns] ADD [CreatedByUserId] UNIQUEIDENTIFIER NULL;
IF COL_LENGTH('dbo.InventoryReturns', 'ReviewedByUserId') IS NULL ALTER TABLE [dbo].[InventoryReturns] ADD [ReviewedByUserId] UNIQUEIDENTIFIER NULL;
IF COL_LENGTH('dbo.InventoryReturns', 'ReviewNote') IS NULL ALTER TABLE [dbo].[InventoryReturns] ADD [ReviewNote] NVARCHAR(1000) NULL;
GO

DECLARE @DefaultProductId INT = (SELECT TOP (1) [Id] FROM [dbo].[Products] ORDER BY [Id]);
UPDATE ir
SET [ReturnCode] = COALESCE(NULLIF(ir.[ReturnCode], N''), CONCAT(N'RT-', ir.[Id])),
    [ProductId] = COALESCE(ir.[ProductId], si.[ProductId], @DefaultProductId),
    [VariantId] = COALESCE(ir.[VariantId], si.[VariantId]),
    [SerialOrImei] = COALESCE(ir.[SerialOrImei], si.[SerialOrImei]),
    [Reason] = COALESCE(NULLIF(ir.[Reason], N''), N'Inventory return'),
    [Condition] = COALESCE(NULLIF(ir.[Condition], N''), N'Used'),
    [Status] = COALESCE(NULLIF(ir.[Status], N''), N'Pending'),
    [RefundAmount] = COALESCE(ir.[RefundAmount], 0),
    [CreatedAt] = COALESCE(ir.[CreatedAt], SYSUTCDATETIME())
FROM [dbo].[InventoryReturns] ir
LEFT JOIN [dbo].[StockItems] si ON si.[Id] = ir.[StockItemId]
WHERE @DefaultProductId IS NOT NULL;
GO

IF OBJECT_ID(N'[dbo].[OrderDetailStockItems]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[OrderDetailStockItems] (
        [Id] INT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_OrderDetailStockItems] PRIMARY KEY,
        [OrderDetailId] INT NOT NULL,
        [StockItemId] INT NOT NULL,
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [DF_OrderDetailStockItems_CreatedAt] DEFAULT SYSUTCDATETIME()
    );
END
GO

UPDATE [dbo].[OrderDetailStockItems] SET [CreatedAt] = SYSUTCDATETIME() WHERE [CreatedAt] IS NULL;
GO

PRINT 'TechStore supplier and inventory schema synchronized.';
GO
