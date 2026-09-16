using DetailingStore.Api.Data;
using DetailingStore.Api.Hubs;
using DetailingStore.Api.Models;
using DetailingStore.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace DetailingStore.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IKafkaProducerService _kafkaProducer;
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly ILogger<ChatController> _logger;

        public ChatController(
            AppDbContext context,
            IKafkaProducerService kafkaProducer,
            IHubContext<ChatHub> hubContext,
            ILogger<ChatController> logger)
        {
            _context = context;
            _kafkaProducer = kafkaProducer;
            _hubContext = hubContext;
            _logger = logger;
        }

        // GET: /api/chat/channels?userId={userId}
        [HttpGet("channels")]
        public async Task<IActionResult> GetChannels([FromQuery] string? userId)
        {
            var query = _context.ChatChannels
                .Include(c => c.Members)
                .Where(c => c.IsActive);

            if (!string.IsNullOrWhiteSpace(userId))
            {
                // Show public channels OR channels where user is a member OR creator
                query = query.Where(c => c.IsPublic || c.CreatorId == userId || c.Members.Any(m => m.UserId == userId));
            }
            else
            {
                // Default: show public channels only
                query = query.Where(c => c.IsPublic);
            }

            var channels = await query
                .OrderByDescending(c => c.IsPublic)
                .ThenBy(c => c.CreatedAt)
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.Description,
                    c.IsPublic,
                    c.IsDirect,
                    c.CreatorId,
                    c.CreatedAt,
                    MemberIds = c.Members.Select(m => m.UserId).ToList()
                })
                .ToListAsync();

            return Ok(channels);
        }

        public class CreateChannelDto
        {
            public string Name { get; set; } = string.Empty;
            public string? Description { get; set; }
            public string CreatorId { get; set; } = string.Empty;
            public List<string> MemberIds { get; set; } = new List<string>();
        }

        // POST: /api/chat/channels (Admin creates a new group channel)
        [HttpPost("channels")]
        public async Task<IActionResult> CreateChannel([FromBody] CreateChannelDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest("Tên kênh không được để trống.");
            }

            var slug = dto.Name.Trim().ToLower().Replace(" ", "-");
            if (!slug.StartsWith("#"))
            {
                slug = slug.Replace("#", "");
            }

            var channel = new ChatChannel
            {
                Id = "ch_" + Guid.NewGuid().ToString("N")[..8],
                Name = slug,
                Description = dto.Description,
                IsPublic = false,
                IsDirect = false,
                CreatorId = dto.CreatorId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.ChatChannels.Add(channel);

            // Add Creator and initial MemberIds to ChatChannelMembers
            var membersToAdd = new HashSet<string>(dto.MemberIds ?? new List<string>());
            if (!string.IsNullOrWhiteSpace(dto.CreatorId))
            {
                membersToAdd.Add(dto.CreatorId);
            }

            foreach (var mId in membersToAdd)
            {
                _context.ChatChannelMembers.Add(new ChatChannelMember
                {
                    ChannelId = channel.Id,
                    UserId = mId,
                    JoinedAt = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                channel.Id,
                channel.Name,
                channel.Description,
                channel.IsPublic,
                channel.IsDirect,
                channel.CreatorId,
                channel.CreatedAt,
                MemberIds = membersToAdd.ToList()
            });
        }

        public class CreateDirectDto
        {
            public string UserId1 { get; set; } = string.Empty;
            public string UserId2 { get; set; } = string.Empty;
        }

        // POST: /api/chat/direct (Get or Create 1-on-1 DM channel between 2 staff members)
        [HttpPost("direct")]
        public async Task<IActionResult> GetOrCreateDirectChannel([FromBody] CreateDirectDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.UserId1) || string.IsNullOrWhiteSpace(dto.UserId2))
            {
                return BadRequest("UserId1 và UserId2 là bắt buộc.");
            }

            // Find existing direct channel with members UserId1 & UserId2
            var existingChannel = await _context.ChatChannels
                .Include(c => c.Members)
                .Where(c => c.IsDirect && c.IsActive &&
                            c.Members.Any(m => m.UserId == dto.UserId1) &&
                            c.Members.Any(m => m.UserId == dto.UserId2))
                .FirstOrDefaultAsync();

            if (existingChannel != null)
            {
                return Ok(new
                {
                    existingChannel.Id,
                    existingChannel.Name,
                    existingChannel.Description,
                    existingChannel.IsPublic,
                    existingChannel.IsDirect,
                    existingChannel.CreatorId,
                    existingChannel.CreatedAt,
                    MemberIds = existingChannel.Members.Select(m => m.UserId).ToList()
                });
            }

            // Create new direct channel
            var newChannel = new ChatChannel
            {
                Id = "dm_" + Guid.NewGuid().ToString("N")[..8],
                Name = $"dm_{dto.UserId1}_{dto.UserId2}",
                Description = "Trò chuyện trực tiếp 1-1",
                IsPublic = false,
                IsDirect = true,
                CreatorId = dto.UserId1,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.ChatChannels.Add(newChannel);

            _context.ChatChannelMembers.Add(new ChatChannelMember
            {
                ChannelId = newChannel.Id,
                UserId = dto.UserId1,
                JoinedAt = DateTime.UtcNow
            });

            _context.ChatChannelMembers.Add(new ChatChannelMember
            {
                ChannelId = newChannel.Id,
                UserId = dto.UserId2,
                JoinedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            return Ok(new
            {
                newChannel.Id,
                newChannel.Name,
                newChannel.Description,
                newChannel.IsPublic,
                newChannel.IsDirect,
                newChannel.CreatorId,
                newChannel.CreatedAt,
                MemberIds = new List<string> { dto.UserId1, dto.UserId2 }
            });
        }

        // GET: /api/chat/channels/{channelId}/messages
        [HttpGet("channels/{channelId}/messages")]
        public async Task<IActionResult> GetChannelMessages(string channelId, [FromQuery] int limit = 50)
        {
            var messages = await _context.ChatMessages
                .Where(m => m.ChannelId == channelId)
                .OrderBy(m => m.CreatedAt)
                .Take(limit)
                .ToListAsync();

            return Ok(messages);
        }

        public class CreateMessageDto
        {
            public string ChannelId { get; set; } = string.Empty;
            public string SenderId { get; set; } = string.Empty;
            public string SenderName { get; set; } = string.Empty;
            public string? SenderAvatar { get; set; }
            public string? SenderRole { get; set; }
            public string Content { get; set; } = string.Empty;
        }

        // POST: /api/chat/messages
        [HttpPost("messages")]
        public async Task<IActionResult> SendMessage([FromBody] CreateMessageDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.ChannelId) || string.IsNullOrWhiteSpace(dto.Content))
            {
                return BadRequest("ChannelId và Content là bắt buộc.");
            }

            var message = new ChatMessage
            {
                Id = "msg_" + Guid.NewGuid().ToString("N")[..12],
                ChannelId = dto.ChannelId,
                SenderId = dto.SenderId,
                SenderName = dto.SenderName,
                SenderAvatar = dto.SenderAvatar,
                SenderRole = dto.SenderRole,
                Content = dto.Content,
                CreatedAt = DateTime.UtcNow
            };

            // 1. Save to PostgreSQL DB
            _context.ChatMessages.Add(message);
            await _context.SaveChangesAsync();

            // 2. Publish event to Kafka
            await _kafkaProducer.PublishChatMessageAsync(message);

            // 3. Broadcast via SignalR to connected clients in channel group
            await _hubContext.Clients.Group(dto.ChannelId).SendAsync("ReceiveMessage", message);

            return Ok(message);
        }
    }
}
