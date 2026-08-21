using DetailingStore.Api.Models;

namespace DetailingStore.Api.Data
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            if (context.ServiceCategories.Any()) return; // Database already seeded

            // 1. Seed Categories
            var detailingCategory = new ServiceCategory
            {
                Name = "Detailing",
                Slug = "detailing",
                Icon = "✨"
            };
            var repairCategory = new ServiceCategory
            {
                Name = "Sửa Chữa",
                Slug = "sua-chua",
                Icon = "🔧"
            };

            await context.ServiceCategories.AddRangeAsync(detailingCategory, repairCategory);
            await context.SaveChangesAsync();

            // 2. Seed Services (Skipped sample services)

            // 3. Seed Sample Admin User
            var adminUser = new User
            {
                Username = "admin",
                Email = "admin@detailingstore.vn",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                FirstName = "Viên",
                LastName = "Quản Trị",
                Role = UserRole.Admin,
                AuthProvider = "local",
                EmailConfirmed = true,
                Phone = "0901234567"
            };

            // 4. Seed SiteContent
            if (!context.SiteContents.Any())
            {
                var defaultSlides = new[]
                {
                    new { id = 1, tag = "✨ Dịch Vụ Nổi Bật", title = "Detailing Xe Máy Cao Cấp Tại TP.HCM", desc = "Phủ Ceramic, đánh bóng sơn, vệ sinh khoang máy chuyên sâu.", img = "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=700&q=80" },
                    new { id = 2, tag = "🔧 Sửa Chữa & Bảo Dưỡng", title = "Kỹ Thuật Chuyên Sâu - Bảo Hành Tận Tâm", desc = "Đội ngũ thợ 10+ năm kinh nghiệm.", img = "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=700&q=80" }
                };

                await context.SiteContents.AddAsync(new SiteContent
                {
                    Id = 1,
                    ShopName = "Detailing Store",
                    Tagline = "Chăm Sóc Xe Máy Chuyên Nghiệp – Đẳng Cấp Sài Gòn",
                    LogoIcon = "🏍️",
                    LogoUrl = null,
                    HeroSlidesJson = System.Text.Json.JsonSerializer.Serialize(defaultSlides),
                    UpdatedAt = DateTime.UtcNow
                });
            }

            await context.Users.AddAsync(adminUser);
            await context.SaveChangesAsync();
        }
    }
}
