using Microsoft.EntityFrameworkCore;
using BaseCore.Entities;
using BaseCore.Common;
using System.Globalization;
using System.Text;
using System.Threading.Tasks;

namespace BaseCore.Repository
{
    /// <summary>
    /// Entity Framework Core DbContext for SQL Server
    /// Used for teaching EF Core concepts (Bài 10)
    /// </summary>
    public class AppDbContext : DbContext
    { 
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // DbSet for each entity
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<ProductCategory> ProductCategories { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<OrderTimeline> OrderTimelines { get; set; }
        public DbSet<OrderCancellation> OrderCancellations { get; set; }
        public DbSet<ProductImage> ProductImages { get; set; }
        public DbSet<ProductVariant> ProductVariants { get; set; }
        public DbSet<SpecDefinition> SpecDefinitions { get; set; }
        public DbSet<SpecOption> SpecOptions { get; set; }
        public DbSet<ProductSpecValue> ProductSpecValues { get; set; }
        public DbSet<ProductRecommendation> ProductRecommendations { get; set; }
        public DbSet<Warehouse> Warehouses { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<CategorySupplier> CategorySuppliers { get; set; }
        public DbSet<StockItem> StockItems { get; set; }
        public DbSet<GoodsReceipt> GoodsReceipts { get; set; }
        public DbSet<GoodsReceiptLine> GoodsReceiptLines { get; set; }
        public DbSet<GoodsReceiptSerial> GoodsReceiptSerials { get; set; }
        public DbSet<StockMovement> StockMovements { get; set; }
        public DbSet<InventoryReturn> InventoryReturns { get; set; }
        public DbSet<OrderDetailStockItem> OrderDetailStockItems { get; set; }
        public DbSet<WarrantyRecord> WarrantyRecords { get; set; }
        public DbSet<WarrantyClaim> WarrantyClaims { get; set; }
        public DbSet<WarrantyClaimUpdate> WarrantyClaimUpdates { get; set; }
        public DbSet<RepairCase> RepairCases { get; set; }
        public DbSet<RepairUpdate> RepairUpdates { get; set; }
        public DbSet<SupportTicket> SupportTickets { get; set; }
        public DbSet<SupportTicketUpdate> SupportTicketUpdates { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Attachment> Attachments { get; set; }
        public DbSet<Coupon> Coupons { get; set; }
        public DbSet<CouponScope> CouponScopes { get; set; }
        public DbSet<UserCoupon> UserCoupons { get; set; }
        public DbSet<OrderCoupon> OrderCoupons { get; set; }
        public DbSet<VoucherSpin> VoucherSpins { get; set; }
        public DbSet<StoreSetting> StoreSettings { get; set; }
        public DbSet<PaymentSession> PaymentSessions { get; set; }
        public DbSet<InventoryTransaction> InventoryTransactions { get; set; }
        public DbSet<Banner> Banners { get; set; }
        public DbSet<Brand> Brands { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.UserName).HasMaxLength(50).IsRequired();
                entity.Property(e => e.Password).HasMaxLength(255).IsRequired();
                entity.Property(e => e.Name).HasMaxLength(100);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.Phone).HasMaxLength(20);
                entity.Property(e => e.DateOfBirth).HasColumnType("date");
                entity.HasIndex(e => e.UserName).IsUnique();
            });

            modelBuilder.Entity<Role>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(24).ValueGeneratedNever();
                entity.Property(e => e.Name).HasMaxLength(50).IsRequired();
                entity.Property(e => e.Description).HasMaxLength(250);
                entity.Property(e => e.CreatedBy).HasMaxLength(100);
                entity.Property(e => e.ModifiedBy).HasMaxLength(100);
                entity.Property(e => e.CreatedUser).HasMaxLength(100);
                entity.HasIndex(e => e.Name).IsUnique();
            });

            var coreSeedTime = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            modelBuilder.Entity<Role>().HasData(
                new Role
                {
                    Id = "000000000000000000000001",
                    Guid = new Guid("00000000-0000-0000-0000-000000000001"),
                    Name = "Admin",
                    Description = "Administrator",
                    CreatedUser = "system",
                    CreatedDateTime = coreSeedTime,
                    CreatedBy = "system",
                    Created = coreSeedTime,
                    ModifiedBy = "system",
                    Modified = coreSeedTime,
                    IsActive = true,
                    IsDeleted = false,
                    RoleType = 1
                },
                new Role
                {
                    Id = "000000000000000000000002",
                    Guid = new Guid("00000000-0000-0000-0000-000000000002"),
                    Name = "User",
                    Description = "Regular user",
                    CreatedUser = "system",
                    CreatedDateTime = coreSeedTime,
                    CreatedBy = "system",
                    Created = coreSeedTime,
                    ModifiedBy = "system",
                    Modified = coreSeedTime,
                    IsActive = true,
                    IsDeleted = false,
                    RoleType = 0
                });

            modelBuilder.Entity<StoreSetting>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.StoreName).HasMaxLength(160).IsRequired();
                entity.Property(e => e.Hotline).HasMaxLength(40).IsRequired();
                entity.Property(e => e.SupportEmail).HasMaxLength(160);
                entity.Property(e => e.Address).HasMaxLength(500);
                entity.Property(e => e.WarrantyAddress).HasMaxLength(500);
                entity.Property(e => e.DefaultShippingFee).HasPrecision(18, 2);
                entity.Property(e => e.FreeShippingThreshold).HasPrecision(18, 2);
                entity.Property(e => e.SupportTime).HasMaxLength(160);
                entity.Property(e => e.LogoUrl).HasMaxLength(500);
                entity.Property(e => e.FacebookUrl).HasMaxLength(500);
                entity.Property(e => e.ZaloUrl).HasMaxLength(500);
                entity.Property(e => e.BankName).HasMaxLength(160);
                entity.Property(e => e.BankAccountNumber).HasMaxLength(40);
                entity.Property(e => e.BankAccountHolder).HasMaxLength(160);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            modelBuilder.Entity<PaymentSession>(entity =>
            {
                entity.Property(e => e.SessionId).HasMaxLength(40).IsRequired();
                entity.Property(e => e.Token).HasMaxLength(64).IsRequired();
                entity.Property(e => e.Status).HasMaxLength(20).IsRequired();
                entity.Property(e => e.TransactionId).HasMaxLength(80);
                entity.Property(e => e.OrderPayloadJson);
                entity.Property(e => e.Amount).HasPrecision(18, 2);
                entity.HasIndex(e => e.SessionId).IsUnique();
                entity.HasIndex(e => e.OrderId);
            });

            modelBuilder.Entity<StoreSetting>().HasData(new StoreSetting
            {
                Id = 1,
                StoreName = "CNTHHT Store",
                Hotline = "0327 188 459",
                SupportEmail = "support@cnthht.vn",
                Address = string.Empty,
                WarrantyAddress = string.Empty,
                DefaultShippingFee = 0,
                FreeShippingThreshold = null,
                SupportTime = string.Empty,
                LogoUrl = string.Empty,
                FacebookUrl = string.Empty,
                ZaloUrl = string.Empty,
                BankName = string.Empty,
                BankAccountNumber = string.Empty,
                BankAccountHolder = string.Empty,
                CreatedAt = coreSeedTime,
                UpdatedAt = coreSeedTime
            });

            // Configure Brand (Hãng) - master theo danh mục
            modelBuilder.Entity<Brand>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(120).IsRequired();
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.HasIndex(e => new { e.CategoryId, e.Name }).IsUnique();
            });

            modelBuilder.Entity<Brand>().HasData(
                // Cat 1 - Điện thoại
                new Brand { Id = 1, CategoryId = 1, Name = "Apple", IsActive = true, CreatedAt = coreSeedTime },
                new Brand { Id = 2, CategoryId = 1, Name = "Samsung", IsActive = true, CreatedAt = coreSeedTime },
                new Brand { Id = 3, CategoryId = 1, Name = "Xiaomi", IsActive = true, CreatedAt = coreSeedTime },
                new Brand { Id = 4, CategoryId = 1, Name = "OPPO", IsActive = true, CreatedAt = coreSeedTime },
                new Brand { Id = 5, CategoryId = 1, Name = "Vivo", IsActive = true, CreatedAt = coreSeedTime },
                new Brand { Id = 6, CategoryId = 1, Name = "Realme", IsActive = true, CreatedAt = coreSeedTime },
                // Cat 2 - Laptop
                new Brand { Id = 7, CategoryId = 2, Name = "Apple", IsActive = true, CreatedAt = coreSeedTime },
                new Brand { Id = 8, CategoryId = 2, Name = "ASUS", IsActive = true, CreatedAt = coreSeedTime },
                new Brand { Id = 9, CategoryId = 2, Name = "Dell", IsActive = true, CreatedAt = coreSeedTime },
                new Brand { Id = 10, CategoryId = 2, Name = "HP", IsActive = true, CreatedAt = coreSeedTime },
                new Brand { Id = 11, CategoryId = 2, Name = "Lenovo", IsActive = true, CreatedAt = coreSeedTime },
                new Brand { Id = 12, CategoryId = 2, Name = "Acer", IsActive = true, CreatedAt = coreSeedTime },
                // Cat 4 - Tablet
                new Brand { Id = 13, CategoryId = 4, Name = "Apple", IsActive = true, CreatedAt = coreSeedTime },
                new Brand { Id = 14, CategoryId = 4, Name = "Samsung", IsActive = true, CreatedAt = coreSeedTime },
                new Brand { Id = 15, CategoryId = 4, Name = "Xiaomi", IsActive = true, CreatedAt = coreSeedTime },
                new Brand { Id = 16, CategoryId = 4, Name = "Lenovo", IsActive = true, CreatedAt = coreSeedTime },
                // Cat 5 - Đồng hồ thông minh
                new Brand { Id = 17, CategoryId = 5, Name = "Apple", IsActive = true, CreatedAt = coreSeedTime },
                new Brand { Id = 18, CategoryId = 5, Name = "Samsung", IsActive = true, CreatedAt = coreSeedTime },
                new Brand { Id = 19, CategoryId = 5, Name = "Garmin", IsActive = true, CreatedAt = coreSeedTime },
                // Cat 6 - Máy ảnh
                new Brand { Id = 20, CategoryId = 6, Name = "Canon", IsActive = true, CreatedAt = coreSeedTime },
                new Brand { Id = 21, CategoryId = 6, Name = "Sony", IsActive = true, CreatedAt = coreSeedTime },
                new Brand { Id = 22, CategoryId = 6, Name = "DJI", IsActive = true, CreatedAt = coreSeedTime },
                new Brand { Id = 23, CategoryId = 6, Name = "GoPro", IsActive = true, CreatedAt = coreSeedTime },
                // Cat 7 - Tai nghe
                new Brand { Id = 24, CategoryId = 7, Name = "Apple", IsActive = true, CreatedAt = coreSeedTime },
                new Brand { Id = 25, CategoryId = 7, Name = "Sony", IsActive = true, CreatedAt = coreSeedTime },
                new Brand { Id = 26, CategoryId = 7, Name = "Bose", IsActive = true, CreatedAt = coreSeedTime },
                new Brand { Id = 27, CategoryId = 7, Name = "Baseus", IsActive = true, CreatedAt = coreSeedTime },
                new Brand { Id = 28, CategoryId = 7, Name = "Keychron", IsActive = true, CreatedAt = coreSeedTime },
                new Brand { Id = 29, CategoryId = 7, Name = "Logitech", IsActive = true, CreatedAt = coreSeedTime },
                // Cat 8 - Audio
                new Brand { Id = 30, CategoryId = 8, Name = "JBL", IsActive = true, CreatedAt = coreSeedTime },
                new Brand { Id = 31, CategoryId = 8, Name = "Marshall", IsActive = true, CreatedAt = coreSeedTime },
                new Brand { Id = 32, CategoryId = 8, Name = "Samsung", IsActive = true, CreatedAt = coreSeedTime }
            );

            // Configure Category entity
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
                entity.Property(e => e.Description).HasMaxLength(500);
            });

            // Configure Product entity
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
                entity.Property(e => e.Slug).HasMaxLength(220);
                entity.Property(e => e.OriginalPrice).HasPrecision(18, 2);
                entity.Property(e => e.Description).HasMaxLength(1000);
                entity.Property(e => e.LongDescription).HasMaxLength(4000);
                entity.Property(e => e.Brand).HasMaxLength(120);
                entity.Property(e => e.SupplyType).HasMaxLength(80);
                entity.Property(e => e.WarrantyProvider).HasMaxLength(160);
                entity.Property(e => e.ImageUrl).HasMaxLength(500);
                entity.Property(e => e.WarrantyMonths).HasDefaultValue(12);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

                // Relationship with Category
                entity.HasOne(e => e.Category)
                      .WithMany()
                      .HasForeignKey(e => e.CategoryId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Supplier)
                      .WithMany(s => s.Products)
                      .HasForeignKey(e => e.SupplierId)
                      .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(e => e.BackupSupplier)
                      .WithMany(s => s.BackupProducts)
                      .HasForeignKey(e => e.BackupSupplierId)
                      .OnDelete(DeleteBehavior.NoAction);

                // Many-to-many with Category via ProductCategory
                entity.HasMany(e => e.ProductCategories)
                      .WithOne(pc => pc.Product)
                      .HasForeignKey(pc => pc.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure ProductCategory join entity
            modelBuilder.Entity<ProductCategory>(entity =>
            {
                entity.HasKey(e => new { e.ProductId, e.CategoryId });

                entity.HasOne(e => e.Product)
                      .WithMany(p => p.ProductCategories)
                      .HasForeignKey(e => e.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Category)
                      .WithMany()
                      .HasForeignKey(e => e.CategoryId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<ProductImage>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ImageUrl).HasMaxLength(500).IsRequired();
                entity.Property(e => e.AltText).HasMaxLength(250);
                entity.HasOne(e => e.Product)
                      .WithMany(p => p.Images)
                      .HasForeignKey(e => e.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ProductVariant>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.VariantName).HasMaxLength(160);
                entity.Property(e => e.Price).HasPrecision(18, 2);
                entity.Property(e => e.OriginalPrice).HasPrecision(18, 2);
                entity.Property(e => e.Sku).HasMaxLength(80);
                entity.Property(e => e.ImageUrl).HasMaxLength(500);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.HasOne(e => e.Product)
                      .WithMany(p => p.Variants)
                      .HasForeignKey(e => e.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<SpecDefinition>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(160).IsRequired();
                entity.Property(e => e.Code).HasMaxLength(100).IsRequired();
                entity.Property(e => e.DataType).HasMaxLength(30).HasDefaultValue("text");
                entity.Property(e => e.InputType).HasMaxLength(30).HasDefaultValue("text");
                entity.Property(e => e.Unit).HasMaxLength(40);
                entity.Property(e => e.AllowCustomValue).HasDefaultValue(true);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.HasIndex(e => new { e.CategoryId, e.Code }).IsUnique();
                entity.HasOne(e => e.Category)
                      .WithMany()
                      .HasForeignKey(e => e.CategoryId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<SpecOption>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Value).HasMaxLength(250).IsRequired();
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.HasOne(e => e.SpecDefinition)
                      .WithMany(d => d.Options)
                      .HasForeignKey(e => e.SpecDefinitionId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ProductSpecValue>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ValueText).HasMaxLength(2000);
                entity.Property(e => e.ValueNumber).HasPrecision(18, 4);
                entity.HasIndex(e => new { e.ProductId, e.SpecDefinitionId }).IsUnique();
                entity.HasOne(e => e.Product)
                      .WithMany(p => p.SpecValues)
                      .HasForeignKey(e => e.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.SpecDefinition)
                      .WithMany(d => d.ProductSpecValues)
                      .HasForeignKey(e => e.SpecDefinitionId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.SpecOption)
                      .WithMany(o => o.ProductSpecValues)
                      .HasForeignKey(e => e.SpecOptionId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            modelBuilder.Entity<ProductRecommendation>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Type).HasMaxLength(40).IsRequired();
                entity.HasIndex(e => new { e.ProductId, e.RecommendedProductId, e.Type }).IsUnique();
                entity.HasOne(e => e.Product)
                      .WithMany(p => p.Recommendations)
                      .HasForeignKey(e => e.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.RecommendedProduct)
                      .WithMany()
                      .HasForeignKey(e => e.RecommendedProductId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure Order entity
            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.OrderCode).HasMaxLength(40);
                entity.HasIndex(e => e.OrderCode).IsUnique().HasFilter("[OrderCode] IS NOT NULL");
                entity.Property(e => e.CustomerName).HasMaxLength(160);
                entity.Property(e => e.CustomerPhone).HasMaxLength(30);
                entity.Property(e => e.CustomerEmail).HasMaxLength(160);
                entity.Property(e => e.Subtotal).HasPrecision(18, 2);
                entity.Property(e => e.ProductDiscount).HasPrecision(18, 2);
                entity.Property(e => e.ShippingFee).HasPrecision(18, 2);
                entity.Property(e => e.ShippingDiscount).HasPrecision(18, 2);
                entity.Property(e => e.TotalAmount).HasPrecision(18, 2);
                entity.Property(e => e.Status).HasMaxLength(40).HasDefaultValue("Pending");
                entity.Property(e => e.PaymentMethod).HasMaxLength(40);
                entity.Property(e => e.PaymentStatus).HasMaxLength(40).HasDefaultValue("Unpaid");
                entity.Property(e => e.TransactionId).HasMaxLength(120);
                entity.Property(e => e.ShippingMethod).HasMaxLength(40);
                entity.Property(e => e.ShippingAddress).HasMaxLength(500);
                entity.Property(e => e.Province).HasMaxLength(120);
                entity.Property(e => e.District).HasMaxLength(120);
                entity.Property(e => e.Ward).HasMaxLength(120);
                entity.Property(e => e.AddressDetail).HasMaxLength(300);
                entity.Property(e => e.StorePickupLocation).HasMaxLength(250);
                entity.Property(e => e.PickupVerificationPin).HasMaxLength(12);
                entity.Property(e => e.Carrier).HasMaxLength(120);
                entity.Property(e => e.TrackingCode).HasMaxLength(120);
                entity.Property(e => e.DeliveryFailedReason).HasMaxLength(500);
                entity.Property(e => e.InvoiceCompanyName).HasMaxLength(200);
                entity.Property(e => e.InvoiceTaxCode).HasMaxLength(40);
                entity.Property(e => e.InvoiceAddress).HasMaxLength(300);
                entity.Property(e => e.InvoiceEmail).HasMaxLength(160);
                entity.Property(e => e.RefundStatus).HasMaxLength(40);
                entity.Property(e => e.RefundAmount).HasPrecision(18, 2);
                entity.Property(e => e.RefundTransactionId).HasMaxLength(120);
                entity.Property(e => e.ReturnStatus).HasMaxLength(40);
                entity.Property(e => e.Notes).HasMaxLength(1000);
                entity.Property(e => e.CancelReason).HasMaxLength(1000);
                entity.Property(e => e.CancelReviewNote).HasMaxLength(1000);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            // Configure OrderDetail entity
            modelBuilder.Entity<OrderDetail>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ProductName).HasMaxLength(250);
                entity.Property(e => e.ProductImage).HasMaxLength(500);
                entity.Property(e => e.Sku).HasMaxLength(100);
                entity.Property(e => e.SelectedColor).HasMaxLength(100);
                entity.Property(e => e.SelectedVersion).HasMaxLength(100);
                entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
                entity.Property(e => e.TotalPrice).HasPrecision(18, 2);
                entity.Property(e => e.SerialOrImei).HasMaxLength(120);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

                // Relationships
                entity.HasOne(e => e.Order)
                      .WithMany(o => o.OrderDetails)
                      .HasForeignKey(e => e.OrderId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Product)
                      .WithMany()
                      .HasForeignKey(e => e.ProductId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Variant)
                      .WithMany()
                      .HasForeignKey(e => e.VariantId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<OrderTimeline>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Status).HasMaxLength(40).IsRequired();
                entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
                entity.Property(e => e.Note).HasMaxLength(1000);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.HasOne(e => e.Order)
                      .WithMany(o => o.Timelines)
                      .HasForeignKey(e => e.OrderId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<OrderCancellation>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Reason).HasMaxLength(1000);
                entity.Property(e => e.Status).HasMaxLength(40).HasDefaultValue("Pending");
                entity.Property(e => e.AdminNote).HasMaxLength(1000);
                entity.Property(e => e.RequestedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.HasOne(e => e.Order)
                      .WithMany(o => o.Cancellations)
                      .HasForeignKey(e => e.OrderId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Warehouse>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(160).IsRequired();
                entity.Property(e => e.Code).HasMaxLength(40).IsRequired();
                entity.Property(e => e.Address).HasMaxLength(300);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.HasIndex(e => e.Code).IsUnique();
            });

            modelBuilder.Entity<Supplier>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Ignore(e => e.Code);
                entity.Property(e => e.SupplierCode).HasMaxLength(40).IsRequired();
                entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
                entity.Property(e => e.Phone).HasMaxLength(30);
                entity.Property(e => e.Email).HasMaxLength(160);
                entity.Property(e => e.Address).HasMaxLength(300);
                entity.Property(e => e.TaxCode).HasMaxLength(40);
                entity.Property(e => e.ContactPerson).HasMaxLength(160);
                entity.Property(e => e.SupplierType).HasConversion<string>().HasMaxLength(40);
                entity.Property(e => e.Note).HasMaxLength(1000);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.HasIndex(e => e.SupplierCode).IsUnique();
                entity.HasIndex(e => e.Name);
            });

            modelBuilder.Entity<Supplier>().HasData(
                new Supplier { Id = 1, SupplierCode = "SUP-SYNNEX-FPT", Name = "Synnex FPT", SupplierType = SupplierType.AuthorizedDistributor, Phone = "19006600", Email = "contact@synnexfpt.com", Address = "Vietnam", IsActive = true, CreatedAt = coreSeedTime },
                new Supplier { Id = 2, SupplierCode = "SUP-DIGIWORLD", Name = "Digiworld", SupplierType = SupplierType.AuthorizedDistributor, Phone = "02839299959", Email = "contact@digiworld.com.vn", Address = "Vietnam", IsActive = true, CreatedAt = coreSeedTime },
                new Supplier { Id = 3, SupplierCode = "SUP-FPT-TRADING", Name = "FPT Trading", SupplierType = SupplierType.AuthorizedDistributor, Address = "Vietnam", IsActive = true, CreatedAt = coreSeedTime },
                new Supplier { Id = 4, SupplierCode = "SUP-PETROSETCO", Name = "Petrosetco Distribution", SupplierType = SupplierType.Tier1Distributor, Phone = "02854168686", Email = "contact@petrosetco.com.vn", Address = "Vietnam", IsActive = true, CreatedAt = coreSeedTime }
            );

            modelBuilder.Entity<CategorySupplier>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.HasIndex(e => new { e.CategoryId, e.SupplierId }).IsUnique();
                entity.HasOne(e => e.Category)
                      .WithMany()
                      .HasForeignKey(e => e.CategoryId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Supplier)
                      .WithMany()
                      .HasForeignKey(e => e.SupplierId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<StockItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.SerialOrImei).HasMaxLength(120).IsRequired();
                entity.Property(e => e.SerialNumber).HasMaxLength(120);
                entity.Property(e => e.Imei).HasMaxLength(20);
                entity.Property(e => e.InternalCode).HasMaxLength(120);
                entity.Property(e => e.Sku).HasMaxLength(100);
                entity.Property(e => e.Status).HasMaxLength(40).HasDefaultValue("InStock").IsRequired();
                entity.Property(e => e.UnitCost).HasPrecision(18, 2);
                entity.Property(e => e.SupplierName).HasMaxLength(200);
                entity.Property(e => e.Note).HasMaxLength(1000);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.HasIndex(e => e.SerialOrImei).IsUnique();
                // Unique filtered index: mỗi loại mã không trùng, nhưng cho phép nhiều NULL
                entity.HasIndex(e => e.Imei).IsUnique().HasFilter("[Imei] IS NOT NULL");
                entity.HasIndex(e => e.SerialNumber).IsUnique().HasFilter("[SerialNumber] IS NOT NULL");
                entity.HasIndex(e => e.InternalCode).IsUnique().HasFilter("[InternalCode] IS NOT NULL");
                entity.HasOne(e => e.Product).WithMany().HasForeignKey(e => e.ProductId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Variant).WithMany().HasForeignKey(e => e.VariantId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Supplier).WithMany(s => s.StockItems).HasForeignKey(e => e.SupplierId).OnDelete(DeleteBehavior.SetNull);
                entity.HasOne(e => e.Warehouse).WithMany().HasForeignKey(e => e.WarehouseId).OnDelete(DeleteBehavior.SetNull);
                entity.HasOne(e => e.Order).WithMany().HasForeignKey(e => e.OrderId).OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.OrderDetail).WithMany().HasForeignKey(e => e.OrderDetailId).OnDelete(DeleteBehavior.NoAction);
            });

            modelBuilder.Entity<GoodsReceipt>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ReceiptCode).HasMaxLength(40).IsRequired();
                entity.Property(e => e.SupplierId);
                entity.Property(e => e.SupplierName).HasMaxLength(200).IsRequired();
                entity.Property(e => e.Note).HasMaxLength(1000);
                entity.Property(e => e.TotalCost).HasPrecision(18, 2);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.HasIndex(e => e.ReceiptCode).IsUnique();
                entity.HasOne(e => e.Supplier).WithMany(s => s.GoodsReceipts).HasForeignKey(e => e.SupplierId).OnDelete(DeleteBehavior.SetNull);
                entity.HasOne(e => e.Warehouse).WithMany().HasForeignKey(e => e.WarehouseId).OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<GoodsReceiptLine>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.UnitCost).HasPrecision(18, 2);
                entity.Property(e => e.TotalCost).HasPrecision(18, 2);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.HasOne(e => e.GoodsReceipt).WithMany(r => r.Lines).HasForeignKey(e => e.GoodsReceiptId).OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Product).WithMany().HasForeignKey(e => e.ProductId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Variant).WithMany().HasForeignKey(e => e.VariantId).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<GoodsReceiptSerial>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.SerialOrImei).HasMaxLength(120).IsRequired();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.HasIndex(e => new { e.GoodsReceiptLineId, e.SerialOrImei }).IsUnique();
                entity.HasOne(e => e.GoodsReceiptLine).WithMany(l => l.Serials).HasForeignKey(e => e.GoodsReceiptLineId).OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.StockItem).WithMany().HasForeignKey(e => e.StockItemId).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<StockMovement>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Type).HasMaxLength(40).IsRequired();
                entity.Property(e => e.FromStatus).HasMaxLength(40);
                entity.Property(e => e.ToStatus).HasMaxLength(40);
                entity.Property(e => e.ReferenceType).HasMaxLength(40).IsRequired();
                entity.Property(e => e.Note).HasMaxLength(1000);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.HasOne(e => e.Product).WithMany().HasForeignKey(e => e.ProductId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Variant).WithMany().HasForeignKey(e => e.VariantId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.StockItem).WithMany().HasForeignKey(e => e.StockItemId).OnDelete(DeleteBehavior.SetNull);
                entity.HasOne(e => e.Warehouse).WithMany().HasForeignKey(e => e.WarehouseId).OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<InventoryReturn>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ReturnCode).HasMaxLength(40).IsRequired();
                entity.Property(e => e.SerialOrImei).HasMaxLength(120);
                entity.Property(e => e.CustomerName).HasMaxLength(160);
                entity.Property(e => e.CustomerPhone).HasMaxLength(30);
                entity.Property(e => e.Reason).HasMaxLength(1000).IsRequired();
                entity.Property(e => e.Condition).HasMaxLength(40).IsRequired();
                entity.Property(e => e.Status).HasMaxLength(40).HasDefaultValue("Pending").IsRequired();
                entity.Property(e => e.RefundAmount).HasPrecision(18, 2);
                entity.Property(e => e.Note).HasMaxLength(1000);
                entity.Property(e => e.ReviewNote).HasMaxLength(1000);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.HasIndex(e => e.ReturnCode).IsUnique();
                entity.HasOne(e => e.Product).WithMany().HasForeignKey(e => e.ProductId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Variant).WithMany().HasForeignKey(e => e.VariantId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.StockItem).WithMany().HasForeignKey(e => e.StockItemId).OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.Order).WithMany().HasForeignKey(e => e.OrderId).OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.OrderDetail).WithMany().HasForeignKey(e => e.OrderDetailId).OnDelete(DeleteBehavior.NoAction);
            });

            modelBuilder.Entity<OrderDetailStockItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.HasIndex(e => e.StockItemId).IsUnique();
                entity.HasOne(e => e.OrderDetail).WithMany(d => d.StockItems).HasForeignKey(e => e.OrderDetailId).OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.StockItem).WithMany().HasForeignKey(e => e.StockItemId).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<WarrantyRecord>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.WarrantyCode).HasMaxLength(40).IsRequired();
                entity.Property(e => e.SerialOrImei).HasColumnName("SerialNumber").HasMaxLength(120).IsRequired();
                entity.Property(e => e.CustomerName).HasMaxLength(160);
                entity.Property(e => e.CustomerPhone).HasMaxLength(30);
                entity.Property(e => e.CustomerEmail).HasMaxLength(160);
                entity.Property(e => e.ProductName).HasMaxLength(250);
                entity.Property(e => e.ProductImage).HasMaxLength(500);
                entity.Property(e => e.Status).HasMaxLength(40).HasDefaultValue("NotActivated");
                entity.Property(e => e.Note).HasMaxLength(1000);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.HasIndex(e => e.WarrantyCode).IsUnique();
                entity.HasIndex(e => e.OrderDetailId);
                entity.HasIndex(e => e.SerialOrImei);
                entity.HasOne(e => e.Order).WithMany().HasForeignKey(e => e.OrderId).OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.OrderDetail).WithMany().HasForeignKey(e => e.OrderDetailId).OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.Product).WithMany().HasForeignKey(e => e.ProductId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Variant).WithMany().HasForeignKey(e => e.VariantId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.StockItem).WithMany().HasForeignKey(e => e.StockItemId).OnDelete(DeleteBehavior.NoAction);
            });

            modelBuilder.Entity<WarrantyClaim>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ClaimCode).HasMaxLength(40).IsRequired();
                entity.Property(e => e.WarrantyId).HasColumnName("WarrantyRecordId").IsRequired();
                entity.Property(e => e.SerialOrImei).HasMaxLength(120);
                entity.Property(e => e.CustomerName).HasMaxLength(160);
                entity.Property(e => e.CustomerPhone).HasMaxLength(30);
                entity.Property(e => e.CustomerEmail).HasMaxLength(160);
                entity.Property(e => e.IssueDescription).HasMaxLength(2000).IsRequired();
                entity.Property(e => e.ReceiveMethod).HasMaxLength(40).IsRequired();
                entity.Property(e => e.ReturnAddress).HasMaxLength(500);
                entity.Property(e => e.Status).HasMaxLength(40).HasDefaultValue("Pending");
                entity.Property(e => e.Priority).HasMaxLength(40).HasDefaultValue("Normal");
                entity.Property(e => e.RejectedReason).HasMaxLength(1000);
                entity.Property(e => e.Note).HasMaxLength(1000);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.HasIndex(e => e.ClaimCode).IsUnique();
                entity.HasOne(e => e.Warranty).WithMany().HasForeignKey(e => e.WarrantyId).OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.Product).WithMany().HasForeignKey(e => e.ProductId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Variant).WithMany().HasForeignKey(e => e.VariantId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.StockItem).WithMany().HasForeignKey(e => e.StockItemId).OnDelete(DeleteBehavior.NoAction);
            });

            modelBuilder.Entity<WarrantyClaimUpdate>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Status).HasMaxLength(40).IsRequired();
                entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
                entity.Property(e => e.Message).HasMaxLength(1000);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.HasOne(e => e.WarrantyClaim).WithMany(c => c.Updates).HasForeignKey(e => e.WarrantyClaimId).OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<RepairCase>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.RepairCode).HasColumnName("CaseCode").HasMaxLength(40).IsRequired();
                entity.Property(e => e.SerialOrImei).HasColumnName("SerialNumber").HasMaxLength(120);
                entity.Property(e => e.CustomerName).HasMaxLength(160);
                entity.Property(e => e.CustomerPhone).HasMaxLength(30);
                entity.Property(e => e.ProductName).HasMaxLength(250);
                entity.Property(e => e.IssueDescription).HasMaxLength(2000).IsRequired();
                entity.Property(e => e.Diagnosis).HasMaxLength(2000);
                entity.Property(e => e.Solution).HasMaxLength(2000);
                entity.Property(e => e.Status).HasMaxLength(40).HasDefaultValue("Pending");
                entity.Property(e => e.Priority).HasMaxLength(40).HasDefaultValue("Normal");
                entity.Property(e => e.CostEstimate).HasPrecision(18, 2);
                entity.Property(e => e.FinalCost).HasPrecision(18, 2);
                entity.Property(e => e.Note).HasMaxLength(1000);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.HasIndex(e => e.RepairCode).IsUnique();
                entity.HasOne(e => e.WarrantyClaim).WithMany().HasForeignKey(e => e.WarrantyClaimId).OnDelete(DeleteBehavior.SetNull);
                entity.HasOne(e => e.Ticket).WithMany().HasForeignKey(e => e.TicketId).OnDelete(DeleteBehavior.SetNull);
                entity.HasOne(e => e.StockItem).WithMany().HasForeignKey(e => e.StockItemId).OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.Product).WithMany().HasForeignKey(e => e.ProductId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Variant).WithMany().HasForeignKey(e => e.VariantId).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<RepairUpdate>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Status).HasMaxLength(40).IsRequired();
                entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
                entity.Property(e => e.Message).HasMaxLength(1000);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.HasOne(e => e.RepairCase).WithMany(r => r.Updates).HasForeignKey(e => e.RepairCaseId).OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<InventoryTransaction>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Type).HasConversion<string>().HasMaxLength(40);
                entity.Property(e => e.UnitCost).HasPrecision(18, 2);
                entity.Property(e => e.Note).HasMaxLength(1000);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.HasOne(e => e.Product).WithMany().HasForeignKey(e => e.ProductId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Variant).WithMany().HasForeignKey(e => e.VariantId).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<SupportTicket>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TicketCode).HasMaxLength(40).IsRequired();
                entity.Property(e => e.Subject).HasMaxLength(250).IsRequired();
                entity.Property(e => e.Description).HasMaxLength(3000).IsRequired();
                entity.Property(e => e.CustomerName).HasMaxLength(160);
                entity.Property(e => e.CustomerPhone).HasMaxLength(30);
                entity.Property(e => e.CustomerEmail).HasMaxLength(160);
                entity.Property(e => e.SerialOrImei).HasMaxLength(120);
                entity.Property(e => e.UserSessionId).HasMaxLength(255);
                entity.Property(e => e.Status).HasMaxLength(40).HasDefaultValue("Open");
                entity.Property(e => e.Priority).HasMaxLength(40).HasDefaultValue("Normal");
                entity.Property(e => e.Category).HasMaxLength(40).HasDefaultValue("Other");
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.HasIndex(e => e.TicketCode).IsUnique();
                entity.HasOne(e => e.RelatedOrder).WithMany().HasForeignKey(e => e.RelatedOrderId).OnDelete(DeleteBehavior.SetNull);
                entity.HasOne(e => e.RelatedProduct).WithMany().HasForeignKey(e => e.RelatedProductId).OnDelete(DeleteBehavior.SetNull);
                entity.HasOne(e => e.RelatedWarranty).WithMany().HasForeignKey(e => e.RelatedWarrantyId).OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<SupportTicketUpdate>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Message).HasMaxLength(3000).IsRequired();
                entity.Property(e => e.SenderName).HasMaxLength(100).IsRequired();
                entity.Property(e => e.StatusAfter).HasMaxLength(40);
                entity.Property(e => e.PriorityAfter).HasMaxLength(40);
                entity.Property(e => e.IsAdminReply).HasDefaultValue(false);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.HasOne(e => e.Ticket).WithMany(t => t.Updates).HasForeignKey(e => e.TicketId).OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.ParentMessage).WithMany(e => e.Replies).HasForeignKey(e => e.ParentMessageId).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Notification>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
                entity.Property(e => e.Message).HasMaxLength(1000).IsRequired();
                entity.Property(e => e.Type).HasMaxLength(40).IsRequired();
                entity.Property(e => e.ReferenceType).HasMaxLength(40).IsRequired();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.HasIndex(e => new { e.UserId, e.IsRead, e.CreatedAt });
            });

            modelBuilder.Entity<Attachment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.EntityType).HasMaxLength(40).IsRequired();
                entity.Property(e => e.FileName).HasMaxLength(260).IsRequired();
                entity.Property(e => e.FileUrl).HasMaxLength(500).IsRequired();
                entity.Property(e => e.ContentType).HasMaxLength(120).IsRequired();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            modelBuilder.Entity<Coupon>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Code).HasMaxLength(60).IsRequired();
                entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasMaxLength(1000);
                entity.Property(e => e.Type).HasMaxLength(40).IsRequired();
                entity.Property(e => e.DiscountType).HasMaxLength(40).IsRequired();
                entity.Property(e => e.DiscountValue).HasPrecision(18, 2);
                entity.Property(e => e.MaxDiscountAmount).HasPrecision(18, 2);
                entity.Property(e => e.MinOrderAmount).HasPrecision(18, 2);
                entity.Property(e => e.AllowedPaymentMethods).HasMaxLength(240);
                entity.Property(e => e.DailyUsageLimit).HasDefaultValue(0);
                entity.Property(e => e.IsSpinReward).HasDefaultValue(false);
                entity.Property(e => e.SpinWeight).HasDefaultValue(0);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.HasIndex(e => e.Code).IsUnique();
            });

            modelBuilder.Entity<CouponScope>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ScopeType).HasMaxLength(40).IsRequired();
                entity.Property(e => e.Brand).HasMaxLength(120);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.HasOne(e => e.Coupon).WithMany(c => c.Scopes).HasForeignKey(e => e.CouponId).OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Product).WithMany().HasForeignKey(e => e.ProductId).OnDelete(DeleteBehavior.SetNull);
                entity.HasOne(e => e.Category).WithMany().HasForeignKey(e => e.CategoryId).OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<UserCoupon>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Status).HasMaxLength(40).HasDefaultValue("Claimed").IsRequired();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.HasIndex(e => new { e.UserId, e.CouponId });
                entity.HasOne(e => e.Coupon).WithMany().HasForeignKey(e => e.CouponId).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<OrderCoupon>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.CouponCode).HasMaxLength(60).IsRequired();
                entity.Property(e => e.CouponName).HasMaxLength(200).IsRequired();
                entity.Property(e => e.CouponType).HasMaxLength(40).IsRequired();
                entity.Property(e => e.DiscountType).HasMaxLength(40).IsRequired();
                entity.Property(e => e.DiscountValue).HasPrecision(18, 2);
                entity.Property(e => e.DiscountAmount).HasPrecision(18, 2);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.HasIndex(e => new { e.OrderId, e.CouponType }).IsUnique();
                entity.HasOne(e => e.Order).WithMany(o => o.Coupons).HasForeignKey(e => e.OrderId).OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Coupon).WithMany().HasForeignKey(e => e.CouponId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.UserCoupon).WithMany().HasForeignKey(e => e.UserCouponId).OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<VoucherSpin>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.RewardCode).HasMaxLength(60);
                entity.Property(e => e.ResultType).HasMaxLength(40).IsRequired();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.HasIndex(e => new { e.UserId, e.SpinDate }).IsUnique();
                entity.HasOne(e => e.RewardCoupon).WithMany().HasForeignKey(e => e.RewardCouponId).OnDelete(DeleteBehavior.SetNull);
            });

            // Configure Banner entity
            modelBuilder.Entity<Banner>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Kicker).HasMaxLength(200).IsRequired();
                entity.Property(e => e.Title).HasMaxLength(500).IsRequired();
                entity.Property(e => e.SubTitle).HasMaxLength(500).IsRequired();
                entity.Property(e => e.CtaLabel).HasMaxLength(100).IsRequired();
                entity.Property(e => e.CtaTo).HasMaxLength(500).IsRequired();
                entity.Property(e => e.ImageUrl).HasMaxLength(500).IsRequired();
                entity.Property(e => e.OfferTitle).HasMaxLength(100);
                entity.Property(e => e.OfferDiscount).HasMaxLength(50);
                entity.Property(e => e.OfferProduct).HasMaxLength(200);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            // -----------------------------------------------------------------
            // Referential integrity for user-reference Guid columns.
            // These columns hold Users.Id values but previously had no FK.
            // Configured as FK-only (no navigation property) and nullable with
            // ON DELETE NO ACTION so guest/system rows (NULL) stay valid and
            // multiple user FKs on the same table do not create cascade cycles.
            // -----------------------------------------------------------------
            modelBuilder.Entity<Attachment>().HasOne<User>().WithMany().HasForeignKey(e => e.UploadedByUserId).OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<Coupon>().HasOne<User>().WithMany().HasForeignKey(e => e.CreatedByUserId).OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<GoodsReceipt>().HasOne<User>().WithMany().HasForeignKey(e => e.CreatedByUserId).OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<InventoryReturn>().HasOne<User>().WithMany().HasForeignKey(e => e.CreatedByUserId).OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<InventoryReturn>().HasOne<User>().WithMany().HasForeignKey(e => e.ReviewedByUserId).OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<InventoryTransaction>().HasOne<User>().WithMany().HasForeignKey(e => e.CreatedByUserId).OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<Notification>().HasOne<User>().WithMany().HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<OrderCancellation>().HasOne<User>().WithMany().HasForeignKey(e => e.RequestedByUserId).OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<OrderCancellation>().HasOne<User>().WithMany().HasForeignKey(e => e.ReviewedByUserId).OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<Order>().HasOne<User>().WithMany().HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<Order>().HasOne<User>().WithMany().HasForeignKey(e => e.CancelReviewedByUserId).OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<Order>().HasOne<User>().WithMany().HasForeignKey(e => e.UpdatedByUserId).OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<OrderTimeline>().HasOne<User>().WithMany().HasForeignKey(e => e.CreatedByUserId).OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<RepairCase>().HasOne<User>().WithMany().HasForeignKey(e => e.TechnicianId).OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<RepairUpdate>().HasOne<User>().WithMany().HasForeignKey(e => e.CreatedByUserId).OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<StockItem>().HasOne<User>().WithMany().HasForeignKey(e => e.CustomerId).OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<StockMovement>().HasOne<User>().WithMany().HasForeignKey(e => e.CreatedByUserId).OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<SupportTicket>().HasOne<User>().WithMany().HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<SupportTicket>().HasOne<User>().WithMany().HasForeignKey(e => e.AssignedToUserId).OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<SupportTicketUpdate>().HasOne<User>().WithMany().HasForeignKey(e => e.CreatedByUserId).OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<UserCoupon>().HasOne<User>().WithMany().HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<VoucherSpin>().HasOne<User>().WithMany().HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<WarrantyClaim>().HasOne<User>().WithMany().HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<WarrantyClaimUpdate>().HasOne<User>().WithMany().HasForeignKey(e => e.CreatedByUserId).OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<WarrantyRecord>().HasOne<User>().WithMany().HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.NoAction);

            // -----------------------------------------------------------------
            // CHECK constraints for status/type columns whose value set is closed
            // and fully controlled by the app (mirrors BaseCore.Common.StatusConstants).
            // Open/dynamic sets (e.g. Order/Warranty/Ticket statuses, StockMovement
            // types) are intentionally left without CHECK to avoid blocking valid
            // future transitions. NULL passes the IN(...) check, so nullable columns
            // remain valid when empty.
            // -----------------------------------------------------------------
            modelBuilder.Entity<StockItem>().ToTable(t => t.HasCheckConstraint("CK_StockItems_Status",
                "[Status] IN ('InStock','Reserved','Sold','Returned','Repairing','Warranty','Damaged','Lost')"));
            modelBuilder.Entity<InventoryReturn>().ToTable(t => t.HasCheckConstraint("CK_InventoryReturns_Status",
                "[Status] IN ('Pending','Approved','Rejected','Restocked','Damaged')"));
            modelBuilder.Entity<InventoryReturn>().ToTable(t => t.HasCheckConstraint("CK_InventoryReturns_Condition",
                "[Condition] IN ('New','OpenBox','Used','Damaged','Defective')"));
            modelBuilder.Entity<Coupon>().ToTable(t => t.HasCheckConstraint("CK_Coupons_Type",
                "[Type] IN ('Product','Shipping')"));
            modelBuilder.Entity<Coupon>().ToTable(t => t.HasCheckConstraint("CK_Coupons_DiscountType",
                "[DiscountType] IN ('Amount','Percent','FreeShipping')"));
            modelBuilder.Entity<VoucherSpin>().ToTable(t => t.HasCheckConstraint("CK_VoucherSpins_ResultType",
                "[ResultType] IN ('Coupon','NoReward')"));
            modelBuilder.Entity<UserCoupon>().ToTable(t => t.HasCheckConstraint("CK_UserCoupons_Status",
                "[Status] IN ('Claimed','Used','Removed','Expired')"));

            // Seed initial data
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Seed Categories
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Điện thoại", Description = "Điện thoại và thiết bị di động" },
                new Category { Id = 2, Name = "Laptop", Description = "Laptop va may tinh xach tay" },
                new Category { Id = 4, Name = "Tablet", Description = "Máy tính bảng" },
                new Category { Id = 5, Name = "Đồng hồ thông minh", Description = "Đồng hồ thông minh" },
                new Category { Id = 6, Name = "Máy ảnh", Description = "Máy ảnh và thiết bị quay video" },
                new Category { Id = 7, Name = "Tai nghe", Description = "Tai nghe và thiết bị âm thanh" },
                new Category { Id = 8, Name = "Audio", Description = "Loa va tai nghe" }
            );

            modelBuilder.Entity<Warehouse>().HasData(
                new Warehouse { Id = 1, Name = "CNTHHT Main Store", Code = "MAIN", Address = "Main store", IsActive = true, CreatedAt = new DateTime(2026, 5, 18, 0, 0, 0, DateTimeKind.Utc) }
            );

            var couponStart = new DateTime(2026, 5, 24, 0, 0, 0, DateTimeKind.Utc);
            var couponEnd = new DateTime(2026, 12, 31, 23, 59, 59, DateTimeKind.Utc);
            var flashCouponEnd = new DateTime(2026, 5, 31, 23, 59, 59, DateTimeKind.Utc);
            var expiredCouponStart = new DateTime(2026, 4, 1, 0, 0, 0, DateTimeKind.Utc);
            var expiredCouponEnd = new DateTime(2026, 4, 30, 23, 59, 59, DateTimeKind.Utc);
            modelBuilder.Entity<Coupon>().HasData(
                new Coupon { Id = 1, Code = "FREESHIP", Name = "Mien phi van chuyen", Description = "Mien phi van chuyen cho don tu 300.000d", Type = "Shipping", DiscountType = "FreeShipping", DiscountValue = 100, MinOrderAmount = 300000, StartAt = couponStart, EndAt = couponEnd, TotalQuantity = 1500, ClaimedQuantity = 420, UsedQuantity = 260, PerUserLimit = 1, IsActive = true, IsPublic = true, IsAutoClaimable = true, IsStackable = false, IsSpinReward = true, SpinWeight = 25, CreatedAt = couponStart },
                new Coupon { Id = 2, Code = "SHIP20K", Name = "Giam 20K phi van chuyen", Description = "Giam 20.000d phi giao hang cho don tu 200.000d", Type = "Shipping", DiscountType = "Amount", DiscountValue = 20000, MinOrderAmount = 200000, StartAt = couponStart, EndAt = couponEnd, TotalQuantity = 1200, ClaimedQuantity = 280, UsedQuantity = 145, PerUserLimit = 1, IsActive = true, IsPublic = true, IsAutoClaimable = true, IsStackable = false, IsSpinReward = true, SpinWeight = 20, CreatedAt = couponStart },
                new Coupon { Id = 3, Code = "WELCOME10", Name = "Giam 10% don dau", Description = "Giam 10% toi da 150.000d cho don tu 500.000d", Type = "Product", DiscountType = "Percent", DiscountValue = 10, MaxDiscountAmount = 150000, MinOrderAmount = 500000, StartAt = couponStart, EndAt = couponEnd, TotalQuantity = 1000, ClaimedQuantity = 350, UsedQuantity = 190, PerUserLimit = 1, IsActive = true, IsPublic = true, IsAutoClaimable = true, IsStackable = false, IsSpinReward = true, SpinWeight = 15, CreatedAt = couponStart },
                new Coupon { Id = 4, Code = "SALE50K", Name = "Giam 50K don tu 1 trieu", Description = "Giam 50.000d cho don tu 1.000.000d", Type = "Product", DiscountType = "Amount", DiscountValue = 50000, MinOrderAmount = 1000000, StartAt = couponStart, EndAt = couponEnd, TotalQuantity = 800, ClaimedQuantity = 210, UsedQuantity = 95, PerUserLimit = 1, IsActive = true, IsPublic = true, IsAutoClaimable = true, IsStackable = false, IsSpinReward = true, SpinWeight = 10, CreatedAt = couponStart },
                new Coupon { Id = 5, Code = "SALE100K", Name = "Giam 100K don tu 3 trieu", Description = "Giam 100.000d cho don tu 3.000.000d", Type = "Product", DiscountType = "Amount", DiscountValue = 100000, MinOrderAmount = 3000000, StartAt = couponStart, EndAt = couponEnd, TotalQuantity = 500, ClaimedQuantity = 130, UsedQuantity = 58, PerUserLimit = 1, IsActive = true, IsPublic = true, IsAutoClaimable = true, IsStackable = false, IsSpinReward = false, SpinWeight = 0, CreatedAt = couponStart },
                new Coupon { Id = 6, Code = "PHONE12", Name = "Giam 12% dien thoai", Description = "Giam 12% toi da 300.000d cho dien thoai tu 2.000.000d", Type = "Product", DiscountType = "Percent", DiscountValue = 12, MaxDiscountAmount = 300000, MinOrderAmount = 2000000, StartAt = couponStart, EndAt = couponEnd, TotalQuantity = 400, ClaimedQuantity = 120, UsedQuantity = 64, PerUserLimit = 1, IsActive = true, IsPublic = true, IsAutoClaimable = true, IsStackable = false, IsSpinReward = false, SpinWeight = 0, CreatedAt = couponStart },
                new Coupon { Id = 7, Code = "LAPTOP5", Name = "Giam 5% laptop", Description = "Giam 5% toi da 500.000d cho laptop tu 5.000.000d", Type = "Product", DiscountType = "Percent", DiscountValue = 5, MaxDiscountAmount = 500000, MinOrderAmount = 5000000, StartAt = couponStart, EndAt = couponEnd, TotalQuantity = 350, ClaimedQuantity = 105, UsedQuantity = 48, PerUserLimit = 1, IsActive = true, IsPublic = true, IsAutoClaimable = true, IsStackable = false, IsSpinReward = true, SpinWeight = 5, CreatedAt = couponStart },
                new Coupon { Id = 8, Code = "TABLET8", Name = "Giam 8% tablet", Description = "Giam 8% toi da 250.000d cho tablet tu 1.500.000d", Type = "Product", DiscountType = "Percent", DiscountValue = 8, MaxDiscountAmount = 250000, MinOrderAmount = 1500000, StartAt = couponStart, EndAt = couponEnd, TotalQuantity = 300, ClaimedQuantity = 80, UsedQuantity = 31, PerUserLimit = 1, IsActive = true, IsPublic = true, IsAutoClaimable = true, IsStackable = false, IsSpinReward = false, SpinWeight = 0, CreatedAt = couponStart },
                new Coupon { Id = 9, Code = "AUDIO15", Name = "Giam 15% audio", Description = "Giam 15% toi da 120.000d cho loa va tai nghe tu 500.000d", Type = "Product", DiscountType = "Percent", DiscountValue = 15, MaxDiscountAmount = 120000, MinOrderAmount = 500000, StartAt = couponStart, EndAt = couponEnd, TotalQuantity = 450, ClaimedQuantity = 160, UsedQuantity = 72, PerUserLimit = 1, IsActive = true, IsPublic = true, IsAutoClaimable = true, IsStackable = false, IsSpinReward = false, SpinWeight = 0, CreatedAt = couponStart },
                new Coupon { Id = 10, Code = "APPLE7", Name = "Giam 7% hang Apple", Description = "Giam 7% toi da 400.000d cho san pham Apple tu 2.000.000d", Type = "Product", DiscountType = "Percent", DiscountValue = 7, MaxDiscountAmount = 400000, MinOrderAmount = 2000000, StartAt = couponStart, EndAt = couponEnd, TotalQuantity = 300, ClaimedQuantity = 95, UsedQuantity = 42, PerUserLimit = 1, IsActive = true, IsPublic = true, IsAutoClaimable = true, IsStackable = false, IsSpinReward = true, SpinWeight = 10, CreatedAt = couponStart },
                new Coupon { Id = 11, Code = "FLASH150K", Name = "Flash sale giam 150K", Description = "Giam 150.000d cho don tu 5.000.000d den het 31/05/2026", Type = "Product", DiscountType = "Amount", DiscountValue = 150000, MinOrderAmount = 5000000, StartAt = couponStart, EndAt = flashCouponEnd, TotalQuantity = 120, ClaimedQuantity = 70, UsedQuantity = 22, PerUserLimit = 1, IsActive = true, IsPublic = true, IsAutoClaimable = true, IsStackable = false, IsSpinReward = false, SpinWeight = 0, CreatedAt = couponStart },
                new Coupon { Id = 12, Code = "EXPIRED30", Name = "Voucher het han 30%", Description = "Du lieu mau cho voucher da het han", Type = "Product", DiscountType = "Percent", DiscountValue = 30, MaxDiscountAmount = 200000, MinOrderAmount = 1000000, StartAt = expiredCouponStart, EndAt = expiredCouponEnd, TotalQuantity = 100, ClaimedQuantity = 100, UsedQuantity = 76, PerUserLimit = 1, IsActive = false, IsPublic = true, IsAutoClaimable = false, IsStackable = false, IsSpinReward = false, SpinWeight = 0, CreatedAt = expiredCouponStart }
            );
            modelBuilder.Entity<CouponScope>().HasData(
                new CouponScope { Id = 1, CouponId = 1, ScopeType = "All", CreatedAt = couponStart },
                new CouponScope { Id = 2, CouponId = 2, ScopeType = "All", CreatedAt = couponStart },
                new CouponScope { Id = 3, CouponId = 3, ScopeType = "All", CreatedAt = couponStart },
                new CouponScope { Id = 4, CouponId = 4, ScopeType = "All", CreatedAt = couponStart },
                new CouponScope { Id = 5, CouponId = 5, ScopeType = "All", CreatedAt = couponStart },
                new CouponScope { Id = 6, CouponId = 6, ScopeType = "Category", CategoryId = 1, CreatedAt = couponStart },
                new CouponScope { Id = 7, CouponId = 7, ScopeType = "Category", CategoryId = 2, CreatedAt = couponStart },
                new CouponScope { Id = 8, CouponId = 8, ScopeType = "Category", CategoryId = 4, CreatedAt = couponStart },
                new CouponScope { Id = 9, CouponId = 9, ScopeType = "Category", CategoryId = 8, CreatedAt = couponStart },
                new CouponScope { Id = 10, CouponId = 10, ScopeType = "Brand", Brand = "Apple", CreatedAt = couponStart },
                new CouponScope { Id = 11, CouponId = 11, ScopeType = "All", CreatedAt = couponStart },
                new CouponScope { Id = 12, CouponId = 12, ScopeType = "All", CreatedAt = expiredCouponStart }
            );

            // Seed Products
            var productSeedTime = new DateTime(2026, 5, 18, 0, 0, 0, DateTimeKind.Utc);
            modelBuilder.Entity<Product>().HasData(
                new Product { Id = 1, Name = "iPhone 15 Pro", Price = 28990000, OriginalPrice = 32990000, Stock = 12, CategoryId = 1, Description = "Flagship Apple smartphone", ImageUrl = "/electro/img/product-1.png", Brand = "Apple", IsFeatured = true, IsNewArrival = true, IsDiscounted = true, RequiresSerialTracking = true, CreatedAt = productSeedTime },
                new Product { Id = 2, Name = "Samsung Galaxy S24", Price = 21990000, OriginalPrice = 24990000, Stock = 15, CategoryId = 1, Description = "Android flagship phone", ImageUrl = "/electro/img/product-2.png", Brand = "Samsung", IsFeatured = true, IsBestSeller = true, IsNewArrival = true, IsDiscounted = true, RequiresSerialTracking = true, CreatedAt = productSeedTime },
                new Product { Id = 3, Name = "MacBook Air M3", Price = 31990000, OriginalPrice = 35990000, Stock = 10, CategoryId = 2, Description = "Lightweight Apple laptop", ImageUrl = "/electro/img/product-3.png", Brand = "Apple", IsFeatured = true, IsBestSeller = true, IsDiscounted = true, RequiresSerialTracking = true, CreatedAt = productSeedTime },
                new Product { Id = 4, Name = "Dell XPS 15", Price = 35990000, OriginalPrice = 39990000, Stock = 8, CategoryId = 2, Description = "High-end productivity laptop", ImageUrl = "/electro/img/product-4.png", Brand = "Dell", IsFeatured = true, IsDiscounted = true, RequiresSerialTracking = true, CreatedAt = productSeedTime },
                new Product { Id = 5, Name = "AirPods Pro", Price = 5990000, OriginalPrice = 6990000, Stock = 25, CategoryId = 7, Description = "Wireless earbuds", ImageUrl = "/electro/img/product-5.png", Brand = "Apple", IsBestSeller = true, IsDiscounted = true, RequiresSerialTracking = true, CreatedAt = productSeedTime }
            );

            var seedTime = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            modelBuilder.Entity<SpecDefinition>().HasData(
                new SpecDefinition { Id = 1, CategoryId = 1, Name = "Kich thuoc man hinh", Code = "screenSize", DataType = "select", InputType = "select", SortOrder = 1, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 2, CategoryId = 1, Name = "Cong nghe man hinh", Code = "screenTechnology", DataType = "select", InputType = "select", SortOrder = 2, IsComparable = true, IsFilterable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 3, CategoryId = 1, Name = "Camera sau", Code = "rearCamera", DataType = "select", InputType = "select", SortOrder = 3, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 4, CategoryId = 1, Name = "Camera truoc", Code = "frontCamera", DataType = "select", InputType = "select", SortOrder = 4, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 5, CategoryId = 1, Name = "Chipset", Code = "chipset", DataType = "select", InputType = "select", SortOrder = 5, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 6, CategoryId = 1, Name = "Cong nghe NFC", Code = "nfc", DataType = "boolean", InputType = "boolean", SortOrder = 6, IsComparable = true, IsFilterable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 7, CategoryId = 1, Name = "Dung luong RAM", Code = "ram", DataType = "select", InputType = "select", SortOrder = 7, IsComparable = true, IsFilterable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 8, CategoryId = 1, Name = "Bo nho trong", Code = "internalStorage", DataType = "select", InputType = "select", SortOrder = 8, IsComparable = true, IsFilterable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 9, CategoryId = 1, Name = "Pin", Code = "battery", DataType = "select", InputType = "select", SortOrder = 9, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 10, CategoryId = 1, Name = "The SIM", Code = "sim", DataType = "select", InputType = "select", SortOrder = 10, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 11, CategoryId = 1, Name = "He dieu hanh", Code = "os", DataType = "select", InputType = "select", SortOrder = 11, IsComparable = true, IsFilterable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 12, CategoryId = 1, Name = "Do phan giai man hinh", Code = "screenResolution", DataType = "select", InputType = "select", SortOrder = 12, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 13, CategoryId = 1, Name = "Tinh nang man hinh", Code = "screenFeatures", DataType = "multiSelect", InputType = "multiSelect", SortOrder = 13, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 14, CategoryId = 1, Name = "Loai CPU", Code = "cpuType", DataType = "select", InputType = "select", SortOrder = 14, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 15, CategoryId = 2, Name = "Loai card do hoa", Code = "graphicsType", DataType = "select", InputType = "select", SortOrder = 1, IsComparable = true, IsFilterable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 16, CategoryId = 2, Name = "Dung luong RAM", Code = "ram", DataType = "select", InputType = "select", SortOrder = 2, IsComparable = true, IsFilterable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 17, CategoryId = 2, Name = "Loai RAM", Code = "ramType", DataType = "select", InputType = "select", SortOrder = 3, IsComparable = true, IsFilterable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 18, CategoryId = 2, Name = "So khe RAM", Code = "ramSlots", DataType = "select", InputType = "select", SortOrder = 4, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 19, CategoryId = 2, Name = "O cung", Code = "hardDrive", DataType = "select", InputType = "select", SortOrder = 5, IsComparable = true, IsFilterable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 20, CategoryId = 2, Name = "Kich thuoc man hinh", Code = "screenSize", DataType = "select", InputType = "select", SortOrder = 6, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 21, CategoryId = 2, Name = "Cong nghe man hinh", Code = "screenTechnology", DataType = "select", InputType = "select", SortOrder = 7, IsComparable = true, IsFilterable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 22, CategoryId = 2, Name = "Pin", Code = "battery", DataType = "select", InputType = "select", SortOrder = 8, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 23, CategoryId = 2, Name = "He dieu hanh", Code = "os", DataType = "select", InputType = "select", SortOrder = 9, IsComparable = true, IsFilterable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 24, CategoryId = 2, Name = "Do phan giai man hinh", Code = "screenResolution", DataType = "select", InputType = "select", SortOrder = 10, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 25, CategoryId = 2, Name = "Loai CPU", Code = "cpuType", DataType = "select", InputType = "select", SortOrder = 11, IsComparable = true, IsFilterable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 26, CategoryId = 2, Name = "Cong giao tiep", Code = "ports", DataType = "multiSelect", InputType = "multiSelect", SortOrder = 12, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 27, CategoryId = 4, Name = "Kich thuoc man hinh", Code = "screenSize", DataType = "select", InputType = "select", SortOrder = 1, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 28, CategoryId = 4, Name = "Cong nghe man hinh", Code = "screenTechnology", DataType = "select", InputType = "select", SortOrder = 2, IsComparable = true, IsFilterable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 29, CategoryId = 4, Name = "Camera sau", Code = "rearCamera", DataType = "select", InputType = "select", SortOrder = 3, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 30, CategoryId = 4, Name = "Camera truoc", Code = "frontCamera", DataType = "select", InputType = "select", SortOrder = 4, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 31, CategoryId = 4, Name = "Chipset", Code = "chipset", DataType = "select", InputType = "select", SortOrder = 5, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 32, CategoryId = 4, Name = "Dung luong RAM", Code = "ram", DataType = "select", InputType = "select", SortOrder = 6, IsComparable = true, IsFilterable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 33, CategoryId = 4, Name = "Bo nho trong", Code = "internalStorage", DataType = "select", InputType = "select", SortOrder = 7, IsComparable = true, IsFilterable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 34, CategoryId = 4, Name = "Pin", Code = "battery", DataType = "select", InputType = "select", SortOrder = 8, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 35, CategoryId = 4, Name = "He dieu hanh", Code = "os", DataType = "select", InputType = "select", SortOrder = 9, IsComparable = true, IsFilterable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 36, CategoryId = 4, Name = "Do phan giai man hinh", Code = "screenResolution", DataType = "select", InputType = "select", SortOrder = 10, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 37, CategoryId = 4, Name = "Tinh nang man hinh", Code = "screenFeatures", DataType = "multiSelect", InputType = "multiSelect", SortOrder = 11, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 38, CategoryId = 4, Name = "Loai CPU", Code = "cpuType", DataType = "select", InputType = "select", SortOrder = 12, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 39, CategoryId = 4, Name = "Tuong thich", Code = "compatibility", DataType = "multiSelect", InputType = "multiSelect", SortOrder = 13, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 40, CategoryId = 5, Name = "Cong nghe man hinh", Code = "screenTechnology", DataType = "select", InputType = "select", SortOrder = 1, IsComparable = true, IsFilterable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 41, CategoryId = 5, Name = "Kich thuoc man hinh", Code = "screenSize", DataType = "select", InputType = "select", SortOrder = 2, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 42, CategoryId = 5, Name = "Duong kinh mat", Code = "faceDiameter", DataType = "select", InputType = "select", SortOrder = 3, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 43, CategoryId = 5, Name = "Kich thuoc co tay phu hop", Code = "wristSize", DataType = "select", InputType = "select", SortOrder = 4, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 44, CategoryId = 5, Name = "Nghe goi", Code = "calling", DataType = "select", InputType = "select", SortOrder = 5, IsComparable = true, IsFilterable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 45, CategoryId = 5, Name = "Tien ich suc khoe", Code = "healthFeatures", DataType = "multiSelect", InputType = "multiSelect", SortOrder = 6, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 46, CategoryId = 5, Name = "Tuong thich", Code = "compatibility", DataType = "multiSelect", InputType = "multiSelect", SortOrder = 7, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 47, CategoryId = 5, Name = "Thoi luong pin", Code = "batteryLife", DataType = "select", InputType = "select", SortOrder = 8, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 48, CategoryId = 5, Name = "Hang san xuat", Code = "manufacturer", DataType = "select", InputType = "select", SortOrder = 9, IsComparable = true, IsFilterable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 49, CategoryId = 7, Name = "Kich thuoc", Code = "dimensions", DataType = "select", InputType = "select", SortOrder = 1, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 50, CategoryId = 7, Name = "Trong luong", Code = "weight", DataType = "select", InputType = "select", SortOrder = 2, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 51, CategoryId = 7, Name = "Cong nghe am thanh", Code = "audioTechnology", DataType = "multiSelect", InputType = "multiSelect", SortOrder = 3, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 52, CategoryId = 7, Name = "Micro", Code = "microphone", DataType = "boolean", InputType = "boolean", SortOrder = 4, IsComparable = true, IsFilterable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 53, CategoryId = 7, Name = "Thoi luong su dung pin", Code = "batteryLife", DataType = "select", InputType = "select", SortOrder = 5, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 54, CategoryId = 7, Name = "Phuong thuc dieu khien", Code = "controlMethod", DataType = "multiSelect", InputType = "multiSelect", SortOrder = 6, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 55, CategoryId = 7, Name = "Chipset", Code = "chipset", DataType = "select", InputType = "select", SortOrder = 7, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 56, CategoryId = 7, Name = "Tinh nang khac", Code = "otherFeatures", DataType = "multiSelect", InputType = "multiSelect", SortOrder = 8, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 57, CategoryId = 7, Name = "Hang san xuat", Code = "manufacturer", DataType = "select", InputType = "select", SortOrder = 9, IsComparable = true, IsFilterable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 58, CategoryId = 6, Name = "Hang san xuat", Code = "manufacturer", DataType = "select", InputType = "select", SortOrder = 1, IsComparable = true, IsFilterable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 59, CategoryId = 6, Name = "Loai may anh", Code = "cameraType", DataType = "select", InputType = "select", SortOrder = 2, IsComparable = true, IsFilterable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 60, CategoryId = 6, Name = "Loai cam bien", Code = "sensorType", DataType = "select", InputType = "select", SortOrder = 3, IsComparable = true, IsFilterable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 61, CategoryId = 6, Name = "Khau do", Code = "aperture", DataType = "select", InputType = "select", SortOrder = 4, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 62, CategoryId = 6, Name = "Tieu cu", Code = "focalLength", DataType = "select", InputType = "select", SortOrder = 5, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 63, CategoryId = 6, Name = "Loai ong kinh", Code = "lensType", DataType = "select", InputType = "select", SortOrder = 6, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 64, CategoryId = 6, Name = "Che do lay net", Code = "focusMode", DataType = "multiSelect", InputType = "multiSelect", SortOrder = 7, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 65, CategoryId = 6, Name = "Man trap", Code = "shutter", DataType = "select", InputType = "select", SortOrder = 8, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 66, CategoryId = 6, Name = "Chuan in anh", Code = "printStandard", DataType = "multiSelect", InputType = "multiSelect", SortOrder = 9, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 67, CategoryId = 6, Name = "Kich thuoc anh", Code = "imageSize", DataType = "select", InputType = "select", SortOrder = 10, IsComparable = true, AllowCustomValue = false, IsActive = true, CreatedAt = seedTime }
            );

            var specOptions = new List<SpecOption>();
            var nextSpecOptionId = 1;

            void AddOptions(int specDefinitionId, params string[] values)
            {
                for (var index = 0; index < values.Length; index++)
                {
                    specOptions.Add(new SpecOption
                    {
                        Id = nextSpecOptionId++,
                        SpecDefinitionId = specDefinitionId,
                        Value = values[index],
                        DisplayOrder = index + 1,
                        IsActive = true,
                        CreatedAt = seedTime
                    });
                }
            }

            AddOptions(1, "6.3 inches", "6.59 inches", "6.67 inches", "6.9 inches");
            AddOptions(2, "AMOLED", "Dynamic AMOLED 2X", "Super Retina XDR");
            AddOptions(3, "48MP + 48MP + 48MP", "50MP + 50MP + 50MP", "200MP + 50MP + 50MP + 10MP", "200MP + 8MP + 2MP");
            AddOptions(4, "12MP", "32MP", "Camera 18MP Center Stage", "Camera truoc - f/2.2");
            AddOptions(5, "Chip A19 Pro", "Snapdragon 8 Elite Gen 5 danh cho Galaxy (3nm)", "Snapdragon 7s Gen 3", "MediaTek Dimensity 9500s");
            AddOptions(6, "Khong", "Co");
            AddOptions(7, "8 GB", "12 GB");
            AddOptions(8, "256 GB");
            AddOptions(9, "5000 mAh", "5110 mAh", "7025 mAh");
            AddOptions(10, "Sim kep (nano-Sim va e-Sim) - Ho tro 2 e-Sim", "2 Nano-SIM + eSIM", "2 Nano-SIM", "Dual nano-SIM hoac 1 nano-SIM + 1 eSIM");
            AddOptions(11, "iOS 26", "Android 14", "ColorOS 16.0");
            AddOptions(12, "2622 x 1206 pixels", "2712 x 1220 pixels", "3120 x 1440 pixels (Quad HD+)", "1256 x 2760 pixels");
            AddOptions(13, "Man hinh Luon Bat", "ProMotion 120Hz", "HDR", "True Tone", "P3", "Tan so quet 1-120Hz", "Do sang toi da 2600 nits", "Tan so quet len den 120Hz", "Do sang 3000 nits", "Do sau mau 12-bit", "Ty le tuong phan 5,000,000:1", "Tan so lay mau cam ung 240Hz", "1.07 ty mau (10 bits)", "100% DCI-P3", "460 PPI", "Do sang toi da 1800 nits (HBM)", "Kinh bao ve Corning Gorilla Glass 7i");
            AddOptions(14, "CPU 6 loi voi 2 loi hieu nang va 4 loi tiet kiem dien", "8 nhan, xung nhip 2.5GHz", "8 nhan");
            AddOptions(15, "GPU 5 loi va Neural Engine 16 loi", "Intel UHD Graphics", "Intel Graphics", "NVIDIA GeForce RTX 3050 6GB GDDR6");
            AddOptions(16, "8GB", "16GB");
            AddOptions(17, "DDR4", "DDR5", "DDR4 3200 MT/s", "SODIMM DDR5-4800", "Unified Memory");
            AddOptions(18, "8GB DDR4 on board + 8GB DDR4 SO-DIMM", "1 khe Onboard + 1 khe trong nang cap toi da 32GB", "2 khe (1 x 16GB)", "2 khe (May nguyen ban 16GB)");
            AddOptions(19, "256GB", "512GB M.2 NVMe PCIe 4.0 SSD", "512GB M.2 PCIe NVMe (nang cap toi da 1TB)", "512GB SSD M.2 2242 PCIe 4.0x4 NVMe", "512GB PCIe NVMe SSD (Nang cap toi da 4TB)");
            AddOptions(20, "13 inches", "14 inches", "15.6 inches");
            AddOptions(21, "Liquid Retina", "Do sang 300nits", "45% NTSC", "TUV Rheinland-certified", "With stylus support", "man hinh chong choi", "100% sRGB", "FreeSync", "Acer ComfyView", "LCD TFT");
            AddOptions(22, "Thoi gian xem video truc tuyen len den 16 gio, pin lithium-ion 36.5 watt-gio", "50WHrs, 3S1P, 3-cell Li-ion", "Li-ion 4-Cell Battery, 54WHr", "57.5Wh, 135W Slim Tip (3-pin)", "Pin Li-ion 3 cell 54.8Wh, bo doi nguon AC 150W");
            AddOptions(23, "macOS", "Windows 11 Home", "Windows 11 Home, Single Language English + Office Home & Student 2024", "Windows 11 Home Single Language", "Windows 11 Home Single Language, English");
            AddOptions(24, "2408 x 1506 pixels", "1920 x 1200 pixels (WUXGA)", "1920 x 1200 pixels (FullHD+)", "1920 x 1080 pixels (FullHD)");
            AddOptions(25, "Chip Apple A18 Pro", "Intel Core i5-13420H", "Intel Core 5 120U", "AMD Ryzen 7 7735HS", "Intel Core i5-12450H");
            AddOptions(26, "USB 3 (USB-C) 10Gb/s", "USB 2 (USB-C) 480Mb/s", "Jack 3.5 mm", "USB 3.2", "HDMI 1.4", "Khe doc the SD", "Mini DisplayPort 1.4");
            AddOptions(27, "11 inches", "11.2 inches", "12.1 inches");
            AddOptions(28, "IPS", "IPS LCD", "Liquid Retina");
            AddOptions(29, "8MP", "13 MP, f/2.2", "Camera goc rong 12MP", "13MP");
            AddOptions(30, "8 MP, f/2.28", "12MP, f/2.4", "13MP");
            AddOptions(31, "MediaTek Dimensity 6400", "Chip A16", "Snapdragon 7+ Gen 3");
            AddOptions(32, "8 GB");
            AddOptions(33, "128 GB", "512 GB");
            AddOptions(34, "10200 mAh", "Tich hop pin sac Li-Po 28,93 watt-gio", "8850 mAh");
            AddOptions(35, "Android 15 tro len", "iPadOS 18", "Xiaomi HyperOS 2");
            AddOptions(36, "2560 x 1600 pixels (2.5K)", "2360 x 1640 pixel", "2136 x 3200 pixels");
            AddOptions(37, "Tan so quet 90Hz", "600 nits dien hinh", "800 nits HBM", "Chong choi giong nhu giay", "96% DCI-P3", "Cam ung da diem 10 diem", "Multi-Touch", "LED nen", "IPS", "True Tone", "500 nit", "lop phu khang dau chong in dau van tay", "144Hz", "Ti le 3:2", "800 nit", "68 ty mau", "DCI-P3", "Pro HDR", "Cong nghe cham khi uot", "TUV Rheinland", "Che do duoi anh nang", "Che do doc", "Mau sac thich ung");
            AddOptions(38, "8C, 2x A76 @2.5GHz + 6x A55 @2.0GHz", "CPU 5 loi", "8 nhan len den 2.8GHz");
            AddOptions(39, "Apple Pencil (USB-C)", "Android 8.0 tro len", "iOS 13.0 tro len", "Android 6.0 tro len", "iOS 11 tro len", "Android 12.0 tro len (voi bo nho toi thieu 1.5GB)");
            AddOptions(40, "AMOLED", "LCD", "Super AMOLED");
            AddOptions(41, "1.47 inch", "1.82 inch", "2.0 inch");
            AddOptions(42, "43 mm", "47 mm", "49.1 mm");
            AddOptions(43, "Tim: 120-190 mm", "Xam, Trang va Den: 130-210 mm", "Hang khong cong bo", "Khong cong bo");
            AddOptions(44, "Khong", "Nghe goi qua Bluetooth", "Nghe goi qua eSim");
            AddOptions(45, "Do nhip tim", "Do SpO2", "Theo doi giac ngu", "Do muc cang thang", "Do ECG", "Theo doi chu ky kinh nguyet", "Theo doi nhiem trung giac ngu", "Bai tap ho hap", "Canh bao nhip tim bat thuong");
            AddOptions(46, "Android 8.0 tro len", "iOS 13.0 tro len", "Android 6.0 tro len", "iOS 11 tro len", "Android 12.0 tro len (voi bo nho toi thieu 1.5GB)");
            AddOptions(47, "Toi da 10 ngay", "Thuong xuyen 7 ngay", "Bat AOD 4 ngay", "18 ngay su dung lien tuc (khong co AOD)", "Khoang 80 gio (khi tat Always-On-Display)", "Khoang 100 gio (o che do tiet kiem pin)");
            AddOptions(48, "Huawei", "Xiaomi", "Samsung Chinh hang");
            AddOptions(49, "Tai nghe 30.9 x 21.8 x 24.0 mm; Hop sac 46.2 x 50.1 x 21.2 mm", "Tai nghe 33.66 x 17.18 x 18.66 mm; Hop sac 46.9 x 65.9 x 24.5 mm", "Tai nghe 33.7 x 20.9 x 23.2 mm; Hop sac 51.3 x 51 x 26.8 mm", "Tai nghe 32 x 17.8 x 18.5 mm; Hop sac 49 x 48.6 x 23 mm");
            AddOptions(50, "Tai nghe 5.3 g; Hop sac 50.8 g", "Tai nghe 5.6 g; Hop sac 41.3 g", "4g");
            AddOptions(51, "Adaptive EQ", "Spatial Audio ca nhan hoa", "True Wireless Stereo (TWS)", "Chong on chu dong", "Chong on moi truong ENC");
            AddOptions(52, "Khong", "Co");
            AddOptions(53, "Tai nghe 5 gio; dam thoai 4.5 gio", "Tai nghe 8 gio; hop sac 36 gio", "Tai nghe 6 gio; hop sac 25 gio", "Tai nghe 6 gio; hop sac 30 gio");
            AddOptions(54, "Cam bien luc", "Cam ung cham");
            AddOptions(55, "Chip tai nghe H2");
            AddOptions(56, "Khang nuoc va bui IP54", "Chong on moi truong ENC", "Chong nuoc IPX4");
            AddOptions(57, "Apple Chinh hang", "Huawei", "Baseus", "Xiaomi");
            AddOptions(58, "Sony", "Fujifilm");
            AddOptions(59, "Full-frame", "Mirrorless (khong guong lat)");
            AddOptions(60, "Full-frame 35 mm (35,9 x 23,9 mm), cam bien Exmor R CMOS", "APS-C CMOS (23.5 x 15.6 mm)");
            AddOptions(61, "Khong cong bo");
            AddOptions(62, "Khong cong bo");
            AddOptions(63, "Ngam E-mount", "Ngam FUJIFILM X");
            AddOptions(64, "AF-A", "AF-S", "AF-C", "DMF", "MF");
            AddOptions(65, "Co / Dien tu, 1/8000s - 30s, Bulb", "Co hoc: 1/4000 - 900s, bulb toi da 60 phut", "Dien tu: 1/32000 - 900s, bulb toi da 1 giay", "EFCS: 1/4000 - 900s, bulb toi da 60 phut");
            AddOptions(66, "Exif Print", "Print Image Matching III");
            AddOptions(67, "L 3:2 6240 x 4160", "L 16:9 6240 x 3512", "L 1:1 4160 x 4160", "L 65:24 6240 x 2304");

            modelBuilder.Entity<SpecOption>().HasData(specOptions.ToArray());
        }

        /// <summary>
        /// Seed default admin user and data to SQL Server
        /// Called during application startup
        /// </summary>
        public async Task SeedDataAsync()
        {
            await EnsureCoreRolesAsync();
            await CleanupLegacyRolesAsync();
            await EnsureStoreSettingsAsync();
            await EnsureElectroCatalogAsync();
            await EnsureProductVariantsAsync();
            await CleanupCategoryDuplicatesAsync();
            await DisableLegacyAdminAccountAsync();
            await EnsureDemoLoginUsersAsync();

            // Legacy block retained only for compatibility; EnsureDemoLoginUsersAsync
            // above now creates/resets both demo admin and customer accounts.
            var adminExists = true;
            if (!adminExists)
            {
                // Hash password using PBKDF2
                byte[] salt;
                string hashedPassword = TokenHelper.HashPassword("admin123", out salt);

                var adminUser = new User
                {
                    Id = Guid.NewGuid(),
                    UserName = "admin",
                    Password = hashedPassword,
                    Salt = salt,
                    Contact = string.Empty,
                    Name = string.Empty,
                    Email = string.Empty,
                    Phone = "0123456789",
                    Position = "Admin",
                    Image = string.Empty,
                    IsActive = true,
                    UserType = 1,
                    Created = DateTime.Now
                };

                Users.Add(adminUser);
                await SaveChangesAsync();
                Console.WriteLine("✓ Admin user seeded successfully");
            }
        }

        private async Task EnsureDemoLoginUsersAsync()
        {
            await EnsureLoginUserAsync("admin", "admin123", 1, "Administrator", "admin@basecore.local", "0123456789", "Admin");
            await EnsureLoginUserAsync("user", "user123", 0, "Demo User", "user@basecore.local", "0987654321", "Customer");
        }

        private async Task EnsureLoginUserAsync(string username, string password, int userType, string name, string email, string phone, string position)
        {
            var user = await Users.FirstOrDefaultAsync(u => u.UserName == username);
            byte[] salt;
            var hashedPassword = TokenHelper.HashPassword(password, out salt);

            if (user == null)
            {
                user = new User
                {
                    Id = Guid.NewGuid(),
                    UserName = username,
                    Created = DateTime.Now
                };
                Users.Add(user);
            }

            user.Password = hashedPassword;
            user.Salt = salt;
            user.Name = name;
            user.Email = email;
            user.Phone = phone;
            user.Contact = string.Empty;
            user.Position = position;
            user.Image = string.Empty;
            user.IsActive = true;
            user.UserType = userType;

            await SaveChangesAsync();
            Console.WriteLine($"Demo login user '{username}' is ready");
        }

        private async Task EnsureProductVariantsAsync()
        {
            var products = await Products
                .Where(p => p.IsActive)
                .Include(p => p.Variants)
                .ToListAsync();

            var changed = false;

            foreach (var product in products)
            {
                var seeds = BuildVariantSeeds(product).ToList();
                if (seeds.Count == 0) continue;

                foreach (var seed in seeds)
                {
                    var sku = BuildVariantSku(product, seed);
                    var variant = product.Variants.FirstOrDefault(v => v.Sku == sku);

                    if (variant == null)
                    {
                        variant = new ProductVariant
                        {
                            ProductId = product.Id,
                            Sku = sku,
                            CreatedAt = DateTime.UtcNow
                        };
                        ProductVariants.Add(variant);
                        product.Variants.Add(variant);
                        changed = true;
                    }

                    var price = product.Price + seed.PriceDelta;
                    decimal? originalPrice = product.OriginalPrice.HasValue
                        ? product.OriginalPrice.Value + seed.PriceDelta
                        : null;
                    var stock = Math.Max(1, seed.Stock);
                    var imageUrl = string.IsNullOrWhiteSpace(seed.ImageUrl) ? product.ImageUrl : seed.ImageUrl;

                    if (variant.VariantName != seed.VariantName ||
                        variant.ColorName != seed.ColorName ||
                        variant.ColorCode != seed.ColorCode ||
                        variant.Storage != seed.Storage ||
                        variant.Ram != seed.Ram ||
                        variant.Price != price ||
                        variant.OriginalPrice != originalPrice ||
                        variant.Stock != stock ||
                        variant.ImageUrl != imageUrl ||
                        !variant.IsActive)
                    {
                        variant.VariantName = seed.VariantName;
                        variant.ColorName = seed.ColorName;
                        variant.ColorCode = seed.ColorCode;
                        variant.Storage = seed.Storage;
                        variant.Ram = seed.Ram;
                        variant.Price = price;
                        variant.OriginalPrice = originalPrice;
                        variant.Stock = stock;
                        variant.ImageUrl = imageUrl;
                        variant.IsActive = true;
                        variant.UpdatedAt = DateTime.UtcNow;
                        changed = true;
                    }
                }
            }

            if (changed)
            {
                await SaveChangesAsync();
                Console.WriteLine("Product variants synchronized successfully");
            }
        }

        private static IEnumerable<VariantSeed> BuildVariantSeeds(Product product)
        {
            var name = (product.Name ?? string.Empty).ToLowerInvariant();
            var stock = Math.Max(1, product.Stock);

            if (name.Contains("iphone 15 pro"))
            {
                yield return new("128GB", "Natural Titanium", "#C8BFB1", "128GB", null, 0m, SplitStock(stock, 0));
                yield return new("256GB", "Blue Titanium", "#4F6578", "256GB", null, 3000000m, SplitStock(stock, 1));
                yield return new("512GB", "Black Titanium", "#3C3C3D", "512GB", null, 7000000m, SplitStock(stock, 2));
                yield break;
            }

            if (name.Contains("samsung galaxy s24"))
            {
                yield return new("256GB", "Onyx Black", "#1F1F1F", "256GB", "8GB", 0m, SplitStock(stock, 0));
                yield return new("256GB", "Marble Gray", "#C8C8C8", "256GB", "8GB", 0m, SplitStock(stock, 1));
                yield return new("512GB", "Cobalt Violet", "#6F5C91", "512GB", "12GB", 3500000m, SplitStock(stock, 2));
                yield break;
            }

            if (name.Contains("macbook air m3"))
            {
                yield return new("8GB/256GB", "Midnight", "#1E2A36", "256GB", "8GB", 0m, SplitStock(stock, 0));
                yield return new("8GB/512GB", "Starlight", "#E3D2BA", "512GB", "8GB", 4000000m, SplitStock(stock, 1));
                yield return new("16GB/512GB", "Space Gray", "#7D7E80", "512GB", "16GB", 7000000m, SplitStock(stock, 2));
                yield break;
            }

            if (name.Contains("dell xps 15"))
            {
                yield return new("16GB/512GB", "Platinum Silver", "#D6D6D6", "512GB", "16GB", 0m, SplitStock(stock, 0));
                yield return new("32GB/1TB", "Platinum Silver", "#D6D6D6", "1TB", "32GB", 9000000m, SplitStock(stock, 1));
                yield break;
            }

            if (name.Contains("ipad pro"))
            {
                yield return new("256GB WiFi", "Space Gray", "#6E6E73", "256GB", null, 0m, SplitStock(stock, 0));
                yield return new("512GB WiFi", "Silver", "#D8D8D8", "512GB", null, 4000000m, SplitStock(stock, 1));
                yield return new("512GB 5G", "Space Gray", "#6E6E73", "512GB", null, 7500000m, SplitStock(stock, 2));
                yield break;
            }

            if (name.Contains("ipad gen 10"))
            {
                yield return new("64GB WiFi", "Blue", "#87A9D6", "64GB", null, 0m, SplitStock(stock, 0));
                yield return new("64GB WiFi", "Pink", "#F6B8C9", "64GB", null, 0m, SplitStock(stock, 1));
                yield return new("256GB WiFi", "Silver", "#D8D8D8", "256GB", null, 3500000m, SplitStock(stock, 2));
                yield break;
            }

            if (name.Contains("xiaomi pad 6"))
            {
                yield return new("8GB/128GB", "Gravity Gray", "#4B4B4B", "128GB", "8GB", 0m, SplitStock(stock, 0));
                yield return new("8GB/256GB", "Mist Blue", "#A7BCD6", "256GB", "8GB", 1800000m, SplitStock(stock, 1));
                yield break;
            }

            if (name.Contains("apple watch series 10"))
            {
                yield return new("42mm GPS", "Jet Black", "#111111", null, null, 0m, SplitStock(stock, 0));
                yield return new("46mm GPS", "Rose Gold", "#D7B6A3", null, null, 1600000m, SplitStock(stock, 1));
                yield return new("46mm GPS + Cellular", "Silver", "#D8D8D8", null, null, 3500000m, SplitStock(stock, 2));
                yield break;
            }

            if (name.Contains("samsung galaxy watch7"))
            {
                yield return new("40mm Bluetooth", "Cream", "#E8DDC8", null, null, 0m, SplitStock(stock, 0));
                yield return new("44mm Bluetooth", "Green", "#63766A", null, null, 1200000m, SplitStock(stock, 1));
                yield break;
            }

            if (name.Contains("airpods pro 2"))
            {
                yield return new("USB-C", "White", "#FFFFFF", null, null, 0m, stock);
                yield break;
            }

            if (name.Contains("jbl flip 6"))
            {
                yield return new("Black", "Black", "#111111", null, null, 0m, SplitStock(stock, 0));
                yield return new("Blue", "Blue", "#1F5DA8", null, null, 0m, SplitStock(stock, 1));
                yield return new("Red", "Red", "#C62828", null, null, 0m, SplitStock(stock, 2));
                yield break;
            }

            if (name.Contains("canon eos r50"))
            {
                yield return new("Body only", "Black", "#111111", null, null, 0m, SplitStock(stock, 0));
                yield return new("Kit 18-45mm", "Black", "#111111", null, null, 2500000m, SplitStock(stock, 1));
                yield break;
            }

            if (name.Contains("gopro hero"))
            {
                yield return new("Black", "Black", "#111111", null, null, 0m, stock);
                yield break;
            }

            yield return new("Mặc định", null, null, null, null, 0m, stock);
        }

        private static int SplitStock(int stock, int index)
        {
            var baseStock = Math.Max(1, stock / 3);
            var remainder = Math.Max(0, stock - baseStock * 3);
            return baseStock + (index < remainder ? 1 : 0);
        }

        private static string BuildVariantSku(Product product, VariantSeed seed)
        {
            var source = $"{product.Sku ?? product.Name}-{seed.VariantName}-{seed.ColorName}";
            var chars = source
                .ToUpperInvariant()
                .Select(ch => char.IsLetterOrDigit(ch) ? ch : '-')
                .ToArray();
            var sku = new string(chars);
            while (sku.Contains("--")) sku = sku.Replace("--", "-");
            return sku.Trim('-');
        }

        private sealed record VariantSeed(
            string? VariantName,
            string? ColorName,
            string? ColorCode,
            string? Storage,
            string? Ram,
            decimal PriceDelta,
            int Stock,
            string? ImageUrl = null);

        private async Task DisableLegacyAdminAccountAsync()
        {
            var legacyAdmins = await Users
                .Where(u => u.IsActive && (u.UserName == "admin@cnthht.vn" || u.Email == "admin@cnthht.vn"))
                .ToListAsync();

            if (legacyAdmins.Count == 0) return;

            foreach (var user in legacyAdmins)
            {
                user.IsActive = false;
                user.UserType = 0;
            }

            await SaveChangesAsync();
            Console.WriteLine("Legacy admin account admin@cnthht.vn disabled");
        }

        private async Task EnsureCoreRolesAsync()
        {
            var roles = new[]
            {
                new { Id = "000000000000000000000001", Name = "Admin", Description = "Administrator", RoleType = 1 },
                new { Id = "000000000000000000000002", Name = "User", Description = "Regular user", RoleType = 0 },
                new { Id = "000000000000000000000003", Name = "Warehouse", Description = "Warehouse staff", RoleType = 2 },
                new { Id = "000000000000000000000004", Name = "Technical", Description = "Technical support staff", RoleType = 3 }
            };

            foreach (var seed in roles)
            {
                var role = await Roles.FindAsync(seed.Id);
                if (role == null)
                {
                    role = Roles.FirstOrDefault(x => x.Name == seed.Name);
                }

                if (role == null)
                {
                    await Roles.AddAsync(new Role
                    {
                        Id = seed.Id,
                        Guid = Guid.NewGuid(),
                        Name = seed.Name,
                        Description = seed.Description,
                        CreatedUser = "system",
                        CreatedDateTime = DateTime.UtcNow,
                        CreatedBy = "system",
                        Created = DateTime.UtcNow,
                        ModifiedBy = "system",
                        Modified = DateTime.UtcNow,
                        IsActive = true,
                        RoleType = seed.RoleType
                    });
                }
                else
                {
                    role.Name = seed.Name;
                    role.Description = seed.Description;
                    role.RoleType = seed.RoleType;
                    role.IsActive = true;
                    role.IsDeleted = false;
                }
            }

            await SaveChangesAsync();
        }

        private async Task CleanupLegacyRolesAsync()
        {
            var warehouseRoleType = 2;
            var technicalRoleType = 3;
            var legacyWarehouseRoleTypes = new[] { 7 };
            var legacyTechnicalRoleTypes = new[] { 4, 5, 6 };

            var usersToWarehouse = await Users
                .Where(u => legacyWarehouseRoleTypes.Contains(u.UserType))
                .ToListAsync();

            foreach (var user in usersToWarehouse)
            {
                user.UserType = warehouseRoleType;
            }

            var usersToTechnical = await Users
                .Where(u => legacyTechnicalRoleTypes.Contains(u.UserType))
                .ToListAsync();

            foreach (var user in usersToTechnical)
            {
                user.UserType = technicalRoleType;
            }

            var activeCoreRoleIds = new[]
            {
                "000000000000000000000001",
                "000000000000000000000002",
                "000000000000000000000003",
                "000000000000000000000004"
            };

            var legacyRoles = await Roles
                .Where(r => !activeCoreRoleIds.Contains(r.Id))
                .ToListAsync();

            foreach (var role in legacyRoles)
            {
                role.IsActive = false;
                role.IsDeleted = true;
            }

            if (usersToWarehouse.Count > 0 || usersToTechnical.Count > 0 || legacyRoles.Count > 0)
            {
                await SaveChangesAsync();
            }
        }

        private async Task EnsureStoreSettingsAsync()
        {
            var setting = await StoreSettings.FindAsync(1);
            if (setting != null)
            {
                return;
            }

            await StoreSettings.AddAsync(new StoreSetting
            {
                Id = 1,
                StoreName = "CNTHHT Store",
                Hotline = "0327 188 459",
                SupportEmail = "support@cnthht.vn",
                Address = string.Empty,
                WarrantyAddress = string.Empty,
                DefaultShippingFee = 0,
                SupportTime = string.Empty,
                LogoUrl = string.Empty,
                FacebookUrl = string.Empty,
                ZaloUrl = string.Empty,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });

            await SaveChangesAsync();
        }

        private async Task EnsureElectroCatalogAsync()
        {
            var categorySeeds = new[]
            {
                new Category { Id = 1, Name = "Điện thoại", Description = "Điện thoại và thiết bị di động" },
                new Category { Id = 2, Name = "Laptop", Description = "Laptop va may tinh xach tay" },
                new Category { Id = 4, Name = "Tablet", Description = "Máy tính bảng" },
                new Category { Id = 5, Name = "Đồng hồ thông minh", Description = "Đồng hồ thông minh" },
                new Category { Id = 6, Name = "Máy ảnh", Description = "Máy ảnh và thiết bị quay video" },
                new Category { Id = 7, Name = "Tai nghe", Description = "Tai nghe và thiết bị âm thanh" },
                new Category { Id = 8, Name = "Audio", Description = "Loa va tai nghe" }
            };

            foreach (var seed in categorySeeds)
            {
                var category = await Categories.FindAsync(seed.Id);
                if (category == null)
                {
                    category = await Categories.FirstOrDefaultAsync(c => c.Name == seed.Name);
                    if (category == null)
                    {
                        await Categories.AddAsync(new Category
                        {
                            Name = seed.Name,
                            Description = seed.Description
                        });
                        continue;
                    }
                }

                category.Name = seed.Name;
                category.Description = seed.Description;
            }

            await SaveChangesAsync();

            var categoryByName = Categories.ToDictionary(c => c.Name, c => c.Id);
            int CategoryIdByName(string name, int defaultId)
            {
                return categoryByName.TryGetValue(name, out var categoryId) ? categoryId : defaultId;
            }

            int ResolveCategoryId(string categoryName, string productName)
            {
                if (categoryByName.TryGetValue(categoryName, out var categoryId))
                {
                    return categoryId;
                }

                if (categoryName.Contains("Audio", StringComparison.OrdinalIgnoreCase)) return CategoryIdByName("Audio", 8);
                if (categoryName.Contains("Laptop", StringComparison.OrdinalIgnoreCase)) return CategoryIdByName("Laptop", 2);
                if (categoryName.Contains("Tablet", StringComparison.OrdinalIgnoreCase)) return CategoryIdByName("Tablet", 4);

                var name = productName.ToLowerInvariant();
                if (name.Contains("iphone") || name.Contains("galaxy") || name.Contains("xiaomi") || name.Contains("oppo") || name.Contains("vivo") || name.Contains("realme")) return CategoryIdByName("Điện thoại", 1);
                if (name.Contains("watch") || name.Contains("garmin")) return CategoryIdByName("Đồng hồ thông minh", 5);
                if (name.Contains("camera") || name.Contains("canon") || name.Contains("gopro") || name.Contains("sony a7") || name.Contains("dji")) return CategoryIdByName("Máy ảnh", 6);
                if (name.Contains("airpods") || name.Contains("bose") || name.Contains("wh-1000")) return CategoryIdByName("Tai nghe", 7);
                if (name.Contains("jbl") || name.Contains("marshall") || name.Contains("soundbar")) return CategoryIdByName("Audio", 8);

                return CategoryIdByName("Laptop", 2);
            }
            var productSeeds = new[]
            {
                new { Name = "iPhone 15 Pro", Price = 28990000m, OriginalPrice = 32990000m, Stock = 12, Category = "Điện thoại", Description = "Flagship Apple smartphone", ImageUrl = "/electro/img/product-1.png", Brand = "Apple", Featured = true, BestSeller = false, NewArrival = true, Discounted = true },
                new { Name = "Samsung Galaxy S24", Price = 21990000m, OriginalPrice = 24990000m, Stock = 15, Category = "Điện thoại", Description = "Android flagship phone", ImageUrl = "/electro/img/product-2.png", Brand = "Samsung", Featured = true, BestSeller = true, NewArrival = true, Discounted = true },
                new { Name = "MacBook Air M3", Price = 31990000m, OriginalPrice = 35990000m, Stock = 10, Category = "Laptop", Description = "Lightweight Apple laptop", ImageUrl = "/electro/img/product-3.png", Brand = "Apple", Featured = true, BestSeller = true, NewArrival = false, Discounted = true },
                new { Name = "Dell XPS 15", Price = 35990000m, OriginalPrice = 39990000m, Stock = 8, Category = "Laptop", Description = "High-end productivity laptop", ImageUrl = "/electro/img/product-4.png", Brand = "Dell", Featured = true, BestSeller = false, NewArrival = false, Discounted = true },
                new { Name = "ASUS ROG Strix G16", Price = 29990000m, OriginalPrice = 34990000m, Stock = 7, Category = "Laptop", Description = "Gaming laptop with RTX graphics", ImageUrl = "/electro/img/product-11.png", Brand = "ASUS", Featured = true, BestSeller = false, NewArrival = true, Discounted = true },
                new { Name = "iPad Pro 12.9", Price = 25990000m, OriginalPrice = 28990000m, Stock = 14, Category = "Tablet", Description = "Large tablet for professionals", ImageUrl = "/electro/img/product-7.png", Brand = "Apple", Featured = true, BestSeller = false, NewArrival = true, Discounted = true },
                new { Name = "Samsung Galaxy Tab S9", Price = 19990000m, OriginalPrice = 22990000m, Stock = 12, Category = "Tablet", Description = "High-end Android tablet", ImageUrl = "/electro/img/product-13.png", Brand = "Samsung", Featured = true, BestSeller = false, NewArrival = true, Discounted = true },
                new { Name = "Lenovo Tab P12", Price = 8990000m, OriginalPrice = 9990000m, Stock = 16, Category = "Tablet", Description = "Entertainment tablet", ImageUrl = "/electro/img/product-14.png", Brand = "Lenovo", Featured = false, BestSeller = false, NewArrival = true, Discounted = true },
                new { Name = "Apple Watch Series 9", Price = 9990000m, OriginalPrice = 11990000m, Stock = 16, Category = "Đồng hồ thông minh", Description = "Premium smartwatch", ImageUrl = "/electro/img/product-8.png", Brand = "Apple", Featured = false, BestSeller = true, NewArrival = true, Discounted = true },
                new { Name = "Samsung Galaxy Watch 6", Price = 7990000m, OriginalPrice = 8990000m, Stock = 20, Category = "Đồng hồ thông minh", Description = "Android smartwatch", ImageUrl = "/electro/img/product-15.png", Brand = "Samsung", Featured = false, BestSeller = true, NewArrival = false, Discounted = true },
                new { Name = "Garmin Venu 3", Price = 10990000m, OriginalPrice = 12990000m, Stock = 9, Category = "Đồng hồ thông minh", Description = "Fitness smartwatch", ImageUrl = "/electro/img/product-16.png", Brand = "Garmin", Featured = false, BestSeller = false, NewArrival = true, Discounted = true },
                new { Name = "Canon EOS R5", Price = 64990000m, OriginalPrice = 69990000m, Stock = 5, Category = "Máy ảnh", Description = "Professional mirrorless camera", ImageUrl = "/electro/img/product-9.png", Brand = "Canon", Featured = true, BestSeller = false, NewArrival = false, Discounted = true },
                new { Name = "Sony A7IV", Price = 44990000m, OriginalPrice = 49990000m, Stock = 8, Category = "Máy ảnh", Description = "Full-frame mirrorless camera", ImageUrl = "/electro/img/product-17.png", Brand = "Sony", Featured = true, BestSeller = false, NewArrival = false, Discounted = true },
                new { Name = "DJI Osmo Pocket 3", Price = 13990000m, OriginalPrice = 15990000m, Stock = 11, Category = "Máy ảnh", Description = "Compact video camera", ImageUrl = "/electro/img/product-18.png", Brand = "DJI", Featured = false, BestSeller = true, NewArrival = true, Discounted = true },
                new { Name = "AirPods Pro 2", Price = 5990000m, OriginalPrice = 6990000m, Stock = 25, Category = "Tai nghe", Description = "Wireless earbuds", ImageUrl = "/electro/img/product-5.png", Brand = "Apple", Featured = false, BestSeller = true, NewArrival = false, Discounted = true },
                new { Name = "Bose QuietComfort 45", Price = 8990000m, OriginalPrice = 9990000m, Stock = 14, Category = "Tai nghe", Description = "Noise-cancelling headphones", ImageUrl = "/electro/img/product-10.png", Brand = "Bose", Featured = false, BestSeller = true, NewArrival = false, Discounted = true },
                new { Name = "Sony WH-1000XM5", Price = 8490000m, OriginalPrice = 9490000m, Stock = 13, Category = "Tai nghe", Description = "Noise-cancelling headphones", ImageUrl = "/electro/img/product-19.png", Brand = "Sony", Featured = false, BestSeller = true, NewArrival = false, Discounted = true },
                new { Name = "JBL PartyBox 310", Price = 11990000m, OriginalPrice = 13990000m, Stock = 6, Category = "Audio", Description = "Portable party speaker", ImageUrl = "/electro/img/product-12.png", Brand = "JBL", Featured = false, BestSeller = false, NewArrival = true, Discounted = true },
                new { Name = "Marshall Stanmore III", Price = 10990000m, OriginalPrice = 12990000m, Stock = 8, Category = "Audio", Description = "Home bluetooth speaker", ImageUrl = "/electro/img/product-20.png", Brand = "Marshall", Featured = false, BestSeller = true, NewArrival = false, Discounted = true },
                new { Name = "Soundbar Samsung Q600C", Price = 7990000m, OriginalPrice = 8990000m, Stock = 10, Category = "Audio", Description = "TV soundbar", ImageUrl = "/electro/img/product-21.png", Brand = "Samsung", Featured = false, BestSeller = false, NewArrival = true, Discounted = true },
                new { Name = "iPhone 15", Price = 21990000m, OriginalPrice = 24990000m, Stock = 18, Category = "Điện thoại", Description = "Apple smartphone 128GB camera 48MP", ImageUrl = "/electro/img/product-6.png", Brand = "Apple", Featured = false, BestSeller = false, NewArrival = true, Discounted = true },
                new { Name = "iPhone 14 Plus", Price = 18990000m, OriginalPrice = 21990000m, Stock = 11, Category = "Điện thoại", Description = "Large screen Apple smartphone 128GB", ImageUrl = "/electro/img/product-7.png", Brand = "Apple", Featured = false, BestSeller = false, NewArrival = false, Discounted = true },
                new { Name = "Samsung Galaxy S24 Ultra", Price = 28990000m, OriginalPrice = 32990000m, Stock = 9, Category = "Điện thoại", Description = "Samsung flagship 12GB 256GB camera 200MP", ImageUrl = "/electro/img/product-8.png", Brand = "Samsung", Featured = true, BestSeller = false, NewArrival = true, Discounted = true },
                new { Name = "Samsung Galaxy A55 5G", Price = 9990000m, OriginalPrice = 11990000m, Stock = 28, Category = "Điện thoại", Description = "Samsung midrange phone 8GB 256GB 5000mAh", ImageUrl = "/electro/img/product-9.png", Brand = "Samsung", Featured = false, BestSeller = true, NewArrival = false, Discounted = true },
                new { Name = "Xiaomi 14T Pro", Price = 16990000m, OriginalPrice = 18990000m, Stock = 16, Category = "Điện thoại", Description = "Xiaomi gaming phone 12GB 512GB camera Leica", ImageUrl = "/electro/img/product-10.png", Brand = "Xiaomi", Featured = false, BestSeller = false, NewArrival = true, Discounted = true },
                new { Name = "Xiaomi Redmi Note 13 Pro", Price = 7490000m, OriginalPrice = 8990000m, Stock = 32, Category = "Điện thoại", Description = "Affordable Xiaomi phone 8GB 256GB 5000mAh", ImageUrl = "/electro/img/product-11.png", Brand = "Xiaomi", Featured = false, BestSeller = true, NewArrival = false, Discounted = true },
                new { Name = "OPPO Reno12 F", Price = 8990000m, OriginalPrice = 9990000m, Stock = 21, Category = "Điện thoại", Description = "OPPO camera phone 8GB 256GB portrait", ImageUrl = "/electro/img/product-12.png", Brand = "OPPO", Featured = false, BestSeller = false, NewArrival = true, Discounted = false },
                new { Name = "Vivo V30 5G", Price = 11990000m, OriginalPrice = 13990000m, Stock = 14, Category = "Điện thoại", Description = "Vivo phone 12GB 512GB selfie camera", ImageUrl = "/electro/img/product-13.png", Brand = "Vivo", Featured = false, BestSeller = false, NewArrival = true, Discounted = true },
                new { Name = "Realme 12 Pro Plus", Price = 10990000m, OriginalPrice = 12990000m, Stock = 17, Category = "Điện thoại", Description = "Realme phone 12GB 512GB telephoto camera", ImageUrl = "/electro/img/product-14.png", Brand = "Realme", Featured = false, BestSeller = false, NewArrival = false, Discounted = true },
                new { Name = "MacBook Pro 14 M3", Price = 45990000m, OriginalPrice = 49990000m, Stock = 7, Category = "Laptop", Description = "Apple laptop M3 16GB 512GB for creative work", ImageUrl = "/electro/img/product-15.png", Brand = "Apple", Featured = true, BestSeller = false, NewArrival = true, Discounted = true },
                new { Name = "Dell Inspiron 15 3530", Price = 15990000m, OriginalPrice = 17990000m, Stock = 19, Category = "Laptop", Description = "Dell office laptop Intel Core i5 16GB 512GB", ImageUrl = "/electro/img/product-16.png", Brand = "Dell", Featured = false, BestSeller = false, NewArrival = false, Discounted = true },
                new { Name = "Dell G15 Gaming", Price = 27990000m, OriginalPrice = 31990000m, Stock = 8, Category = "Laptop", Description = "Dell gaming laptop RTX 4050 16GB 512GB", ImageUrl = "/electro/img/product-17.png", Brand = "Dell", Featured = false, BestSeller = false, NewArrival = true, Discounted = true },
                new { Name = "ASUS Vivobook 15 OLED", Price = 18990000m, OriginalPrice = 21990000m, Stock = 20, Category = "Laptop", Description = "ASUS laptop OLED Intel Core i5 16GB 512GB", ImageUrl = "/electro/img/product-18.png", Brand = "ASUS", Featured = false, BestSeller = true, NewArrival = false, Discounted = true },
                new { Name = "Lenovo ThinkPad E14", Price = 20990000m, OriginalPrice = 23990000m, Stock = 13, Category = "Laptop", Description = "Lenovo business laptop Core i5 16GB 512GB", ImageUrl = "/electro/img/product-1.png", Brand = "Lenovo", Featured = false, BestSeller = false, NewArrival = false, Discounted = true },
                new { Name = "HP Pavilion 14", Price = 16990000m, OriginalPrice = 18990000m, Stock = 15, Category = "Laptop", Description = "HP student laptop Core i5 16GB 512GB", ImageUrl = "/electro/img/product-2.png", Brand = "HP", Featured = false, BestSeller = false, NewArrival = false, Discounted = true },
                new { Name = "HP Victus 16", Price = 24990000m, OriginalPrice = 28990000m, Stock = 10, Category = "Laptop", Description = "HP gaming laptop RTX 4050 16GB 512GB", ImageUrl = "/electro/img/product-3.png", Brand = "HP", Featured = false, BestSeller = false, NewArrival = true, Discounted = true },
                new { Name = "iPad Air M2 11 inch", Price = 16990000m, OriginalPrice = 18990000m, Stock = 18, Category = "Tablet", Description = "Apple tablet M2 128GB WiFi", ImageUrl = "/electro/img/product-4.png", Brand = "Apple", Featured = true, BestSeller = false, NewArrival = true, Discounted = true },
                new { Name = "iPad Gen 10 10.9 inch", Price = 9990000m, OriginalPrice = 11990000m, Stock = 24, Category = "Tablet", Description = "Apple tablet A14 64GB WiFi", ImageUrl = "/electro/img/product-5.png", Brand = "Apple", Featured = false, BestSeller = true, NewArrival = false, Discounted = true },
                new { Name = "Xiaomi Pad 6", Price = 8490000m, OriginalPrice = 9990000m, Stock = 22, Category = "Tablet", Description = "Xiaomi tablet 11 inch 8GB 256GB", ImageUrl = "/electro/img/product-6.png", Brand = "Xiaomi", Featured = false, BestSeller = false, NewArrival = false, Discounted = true },
                new { Name = "Apple Watch Series 10", Price = 10990000m, OriginalPrice = 12990000m, Stock = 20, Category = "Đồng hồ thông minh", Description = "Apple smartwatch GPS 46mm health tracking", ImageUrl = "/electro/img/product-7.png", Brand = "Apple", Featured = false, BestSeller = true, NewArrival = true, Discounted = true },
                new { Name = "Samsung Galaxy Watch7", Price = 7490000m, OriginalPrice = 8990000m, Stock = 19, Category = "Đồng hồ thông minh", Description = "Samsung smartwatch 44mm Wear OS", ImageUrl = "/electro/img/product-8.png", Brand = "Samsung", Featured = false, BestSeller = false, NewArrival = true, Discounted = true },
                new { Name = "Canon EOS R50 Kit", Price = 18990000m, OriginalPrice = 21990000m, Stock = 10, Category = "Máy ảnh", Description = "Canon mirrorless camera vlog 4K kit lens", ImageUrl = "/electro/img/product-9.png", Brand = "Canon", Featured = true, BestSeller = false, NewArrival = true, Discounted = true },
                new { Name = "GoPro Hero 13 Black", Price = 11990000m, OriginalPrice = 13990000m, Stock = 14, Category = "Máy ảnh", Description = "GoPro action camera waterproof 5.3K video", ImageUrl = "/electro/img/product-10.png", Brand = "GoPro", Featured = false, BestSeller = true, NewArrival = true, Discounted = true },
                new { Name = "JBL Flip 6", Price = 2790000m, OriginalPrice = 3290000m, Stock = 26, Category = "Audio", Description = "JBL bluetooth speaker waterproof audio", ImageUrl = "/electro/img/product-11.png", Brand = "JBL", Featured = false, BestSeller = true, NewArrival = false, Discounted = true }
            };

            var existingProducts = Products.ToList();
            var staleProducts = existingProducts
                .Where(p => new[] { "Programming Book", "T-Shirt Cotton", "Garden Tools Set" }.Contains(p.Name))
                .ToList();
            var booksawProducts = existingProducts
                .Where(p =>
                    (p.Sku != null && p.Sku.StartsWith("BK-")) ||
                    (p.ImageUrl != null && p.ImageUrl.Contains("/template/booksaw")) ||
                    p.Name.Contains("Booksaw"))
                .ToList();

            foreach (var product in booksawProducts)
            {
                product.IsActive = false;
            }

            for (var i = 0; i < productSeeds.Length; i++)
            {
                var seed = productSeeds[i];
                var categoryId = ResolveCategoryId(seed.Category, seed.Name);
                var product = existingProducts.FirstOrDefault(p => p.Name == seed.Name);

                if (product == null && i < staleProducts.Count)
                {
                    product = staleProducts[i];
                }

                if (product == null && i < 5)
                {
                    product = await Products.FindAsync(i + 1);
                }

                // Chỉ tạo mới khi sản phẩm chưa tồn tại. KHÔNG ghi đè sản phẩm đã có
                // để tránh reset các thay đổi do người dùng chỉnh sửa khi seeder chạy lại.
                if (product != null)
                {
                    continue;
                }

                product = new Product();
                await Products.AddAsync(product);

                product.Name = seed.Name;
                product.Price = seed.Price;
                product.OriginalPrice = seed.OriginalPrice;
                product.Stock = seed.Stock;
                product.CategoryId = categoryId;
                product.Description = seed.Description;
                product.ImageUrl = seed.ImageUrl;
                product.Brand = seed.Brand;
                product.Sku = CreateSku(seed.Name);
                product.Slug = CreateSlug(seed.Name);
                product.IsActive = true;
                product.IsFeatured = seed.Featured;
                product.IsBestSeller = seed.BestSeller;
                product.IsNewArrival = seed.NewArrival;
                product.IsDiscounted = seed.Discounted;
                product.RequiresSerialTracking = true;
                product.WarrantyMonths = 12;
            }

            await SaveChangesAsync();
            await EnsureColorSpecDefinitionsAndOptionsAsync();
            await EnsureElectroProductSpecsAsync();
            Console.WriteLine("Electro catalog synchronized successfully");
        }

        private async Task EnsureColorSpecDefinitionsAndOptionsAsync()
        {
            var colorSpecs = new[]
            {
                new { CategoryId = 1, Options = new[] { "Den", "Trang", "Xanh duong", "Xanh la", "Hong", "Natural Titanium", "Desert Titanium" } },
                new { CategoryId = 2, Options = new[] { "Bac", "Xam", "Den", "Midnight", "Starlight", "Space Gray" } },
                new { CategoryId = 4, Options = new[] { "Bac", "Xam", "Xanh duong", "Hong", "Graphite" } },
                new { CategoryId = 5, Options = new[] { "Den", "Bac", "Vang", "Graphite", "Midnight", "Starlight" } },
                new { CategoryId = 6, Options = new[] { "Den", "Bac", "Trang", "Graphite" } },
                new { CategoryId = 7, Options = new[] { "Trang", "Den", "Xanh duong", "Bac", "Be" } }
            };

            var definitions = await SpecDefinitions
                .Where(x => x.Code == "color")
                .ToListAsync();
            var allOptions = await SpecOptions.ToListAsync();
            var changed = false;

            foreach (var seed in colorSpecs)
            {
                var definition = definitions.FirstOrDefault(x => x.CategoryId == seed.CategoryId);
                if (definition == null)
                {
                    var nextSortOrder = await SpecDefinitions
                        .Where(x => x.CategoryId == seed.CategoryId)
                        .Select(x => (int?)x.SortOrder)
                        .MaxAsync() ?? 0;

                    definition = new SpecDefinition
                    {
                        CategoryId = seed.CategoryId,
                        Name = "Màu sắc",
                        Code = "color",
                        DataType = "select",
                        InputType = "select",
                        SortOrder = nextSortOrder + 1,
                        IsComparable = true,
                        IsFilterable = true,
                        AllowCustomValue = false,
                        IsActive = true,
                        IsVariantAxis = true, // Màu là trục biến thể, không phải thông số chung
                        CreatedAt = DateTime.UtcNow
                    };

                    await SpecDefinitions.AddAsync(definition);
                    definitions.Add(definition);
                    changed = true;
                }
                else
                {
                    if (definition.Name != "Màu sắc" ||
                        definition.DataType != "select" ||
                        definition.InputType != "select" ||
                        !definition.IsComparable ||
                        !definition.IsFilterable ||
                        definition.AllowCustomValue ||
                        !definition.IsActive ||
                        !definition.IsVariantAxis)
                    {
                        definition.Name = "Màu sắc";
                        definition.DataType = "select";
                        definition.InputType = "select";
                        definition.IsComparable = true;
                        definition.IsFilterable = true;
                        definition.AllowCustomValue = false;
                        definition.IsActive = true;
                        definition.IsVariantAxis = true;
                        definition.UpdatedAt = DateTime.UtcNow;
                        changed = true;
                    }
                }

                var existingOptions = allOptions
                    .Where(x => x.SpecDefinitionId == definition.Id)
                    .ToList();

                for (var index = 0; index < seed.Options.Length; index++)
                {
                    var value = seed.Options[index];
                    var option = existingOptions.FirstOrDefault(x => x.Value == value);
                    if (option == null)
                    {
                        option = new SpecOption
                        {
                            SpecDefinition = definition,
                            Value = value,
                            DisplayOrder = index + 1,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        };
                        await SpecOptions.AddAsync(option);
                        allOptions.Add(option);
                        changed = true;
                        continue;
                    }

                    if (option.DisplayOrder != index + 1 || !option.IsActive)
                    {
                        option.DisplayOrder = index + 1;
                        option.IsActive = true;
                        option.UpdatedAt = DateTime.UtcNow;
                        changed = true;
                    }
                }
            }

            if (changed)
            {
                await SaveChangesAsync();
                Console.WriteLine("Color spec options synchronized successfully");
            }
        }

        private async Task EnsureElectroProductSpecsAsync()
        {
            var products = await Products.Where(p => p.IsActive).ToListAsync();
            var definitions = await SpecDefinitions.ToListAsync();
            var existing = await ProductSpecValues.ToListAsync();
            var changed = false;

            async Task Upsert(Product product, string code, string value)
            {
                var definition = definitions.FirstOrDefault(d => d.CategoryId == product.CategoryId && d.Code == code);
                if (definition == null || string.IsNullOrWhiteSpace(value)) return;

                var spec = existing.FirstOrDefault(x => x.ProductId == product.Id && x.SpecDefinitionId == definition.Id);
                if (spec == null)
                {
                    spec = new ProductSpecValue
                    {
                        ProductId = product.Id,
                        SpecDefinitionId = definition.Id,
                        ValueText = value,
                        CreatedAt = DateTime.UtcNow
                    };
                    existing.Add(spec);
                    await ProductSpecValues.AddAsync(spec);
                    changed = true;
                    return;
                }

                if (spec.ValueText != value || spec.SpecOptionId != null || spec.ValueNumber != null || spec.ValueBool != null)
                {
                    spec.ValueText = value;
                    spec.SpecOptionId = null;
                    spec.ValueNumber = null;
                    spec.ValueBool = null;
                    spec.UpdatedAt = DateTime.UtcNow;
                    changed = true;
                }
            }

            async Task Apply(Product? product, params (string Code, string Value)[] specs)
            {
                if (product == null) return;
                foreach (var (code, value) in specs)
                {
                    await Upsert(product, code, value);
                }
            }

            Product? Find(string name) => products.FirstOrDefault(p => p.Name == name);

            await Apply(Find("iPhone 15 Pro"),
                ("screenSize", "6.3 inches"),
                ("screenTechnology", "Super Retina XDR"),
                ("rearCamera", "Chinh 48MP f/1.6 OIS; Goc sieu rong 48MP f/2.2; Telephoto 48MP f/2.8"),
                ("frontCamera", "Camera 18MP Center Stage f/1.9"),
                ("chipset", "Chip A19 Pro"),
                ("nfc", "Co"),
                ("internalStorage", "256 GB"),
                ("sim", "Sim kep (nano-SIM va eSIM) - ho tro 2 eSIM"),
                ("os", "iOS 26"),
                ("screenResolution", "2622 x 1206 pixels"),
                ("screenFeatures", "Always-On, ProMotion 120Hz, HDR, True Tone, P3, 3000 nits ngoai troi"),
                ("cpuType", "CPU 6 loi voi 2 loi hieu nang va 4 loi tiet kiem dien"));

            await Apply(Find("Samsung Galaxy S24"),
                ("screenSize", "6.9 inches"),
                ("screenTechnology", "Dynamic AMOLED 2X"),
                ("rearCamera", "Camera sieu rong 50MP; camera goc rong 200MP; tele 5x 50MP; tele 3x 10MP"),
                ("frontCamera", "12MP"),
                ("chipset", "Snapdragon 8 Elite Gen 5 danh cho Galaxy (3nm)"),
                ("nfc", "Co"),
                ("ram", "12 GB"),
                ("internalStorage", "256 GB"),
                ("battery", "5000 mAh"),
                ("sim", "2 Nano-SIM + eSIM"),
                ("screenResolution", "3120 x 1440 pixels (Quad HD+)"),
                ("screenFeatures", "1-120Hz, do sang toi da 2600 nits"));

            await Apply(Find("MacBook Air M3"),
                ("graphicsType", "GPU 5 loi, Neural Engine 16 loi"),
                ("ram", "8GB"),
                ("hardDrive", "256GB"),
                ("screenSize", "13 inches"),
                ("screenTechnology", "Liquid Retina, LED, 500 nit, ho tro 1 ty mau, mau sRGB"),
                ("battery", "Xem video truc tuyen den 16 gio; duyet web den 11 gio; pin 36.5Wh"),
                ("os", "macOS"),
                ("screenResolution", "2408 x 1506 pixels"),
                ("cpuType", "Chip Apple A18 Pro, CPU 6 loi"),
                ("ports", "USB 3 USB-C, USB 2 USB-C, jack 3.5 mm"));

            await Apply(Find("Dell XPS 15"),
                ("graphicsType", "NVIDIA GeForce RTX 3050 6GB GDDR6"),
                ("ram", "16GB"),
                ("ramType", "DDR5"),
                ("hardDrive", "512GB M.2 NVMe PCIe SSD"),
                ("screenSize", "15.6 inches"),
                ("screenTechnology", "FHD+, 100% sRGB, chong choi"),
                ("battery", "Pin 4-cell 54Wh"),
                ("os", "Windows 11 Home"),
                ("screenResolution", "1920 x 1200 pixels (FullHD+)"),
                ("cpuType", "Intel Core i5-13420H"),
                ("ports", "USB-C, HDMI, jack 3.5 mm"));

            await Apply(Find("iPad Pro 12.9"),
                ("screenSize", "12.1 inches"),
                ("screenTechnology", "Liquid Retina"),
                ("rearCamera", "Camera goc rong 12MP"),
                ("frontCamera", "12MP f/2.4"),
                ("chipset", "Chip A16"),
                ("internalStorage", "512 GB"),
                ("battery", "Pin Li-Po 28.93Wh"),
                ("os", "iPadOS 18"),
                ("screenResolution", "2360 x 1640 pixels"),
                ("screenFeatures", "Multi-Touch, True Tone, 500 nit, lop phu khang dau"),
                ("cpuType", "CPU 5 loi"),
                ("compatibility", "Apple Pencil (USB-C)"));

            await Apply(Find("AirPods Pro 2"),
                ("dimensions", "Tai nghe 30.9 x 21.8 x 24.0 mm; hop sac 46.2 x 50.1 x 21.2 mm"),
                ("weight", "Tai nghe 5.3g; hop sac 50.8g"),
                ("audioTechnology", "Adaptive EQ, Spatial Audio ca nhan hoa, chong on chu dong"),
                ("microphone", "Co"),
                ("batteryLife", "Tai nghe 5 gio; dam thoai 4.5 gio"),
                ("controlMethod", "Cam bien luc"),
                ("chipset", "Chip tai nghe H2"),
                ("otherFeatures", "Khang nuoc va bui IP54"),
                ("manufacturer", "Apple Chinh hang"));

            if (changed)
            {
                await SaveChangesAsync();
                Console.WriteLine("Electro product specs synchronized successfully");
            }
        }

        private async Task CleanupCategoryDuplicatesAsync()
        {
            var categories = await Categories.ToListAsync();
            if (categories.Count == 0) return;

            var camera = categories.FirstOrDefault(c => c.Id == 6) ??
                         categories.OrderBy(c => c.Id).FirstOrDefault(c => NormalizeCategoryName(c.Name) == "may anh");
            var headphones = categories.FirstOrDefault(c => c.Id == 7) ??
                             categories.OrderBy(c => c.Id).FirstOrDefault(c => NormalizeCategoryName(c.Name) == "tai nghe");

            var obsoleteCategories = categories
                .Where(c => IsObsoleteCategory(c, camera?.Id, headphones?.Id))
                .ToList();

            if (obsoleteCategories.Count == 0) return;

            foreach (var category in obsoleteCategories)
            {
                var key = NormalizeCategoryName(category.Name);
                var targetId = key == "may anh" ? camera?.Id : headphones?.Id;
                if (!targetId.HasValue || targetId.Value == category.Id) continue;

                var products = await Products.Where(p => p.CategoryId == category.Id).ToListAsync();
                foreach (var product in products)
                {
                    product.CategoryId = targetId.Value;
                    product.UpdatedAt = DateTime.UtcNow;
                }

                Categories.Remove(category);
            }

            await SaveChangesAsync();
            Console.WriteLine("Obsolete category duplicates cleaned successfully");
        }

        private static bool IsObsoleteCategory(Category category, int? cameraId, int? headphonesId)
        {
            var key = NormalizeCategoryName(category.Name);
            if (key is "accessories" or "phu kien" or "phu kien dien tu" or "electronics" or "thiet bi dien tu") return true;
            if (key == "may anh" && cameraId.HasValue && category.Id != cameraId.Value) return true;
            if (key == "tai nghe" && headphonesId.HasValue && category.Id != headphonesId.Value) return true;
            return false;
        }

        private static string NormalizeCategoryName(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return string.Empty;

            var normalized = value.Normalize(NormalizationForm.FormD);
            var builder = new StringBuilder(normalized.Length);
            foreach (var ch in normalized)
            {
                if (CharUnicodeInfo.GetUnicodeCategory(ch) != UnicodeCategory.NonSpacingMark)
                {
                    builder.Append(ch);
                }
            }

            return builder
                .ToString()
                .Replace("đ", "d")
                .Replace("Đ", "D")
                .Normalize(NormalizationForm.FormC)
                .Trim()
                .ToLowerInvariant();
        }

        private static string CreateSku(string value)
        {
            return "EL-" + CreateSlug(value).Replace("-", "").ToUpperInvariant();
        }

        private static string CreateSlug(string value)
        {
            return string.Join("-",
                value.ToLowerInvariant()
                    .Split(new[] { ' ', '.', '/', '\\', '_', '+', '&' }, StringSplitOptions.RemoveEmptyEntries));
        }
    }
}

