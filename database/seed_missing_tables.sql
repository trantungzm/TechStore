-- ============================================
-- SEED DATA FOR NEWLY ADDED TABLES
-- SQL Server compatible
-- ============================================

USE [techstore];
GO

-- ============================================
-- CATEGORY SUPPLIERS
-- ============================================
-- Link categories to suppliers
IF NOT EXISTS (SELECT 1 FROM [CategorySuppliers] WHERE CategoryId = 1 AND SupplierId = 1)
BEGIN
    INSERT INTO [CategorySuppliers] (CategoryId, SupplierId, IsActive, CreatedAt)
    VALUES (1, 1, 1, GETDATE());
END
IF NOT EXISTS (SELECT 1 FROM [CategorySuppliers] WHERE CategoryId = 1 AND SupplierId = 2)
BEGIN
    INSERT INTO [CategorySuppliers] (CategoryId, SupplierId, IsActive, CreatedAt)
    VALUES (1, 2, 1, GETDATE());
END
IF NOT EXISTS (SELECT 1 FROM [CategorySuppliers] WHERE CategoryId = 2 AND SupplierId = 1)
BEGIN
    INSERT INTO [CategorySuppliers] (CategoryId, SupplierId, IsActive, CreatedAt)
    VALUES (2, 1, 1, GETDATE());
END
IF NOT EXISTS (SELECT 1 FROM [CategorySuppliers] WHERE CategoryId = 2 AND SupplierId = 3)
BEGIN
    INSERT INTO [CategorySuppliers] (CategoryId, SupplierId, IsActive, CreatedAt)
    VALUES (2, 3, 1, GETDATE());
END
GO

-- ============================================
-- PRODUCT RECOMMENDATIONS
-- ============================================
-- Add some product recommendations
IF NOT EXISTS (SELECT 1 FROM [ProductRecommendations] WHERE ProductId = 1 AND RecommendedProductId = 2)
BEGIN
    INSERT INTO [ProductRecommendations] (ProductId, RecommendedProductId, SortOrder, CreatedAt)
    VALUES (1, 2, 1, GETDATE());
END
IF NOT EXISTS (SELECT 1 FROM [ProductRecommendations] WHERE ProductId = 1 AND RecommendedProductId = 3)
BEGIN
    INSERT INTO [ProductRecommendations] (ProductId, RecommendedProductId, SortOrder, CreatedAt)
    VALUES (1, 3, 2, GETDATE());
END
IF NOT EXISTS (SELECT 1 FROM [ProductRecommendations] WHERE ProductId = 2 AND RecommendedProductId = 1)
BEGIN
    INSERT INTO [ProductRecommendations] (ProductId, RecommendedProductId, SortOrder, CreatedAt)
    VALUES (2, 1, 1, GETDATE());
END
GO

-- ============================================
-- COUPON SCOPES
-- ============================================
-- Add coupon scopes for existing coupons
IF NOT EXISTS (SELECT 1 FROM [Coupons] WHERE Id = 1)
BEGIN
    -- Create a sample coupon first
    INSERT INTO [Coupons] (Code, Discount, ExpiredAt, IsActive)
    VALUES ('SAVE10', 10.00, DATEADD(year, 1, GETDATE()), 1);
END

-- Add scope for coupon
DECLARE @CouponId INT = (SELECT TOP 1 Id FROM [Coupons] WHERE Code = 'SAVE10');
IF @CouponId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [CouponScopes] WHERE CouponId = @CouponId)
BEGIN
    INSERT INTO [CouponScopes] (CouponId, ScopeType, ScopeValue, CreatedAt)
    VALUES (@CouponId, 'Category', '1', GETDATE());
    
    INSERT INTO [CouponScopes] (CouponId, ScopeType, ScopeValue, CreatedAt)
    VALUES (@CouponId, 'Category', '2', GETDATE());
END
GO

-- ============================================
-- VOUCHER SPINS
-- ============================================
-- Add sample voucher spins (empty for now, will be populated by user actions)
-- This table tracks when users spin for vouchers
GO

-- ============================================
-- USER COUPONS
-- ============================================
-- This table will be populated when users claim coupons
-- Empty for now
GO

-- ============================================
-- ORDER COUPONS
-- ============================================
-- This table will be populated when orders use coupons
-- Empty for now
GO

-- ============================================
-- GOODS RECEIPT LINES
-- ============================================
-- This table will be populated when goods receipts are created
-- Empty for now
GO

-- ============================================
-- GOODS RECEIPT SERIALS
-- ============================================
-- This table will be populated when goods receipts with serials are created
-- Empty for now
GO

-- ============================================
-- STOCK MOVEMENTS
-- ============================================
-- This table will be populated when stock items are moved
-- Empty for now
GO

-- ============================================
-- INVENTORY RETURNS
-- ============================================
-- This table will be populated when inventory returns are processed
-- Empty for now
GO

-- ============================================
-- ORDER DETAIL STOCK ITEMS
-- ============================================
-- This table will be populated when orders are linked to specific stock items
-- Empty for now
GO

-- ============================================
-- WARRANTY RECORDS
-- ============================================
-- This table will be populated when products are registered for warranty
-- Empty for now
GO

-- ============================================
-- WARRANTY CLAIMS
-- ============================================
-- This table will be populated when warranty claims are filed
-- Empty for now
GO

-- ============================================
-- WARRANTY CLAIM UPDATES
-- ============================================
-- This table will be populated when warranty claims are updated
-- Empty for now
GO

-- ============================================
-- REPAIR CASES
-- ============================================
-- This table will be populated when repair cases are created
-- Empty for now
GO

-- ============================================
-- REPAIR UPDATES
-- ============================================
-- This table will be populated when repair cases are updated
-- Empty for now
GO

-- ============================================
-- SUPPORT TICKETS
-- ============================================
-- This table will be populated when support tickets are created
-- Empty for now
GO

-- ============================================
-- SUPPORT TICKET UPDATES
-- ============================================
-- This table will be populated when support tickets are updated
-- Empty for now
GO

-- ============================================
-- NOTIFICATIONS
-- ============================================
-- This table will be populated when notifications are sent
-- Empty for now
GO

-- ============================================
-- ATTACHMENTS
-- ============================================
-- This table will be populated when files are attached to entities
-- Empty for now
GO

PRINT 'Seed data for new tables added successfully!';
GO
