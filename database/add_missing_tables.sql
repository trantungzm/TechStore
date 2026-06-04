-- ============================================
-- ADD MISSING TABLES TO TECHSTORE DATABASE
-- Tables missing from current database but required by C# models
-- ============================================

USE [techstore];
GO

-- ============================================
-- PRODUCT RECOMMENDATIONS
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ProductRecommendations')
BEGIN
    CREATE TABLE [ProductRecommendations] (
      [Id] INT IDENTITY(1,1) PRIMARY KEY,
      [ProductId] INT NOT NULL,
      [RecommendedProductId] INT NOT NULL,
      [SortOrder] INT DEFAULT 0,
      [CreatedAt] DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY ([ProductId]) REFERENCES [Products]([Id]) ON DELETE CASCADE,
      FOREIGN KEY ([RecommendedProductId]) REFERENCES [Products]([Id]) ON DELETE NO ACTION
    );
END
GO

-- ============================================
-- CATEGORY SUPPLIERS
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CategorySuppliers')
BEGIN
    CREATE TABLE [CategorySuppliers] (
      [Id] INT IDENTITY(1,1) PRIMARY KEY,
      [CategoryId] INT NOT NULL,
      [SupplierId] INT NOT NULL,
      [IsActive] BIT DEFAULT 1,
      [CreatedAt] DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY ([CategoryId]) REFERENCES [Categories]([Id]) ON DELETE CASCADE,
      FOREIGN KEY ([SupplierId]) REFERENCES [Suppliers]([Id]) ON DELETE CASCADE
    );
END
GO

-- ============================================
-- GOODS RECEIPT LINES
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'GoodsReceiptLines')
BEGIN
    CREATE TABLE [GoodsReceiptLines] (
      [Id] INT IDENTITY(1,1) PRIMARY KEY,
      [GoodsReceiptId] INT NOT NULL,
      [ProductId] INT NULL,
      [VariantId] INT NULL,
      [Quantity] INT NOT NULL,
      [UnitCost] DECIMAL(18,2),
      [TotalCost] DECIMAL(18,2),
      [CreatedAt] DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY ([GoodsReceiptId]) REFERENCES [GoodsReceipts]([Id]) ON DELETE CASCADE,
      FOREIGN KEY ([ProductId]) REFERENCES [Products]([Id]),
      FOREIGN KEY ([VariantId]) REFERENCES [ProductVariants]([Id])
    );
END
GO

-- ============================================
-- GOODS RECEIPT SERIALS
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'GoodsReceiptSerials')
BEGIN
    CREATE TABLE [GoodsReceiptSerials] (
      [Id] INT IDENTITY(1,1) PRIMARY KEY,
      [GoodsReceiptLineId] INT NOT NULL,
      [SerialOrImei] NVARCHAR(120) NOT NULL,
      [CreatedAt] DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY ([GoodsReceiptLineId]) REFERENCES [GoodsReceiptLines]([Id]) ON DELETE CASCADE
    );
END
GO

-- ============================================
-- STOCK MOVEMENTS
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'StockMovements')
BEGIN
    CREATE TABLE [StockMovements] (
      [Id] INT IDENTITY(1,1) PRIMARY KEY,
      [StockItemId] INT NOT NULL,
      [MovementType] NVARCHAR(50) NOT NULL,
      [Quantity] INT NOT NULL,
      [ReferenceType] NVARCHAR(50),
      [ReferenceId] INT,
      [Note] NVARCHAR(MAX),
      [CreatedAt] DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY ([StockItemId]) REFERENCES [StockItems]([Id]) ON DELETE NO ACTION
    );
END
GO

-- ============================================
-- INVENTORY RETURNS
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'InventoryReturns')
BEGIN
    CREATE TABLE [InventoryReturns] (
      [Id] INT IDENTITY(1,1) PRIMARY KEY,
      [ReturnCode] NVARCHAR(40) NOT NULL,
      [StockItemId] INT NOT NULL,
      [Reason] NVARCHAR(MAX),
      [Status] NVARCHAR(40) DEFAULT 'Pending',
      [ApprovedBy] NVARCHAR(100),
      [ApprovedAt] DATETIME2,
      [CreatedAt] DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY ([StockItemId]) REFERENCES [StockItems]([Id]) ON DELETE NO ACTION
    );
END
GO

-- ============================================
-- ORDER DETAIL STOCK ITEMS
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'OrderDetailStockItems')
BEGIN
    CREATE TABLE [OrderDetailStockItems] (
      [Id] INT IDENTITY(1,1) PRIMARY KEY,
      [OrderDetailId] INT NOT NULL,
      [StockItemId] INT NOT NULL,
      [CreatedAt] DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY ([OrderDetailId]) REFERENCES [OrderDetails]([Id]) ON DELETE CASCADE,
      FOREIGN KEY ([StockItemId]) REFERENCES [StockItems]([Id]) ON DELETE NO ACTION
    );
END
GO

-- ============================================
-- WARRANTY RECORDS
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WarrantyRecords')
BEGIN
    CREATE TABLE [WarrantyRecords] (
      [Id] INT IDENTITY(1,1) PRIMARY KEY,
      [SerialNumber] NVARCHAR(120) NOT NULL,
      [ProductId] INT,
      [PurchaseDate] DATE,
      [WarrantyStartDate] DATE,
      [WarrantyEndDate] DATE,
      [WarrantyMonths] INT,
      [CustomerId] NVARCHAR(100),
      [CustomerName] NVARCHAR(200),
      [CustomerPhone] NVARCHAR(30),
      [CustomerEmail] NVARCHAR(160),
      [IsActive] BIT DEFAULT 1,
      [CreatedAt] DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY ([ProductId]) REFERENCES [Products]([Id])
    );
END
GO

-- ============================================
-- WARRANTY CLAIMS
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WarrantyClaims')
BEGIN
    CREATE TABLE [WarrantyClaims] (
      [Id] INT IDENTITY(1,1) PRIMARY KEY,
      [ClaimCode] NVARCHAR(40) NOT NULL,
      [WarrantyRecordId] INT NOT NULL,
      [IssueDescription] NVARCHAR(MAX),
      [Status] NVARCHAR(40) DEFAULT 'Pending',
      [ClaimType] NVARCHAR(50),
      [CreatedAt] DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY ([WarrantyRecordId]) REFERENCES [WarrantyRecords]([Id]) ON DELETE NO ACTION
    );
END
GO

-- ============================================
-- WARRANTY CLAIM UPDATES
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WarrantyClaimUpdates')
BEGIN
    CREATE TABLE [WarrantyClaimUpdates] (
      [Id] INT IDENTITY(1,1) PRIMARY KEY,
      [WarrantyClaimId] INT NOT NULL,
      [Status] NVARCHAR(40),
      [Note] NVARCHAR(MAX),
      [CreatedBy] NVARCHAR(100),
      [CreatedAt] DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY ([WarrantyClaimId]) REFERENCES [WarrantyClaims]([Id]) ON DELETE CASCADE
    );
END
GO

-- ============================================
-- REPAIR CASES
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RepairCases')
BEGIN
    CREATE TABLE [RepairCases] (
      [Id] INT IDENTITY(1,1) PRIMARY KEY,
      [CaseCode] NVARCHAR(40) NOT NULL,
      [SerialNumber] NVARCHAR(120),
      [ProductId] INT,
      [IssueDescription] NVARCHAR(MAX),
      [Status] NVARCHAR(40) DEFAULT 'Pending',
      [EstimatedCost] DECIMAL(18,2),
      [ActualCost] DECIMAL(18,2),
      [CustomerName] NVARCHAR(200),
      [CustomerPhone] NVARCHAR(30),
      [CreatedAt] DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY ([ProductId]) REFERENCES [Products]([Id])
    );
END
GO

-- ============================================
-- REPAIR UPDATES
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RepairUpdates')
BEGIN
    CREATE TABLE [RepairUpdates] (
      [Id] INT IDENTITY(1,1) PRIMARY KEY,
      [RepairCaseId] INT NOT NULL,
      [Status] NVARCHAR(40),
      [Note] NVARCHAR(MAX),
      [CreatedBy] NVARCHAR(100),
      [CreatedAt] DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY ([RepairCaseId]) REFERENCES [RepairCases]([Id]) ON DELETE CASCADE
    );
END
GO

-- ============================================
-- SUPPORT TICKETS
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SupportTickets')
BEGIN
    CREATE TABLE [SupportTickets] (
      [Id] INT IDENTITY(1,1) PRIMARY KEY,
      [TicketCode] NVARCHAR(40) NOT NULL,
      [UserId] UNIQUEIDENTIFIER,
      [Subject] NVARCHAR(250) NOT NULL,
      [Description] NVARCHAR(MAX),
      [Status] NVARCHAR(40) DEFAULT 'Open',
      [Priority] NVARCHAR(20) DEFAULT 'Normal',
      [Category] NVARCHAR(50),
      [CreatedAt] DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY ([UserId]) REFERENCES [Users]([Id])
    );
END
GO

-- ============================================
-- SUPPORT TICKET UPDATES
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SupportTicketUpdates')
BEGIN
    CREATE TABLE [SupportTicketUpdates] (
      [Id] INT IDENTITY(1,1) PRIMARY KEY,
      [SupportTicketId] INT NOT NULL,
      [Status] NVARCHAR(40),
      [Note] NVARCHAR(MAX),
      [CreatedBy] NVARCHAR(100),
      [CreatedAt] DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY ([SupportTicketId]) REFERENCES [SupportTickets]([Id]) ON DELETE CASCADE
    );
END
GO

-- ============================================
-- NOTIFICATIONS
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Notifications')
BEGIN
    CREATE TABLE [Notifications] (
      [Id] INT IDENTITY(1,1) PRIMARY KEY,
      [UserId] UNIQUEIDENTIFIER,
      [Title] NVARCHAR(250) NOT NULL,
      [Message] NVARCHAR(MAX),
      [IsRead] BIT DEFAULT 0,
      [Link] NVARCHAR(500),
      [CreatedAt] DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY ([UserId]) REFERENCES [Users]([Id])
    );
END
GO

-- ============================================
-- ATTACHMENTS
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Attachments')
BEGIN
    CREATE TABLE [Attachments] (
      [Id] INT IDENTITY(1,1) PRIMARY KEY,
      [EntityType] NVARCHAR(50),
      [EntityId] INT,
      [FileName] NVARCHAR(250) NOT NULL,
      [FilePath] NVARCHAR(500) NOT NULL,
      [FileSize] BIGINT,
      [MimeType] NVARCHAR(100),
      [UploadedBy] NVARCHAR(100),
      [CreatedAt] DATETIME2 DEFAULT GETDATE()
    );
END
GO

-- ============================================
-- COUPON SCOPES
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CouponScopes')
BEGIN
    CREATE TABLE [CouponScopes] (
      [Id] INT IDENTITY(1,1) PRIMARY KEY,
      [CouponId] INT NOT NULL,
      [ScopeType] NVARCHAR(50),
      [ScopeValue] NVARCHAR(250),
      [CreatedAt] DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY ([CouponId]) REFERENCES [Coupons]([Id]) ON DELETE CASCADE
    );
END
GO

-- ============================================
-- USER COUPONS
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserCoupons')
BEGIN
    CREATE TABLE [UserCoupons] (
      [Id] INT IDENTITY(1,1) PRIMARY KEY,
      [UserId] UNIQUEIDENTIFIER,
      [CouponId] INT NOT NULL,
      [IsUsed] BIT DEFAULT 0,
      [UsedAt] DATETIME2,
      [OrderId] INT,
      [CreatedAt] DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY ([UserId]) REFERENCES [Users]([Id]),
      FOREIGN KEY ([CouponId]) REFERENCES [Coupons]([Id]) ON DELETE CASCADE,
      FOREIGN KEY ([OrderId]) REFERENCES [Orders]([Id])
    );
END
GO

-- ============================================
-- ORDER COUPONS
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'OrderCoupons')
BEGIN
    CREATE TABLE [OrderCoupons] (
      [Id] INT IDENTITY(1,1) PRIMARY KEY,
      [OrderId] INT NOT NULL,
      [CouponId] INT NOT NULL,
      [DiscountAmount] DECIMAL(18,2),
      [CreatedAt] DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY ([OrderId]) REFERENCES [Orders]([Id]) ON DELETE CASCADE,
      FOREIGN KEY ([CouponId]) REFERENCES [Coupons]([Id]) ON DELETE NO ACTION
    );
END
GO

-- ============================================
-- VOUCHER SPINS
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'VoucherSpins')
BEGIN
    CREATE TABLE [VoucherSpins] (
      [Id] INT IDENTITY(1,1) PRIMARY KEY,
      [UserId] UNIQUEIDENTIFIER,
      [CouponId] INT,
      [SpinDate] DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY ([UserId]) REFERENCES [Users]([Id]),
      FOREIGN KEY ([CouponId]) REFERENCES [Coupons]([Id])
    );
END
GO

PRINT 'Missing tables added successfully!';
GO
