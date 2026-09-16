using System.Text.Json;
using Confluent.Kafka;
using DetailingStore.Api.Models;

namespace DetailingStore.Api.Services
{
    public class KafkaProducerService : IKafkaProducerService, IDisposable
    {
        private readonly IProducer<string, string>? _producer;
        private readonly ILogger<KafkaProducerService> _logger;
        private readonly string _topic = "staff-chat-messages";
        private readonly bool _isEnabled;

        public KafkaProducerService(IConfiguration configuration, ILogger<KafkaProducerService> logger)
        {
            _logger = logger;
            var bootstrapServers = configuration["Kafka:BootstrapServers"] ?? "localhost:9092";

            try
            {
                var config = new ProducerConfig
                {
                    BootstrapServers = bootstrapServers,
                    MessageSendMaxRetries = 2,
                    RetryBackoffMs = 500,
                    SocketTimeoutMs = 3000,
                    MessageTimeoutMs = 3000
                };

                _producer = new ProducerBuilder<string, string>(config).Build();
                _isEnabled = true;
                _logger.LogInformation("KafkaProducerService connected to {Servers}", bootstrapServers);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not initialize Kafka Producer on {Servers}. Falling back to in-app messaging.", bootstrapServers);
                _isEnabled = false;
            }
        }

        public async Task PublishChatMessageAsync(ChatMessage message)
        {
            if (!_isEnabled || _producer == null)
            {
                _logger.LogInformation("Kafka Producer is disabled or offline. Skipping Kafka event publish for message {Id}", message.Id);
                return;
            }

            try
            {
                var payload = JsonSerializer.Serialize(message);
                var kafkaMsg = new Message<string, string>
                {
                    Key = message.ChannelId, // Partition by channel ID for sequential ordering per channel
                    Value = payload
                };

                var result = await _producer.ProduceAsync(_topic, kafkaMsg);
                _logger.LogInformation("Published ChatMessage {Id} to Kafka topic {Topic} [Partition: {Partition}, Offset: {Offset}]",
                    message.Id, _topic, result.Partition.Value, result.Offset.Value);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to publish ChatMessage {Id} to Kafka", message.Id);
            }
        }

        public void Dispose()
        {
            _producer?.Dispose();
        }
    }
}
