using System.Net.Sockets;
using System.Text.Json;
using Confluent.Kafka;
using DetailingStore.Api.Hubs;
using DetailingStore.Api.Models;
using Microsoft.AspNetCore.SignalR;

namespace DetailingStore.Api.Services
{
    public class KafkaChatConsumerService : BackgroundService
    {
        private readonly ILogger<KafkaChatConsumerService> _logger;
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly string _bootstrapServers;
        private readonly string _topic = "staff-chat-messages";
        private readonly string _groupId = "detailing-staff-chat-group";

        public KafkaChatConsumerService(
            IConfiguration configuration,
            ILogger<KafkaChatConsumerService> logger,
            IHubContext<ChatHub> hubContext)
        {
            _logger = logger;
            _hubContext = hubContext;
            _bootstrapServers = configuration["Kafka:BootstrapServers"] ?? "localhost:9092";
        }

        private static bool IsKafkaReachable(string bootstrapServers)
        {
            try
            {
                var parts = bootstrapServers.Split(':');
                var host = parts[0];
                var port = parts.Length > 1 && int.TryParse(parts[1], out var p) ? p : 9092;

                using var client = new TcpClient();
                var result = client.BeginConnect(host, port, null, null);
                var success = result.AsyncWaitHandle.WaitOne(TimeSpan.FromSeconds(1));
                if (success && client.Connected)
                {
                    client.EndConnect(result);
                    return true;
                }
            }
            catch
            {
                // Ignored - Kafka broker not running locally
            }
            return false;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await Task.Yield();

            // Quick non-blocking check to avoid Librdkafka background log spam when Kafka is offline in local dev
            if (!IsKafkaReachable(_bootstrapServers))
            {
                _logger.LogInformation("Kafka broker ({Servers}) is offline. Skipping Kafka background consumer loop.", _bootstrapServers);
                return;
            }

            var config = new ConsumerConfig
            {
                BootstrapServers = _bootstrapServers,
                GroupId = _groupId,
                AutoOffsetReset = AutoOffsetReset.Latest,
                EnableAutoCommit = true,
                SocketTimeoutMs = 3000
            };

            try
            {
                using var consumer = new ConsumerBuilder<string, string>(config)
                    .SetErrorHandler((_, e) =>
                    {
                        if (e.IsFatal)
                        {
                            _logger.LogWarning("Kafka Consumer fatal error: {Reason}", e.Reason);
                        }
                    })
                    .Build();

                consumer.Subscribe(_topic);
                _logger.LogInformation("KafkaChatConsumerService connected and listening on topic {Topic}", _topic);

                while (!stoppingToken.IsCancellationRequested)
                {
                    try
                    {
                        var consumeResult = consumer.Consume(TimeSpan.FromMilliseconds(1000));
                        if (consumeResult != null && !string.IsNullOrWhiteSpace(consumeResult.Message?.Value))
                        {
                            var chatMsg = JsonSerializer.Deserialize<ChatMessage>(consumeResult.Message.Value);
                            if (chatMsg != null)
                            {
                                _logger.LogInformation("Consumed message {Id} from Kafka. Broadcasting to SignalR channel group {ChannelId}",
                                    chatMsg.Id, chatMsg.ChannelId);

                                await _hubContext.Clients.Group(chatMsg.ChannelId).SendAsync("ReceiveMessage", chatMsg, stoppingToken);
                            }
                        }
                    }
                    catch (ConsumeException ex)
                    {
                        _logger.LogWarning("Kafka consume error: {Reason}", ex.Error.Reason);
                        await Task.Delay(2000, stoppingToken);
                    }
                    catch (OperationCanceledException)
                    {
                        break;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Unexpected error in KafkaChatConsumerService loop");
                        await Task.Delay(2000, stoppingToken);
                    }
                }

                consumer.Close();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Kafka Consumer could not connect to {Servers}.", _bootstrapServers);
            }
        }
    }
}
