using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;
using System;

namespace BaseCore.Libs
{
    /// <summary>
    /// Extension methods for IServiceCollection - Configure dependencies
    /// </summary>
    public static class ServiceCollectionExtensions
    {
        /// <summary>
        /// Initialize Swagger documentation
        /// </summary>
        public static void InitSwagger(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "BaseCore API",
                    Version = "v1",
                    Description = "BaseCore Microservices API"
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
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        new string[] { }
                    }
                });
            });
        }

        /// <summary>
        /// Initialize Authentication - Placeholder for auth configuration
        /// </summary>
        public static void InitAuthenticate(this IServiceCollection services, IConfiguration configuration)
        {
            // Authentication is configured elsewhere in Program.cs or Startup.cs
            // This method is kept for consistency with existing codebase
        }

        /// <summary>
        /// Initialize MongoDB - Kept for backward compatibility
        /// Note: Project is migrating to SQL Server
        /// </summary>
        public static void InitMongoDb(this IServiceCollection services, IConfiguration configuration)
        {
            // MongoDB initialization would go here if needed
            // For now, project is using SQL Server exclusively
            // Uncomment below if MongoDB is still required:

            /*
            var mongoConnectionString = configuration.GetConnectionString("MongoDB");
            if (!string.IsNullOrEmpty(mongoConnectionString))
            {
                var mongoSettings = MongoClientSettings.FromUrl(MongoUrl.Create(mongoConnectionString));
                var mongoClient = new MongoClient(mongoSettings);
                services.AddSingleton(mongoClient);
            }
            */
        }
    }
}
