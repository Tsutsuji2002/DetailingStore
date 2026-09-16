using System;
using System.Collections.Generic;

namespace DetailingStore.Api.Models
{
    public class PostEntity
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Excerpt { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string CoverImage { get; set; } = string.Empty;
        public string MediaType { get; set; } = "image"; // "image", "video", "text"
        public List<string> Tags { get; set; } = new();
        public ICollection<PostLikeEntity> PostLikes { get; set; } = new List<PostLikeEntity>();


        public int CommentCount { get; set; } = 0;
        public bool IsPublished { get; set; } = true;
        public Guid? AuthorId { get; set; }
        public User? Author { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
