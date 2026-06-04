-- ============================================
-- SEED DATA FOR TECHSTORE PROJECT
-- Matching C# Entity Models
-- SQL Server compatible
-- ============================================

USE [techstore];
GO

-- ============================================
-- ROLES
-- ============================================
SET IDENTITY_INSERT [Roles] ON;
GO

IF NOT EXISTS (SELECT 1 FROM [Roles] WHERE [Id] = '000000000000000000000001')
BEGIN
    INSERT INTO [Roles] ([Id], [Guid], [Name], [Description], [CreatedBy], [Created], [ModifiedBy], [Modified], [CreatedUser], [CreatedDateTime], [IsDeleted], [IsActive], [RoleType])
    VALUES 
    ('000000000000000000000001', '00000000-0000-0000-0000-000000000001', 'Admin', 'Administrator', 'system', '2026-01-01 00:00:00', 'system', '2026-01-01 00:00:00', 'system', '2026-01-01 00:00:00', 0, 1, 1);
END

IF NOT EXISTS (SELECT 1 FROM [Roles] WHERE [Id] = '000000000000000000000002')
BEGIN
    INSERT INTO [Roles] ([Id], [Guid], [Name], [Description], [CreatedBy], [Created], [ModifiedBy], [Modified], [CreatedUser], [CreatedDateTime], [IsDeleted], [IsActive], [RoleType])
    VALUES 
    ('000000000000000000000002', '00000000-0000-0000-0000-000000000002', 'User', 'Regular user', 'system', '2026-01-01 00:00:00', 'system', '2026-01-01 00:00:00', 'system', '2026-01-01 00:00:00', 0, 1, 0);
END

IF NOT EXISTS (SELECT 1 FROM [Roles] WHERE [Id] = '000000000000000000000003')
BEGIN
    INSERT INTO [Roles] ([Id], [Guid], [Name], [Description], [CreatedBy], [Created], [ModifiedBy], [Modified], [CreatedUser], [CreatedDateTime], [IsDeleted], [IsActive], [RoleType])
    VALUES 
    ('000000000000000000000003', '00000000-0000-0000-0000-000000000003', 'Warehouse', 'Warehouse staff', 'system', '2026-01-01 00:00:00', 'system', '2026-01-01 00:00:00', 'system', '2026-01-01 00:00:00', 0, 1, 2);
END

IF NOT EXISTS (SELECT 1 FROM [Roles] WHERE [Id] = '000000000000000000000004')
BEGIN
    INSERT INTO [Roles] ([Id], [Guid], [Name], [Description], [CreatedBy], [Created], [ModifiedBy], [Modified], [CreatedUser], [CreatedDateTime], [IsDeleted], [IsActive], [RoleType])
    VALUES 
    ('000000000000000000000004', '00000000-0000-0000-0000-000000000004', 'Technical', 'Technical support', 'system', '2026-01-01 00:00:00', 'system', '2026-01-01 00:00:00', 'system', '2026-01-01 00:00:00', 0, 1, 3);
END

SET IDENTITY_INSERT [Roles] OFF;
GO

-- ============================================
-- STORE SETTINGS
-- ============================================
IF NOT EXISTS (SELECT 1 FROM [StoreSettings] WHERE [Id] = 1)
BEGIN
    INSERT INTO [StoreSettings] ([Id], [StoreName], [Hotline], [SupportEmail], [Address], [WarrantyAddress], [DefaultShippingFee], [FreeShippingThreshold], [SupportTime], [LogoUrl], [FacebookUrl], [ZaloUrl], [CreatedAt], [UpdatedAt])
    VALUES 
    (1, 'CNTHHT Store', '0327 188 459', 'support@cnthht.vn', '', '', 0.00, NULL, '', '', '', '', '2026-01-01 00:00:00', '2026-01-01 00:00:00');
END
GO

-- ============================================
-- CATEGORIES
-- ============================================
SET IDENTITY_INSERT [Categories] ON;
GO

IF NOT EXISTS (SELECT 1 FROM [Categories] WHERE [Id] = 1)
BEGIN
    INSERT INTO [Categories] ([Id], [Name], [Description]) VALUES (1, N'Điện thoại', N'Điện thoại và thiết bị di động');
END
IF NOT EXISTS (SELECT 1 FROM [Categories] WHERE [Id] = 2)
BEGIN
    INSERT INTO [Categories] ([Id], [Name], [Description]) VALUES (2, N'Laptop', N'Laptop va may tinh xach tay');
END
IF NOT EXISTS (SELECT 1 FROM [Categories] WHERE [Id] = 3)
BEGIN
    INSERT INTO [Categories] ([Id], [Name], [Description]) VALUES (3, 'Accessories', N'Phu kien dien tu');
END
IF NOT EXISTS (SELECT 1 FROM [Categories] WHERE [Id] = 4)
BEGIN
    INSERT INTO [Categories] ([Id], [Name], [Description]) VALUES (4, N'Tablet', N'Máy tính bảng');
END
IF NOT EXISTS (SELECT 1 FROM [Categories] WHERE [Id] = 5)
BEGIN
    INSERT INTO [Categories] ([Id], [Name], [Description]) VALUES (5, N'Đồng hồ thông minh', N'Đồng hồ thông minh');
END
IF NOT EXISTS (SELECT 1 FROM [Categories] WHERE [Id] = 6)
BEGIN
    INSERT INTO [Categories] ([Id], [Name], [Description]) VALUES (6, N'Máy ảnh', N'Máy ảnh và thiết bị quay video');
END
IF NOT EXISTS (SELECT 1 FROM [Categories] WHERE [Id] = 7)
BEGIN
    INSERT INTO [Categories] ([Id], [Name], [Description]) VALUES (7, N'Tai nghe', N'Tai nghe và thiết bị âm thanh');
END
IF NOT EXISTS (SELECT 1 FROM [Categories] WHERE [Id] = 8)
BEGIN
    INSERT INTO [Categories] ([Id], [Name], [Description]) VALUES (8, 'Audio', N'Loa va tai nghe');
END
IF NOT EXISTS (SELECT 1 FROM [Categories] WHERE [Id] = 9)
BEGIN
    INSERT INTO [Categories] ([Id], [Name], [Description]) VALUES (9, 'Electronics', N'Thiet bi dien tu');
END

SET IDENTITY_INSERT [Categories] OFF;
GO

-- ============================================
-- SUPPLIERS
-- ============================================
SET IDENTITY_INSERT [Suppliers] ON;
GO

IF NOT EXISTS (SELECT 1 FROM [Suppliers] WHERE [Id] = 1)
BEGIN
    INSERT INTO [Suppliers] ([Id], [SupplierCode], [Name], [Phone], [Email], [Address], [SupplierType], [IsActive], [CreatedAt])
    VALUES (1, 'SUP-SYNNEX-FPT', 'Synnex FPT', '19006600', 'contact@synnexfpt.com', 'Vietnam', 1, 1, '2026-01-01 00:00:00');
END
IF NOT EXISTS (SELECT 1 FROM [Suppliers] WHERE [Id] = 2)
BEGIN
    INSERT INTO [Suppliers] ([Id], [SupplierCode], [Name], [Phone], [Email], [Address], [SupplierType], [IsActive], [CreatedAt])
    VALUES (2, 'SUP-DIGIWORLD', 'Digiworld', '02839299959', 'contact@digiworld.com.vn', 'Vietnam', 1, 1, '2026-01-01 00:00:00');
END
IF NOT EXISTS (SELECT 1 FROM [Suppliers] WHERE [Id] = 3)
BEGIN
    INSERT INTO [Suppliers] ([Id], [SupplierCode], [Name], [Address], [SupplierType], [IsActive], [CreatedAt])
    VALUES (3, 'SUP-FPT-TRADING', 'FPT Trading', 'Vietnam', 1, 1, '2026-01-01 00:00:00');
END
IF NOT EXISTS (SELECT 1 FROM [Suppliers] WHERE [Id] = 4)
BEGIN
    INSERT INTO [Suppliers] ([Id], [SupplierCode], [Name], [Phone], [Email], [Address], [SupplierType], [IsActive], [CreatedAt])
    VALUES (4, 'SUP-PETROSETCO', 'Petrosetco Distribution', '02854168686', 'contact@petrosetco.com.vn', 'Vietnam', 2, 1, '2026-01-01 00:00:00');
END

SET IDENTITY_INSERT [Suppliers] OFF;
GO

-- ============================================
-- PRODUCTS
-- ============================================
-- Phone products
IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'iPhone 15 Pro')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('iPhone 15 Pro', 'iphone-15-pro', 'IPHONE-15-PRO', 28990000.00, 32990000.00, 12, 1, 'Flagship Apple smartphone', '/electro/img/product-1.png', 'Apple', 1, 1, 0, 1, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'Samsung Galaxy S24')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('Samsung Galaxy S24', 'samsung-galaxy-s24', 'SAMSUNG-S24', 21990000.00, 24990000.00, 15, 1, 'Android flagship phone', '/electro/img/product-2.png', 'Samsung', 1, 1, 1, 1, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'iPhone 15')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('iPhone 15', 'iphone-15', 'IPHONE-15', 21990000.00, 24990000.00, 18, 1, 'Apple smartphone 128GB camera 48MP', '/electro/img/product-6.png', 'Apple', 1, 0, 0, 1, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'iPhone 14 Plus')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('iPhone 14 Plus', 'iphone-14-plus', 'IPHONE-14-PLUS', 18990000.00, 21990000.00, 11, 1, 'Large screen Apple smartphone 128GB', '/electro/img/product-7.png', 'Apple', 1, 0, 0, 0, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'Samsung Galaxy S24 Ultra')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra', 'SAMSUNG-S24-ULTRA', 28990000.00, 32990000.00, 9, 1, 'Samsung flagship 12GB 256GB camera 200MP', '/electro/img/product-8.png', 'Samsung', 1, 1, 0, 1, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'Samsung Galaxy A55 5G')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('Samsung Galaxy A55 5G', 'samsung-galaxy-a55-5g', 'SAMSUNG-A55', 9990000.00, 11990000.00, 28, 1, 'Samsung midrange phone 8GB 256GB 5000mAh', '/electro/img/product-9.png', 'Samsung', 1, 0, 1, 0, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'Xiaomi 14T Pro')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('Xiaomi 14T Pro', 'xiaomi-14t-pro', 'XIAOMI-14T-PRO', 16990000.00, 18990000.00, 16, 1, 'Xiaomi gaming phone 12GB 512GB camera Leica', '/electro/img/product-10.png', 'Xiaomi', 1, 0, 0, 1, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'Xiaomi Redmi Note 13 Pro')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('Xiaomi Redmi Note 13 Pro', 'xiaomi-redmi-note-13-pro', 'XIAOMI-RN13-PRO', 7490000.00, 8990000.00, 32, 1, 'Affordable Xiaomi phone 8GB 256GB 5000mAh', '/electro/img/product-11.png', 'Xiaomi', 1, 0, 1, 0, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'OPPO Reno12 F')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('OPPO Reno12 F', 'oppo-reno12-f', 'OPPO-R12F', 8990000.00, 9990000.00, 21, 1, 'OPPO camera phone 8GB 256GB portrait', '/electro/img/product-12.png', 'OPPO', 1, 0, 0, 1, 0, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'Vivo V30 5G')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('Vivo V30 5G', 'vivo-v30-5g', 'VIVO-V30', 11990000.00, 13990000.00, 14, 1, 'Vivo phone 12GB 512GB selfie camera', '/electro/img/product-13.png', 'Vivo', 1, 0, 0, 1, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'Realme 12 Pro Plus')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('Realme 12 Pro Plus', 'realme-12-pro-plus', 'REALME-12PP', 10990000.00, 12990000.00, 17, 1, 'Realme phone 12GB 512GB telephoto camera', '/electro/img/product-14.png', 'Realme', 1, 0, 0, 0, 1, 1, 12, GETDATE());
END

-- Laptop products
IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'MacBook Air M3')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('MacBook Air M3', 'macbook-air-m3', 'MBA-M3', 31990000.00, 35990000.00, 10, 2, 'Lightweight Apple laptop', '/electro/img/product-3.png', 'Apple', 1, 1, 1, 0, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'Dell XPS 15')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('Dell XPS 15', 'dell-xps-15', 'DELL-XPS15', 35990000.00, 39990000.00, 8, 2, 'High-end productivity laptop', '/electro/img/product-4.png', 'Dell', 1, 1, 0, 0, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'ASUS ROG Strix G16')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('ASUS ROG Strix G16', 'asus-rog-strix-g16', 'ASUS-ROG-G16', 29990000.00, 34990000.00, 7, 2, 'Gaming laptop with RTX graphics', '/electro/img/product-11.png', 'ASUS', 1, 1, 0, 1, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'MacBook Pro 14 M3')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('MacBook Pro 14 M3', 'macbook-pro-14-m3', 'MBP-14-M3', 45990000.00, 49990000.00, 7, 2, 'Apple laptop M3 16GB 512GB for creative work', '/electro/img/product-15.png', 'Apple', 1, 1, 0, 1, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'Dell Inspiron 15 3530')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('Dell Inspiron 15 3530', 'dell-inspiron-15-3530', 'DELL-INSP15', 15990000.00, 17990000.00, 19, 2, 'Dell office laptop Intel Core i5 16GB 512GB', '/electro/img/product-16.png', 'Dell', 1, 0, 0, 0, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'Dell G15 Gaming')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('Dell G15 Gaming', 'dell-g15-gaming', 'DELL-G15', 27990000.00, 31990000.00, 8, 2, 'Dell gaming laptop RTX 4050 16GB 512GB', '/electro/img/product-17.png', 'Dell', 1, 0, 0, 1, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'ASUS Vivobook 15 OLED')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('ASUS Vivobook 15 OLED', 'asus-vivobook-15-oled', 'ASUS-VIVO15', 18990000.00, 21990000.00, 20, 2, 'ASUS laptop OLED Intel Core i5 16GB 512GB', '/electro/img/product-18.png', 'ASUS', 1, 0, 1, 0, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'Lenovo ThinkPad E14')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('Lenovo ThinkPad E14', 'lenovo-thinkpad-e14', 'LENOVO-TP-E14', 20990000.00, 23990000.00, 13, 2, 'Lenovo business laptop Core i5 16GB 512GB', '/electro/img/product-1.png', 'Lenovo', 1, 0, 0, 0, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'HP Pavilion 14')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('HP Pavilion 14', 'hp-pavilion-14', 'HP-PAV14', 16990000.00, 18990000.00, 15, 2, 'HP student laptop Core i5 16GB 512GB', '/electro/img/product-2.png', 'HP', 1, 0, 0, 0, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'HP Victus 16')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('HP Victus 16', 'hp-victus-16', 'HP-VICTUS16', 24990000.00, 28990000.00, 10, 2, 'HP gaming laptop RTX 4050 16GB 512GB', '/electro/img/product-3.png', 'HP', 1, 0, 0, 1, 1, 1, 12, GETDATE());
END

-- Accessories
IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'USB-C Hub 7-in-1')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('USB-C Hub 7-in-1', 'usb-c-hub-7-in-1', 'USB-HUB-7', 790000.00, 990000.00, 35, 3, 'Multi-port USB hub', '/electro/img/product-6.png', 'Baseus', 1, 0, 1, 0, 1, 0, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'Mechanical Keyboard')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('Mechanical Keyboard', 'mechanical-keyboard', 'MECH-KB', 2490000.00, 2990000.00, 18, 3, 'RGB mechanical keyboard', '/electro/img/product-7.png', 'Keychron', 1, 0, 1, 0, 1, 0, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'Gaming Mouse')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('Gaming Mouse', 'gaming-mouse', 'GAMING-MOUSE', 990000.00, 1290000.00, 30, 3, 'High DPI gaming mouse', '/electro/img/product-8.png', 'Logitech', 1, 0, 0, 1, 1, 0, 12, GETDATE());
END

-- Tablet products
IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'iPad Pro 12.9')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('iPad Pro 12.9', 'ipad-pro-12-9', 'IPAD-PRO-129', 25990000.00, 28990000.00, 14, 4, 'Large tablet for professionals', '/electro/img/product-7.png', 'Apple', 1, 1, 0, 1, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'Samsung Galaxy Tab S9')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('Samsung Galaxy Tab S9', 'samsung-galaxy-tab-s9', 'SAMSUNG-TAB-S9', 19990000.00, 22990000.00, 12, 4, 'High-end Android tablet', '/electro/img/product-13.png', 'Samsung', 1, 1, 0, 1, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'Lenovo Tab P12')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('Lenovo Tab P12', 'lenovo-tab-p12', 'LENOVO-TAB-P12', 8990000.00, 9990000.00, 16, 4, 'Entertainment tablet', '/electro/img/product-14.png', 'Lenovo', 1, 0, 0, 1, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'iPad Air M2 11 inch')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('iPad Air M2 11 inch', 'ipad-air-m2-11-inch', 'IPAD-AIR-M2-11', 16990000.00, 18990000.00, 18, 4, 'Apple tablet M2 128GB WiFi', '/electro/img/product-4.png', 'Apple', 1, 1, 0, 1, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'iPad Gen 10 10.9 inch')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('iPad Gen 10 10.9 inch', 'ipad-gen-10-10-9-inch', 'IPAD-GEN10', 9990000.00, 11990000.00, 24, 4, 'Apple tablet A14 64GB WiFi', '/electro/img/product-5.png', 'Apple', 1, 0, 1, 0, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'Xiaomi Pad 6')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('Xiaomi Pad 6', 'xiaomi-pad-6', 'XIAOMI-PAD6', 8490000.00, 9990000.00, 22, 4, 'Xiaomi tablet 11 inch 8GB 256GB', '/electro/img/product-6.png', 'Xiaomi', 1, 0, 0, 0, 1, 1, 12, GETDATE());
END

-- Smartwatch products
IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'Apple Watch Series 9')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('Apple Watch Series 9', 'apple-watch-series-9', 'AWS9', 9990000.00, 11990000.00, 16, 5, 'Premium smartwatch', '/electro/img/product-8.png', 'Apple', 1, 0, 1, 1, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'Samsung Galaxy Watch 6')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('Samsung Galaxy Watch 6', 'samsung-galaxy-watch-6', 'SGW6', 7990000.00, 8990000.00, 20, 5, 'Android smartwatch', '/electro/img/product-15.png', 'Samsung', 1, 0, 1, 0, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'Garmin Venu 3')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('Garmin Venu 3', 'garmin-venu-3', 'GARMIN-VENU3', 10990000.00, 12990000.00, 9, 5, 'Fitness smartwatch', '/electro/img/product-16.png', 'Garmin', 1, 0, 0, 1, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'Apple Watch Series 10')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('Apple Watch Series 10', 'apple-watch-series-10', 'AWS10', 10990000.00, 12990000.00, 20, 5, 'Apple smartwatch GPS 46mm health tracking', '/electro/img/product-7.png', 'Apple', 1, 0, 1, 1, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'Samsung Galaxy Watch7')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('Samsung Galaxy Watch7', 'samsung-galaxy-watch7', 'SGW7', 7490000.00, 8990000.00, 19, 5, 'Samsung smartwatch 44mm Wear OS', '/electro/img/product-8.png', 'Samsung', 1, 0, 0, 1, 1, 1, 12, GETDATE());
END

-- Camera products
IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'Canon EOS R5')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('Canon EOS R5', 'canon-eos-r5', 'CANON-R5', 64990000.00, 69990000.00, 5, 6, 'Professional mirrorless camera', '/electro/img/product-9.png', 'Canon', 1, 1, 0, 0, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'Sony A7IV')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('Sony A7IV', 'sony-a7iv', 'SONY-A7IV', 44990000.00, 49990000.00, 8, 6, 'Full-frame mirrorless camera', '/electro/img/product-17.png', 'Sony', 1, 1, 0, 0, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'DJI Osmo Pocket 3')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('DJI Osmo Pocket 3', 'dji-osmo-pocket-3', 'DJI-OP3', 13990000.00, 15990000.00, 11, 6, 'Compact video camera', '/electro/img/product-18.png', 'DJI', 1, 0, 1, 1, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'Canon EOS R50 Kit')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('Canon EOS R50 Kit', 'canon-eos-r50-kit', 'CANON-R50-KIT', 18990000.00, 21990000.00, 10, 6, 'Canon mirrorless camera vlog 4K kit lens', '/electro/img/product-9.png', 'Canon', 1, 1, 0, 1, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'GoPro Hero 13 Black')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('GoPro Hero 13 Black', 'gopro-hero-13-black', 'GOPRO-H13', 11990000.00, 13990000.00, 14, 6, 'GoPro action camera waterproof 5.3K video', '/electro/img/product-10.png', 'GoPro', 1, 0, 1, 1, 1, 1, 12, GETDATE());
END

-- Headphone products
IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'AirPods Pro 2')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('AirPods Pro 2', 'airpods-pro-2', 'APP2', 5990000.00, 6990000.00, 25, 7, 'Wireless earbuds', '/electro/img/product-5.png', 'Apple', 1, 0, 1, 0, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'Bose QuietComfort 45')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('Bose QuietComfort 45', 'bose-quietcomfort-45', 'BOS-QC45', 8990000.00, 9990000.00, 14, 7, 'Noise-cancelling headphones', '/electro/img/product-10.png', 'Bose', 1, 0, 1, 0, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'Sony WH-1000XM5')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('Sony WH-1000XM5', 'sony-wh-1000xm5', 'SONY-WH1000XM5', 8490000.00, 9490000.00, 13, 7, 'Noise-cancelling headphones', '/electro/img/product-19.png', 'Sony', 1, 0, 1, 0, 1, 1, 12, GETDATE());
END

-- Audio products
IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'JBL PartyBox 310')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('JBL PartyBox 310', 'jbl-partybox-310', 'JBL-PB310', 11990000.00, 13990000.00, 6, 8, 'Portable party speaker', '/electro/img/product-12.png', 'JBL', 1, 0, 0, 1, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'Marshall Stanmore III')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('Marshall Stanmore III', 'marshall-stanmore-iii', 'MARSHALL-ST3', 10990000.00, 12990000.00, 8, 8, 'Home bluetooth speaker', '/electro/img/product-20.png', 'Marshall', 1, 0, 1, 0, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'Soundbar Samsung Q600C')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('Soundbar Samsung Q600C', 'soundbar-samsung-q600c', 'SAMSUNG-Q600C', 7990000.00, 8990000.00, 10, 8, 'TV soundbar', '/electro/img/product-21.png', 'Samsung', 1, 0, 0, 1, 1, 1, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'JBL Flip 6')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('JBL Flip 6', 'jbl-flip-6', 'JBL-FLIP6', 2790000.00, 3290000.00, 26, 8, 'JBL bluetooth speaker waterproof audio', '/electro/img/product-11.png', 'JBL', 1, 0, 1, 0, 1, 1, 12, GETDATE());
END

-- Electronics products
IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'Xiaomi TV Box S 4K')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('Xiaomi TV Box S 4K', 'xiaomi-tv-box-s-4k', 'XIAOMI-TVBOX', 1490000.00, 1790000.00, 24, 9, '4K streaming box', '/electro/img/product-22.png', 'Xiaomi', 1, 0, 1, 0, 1, 0, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'TP-Link Archer AX55')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('TP-Link Archer AX55', 'tp-link-archer-ax55', 'TPLINK-AX55', 1890000.00, 2290000.00, 22, 9, 'Wi-Fi 6 router', '/electro/img/product-23.png', 'TP-Link', 1, 0, 0, 1, 1, 0, 12, GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [Name] = 'Anker PowerCore 20K')
BEGIN
    INSERT INTO [Products] ([Name], [Slug], [Sku], [Price], [OriginalPrice], [Stock], [CategoryId], [Description], [ImageUrl], [Brand], [IsActive], [IsFeatured], [IsBestSeller], [IsNewArrival], [IsDiscounted], [RequiresSerialTracking], [WarrantyMonths], [CreatedAt])
    VALUES ('Anker PowerCore 20K', 'anker-powercore-20k', 'ANKER-20K', 1290000.00, 1590000.00, 28, 9, 'Power bank 20000mAh', '/electro/img/product-24.png', 'Anker', 1, 0, 1, 0, 1, 0, 12, GETDATE());
END
GO

PRINT 'Seed data inserted successfully!';
GO
