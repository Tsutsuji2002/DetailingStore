using Microsoft.AspNetCore.SignalR;

namespace DetailingStore.Api.Hubs
{
    public class ChatHub : Hub
    {
        private readonly ILogger<ChatHub> _logger;

        public ChatHub(ILogger<ChatHub> logger)
        {
            _logger = logger;
        }

        public async Task JoinChannel(string channelId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, channelId);
            _logger.LogInformation("Client {ConnectionId} joined channel group {ChannelId}", Context.ConnectionId, channelId);
        }

        public async Task LeaveChannel(string channelId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, channelId);
            _logger.LogInformation("Client {ConnectionId} left channel group {ChannelId}", Context.ConnectionId, channelId);
        }
    }
}
