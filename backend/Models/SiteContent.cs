using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DetailingStore.Api.Models
{
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

        [Column("hero_slides_json")]
        public string HeroSlidesJson { get; set; } = "[]";

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
