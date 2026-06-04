-- Create InventoryTransactions table
IF OBJECT_ID(N'[dbo].[InventoryTransactions]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[InventoryTransactions] (
        [Id] INT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_InventoryTransactions] PRIMARY KEY,
        [ProductId] INT NOT NULL,
        [VariantId] INT NULL,
        [Type] NVARCHAR(40) NOT NULL,
        [Quantity] INT NOT NULL,
        [UnitCost] DECIMAL(18,2) NOT NULL,
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [DF_InventoryTransactions_CreatedAt] DEFAULT SYSUTCDATETIME(),
        [ReferenceId] INT NULL,
        [Note] NVARCHAR(1000) NULL,
        [CreatedByUserId] UNIQUEIDENTIFIER NULL,
        CONSTRAINT [FK_InventoryTransactions_Products] FOREIGN KEY ([ProductId]) REFERENCES [dbo].[Products]([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_InventoryTransactions_ProductVariants] FOREIGN KEY ([VariantId]) REFERENCES [dbo].[ProductVariants]([Id]) ON DELETE NO ACTION
    );
    
    CREATE INDEX [IX_InventoryTransactions_ProductId] ON [dbo].[InventoryTransactions]([ProductId]);
    CREATE INDEX [IX_InventoryTransactions_Type] ON [dbo].[InventoryTransactions]([Type]);
    CREATE INDEX [IX_InventoryTransactions_CreatedAt] ON [dbo].[InventoryTransactions]([CreatedAt]);
END
GO

PRINT 'InventoryTransactions table created successfully.'
