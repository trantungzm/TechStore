using Microsoft.EntityFrameworkCore;
using BaseCore.Entities;
using BaseCore.Common;
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
                entity.HasIndex(e => e.UserName).IsUnique();
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
                entity.Property(e => e.ImageUrl).HasMaxLength(500);
                entity.Property(e => e.WarrantyMonths).HasDefaultValue(12);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

                // Relationship with Category
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
                entity.HasOne(e => e.Warehouse).WithMany().HasForeignKey(e => e.WarehouseId).OnDelete(DeleteBehavior.SetNull);
                entity.HasOne(e => e.Order).WithMany().HasForeignKey(e => e.OrderId).OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.OrderDetail).WithMany().HasForeignKey(e => e.OrderDetailId).OnDelete(DeleteBehavior.NoAction);
            });

            modelBuilder.Entity<GoodsReceipt>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ReceiptCode).HasMaxLength(40).IsRequired();
                entity.Property(e => e.SupplierName).HasMaxLength(200).IsRequired();
                entity.Property(e => e.Note).HasMaxLength(1000);
                entity.Property(e => e.TotalCost).HasPrecision(18, 2);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.HasIndex(e => e.ReceiptCode).IsUnique();
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
                new Category { Id = 1, Name = "Electronics", Description = "Electronic devices and gadgets" },
                new Category { Id = 2, Name = "Clothing", Description = "Apparel and fashion items" },
                new Category { Id = 3, Name = "Books", Description = "Books and publications" },
                new Category { Id = 4, Name = "Home & Garden", Description = "Home and garden products" },
                new Category { Id = 5, Name = "Sports", Description = "Sports equipment and accessories" },
                new Category { Id = 6, Name = "Tablet", Description = "May tinh bang" },
                new Category { Id = 7, Name = "Tai nghe", Description = "Tai nghe va thiet bi am thanh" },
                new Category { Id = 8, Name = "Dong ho thong minh", Description = "Smartwatch" },
                new Category { Id = 9, Name = "May anh", Description = "May anh va camera" }
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
                new Product { Id = 1, Name = "Laptop Dell XPS 15", Price = 35000000, Stock = 10, CategoryId = 1, Description = "High-performance laptop", ImageUrl = "" },
                new Product { Id = 2, Name = "iPhone 15 Pro", Price = 28000000, Stock = 15, CategoryId = 1, Description = "Latest Apple smartphone", ImageUrl = "" },
                new Product { Id = 3, Name = "T-Shirt Cotton", Price = 250000, Stock = 100, CategoryId = 2, Description = "Comfortable cotton t-shirt", ImageUrl = "" },
                new Product { Id = 4, Name = "Programming Book", Price = 450000, Stock = 50, CategoryId = 3, Description = "Learn programming basics", ImageUrl = "" },
                new Product { Id = 5, Name = "Garden Tools Set", Price = 850000, Stock = 25, CategoryId = 4, Description = "Complete gardening toolkit", ImageUrl = "" }
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
                new SpecDefinition { Id = 18, CategoryId = 6, Name = "Kích thước màn hình", Code = "screenSize", DataType = "text", SortOrder = 1, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 19, CategoryId = 6, Name = "Chipset", Code = "chipset", DataType = "text", SortOrder = 2, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 20, CategoryId = 6, Name = "RAM", Code = "ram", DataType = "text", SortOrder = 3, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 21, CategoryId = 6, Name = "Bộ nhớ trong", Code = "internalStorage", DataType = "text", SortOrder = 4, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 22, CategoryId = 6, Name = "Pin", Code = "battery", DataType = "text", SortOrder = 5, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 23, CategoryId = 6, Name = "Camera trước", Code = "frontCamera", DataType = "text", SortOrder = 6, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 24, CategoryId = 6, Name = "Camera sau", Code = "rearCamera", DataType = "text", SortOrder = 7, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 25, CategoryId = 7, Name = "Loại tai nghe", Code = "headphoneType", DataType = "text", SortOrder = 1, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 26, CategoryId = 7, Name = "Công nghệ âm thanh", Code = "audioTechnology", DataType = "text", SortOrder = 2, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 27, CategoryId = 7, Name = "Micro", Code = "microphone", DataType = "text", SortOrder = 3, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 28, CategoryId = 7, Name = "Kết nối", Code = "connection", DataType = "text", SortOrder = 4, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 29, CategoryId = 7, Name = "Thời lượng pin", Code = "batteryLife", DataType = "text", SortOrder = 5, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 30, CategoryId = 7, Name = "Chống ồn", Code = "noiseCancellation", DataType = "text", SortOrder = 6, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 31, CategoryId = 8, Name = "Công nghệ màn hình", Code = "screenTechnology", DataType = "text", SortOrder = 1, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 32, CategoryId = 8, Name = "Kích thước màn hình", Code = "screenSize", DataType = "text", SortOrder = 2, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 33, CategoryId = 8, Name = "Nghe gọi", Code = "calling", DataType = "text", SortOrder = 3, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 34, CategoryId = 8, Name = "Tiện ích sức khỏe", Code = "healthFeatures", DataType = "text", SortOrder = 4, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 35, CategoryId = 8, Name = "Thời lượng pin", Code = "batteryLife", DataType = "text", SortOrder = 5, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 36, CategoryId = 8, Name = "Chống nước", Code = "waterResistance", DataType = "text", SortOrder = 6, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 37, CategoryId = 9, Name = "Dòng camera", Code = "cameraLine", DataType = "text", SortOrder = 1, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 38, CategoryId = 9, Name = "Độ phân giải", Code = "resolution", DataType = "text", SortOrder = 2, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 39, CategoryId = 9, Name = "Góc ống kính", Code = "lensAngle", DataType = "text", SortOrder = 3, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 40, CategoryId = 9, Name = "Chống rung", Code = "stabilization", DataType = "text", SortOrder = 4, IsComparable = true, CreatedAt = seedTime },
                new SpecDefinition { Id = 41, CategoryId = 9, Name = "Kết nối không dây", Code = "wirelessConnection", DataType = "text", SortOrder = 5, IsComparable = true, CreatedAt = seedTime }
            );
        }

        /// <summary>
        /// Seed default admin user and data to SQL Server
        /// Called during application startup
        /// </summary>
        public async Task SeedDataAsync()
        {
            // Seed Categories
            var categoriesExist = Categories.Any();
            if (!categoriesExist)
            {
                var categories = new[]
                {
                    new Category { Id = 1, Name = "Electronics", Description = "Electronic devices and gadgets" },
                    new Category { Id = 2, Name = "Clothing", Description = "Apparel and fashion items" },
                    new Category { Id = 3, Name = "Books", Description = "Books and publications" },
                    new Category { Id = 4, Name = "Home & Garden", Description = "Home and garden products" },
                    new Category { Id = 5, Name = "Sports", Description = "Sports equipment and accessories" }
                };
                
                await Categories.AddRangeAsync(categories);
                await SaveChangesAsync();
                Console.WriteLine("✓ Categories seeded successfully");
            }

            // Seed Products
            var productsExist = Products.Any();
            if (!productsExist)
            {
                var products = new[]
                {
                    new Product { Id = 1, Name = "Laptop Dell XPS 15", Price = 35000000, Stock = 10, CategoryId = 1, Description = "High-performance laptop", ImageUrl = "" },
                    new Product { Id = 2, Name = "iPhone 15 Pro", Price = 28000000, Stock = 15, CategoryId = 1, Description = "Latest Apple smartphone", ImageUrl = "" },
                    new Product { Id = 3, Name = "T-Shirt Cotton", Price = 250000, Stock = 100, CategoryId = 2, Description = "Comfortable cotton t-shirt", ImageUrl = "" },
                    new Product { Id = 4, Name = "Programming Book", Price = 450000, Stock = 50, CategoryId = 3, Description = "Learn programming basics", ImageUrl = "" },
                    new Product { Id = 5, Name = "Garden Tools Set", Price = 850000, Stock = 25, CategoryId = 4, Description = "Complete gardening toolkit", ImageUrl = "" }
                };
                
                await Products.AddRangeAsync(products);
                await SaveChangesAsync();
                Console.WriteLine("✓ Products seeded successfully");
            }

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
                    Name = "Administrator",
                    Email = "admin@basecore.com",
                    Phone = "0123456789",
                    Position = "Admin",
                    IsActive = true,
                    UserType = 1,
                    Created = DateTime.Now
                };

                Users.Add(adminUser);
                await SaveChangesAsync();
                Console.WriteLine("✓ Admin user seeded successfully");
            }
        }
    }
}

