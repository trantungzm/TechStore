-- Synchronize order tables with the current EF Core model.
-- This fixes /api/orders/all failures caused by legacy SQL columns.

USE [techstore];
GO

IF OBJECT_ID(N'[dbo].[Orders]', N'U') IS NOT NULL
BEGIN
    IF COL_LENGTH('dbo.Orders', 'OrderDate') IS NULL
        ALTER TABLE [dbo].[Orders] ADD [OrderDate] DATETIME2 NOT NULL CONSTRAINT [DF_Orders_OrderDate_Legacy] DEFAULT SYSUTCDATETIME();
    IF COL_LENGTH('dbo.Orders', 'ExpectedPickupTime') IS NULL
        ALTER TABLE [dbo].[Orders] ADD [ExpectedPickupTime] DATETIME2 NULL;
    IF COL_LENGTH('dbo.Orders', 'InvoiceRequired') IS NULL
        ALTER TABLE [dbo].[Orders] ADD [InvoiceRequired] BIT NOT NULL CONSTRAINT [DF_Orders_InvoiceRequired_Legacy] DEFAULT 0;
    IF COL_LENGTH('dbo.Orders', 'CancelRequestedAt') IS NULL
        ALTER TABLE [dbo].[Orders] ADD [CancelRequestedAt] DATETIME2 NULL;
    IF COL_LENGTH('dbo.Orders', 'CancelReviewedAt') IS NULL
        ALTER TABLE [dbo].[Orders] ADD [CancelReviewedAt] DATETIME2 NULL;
    IF COL_LENGTH('dbo.Orders', 'CancelReviewedByUserId') IS NULL
        ALTER TABLE [dbo].[Orders] ADD [CancelReviewedByUserId] UNIQUEIDENTIFIER NULL;
    IF COL_LENGTH('dbo.Orders', 'UpdatedAt') IS NULL
        ALTER TABLE [dbo].[Orders] ADD [UpdatedAt] DATETIME2 NULL;
    IF COL_LENGTH('dbo.Orders', 'UpdatedByUserId') IS NULL
        ALTER TABLE [dbo].[Orders] ADD [UpdatedByUserId] UNIQUEIDENTIFIER NULL;

    EXEC(N'UPDATE [dbo].[Orders]
        SET
            [OrderDate] = COALESCE([OrderDate], [CreatedAt], SYSUTCDATETIME()),
            [Subtotal] = COALESCE([Subtotal], 0),
            [ProductDiscount] = COALESCE([ProductDiscount], 0),
            [ShippingFee] = COALESCE([ShippingFee], 0),
            [ShippingDiscount] = COALESCE([ShippingDiscount], 0),
            [TotalAmount] = COALESCE([TotalAmount], 0),
            [Status] = COALESCE([Status], N''Pending''),
            [PaymentStatus] = COALESCE([PaymentStatus], N''Unpaid''),
            [InvoiceRequired] = COALESCE([InvoiceRequired], 0),
            [CreatedAt] = COALESCE([CreatedAt], SYSUTCDATETIME())
        WHERE [OrderDate] IS NULL
           OR [Subtotal] IS NULL
           OR [ProductDiscount] IS NULL
           OR [ShippingFee] IS NULL
           OR [ShippingDiscount] IS NULL
           OR [TotalAmount] IS NULL
           OR [Status] IS NULL
           OR [PaymentStatus] IS NULL
           OR [InvoiceRequired] IS NULL
           OR [CreatedAt] IS NULL;');
END
GO

IF OBJECT_ID(N'[dbo].[OrderDetails]', N'U') IS NOT NULL
BEGIN
    EXEC(N'UPDATE [dbo].[OrderDetails]
        SET
            [ProductId] = COALESCE([ProductId], 0),
            [Quantity] = COALESCE([Quantity], 0),
            [UnitPrice] = COALESCE([UnitPrice], 0),
            [TotalPrice] = COALESCE([TotalPrice], COALESCE([UnitPrice], 0) * COALESCE([Quantity], 0)),
            [CreatedAt] = COALESCE([CreatedAt], SYSUTCDATETIME())
        WHERE [ProductId] IS NULL
           OR [Quantity] IS NULL
           OR [UnitPrice] IS NULL
           OR [TotalPrice] IS NULL
           OR [CreatedAt] IS NULL;');
END
GO

IF OBJECT_ID(N'[dbo].[OrderTimelines]', N'U') IS NOT NULL
BEGIN
    IF COL_LENGTH('dbo.OrderTimelines', 'CreatedByUserId') IS NULL
        ALTER TABLE [dbo].[OrderTimelines] ADD [CreatedByUserId] UNIQUEIDENTIFIER NULL;

    UPDATE [dbo].[OrderTimelines]
    SET [CreatedAt] = COALESCE([CreatedAt], SYSUTCDATETIME())
    WHERE [CreatedAt] IS NULL;
END
GO

IF OBJECT_ID(N'[dbo].[OrderCancellations]', N'U') IS NOT NULL
BEGIN
    IF COL_LENGTH('dbo.OrderCancellations', 'RequestedByUserId') IS NULL
        ALTER TABLE [dbo].[OrderCancellations] ADD [RequestedByUserId] UNIQUEIDENTIFIER NULL;
    IF COL_LENGTH('dbo.OrderCancellations', 'ReviewedByUserId') IS NULL
        ALTER TABLE [dbo].[OrderCancellations] ADD [ReviewedByUserId] UNIQUEIDENTIFIER NULL;
    IF COL_LENGTH('dbo.OrderCancellations', 'ReviewedAt') IS NULL
        ALTER TABLE [dbo].[OrderCancellations] ADD [ReviewedAt] DATETIME2 NULL;

    EXEC(N'UPDATE [dbo].[OrderCancellations]
        SET
            [Status] = COALESCE([Status], N''Pending''),
            [RequestedAt] = COALESCE([RequestedAt], SYSUTCDATETIME())
        WHERE [Status] IS NULL OR [RequestedAt] IS NULL;');
END
GO

IF OBJECT_ID(N'[dbo].[OrderCoupons]', N'U') IS NOT NULL
BEGIN
    UPDATE [dbo].[OrderCoupons]
    SET
        [DiscountAmount] = COALESCE([DiscountAmount], 0),
        [CreatedAt] = COALESCE([CreatedAt], SYSUTCDATETIME())
    WHERE [DiscountAmount] IS NULL OR [CreatedAt] IS NULL;
END
GO

IF OBJECT_ID(N'[dbo].[StoreSettings]', N'U') IS NOT NULL
BEGIN
    UPDATE [dbo].[StoreSettings]
    SET
        [StoreName] = COALESCE([StoreName], N'TechStore'),
        [Hotline] = COALESCE([Hotline], N''),
        [DefaultShippingFee] = COALESCE([DefaultShippingFee], 30000),
        [CreatedAt] = COALESCE([CreatedAt], SYSUTCDATETIME()),
        [UpdatedAt] = COALESCE([UpdatedAt], SYSUTCDATETIME())
    WHERE [StoreName] IS NULL
       OR [Hotline] IS NULL
       OR [DefaultShippingFee] IS NULL
       OR [CreatedAt] IS NULL
       OR [UpdatedAt] IS NULL;
END
GO

PRINT 'TechStore order schema synchronized.';
GO
