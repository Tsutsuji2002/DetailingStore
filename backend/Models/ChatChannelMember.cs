using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DetailingStore.Api.Models
{
    [Table("chat_channel_members")]
    public class ChatChannelMember
    {
        [Key]
        [Column("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [Column("channel_id")]
        public string ChannelId { get; set; } = string.Empty;

        [Required]
        [Column("user_id")]
        public string UserId { get; set; } = string.Empty;

        [Column("joined_at")]
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey(nameof(ChannelId))]
        public ChatChannel? Channel { get; set; }
    }
}
