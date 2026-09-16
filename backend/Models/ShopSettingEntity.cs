using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DetailingStore.Api.Models
{
    [Table("shop_settings")]
    public class ShopSettingEntity
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = "MotoShine";

        [MaxLength(50)]
        public string? LogoIcon { get; set; } = "🏍️";

        [MaxLength(500)]
        public string? LogoUrl { get; set; }

        [MaxLength(255)]
        public string Tagline { get; set; } = "Chăm Sóc Xe Máy Chuyên Nghiệp – Đẳng Cấp Bình Dương";

        [MaxLength(255)]
        public string Address { get; set; } = "123 Đường Lý Thường Kiệt, Phường 7, Quận 10, TP. Hồ Chí Minh";

        [MaxLength(50)]
        public string Phone { get; set; } = "0901 234 567";

        [MaxLength(100)]
        public string Email { get; set; } = "contact@detailingstore.vn";

        [MaxLength(50)]
        public string TaxId { get; set; } = "0315678901";

        public string MapEmbedUrl { get; set; } = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4508!2d106.6604!3d10.7769!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ2JzM2LjgiTiAxMDYsNDMnMzcuNCJF!5e0!3m2!1svi!2s!4v1600000000000";

        [MaxLength(100)]
        public string WorkingHours { get; set; } = "Thứ 2 – Thứ 7: 7:30 – 18:30 | Chủ nhật: 8:00 – 16:00";

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
