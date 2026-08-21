using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DetailingStore.Api.Models
{
    [Table("service_categories")]
    public class ServiceCategory
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(100)]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        [Column("slug")]
        public string Slug { get; set; } = string.Empty;

        [MaxLength(50)]
        [Column("icon")]
        public string? Icon { get; set; }

        public ICollection<ServiceEntity> Services { get; set; } = new List<ServiceEntity>();
    }

    [Table("services")]
    public class ServiceEntity
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column("category_id")]
        public Guid CategoryId { get; set; }

        [ForeignKey(nameof(CategoryId))]
        public ServiceCategory? Category { get; set; }

        [Required]
        [MaxLength(150)]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        [Column("slug")]
        public string Slug { get; set; } = string.Empty;

        [Column("short_description")]
        public string ShortDescription { get; set; } = string.Empty;

        [Column("description")]
        public string Description { get; set; } = string.Empty;

        [Column("price_from", TypeName = "decimal(12,2)")]
        public decimal PriceFrom { get; set; }

        [Column("price_to", TypeName = "decimal(12,2)")]
        public decimal? PriceTo { get; set; }

        [MaxLength(50)]
        [Column("duration")]
        public string? Duration { get; set; }

        [Column("images")]
        public List<string> Images { get; set; } = new();

        [Column("tags")]
        public List<string> Tags { get; set; } = new();

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
