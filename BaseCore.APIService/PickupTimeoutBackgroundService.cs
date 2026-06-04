using BaseCore.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace BaseCore.APIService
{
    public class PickupTimeoutBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<PickupTimeoutBackgroundService> _logger;

        public PickupTimeoutBackgroundService(IServiceProvider serviceProvider, ILogger<PickupTimeoutBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var orderService = scope.ServiceProvider.GetRequiredService<IOrderService>();
                    await orderService.AutoCancelExpiredPickupOrdersAsync(200);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Pickup timeout worker failed");
                }

                try
                {
                    await Task.Delay(TimeSpan.FromMinutes(15), stoppingToken);
                }
                catch
                {
                }
            }
        }
    }
}
