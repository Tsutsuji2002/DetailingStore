using DetailingStore.Api.Data;
using DetailingStore.Api.DTOs;
using DetailingStore.Api.Models;
using DetailingStore.Api.Validators;
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

        // =============================
        //  SITE CONTENT (Branding)
        // =============================

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
                updatedAt = content.UpdatedAt
            });
        }

        [HttpPut]
        public async Task<IActionResult> UpdateContent([FromBody] UpdateContentDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

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
            content.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Cập nhật thông tin website thành công!",
                shopName = content.ShopName,
                tagline = content.Tagline,
                logoUrl = content.LogoUrl,
                logoIcon = content.LogoIcon,
                updatedAt = content.UpdatedAt
            });
        }

        // =============================
        //  HERO SLIDES
        // =============================

        [HttpGet("slides")]
        public async Task<IActionResult> GetSlides()
        {
            var slides = await _context.HeroSlides
                .Where(s => s.IsActive)
                .OrderBy(s => s.SortOrder)
                .Select(s => new HeroSlideResponseDto
                {
                    Id = s.Id,
                    Tag = s.Tag,
                    Title = s.Title,
                    Description = s.Description,
                    ImageUrl = s.ImageUrl,
                    SortOrder = s.SortOrder,
                    IsActive = s.IsActive,
                    LinkType = s.LinkType.ToString().ToLower(),
                    LinkedContentId = s.LinkedContentId,
                    LinkedContentSlug = s.LinkedContentSlug
                })
                .ToListAsync();

            return Ok(new { success = true, data = slides });
        }

        [HttpPost("slides")]
        public async Task<IActionResult> CreateSlide([FromBody] CreateHeroSlideDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Title))
                return BadRequest(new { message = "Tiêu đề slide không được để trống." });

            // Validate link configuration
            var (isValid, errorMessage) = HeroSlideLinkValidator.ValidateLinkConfiguration(
                dto.LinkType,
                dto.LinkedContentId,
                dto.LinkedContentSlug
            );

            if (!isValid)
            {
                return BadRequest(new { message = errorMessage });
            }

            // Parse LinkType (default to None if not provided)
            var linkType = LinkType.None;
            if (!string.IsNullOrWhiteSpace(dto.LinkType))
            {
                Enum.TryParse<LinkType>(dto.LinkType, ignoreCase: true, out linkType);
            }

            var maxOrder = await _context.HeroSlides.AnyAsync()
                ? await _context.HeroSlides.MaxAsync(s => s.SortOrder)
                : -1;

            var slide = new HeroSlide
            {
                Tag = dto.Tag?.Trim() ?? "✨ Banner",
                Title = dto.Title.Trim(),
                Description = dto.Description?.Trim() ?? string.Empty,
                ImageUrl = dto.ImageUrl?.Trim() ?? string.Empty,
                SortOrder = maxOrder + 1,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                LinkType = linkType,
                LinkedContentId = dto.LinkedContentId,
                LinkedContentSlug = dto.LinkedContentSlug?.Trim()
            };

            await _context.HeroSlides.AddAsync(slide);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                data = new HeroSlideResponseDto
                {
                    Id = slide.Id,
                    Tag = slide.Tag,
                    Title = slide.Title,
                    Description = slide.Description,
                    ImageUrl = slide.ImageUrl,
                    SortOrder = slide.SortOrder,
                    IsActive = slide.IsActive,
                    LinkType = slide.LinkType.ToString().ToLower(),
                    LinkedContentId = slide.LinkedContentId,
                    LinkedContentSlug = slide.LinkedContentSlug
                },
                message = "Thêm slide thành công."
            });
        }

        [HttpPut("slides/{id:int}")]
        public async Task<IActionResult> UpdateSlide(int id, [FromBody] UpdateHeroSlideDto dto)
        {
            var slide = await _context.HeroSlides.FindAsync(id);
            if (slide == null) return NotFound(new { message = "Không tìm thấy slide." });

            // Update basic fields (preserve existing values if not provided)
            if (!string.IsNullOrWhiteSpace(dto.Tag))
                slide.Tag = dto.Tag.Trim();
            if (!string.IsNullOrWhiteSpace(dto.Title))
                slide.Title = dto.Title.Trim();
            if (dto.Description != null)
                slide.Description = dto.Description.Trim();
            if (dto.ImageUrl != null)
                slide.ImageUrl = dto.ImageUrl.Trim();
            if (dto.SortOrder.HasValue)
                slide.SortOrder = dto.SortOrder.Value;

            // Handle link configuration update
            bool linkFieldsProvided = dto.LinkType != null ||
                                      dto.LinkedContentId.HasValue ||
                                      dto.LinkedContentSlug != null;

            if (linkFieldsProvided)
            {
                // Use provided values or preserve existing values
                var linkTypeStr = dto.LinkType ?? slide.LinkType.ToString();
                var linkedContentId = dto.LinkedContentId ?? slide.LinkedContentId;
                var linkedContentSlug = dto.LinkedContentSlug ?? slide.LinkedContentSlug;

                // Validate the configuration
                var (isValid, errorMessage) = HeroSlideLinkValidator.ValidateLinkConfiguration(
                    linkTypeStr,
                    linkedContentId,
                    linkedContentSlug
                );

                if (!isValid)
                {
                    return BadRequest(new { message = errorMessage });
                }

                // Apply updates
                if (dto.LinkType != null)
                {
                    Enum.TryParse<LinkType>(dto.LinkType, ignoreCase: true, out var parsedLinkType);
                    slide.LinkType = parsedLinkType;

                    // Special case: If changing to None, clear the linked content fields
                    if (parsedLinkType == LinkType.None)
                    {
                        slide.LinkedContentId = null;
                        slide.LinkedContentSlug = null;
                    }
                }

                if (dto.LinkedContentId.HasValue)
                    slide.LinkedContentId = dto.LinkedContentId;

                if (dto.LinkedContentSlug != null)
                    slide.LinkedContentSlug = dto.LinkedContentSlug.Trim();
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                data = new HeroSlideResponseDto
                {
                    Id = slide.Id,
                    Tag = slide.Tag,
                    Title = slide.Title,
                    Description = slide.Description,
                    ImageUrl = slide.ImageUrl,
                    SortOrder = slide.SortOrder,
                    IsActive = slide.IsActive,
                    LinkType = slide.LinkType.ToString().ToLower(),
                    LinkedContentId = slide.LinkedContentId,
                    LinkedContentSlug = slide.LinkedContentSlug
                },
                message = "Cập nhật slide thành công."
            });
        }

        [HttpDelete("slides/{id:int}")]
        public async Task<IActionResult> DeleteSlide(int id)
        {
            var slide = await _context.HeroSlides.FindAsync(id);
            if (slide == null) return NotFound(new { message = "Không tìm thấy slide." });

            _context.HeroSlides.Remove(slide);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Đã xóa slide thành công." });
        }

        // =============================
        //  IMAGE UPLOAD
        // =============================

        [HttpPost("upload")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Vui lòng chọn một tập tin ảnh hợp lệ." });

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { message = "Chỉ chấp nhận các tập tin định dạng hình ảnh (.jpg, .png, .webp, .svg)." });

            var webRootPath = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadsDir = Path.Combine(webRootPath, "uploads");
            if (!Directory.Exists(uploadsDir)) Directory.CreateDirectory(uploadsDir);

            var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
            var filePath = Path.Combine(uploadsDir, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var fileUrl = $"/uploads/{uniqueFileName}";
            _logger.LogInformation("🖼️ Image uploaded successfully: {FileUrl}", fileUrl);

            return Ok(new { message = "Tải ảnh lên thành công!", url = fileUrl });
        }
    }

    public class UpdateContentDto
    {
        public string ShopName { get; set; } = string.Empty;
        public string Tagline { get; set; } = string.Empty;
        public string? LogoUrl { get; set; }
        public string? LogoIcon { get; set; }
    }
}
