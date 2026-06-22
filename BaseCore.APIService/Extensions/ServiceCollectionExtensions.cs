using BaseCore.APIService;
using BaseCore.Repository;
using BaseCore.Repository.EFCore;
using BaseCore.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

namespace BaseCore.APIService.Extensions;

/// <summary>
/// Gom các khối đăng ký DI / cấu hình ra khỏi Program.cs để file khởi động gọn, dễ đọc.
/// </summary>
public static class ServiceCollectionExtensions
{
    // DbContext + toàn bộ repository EF Core.
    public static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
        {
            var sqlConnectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection chưa được cấu hình (appsettings).");
            options.UseSqlServer(sqlConnectionString);
        });

        services.AddScoped<IProductRepositoryEF, ProductRepositoryEF>();
        services.AddScoped<IProductVariantRepositoryEF, ProductVariantRepositoryEF>();
        services.AddScoped<ICategoryRepositoryEF, CategoryRepositoryEF>();
        services.AddScoped<IOrderRepositoryEF, OrderRepositoryEF>();
        services.AddScoped<IOrderDetailRepositoryEF, OrderDetailRepositoryEF>();
        services.AddScoped<IOrderTimelineRepositoryEF, OrderTimelineRepositoryEF>();
        services.AddScoped<IOrderCancellationRepositoryEF, OrderCancellationRepositoryEF>();
        services.AddScoped<IWarehouseRepositoryEF, WarehouseRepositoryEF>();
        services.AddScoped<ISupplierRepositoryEF, SupplierRepositoryEF>();
        services.AddScoped<ICategorySupplierRepositoryEF, CategorySupplierRepositoryEF>();
        services.AddScoped<IStockItemRepositoryEF, StockItemRepositoryEF>();
        services.AddScoped<IGoodsReceiptRepositoryEF, GoodsReceiptRepositoryEF>();
        services.AddScoped<IGoodsReceiptLineRepositoryEF, GoodsReceiptLineRepositoryEF>();
        services.AddScoped<IGoodsReceiptSerialRepositoryEF, GoodsReceiptSerialRepositoryEF>();
        services.AddScoped<IStockMovementRepositoryEF, StockMovementRepositoryEF>();
        services.AddScoped<IInventoryReturnRepositoryEF, InventoryReturnRepositoryEF>();
        services.AddScoped<IOrderDetailStockItemRepositoryEF, OrderDetailStockItemRepositoryEF>();
        services.AddScoped<IInventoryTransactionRepositoryEF, InventoryTransactionRepositoryEF>();
        services.AddScoped<IWarrantyRecordRepositoryEF, WarrantyRecordRepositoryEF>();
        services.AddScoped<IWarrantyClaimRepositoryEF, WarrantyClaimRepositoryEF>();
        services.AddScoped<IWarrantyClaimUpdateRepositoryEF, WarrantyClaimUpdateRepositoryEF>();
        services.AddScoped<IRepairCaseRepositoryEF, RepairCaseRepositoryEF>();
        services.AddScoped<IRepairUpdateRepositoryEF, RepairUpdateRepositoryEF>();
        services.AddScoped<ISupportTicketRepositoryEF, SupportTicketRepositoryEF>();
        services.AddScoped<ISupportTicketUpdateRepositoryEF, SupportTicketUpdateRepositoryEF>();
        services.AddScoped<IUserRepositoryEF, UserRepositoryEF>();
        services.AddScoped<INotificationRepositoryEF, NotificationRepositoryEF>();
        services.AddScoped<IAttachmentRepositoryEF, AttachmentRepositoryEF>();
        services.AddScoped<ICouponRepositoryEF, CouponRepositoryEF>();
        services.AddScoped<ICouponScopeRepositoryEF, CouponScopeRepositoryEF>();
        services.AddScoped<IUserCouponRepositoryEF, UserCouponRepositoryEF>();
        services.AddScoped<IOrderCouponRepositoryEF, OrderCouponRepositoryEF>();
        services.AddScoped<IVoucherSpinRepositoryEF, VoucherSpinRepositoryEF>();
        return services;
    }

    // Service nghiệp vụ + background service.
    public static IServiceCollection AddDomainServices(this IServiceCollection services)
    {
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IWarrantyService, WarrantyService>();
        services.AddScoped<IRepairService, RepairService>();
        services.AddScoped<ITicketService, TicketService>();
        services.AddScoped<ICouponService, CouponService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<IInventoryService, InventoryService>();
        services.AddScoped<IBrandService, BrandService>();
        services.AddScoped<IBannerService, BannerService>();
        services.AddHostedService<PickupTimeoutBackgroundService>();
        return services;
    }

    // Swagger + JWT bearer security definition.
    public static IServiceCollection AddSwaggerDocs(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "BaseCore API Service",
                Version = "v1",
                Description = "Business Logic Microservice - Products, Categories, Orders (Bài 10, 11)"
            });
            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                In = ParameterLocation.Header,
                Description = "Please enter JWT token",
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                BearerFormat = "JWT",
                Scheme = "bearer"
            });
            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                    },
                    Array.Empty<string>()
                }
            });
        });
        return services;
    }

    public static IServiceCollection AddCorsPolicy(this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
    {
        services.AddCors(options =>
        {
            options.AddPolicy("CorsPolicy", policy =>
            {
                var origin = configuration["Cors:WithOrigin"];
                if (environment.IsDevelopment() || string.IsNullOrWhiteSpace(origin))
                {
                    policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
                    return;
                }

                policy.WithOrigins(origin).AllowAnyMethod().AllowAnyHeader();
            });
        });
        return services;
    }

    public static IServiceCollection AddJwtAuth(this IServiceCollection services, IConfiguration configuration)
    {
        var key = Encoding.ASCII.GetBytes(configuration["Jwt:SecretKey"]
            ?? throw new InvalidOperationException("Jwt:SecretKey chưa được cấu hình (appsettings)."));
        var issuer = configuration["Jwt:Issuer"];
        var audience = configuration["Jwt:Audience"];
        services.AddAuthentication(x =>
        {
            x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(x =>
        {
            x.RequireHttpsMetadata = false;
            x.SaveToken = true;
            x.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    var accessToken = context.Request.Query["access_token"];
                    var path = context.HttpContext.Request.Path;
                    if (!string.IsNullOrWhiteSpace(accessToken) && path.StartsWithSegments("/techstoreChatHub"))
                    {
                        context.Token = accessToken;
                    }
                    return Task.CompletedTask;
                }
            };
            x.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = !string.IsNullOrWhiteSpace(issuer),
                ValidIssuer = issuer,
                ValidateAudience = !string.IsNullOrWhiteSpace(audience),
                ValidAudience = audience
            };
        });
        return services;
    }
}
