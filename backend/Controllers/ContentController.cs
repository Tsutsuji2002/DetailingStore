using System.Text.Json;
using DetailingStore.Api.Data;
using DetailingStore.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DetailingStore.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContentController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<ContentController> _logger;

        public ContentController(
            AppDbContext context,
            IWebHostEnvironment environment,
            ILogger<ContentController> logger)
        {
            _context = context;
            _environment = environment;
            _logger = logger;
        }

        /// <summary>
        /// Lấy thông tin cấu hình nội dung website & logo
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetContent()
        {
            var content = await _context.SiteContents.FirstOrDefaultAsync(c => c.Id == 1);
            if (content == null)
            {
                content = new SiteContent
                {
                    Id = 1,
                    ShopName = "Detailing Store",
                    Tagline = "Chăm Sóc Xe Máy Chuyên Nghiệp – Đẳng Cấp Sài Gòn",
                    LogoIcon = "🏍️",
                    LogoUrl = null,
                    HeroSlidesJson = "[]",
                    UpdatedAt = DateTime.UtcNow
                };
                await _context.SiteContents.AddAsync(content);
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                id = content.Id,
                shopName = content.ShopName,
                tagline = content.Tagline,
                logoUrl = content.LogoUrl,
                logoIcon = content.LogoIcon,
                heroSlidesJson = content.HeroSlidesJson,
                updatedAt = content.UpdatedAt
            });
        }

        /// <summary>
        /// Cập nhật thông tin website & logo (Chỉ dành cho Admin)
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpPut]
        public async Task<IActionResult> UpdateContent([FromBody] UpdateContentDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var content = await _context.SiteContents.FirstOrDefaultAsync(c => c.Id == 1);
            if (content == null)
            {
                content = new SiteContent { Id = 1 };
                await _context.SiteContents.AddAsync(content);
            }

            content.ShopName = dto.ShopName.Trim();
            content.Tagline = dto.Tagline?.Trim() ?? string.Empty;
            content.LogoUrl = string.IsNullOrWhiteSpace(dto.LogoUrl) ? null : dto.LogoUrl.Trim();
            content.LogoIcon = string.IsNullOrWhiteSpace(dto.LogoIcon) ? "🏍️" : dto.LogoIcon.Trim();
            content.HeroSlidesJson = dto.HeroSlidesJson ?? "[]";
            content.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Cập nhật nội dung website thành công!",
                content = new
                {
                    id = content.Id,
                    shopName = content.ShopName,
                    tagline = content.Tagline,
                    logoUrl = content.LogoUrl,
                    logoIcon = content.LogoIcon,
                    heroSlidesJson = content.HeroSlidesJson,
                    updatedAt = content.UpdatedAt
                }
            });
        }

        /// <summary>
        /// Upload hình ảnh từ máy tính (Logo, Banner slide) lên server (Chỉ dành cho Admin)
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpPost("upload")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Vui lòng chọn một tập tin ảnh hợp lệ." });

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { message = "Chỉ chấp nhận các tập tin định dạng hình ảnh (.jpg, .png, .webp, .svg)." });

            // Ensure wwwroot/uploads directory exists
            var webRootPath = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadsDir = Path.Combine(webRootPath, "uploads");
            if (!Directory.Exists(uploadsDir))
            {
                Directory.CreateDirectory(uploadsDir);
            }

            var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
            var filePath = Path.Combine(uploadsDir, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var fileUrl = $"/uploads/{uniqueFileName}";
            _logger.LogInformation("🖼️ Image uploaded successfully: {FileUrl}", fileUrl);

            return Ok(new
            {
                message = "Tải ảnh lên thành công!",
                url = fileUrl
            });
        }
    }

    public class UpdateContentDto
    {
        public string ShopName { get; set; } = string.Empty;
        public string Tagline { get; set; } = string.Empty;
        public string? LogoUrl { get; set; }
        public string? LogoIcon { get; set; }
        public string? HeroSlidesJson { get; set; }
    }
}
