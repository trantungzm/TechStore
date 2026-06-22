using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace BaseCore.APIService.Extensions;

public static class WebApplicationExtensions
{
    // Trả lỗi dạng ProblemDetails; chỉ lộ stack trace khi ở môi trường Development.
    public static WebApplication UseApiExceptionHandler(this WebApplication app)
    {
        app.UseExceptionHandler(errorApp =>
        {
            errorApp.Run(async context =>
            {
                var feature = context.Features.Get<IExceptionHandlerPathFeature>();
                var exception = feature?.Error;
                var statusCode = exception is InvalidOperationException ? StatusCodes.Status400BadRequest : StatusCodes.Status500InternalServerError;

                context.Response.StatusCode = statusCode;
                context.Response.ContentType = "application/problem+json";

                var problem = new ProblemDetails
                {
                    Status = statusCode,
                    Title = statusCode == StatusCodes.Status400BadRequest ? "Bad Request" : "Server Error",
                    Detail = app.Environment.IsDevelopment()
                        ? exception?.ToString()
                        : exception?.Message,
                    Instance = feature?.Path
                };
                problem.Extensions["traceId"] = context.TraceIdentifier;

                if (app.Environment.IsDevelopment())
                {
                    problem.Extensions["stackTrace"] = exception?.StackTrace;
                    problem.Extensions["innerException"] = exception?.InnerException?.ToString();
                }

                await context.Response.WriteAsJsonAsync(problem);
            });
        });
        return app;
    }
}
