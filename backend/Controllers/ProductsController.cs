using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DetailingStore.Api.Data;
using DetailingStore.Api.DTOs;
using DetailingStore.Api.Models;

namespace DetailingStore.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/products
        [HttpGet]
        public async Task<IActionResult> GetProducts(
            [FromQuery] Guid? categoryId,
            [FromQuery] string? search,
            [FromQuery] string? sortBy)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Where(p => p.IsActive)
                .AsQueryable();

            if (categoryId.HasValue && categoryId.Value != Guid.Empty)
            {
                query = query.Where(p => p.CategoryId == categoryId.Value);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim().ToLower();
                query = query.Where(p => p.Name.ToLower().Contains(s) ||
                                         (p.Brand != null && p.Brand.ToLower().Contains(s)) ||
                                         p.ShortDescription.ToLower().Contains(s));
            }

            query = sortBy switch
            {
                "price-asc" => query.OrderBy(p => p.DiscountPrice ?? p.Price),
                "price-desc" => query.OrderByDescending(p => p.DiscountPrice ?? p.Price),
                "name" => query.OrderBy(p => p.Name),
                "rating" => query.OrderByDescending(p => p.Rating),
                _ => query.OrderByDescending(p => p.CreatedAt)
            };

            var list = await query.Select(p => MapToDto(p)).ToListAsync();
            return Ok(ApiResponse<List<ProductDto>>.Ok(list, "Lấy danh sách sản phẩm thành công."));
        }

        // GET: api/products/categories
        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.ProductCategories
                .Select(c => new ProductCategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Slug = c.Slug
                })
                .ToListAsync();

            return Ok(ApiResponse<List<ProductCategoryDto>>.Ok(categories, "Lấy danh mục sản phẩm thành công."));
        }

        // POST: api/products/categories
        [HttpPost("categories")]
        public async Task<IActionResult> CreateCategory([FromBody] CreateProductCategoryDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest(ApiResponse<string>.Fail("Tên danh mục không được để trống."));
            }

            var slug = string.IsNullOrWhiteSpace(dto.Slug)
                ? dto.Name.ToLower().Replace(" ", "-").Replace("đ", "d")
                : dto.Slug;

            var category = new ProductCategory
            {
                Id = Guid.NewGuid(),
                Name = dto.Name.Trim(),
                Slug = slug
            };

            await _context.ProductCategories.AddAsync(category);
            await _context.SaveChangesAsync();

            var resultDto = new ProductCategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Slug = category.Slug
            };

            return Ok(ApiResponse<ProductCategoryDto>.Ok(resultDto, "Tạo danh mục sản phẩm thành công."));
        }

        // DELETE: api/products/categories/{id}
        [HttpDelete("categories/{id:guid}")]
        public async Task<IActionResult> DeleteCategory(Guid id)
        {
            var category = await _context.ProductCategories.FindAsync(id);
            if (category == null)
            {
                return NotFound(ApiResponse<string>.Fail("Không tìm thấy danh mục sản phẩm."));
            }

            _context.ProductCategories.Remove(category);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<string>.Ok("Xóa danh mục sản phẩm thành công.", "Xóa danh mục sản phẩm thành công."));
        }

        // GET: api/products/{idOrSlug}
        [HttpGet("{idOrSlug}")]
        public async Task<IActionResult> GetProductByIdOrSlug(string idOrSlug)
        {
            ProductEntity? product = null;

            if (Guid.TryParse(idOrSlug, out var id))
            {
                product = await _context.Products
                    .Include(p => p.Category)
                    .FirstOrDefaultAsync(p => p.Id == id);
            }
            else
            {
                var cleanSearchSlug = ConvertToVietnameseSlug(idOrSlug);
                var allProducts = await _context.Products.Include(p => p.Category).ToListAsync();
                product = allProducts.FirstOrDefault(p => 
                    p.Slug.Equals(idOrSlug, StringComparison.OrdinalIgnoreCase) ||
                    ConvertToVietnameseSlug(p.Slug).Equals(cleanSearchSlug, StringComparison.OrdinalIgnoreCase) ||
                    ConvertToVietnameseSlug(p.Name).Equals(cleanSearchSlug, StringComparison.OrdinalIgnoreCase)
                );
            }

            if (product == null)
            {
                return NotFound(ApiResponse<string>.Fail("Không tìm thấy sản phẩm."));
            }

            return Ok(ApiResponse<ProductDto>.Ok(MapToDto(product), "Lấy chi tiết sản phẩm thành công."));
        }

        // POST: api/products (Admin only)
        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<string>.Fail("Dữ liệu gửi lên không hợp lệ."));
            }

            var categoryExists = await _context.ProductCategories.AnyAsync(c => c.Id == dto.CategoryId);
            if (!categoryExists)
            {
                return BadRequest(ApiResponse<string>.Fail("Danh mục sản phẩm không tồn tại."));
            }

            var cleanSlug = ConvertToVietnameseSlug(dto.Name);

            var product = new ProductEntity
            {
                Id = Guid.NewGuid(),
                CategoryId = dto.CategoryId,
                Name = dto.Name.Trim(),
                Slug = $"{cleanSlug}-{Guid.NewGuid().ToString()[..6]}",
                Brand = dto.Brand,
                ShortDescription = dto.ShortDescription ?? "",
                Description = dto.Description ?? "",
                Price = dto.Price,
                DiscountPrice = dto.DiscountPrice,
                Stock = dto.Stock,
                Images = dto.Images ?? new List<string>(),
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Products.AddAsync(product);
            await _context.SaveChangesAsync();

            var createdProduct = await _context.Products
                .Include(p => p.Category)
                .FirstAsync(p => p.Id == product.Id);

            return CreatedAtAction(nameof(GetProductByIdOrSlug), new { idOrSlug = product.Id }, ApiResponse<ProductDto>.Ok(MapToDto(createdProduct), "Tạo sản phẩm mới thành công."));
        }

        // PUT: api/products/{id} (Admin only)
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] UpdateProductDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<string>.Fail("Dữ liệu gửi lên không hợp lệ."));
            }

            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound(ApiResponse<string>.Fail("Không tìm thấy sản phẩm cần cập nhật."));
            }

            product.CategoryId = dto.CategoryId;
            product.Name = dto.Name.Trim();
            product.Brand = dto.Brand;
            product.ShortDescription = dto.ShortDescription ?? "";
            product.Description = dto.Description ?? "";
            product.Price = dto.Price;
            product.DiscountPrice = dto.DiscountPrice;
            product.Stock = dto.Stock;
            product.Images = dto.Images ?? new List<string>();
            product.IsActive = dto.IsActive;

            _context.Products.Update(product);
            await _context.SaveChangesAsync();

            var updatedProduct = await _context.Products
                .Include(p => p.Category)
                .FirstAsync(p => p.Id == id);

            return Ok(ApiResponse<ProductDto>.Ok(MapToDto(updatedProduct), "Cập nhật sản phẩm thành công."));
        }

        // DELETE: api/products/{id} (Admin only)
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteProduct(Guid id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound(ApiResponse<string>.Fail("Không tìm thấy sản phẩm cần xóa."));
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<string>.Ok("Xóa sản phẩm thành công.", "Xóa sản phẩm thành công."));
        }

        private static string ConvertToVietnameseSlug(string input)
        {
            if (string.IsNullOrWhiteSpace(input)) return string.Empty;
            var str = input.ToLower();
            str = System.Text.RegularExpressions.Regex.Replace(str, @"[àáạảãâầấậẩẫăằắặẳẵ]", "a");
            str = System.Text.RegularExpressions.Regex.Replace(str, @"[èéẹẻẽêềếệểễ]", "e");
            str = System.Text.RegularExpressions.Regex.Replace(str, @"[ìíịỉĩ]", "i");
            str = System.Text.RegularExpressions.Regex.Replace(str, @"[òóọỏõôồốộổỗơờớợởỡ]", "o");
            str = System.Text.RegularExpressions.Regex.Replace(str, @"[ùúụủũưừứựửữ]", "u");
            str = System.Text.RegularExpressions.Regex.Replace(str, @"[ỳýỵỷỹ]", "y");
            str = str.Replace("đ", "d").Replace("3/4", "3-4");
            str = System.Text.RegularExpressions.Regex.Replace(str, @"[^a-z0-9\s-]", "");
            str = System.Text.RegularExpressions.Regex.Replace(str, @"\s+", "-");
            return System.Text.RegularExpressions.Regex.Replace(str, @"-+", "-").Trim('-');
        }

        private static ProductDto MapToDto(ProductEntity p)
        {
            var rawSlug = string.IsNullOrWhiteSpace(p.Slug) ? p.Name : p.Slug;
            var safeSlug = ConvertToVietnameseSlug(rawSlug);

            return new ProductDto
            {
                Id = p.Id,
                CategoryId = p.CategoryId,
                CategoryName = p.Category?.Name ?? "Chưa phân loại",
                Name = p.Name,
                Slug = string.IsNullOrWhiteSpace(safeSlug) ? p.Id.ToString() : safeSlug,
                Brand = p.Brand,
                ShortDescription = p.ShortDescription,
                Description = p.Description,
                Price = p.Price,
                DiscountPrice = p.DiscountPrice,
                Stock = p.Stock,
                Images = p.Images,
                Rating = p.Rating,
                ReviewCount = p.ReviewCount,
                IsActive = p.IsActive,
                CreatedAt = p.CreatedAt
            };
        }
    }
}
