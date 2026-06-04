-- ============================================
-- DATABASE SCHEMA FOR TECHSTORE PROJECT
-- SQL Server Compatible - Matching C# Entity Models
-- Server: DESKTOP-40OLD03\SQLEXPRESS
-- Database: techstore
-- ============================================

USE [techstore];
GO

-- ============================================
-- ROLES
-- ============================================
CREATE TABLE [Roles] (
  [Id] NVARCHAR(24) PRIMARY KEY,
  [Guid] UNIQUEIDENTIFIER NOT NULL,
  [Name] NVARCHAR(50) NOT NULL,
  [Description] NVARCHAR(250),
  [CreatedBy] NVARCHAR(100),
  [Created] DATETIME2 NOT NULL,
  [ModifiedBy] NVARCHAR(100),
  [Modified] DATETIME2,
  [CreatedUser] NVARCHAR(100),
  [CreatedDateTime] DATETIME2,
  [IsDeleted] BIT DEFAULT 0,
  [IsActive] BIT DEFAULT 1,
  [RoleType] INT DEFAULT 0
);
GO

CREATE UNIQUE INDEX [IX_Roles_Name] ON [Roles]([Name]);
GO

-- ============================================
-- USERS
-- ============================================
CREATE TABLE [Users] (
  [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  [Name] NVARCHAR(100),
  [UserName] NVARCHAR(50) NOT NULL,
  [Password] NVARCHAR(255) NOT NULL,
  [Email] NVARCHAR(100),
  [Phone] NVARCHAR(20),
  [DateOfBirth] DATE,
  [UserType] INT DEFAULT 0,
  [Created] DATETIME2 DEFAULT GETDATE()
);
GO

CREATE UNIQUE INDEX [IX_Users_UserName] ON [Users]([UserName]);
GO

-- ============================================
-- STORE SETTINGS
-- ============================================
CREATE TABLE [StoreSettings] (
  [Id] INT IDENTITY(1,1) PRIMARY KEY,
  [StoreName] NVARCHAR(200),
  [Hotline] NVARCHAR(20),
  [SupportEmail] NVARCHAR(100),
  [Address] NVARCHAR(500),
  [WarrantyAddress] NVARCHAR(500),
  [DefaultShippingFee] DECIMAL(18,2),
  [FreeShippingThreshold] DECIMAL(18,2),
  [SupportTime] NVARCHAR(200),
  [LogoUrl] NVARCHAR(500),
  [FacebookUrl] NVARCHAR(500),
  [ZaloUrl] NVARCHAR(500),
  [CreatedAt] DATETIME2 DEFAULT GETDATE(),
  [UpdatedAt] DATETIME2 DEFAULT GETDATE()
);
GO

-- ============================================
-- CATEGORIES
-- ============================================
CREATE TABLE [Categories] (
  [Id] INT IDENTITY(1,1) PRIMARY KEY,
  [Name] NVARCHAR(100),
  [Description] NVARCHAR(500)
);
GO

-- ============================================
-- SUPPLIERS
-- ============================================
CREATE TABLE [Suppliers] (
  [Id] INT IDENTITY(1,1) PRIMARY KEY,
  [SupplierCode] NVARCHAR(40) NOT NULL,
  [Name] NVARCHAR(200) NOT NULL,
  [Phone] NVARCHAR(30),
  [Email] NVARCHAR(160),
  [Address] NVARCHAR(300),
  [TaxCode] NVARCHAR(40),
  [ContactPerson] NVARCHAR(160),
  [SupplierType] INT DEFAULT 1,
  [Note] NVARCHAR(MAX),
  [IsActive] BIT DEFAULT 1,
  [CreatedAt] DATETIME2 DEFAULT GETDATE(),
  [UpdatedAt] DATETIME2
);
GO

-- ============================================
-- PRODUCTS
-- ============================================
CREATE TABLE [Products] (
  [Id] INT IDENTITY(1,1) PRIMARY KEY,
  [Name] NVARCHAR(200) NOT NULL,
  [Slug] NVARCHAR(220),
  [Sku] NVARCHAR(80),
  [Price] DECIMAL(18,2) NOT NULL,
  [OriginalPrice] DECIMAL(18,2),
  [Description] NVARCHAR(MAX),
  [LongDescription] NVARCHAR(MAX),
  [Brand] NVARCHAR(120),
  [CategoryId] INT,
  [Stock] INT DEFAULT 0,
  [ImageUrl] NVARCHAR(500),
  [SupplierId] INT NULL,
  [BackupSupplierId] INT NULL,
  [SupplyType] NVARCHAR(80),
  [WarrantyProvider] NVARCHAR(160),
  [IsActive] BIT DEFAULT 1,
  [IsFeatured] BIT DEFAULT 0,
  [IsBestSeller] BIT DEFAULT 0,
  [IsNewArrival] BIT DEFAULT 0,
  [IsDiscounted] BIT DEFAULT 0,
  [RequiresSerialTracking] BIT DEFAULT 0,
  [WarrantyMonths] INT DEFAULT 12,
  [CreatedAt] DATETIME2 DEFAULT GETDATE(),
  [UpdatedAt] DATETIME2,
  FOREIGN KEY ([CategoryId]) REFERENCES [Categories]([Id]),
  FOREIGN KEY ([SupplierId]) REFERENCES [Suppliers]([Id]),
  FOREIGN KEY ([BackupSupplierId]) REFERENCES [Suppliers]([Id])
);
GO

-- ============================================
-- PRODUCT IMAGES
-- ============================================
CREATE TABLE [ProductImages] (
  [Id] INT IDENTITY(1,1) PRIMARY KEY,
  [ProductId] INT NOT NULL,
  [ImageUrl] NVARCHAR(500) NOT NULL,
  [AltText] NVARCHAR(250),
  [SortOrder] INT DEFAULT 0,
  [IsPrimary] BIT DEFAULT 0,
  FOREIGN KEY ([ProductId]) REFERENCES [Products]([Id]) ON DELETE CASCADE
);
GO

-- ============================================
-- PRODUCT VARIANTS
-- ============================================
CREATE TABLE [ProductVariants] (
  [Id] INT IDENTITY(1,1) PRIMARY KEY,
  [ProductId] INT NOT NULL,
  [VariantName] NVARCHAR(160),
  [ColorName] NVARCHAR(80),
  [ColorCode] NVARCHAR(32),
  [Storage] NVARCHAR(80),
  [Ram] NVARCHAR(80),
  [Price] DECIMAL(18,2),
  [OriginalPrice] DECIMAL(18,2),
  [Sku] NVARCHAR(80),
  [ImageUrl] NVARCHAR(500),
  [Stock] INT DEFAULT 0,
  [IsActive] BIT DEFAULT 1,
  FOREIGN KEY ([ProductId]) REFERENCES [Products]([Id]) ON DELETE CASCADE
);
GO

-- ============================================
-- SPEC DEFINITIONS
-- ============================================
CREATE TABLE [SpecDefinitions] (
  [Id] INT IDENTITY(1,1) PRIMARY KEY,
  [CategoryId] INT,
  [Name] NVARCHAR(160) NOT NULL,
  [Code] NVARCHAR(100) NOT NULL,
  [DataType] NVARCHAR(30) DEFAULT 'text',
  [InputType] NVARCHAR(30) DEFAULT 'text',
  [Unit] NVARCHAR(40),
  [AllowCustomValue] BIT DEFAULT 1,
  [IsComparable] BIT DEFAULT 0,
  [IsFilterable] BIT DEFAULT 0,
  [SortOrder] INT DEFAULT 0,
  [IsActive] BIT DEFAULT 1,
  [CreatedAt] DATETIME2 DEFAULT GETDATE(),
  [UpdatedAt] DATETIME2,
  FOREIGN KEY ([CategoryId]) REFERENCES [Categories]([Id]) ON DELETE CASCADE
);
GO

-- ============================================
-- SPEC OPTIONS
-- ============================================
CREATE TABLE [SpecOptions] (
  [Id] INT IDENTITY(1,1) PRIMARY KEY,
  [SpecDefinitionId] INT NOT NULL,
  [Value] NVARCHAR(250) NOT NULL,
  [DisplayOrder] INT DEFAULT 0,
  [IsActive] BIT DEFAULT 1,
  [CreatedAt] DATETIME2 DEFAULT GETDATE(),
  [UpdatedAt] DATETIME2,
  FOREIGN KEY ([SpecDefinitionId]) REFERENCES [SpecDefinitions]([Id]) ON DELETE CASCADE
);
GO

-- ============================================
-- PRODUCT SPEC VALUES
-- ============================================
CREATE TABLE [ProductSpecValues] (
  [Id] INT IDENTITY(1,1) PRIMARY KEY,
  [ProductId] INT NOT NULL,
  [SpecDefinitionId] INT NOT NULL,
  [SpecOptionId] INT NULL,
  [ValueText] NVARCHAR(2000),
  [ValueNumber] DECIMAL(18,4),
  [ValueBool] BIT,
  [CreatedAt] DATETIME2 DEFAULT GETDATE(),
  [UpdatedAt] DATETIME2,
  FOREIGN KEY ([ProductId]) REFERENCES [Products]([Id]) ON DELETE CASCADE,
  FOREIGN KEY ([SpecDefinitionId]) REFERENCES [SpecDefinitions]([Id]) ON DELETE CASCADE,
  FOREIGN KEY ([SpecOptionId]) REFERENCES [SpecOptions]([Id]) ON DELETE NO ACTION
);
GO

-- ============================================
-- ORDERS
-- ============================================
CREATE TABLE [Orders] (
  [Id] INT IDENTITY(1,1) PRIMARY KEY,
  [OrderCode] NVARCHAR(40) UNIQUE,
  [UserId] UNIQUEIDENTIFIER,
  [CustomerName] NVARCHAR(160),
  [CustomerPhone] NVARCHAR(30),
  [CustomerEmail] NVARCHAR(160),
  [Subtotal] DECIMAL(18,2),
  [ProductDiscount] DECIMAL(18,2),
  [ShippingFee] DECIMAL(18,2),
  [ShippingDiscount] DECIMAL(18,2),
  [TotalAmount] DECIMAL(18,2),
  [Status] NVARCHAR(40) DEFAULT 'Pending',
  [PaymentMethod] NVARCHAR(40),
  [PaymentStatus] NVARCHAR(40) DEFAULT 'Unpaid',
  [TransactionId] NVARCHAR(120),
  [ShippingMethod] NVARCHAR(40),
  [ShippingAddress] NVARCHAR(500),
  [Province] NVARCHAR(120),
  [District] NVARCHAR(120),
  [Ward] NVARCHAR(120),
  [AddressDetail] NVARCHAR(300),
  [StorePickupLocation] NVARCHAR(250),
  [InvoiceCompanyName] NVARCHAR(200),
  [InvoiceTaxCode] NVARCHAR(40),
  [InvoiceAddress] NVARCHAR(300),
  [InvoiceEmail] NVARCHAR(160),
  [Notes] NVARCHAR(MAX),
  [CancelReason] NVARCHAR(MAX),
  [CancelReviewNote] NVARCHAR(MAX),
  [CreatedAt] DATETIME2 DEFAULT GETDATE(),
  FOREIGN KEY ([UserId]) REFERENCES [Users]([Id])
);
GO

-- ============================================
-- ORDER DETAILS
-- ============================================
CREATE TABLE [OrderDetails] (
  [Id] INT IDENTITY(1,1) PRIMARY KEY,
  [OrderId] INT NOT NULL,
  [ProductId] INT,
  [VariantId] INT NULL,
  [ProductName] NVARCHAR(250),
  [ProductImage] NVARCHAR(500),
  [Sku] NVARCHAR(100),
  [SelectedColor] NVARCHAR(100),
  [SelectedVersion] NVARCHAR(100),
  [Quantity] INT,
  [UnitPrice] DECIMAL(18,2),
  [TotalPrice] DECIMAL(18,2),
  [SerialOrImei] NVARCHAR(120),
  [CreatedAt] DATETIME2 DEFAULT GETDATE(),
  FOREIGN KEY ([OrderId]) REFERENCES [Orders]([Id]) ON DELETE CASCADE,
  FOREIGN KEY ([ProductId]) REFERENCES [Products]([Id]),
  FOREIGN KEY ([VariantId]) REFERENCES [ProductVariants]([Id])
);
GO

-- ============================================
-- ORDER TIMELINES
-- ============================================
CREATE TABLE [OrderTimelines] (
  [Id] INT IDENTITY(1,1) PRIMARY KEY,
  [OrderId] INT NOT NULL,
  [Status] NVARCHAR(40) NOT NULL,
  [Title] NVARCHAR(200) NOT NULL,
  [Note] NVARCHAR(MAX),
  [CreatedAt] DATETIME2 DEFAULT GETDATE(),
  FOREIGN KEY ([OrderId]) REFERENCES [Orders]([Id]) ON DELETE CASCADE
);
GO

-- ============================================
-- ORDER CANCELLATIONS
-- ============================================
CREATE TABLE [OrderCancellations] (
  [Id] INT IDENTITY(1,1) PRIMARY KEY,
  [OrderId] INT NOT NULL,
  [Reason] NVARCHAR(MAX),
  [Status] NVARCHAR(40) DEFAULT 'Pending',
  [AdminNote] NVARCHAR(MAX),
  [RequestedAt] DATETIME2 DEFAULT GETDATE(),
  FOREIGN KEY ([OrderId]) REFERENCES [Orders]([Id]) ON DELETE CASCADE
);
GO

-- ============================================
-- WAREHOUSES
-- ============================================
CREATE TABLE [Warehouses] (
  [Id] INT IDENTITY(1,1) PRIMARY KEY,
  [Name] NVARCHAR(160) NOT NULL,
  [Code] NVARCHAR(40) NOT NULL,
  [Address] NVARCHAR(300),
  [IsActive] BIT DEFAULT 1,
  [CreatedAt] DATETIME2 DEFAULT GETDATE()
);
GO

-- ============================================
-- STOCK ITEMS
-- ============================================
CREATE TABLE [StockItems] (
  [Id] INT IDENTITY(1,1) PRIMARY KEY,
  [ProductId] INT NULL,
  [VariantId] INT NULL,
  [SerialOrImei] NVARCHAR(120) NOT NULL,
  [Sku] NVARCHAR(100),
  [Status] NVARCHAR(40) DEFAULT 'InStock',
  [UnitCost] DECIMAL(18,2),
  [SupplierName] NVARCHAR(200),
  [SupplierId] INT NULL,
  [WarehouseId] INT NULL,
  [OrderId] INT NULL,
  [OrderDetailId] INT NULL,
  [Note] NVARCHAR(MAX),
  [CreatedAt] DATETIME2 DEFAULT GETDATE(),
  FOREIGN KEY ([ProductId]) REFERENCES [Products]([Id]) ON DELETE NO ACTION,
  FOREIGN KEY ([VariantId]) REFERENCES [ProductVariants]([Id]) ON DELETE NO ACTION,
  FOREIGN KEY ([SupplierId]) REFERENCES [Suppliers]([Id]) ON DELETE SET NULL,
  FOREIGN KEY ([WarehouseId]) REFERENCES [Warehouses]([Id]) ON DELETE SET NULL
);
GO

-- ============================================
-- GOODS RECEIPTS
-- ============================================
CREATE TABLE [GoodsReceipts] (
  [Id] INT IDENTITY(1,1) PRIMARY KEY,
  [ReceiptCode] NVARCHAR(40) NOT NULL,
  [SupplierId] INT NULL,
  [SupplierName] NVARCHAR(200) NOT NULL,
  [WarehouseId] INT NULL,
  [Note] NVARCHAR(MAX),
  [TotalCost] DECIMAL(18,2),
  [CreatedAt] DATETIME2 DEFAULT GETDATE(),
  FOREIGN KEY ([SupplierId]) REFERENCES [Suppliers]([Id]) ON DELETE SET NULL,
  FOREIGN KEY ([WarehouseId]) REFERENCES [Warehouses]([Id]) ON DELETE SET NULL
);
GO

-- ============================================
-- COUPONS
-- ============================================
CREATE TABLE [Coupons] (
  [Id] INT IDENTITY(1,1) PRIMARY KEY,
  [Code] NVARCHAR(20),
  [Discount] DECIMAL(18,2),
  [ExpiredAt] DATETIME2,
  [IsActive] BIT DEFAULT 1
);
GO

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX [IX_ProductSpecValues_ProductId] ON [ProductSpecValues]([ProductId]);
GO
CREATE INDEX [IX_StockItems_SerialOrImei] ON [StockItems]([SerialOrImei]);
GO
CREATE INDEX [IX_Orders_UserId] ON [Orders]([UserId]);
GO
CREATE INDEX [IX_SpecDefinitions_CategoryId_Code] ON [SpecDefinitions]([CategoryId], [Code]);
GO

PRINT 'Schema created successfully for SQL Server!';
GO
