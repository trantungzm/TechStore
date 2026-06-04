-- Synchronize warranty, ticket, repair, notification and attachment schema for TechStore SQL Server.
-- Run this against SQL Server database [techstore] when support APIs return 500 due to legacy schema drift.

USE [techstore];
GO

IF OBJECT_ID(N'[dbo].[WarrantyRecords]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[WarrantyRecords] (
        [Id] INT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_WarrantyRecords] PRIMARY KEY,
        [WarrantyCode] NVARCHAR(40) NOT NULL,
        [UserId] UNIQUEIDENTIFIER NULL,
        [OrderId] INT NULL,
        [OrderDetailId] INT NULL,
        [ProductId] INT NOT NULL,
        [VariantId] INT NULL,
        [StockItemId] INT NULL,
        [SerialOrImei] NVARCHAR(120) NULL,
        [CustomerName] NVARCHAR(160) NULL,
        [CustomerPhone] NVARCHAR(30) NULL,
        [CustomerEmail] NVARCHAR(160) NULL,
        [ProductName] NVARCHAR(250) NULL,
        [ProductImage] NVARCHAR(500) NULL,
        [WarrantyMonths] INT NOT NULL CONSTRAINT [DF_WarrantyRecords_WarrantyMonths] DEFAULT 12,
        [StartDate] DATETIME2 NOT NULL,
        [EndDate] DATETIME2 NOT NULL,
        [Status] NVARCHAR(40) NOT NULL CONSTRAINT [DF_WarrantyRecords_Status] DEFAULT N'Active',
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [DF_WarrantyRecords_CreatedAt] DEFAULT SYSUTCDATETIME(),
        [UpdatedAt] DATETIME2 NULL,
        [Note] NVARCHAR(1000) NULL
    );
END
GO

IF COL_LENGTH('dbo.WarrantyRecords', 'WarrantyCode') IS NULL ALTER TABLE [dbo].[WarrantyRecords] ADD [WarrantyCode] NVARCHAR(40) NULL;
IF COL_LENGTH('dbo.WarrantyRecords', 'UserId') IS NULL ALTER TABLE [dbo].[WarrantyRecords] ADD [UserId] UNIQUEIDENTIFIER NULL;
IF COL_LENGTH('dbo.WarrantyRecords', 'OrderId') IS NULL ALTER TABLE [dbo].[WarrantyRecords] ADD [OrderId] INT NULL;
IF COL_LENGTH('dbo.WarrantyRecords', 'OrderDetailId') IS NULL ALTER TABLE [dbo].[WarrantyRecords] ADD [OrderDetailId] INT NULL;
IF COL_LENGTH('dbo.WarrantyRecords', 'VariantId') IS NULL ALTER TABLE [dbo].[WarrantyRecords] ADD [VariantId] INT NULL;
IF COL_LENGTH('dbo.WarrantyRecords', 'StockItemId') IS NULL ALTER TABLE [dbo].[WarrantyRecords] ADD [StockItemId] INT NULL;
IF COL_LENGTH('dbo.WarrantyRecords', 'SerialOrImei') IS NULL ALTER TABLE [dbo].[WarrantyRecords] ADD [SerialOrImei] NVARCHAR(120) NULL;
IF COL_LENGTH('dbo.WarrantyRecords', 'ProductName') IS NULL ALTER TABLE [dbo].[WarrantyRecords] ADD [ProductName] NVARCHAR(250) NULL;
IF COL_LENGTH('dbo.WarrantyRecords', 'ProductImage') IS NULL ALTER TABLE [dbo].[WarrantyRecords] ADD [ProductImage] NVARCHAR(500) NULL;
IF COL_LENGTH('dbo.WarrantyRecords', 'StartDate') IS NULL ALTER TABLE [dbo].[WarrantyRecords] ADD [StartDate] DATETIME2 NULL;
IF COL_LENGTH('dbo.WarrantyRecords', 'EndDate') IS NULL ALTER TABLE [dbo].[WarrantyRecords] ADD [EndDate] DATETIME2 NULL;
IF COL_LENGTH('dbo.WarrantyRecords', 'Status') IS NULL ALTER TABLE [dbo].[WarrantyRecords] ADD [Status] NVARCHAR(40) NULL;
IF COL_LENGTH('dbo.WarrantyRecords', 'UpdatedAt') IS NULL ALTER TABLE [dbo].[WarrantyRecords] ADD [UpdatedAt] DATETIME2 NULL;
IF COL_LENGTH('dbo.WarrantyRecords', 'Note') IS NULL ALTER TABLE [dbo].[WarrantyRecords] ADD [Note] NVARCHAR(1000) NULL;
GO

DECLARE @DefaultProductId INT = (SELECT TOP (1) [Id] FROM [dbo].[Products] ORDER BY [Id]);
UPDATE wr
SET [WarrantyCode] = COALESCE(NULLIF(wr.[WarrantyCode], N''), CONCAT(N'WR-', wr.[Id])),
    [ProductId] = COALESCE(wr.[ProductId], @DefaultProductId),
    [SerialOrImei] = COALESCE(wr.[SerialOrImei], wr.[SerialNumber]),
    [StartDate] = COALESCE(wr.[StartDate], CONVERT(DATETIME2, wr.[WarrantyStartDate]), CONVERT(DATETIME2, wr.[PurchaseDate]), wr.[CreatedAt], SYSUTCDATETIME()),
    [EndDate] = COALESCE(wr.[EndDate], CONVERT(DATETIME2, wr.[WarrantyEndDate]), DATEADD(MONTH, COALESCE(wr.[WarrantyMonths], 12), COALESCE(wr.[StartDate], CONVERT(DATETIME2, wr.[PurchaseDate]), wr.[CreatedAt], SYSUTCDATETIME()))),
    [WarrantyMonths] = COALESCE(wr.[WarrantyMonths], 12),
    [Status] = COALESCE(NULLIF(wr.[Status], N''), CASE WHEN wr.[IsActive] = 0 THEN N'Inactive' ELSE N'Active' END),
    [CreatedAt] = COALESCE(wr.[CreatedAt], SYSUTCDATETIME())
FROM [dbo].[WarrantyRecords] wr
WHERE @DefaultProductId IS NOT NULL;
GO

IF OBJECT_ID(N'[dbo].[WarrantyClaims]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[WarrantyClaims] (
        [Id] INT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_WarrantyClaims] PRIMARY KEY,
        [ClaimCode] NVARCHAR(40) NOT NULL,
        [WarrantyId] INT NULL,
        [UserId] UNIQUEIDENTIFIER NULL,
        [OrderId] INT NULL,
        [OrderDetailId] INT NULL,
        [ProductId] INT NOT NULL,
        [VariantId] INT NULL,
        [StockItemId] INT NULL,
        [SerialOrImei] NVARCHAR(120) NULL,
        [CustomerName] NVARCHAR(160) NULL,
        [CustomerPhone] NVARCHAR(30) NULL,
        [CustomerEmail] NVARCHAR(160) NULL,
        [IssueDescription] NVARCHAR(2000) NOT NULL,
        [ReceiveMethod] NVARCHAR(40) NOT NULL CONSTRAINT [DF_WarrantyClaims_ReceiveMethod] DEFAULT N'DropOff',
        [ReturnAddress] NVARCHAR(500) NULL,
        [Status] NVARCHAR(40) NOT NULL CONSTRAINT [DF_WarrantyClaims_Status] DEFAULT N'Pending',
        [Priority] NVARCHAR(40) NOT NULL CONSTRAINT [DF_WarrantyClaims_Priority] DEFAULT N'Normal',
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [DF_WarrantyClaims_CreatedAt] DEFAULT SYSUTCDATETIME(),
        [UpdatedAt] DATETIME2 NULL,
        [ReceivedAt] DATETIME2 NULL,
        [CompletedAt] DATETIME2 NULL,
        [RejectedReason] NVARCHAR(1000) NULL,
        [Note] NVARCHAR(1000) NULL
    );
END
GO

IF COL_LENGTH('dbo.WarrantyClaims', 'WarrantyId') IS NULL ALTER TABLE [dbo].[WarrantyClaims] ADD [WarrantyId] INT NULL;
IF COL_LENGTH('dbo.WarrantyClaims', 'UserId') IS NULL ALTER TABLE [dbo].[WarrantyClaims] ADD [UserId] UNIQUEIDENTIFIER NULL;
IF COL_LENGTH('dbo.WarrantyClaims', 'OrderId') IS NULL ALTER TABLE [dbo].[WarrantyClaims] ADD [OrderId] INT NULL;
IF COL_LENGTH('dbo.WarrantyClaims', 'OrderDetailId') IS NULL ALTER TABLE [dbo].[WarrantyClaims] ADD [OrderDetailId] INT NULL;
IF COL_LENGTH('dbo.WarrantyClaims', 'ProductId') IS NULL ALTER TABLE [dbo].[WarrantyClaims] ADD [ProductId] INT NULL;
IF COL_LENGTH('dbo.WarrantyClaims', 'VariantId') IS NULL ALTER TABLE [dbo].[WarrantyClaims] ADD [VariantId] INT NULL;
IF COL_LENGTH('dbo.WarrantyClaims', 'StockItemId') IS NULL ALTER TABLE [dbo].[WarrantyClaims] ADD [StockItemId] INT NULL;
IF COL_LENGTH('dbo.WarrantyClaims', 'SerialOrImei') IS NULL ALTER TABLE [dbo].[WarrantyClaims] ADD [SerialOrImei] NVARCHAR(120) NULL;
IF COL_LENGTH('dbo.WarrantyClaims', 'CustomerName') IS NULL ALTER TABLE [dbo].[WarrantyClaims] ADD [CustomerName] NVARCHAR(160) NULL;
IF COL_LENGTH('dbo.WarrantyClaims', 'CustomerPhone') IS NULL ALTER TABLE [dbo].[WarrantyClaims] ADD [CustomerPhone] NVARCHAR(30) NULL;
IF COL_LENGTH('dbo.WarrantyClaims', 'CustomerEmail') IS NULL ALTER TABLE [dbo].[WarrantyClaims] ADD [CustomerEmail] NVARCHAR(160) NULL;
IF COL_LENGTH('dbo.WarrantyClaims', 'ReceiveMethod') IS NULL ALTER TABLE [dbo].[WarrantyClaims] ADD [ReceiveMethod] NVARCHAR(40) NULL;
IF COL_LENGTH('dbo.WarrantyClaims', 'ReturnAddress') IS NULL ALTER TABLE [dbo].[WarrantyClaims] ADD [ReturnAddress] NVARCHAR(500) NULL;
IF COL_LENGTH('dbo.WarrantyClaims', 'Priority') IS NULL ALTER TABLE [dbo].[WarrantyClaims] ADD [Priority] NVARCHAR(40) NULL;
IF COL_LENGTH('dbo.WarrantyClaims', 'UpdatedAt') IS NULL ALTER TABLE [dbo].[WarrantyClaims] ADD [UpdatedAt] DATETIME2 NULL;
IF COL_LENGTH('dbo.WarrantyClaims', 'ReceivedAt') IS NULL ALTER TABLE [dbo].[WarrantyClaims] ADD [ReceivedAt] DATETIME2 NULL;
IF COL_LENGTH('dbo.WarrantyClaims', 'CompletedAt') IS NULL ALTER TABLE [dbo].[WarrantyClaims] ADD [CompletedAt] DATETIME2 NULL;
IF COL_LENGTH('dbo.WarrantyClaims', 'RejectedReason') IS NULL ALTER TABLE [dbo].[WarrantyClaims] ADD [RejectedReason] NVARCHAR(1000) NULL;
IF COL_LENGTH('dbo.WarrantyClaims', 'Note') IS NULL ALTER TABLE [dbo].[WarrantyClaims] ADD [Note] NVARCHAR(1000) NULL;
GO

DECLARE @DefaultProductId INT = (SELECT TOP (1) [Id] FROM [dbo].[Products] ORDER BY [Id]);
UPDATE wc
SET [WarrantyId] = COALESCE(wc.[WarrantyId], wc.[WarrantyRecordId]),
    [ProductId] = COALESCE(wc.[ProductId], wr.[ProductId], @DefaultProductId),
    [VariantId] = COALESCE(wc.[VariantId], wr.[VariantId]),
    [StockItemId] = COALESCE(wc.[StockItemId], wr.[StockItemId]),
    [SerialOrImei] = COALESCE(wc.[SerialOrImei], wr.[SerialOrImei], wr.[SerialNumber]),
    [CustomerName] = COALESCE(wc.[CustomerName], wr.[CustomerName]),
    [CustomerPhone] = COALESCE(wc.[CustomerPhone], wr.[CustomerPhone]),
    [CustomerEmail] = COALESCE(wc.[CustomerEmail], wr.[CustomerEmail]),
    [IssueDescription] = COALESCE(NULLIF(wc.[IssueDescription], N''), N'Warranty claim'),
    [ReceiveMethod] = COALESCE(NULLIF(wc.[ReceiveMethod], N''), N'DropOff'),
    [Status] = COALESCE(NULLIF(wc.[Status], N''), N'Pending'),
    [Priority] = COALESCE(NULLIF(wc.[Priority], N''), N'Normal'),
    [CreatedAt] = COALESCE(wc.[CreatedAt], SYSUTCDATETIME())
FROM [dbo].[WarrantyClaims] wc
LEFT JOIN [dbo].[WarrantyRecords] wr ON wr.[Id] = wc.[WarrantyRecordId]
WHERE @DefaultProductId IS NOT NULL;
GO

IF OBJECT_ID(N'[dbo].[WarrantyClaimUpdates]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[WarrantyClaimUpdates] (
        [Id] INT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_WarrantyClaimUpdates] PRIMARY KEY,
        [WarrantyClaimId] INT NOT NULL,
        [Status] NVARCHAR(40) NOT NULL,
        [Title] NVARCHAR(200) NOT NULL,
        [Message] NVARCHAR(1000) NULL,
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [DF_WarrantyClaimUpdates_CreatedAt] DEFAULT SYSUTCDATETIME(),
        [CreatedByUserId] UNIQUEIDENTIFIER NULL
    );
END
GO

IF COL_LENGTH('dbo.WarrantyClaimUpdates', 'Title') IS NULL ALTER TABLE [dbo].[WarrantyClaimUpdates] ADD [Title] NVARCHAR(200) NULL;
IF COL_LENGTH('dbo.WarrantyClaimUpdates', 'Message') IS NULL ALTER TABLE [dbo].[WarrantyClaimUpdates] ADD [Message] NVARCHAR(1000) NULL;
IF COL_LENGTH('dbo.WarrantyClaimUpdates', 'CreatedByUserId') IS NULL ALTER TABLE [dbo].[WarrantyClaimUpdates] ADD [CreatedByUserId] UNIQUEIDENTIFIER NULL;
GO

UPDATE [dbo].[WarrantyClaimUpdates]
SET [Status] = COALESCE(NULLIF([Status], N''), N'Pending'),
    [Title] = COALESCE(NULLIF([Title], N''), NULLIF([Status], N''), N'Warranty update'),
    [Message] = COALESCE([Message], [Note]),
    [CreatedAt] = COALESCE([CreatedAt], SYSUTCDATETIME());
GO

IF OBJECT_ID(N'[dbo].[SupportTickets]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[SupportTickets] (
        [Id] INT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_SupportTickets] PRIMARY KEY,
        [TicketCode] NVARCHAR(40) NOT NULL,
        [UserId] UNIQUEIDENTIFIER NULL,
        [Subject] NVARCHAR(250) NOT NULL,
        [Description] NVARCHAR(3000) NOT NULL,
        [CustomerName] NVARCHAR(160) NULL,
        [CustomerPhone] NVARCHAR(30) NULL,
        [CustomerEmail] NVARCHAR(160) NULL,
        [RelatedOrderId] INT NULL,
        [RelatedProductId] INT NULL,
        [RelatedWarrantyId] INT NULL,
        [SerialOrImei] NVARCHAR(120) NULL,
        [Status] NVARCHAR(40) NOT NULL CONSTRAINT [DF_SupportTickets_Status] DEFAULT N'Open',
        [Priority] NVARCHAR(40) NOT NULL CONSTRAINT [DF_SupportTickets_Priority] DEFAULT N'Normal',
        [Category] NVARCHAR(40) NOT NULL CONSTRAINT [DF_SupportTickets_Category] DEFAULT N'Other',
        [AssignedToUserId] UNIQUEIDENTIFIER NULL,
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [DF_SupportTickets_CreatedAt] DEFAULT SYSUTCDATETIME(),
        [UpdatedAt] DATETIME2 NULL,
        [ClosedAt] DATETIME2 NULL
    );
END
GO

IF COL_LENGTH('dbo.SupportTickets', 'CustomerName') IS NULL ALTER TABLE [dbo].[SupportTickets] ADD [CustomerName] NVARCHAR(160) NULL;
IF COL_LENGTH('dbo.SupportTickets', 'CustomerPhone') IS NULL ALTER TABLE [dbo].[SupportTickets] ADD [CustomerPhone] NVARCHAR(30) NULL;
IF COL_LENGTH('dbo.SupportTickets', 'CustomerEmail') IS NULL ALTER TABLE [dbo].[SupportTickets] ADD [CustomerEmail] NVARCHAR(160) NULL;
IF COL_LENGTH('dbo.SupportTickets', 'RelatedOrderId') IS NULL ALTER TABLE [dbo].[SupportTickets] ADD [RelatedOrderId] INT NULL;
IF COL_LENGTH('dbo.SupportTickets', 'RelatedProductId') IS NULL ALTER TABLE [dbo].[SupportTickets] ADD [RelatedProductId] INT NULL;
IF COL_LENGTH('dbo.SupportTickets', 'RelatedWarrantyId') IS NULL ALTER TABLE [dbo].[SupportTickets] ADD [RelatedWarrantyId] INT NULL;
IF COL_LENGTH('dbo.SupportTickets', 'SerialOrImei') IS NULL ALTER TABLE [dbo].[SupportTickets] ADD [SerialOrImei] NVARCHAR(120) NULL;
IF COL_LENGTH('dbo.SupportTickets', 'AssignedToUserId') IS NULL ALTER TABLE [dbo].[SupportTickets] ADD [AssignedToUserId] UNIQUEIDENTIFIER NULL;
IF COL_LENGTH('dbo.SupportTickets', 'UpdatedAt') IS NULL ALTER TABLE [dbo].[SupportTickets] ADD [UpdatedAt] DATETIME2 NULL;
IF COL_LENGTH('dbo.SupportTickets', 'ClosedAt') IS NULL ALTER TABLE [dbo].[SupportTickets] ADD [ClosedAt] DATETIME2 NULL;
GO

UPDATE [dbo].[SupportTickets]
SET [TicketCode] = COALESCE(NULLIF([TicketCode], N''), CONCAT(N'TK-', [Id])),
    [Subject] = COALESCE(NULLIF([Subject], N''), N'Support ticket'),
    [Description] = COALESCE(NULLIF([Description], N''), [Subject], N'Support ticket'),
    [Status] = COALESCE(NULLIF([Status], N''), N'Open'),
    [Priority] = COALESCE(NULLIF([Priority], N''), N'Normal'),
    [Category] = COALESCE(NULLIF([Category], N''), N'Other'),
    [CreatedAt] = COALESCE([CreatedAt], SYSUTCDATETIME());
GO

IF OBJECT_ID(N'[dbo].[SupportTicketUpdates]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[SupportTicketUpdates] (
        [Id] INT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_SupportTicketUpdates] PRIMARY KEY,
        [TicketId] INT NOT NULL,
        [Message] NVARCHAR(3000) NOT NULL,
        [StatusAfter] NVARCHAR(40) NULL,
        [PriorityAfter] NVARCHAR(40) NULL,
        [CreatedByUserId] UNIQUEIDENTIFIER NULL,
        [IsInternalNote] BIT NOT NULL CONSTRAINT [DF_SupportTicketUpdates_IsInternalNote] DEFAULT 0,
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [DF_SupportTicketUpdates_CreatedAt] DEFAULT SYSUTCDATETIME()
    );
END
GO

IF COL_LENGTH('dbo.SupportTicketUpdates', 'TicketId') IS NULL ALTER TABLE [dbo].[SupportTicketUpdates] ADD [TicketId] INT NULL;
IF COL_LENGTH('dbo.SupportTicketUpdates', 'Message') IS NULL ALTER TABLE [dbo].[SupportTicketUpdates] ADD [Message] NVARCHAR(3000) NULL;
IF COL_LENGTH('dbo.SupportTicketUpdates', 'StatusAfter') IS NULL ALTER TABLE [dbo].[SupportTicketUpdates] ADD [StatusAfter] NVARCHAR(40) NULL;
IF COL_LENGTH('dbo.SupportTicketUpdates', 'PriorityAfter') IS NULL ALTER TABLE [dbo].[SupportTicketUpdates] ADD [PriorityAfter] NVARCHAR(40) NULL;
IF COL_LENGTH('dbo.SupportTicketUpdates', 'CreatedByUserId') IS NULL ALTER TABLE [dbo].[SupportTicketUpdates] ADD [CreatedByUserId] UNIQUEIDENTIFIER NULL;
IF COL_LENGTH('dbo.SupportTicketUpdates', 'IsInternalNote') IS NULL ALTER TABLE [dbo].[SupportTicketUpdates] ADD [IsInternalNote] BIT NULL;
GO

UPDATE [dbo].[SupportTicketUpdates]
SET [TicketId] = COALESCE([TicketId], [SupportTicketId]),
    [Message] = COALESCE(NULLIF([Message], N''), NULLIF([Note], N''), N'Ticket update'),
    [StatusAfter] = COALESCE([StatusAfter], [Status]),
    [IsInternalNote] = COALESCE([IsInternalNote], 0),
    [CreatedAt] = COALESCE([CreatedAt], SYSUTCDATETIME());
GO

IF OBJECT_ID(N'[dbo].[RepairCases]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[RepairCases] (
        [Id] INT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_RepairCases] PRIMARY KEY,
        [RepairCode] NVARCHAR(40) NOT NULL,
        [WarrantyClaimId] INT NULL,
        [TicketId] INT NULL,
        [StockItemId] INT NULL,
        [ProductId] INT NOT NULL,
        [VariantId] INT NULL,
        [SerialOrImei] NVARCHAR(120) NULL,
        [CustomerName] NVARCHAR(160) NULL,
        [CustomerPhone] NVARCHAR(30) NULL,
        [ProductName] NVARCHAR(250) NULL,
        [IssueDescription] NVARCHAR(2000) NOT NULL,
        [Diagnosis] NVARCHAR(2000) NULL,
        [Solution] NVARCHAR(2000) NULL,
        [TechnicianId] UNIQUEIDENTIFIER NULL,
        [Status] NVARCHAR(40) NOT NULL CONSTRAINT [DF_RepairCases_Status] DEFAULT N'Pending',
        [Priority] NVARCHAR(40) NOT NULL CONSTRAINT [DF_RepairCases_Priority] DEFAULT N'Normal',
        [ReceivedAt] DATETIME2 NOT NULL CONSTRAINT [DF_RepairCases_ReceivedAt] DEFAULT SYSUTCDATETIME(),
        [EstimatedCompletionAt] DATETIME2 NULL,
        [CompletedAt] DATETIME2 NULL,
        [CostEstimate] DECIMAL(18,2) NOT NULL CONSTRAINT [DF_RepairCases_CostEstimate] DEFAULT 0,
        [FinalCost] DECIMAL(18,2) NOT NULL CONSTRAINT [DF_RepairCases_FinalCost] DEFAULT 0,
        [IsWarrantyCovered] BIT NOT NULL CONSTRAINT [DF_RepairCases_IsWarrantyCovered] DEFAULT 0,
        [CustomerApprovedCost] BIT NOT NULL CONSTRAINT [DF_RepairCases_CustomerApprovedCost] DEFAULT 0,
        [Note] NVARCHAR(1000) NULL,
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [DF_RepairCases_CreatedAt] DEFAULT SYSUTCDATETIME(),
        [UpdatedAt] DATETIME2 NULL
    );
END
GO

IF COL_LENGTH('dbo.RepairCases', 'RepairCode') IS NULL ALTER TABLE [dbo].[RepairCases] ADD [RepairCode] NVARCHAR(40) NULL;
IF COL_LENGTH('dbo.RepairCases', 'WarrantyClaimId') IS NULL ALTER TABLE [dbo].[RepairCases] ADD [WarrantyClaimId] INT NULL;
IF COL_LENGTH('dbo.RepairCases', 'TicketId') IS NULL ALTER TABLE [dbo].[RepairCases] ADD [TicketId] INT NULL;
IF COL_LENGTH('dbo.RepairCases', 'StockItemId') IS NULL ALTER TABLE [dbo].[RepairCases] ADD [StockItemId] INT NULL;
IF COL_LENGTH('dbo.RepairCases', 'VariantId') IS NULL ALTER TABLE [dbo].[RepairCases] ADD [VariantId] INT NULL;
IF COL_LENGTH('dbo.RepairCases', 'SerialOrImei') IS NULL ALTER TABLE [dbo].[RepairCases] ADD [SerialOrImei] NVARCHAR(120) NULL;
IF COL_LENGTH('dbo.RepairCases', 'ProductName') IS NULL ALTER TABLE [dbo].[RepairCases] ADD [ProductName] NVARCHAR(250) NULL;
IF COL_LENGTH('dbo.RepairCases', 'Diagnosis') IS NULL ALTER TABLE [dbo].[RepairCases] ADD [Diagnosis] NVARCHAR(2000) NULL;
IF COL_LENGTH('dbo.RepairCases', 'Solution') IS NULL ALTER TABLE [dbo].[RepairCases] ADD [Solution] NVARCHAR(2000) NULL;
IF COL_LENGTH('dbo.RepairCases', 'TechnicianId') IS NULL ALTER TABLE [dbo].[RepairCases] ADD [TechnicianId] UNIQUEIDENTIFIER NULL;
IF COL_LENGTH('dbo.RepairCases', 'Priority') IS NULL ALTER TABLE [dbo].[RepairCases] ADD [Priority] NVARCHAR(40) NULL;
IF COL_LENGTH('dbo.RepairCases', 'ReceivedAt') IS NULL ALTER TABLE [dbo].[RepairCases] ADD [ReceivedAt] DATETIME2 NULL;
IF COL_LENGTH('dbo.RepairCases', 'EstimatedCompletionAt') IS NULL ALTER TABLE [dbo].[RepairCases] ADD [EstimatedCompletionAt] DATETIME2 NULL;
IF COL_LENGTH('dbo.RepairCases', 'CompletedAt') IS NULL ALTER TABLE [dbo].[RepairCases] ADD [CompletedAt] DATETIME2 NULL;
IF COL_LENGTH('dbo.RepairCases', 'CostEstimate') IS NULL ALTER TABLE [dbo].[RepairCases] ADD [CostEstimate] DECIMAL(18,2) NULL;
IF COL_LENGTH('dbo.RepairCases', 'FinalCost') IS NULL ALTER TABLE [dbo].[RepairCases] ADD [FinalCost] DECIMAL(18,2) NULL;
IF COL_LENGTH('dbo.RepairCases', 'IsWarrantyCovered') IS NULL ALTER TABLE [dbo].[RepairCases] ADD [IsWarrantyCovered] BIT NULL;
IF COL_LENGTH('dbo.RepairCases', 'CustomerApprovedCost') IS NULL ALTER TABLE [dbo].[RepairCases] ADD [CustomerApprovedCost] BIT NULL;
IF COL_LENGTH('dbo.RepairCases', 'Note') IS NULL ALTER TABLE [dbo].[RepairCases] ADD [Note] NVARCHAR(1000) NULL;
IF COL_LENGTH('dbo.RepairCases', 'UpdatedAt') IS NULL ALTER TABLE [dbo].[RepairCases] ADD [UpdatedAt] DATETIME2 NULL;
GO

DECLARE @DefaultProductId INT = (SELECT TOP (1) [Id] FROM [dbo].[Products] ORDER BY [Id]);
UPDATE rc
SET [RepairCode] = COALESCE(NULLIF(rc.[RepairCode], N''), NULLIF(rc.[CaseCode], N''), CONCAT(N'RP-', rc.[Id])),
    [ProductId] = COALESCE(rc.[ProductId], @DefaultProductId),
    [SerialOrImei] = COALESCE(rc.[SerialOrImei], rc.[SerialNumber]),
    [IssueDescription] = COALESCE(NULLIF(rc.[IssueDescription], N''), N'Repair case'),
    [Status] = COALESCE(NULLIF(rc.[Status], N''), N'Pending'),
    [Priority] = COALESCE(NULLIF(rc.[Priority], N''), N'Normal'),
    [ReceivedAt] = COALESCE(rc.[ReceivedAt], rc.[CreatedAt], SYSUTCDATETIME()),
    [CostEstimate] = COALESCE(rc.[CostEstimate], rc.[EstimatedCost], 0),
    [FinalCost] = COALESCE(rc.[FinalCost], rc.[ActualCost], 0),
    [IsWarrantyCovered] = COALESCE(rc.[IsWarrantyCovered], 0),
    [CustomerApprovedCost] = COALESCE(rc.[CustomerApprovedCost], 0),
    [CreatedAt] = COALESCE(rc.[CreatedAt], SYSUTCDATETIME())
FROM [dbo].[RepairCases] rc
WHERE @DefaultProductId IS NOT NULL;
GO

IF OBJECT_ID(N'[dbo].[RepairUpdates]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[RepairUpdates] (
        [Id] INT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_RepairUpdates] PRIMARY KEY,
        [RepairCaseId] INT NOT NULL,
        [Status] NVARCHAR(40) NOT NULL,
        [Title] NVARCHAR(200) NOT NULL,
        [Message] NVARCHAR(1000) NULL,
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [DF_RepairUpdates_CreatedAt] DEFAULT SYSUTCDATETIME(),
        [CreatedByUserId] UNIQUEIDENTIFIER NULL
    );
END
GO

IF COL_LENGTH('dbo.RepairUpdates', 'Title') IS NULL ALTER TABLE [dbo].[RepairUpdates] ADD [Title] NVARCHAR(200) NULL;
IF COL_LENGTH('dbo.RepairUpdates', 'Message') IS NULL ALTER TABLE [dbo].[RepairUpdates] ADD [Message] NVARCHAR(1000) NULL;
IF COL_LENGTH('dbo.RepairUpdates', 'CreatedByUserId') IS NULL ALTER TABLE [dbo].[RepairUpdates] ADD [CreatedByUserId] UNIQUEIDENTIFIER NULL;
GO

UPDATE [dbo].[RepairUpdates]
SET [Status] = COALESCE(NULLIF([Status], N''), N'Pending'),
    [Title] = COALESCE(NULLIF([Title], N''), NULLIF([Status], N''), N'Repair update'),
    [Message] = COALESCE([Message], [Note]),
    [CreatedAt] = COALESCE([CreatedAt], SYSUTCDATETIME());
GO

IF COL_LENGTH('dbo.Notifications', 'Type') IS NULL ALTER TABLE [dbo].[Notifications] ADD [Type] NVARCHAR(40) NULL;
IF COL_LENGTH('dbo.Notifications', 'ReferenceType') IS NULL ALTER TABLE [dbo].[Notifications] ADD [ReferenceType] NVARCHAR(40) NULL;
IF COL_LENGTH('dbo.Notifications', 'ReferenceId') IS NULL ALTER TABLE [dbo].[Notifications] ADD [ReferenceId] INT NULL;
IF COL_LENGTH('dbo.Notifications', 'ReadAt') IS NULL ALTER TABLE [dbo].[Notifications] ADD [ReadAt] DATETIME2 NULL;
GO

UPDATE [dbo].[Notifications]
SET [Message] = COALESCE(NULLIF([Message], N''), [Title], N'Notification'),
    [Type] = COALESCE(NULLIF([Type], N''), N'System'),
    [ReferenceType] = COALESCE(NULLIF([ReferenceType], N''), N'None'),
    [IsRead] = COALESCE([IsRead], 0),
    [CreatedAt] = COALESCE([CreatedAt], SYSUTCDATETIME());
GO

IF COL_LENGTH('dbo.Attachments', 'FileUrl') IS NULL ALTER TABLE [dbo].[Attachments] ADD [FileUrl] NVARCHAR(500) NULL;
IF COL_LENGTH('dbo.Attachments', 'ContentType') IS NULL ALTER TABLE [dbo].[Attachments] ADD [ContentType] NVARCHAR(120) NULL;
IF COL_LENGTH('dbo.Attachments', 'Size') IS NULL ALTER TABLE [dbo].[Attachments] ADD [Size] BIGINT NULL;
IF COL_LENGTH('dbo.Attachments', 'UploadedByUserId') IS NULL ALTER TABLE [dbo].[Attachments] ADD [UploadedByUserId] UNIQUEIDENTIFIER NULL;
GO

UPDATE [dbo].[Attachments]
SET [EntityType] = COALESCE(NULLIF([EntityType], N''), N'None'),
    [FileUrl] = COALESCE(NULLIF([FileUrl], N''), [FilePath], N''),
    [ContentType] = COALESCE(NULLIF([ContentType], N''), [MimeType], N'application/octet-stream'),
    [Size] = COALESCE([Size], [FileSize], 0),
    [CreatedAt] = COALESCE([CreatedAt], SYSUTCDATETIME());
GO

PRINT 'TechStore support, warranty, repair and notification schema synchronized.';
GO
