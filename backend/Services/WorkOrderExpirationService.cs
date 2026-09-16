using DetailingStore.Api.Data;
using DetailingStore.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DetailingStore.Api.Services
{
    public class WorkOrderExpirationService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<WorkOrderExpirationService> _logger;

        public WorkOrderExpirationService(
            IServiceProvider serviceProvider,
            ILogger<WorkOrderExpirationService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("WorkOrderExpirationService started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ExpireOverdueWorkOrdersAsync(stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    // Graceful shutdown — exit loop
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Unhandled error in WorkOrderExpirationService. Will retry in 5 minutes.");
                }

                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }

            _logger.LogInformation("WorkOrderExpirationService stopped.");
        }

        private async Task ExpireOverdueWorkOrdersAsync(CancellationToken stoppingToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var now = DateTime.UtcNow;

            var expirableStatuses = new[]
            {
                WorkOrderStatus.Pending,
                WorkOrderStatus.Accepted,
                WorkOrderStatus.InProgress
            };

            var overdueOrders = await dbContext.WorkOrders
                .Where(wo => wo.ScheduledEndTime < now && expirableStatuses.Contains(wo.WorkOrderStatus))
                .ToListAsync(stoppingToken);

            if (overdueOrders.Count == 0)
            {
                _logger.LogDebug("No overdue work orders found at {Time}.", now);
                return;
            }

            foreach (var order in overdueOrders)
            {
                var previousStatus = order.WorkOrderStatus;
                order.WorkOrderStatus = WorkOrderStatus.Expired;
                _logger.LogInformation(
                    "Work order {WorkOrderId} expired. ScheduledEndTime: {EndTime}, PreviousStatus: {PreviousStatus}.",
                    order.Id,
                    order.ScheduledEndTime,
                    previousStatus);
            }

            await dbContext.SaveChangesAsync(stoppingToken);

            _logger.LogInformation("Expired {Count} work order(s) at {Time}.", overdueOrders.Count, now);
        }
    }
}
