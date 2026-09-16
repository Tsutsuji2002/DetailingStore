using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DetailingStore.Api.Data;
using DetailingStore.Api.DTOs;
using DetailingStore.Api.Models;

namespace DetailingStore.Api.Controllers
{
    public class CreateServiceCategoryDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Icon { get; set; }
        public string? Slug { get; set; }
    }

    public class CreateServiceDto
    {
        public Guid CategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Slug { get; set; }
        public string ShortDescription { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal PriceFrom { get; set; }
        public decimal? PriceTo { get; set; }
        public string? Duration { get; set; }
        public List<string> Images { get; set; } = new();
        public List<string> Tags { get; set; } = new();
        public bool IsActive { get; set; } = true;
    }

    [ApiController]
    [Route("api/[controller]")]
    public class ServicesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ServicesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetServices([FromQuery] string? categoryId, [FromQuery] string? search)
        {
            var query = _context.Services.Include(s => s.Category).Where(s => s.IsActive).AsQueryable();

            if (!string.IsNullOrEmpty(categoryId) && categoryId != "all" && Guid.TryParse(categoryId, out var catId))
            {
                query = query.Where(s => s.CategoryId == catId);
            }

            if (!string.IsNullOrEmpty(search))
            {
                var lowerSearch = search.ToLower();
                query = query.Where(s => s.Name.ToLower().Contains(lowerSearch) || s.ShortDescription.ToLower().Contains(lowerSearch));
            }

            var services = await query.Select(s => new {
                s.Id,
                s.CategoryId,
                CategoryName = s.Category != null ? s.Category.Name : null,
                CategoryIcon = s.Category != null ? s.Category.Icon : null,
                s.Name,
                s.Slug,
                s.ShortDescription,
                s.Description,
                s.PriceFrom,
                s.PriceTo,
                s.Duration,
                s.Images,
                s.Tags,
                s.IsActive,
                s.CreatedAt
            }).OrderByDescending(s => s.CreatedAt).ToListAsync();

            return Ok(ApiResponse<object>.Ok(services, "Fetched services successfully."));
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.ServiceCategories.Select(c => new {
                c.Id,
                c.Name,
                c.Slug,
                c.Icon
            }).ToListAsync();
            return Ok(ApiResponse<object>.Ok(categories, "Fetched categories successfully."));
        }

        [HttpPost("categories")]
        public async Task<IActionResult> CreateCategory([FromBody] CreateServiceCategoryDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name)) return BadRequest(ApiResponse<object>.Fail("Tên danh mục không được để trống."));
            
            var slug = string.IsNullOrWhiteSpace(dto.Slug) 
                ? dto.Name.ToLower().Replace(" ", "-") 
                : dto.Slug;

            var category = new ServiceCategory
            {
                Id = Guid.NewGuid(),
                Name = dto.Name.Trim(),
                Slug = slug,
                Icon = string.IsNullOrWhiteSpace(dto.Icon) ? "✨" : dto.Icon.Trim()
            };

            await _context.ServiceCategories.AddAsync(category);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.Ok(category, "Created category successfully."));
        }

        [HttpDelete("categories/{id}")]
        public async Task<IActionResult> DeleteCategory(Guid id)
        {
            var category = await _context.ServiceCategories.FindAsync(id);
            if (category == null) return NotFound(ApiResponse<object>.Fail("Category not found."));

            _context.ServiceCategories.Remove(category);
            await _context.SaveChangesAsync();
            return Ok(ApiResponse<object>.Ok(null, "Deleted category successfully."));
        }

        [HttpPost]
        public async Task<IActionResult> CreateService([FromBody] CreateServiceDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            
            var slug = string.IsNullOrWhiteSpace(dto.Slug)
                ? dto.Name.ToLower().Replace(" ", "-")
                : dto.Slug;

            var service = new ServiceEntity
            {
                Id = Guid.NewGuid(),
                CategoryId = dto.CategoryId,
                Name = dto.Name.Trim(),
                Slug = slug,
                ShortDescription = dto.ShortDescription ?? "",
                Description = dto.Description ?? "",
                PriceFrom = dto.PriceFrom,
                PriceTo = dto.PriceTo,
                Duration = dto.Duration,
                Images = dto.Images ?? new List<string>(),
                Tags = dto.Tags ?? new List<string>(),
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Services.AddAsync(service);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.Ok(service, "Created service successfully."));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateService(Guid id, [FromBody] CreateServiceDto dto)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null) return NotFound(ApiResponse<object>.Fail("Service not found."));

            service.Name = dto.Name;
            if (!string.IsNullOrWhiteSpace(dto.Slug)) service.Slug = dto.Slug;
            service.CategoryId = dto.CategoryId;
            service.ShortDescription = dto.ShortDescription ?? "";
            service.Description = dto.Description ?? "";
            service.PriceFrom = dto.PriceFrom;
            service.PriceTo = dto.PriceTo;
            service.Duration = dto.Duration;
            service.Images = dto.Images ?? new List<string>();
            service.Tags = dto.Tags ?? new List<string>();
            service.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();
            return Ok(ApiResponse<object>.Ok(service, "Updated service successfully."));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteService(Guid id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null) return NotFound(ApiResponse<object>.Fail("Service not found."));

            _context.Services.Remove(service);
            await _context.SaveChangesAsync();
            return Ok(ApiResponse<object>.Ok(null, "Deleted service successfully."));
        }
    }
}
