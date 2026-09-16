using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DetailingStore.Api.Models
{
    /// <summary>
    /// Defines the type of content that a banner can link to.
    /// </summary>
    public enum LinkType
    {
        /// <summary>
        /// No link - banner is display-only and non-clickable.
        /// </summary>
        None,

        /// <summary>
        /// Links to a service detail page (/services/{slug}).
        /// </summary>
        Service,

        /// <summary>
        /// Links to a product detail page (/products/{slug}).
        /// </summary>
        Product,

        /// <summary>
        /// Links to a post detail page (/posts/{slug}).
        /// </summary>
        Post
    }
    [Table("site_contents")]
    public class SiteContent
    {
        [Key]
        [Column("id")]
        public int Id { get; set; } = 1;

        [Required]
        [MaxLength(100)]
        [Column("shop_name")]
        public string ShopName { get; set; } = "Detailing Store";

        [MaxLength(255)]
        [Column("tagline")]
        public string Tagline { get; set; } = "Chăm Sóc Xe Máy Chuyên Nghiệp – Đẳng Cấp Sài Gòn";

        [Column("logo_url")]
        public string? LogoUrl { get; set; }

        [MaxLength(50)]
        [Column("logo_icon")]
        public string LogoIcon { get; set; } = "🏍️";

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    [Table("hero_slides")]
    public class HeroSlide
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("tag")]
        public string Tag { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        [Column("title")]
        public string Title { get; set; } = string.Empty;

        [Column("description")]
        public string Description { get; set; } = string.Empty;

        [Column("image_url")]
        public string ImageUrl { get; set; } = string.Empty;

        [Column("sort_order")]
        public int SortOrder { get; set; } = 0;

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Link configuration fields
        [Column("link_type")]
        [MaxLength(20)]
        public LinkType LinkType { get; set; } = LinkType.None;

        [Column("linked_content_id")]
        public Guid? LinkedContentId { get; set; }

        [Column("linked_content_slug")]
        [MaxLength(150)]
        public string? LinkedContentSlug { get; set; }
    }
}
