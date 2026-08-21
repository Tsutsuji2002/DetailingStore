using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DetailingStore.Api.Models
{
    [Table("product_categories")]
    public class ProductCategory
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

        public ICollection<ProductEntity> Products { get; set; } = new List<ProductEntity>();
    }

    [Table("products")]
    public class ProductEntity
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column("category_id")]
        public Guid CategoryId { get; set; }

        [ForeignKey(nameof(CategoryId))]
        public ProductCategory? Category { get; set; }

        [Required]
        [MaxLength(150)]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        [Column("slug")]
        public string Slug { get; set; } = string.Empty;

        [MaxLength(100)]
        [Column("brand")]
        public string? Brand { get; set; }

        [Column("short_description")]
        public string ShortDescription { get; set; } = string.Empty;

        [Column("description")]
        public string Description { get; set; } = string.Empty;

        [Column("price", TypeName = "decimal(12,2)")]
        public decimal Price { get; set; }

        [Column("discount_price", TypeName = "decimal(12,2)")]
        public decimal? DiscountPrice { get; set; }

        [Column("stock")]
        public int Stock { get; set; } = 0;

        [Column("images")]
        public List<string> Images { get; set; } = new();

        [Column("rating", TypeName = "decimal(3,2)")]
        public decimal Rating { get; set; } = 5.0m;

        [Column("review_count")]
        public int ReviewCount { get; set; } = 0;

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
