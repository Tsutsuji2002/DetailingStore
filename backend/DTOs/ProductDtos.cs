using System.ComponentModel.DataAnnotations;

namespace DetailingStore.Api.DTOs
{
    public class ProductCategoryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
    }

    public class CreateProductCategoryDto
    {
        [Required(ErrorMessage = "Tên danh mục là bắt buộc.")]
        public string Name { get; set; } = string.Empty;
        public string? Slug { get; set; }
    }

    public class ProductDto
    {
        public Guid Id { get; set; }
        public Guid CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? Brand { get; set; }
        public string ShortDescription { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal? DiscountPrice { get; set; }
        public int Stock { get; set; }
        public List<string> Images { get; set; } = new();
        public decimal Rating { get; set; }
        public int ReviewCount { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateProductDto
    {
        [Required(ErrorMessage = "Danh mục là bắt buộc.")]
        public Guid CategoryId { get; set; }

        [Required(ErrorMessage = "Tên sản phẩm là bắt buộc.")]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Brand { get; set; }

        public string ShortDescription { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        [Range(0, 1000000000, ErrorMessage = "Giá sản phẩm phải lớn hơn hoặc bằng 0.")]
        public decimal Price { get; set; }

        public decimal? DiscountPrice { get; set; }

        [Range(0, 100000, ErrorMessage = "Số lượng tồn kho không hợp lệ.")]
        public int Stock { get; set; } = 0;

        public List<string> Images { get; set; } = new();
        public bool IsActive { get; set; } = true;
    }

    public class UpdateProductDto : CreateProductDto
    {
    }
}
