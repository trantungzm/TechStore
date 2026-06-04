-- ============================================
-- CREATE ADMIN USER
-- ============================================

USE [techstore];
GO

-- Check if admin user already exists
IF NOT EXISTS (SELECT 1 FROM Users WHERE UserName = 'admin')
BEGIN
    -- Create admin user with password 'admin123'
    -- Note: In production, use proper password hashing
    DECLARE @AdminId UNIQUEIDENTIFIER = NEWID();
    DECLARE @PasswordHash NVARCHAR(255) = 'admin123'; -- Plain text for testing only
    DECLARE @Salt VARBINARY(MAX) = NULL;
    
    INSERT INTO [Users] (
        Id, 
        UserName, 
        Password, 
        Salt, 
        Name, 
        Email, 
        Phone, 
        UserType, 
        IsActive, 
        Created
    )
    VALUES (
        @AdminId,
        'admin',
        @PasswordHash,
        @Salt,
        'Administrator',
        'admin@techstore.vn',
        '0123456789',
        1, -- Admin type
        1, -- Active
        GETDATE()
    );
    
    PRINT 'Admin user created successfully';
    PRINT 'Username: admin';
    PRINT 'Password: admin123';
END
ELSE
BEGIN
    PRINT 'Admin user already exists';
END
GO

-- Verify admin user was created
SELECT Id, UserName, Name, UserType, IsActive FROM Users WHERE UserName = 'admin';
GO
