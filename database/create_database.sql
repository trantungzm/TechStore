-- ============================================
-- CREATE DATABASE FOR TECHSTORE PROJECT
-- SQL Server Express: DESKTOP-40OLD03\SQLEXPRESS
-- ============================================

-- Check if database exists and drop it if needed
IF EXISTS (SELECT 1 FROM sys.databases WHERE name = 'techstore')
BEGIN
    ALTER DATABASE [techstore] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE [techstore];
    PRINT 'Database techstore dropped successfully.';
END
GO

-- Create new database
CREATE DATABASE [techstore]
COLLATE SQL_Latin1_General_CP1_CI_AS;
GO

PRINT 'Database techstore created successfully.';
GO

-- Switch to the new database
USE [techstore];
GO

PRINT 'Switched to techstore database.';
GO
