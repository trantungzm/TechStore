-- ============================================
-- ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================

USE [techstore];
GO

-- ============================================
-- ADD CATEGORYID TO SUPPLIERS TABLE
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Suppliers') AND name = 'CategoryId')
BEGIN
    ALTER TABLE [Suppliers] ADD [CategoryId] INT NULL;
    
    -- Add foreign key constraint
    ALTER TABLE [Suppliers] 
    ADD CONSTRAINT [FK_Suppliers_Categories] 
    FOREIGN KEY ([CategoryId]) REFERENCES [Categories]([Id]) ON DELETE NO ACTION;
    
    PRINT 'CategoryId column added to Suppliers table';
END
ELSE
BEGIN
    PRINT 'CategoryId column already exists in Suppliers table';
END
GO

-- ============================================
-- ADD MISSING COLUMNS TO USERS TABLE
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'Salt')
BEGIN
    ALTER TABLE [Users] ADD [Salt] VARBINARY(MAX) NULL;
    PRINT 'Salt column added to Users table';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'Contact')
BEGIN
    ALTER TABLE [Users] ADD [Contact] NVARCHAR(100) NULL;
    PRINT 'Contact column added to Users table';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'Position')
BEGIN
    ALTER TABLE [Users] ADD [Position] NVARCHAR(100) NULL;
    PRINT 'Position column added to Users table';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'Image')
BEGIN
    ALTER TABLE [Users] ADD [Image] NVARCHAR(500) NULL;
    PRINT 'Image column added to Users table';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'IsActive')
BEGIN
    ALTER TABLE [Users] ADD [IsActive] BIT DEFAULT 1;
    PRINT 'IsActive column added to Users table';
END
GO

PRINT 'Missing columns added successfully!';
GO
