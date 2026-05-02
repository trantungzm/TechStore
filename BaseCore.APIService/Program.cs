using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using BaseCore.APIService.Demo;
using BaseCore.APIService.Validators;
using BaseCore.Repository;
using BaseCore.Repository.EFCore;
using BaseCore.Services;
using System.Text;
using FluentValidation;
using FluentValidation.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<CategoryUpsertDtoValidator>();

builder.Services.AddEndpointsApiExplorer();

// Swagger Configuration
builder.Services.AddSwaggerGen(c =>
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

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        var origin = builder.Configuration["Cors:WithOrigin"];
        if (builder.Environment.IsDevelopment() || string.IsNullOrWhiteSpace(origin))
        {
            policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
            return;
        }

        policy.WithOrigins(origin).AllowAnyMethod().AllowAnyHeader();
    });
});

var useDemoMode = builder.Configuration.GetValue<bool?>("DemoMode:Enabled") ?? true;

if (useDemoMode)
{
    builder.Services.AddSingleton<DemoStore>();
    builder.Services.AddSingleton<IProductRepositoryEF, DemoProductRepository>();
    builder.Services.AddSingleton<ICategoryRepositoryEF, DemoCategoryRepository>();
    builder.Services.AddSingleton<IOrderRepositoryEF, DemoOrderRepository>();
    builder.Services.AddSingleton<IOrderDetailRepositoryEF, DemoOrderDetailRepository>();

    builder.Services.AddSingleton<IProductService, ProductService>();
    builder.Services.AddSingleton<ICategoryService, CategoryService>();
    builder.Services.AddSingleton<IOrderService, OrderService>();
}
else
{
    builder.Services.AddDbContext<AppDbContext>(options =>
    {
        options.UseSqlServer(builder.Configuration.GetConnectionString("ConnectedDb"));
    });

    builder.Services.AddScoped<IProductRepositoryEF, ProductRepositoryEF>();
    builder.Services.AddScoped<ICategoryRepositoryEF, CategoryRepositoryEF>();
    builder.Services.AddScoped<IOrderRepositoryEF, OrderRepositoryEF>();
    builder.Services.AddScoped<IOrderDetailRepositoryEF, OrderDetailRepositoryEF>();

    builder.Services.AddScoped<IProductService, ProductService>();
    builder.Services.AddScoped<ICategoryService, CategoryService>();
    builder.Services.AddScoped<IOrderService, OrderService>();
}

// JWT Authentication
var key = Encoding.ASCII.GetBytes(builder.Configuration["Jwt:SecretKey"] ?? "YourSecretKeyForAuthenticationShouldBeLongEnough");
var issuer = builder.Configuration["Jwt:Issuer"];
var audience = builder.Configuration["Jwt:Audience"];
builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
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

var app = builder.Build();

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var feature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerPathFeature>();
        var exception = feature?.Error;
        var statusCode = exception is InvalidOperationException ? StatusCodes.Status400BadRequest : StatusCodes.Status500InternalServerError;

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/problem+json";

        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title = statusCode == StatusCodes.Status400BadRequest ? "Bad Request" : "Server Error",
            Detail = exception?.Message,
            Instance = feature?.Path
        };
        problem.Extensions["traceId"] = context.TraceIdentifier;

        await context.Response.WriteAsJsonAsync(problem);
    });
});

// Auto migrate database when not in demo mode
if (!useDemoMode)
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    
    // Create database and apply migrations
    db.Database.Migrate();
    
    // Seed initial data
    db.SeedDataAsync().GetAwaiter().GetResult();
    
    Console.WriteLine("✓ Database migrated and seeded successfully");
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("CorsPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

Console.WriteLine($"BaseCore API Service running on port 5001 - DemoMode: {useDemoMode}");
Console.WriteLine("Endpoints: /api/products, /api/categories, /api/orders");
app.Run();
