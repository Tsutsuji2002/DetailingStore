using System;
using System.Text.Json.Serialization;

namespace DetailingStore.Api.Models
{
    public class PostLikeEntity
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid PostId { get; set; }
        
        [JsonIgnore]
        public PostEntity? Post { get; set; }

        public Guid? UserId { get; set; }
        
        [JsonIgnore]
        public User? User { get; set; }

        public string ClientId { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
