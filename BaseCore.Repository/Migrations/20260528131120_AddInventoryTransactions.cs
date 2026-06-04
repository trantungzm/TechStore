using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddInventoryTransactions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Attachments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EntityType = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    EntityId = table.Column<int>(type: "int", nullable: true),
                    FileName = table.Column<string>(type: "nvarchar(260)", maxLength: 260, nullable: false),
                    FileUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ContentType = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Size = table.Column<long>(type: "bigint", nullable: false),
                    UploadedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Attachments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Coupons",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Type = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    DiscountType = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    DiscountValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    MaxDiscountAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    MinOrderAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    StartAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TotalQuantity = table.Column<int>(type: "int", nullable: false),
                    UsedQuantity = table.Column<int>(type: "int", nullable: false),
                    ClaimedQuantity = table.Column<int>(type: "int", nullable: false),
                    PerUserLimit = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsPublic = table.Column<bool>(type: "bit", nullable: false),
                    IsAutoClaimable = table.Column<bool>(type: "bit", nullable: false),
                    IsStackable = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Coupons", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    ReferenceType = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    ReferenceId = table.Column<int>(type: "int", nullable: true),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    ReadAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderCode = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CustomerName = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    CustomerPhone = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    CustomerEmail = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    OrderDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Subtotal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ProductDiscount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ShippingFee = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ShippingDiscount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true, defaultValue: "Pending"),
                    PaymentMethod = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    PaymentStatus = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true, defaultValue: "Unpaid"),
                    TransactionId = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    ShippingMethod = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    ShippingAddress = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Province = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    District = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    Ward = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    AddressDetail = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    StorePickupLocation = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    ExpectedPickupTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    InvoiceRequired = table.Column<bool>(type: "bit", nullable: false),
                    InvoiceCompanyName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    InvoiceTaxCode = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    InvoiceAddress = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    InvoiceEmail = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CancelReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CancelRequestedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CancelReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CancelReviewedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CancelReviewNote = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orders", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(24)", maxLength: 24, nullable: false),
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Created = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Modified = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    RoleType = table.Column<int>(type: "int", nullable: false),
                    CreatedDateTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedUser = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "StoreSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StoreName = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Hotline = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    SupportEmail = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    WarrantyAddress = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DefaultShippingFee = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    FreeShippingThreshold = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    SupportTime = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    LogoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    FacebookUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ZaloUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StoreSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Suppliers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SupplierCode = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    Address = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    TaxCode = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    ContactPerson = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    SupplierType = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Note = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Suppliers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UserName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Password = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Salt = table.Column<byte[]>(type: "varbinary(max)", nullable: true),
                    Contact = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    DateOfBirth = table.Column<DateTime>(type: "date", nullable: true),
                    Position = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Image = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    UserType = table.Column<int>(type: "int", nullable: false),
                    Created = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Warehouses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Warehouses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SpecDefinitions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CategoryId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DataType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false, defaultValue: "text"),
                    InputType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false, defaultValue: "text"),
                    Unit = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false),
                    IsFilterable = table.Column<bool>(type: "bit", nullable: false),
                    IsComparable = table.Column<bool>(type: "bit", nullable: false),
                    AllowCustomValue = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpecDefinitions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SpecDefinitions_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserCoupons",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CouponId = table.Column<int>(type: "int", nullable: false),
                    ClaimedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UsedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false, defaultValue: "Claimed"),
                    ExpiredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCoupons", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserCoupons_Coupons_CouponId",
                        column: x => x.CouponId,
                        principalTable: "Coupons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VoucherSpins",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SpinDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RewardCouponId = table.Column<int>(type: "int", nullable: true),
                    RewardCode = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: true),
                    ResultType = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VoucherSpins", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VoucherSpins_Coupons_RewardCouponId",
                        column: x => x.RewardCouponId,
                        principalTable: "Coupons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "OrderCancellations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderId = table.Column<int>(type: "int", nullable: false),
                    RequestedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Reason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false, defaultValue: "Pending"),
                    AdminNote = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ReviewedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    RequestedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    ReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderCancellations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderCancellations_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrderTimelines",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Note = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderTimelines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderTimelines_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CategorySuppliers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CategoryId = table.Column<int>(type: "int", nullable: false),
                    SupplierId = table.Column<int>(type: "int", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CategorySuppliers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CategorySuppliers_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CategorySuppliers_Suppliers_SupplierId",
                        column: x => x.SupplierId,
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(220)", maxLength: 220, nullable: true),
                    Sku = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    Price = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    OriginalPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    Stock = table.Column<int>(type: "int", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    LongDescription = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    Brand = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    SupplierId = table.Column<int>(type: "int", nullable: true),
                    BackupSupplierId = table.Column<int>(type: "int", nullable: true),
                    SupplyType = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    WarrantyProvider = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    CategoryId = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    IsFeatured = table.Column<bool>(type: "bit", nullable: false),
                    IsBestSeller = table.Column<bool>(type: "bit", nullable: false),
                    IsNewArrival = table.Column<bool>(type: "bit", nullable: false),
                    IsDiscounted = table.Column<bool>(type: "bit", nullable: false),
                    RequiresSerialTracking = table.Column<bool>(type: "bit", nullable: false),
                    WarrantyMonths = table.Column<int>(type: "int", nullable: false, defaultValue: 12),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Products_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Products_Suppliers_BackupSupplierId",
                        column: x => x.BackupSupplierId,
                        principalTable: "Suppliers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Products_Suppliers_SupplierId",
                        column: x => x.SupplierId,
                        principalTable: "Suppliers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "GoodsReceipts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReceiptCode = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    SupplierId = table.Column<int>(type: "int", nullable: true),
                    SupplierName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    WarehouseId = table.Column<int>(type: "int", nullable: true),
                    ReceivedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Note = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    TotalQuantity = table.Column<int>(type: "int", nullable: false),
                    TotalCost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GoodsReceipts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GoodsReceipts_Suppliers_SupplierId",
                        column: x => x.SupplierId,
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_GoodsReceipts_Warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "SpecOptions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SpecDefinitionId = table.Column<int>(type: "int", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpecOptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SpecOptions_SpecDefinitions_SpecDefinitionId",
                        column: x => x.SpecDefinitionId,
                        principalTable: "SpecDefinitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrderCoupons",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderId = table.Column<int>(type: "int", nullable: false),
                    CouponId = table.Column<int>(type: "int", nullable: false),
                    UserCouponId = table.Column<int>(type: "int", nullable: true),
                    CouponCode = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    CouponName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CouponType = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    DiscountType = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    DiscountValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderCoupons", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderCoupons_Coupons_CouponId",
                        column: x => x.CouponId,
                        principalTable: "Coupons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OrderCoupons_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrderCoupons_UserCoupons_UserCouponId",
                        column: x => x.UserCouponId,
                        principalTable: "UserCoupons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "CouponScopes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CouponId = table.Column<int>(type: "int", nullable: false),
                    ScopeType = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: true),
                    CategoryId = table.Column<int>(type: "int", nullable: true),
                    Brand = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CouponScopes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CouponScopes_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_CouponScopes_Coupons_CouponId",
                        column: x => x.CouponId,
                        principalTable: "Coupons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CouponScopes_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ProductImages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    AltText = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductImages_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductRecommendations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    RecommendedProductId = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductRecommendations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductRecommendations_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductRecommendations_Products_RecommendedProductId",
                        column: x => x.RecommendedProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProductVariants",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    VariantName = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    ColorName = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    ColorCode = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: true),
                    Storage = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    Ram = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    Price = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    OriginalPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    Stock = table.Column<int>(type: "int", nullable: false),
                    Sku = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductVariants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductVariants_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductSpecValues",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    SpecDefinitionId = table.Column<int>(type: "int", nullable: false),
                    SpecOptionId = table.Column<int>(type: "int", nullable: true),
                    ValueText = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ValueNumber = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: true),
                    ValueBool = table.Column<bool>(type: "bit", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductSpecValues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductSpecValues_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductSpecValues_SpecDefinitions_SpecDefinitionId",
                        column: x => x.SpecDefinitionId,
                        principalTable: "SpecDefinitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductSpecValues_SpecOptions_SpecOptionId",
                        column: x => x.SpecOptionId,
                        principalTable: "SpecOptions",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "GoodsReceiptLines",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GoodsReceiptId = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    VariantId = table.Column<int>(type: "int", nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    UnitCost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalCost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GoodsReceiptLines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GoodsReceiptLines_GoodsReceipts_GoodsReceiptId",
                        column: x => x.GoodsReceiptId,
                        principalTable: "GoodsReceipts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GoodsReceiptLines_ProductVariants_VariantId",
                        column: x => x.VariantId,
                        principalTable: "ProductVariants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GoodsReceiptLines_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InventoryTransactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    VariantId = table.Column<int>(type: "int", nullable: true),
                    Type = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    UnitCost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    ReferenceId = table.Column<int>(type: "int", nullable: true),
                    Note = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventoryTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InventoryTransactions_ProductVariants_VariantId",
                        column: x => x.VariantId,
                        principalTable: "ProductVariants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InventoryTransactions_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OrderDetails",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderId = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    VariantId = table.Column<int>(type: "int", nullable: true),
                    ProductName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    ProductImage = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Sku = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SelectedColor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SelectedVersion = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    SerialOrImei = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderDetails_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrderDetails_ProductVariants_VariantId",
                        column: x => x.VariantId,
                        principalTable: "ProductVariants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OrderDetails_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "StockItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    VariantId = table.Column<int>(type: "int", nullable: true),
                    WarehouseId = table.Column<int>(type: "int", nullable: true),
                    SupplierId = table.Column<int>(type: "int", nullable: true),
                    SerialOrImei = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Sku = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false, defaultValue: "InStock"),
                    UnitCost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    SupplierName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ReceivedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SoldAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    OrderId = table.Column<int>(type: "int", nullable: true),
                    OrderDetailId = table.Column<int>(type: "int", nullable: true),
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Note = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StockItems_OrderDetails_OrderDetailId",
                        column: x => x.OrderDetailId,
                        principalTable: "OrderDetails",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_StockItems_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_StockItems_ProductVariants_VariantId",
                        column: x => x.VariantId,
                        principalTable: "ProductVariants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockItems_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockItems_Suppliers_SupplierId",
                        column: x => x.SupplierId,
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_StockItems_Warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "GoodsReceiptSerials",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GoodsReceiptLineId = table.Column<int>(type: "int", nullable: false),
                    StockItemId = table.Column<int>(type: "int", nullable: false),
                    SerialOrImei = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GoodsReceiptSerials", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GoodsReceiptSerials_GoodsReceiptLines_GoodsReceiptLineId",
                        column: x => x.GoodsReceiptLineId,
                        principalTable: "GoodsReceiptLines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GoodsReceiptSerials_StockItems_StockItemId",
                        column: x => x.StockItemId,
                        principalTable: "StockItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InventoryReturns",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReturnCode = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    OrderId = table.Column<int>(type: "int", nullable: true),
                    OrderDetailId = table.Column<int>(type: "int", nullable: true),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    VariantId = table.Column<int>(type: "int", nullable: true),
                    StockItemId = table.Column<int>(type: "int", nullable: true),
                    SerialOrImei = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    CustomerName = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    CustomerPhone = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    Reason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Condition = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false, defaultValue: "Pending"),
                    RefundAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Note = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ReviewedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ReviewNote = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventoryReturns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InventoryReturns_OrderDetails_OrderDetailId",
                        column: x => x.OrderDetailId,
                        principalTable: "OrderDetails",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_InventoryReturns_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_InventoryReturns_ProductVariants_VariantId",
                        column: x => x.VariantId,
                        principalTable: "ProductVariants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InventoryReturns_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InventoryReturns_StockItems_StockItemId",
                        column: x => x.StockItemId,
                        principalTable: "StockItems",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "OrderDetailStockItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderDetailId = table.Column<int>(type: "int", nullable: false),
                    StockItemId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderDetailStockItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderDetailStockItems_OrderDetails_OrderDetailId",
                        column: x => x.OrderDetailId,
                        principalTable: "OrderDetails",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrderDetailStockItems_StockItems_StockItemId",
                        column: x => x.StockItemId,
                        principalTable: "StockItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "StockMovements",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    VariantId = table.Column<int>(type: "int", nullable: true),
                    StockItemId = table.Column<int>(type: "int", nullable: true),
                    WarehouseId = table.Column<int>(type: "int", nullable: true),
                    Type = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    FromStatus = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    ToStatus = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    ReferenceType = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    ReferenceId = table.Column<int>(type: "int", nullable: true),
                    Note = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockMovements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StockMovements_ProductVariants_VariantId",
                        column: x => x.VariantId,
                        principalTable: "ProductVariants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockMovements_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockMovements_StockItems_StockItemId",
                        column: x => x.StockItemId,
                        principalTable: "StockItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_StockMovements_Warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "WarrantyRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WarrantyCode = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OrderId = table.Column<int>(type: "int", nullable: true),
                    OrderDetailId = table.Column<int>(type: "int", nullable: true),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    VariantId = table.Column<int>(type: "int", nullable: true),
                    StockItemId = table.Column<int>(type: "int", nullable: true),
                    SerialOrImei = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    CustomerName = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    CustomerPhone = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    CustomerEmail = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    ProductName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    ProductImage = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    WarrantyMonths = table.Column<int>(type: "int", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false, defaultValue: "Active"),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Note = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WarrantyRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WarrantyRecords_OrderDetails_OrderDetailId",
                        column: x => x.OrderDetailId,
                        principalTable: "OrderDetails",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WarrantyRecords_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WarrantyRecords_ProductVariants_VariantId",
                        column: x => x.VariantId,
                        principalTable: "ProductVariants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WarrantyRecords_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WarrantyRecords_StockItems_StockItemId",
                        column: x => x.StockItemId,
                        principalTable: "StockItems",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "SupportTickets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TicketCode = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Subject = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(3000)", maxLength: 3000, nullable: false),
                    CustomerName = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    CustomerPhone = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    CustomerEmail = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    RelatedOrderId = table.Column<int>(type: "int", nullable: true),
                    RelatedProductId = table.Column<int>(type: "int", nullable: true),
                    RelatedWarrantyId = table.Column<int>(type: "int", nullable: true),
                    SerialOrImei = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false, defaultValue: "Open"),
                    Priority = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false, defaultValue: "Normal"),
                    Category = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false, defaultValue: "Other"),
                    AssignedToUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ClosedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupportTickets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SupportTickets_Orders_RelatedOrderId",
                        column: x => x.RelatedOrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_SupportTickets_Products_RelatedProductId",
                        column: x => x.RelatedProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_SupportTickets_WarrantyRecords_RelatedWarrantyId",
                        column: x => x.RelatedWarrantyId,
                        principalTable: "WarrantyRecords",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "WarrantyClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClaimCode = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    WarrantyId = table.Column<int>(type: "int", nullable: true),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OrderId = table.Column<int>(type: "int", nullable: true),
                    OrderDetailId = table.Column<int>(type: "int", nullable: true),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    VariantId = table.Column<int>(type: "int", nullable: true),
                    StockItemId = table.Column<int>(type: "int", nullable: true),
                    SerialOrImei = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    CustomerName = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    CustomerPhone = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    CustomerEmail = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    IssueDescription = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    ReceiveMethod = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    ReturnAddress = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false, defaultValue: "Pending"),
                    Priority = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false, defaultValue: "Normal"),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReceivedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RejectedReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Note = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WarrantyClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WarrantyClaims_ProductVariants_VariantId",
                        column: x => x.VariantId,
                        principalTable: "ProductVariants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WarrantyClaims_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WarrantyClaims_StockItems_StockItemId",
                        column: x => x.StockItemId,
                        principalTable: "StockItems",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WarrantyClaims_WarrantyRecords_WarrantyId",
                        column: x => x.WarrantyId,
                        principalTable: "WarrantyRecords",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "SupportTicketUpdates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TicketId = table.Column<int>(type: "int", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(3000)", maxLength: 3000, nullable: false),
                    StatusAfter = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    PriorityAfter = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsInternalNote = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupportTicketUpdates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SupportTicketUpdates_SupportTickets_TicketId",
                        column: x => x.TicketId,
                        principalTable: "SupportTickets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RepairCases",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RepairCode = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    WarrantyClaimId = table.Column<int>(type: "int", nullable: true),
                    TicketId = table.Column<int>(type: "int", nullable: true),
                    StockItemId = table.Column<int>(type: "int", nullable: true),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    VariantId = table.Column<int>(type: "int", nullable: true),
                    SerialOrImei = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    CustomerName = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    CustomerPhone = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    ProductName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    IssueDescription = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Diagnosis = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Solution = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    TechnicianId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false, defaultValue: "Pending"),
                    Priority = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false, defaultValue: "Normal"),
                    ReceivedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EstimatedCompletionAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CostEstimate = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    FinalCost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    IsWarrantyCovered = table.Column<bool>(type: "bit", nullable: false),
                    CustomerApprovedCost = table.Column<bool>(type: "bit", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RepairCases", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RepairCases_ProductVariants_VariantId",
                        column: x => x.VariantId,
                        principalTable: "ProductVariants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RepairCases_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RepairCases_StockItems_StockItemId",
                        column: x => x.StockItemId,
                        principalTable: "StockItems",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RepairCases_SupportTickets_TicketId",
                        column: x => x.TicketId,
                        principalTable: "SupportTickets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_RepairCases_WarrantyClaims_WarrantyClaimId",
                        column: x => x.WarrantyClaimId,
                        principalTable: "WarrantyClaims",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "WarrantyClaimUpdates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WarrantyClaimId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WarrantyClaimUpdates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WarrantyClaimUpdates_WarrantyClaims_WarrantyClaimId",
                        column: x => x.WarrantyClaimId,
                        principalTable: "WarrantyClaims",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RepairUpdates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RepairCaseId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RepairUpdates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RepairUpdates_RepairCases_RepairCaseId",
                        column: x => x.RepairCaseId,
                        principalTable: "RepairCases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Description", "Name" },
                values: new object[,]
                {
                    { 1, "Dien thoai va thiet bi di dong", "Dien thoai" },
                    { 2, "Laptop va may tinh xach tay", "Laptop" },
                    { 3, "Phu kien dien tu", "Accessories" },
                    { 4, "May tinh bang", "Tablet" },
                    { 5, "Dong ho thong minh", "Dong ho thong minh" },
                    { 6, "May anh va thiet bi quay video", "May anh" },
                    { 7, "Tai nghe va thiet bi am thanh", "Tai nghe" },
                    { 8, "Loa va tai nghe", "Audio" },
                    { 9, "Thiet bi dien tu", "Electronics" }
                });

            migrationBuilder.InsertData(
                table: "Coupons",
                columns: new[] { "Id", "ClaimedQuantity", "Code", "CreatedAt", "CreatedByUserId", "Description", "DiscountType", "DiscountValue", "EndAt", "IsActive", "IsAutoClaimable", "IsPublic", "IsStackable", "MaxDiscountAmount", "MinOrderAmount", "Name", "PerUserLimit", "StartAt", "TotalQuantity", "Type", "UpdatedAt", "UsedQuantity" },
                values: new object[,]
                {
                    { 1, 420, "FREESHIP", new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), null, "Mien phi van chuyen cho don tu 300.000d", "FreeShipping", 100m, new DateTime(2026, 12, 31, 23, 59, 59, 0, DateTimeKind.Utc), true, true, true, false, null, 300000m, "Mien phi van chuyen", 1, new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), 1500, "Shipping", null, 260 },
                    { 2, 280, "SHIP20K", new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), null, "Giam 20.000d phi giao hang cho don tu 200.000d", "Amount", 20000m, new DateTime(2026, 12, 31, 23, 59, 59, 0, DateTimeKind.Utc), true, true, true, false, null, 200000m, "Giam 20K phi van chuyen", 1, new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), 1200, "Shipping", null, 145 },
                    { 3, 350, "WELCOME10", new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), null, "Giam 10% toi da 150.000d cho don tu 500.000d", "Percent", 10m, new DateTime(2026, 12, 31, 23, 59, 59, 0, DateTimeKind.Utc), true, true, true, false, 150000m, 500000m, "Giam 10% don dau", 1, new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), 1000, "Product", null, 190 },
                    { 4, 210, "SALE50K", new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), null, "Giam 50.000d cho don tu 1.000.000d", "Amount", 50000m, new DateTime(2026, 12, 31, 23, 59, 59, 0, DateTimeKind.Utc), true, true, true, false, null, 1000000m, "Giam 50K don tu 1 trieu", 1, new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), 800, "Product", null, 95 },
                    { 5, 130, "SALE100K", new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), null, "Giam 100.000d cho don tu 3.000.000d", "Amount", 100000m, new DateTime(2026, 12, 31, 23, 59, 59, 0, DateTimeKind.Utc), true, true, true, false, null, 3000000m, "Giam 100K don tu 3 trieu", 1, new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), 500, "Product", null, 58 },
                    { 6, 120, "PHONE12", new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), null, "Giam 12% toi da 300.000d cho dien thoai tu 2.000.000d", "Percent", 12m, new DateTime(2026, 12, 31, 23, 59, 59, 0, DateTimeKind.Utc), true, true, true, false, 300000m, 2000000m, "Giam 12% dien thoai", 1, new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), 400, "Product", null, 64 },
                    { 7, 105, "LAPTOP5", new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), null, "Giam 5% toi da 500.000d cho laptop tu 5.000.000d", "Percent", 5m, new DateTime(2026, 12, 31, 23, 59, 59, 0, DateTimeKind.Utc), true, true, true, false, 500000m, 5000000m, "Giam 5% laptop", 1, new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), 350, "Product", null, 48 },
                    { 8, 80, "TABLET8", new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), null, "Giam 8% toi da 250.000d cho tablet tu 1.500.000d", "Percent", 8m, new DateTime(2026, 12, 31, 23, 59, 59, 0, DateTimeKind.Utc), true, true, true, false, 250000m, 1500000m, "Giam 8% tablet", 1, new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), 300, "Product", null, 31 },
                    { 9, 160, "AUDIO15", new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), null, "Giam 15% toi da 120.000d cho loa va tai nghe tu 500.000d", "Percent", 15m, new DateTime(2026, 12, 31, 23, 59, 59, 0, DateTimeKind.Utc), true, true, true, false, 120000m, 500000m, "Giam 15% audio", 1, new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), 450, "Product", null, 72 },
                    { 10, 95, "APPLE7", new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), null, "Giam 7% toi da 400.000d cho san pham Apple tu 2.000.000d", "Percent", 7m, new DateTime(2026, 12, 31, 23, 59, 59, 0, DateTimeKind.Utc), true, true, true, false, 400000m, 2000000m, "Giam 7% hang Apple", 1, new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), 300, "Product", null, 42 },
                    { 11, 70, "FLASH150K", new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), null, "Giam 150.000d cho don tu 5.000.000d den het 31/05/2026", "Amount", 150000m, new DateTime(2026, 5, 31, 23, 59, 59, 0, DateTimeKind.Utc), true, true, true, false, null, 5000000m, "Flash sale giam 150K", 1, new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), 120, "Product", null, 22 },
                    { 12, 100, "EXPIRED30", new DateTime(2026, 4, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Du lieu mau cho voucher da het han", "Percent", 30m, new DateTime(2026, 4, 30, 23, 59, 59, 0, DateTimeKind.Utc), false, false, true, false, 200000m, 1000000m, "Voucher het han 30%", 1, new DateTime(2026, 4, 1, 0, 0, 0, 0, DateTimeKind.Utc), 100, "Product", null, 76 }
                });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "Created", "CreatedBy", "CreatedDateTime", "CreatedUser", "Description", "Guid", "IsActive", "IsDeleted", "Modified", "ModifiedBy", "Name", "RoleType" },
                values: new object[,]
                {
                    { "000000000000000000000001", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "system", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "system", "Administrator", new Guid("00000000-0000-0000-0000-000000000001"), true, false, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "system", "Admin", 1 },
                    { "000000000000000000000002", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "system", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "system", "Regular user", new Guid("00000000-0000-0000-0000-000000000002"), true, false, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "system", "User", 0 }
                });

            migrationBuilder.InsertData(
                table: "StoreSettings",
                columns: new[] { "Id", "Address", "CreatedAt", "DefaultShippingFee", "FacebookUrl", "FreeShippingThreshold", "Hotline", "LogoUrl", "StoreName", "SupportEmail", "SupportTime", "UpdatedAt", "WarrantyAddress", "ZaloUrl" },
                values: new object[] { 1, "", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0m, "", null, "0327 188 459", "", "CNTHHT Store", "support@cnthht.vn", "", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "", "" });

            migrationBuilder.InsertData(
                table: "Suppliers",
                columns: new[] { "Id", "Address", "ContactPerson", "CreatedAt", "Email", "IsActive", "Name", "Note", "Phone", "SupplierCode", "SupplierType", "TaxCode", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "Vietnam", null, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "contact@synnexfpt.com", true, "Synnex FPT", null, "19006600", "SUP-SYNNEX-FPT", "AuthorizedDistributor", null, null },
                    { 2, "Vietnam", null, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "contact@digiworld.com.vn", true, "Digiworld", null, "02839299959", "SUP-DIGIWORLD", "AuthorizedDistributor", null, null },
                    { 3, "Vietnam", null, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "FPT Trading", null, null, "SUP-FPT-TRADING", "AuthorizedDistributor", null, null },
                    { 4, "Vietnam", null, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "contact@petrosetco.com.vn", true, "Petrosetco Distribution", null, "02854168686", "SUP-PETROSETCO", "Tier1Distributor", null, null }
                });

            migrationBuilder.InsertData(
                table: "Warehouses",
                columns: new[] { "Id", "Address", "Code", "CreatedAt", "IsActive", "Name", "UpdatedAt" },
                values: new object[] { 1, "Main store", "MAIN", new DateTime(2026, 5, 18, 0, 0, 0, 0, DateTimeKind.Utc), true, "CNTHHT Main Store", null });

            migrationBuilder.InsertData(
                table: "CouponScopes",
                columns: new[] { "Id", "Brand", "CategoryId", "CouponId", "CreatedAt", "ProductId", "ScopeType" },
                values: new object[,]
                {
                    { 1, null, null, 1, new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), null, "All" },
                    { 2, null, null, 2, new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), null, "All" },
                    { 3, null, null, 3, new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), null, "All" },
                    { 4, null, null, 4, new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), null, "All" },
                    { 5, null, null, 5, new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), null, "All" },
                    { 6, null, 1, 6, new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), null, "Category" },
                    { 7, null, 2, 7, new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), null, "Category" },
                    { 8, null, 4, 8, new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), null, "Category" },
                    { 9, null, 8, 9, new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), null, "Category" },
                    { 10, "Apple", null, 10, new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), null, "Brand" },
                    { 11, null, null, 11, new DateTime(2026, 5, 24, 0, 0, 0, 0, DateTimeKind.Utc), null, "All" },
                    { 12, null, null, 12, new DateTime(2026, 4, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "All" }
                });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "BackupSupplierId", "Brand", "CategoryId", "CreatedAt", "Description", "ImageUrl", "IsActive", "IsBestSeller", "IsDiscounted", "IsFeatured", "IsNewArrival", "LongDescription", "Name", "OriginalPrice", "Price", "RequiresSerialTracking", "Sku", "Slug", "Stock", "SupplierId", "SupplyType", "UpdatedAt", "WarrantyMonths", "WarrantyProvider" },
                values: new object[,]
                {
                    { 1, null, "Apple", 1, new DateTime(2026, 5, 28, 13, 11, 9, 947, DateTimeKind.Utc).AddTicks(4981), "Flagship Apple smartphone", "/electro/img/product-1.png", true, false, true, true, true, null, "iPhone 15 Pro", 32990000m, 28990000m, true, null, null, 12, null, null, null, 12, null },
                    { 2, null, "Samsung", 1, new DateTime(2026, 5, 28, 13, 11, 9, 947, DateTimeKind.Utc).AddTicks(5005), "Android flagship phone", "/electro/img/product-2.png", true, true, true, true, true, null, "Samsung Galaxy S24", 24990000m, 21990000m, true, null, null, 15, null, null, null, 12, null },
                    { 3, null, "Apple", 2, new DateTime(2026, 5, 28, 13, 11, 9, 947, DateTimeKind.Utc).AddTicks(5017), "Lightweight Apple laptop", "/electro/img/product-3.png", true, true, true, true, false, null, "MacBook Air M3", 35990000m, 31990000m, true, null, null, 10, null, null, null, 12, null },
                    { 4, null, "Dell", 2, new DateTime(2026, 5, 28, 13, 11, 9, 947, DateTimeKind.Utc).AddTicks(5025), "High-end productivity laptop", "/electro/img/product-4.png", true, false, true, true, false, null, "Dell XPS 15", 39990000m, 35990000m, true, null, null, 8, null, null, null, 12, null },
                    { 5, null, "Apple", 7, new DateTime(2026, 5, 28, 13, 11, 9, 947, DateTimeKind.Utc).AddTicks(5033), "Wireless earbuds", "/electro/img/product-5.png", true, true, true, false, false, null, "AirPods Pro", 6990000m, 5990000m, true, null, null, 25, null, null, null, 12, null }
                });

            migrationBuilder.InsertData(
                table: "SpecDefinitions",
                columns: new[] { "Id", "CategoryId", "Code", "CreatedAt", "DataType", "InputType", "IsActive", "IsComparable", "IsFilterable", "IsRequired", "Name", "SortOrder", "Unit", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, 1, "screenSize", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, false, false, "Kich thuoc man hinh", 1, null, null },
                    { 2, 1, "screenTechnology", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, true, false, "Cong nghe man hinh", 2, null, null },
                    { 3, 1, "rearCamera", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, false, false, "Camera sau", 3, null, null },
                    { 4, 1, "frontCamera", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, false, false, "Camera truoc", 4, null, null },
                    { 5, 1, "chipset", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, false, false, "Chipset", 5, null, null },
                    { 6, 1, "nfc", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "boolean", "boolean", true, true, true, false, "Cong nghe NFC", 6, null, null },
                    { 7, 1, "ram", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, true, false, "Dung luong RAM", 7, null, null },
                    { 8, 1, "internalStorage", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, true, false, "Bo nho trong", 8, null, null },
                    { 9, 1, "battery", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, false, false, "Pin", 9, null, null },
                    { 10, 1, "sim", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, false, false, "The SIM", 10, null, null },
                    { 11, 1, "os", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, true, false, "He dieu hanh", 11, null, null },
                    { 12, 1, "screenResolution", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, false, false, "Do phan giai man hinh", 12, null, null },
                    { 13, 1, "screenFeatures", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "multiSelect", "multiSelect", true, true, false, false, "Tinh nang man hinh", 13, null, null },
                    { 14, 1, "cpuType", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, false, false, "Loai CPU", 14, null, null },
                    { 15, 2, "graphicsType", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, true, false, "Loai card do hoa", 1, null, null },
                    { 16, 2, "ram", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, true, false, "Dung luong RAM", 2, null, null },
                    { 17, 2, "ramType", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, true, false, "Loai RAM", 3, null, null },
                    { 18, 2, "ramSlots", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, false, false, "So khe RAM", 4, null, null },
                    { 19, 2, "hardDrive", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, true, false, "O cung", 5, null, null },
                    { 20, 2, "screenSize", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, false, false, "Kich thuoc man hinh", 6, null, null },
                    { 21, 2, "screenTechnology", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, true, false, "Cong nghe man hinh", 7, null, null },
                    { 22, 2, "battery", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, false, false, "Pin", 8, null, null },
                    { 23, 2, "os", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, true, false, "He dieu hanh", 9, null, null },
                    { 24, 2, "screenResolution", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, false, false, "Do phan giai man hinh", 10, null, null },
                    { 25, 2, "cpuType", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, true, false, "Loai CPU", 11, null, null },
                    { 26, 2, "ports", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "multiSelect", "multiSelect", true, true, false, false, "Cong giao tiep", 12, null, null },
                    { 27, 4, "screenSize", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, false, false, "Kich thuoc man hinh", 1, null, null },
                    { 28, 4, "screenTechnology", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, true, false, "Cong nghe man hinh", 2, null, null },
                    { 29, 4, "rearCamera", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, false, false, "Camera sau", 3, null, null },
                    { 30, 4, "frontCamera", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, false, false, "Camera truoc", 4, null, null },
                    { 31, 4, "chipset", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, false, false, "Chipset", 5, null, null },
                    { 32, 4, "ram", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, true, false, "Dung luong RAM", 6, null, null },
                    { 33, 4, "internalStorage", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, true, false, "Bo nho trong", 7, null, null },
                    { 34, 4, "battery", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, false, false, "Pin", 8, null, null },
                    { 35, 4, "os", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, true, false, "He dieu hanh", 9, null, null },
                    { 36, 4, "screenResolution", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, false, false, "Do phan giai man hinh", 10, null, null },
                    { 37, 4, "screenFeatures", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "multiSelect", "multiSelect", true, true, false, false, "Tinh nang man hinh", 11, null, null },
                    { 38, 4, "cpuType", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, false, false, "Loai CPU", 12, null, null },
                    { 39, 4, "compatibility", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "multiSelect", "multiSelect", true, true, false, false, "Tuong thich", 13, null, null },
                    { 40, 5, "screenTechnology", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, true, false, "Cong nghe man hinh", 1, null, null },
                    { 41, 5, "screenSize", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, false, false, "Kich thuoc man hinh", 2, null, null },
                    { 42, 5, "faceDiameter", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, false, false, "Duong kinh mat", 3, null, null },
                    { 43, 5, "wristSize", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, false, false, "Kich thuoc co tay phu hop", 4, null, null },
                    { 44, 5, "calling", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, true, false, "Nghe goi", 5, null, null },
                    { 45, 5, "healthFeatures", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "multiSelect", "multiSelect", true, true, false, false, "Tien ich suc khoe", 6, null, null },
                    { 46, 5, "compatibility", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "multiSelect", "multiSelect", true, true, false, false, "Tuong thich", 7, null, null },
                    { 47, 5, "batteryLife", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, false, false, "Thoi luong pin", 8, null, null },
                    { 48, 5, "manufacturer", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, true, false, "Hang san xuat", 9, null, null },
                    { 49, 7, "dimensions", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, false, false, "Kich thuoc", 1, null, null },
                    { 50, 7, "weight", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, false, false, "Trong luong", 2, null, null },
                    { 51, 7, "audioTechnology", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "multiSelect", "multiSelect", true, true, false, false, "Cong nghe am thanh", 3, null, null },
                    { 52, 7, "microphone", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "boolean", "boolean", true, true, true, false, "Micro", 4, null, null },
                    { 53, 7, "batteryLife", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, false, false, "Thoi luong su dung pin", 5, null, null },
                    { 54, 7, "controlMethod", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "multiSelect", "multiSelect", true, true, false, false, "Phuong thuc dieu khien", 6, null, null },
                    { 55, 7, "chipset", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, false, false, "Chipset", 7, null, null },
                    { 56, 7, "otherFeatures", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "multiSelect", "multiSelect", true, true, false, false, "Tinh nang khac", 8, null, null },
                    { 57, 7, "manufacturer", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, true, false, "Hang san xuat", 9, null, null },
                    { 58, 6, "manufacturer", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, true, false, "Hang san xuat", 1, null, null },
                    { 59, 6, "cameraType", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, true, false, "Loai may anh", 2, null, null },
                    { 60, 6, "sensorType", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, true, false, "Loai cam bien", 3, null, null },
                    { 61, 6, "aperture", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, false, false, "Khau do", 4, null, null },
                    { 62, 6, "focalLength", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, false, false, "Tieu cu", 5, null, null },
                    { 63, 6, "lensType", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, false, false, "Loai ong kinh", 6, null, null },
                    { 64, 6, "focusMode", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "multiSelect", "multiSelect", true, true, false, false, "Che do lay net", 7, null, null },
                    { 65, 6, "shutter", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, false, false, "Man trap", 8, null, null },
                    { 66, 6, "printStandard", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "multiSelect", "multiSelect", true, true, false, false, "Chuan in anh", 9, null, null },
                    { 67, 6, "imageSize", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, false, false, "Kich thuoc anh", 10, null, null }
                });

            migrationBuilder.InsertData(
                table: "SpecOptions",
                columns: new[] { "Id", "CreatedAt", "DisplayOrder", "IsActive", "SpecDefinitionId", "UpdatedAt", "Value" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 1, null, "6.3 inches" },
                    { 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 1, null, "6.59 inches" },
                    { 3, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 1, null, "6.67 inches" },
                    { 4, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 1, null, "6.9 inches" },
                    { 5, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 2, null, "AMOLED" },
                    { 6, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 2, null, "Dynamic AMOLED 2X" },
                    { 7, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 2, null, "Super Retina XDR" },
                    { 8, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 3, null, "48MP + 48MP + 48MP" },
                    { 9, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 3, null, "50MP + 50MP + 50MP" },
                    { 10, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 3, null, "200MP + 50MP + 50MP + 10MP" },
                    { 11, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 3, null, "200MP + 8MP + 2MP" },
                    { 12, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 4, null, "12MP" },
                    { 13, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 4, null, "32MP" },
                    { 14, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 4, null, "Camera 18MP Center Stage" },
                    { 15, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 4, null, "Camera truoc - f/2.2" },
                    { 16, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 5, null, "Chip A19 Pro" },
                    { 17, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 5, null, "Snapdragon 8 Elite Gen 5 danh cho Galaxy (3nm)" },
                    { 18, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 5, null, "Snapdragon 7s Gen 3" },
                    { 19, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 5, null, "MediaTek Dimensity 9500s" },
                    { 20, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 6, null, "Khong" },
                    { 21, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 6, null, "Co" },
                    { 22, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 7, null, "8 GB" },
                    { 23, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 7, null, "12 GB" },
                    { 24, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 8, null, "256 GB" },
                    { 25, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 9, null, "5000 mAh" },
                    { 26, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 9, null, "5110 mAh" },
                    { 27, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 9, null, "7025 mAh" },
                    { 28, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 10, null, "Sim kep (nano-Sim va e-Sim) - Ho tro 2 e-Sim" },
                    { 29, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 10, null, "2 Nano-SIM + eSIM" },
                    { 30, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 10, null, "2 Nano-SIM" },
                    { 31, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 10, null, "Dual nano-SIM hoac 1 nano-SIM + 1 eSIM" },
                    { 32, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 11, null, "iOS 26" },
                    { 33, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 11, null, "Android 14" },
                    { 34, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 11, null, "ColorOS 16.0" },
                    { 35, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 12, null, "2622 x 1206 pixels" },
                    { 36, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 12, null, "2712 x 1220 pixels" },
                    { 37, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 12, null, "3120 x 1440 pixels (Quad HD+)" },
                    { 38, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 12, null, "1256 x 2760 pixels" },
                    { 39, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 13, null, "Man hinh Luon Bat" },
                    { 40, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 13, null, "ProMotion 120Hz" },
                    { 41, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 13, null, "HDR" },
                    { 42, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 13, null, "True Tone" },
                    { 43, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 13, null, "P3" },
                    { 44, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 13, null, "Tan so quet 1-120Hz" },
                    { 45, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 7, true, 13, null, "Do sang toi da 2600 nits" },
                    { 46, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 8, true, 13, null, "Tan so quet len den 120Hz" },
                    { 47, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 9, true, 13, null, "Do sang 3000 nits" },
                    { 48, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 10, true, 13, null, "Do sau mau 12-bit" },
                    { 49, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 11, true, 13, null, "Ty le tuong phan 5,000,000:1" },
                    { 50, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 12, true, 13, null, "Tan so lay mau cam ung 240Hz" },
                    { 51, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 13, true, 13, null, "1.07 ty mau (10 bits)" },
                    { 52, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 14, true, 13, null, "100% DCI-P3" },
                    { 53, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 15, true, 13, null, "460 PPI" },
                    { 54, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 16, true, 13, null, "Do sang toi da 1800 nits (HBM)" },
                    { 55, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 17, true, 13, null, "Kinh bao ve Corning Gorilla Glass 7i" },
                    { 56, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 14, null, "CPU 6 loi voi 2 loi hieu nang va 4 loi tiet kiem dien" },
                    { 57, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 14, null, "8 nhan, xung nhip 2.5GHz" },
                    { 58, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 14, null, "8 nhan" },
                    { 59, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 15, null, "GPU 5 loi va Neural Engine 16 loi" },
                    { 60, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 15, null, "Intel UHD Graphics" },
                    { 61, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 15, null, "Intel Graphics" },
                    { 62, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 15, null, "NVIDIA GeForce RTX 3050 6GB GDDR6" },
                    { 63, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 16, null, "8GB" },
                    { 64, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 16, null, "16GB" },
                    { 65, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 17, null, "DDR4" },
                    { 66, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 17, null, "DDR5" },
                    { 67, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 17, null, "DDR4 3200 MT/s" },
                    { 68, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 17, null, "SODIMM DDR5-4800" },
                    { 69, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 17, null, "Unified Memory" },
                    { 70, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 18, null, "8GB DDR4 on board + 8GB DDR4 SO-DIMM" },
                    { 71, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 18, null, "1 khe Onboard + 1 khe trong nang cap toi da 32GB" },
                    { 72, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 18, null, "2 khe (1 x 16GB)" },
                    { 73, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 18, null, "2 khe (May nguyen ban 16GB)" },
                    { 74, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 19, null, "256GB" },
                    { 75, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 19, null, "512GB M.2 NVMe PCIe 4.0 SSD" },
                    { 76, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 19, null, "512GB M.2 PCIe NVMe (nang cap toi da 1TB)" },
                    { 77, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 19, null, "512GB SSD M.2 2242 PCIe 4.0x4 NVMe" },
                    { 78, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 19, null, "512GB PCIe NVMe SSD (Nang cap toi da 4TB)" },
                    { 79, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 20, null, "13 inches" },
                    { 80, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 20, null, "14 inches" },
                    { 81, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 20, null, "15.6 inches" },
                    { 82, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 21, null, "Liquid Retina" },
                    { 83, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 21, null, "Do sang 300nits" },
                    { 84, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 21, null, "45% NTSC" },
                    { 85, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 21, null, "TUV Rheinland-certified" },
                    { 86, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 21, null, "With stylus support" },
                    { 87, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 21, null, "man hinh chong choi" },
                    { 88, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 7, true, 21, null, "100% sRGB" },
                    { 89, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 8, true, 21, null, "FreeSync" },
                    { 90, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 9, true, 21, null, "Acer ComfyView" },
                    { 91, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 10, true, 21, null, "LCD TFT" },
                    { 92, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 22, null, "Thoi gian xem video truc tuyen len den 16 gio, pin lithium-ion 36.5 watt-gio" },
                    { 93, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 22, null, "50WHrs, 3S1P, 3-cell Li-ion" },
                    { 94, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 22, null, "Li-ion 4-Cell Battery, 54WHr" },
                    { 95, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 22, null, "57.5Wh, 135W Slim Tip (3-pin)" },
                    { 96, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 22, null, "Pin Li-ion 3 cell 54.8Wh, bo doi nguon AC 150W" },
                    { 97, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 23, null, "macOS" },
                    { 98, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 23, null, "Windows 11 Home" },
                    { 99, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 23, null, "Windows 11 Home, Single Language English + Office Home & Student 2024" },
                    { 100, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 23, null, "Windows 11 Home Single Language" },
                    { 101, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 23, null, "Windows 11 Home Single Language, English" },
                    { 102, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 24, null, "2408 x 1506 pixels" },
                    { 103, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 24, null, "1920 x 1200 pixels (WUXGA)" },
                    { 104, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 24, null, "1920 x 1200 pixels (FullHD+)" },
                    { 105, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 24, null, "1920 x 1080 pixels (FullHD)" },
                    { 106, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 25, null, "Chip Apple A18 Pro" },
                    { 107, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 25, null, "Intel Core i5-13420H" },
                    { 108, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 25, null, "Intel Core 5 120U" },
                    { 109, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 25, null, "AMD Ryzen 7 7735HS" },
                    { 110, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 25, null, "Intel Core i5-12450H" },
                    { 111, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 26, null, "USB 3 (USB-C) 10Gb/s" },
                    { 112, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 26, null, "USB 2 (USB-C) 480Mb/s" },
                    { 113, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 26, null, "Jack 3.5 mm" },
                    { 114, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 26, null, "USB 3.2" },
                    { 115, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 26, null, "HDMI 1.4" },
                    { 116, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 26, null, "Khe doc the SD" },
                    { 117, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 7, true, 26, null, "Mini DisplayPort 1.4" },
                    { 118, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 27, null, "11 inches" },
                    { 119, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 27, null, "11.2 inches" },
                    { 120, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 27, null, "12.1 inches" },
                    { 121, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 28, null, "IPS" },
                    { 122, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 28, null, "IPS LCD" },
                    { 123, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 28, null, "Liquid Retina" },
                    { 124, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 29, null, "8MP" },
                    { 125, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 29, null, "13 MP, f/2.2" },
                    { 126, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 29, null, "Camera goc rong 12MP" },
                    { 127, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 29, null, "13MP" },
                    { 128, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 30, null, "8 MP, f/2.28" },
                    { 129, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 30, null, "12MP, f/2.4" },
                    { 130, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 30, null, "13MP" },
                    { 131, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 31, null, "MediaTek Dimensity 6400" },
                    { 132, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 31, null, "Chip A16" },
                    { 133, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 31, null, "Snapdragon 7+ Gen 3" },
                    { 134, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 32, null, "8 GB" },
                    { 135, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 33, null, "128 GB" },
                    { 136, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 33, null, "512 GB" },
                    { 137, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 34, null, "10200 mAh" },
                    { 138, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 34, null, "Tich hop pin sac Li-Po 28,93 watt-gio" },
                    { 139, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 34, null, "8850 mAh" },
                    { 140, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 35, null, "Android 15 tro len" },
                    { 141, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 35, null, "iPadOS 18" },
                    { 142, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 35, null, "Xiaomi HyperOS 2" },
                    { 143, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 36, null, "2560 x 1600 pixels (2.5K)" },
                    { 144, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 36, null, "2360 x 1640 pixel" },
                    { 145, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 36, null, "2136 x 3200 pixels" },
                    { 146, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 37, null, "Tan so quet 90Hz" },
                    { 147, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 37, null, "600 nits dien hinh" },
                    { 148, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 37, null, "800 nits HBM" },
                    { 149, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 37, null, "Chong choi giong nhu giay" },
                    { 150, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 37, null, "96% DCI-P3" },
                    { 151, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 37, null, "Cam ung da diem 10 diem" },
                    { 152, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 7, true, 37, null, "Multi-Touch" },
                    { 153, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 8, true, 37, null, "LED nen" },
                    { 154, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 9, true, 37, null, "IPS" },
                    { 155, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 10, true, 37, null, "True Tone" },
                    { 156, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 11, true, 37, null, "500 nit" },
                    { 157, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 12, true, 37, null, "lop phu khang dau chong in dau van tay" },
                    { 158, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 13, true, 37, null, "144Hz" },
                    { 159, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 14, true, 37, null, "Ti le 3:2" },
                    { 160, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 15, true, 37, null, "800 nit" },
                    { 161, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 16, true, 37, null, "68 ty mau" },
                    { 162, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 17, true, 37, null, "DCI-P3" },
                    { 163, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 18, true, 37, null, "Pro HDR" },
                    { 164, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 19, true, 37, null, "Cong nghe cham khi uot" },
                    { 165, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 20, true, 37, null, "TUV Rheinland" },
                    { 166, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 21, true, 37, null, "Che do duoi anh nang" },
                    { 167, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 22, true, 37, null, "Che do doc" },
                    { 168, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 23, true, 37, null, "Mau sac thich ung" },
                    { 169, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 38, null, "8C, 2x A76 @2.5GHz + 6x A55 @2.0GHz" },
                    { 170, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 38, null, "CPU 5 loi" },
                    { 171, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 38, null, "8 nhan len den 2.8GHz" },
                    { 172, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 39, null, "Apple Pencil (USB-C)" },
                    { 173, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 39, null, "Android 8.0 tro len" },
                    { 174, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 39, null, "iOS 13.0 tro len" },
                    { 175, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 39, null, "Android 6.0 tro len" },
                    { 176, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 39, null, "iOS 11 tro len" },
                    { 177, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 39, null, "Android 12.0 tro len (voi bo nho toi thieu 1.5GB)" },
                    { 178, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 40, null, "AMOLED" },
                    { 179, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 40, null, "LCD" },
                    { 180, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 40, null, "Super AMOLED" },
                    { 181, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 41, null, "1.47 inch" },
                    { 182, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 41, null, "1.82 inch" },
                    { 183, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 41, null, "2.0 inch" },
                    { 184, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 42, null, "43 mm" },
                    { 185, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 42, null, "47 mm" },
                    { 186, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 42, null, "49.1 mm" },
                    { 187, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 43, null, "Tim: 120-190 mm" },
                    { 188, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 43, null, "Xam, Trang va Den: 130-210 mm" },
                    { 189, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 43, null, "Hang khong cong bo" },
                    { 190, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 43, null, "Khong cong bo" },
                    { 191, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 44, null, "Khong" },
                    { 192, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 44, null, "Nghe goi qua Bluetooth" },
                    { 193, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 44, null, "Nghe goi qua eSim" },
                    { 194, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 45, null, "Do nhip tim" },
                    { 195, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 45, null, "Do SpO2" },
                    { 196, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 45, null, "Theo doi giac ngu" },
                    { 197, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 45, null, "Do muc cang thang" },
                    { 198, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 45, null, "Do ECG" },
                    { 199, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 45, null, "Theo doi chu ky kinh nguyet" },
                    { 200, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 7, true, 45, null, "Theo doi nhiem trung giac ngu" },
                    { 201, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 8, true, 45, null, "Bai tap ho hap" },
                    { 202, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 9, true, 45, null, "Canh bao nhip tim bat thuong" },
                    { 203, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 46, null, "Android 8.0 tro len" },
                    { 204, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 46, null, "iOS 13.0 tro len" },
                    { 205, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 46, null, "Android 6.0 tro len" },
                    { 206, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 46, null, "iOS 11 tro len" },
                    { 207, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 46, null, "Android 12.0 tro len (voi bo nho toi thieu 1.5GB)" },
                    { 208, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 47, null, "Toi da 10 ngay" },
                    { 209, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 47, null, "Thuong xuyen 7 ngay" },
                    { 210, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 47, null, "Bat AOD 4 ngay" },
                    { 211, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 47, null, "18 ngay su dung lien tuc (khong co AOD)" },
                    { 212, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 47, null, "Khoang 80 gio (khi tat Always-On-Display)" },
                    { 213, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 47, null, "Khoang 100 gio (o che do tiet kiem pin)" },
                    { 214, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 48, null, "Huawei" },
                    { 215, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 48, null, "Xiaomi" },
                    { 216, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 48, null, "Samsung Chinh hang" },
                    { 217, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 49, null, "Tai nghe 30.9 x 21.8 x 24.0 mm; Hop sac 46.2 x 50.1 x 21.2 mm" },
                    { 218, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 49, null, "Tai nghe 33.66 x 17.18 x 18.66 mm; Hop sac 46.9 x 65.9 x 24.5 mm" },
                    { 219, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 49, null, "Tai nghe 33.7 x 20.9 x 23.2 mm; Hop sac 51.3 x 51 x 26.8 mm" },
                    { 220, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 49, null, "Tai nghe 32 x 17.8 x 18.5 mm; Hop sac 49 x 48.6 x 23 mm" },
                    { 221, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 50, null, "Tai nghe 5.3 g; Hop sac 50.8 g" },
                    { 222, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 50, null, "Tai nghe 5.6 g; Hop sac 41.3 g" },
                    { 223, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 50, null, "4g" },
                    { 224, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 51, null, "Adaptive EQ" },
                    { 225, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 51, null, "Spatial Audio ca nhan hoa" },
                    { 226, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 51, null, "True Wireless Stereo (TWS)" },
                    { 227, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 51, null, "Chong on chu dong" },
                    { 228, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 51, null, "Chong on moi truong ENC" },
                    { 229, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 52, null, "Khong" },
                    { 230, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 52, null, "Co" },
                    { 231, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 53, null, "Tai nghe 5 gio; dam thoai 4.5 gio" },
                    { 232, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 53, null, "Tai nghe 8 gio; hop sac 36 gio" },
                    { 233, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 53, null, "Tai nghe 6 gio; hop sac 25 gio" },
                    { 234, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 53, null, "Tai nghe 6 gio; hop sac 30 gio" },
                    { 235, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 54, null, "Cam bien luc" },
                    { 236, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 54, null, "Cam ung cham" },
                    { 237, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 55, null, "Chip tai nghe H2" },
                    { 238, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 56, null, "Khang nuoc va bui IP54" },
                    { 239, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 56, null, "Chong on moi truong ENC" },
                    { 240, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 56, null, "Chong nuoc IPX4" },
                    { 241, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 57, null, "Apple Chinh hang" },
                    { 242, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 57, null, "Huawei" },
                    { 243, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 57, null, "Baseus" },
                    { 244, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 57, null, "Xiaomi" },
                    { 245, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 58, null, "Sony" },
                    { 246, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 58, null, "Fujifilm" },
                    { 247, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 59, null, "Full-frame" },
                    { 248, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 59, null, "Mirrorless (khong guong lat)" },
                    { 249, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 60, null, "Full-frame 35 mm (35,9 x 23,9 mm), cam bien Exmor R CMOS" },
                    { 250, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 60, null, "APS-C CMOS (23.5 x 15.6 mm)" },
                    { 251, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 61, null, "Khong cong bo" },
                    { 252, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 62, null, "Khong cong bo" },
                    { 253, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 63, null, "Ngam E-mount" },
                    { 254, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 63, null, "Ngam FUJIFILM X" },
                    { 255, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 64, null, "AF-A" },
                    { 256, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 64, null, "AF-S" },
                    { 257, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 64, null, "AF-C" },
                    { 258, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 64, null, "DMF" },
                    { 259, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 64, null, "MF" },
                    { 260, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 65, null, "Co / Dien tu, 1/8000s - 30s, Bulb" },
                    { 261, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 65, null, "Co hoc: 1/4000 - 900s, bulb toi da 60 phut" },
                    { 262, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 65, null, "Dien tu: 1/32000 - 900s, bulb toi da 1 giay" },
                    { 263, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 65, null, "EFCS: 1/4000 - 900s, bulb toi da 60 phut" },
                    { 264, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 66, null, "Exif Print" },
                    { 265, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 66, null, "Print Image Matching III" },
                    { 266, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 67, null, "L 3:2 6240 x 4160" },
                    { 267, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 67, null, "L 16:9 6240 x 3512" },
                    { 268, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 67, null, "L 1:1 4160 x 4160" },
                    { 269, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 67, null, "L 65:24 6240 x 2304" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_CategorySuppliers_CategoryId_SupplierId",
                table: "CategorySuppliers",
                columns: new[] { "CategoryId", "SupplierId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CategorySuppliers_SupplierId",
                table: "CategorySuppliers",
                column: "SupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_Coupons_Code",
                table: "Coupons",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CouponScopes_CategoryId",
                table: "CouponScopes",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_CouponScopes_CouponId",
                table: "CouponScopes",
                column: "CouponId");

            migrationBuilder.CreateIndex(
                name: "IX_CouponScopes_ProductId",
                table: "CouponScopes",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_GoodsReceiptLines_GoodsReceiptId",
                table: "GoodsReceiptLines",
                column: "GoodsReceiptId");

            migrationBuilder.CreateIndex(
                name: "IX_GoodsReceiptLines_ProductId",
                table: "GoodsReceiptLines",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_GoodsReceiptLines_VariantId",
                table: "GoodsReceiptLines",
                column: "VariantId");

            migrationBuilder.CreateIndex(
                name: "IX_GoodsReceipts_ReceiptCode",
                table: "GoodsReceipts",
                column: "ReceiptCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GoodsReceipts_SupplierId",
                table: "GoodsReceipts",
                column: "SupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_GoodsReceipts_WarehouseId",
                table: "GoodsReceipts",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_GoodsReceiptSerials_GoodsReceiptLineId_SerialOrImei",
                table: "GoodsReceiptSerials",
                columns: new[] { "GoodsReceiptLineId", "SerialOrImei" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GoodsReceiptSerials_StockItemId",
                table: "GoodsReceiptSerials",
                column: "StockItemId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryReturns_OrderDetailId",
                table: "InventoryReturns",
                column: "OrderDetailId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryReturns_OrderId",
                table: "InventoryReturns",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryReturns_ProductId",
                table: "InventoryReturns",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryReturns_ReturnCode",
                table: "InventoryReturns",
                column: "ReturnCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InventoryReturns_StockItemId",
                table: "InventoryReturns",
                column: "StockItemId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryReturns_VariantId",
                table: "InventoryReturns",
                column: "VariantId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransactions_ProductId",
                table: "InventoryTransactions",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransactions_VariantId",
                table: "InventoryTransactions",
                column: "VariantId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId_IsRead_CreatedAt",
                table: "Notifications",
                columns: new[] { "UserId", "IsRead", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_OrderCancellations_OrderId",
                table: "OrderCancellations",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderCoupons_CouponId",
                table: "OrderCoupons",
                column: "CouponId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderCoupons_OrderId_CouponType",
                table: "OrderCoupons",
                columns: new[] { "OrderId", "CouponType" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderCoupons_UserCouponId",
                table: "OrderCoupons",
                column: "UserCouponId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderDetails_OrderId",
                table: "OrderDetails",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderDetails_ProductId",
                table: "OrderDetails",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderDetails_VariantId",
                table: "OrderDetails",
                column: "VariantId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderDetailStockItems_OrderDetailId",
                table: "OrderDetailStockItems",
                column: "OrderDetailId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderDetailStockItems_StockItemId",
                table: "OrderDetailStockItems",
                column: "StockItemId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Orders_OrderCode",
                table: "Orders",
                column: "OrderCode",
                unique: true,
                filter: "[OrderCode] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_OrderTimelines_OrderId",
                table: "OrderTimelines",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductImages_ProductId",
                table: "ProductImages",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductRecommendations_ProductId_RecommendedProductId_Type",
                table: "ProductRecommendations",
                columns: new[] { "ProductId", "RecommendedProductId", "Type" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductRecommendations_RecommendedProductId",
                table: "ProductRecommendations",
                column: "RecommendedProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_BackupSupplierId",
                table: "Products",
                column: "BackupSupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_CategoryId",
                table: "Products",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_SupplierId",
                table: "Products",
                column: "SupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductSpecValues_ProductId_SpecDefinitionId",
                table: "ProductSpecValues",
                columns: new[] { "ProductId", "SpecDefinitionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductSpecValues_SpecDefinitionId",
                table: "ProductSpecValues",
                column: "SpecDefinitionId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductSpecValues_SpecOptionId",
                table: "ProductSpecValues",
                column: "SpecOptionId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariants_ProductId",
                table: "ProductVariants",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_RepairCases_ProductId",
                table: "RepairCases",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_RepairCases_RepairCode",
                table: "RepairCases",
                column: "RepairCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RepairCases_StockItemId",
                table: "RepairCases",
                column: "StockItemId");

            migrationBuilder.CreateIndex(
                name: "IX_RepairCases_TicketId",
                table: "RepairCases",
                column: "TicketId");

            migrationBuilder.CreateIndex(
                name: "IX_RepairCases_VariantId",
                table: "RepairCases",
                column: "VariantId");

            migrationBuilder.CreateIndex(
                name: "IX_RepairCases_WarrantyClaimId",
                table: "RepairCases",
                column: "WarrantyClaimId");

            migrationBuilder.CreateIndex(
                name: "IX_RepairUpdates_RepairCaseId",
                table: "RepairUpdates",
                column: "RepairCaseId");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_Name",
                table: "Roles",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SpecDefinitions_CategoryId_Code",
                table: "SpecDefinitions",
                columns: new[] { "CategoryId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SpecOptions_SpecDefinitionId",
                table: "SpecOptions",
                column: "SpecDefinitionId");

            migrationBuilder.CreateIndex(
                name: "IX_StockItems_OrderDetailId",
                table: "StockItems",
                column: "OrderDetailId");

            migrationBuilder.CreateIndex(
                name: "IX_StockItems_OrderId",
                table: "StockItems",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_StockItems_ProductId",
                table: "StockItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_StockItems_SerialOrImei",
                table: "StockItems",
                column: "SerialOrImei",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StockItems_SupplierId",
                table: "StockItems",
                column: "SupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_StockItems_VariantId",
                table: "StockItems",
                column: "VariantId");

            migrationBuilder.CreateIndex(
                name: "IX_StockItems_WarehouseId",
                table: "StockItems",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_ProductId",
                table: "StockMovements",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_StockItemId",
                table: "StockMovements",
                column: "StockItemId");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_VariantId",
                table: "StockMovements",
                column: "VariantId");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_WarehouseId",
                table: "StockMovements",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_Name",
                table: "Suppliers",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_SupplierCode",
                table: "Suppliers",
                column: "SupplierCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SupportTickets_RelatedOrderId",
                table: "SupportTickets",
                column: "RelatedOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_SupportTickets_RelatedProductId",
                table: "SupportTickets",
                column: "RelatedProductId");

            migrationBuilder.CreateIndex(
                name: "IX_SupportTickets_RelatedWarrantyId",
                table: "SupportTickets",
                column: "RelatedWarrantyId");

            migrationBuilder.CreateIndex(
                name: "IX_SupportTickets_TicketCode",
                table: "SupportTickets",
                column: "TicketCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SupportTicketUpdates_TicketId",
                table: "SupportTicketUpdates",
                column: "TicketId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCoupons_CouponId",
                table: "UserCoupons",
                column: "CouponId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCoupons_UserId_CouponId",
                table: "UserCoupons",
                columns: new[] { "UserId", "CouponId" });

            migrationBuilder.CreateIndex(
                name: "IX_Users_UserName",
                table: "Users",
                column: "UserName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VoucherSpins_RewardCouponId",
                table: "VoucherSpins",
                column: "RewardCouponId");

            migrationBuilder.CreateIndex(
                name: "IX_VoucherSpins_UserId_SpinDate",
                table: "VoucherSpins",
                columns: new[] { "UserId", "SpinDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Warehouses_Code",
                table: "Warehouses",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyClaims_ClaimCode",
                table: "WarrantyClaims",
                column: "ClaimCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyClaims_ProductId",
                table: "WarrantyClaims",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyClaims_StockItemId",
                table: "WarrantyClaims",
                column: "StockItemId");

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyClaims_VariantId",
                table: "WarrantyClaims",
                column: "VariantId");

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyClaims_WarrantyId",
                table: "WarrantyClaims",
                column: "WarrantyId");

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyClaimUpdates_WarrantyClaimId",
                table: "WarrantyClaimUpdates",
                column: "WarrantyClaimId");

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyRecords_OrderDetailId",
                table: "WarrantyRecords",
                column: "OrderDetailId");

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyRecords_OrderId",
                table: "WarrantyRecords",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyRecords_ProductId",
                table: "WarrantyRecords",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyRecords_SerialOrImei",
                table: "WarrantyRecords",
                column: "SerialOrImei");

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyRecords_StockItemId",
                table: "WarrantyRecords",
                column: "StockItemId");

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyRecords_VariantId",
                table: "WarrantyRecords",
                column: "VariantId");

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyRecords_WarrantyCode",
                table: "WarrantyRecords",
                column: "WarrantyCode",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Attachments");

            migrationBuilder.DropTable(
                name: "CategorySuppliers");

            migrationBuilder.DropTable(
                name: "CouponScopes");

            migrationBuilder.DropTable(
                name: "GoodsReceiptSerials");

            migrationBuilder.DropTable(
                name: "InventoryReturns");

            migrationBuilder.DropTable(
                name: "InventoryTransactions");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "OrderCancellations");

            migrationBuilder.DropTable(
                name: "OrderCoupons");

            migrationBuilder.DropTable(
                name: "OrderDetailStockItems");

            migrationBuilder.DropTable(
                name: "OrderTimelines");

            migrationBuilder.DropTable(
                name: "ProductImages");

            migrationBuilder.DropTable(
                name: "ProductRecommendations");

            migrationBuilder.DropTable(
                name: "ProductSpecValues");

            migrationBuilder.DropTable(
                name: "RepairUpdates");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "StockMovements");

            migrationBuilder.DropTable(
                name: "StoreSettings");

            migrationBuilder.DropTable(
                name: "SupportTicketUpdates");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "VoucherSpins");

            migrationBuilder.DropTable(
                name: "WarrantyClaimUpdates");

            migrationBuilder.DropTable(
                name: "GoodsReceiptLines");

            migrationBuilder.DropTable(
                name: "UserCoupons");

            migrationBuilder.DropTable(
                name: "SpecOptions");

            migrationBuilder.DropTable(
                name: "RepairCases");

            migrationBuilder.DropTable(
                name: "GoodsReceipts");

            migrationBuilder.DropTable(
                name: "Coupons");

            migrationBuilder.DropTable(
                name: "SpecDefinitions");

            migrationBuilder.DropTable(
                name: "SupportTickets");

            migrationBuilder.DropTable(
                name: "WarrantyClaims");

            migrationBuilder.DropTable(
                name: "WarrantyRecords");

            migrationBuilder.DropTable(
                name: "StockItems");

            migrationBuilder.DropTable(
                name: "OrderDetails");

            migrationBuilder.DropTable(
                name: "Warehouses");

            migrationBuilder.DropTable(
                name: "Orders");

            migrationBuilder.DropTable(
                name: "ProductVariants");

            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "Suppliers");
        }
    }
}
