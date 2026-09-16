using DetailingStore.Api.Models;

namespace DetailingStore.Api.Services
{
    public interface IKafkaProducerService
    {
        Task PublishChatMessageAsync(ChatMessage message);
    }
}
