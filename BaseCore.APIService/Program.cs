using BaseCore.APIService.Extensions;
using BaseCore.APIService.Hubs;
using BaseCore.APIService.Validators;
using BaseCore.Repository;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

var dataProtectionKeysPath = Path.Combine(builder.Environment.ContentRootPath, ".data-protection-keys");
Directory.CreateDirectory(dataProtectionKeysPath);
builder.Services.AddDataProtection()
    .SetApplicationName("BaseCore.APIService")
    .PersistKeysToFileSystem(new DirectoryInfo(dataProtectionKeysPath));

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<CategoryUpsertDtoValidator>();
builder.Services.AddSignalR();

builder.Services.AddSwaggerDocs();
builder.Services.AddCorsPolicy(builder.Configuration, builder.Environment);
builder.Services.AddPersistence(builder.Configuration);
builder.Services.AddDomainServices();
builder.Services.AddJwtAuth(builder.Configuration);

var app = builder.Build();

app.UseApiExceptionHandler();

// Runtime must read/write only the configured SQL Server techstore database.
// Apply schema/data changes explicitly instead of seeding automatically on startup.
var autoMigrateOnStartup = builder.Configuration.GetValue("Database:AutoMigrateOnStartup", false);
if (autoMigrateOnStartup)
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    // Create database and apply migrations
    try
    {
        db.Database.Migrate();
        await db.SeedDataAsync();

        Console.WriteLine("Database migrated and seeded successfully");
    }
    catch (Exception ex)
    {
        Console.Error.WriteLine("Database migration/seed failed. Check DefaultConnection.");
        Console.Error.WriteLine(ex);
    }
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("CorsPolicy");
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<TechStoreChatHub>("/techstoreChatHub");

Console.WriteLine("BaseCore API Service running on port 5001 - Database mode");
Console.WriteLine("Endpoints: /api/products, /api/categories, /api/orders, /api/inventory, /api/warranty, /api/repairs, /api/tickets, /api/notifications, /api/coupons, /api/specs, /api/uploads, /api/recommendations");
app.Run();
