using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DetailingStore.Api.Data;
using DetailingStore.Api.Models;

namespace DetailingStore.Api.Controllers
{
    [ApiController]
    [Route("api/shop-settings")]
    public class ShopSettingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ShopSettingsController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Lấy thông tin thương hiệu, hotline, địa chỉ, giờ mở cửa của cửa hàng
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetShopSettings()
        {
            var settings = await _context.ShopSettings.FirstOrDefaultAsync();

            if (settings == null)
            {
                // Fallback initial setting if table is empty
                settings = new ShopSettingEntity();
                _context.ShopSettings.Add(settings);
                await _context.SaveChangesAsync();
            }

            return Ok(settings);
        }

        /// <summary>
        /// Cập nhật thông tin thương hiệu & liên hệ (Chỉ Admin)
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpPut]
        public async Task<IActionResult> UpdateShopSettings([FromBody] UpdateShopSettingDto dto)
        {
            var settings = await _context.ShopSettings.FirstOrDefaultAsync();

            if (settings == null)
            {
                settings = new ShopSettingEntity();
                _context.ShopSettings.Add(settings);
            }

            if (!string.IsNullOrWhiteSpace(dto.Name)) settings.Name = dto.Name.Trim();
            if (dto.LogoIcon != null) settings.LogoIcon = dto.LogoIcon.Trim();
            if (dto.LogoUrl != null) settings.LogoUrl = dto.LogoUrl.Trim();
            if (!string.IsNullOrWhiteSpace(dto.Tagline)) settings.Tagline = dto.Tagline.Trim();
            if (!string.IsNullOrWhiteSpace(dto.Address)) settings.Address = dto.Address.Trim();
            if (!string.IsNullOrWhiteSpace(dto.Phone)) settings.Phone = dto.Phone.Trim();
            if (!string.IsNullOrWhiteSpace(dto.Email)) settings.Email = dto.Email.Trim();
            if (!string.IsNullOrWhiteSpace(dto.TaxId)) settings.TaxId = dto.TaxId.Trim();
            if (!string.IsNullOrWhiteSpace(dto.MapEmbedUrl)) settings.MapEmbedUrl = dto.MapEmbedUrl.Trim();
            if (!string.IsNullOrWhiteSpace(dto.WorkingHours)) settings.WorkingHours = dto.WorkingHours.Trim();

            settings.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(settings);
        }
    }

    public class UpdateShopSettingDto
    {
        public string? Name { get; set; }
        public string? LogoIcon { get; set; }
        public string? LogoUrl { get; set; }
        public string? Tagline { get; set; }
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? TaxId { get; set; }
        public string? MapEmbedUrl { get; set; }
        public string? WorkingHours { get; set; }
    }
}
