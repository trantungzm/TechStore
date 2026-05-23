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
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<OrderTimeline> OrderTimelines { get; set; }
        public DbSet<OrderCancellation> OrderCancellations { get; set; }
        public DbSet<ProductImage> ProductImages { get; set; }
        public DbSet<ProductVariant> ProductVariants { get; set; }
        public DbSet<SpecDefinition> SpecDefinitions { get; set; }
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
                entity.Ignore(e => e.RoleModule);
                entity.Ignore(e => e.UserRole);
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
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
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
                CreatedAt = coreSeedTime,
                UpdatedAt = coreSeedTime
            });

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
                entity.Property(e => e.Sku).HasMaxLength(80);
                entity.Property(e => e.Price).HasPrecision(18, 2);
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
                entity.Property(e => e.ColorName).HasMaxLength(80);
                entity.Property(e => e.ColorCode).HasMaxLength(32);
                entity.Property(e => e.Storage).HasMaxLength(80);
                entity.Property(e => e.Ram).HasMaxLength(80);
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
                entity.Property(e => e.Unit).HasMaxLength(40);
                entity.HasIndex(e => new { e.CategoryId, e.Code }).IsUnique();
                entity.HasOne(e => e.Category)
                      .WithMany()
                      .HasForeignKey(e => e.CategoryId)
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
                entity.Property(e => e.InvoiceCompanyName).HasMaxLength(200);
                entity.Property(e => e.InvoiceTaxCode).HasMaxLength(40);
                entity.Property(e => e.InvoiceAddress).HasMaxLength(300);
                entity.Property(e => e.InvoiceEmail).HasMaxLength(160);
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
                new Supplier { Id = 3, SupplierCode = "SUP-PETROSETCO", Name = "Petrosetco", SupplierType = SupplierType.Tier1Distributor, Phone = "02854168686", Email = "contact@petrosetco.com.vn", Address = "Vietnam", IsActive = true, CreatedAt = coreSeedTime },
                new Supplier { Id = 4, SupplierCode = "SUP-SAMSUNG-VN", Name = "Samsung Viet Nam", SupplierType = SupplierType.OfficialBrand, Phone = "1800588899", Email = "support.vn@samsung.com", Address = "Vietnam", IsActive = true, CreatedAt = coreSeedTime },
                new Supplier { Id = 5, SupplierCode = "SUP-XIAOMI-VN", Name = "Xiaomi Viet Nam", SupplierType = SupplierType.OfficialBrand, Phone = "1800400410", Email = "service.vn@xiaomi.com", Address = "Vietnam", IsActive = true, CreatedAt = coreSeedTime },
                new Supplier { Id = 6, SupplierCode = "SUP-OPPO-VN", Name = "OPPO Viet Nam", SupplierType = SupplierType.OfficialBrand, Phone = "1800577776", Email = "support.vn@oppo.com", Address = "Vietnam", IsActive = true, CreatedAt = coreSeedTime },
                new Supplier { Id = 7, SupplierCode = "SUP-SONY-VN", Name = "Sony Viet Nam", SupplierType = SupplierType.OfficialBrand, Phone = "1800585885", Email = "support.vn@sony.com", Address = "Vietnam", IsActive = true, CreatedAt = coreSeedTime },
                new Supplier { Id = 8, SupplierCode = "SUP-CANON-VN", Name = "Canon Viet Nam", SupplierType = SupplierType.OfficialBrand, Phone = "1900558800", Email = "support@canon.com.vn", Address = "Vietnam", IsActive = true, CreatedAt = coreSeedTime }
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

            modelBuilder.Entity<CategorySupplier>().HasData(
                new CategorySupplier { Id = 1, CategoryId = 1, SupplierId = 1, SortOrder = 1, IsActive = true, CreatedAt = coreSeedTime },
                new CategorySupplier { Id = 2, CategoryId = 1, SupplierId = 2, SortOrder = 2, IsActive = true, CreatedAt = coreSeedTime },
                new CategorySupplier { Id = 3, CategoryId = 2, SupplierId = 1, SortOrder = 1, IsActive = true, CreatedAt = coreSeedTime },
                new CategorySupplier { Id = 4, CategoryId = 2, SupplierId = 2, SortOrder = 2, IsActive = true, CreatedAt = coreSeedTime },
                new CategorySupplier { Id = 5, CategoryId = 4, SupplierId = 2, SortOrder = 1, IsActive = true, CreatedAt = coreSeedTime },
                new CategorySupplier { Id = 6, CategoryId = 4, SupplierId = 4, SortOrder = 2, IsActive = true, CreatedAt = coreSeedTime },
                new CategorySupplier { Id = 7, CategoryId = 5, SupplierId = 2, SortOrder = 1, IsActive = true, CreatedAt = coreSeedTime },
                new CategorySupplier { Id = 8, CategoryId = 5, SupplierId = 4, SortOrder = 2, IsActive = true, CreatedAt = coreSeedTime },
                new CategorySupplier { Id = 9, CategoryId = 6, SupplierId = 7, SortOrder = 1, IsActive = true, CreatedAt = coreSeedTime },
                new CategorySupplier { Id = 10, CategoryId = 6, SupplierId = 8, SortOrder = 2, IsActive = true, CreatedAt = coreSeedTime },
                new CategorySupplier { Id = 11, CategoryId = 7, SupplierId = 7, SortOrder = 1, IsActive = true, CreatedAt = coreSeedTime },
                new CategorySupplier { Id = 12, CategoryId = 7, SupplierId = 2, SortOrder = 2, IsActive = true, CreatedAt = coreSeedTime }
            );

            modelBuilder.Entity<StockItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.SerialOrImei).HasMaxLength(120).IsRequired();
                entity.Property(e => e.Sku).HasMaxLength(100);
                entity.Property(e => e.Status).HasMaxLength(40).HasDefaultValue("InStock").IsRequired();
                entity.Property(e => e.UnitCost).HasPrecision(18, 2);
                entity.Property(e => e.SupplierName).HasMaxLength(200);
                entity.Property(e => e.Note).HasMaxLength(1000);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.HasIndex(e => e.SerialOrImei).IsUnique();
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
                entity.Property(e => e.SerialOrImei).HasMaxLength(120);
                entity.Property(e => e.CustomerName).HasMaxLength(160);
                entity.Property(e => e.CustomerPhone).HasMaxLength(30);
                entity.Property(e => e.CustomerEmail).HasMaxLength(160);
                entity.Property(e => e.ProductName).HasMaxLength(250);
                entity.Property(e => e.ProductImage).HasMaxLength(500);
                entity.Property(e => e.Status).HasMaxLength(40).HasDefaultValue("Active");
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
                entity.HasOne(e => e.Warranty).WithMany().HasForeignKey(e => e.WarrantyId).OnDelete(DeleteBehavior.SetNull);
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
                entity.Property(e => e.RepairCode).HasMaxLength(40).IsRequired();
                entity.Property(e => e.SerialOrImei).HasMaxLength(120);
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
                entity.Property(e => e.StatusAfter).HasMaxLength(40);
                entity.Property(e => e.PriorityAfter).HasMaxLength(40);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.HasOne(e => e.Ticket).WithMany(t => t.Updates).HasForeignKey(e => e.TicketId).OnDelete(DeleteBehavior.Cascade);
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

            // Seed initial data
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Seed Categories
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Smartphone", Description = "Dien thoai va thiet bi di dong" },
                new Category { Id = 2, Name = "Laptop", Description = "Laptop va may tinh xach tay" },
                new Category { Id = 3, Name = "Accessories", Description = "Phu kien dien tu" },
                new Category { Id = 4, Name = "Gaming", Description = "Thiet bi cho game thu" },
                new Category { Id = 5, Name = "Tablet", Description = "May tinh bang" },
                new Category { Id = 6, Name = "Smartwatch", Description = "Dong ho thong minh" },
                new Category { Id = 7, Name = "Camera", Description = "May anh va quay video" },
                new Category { Id = 8, Name = "Audio", Description = "Loa va tai nghe" },
                new Category { Id = 9, Name = "Electronics", Description = "Thiet bi dien tu" }
            );

            modelBuilder.Entity<Warehouse>().HasData(
                new Warehouse { Id = 1, Name = "CNTHHT Main Store", Code = "MAIN", Address = "Main store", IsActive = true, CreatedAt = new DateTime(2026, 5, 18, 0, 0, 0, DateTimeKind.Utc) }
            );

            var couponStart = new DateTime(2026, 5, 17, 0, 0, 0, DateTimeKind.Utc);
            var couponEnd = new DateTime(2026, 6, 17, 23, 59, 59, DateTimeKind.Utc);
            modelBuilder.Entity<Coupon>().HasData(
                new Coupon { Id = 1, Code = "FREESHIP", Name = "Mien phi van chuyen", Description = "Mien phi van chuyen cho don giao hang", Type = "Shipping", DiscountType = "FreeShipping", DiscountValue = 100, MinOrderAmount = 0, StartAt = couponStart, EndAt = couponEnd, TotalQuantity = 1000, PerUserLimit = 1, IsActive = true, IsPublic = true, IsAutoClaimable = true, CreatedAt = couponStart },
                new Coupon { Id = 2, Code = "SHIP20K", Name = "Giam 20K phi van chuyen", Description = "Giam 20.000d phi giao hang", Type = "Shipping", DiscountType = "Amount", DiscountValue = 20000, MinOrderAmount = 0, StartAt = couponStart, EndAt = couponEnd, TotalQuantity = 1000, PerUserLimit = 1, IsActive = true, IsPublic = true, IsAutoClaimable = true, CreatedAt = couponStart },
                new Coupon { Id = 3, Code = "GIAM10", Name = "Giam 10% don hang", Description = "Giam 10% toi da 100.000d cho don tu 1.000.000d", Type = "Product", DiscountType = "Percent", DiscountValue = 10, MaxDiscountAmount = 100000, MinOrderAmount = 1000000, StartAt = couponStart, EndAt = couponEnd, TotalQuantity = 1000, PerUserLimit = 1, IsActive = true, IsPublic = true, IsAutoClaimable = true, CreatedAt = couponStart },
                new Coupon { Id = 4, Code = "SALE50K", Name = "Giam 50K cho don tu 2 trieu", Description = "Giam 50.000d cho don tu 2.000.000d", Type = "Product", DiscountType = "Amount", DiscountValue = 50000, MinOrderAmount = 2000000, StartAt = couponStart, EndAt = couponEnd, TotalQuantity = 1000, PerUserLimit = 1, IsActive = true, IsPublic = true, IsAutoClaimable = true, CreatedAt = couponStart },
                new Coupon { Id = 5, Code = "PHUKIEN20", Name = "Giam 20% phu kien", Description = "Giam 20% toi da 80.000d cho phu kien", Type = "Product", DiscountType = "Percent", DiscountValue = 20, MaxDiscountAmount = 80000, MinOrderAmount = 0, StartAt = couponStart, EndAt = couponEnd, TotalQuantity = 500, PerUserLimit = 1, IsActive = true, IsPublic = true, IsAutoClaimable = true, CreatedAt = couponStart },
                new Coupon { Id = 6, Code = "LAPTOP5", Name = "Giam 5% laptop", Description = "Giam 5% toi da 500.000d cho laptop", Type = "Product", DiscountType = "Percent", DiscountValue = 5, MaxDiscountAmount = 500000, MinOrderAmount = 0, StartAt = couponStart, EndAt = couponEnd, TotalQuantity = 500, PerUserLimit = 1, IsActive = true, IsPublic = true, IsAutoClaimable = true, CreatedAt = couponStart }
            );
            modelBuilder.Entity<CouponScope>().HasData(
                new CouponScope { Id = 1, CouponId = 1, ScopeType = "All", CreatedAt = couponStart },
                new CouponScope { Id = 2, CouponId = 2, ScopeType = "All", CreatedAt = couponStart },
                new CouponScope { Id = 3, CouponId = 3, ScopeType = "All", CreatedAt = couponStart },
                new CouponScope { Id = 4, CouponId = 4, ScopeType = "All", CreatedAt = couponStart },
                new CouponScope { Id = 5, CouponId = 5, ScopeType = "Category", CategoryId = 7, CreatedAt = couponStart },
                new CouponScope { Id = 6, CouponId = 6, ScopeType = "Category", CategoryId = 1, CreatedAt = couponStart }
            );

            // Seed Products
            modelBuilder.Entity<Product>().HasData(
                new Product { Id = 1, Name = "iPhone 15 Pro", Price = 28990000, OriginalPrice = 32990000, Stock = 12, CategoryId = 1, Description = "Flagship Apple smartphone", ImageUrl = "/electro/img/product-1.png", Brand = "Apple", IsFeatured = true, IsNewArrival = true, IsDiscounted = true, RequiresSerialTracking = true },
                new Product { Id = 2, Name = "Samsung Galaxy S24", Price = 21990000, OriginalPrice = 24990000, Stock = 15, CategoryId = 1, Description = "Android flagship phone", ImageUrl = "/electro/img/product-2.png", Brand = "Samsung", IsFeatured = true, IsBestSeller = true, IsNewArrival = true, IsDiscounted = true, RequiresSerialTracking = true },
                new Product { Id = 3, Name = "MacBook Air M3", Price = 31990000, OriginalPrice = 35990000, Stock = 10, CategoryId = 2, Description = "Lightweight Apple laptop", ImageUrl = "/electro/img/product-3.png", Brand = "Apple", IsFeatured = true, IsBestSeller = true, IsDiscounted = true, RequiresSerialTracking = true },
                new Product { Id = 4, Name = "Dell XPS 15", Price = 35990000, OriginalPrice = 39990000, Stock = 8, CategoryId = 2, Description = "High-end productivity laptop", ImageUrl = "/electro/img/product-4.png", Brand = "Dell", IsFeatured = true, IsDiscounted = true, RequiresSerialTracking = true },
                new Product { Id = 5, Name = "AirPods Pro", Price = 5990000, OriginalPrice = 6990000, Stock = 25, CategoryId = 3, Description = "Wireless earbuds", ImageUrl = "/electro/img/product-5.png", Brand = "Apple", IsBestSeller = true, IsDiscounted = true, RequiresSerialTracking = true }
            );

            var seedTime = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            modelBuilder.Entity<SpecDefinition>().HasData(
                new SpecDefinition { Id = 1, CategoryId = 1, Name = "Kích thước màn hình", Code = "screenSize", DataType = "text", SortOrder = 1, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 2, CategoryId = 1, Name = "Công nghệ màn hình", Code = "screenTechnology", DataType = "text", SortOrder = 2, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 3, CategoryId = 1, Name = "Camera sau", Code = "rearCamera", DataType = "text", SortOrder = 3, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 4, CategoryId = 1, Name = "Camera trước", Code = "frontCamera", DataType = "text", SortOrder = 4, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 5, CategoryId = 1, Name = "Chipset", Code = "chipset", DataType = "text", SortOrder = 5, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 6, CategoryId = 1, Name = "RAM", Code = "ram", DataType = "text", SortOrder = 6, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 7, CategoryId = 1, Name = "Bộ nhớ trong", Code = "internalStorage", DataType = "text", SortOrder = 7, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 8, CategoryId = 1, Name = "Pin", Code = "battery", DataType = "text", SortOrder = 8, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 9, CategoryId = 1, Name = "Hệ điều hành", Code = "os", DataType = "text", SortOrder = 9, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 10, CategoryId = 2, Name = "Loại CPU", Code = "cpuType", DataType = "text", SortOrder = 1, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 11, CategoryId = 2, Name = "Dung lượng RAM", Code = "ram", DataType = "text", SortOrder = 2, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 12, CategoryId = 2, Name = "Ổ cứng", Code = "hardDrive", DataType = "text", SortOrder = 3, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 13, CategoryId = 2, Name = "Card đồ họa", Code = "graphicsCard", DataType = "text", SortOrder = 4, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 14, CategoryId = 2, Name = "Kích thước màn hình", Code = "screenSize", DataType = "text", SortOrder = 5, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 15, CategoryId = 2, Name = "Độ phân giải màn hình", Code = "screenResolution", DataType = "text", SortOrder = 6, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 16, CategoryId = 2, Name = "Pin", Code = "battery", DataType = "text", SortOrder = 7, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 17, CategoryId = 2, Name = "Hệ điều hành", Code = "os", DataType = "text", SortOrder = 8, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 18, CategoryId = 4, Name = "Kích thước màn hình", Code = "screenSize", DataType = "text", SortOrder = 1, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 19, CategoryId = 4, Name = "Chipset", Code = "chipset", DataType = "text", SortOrder = 2, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 20, CategoryId = 4, Name = "RAM", Code = "ram", DataType = "text", SortOrder = 3, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 21, CategoryId = 4, Name = "Bộ nhớ trong", Code = "internalStorage", DataType = "text", SortOrder = 4, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 22, CategoryId = 4, Name = "Pin", Code = "battery", DataType = "text", SortOrder = 5, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 23, CategoryId = 4, Name = "Camera trước", Code = "frontCamera", DataType = "text", SortOrder = 6, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 24, CategoryId = 4, Name = "Camera sau", Code = "rearCamera", DataType = "text", SortOrder = 7, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 25, CategoryId = 7, Name = "Loại tai nghe", Code = "headphoneType", DataType = "text", SortOrder = 1, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 26, CategoryId = 7, Name = "Công nghệ âm thanh", Code = "audioTechnology", DataType = "text", SortOrder = 2, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 27, CategoryId = 7, Name = "Micro", Code = "microphone", DataType = "text", SortOrder = 3, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 28, CategoryId = 7, Name = "Kết nối", Code = "connection", DataType = "text", SortOrder = 4, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 29, CategoryId = 7, Name = "Thời lượng pin", Code = "batteryLife", DataType = "text", SortOrder = 5, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 30, CategoryId = 7, Name = "Chống ồn", Code = "noiseCancellation", DataType = "text", SortOrder = 6, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 31, CategoryId = 5, Name = "Công nghệ màn hình", Code = "screenTechnology", DataType = "text", SortOrder = 1, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 32, CategoryId = 5, Name = "Kích thước màn hình", Code = "screenSize", DataType = "text", SortOrder = 2, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 33, CategoryId = 5, Name = "Nghe gọi", Code = "calling", DataType = "text", SortOrder = 3, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 34, CategoryId = 5, Name = "Tiện ích sức khỏe", Code = "healthFeatures", DataType = "text", SortOrder = 4, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 35, CategoryId = 5, Name = "Thời lượng pin", Code = "batteryLife", DataType = "text", SortOrder = 5, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 36, CategoryId = 5, Name = "Chống nước", Code = "waterResistance", DataType = "text", SortOrder = 6, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 37, CategoryId = 6, Name = "Dòng camera", Code = "cameraLine", DataType = "text", SortOrder = 1, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 38, CategoryId = 6, Name = "Độ phân giải", Code = "resolution", DataType = "text", SortOrder = 2, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 39, CategoryId = 6, Name = "Góc ống kính", Code = "lensAngle", DataType = "text", SortOrder = 3, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 40, CategoryId = 6, Name = "Chống rung", Code = "stabilization", DataType = "text", SortOrder = 4, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 41, CategoryId = 6, Name = "Kết nối không dây", Code = "wirelessConnection", DataType = "text", SortOrder = 5, IsComparable = true, CreatedAt = seedTime }
            );
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
            await CleanupCategoryDuplicatesAsync();
            await DisableLegacyAdminAccountAsync();

            // Seed Admin User
            var adminExists = Users.Any(u => u.UserName == "admin");
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
                new Category { Id = 7, Name = "Tai nghe", Description = "Tai nghe và thiết bị âm thanh" }
            };

            foreach (var seed in categorySeeds)
            {
                var category = await Categories.FindAsync(seed.Id);
                if (category == null)
                {
                    await Categories.AddAsync(seed);
                    continue;
                }

                category.Name = seed.Name;
                category.Description = seed.Description;
            }

            await SaveChangesAsync();

            var categoryByName = Categories.ToDictionary(c => c.Name, c => c.Id);
            var productSeeds = new[]
            {
                new { Name = "iPhone 15 Pro", Price = 28990000m, OriginalPrice = 32990000m, Stock = 12, Category = "Điện thoại", Description = "Flagship Apple smartphone", ImageUrl = "/electro/img/product-1.png", Brand = "Apple", Featured = true, BestSeller = false, NewArrival = true, Discounted = true },
                new { Name = "Samsung Galaxy S24", Price = 21990000m, OriginalPrice = 24990000m, Stock = 15, Category = "Điện thoại", Description = "Android flagship phone", ImageUrl = "/electro/img/product-2.png", Brand = "Samsung", Featured = true, BestSeller = true, NewArrival = true, Discounted = true },
                new { Name = "MacBook Air M3", Price = 31990000m, OriginalPrice = 35990000m, Stock = 10, Category = "Laptop", Description = "Lightweight Apple laptop", ImageUrl = "/electro/img/product-3.png", Brand = "Apple", Featured = true, BestSeller = true, NewArrival = false, Discounted = true },
                new { Name = "Dell XPS 15", Price = 35990000m, OriginalPrice = 39990000m, Stock = 8, Category = "Laptop", Description = "High-end productivity laptop", ImageUrl = "/electro/img/product-4.png", Brand = "Dell", Featured = true, BestSeller = false, NewArrival = false, Discounted = true },
                new { Name = "AirPods Pro", Price = 5990000m, OriginalPrice = 6990000m, Stock = 25, Category = "Tai nghe", Description = "Wireless earbuds", ImageUrl = "/electro/img/product-5.png", Brand = "Apple", Featured = false, BestSeller = true, NewArrival = false, Discounted = true },
                new { Name = "iPad Pro 12.9", Price = 25990000m, OriginalPrice = 28990000m, Stock = 14, Category = "Tablet", Description = "Large tablet for professionals", ImageUrl = "/electro/img/product-7.png", Brand = "Apple", Featured = true, BestSeller = false, NewArrival = true, Discounted = true },
                new { Name = "Apple Watch Series 9", Price = 9990000m, OriginalPrice = 11990000m, Stock = 16, Category = "Đồng hồ thông minh", Description = "Premium smartwatch", ImageUrl = "/electro/img/product-8.png", Brand = "Apple", Featured = false, BestSeller = true, NewArrival = true, Discounted = true },
                new { Name = "Canon EOS R5", Price = 64990000m, OriginalPrice = 69990000m, Stock = 5, Category = "Máy ảnh", Description = "Professional mirrorless camera", ImageUrl = "/electro/img/product-9.png", Brand = "Canon", Featured = true, BestSeller = false, NewArrival = false, Discounted = true },
                new { Name = "Bose QuietComfort 45", Price = 8990000m, OriginalPrice = 9990000m, Stock = 14, Category = "Tai nghe", Description = "Noise-cancelling headphones", ImageUrl = "/electro/img/product-10.png", Brand = "Bose", Featured = false, BestSeller = true, NewArrival = false, Discounted = true },
                new { Name = "ASUS ROG Gaming", Price = 29990000m, OriginalPrice = 34990000m, Stock = 7, Category = "Laptop", Description = "Gaming laptop with RTX graphics", ImageUrl = "/electro/img/product-11.png", Brand = "ASUS", Featured = true, BestSeller = false, NewArrival = true, Discounted = true },
                new { Name = "JBL PartyBox 310", Price = 11990000m, OriginalPrice = 13990000m, Stock = 6, Category = "Tai nghe", Description = "Portable party speaker", ImageUrl = "/electro/img/product-12.png", Brand = "JBL", Featured = false, BestSeller = false, NewArrival = true, Discounted = true }
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
                var categoryId = categoryByName[seed.Category];
                var product = existingProducts.FirstOrDefault(p => p.Name == seed.Name);

                if (product == null && i < staleProducts.Count)
                {
                    product = staleProducts[i];
                }

                if (product == null && i < 5)
                {
                    product = await Products.FindAsync(i + 1);
                }

                if (product == null)
                {
                    product = new Product();
                    await Products.AddAsync(product);
                }

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
            Console.WriteLine("Electro catalog synchronized successfully");
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
            if (key is "accessories" or "phu kien" or "audio") return true;
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
                .Replace('đ', 'd')
                .Replace('Đ', 'D')
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

