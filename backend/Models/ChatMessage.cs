using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DetailingStore.Api.Models
{
    [Table("chat_messages")]
    public class ChatMessage
    {
        [Key]
        [Column("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [Column("channel_id")]
        public string ChannelId { get; set; } = string.Empty;

        [Required]
        [Column("sender_id")]
        public string SenderId { get; set; } = string.Empty;

        [Column("sender_name")]
        public string SenderName { get; set; } = string.Empty;

        [Column("sender_avatar")]
        public string? SenderAvatar { get; set; }

        [Column("sender_role")]
        public string? SenderRole { get; set; }

        [Required]
        [Column("content")]
        public string Content { get; set; } = string.Empty;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
