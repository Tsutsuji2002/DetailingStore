using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DetailingStore.Api.Models
{
    [Table("chat_channels")]
    public class ChatChannel
    {
        [Key]
        [Column("id")]
        public string Id { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [MaxLength(255)]
        [Column("description")]
        public string? Description { get; set; }

        [Column("is_public")]
        public bool IsPublic { get; set; } = false;

        [Column("is_direct")]
        public bool IsDirect { get; set; } = false;

        [Column("creator_id")]
        public string? CreatorId { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<ChatChannelMember> Members { get; set; } = new List<ChatChannelMember>();
    }
}
