using DetailingStore.Api.Models;

namespace DetailingStore.Api.Data
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            // Seed MechanicDocs independently (regardless of other seeded data)
            await SeedMechanicDocsAsync(context);

            if (context.ServiceCategories.Any()) return; // Database already seeded

            // 1. Seed Categories
            var detailingCategory = new ServiceCategory
            {
                Name = "Detailing",
                Slug = "detailing",
                Icon = null
            };
            var repairCategory = new ServiceCategory
            {
                Name = "Sửa Chữa",
                Slug = "sua-chua",
                Icon = null
            };

            await context.ServiceCategories.AddRangeAsync(detailingCategory, repairCategory);
            await context.SaveChangesAsync();

            // 2. Seed Services
            var service1 = new ServiceEntity
            {
                CategoryId = detailingCategory.Id,
                Name = "Detailing Toàn Diện Premium",
                Slug = "detailing-toan-dien-premium",
                ShortDescription = "Quy trình chăm sóc, rửa gầm, đánh bóng & phủ ceramic toàn bộ xe",
                Description = "Dịch vụ vệ sinh tỉ mỉ từng chi tiết khoang máy, dàn áo, làm sạch lazang và phủ lớp bảo vệ cao cấp.",
                PriceFrom = 800000,
                PriceTo = 2500000,
                Duration = "4-8 giờ",
                Images = new List<string> { "https://images.unsplash.com/photo-1558981806-ec527fa84c39" },
                Tags = new List<string> { "Ceramic", "Rửa gầm", "Đánh bóng" }
            };

            await context.Services.AddAsync(service1);

            // 3. Seed Product Categories & Products
            if (!context.ProductCategories.Any())
            {
                var catDetailing = new ProductCategory { Name = "Dụng Cụ & Hóa Chất Detailing", Slug = "dung-cu-detailing" };
                var catParts = new ProductCategory { Name = "Phụ Tùng Xe Máy Chính Hãng", Slug = "phu-tung-chinh-hang" };
                var catCeramic = new ProductCategory { Name = "Sản Phẩm Phủ Nano / Ceramic", Slug = "san-pham-ceramic" };

                await context.ProductCategories.AddRangeAsync(catDetailing, catParts, catCeramic);
                await context.SaveChangesAsync();

                var sampleProduct = new ProductEntity
                {
                    CategoryId = catDetailing.Id,
                    Name = "Dung Dịch Rửa Xe Chuyên Dụng MotoShine 1L",
                    Slug = "dung-dich-rua-xe-motoshine-1l",
                    Brand = "MotoShine Premium",
                    ShortDescription = "Công thức pH trung tính, tạo bọt tuyết siêu mịn, bảo vệ tuyệt đối lớp sơn.",
                    Description = "Dung dịch rửa xe bọt tuyết đậm đặc 1L giúp làm sạch bụi bẩn, dầu mỡ bám dính mà không gây hại cho lớp wax/ceramic bảo vệ xe.",
                    Price = 180000,
                    DiscountPrice = 150000,
                    Stock = 50,
                    Images = new List<string> { "https://placehold.co/600x400/1e293b/94a3b8?text=Dung+Dich+Rua+Xe" },
                    Rating = 5.0m,
                    ReviewCount = 12,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                await context.Products.AddAsync(sampleProduct);
                await context.SaveChangesAsync();
            }

            // 4. Seed Sample Admin and Staff Users
            if (!context.Users.Any())
            {
                var adminUser = new User
                {
                    Username = "admin",
                    Email = "admin@detailingstore.vn",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    FirstName = "Quản Trị",
                    LastName = "Viên",
                    Role = UserRole.Admin,
                    AuthProvider = "local",
                    EmailConfirmed = true,
                    Phone = "0901234567"
                };

                var staff1 = new User
                {
                    Username = "minh_staff",
                    Email = "minh@detailingstore.vn",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("staff123"),
                    FirstName = "Minh",
                    LastName = "Nguyễn Văn",
                    Role = UserRole.Staff,
                    AuthProvider = "local",
                    EmailConfirmed = true,
                    Phone = "0912345678"
                };

                var staff2 = new User
                {
                    Username = "tuan_staff",
                    Email = "tuan@detailingstore.vn",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("staff123"),
                    FirstName = "Tuấn",
                    LastName = "Lê Văn",
                    Role = UserRole.Staff,
                    AuthProvider = "local",
                    EmailConfirmed = true,
                    Phone = "0923456789"
                };

                await context.Users.AddRangeAsync(adminUser, staff1, staff2);
                await context.SaveChangesAsync();
            }

            // 5. Seed Mechanic Technical Documents
            await SeedMechanicDocsAsync(context);

            // 6. Seed Vehicle Service Bookings
            await SeedServiceBookingsAsync(context);
        }

        private static async Task SeedServiceBookingsAsync(AppDbContext context)
        {
            if (!context.ServiceBookings.Any())
            {
                var staffUser = context.Users.FirstOrDefault(u => u.Role == UserRole.Staff) ?? context.Users.FirstOrDefault();
                var staffId = staffUser?.Id;
                var service = context.Services.FirstOrDefault();
                var serviceId = service?.Id ?? Guid.NewGuid();

                var b1 = new ServiceBooking
                {
                    Id = Guid.NewGuid(),
                    ServiceId = serviceId,
                    AssignedStaffId = staffId,
                    LicensePlate = "59-X3 888.88",
                    CustomerName = "Trần Văn Khang",
                    VehicleModel = "Honda SH 150i ABS",
                    BookingDate = DateOnly.FromDateTime(DateTime.Today),
                    BookingTime = new TimeOnly(8, 30),
                    Status = BookingStatus.InProgress,
                    Notes = "Khách yêu cầu chăm sóc kỹ dàn nhựa nhám & mâm",
                    TotalPrice = 800000,
                    CreatedAt = DateTime.UtcNow
                };

                var b2 = new ServiceBooking
                {
                    Id = Guid.NewGuid(),
                    ServiceId = serviceId,
                    AssignedStaffId = staffId,
                    LicensePlate = "59-K1 678.90",
                    CustomerName = "Lê Hoàng Nam",
                    VehicleModel = "Yamaha Exciter 155 VVA",
                    BookingDate = DateOnly.FromDateTime(DateTime.Today),
                    BookingTime = new TimeOnly(10, 0),
                    Status = BookingStatus.Pending,
                    Notes = "Kiểm tra van biến thiên VVA & thay bugi",
                    TotalPrice = 450000,
                    CreatedAt = DateTime.UtcNow
                };

                var b3 = new ServiceBooking
                {
                    Id = Guid.NewGuid(),
                    ServiceId = serviceId,
                    AssignedStaffId = staffId,
                    LicensePlate = "59-U1 123.45",
                    CustomerName = "Phạm Minh Tuấn",
                    VehicleModel = "Vespa GTS Super 300",
                    BookingDate = DateOnly.FromDateTime(DateTime.Today),
                    BookingTime = new TimeOnly(13, 30),
                    Status = BookingStatus.Completed,
                    Notes = "Đã hoàn tất bàn giao cho khách lúc 10h30",
                    TotalPrice = 1200000,
                    CreatedAt = DateTime.UtcNow
                };

                await context.ServiceBookings.AddRangeAsync(b1, b2, b3);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedMechanicDocsAsync(AppDbContext context)
        {
            if (!context.MechanicDocs.Any())
            {
                var doc1 = new MechanicDoc
                {
                    Id = Guid.NewGuid(),
                    Title = "Lỗi P0300 – Động Cơ Đánh Lửa Ngẫu Nhiên (Misfire)",
                    Brand = "Honda",
                    VehicleModel = "Wave RSX 110 (2018-2024)",
                    Category = "Hệ Thống Động Cơ & FI",
                    ErrorCode = "P0300",
                    Symptoms = "Đèn FI nhấp nháy, xe nổ không đều, hụt ga khi tăng tốc",
                    ContentHtml = @"<h2>Cẩm Nang Xử Lý Lỗi P0300 trên xe Honda Wave RSX FI</h2>
<p><strong>Triệu chứng:</strong> Xe có hiện tượng hụt ga khi rồ ga, khởi động khó khăn, đèn FI cảnh báo nháy mã 12 hoặc 54 trên mặt đồng hồ.</p>
<h3>1. Các bước kiểm tra ban đầu</h3>
<ul>
  <li>Kiểm tra áp suất nén buồng đốt (Tiêu chuẩn: 10 - 12 kg/cm²).</li>
  <li>Kiểm tra khe hở chấu bugi (Tiêu chuẩn: 0.8 - 0.9 mm). Thay thế nếu chấu mòn hoặc đóng muội than đen.</li>
  <li>Đo áp suất bơm xăng (Tiêu chuẩn: 2.9 - 3.1 kgf/cm²).</li>
</ul>
<h3>2. Bảng thông số kỹ thuật điện áp</h3>
<table border=""1"" style=""width:100%; border-collapse:collapse; text-align:left;"">
  <thead>
    <tr style=""background:#f1f5f9;"">
      <th style=""padding:8px;"">Linh Kiện</th>
      <th style=""padding:8px;"">Chân Đo ECU</th>
      <th style=""padding:8px;"">Giá Trị Chuẩn</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style=""padding:8px;"">Cuộn Sơ Cấp Mô-bin Sườn</td>
      <td style=""padding:8px;"">Chân IG - Mass</td>
      <td style=""padding:8px;"">0.2 - 0.4 Ω (20°C)</td>
    </tr>
    <tr>
      <td style=""padding:8px;"">Kim Phun PGM-FI</td>
      <td style=""padding:8px;"">Chân INJ - Mass</td>
      <td style=""padding:8px;"">11 - 13 Ω (20°C)</td>
    </tr>
  </tbody>
</table>",
                    SolutionStepsJson = "[\"Kiểm tra điện áp cuộn sơ cấp mô-bin sườn\",\"Vệ sinh kim phun xăng bằng máy sóng siêu âm\",\"Xóa mã lỗi lịch sử bằng máy đọc lỗi MST-100P\"]",
                    Diagrams = new List<string> { "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600" },
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var doc2 = new MechanicDoc
                {
                    Id = Guid.NewGuid(),
                    Title = "Quy Trình Cài Đặt Lại ECU & Mã Lỗi Exciter 155 VVA",
                    Brand = "Yamaha",
                    VehicleModel = "Exciter 155 VVA",
                    Category = "Hệ Thống Điện & ECU",
                    ErrorCode = "C00",
                    Symptoms = "Đèn VVA không sáng, xe tua máy bị ngắt sớm ở 7000rpm",
                    ContentHtml = @"<h2>Hướng Dẫn Reset ECU & Kích Hoạt Van Biến Thiên VVA</h2>
<p><strong>Hiện tượng:</strong> Động cơ xe Exciter 155 bị ngắt tua máy sớm ở ngưỡng 7.000 vòng/phút, van VVA không chuyển trạng thái tua cao.</p>
<h3>Quy trình Reset thủ công:</h3>
<ol>
  <li>Tắt công tắc máy, tháo cọc âm (-) ắc quy trong 3 phút.</li>
  <li>Nối thiết bị đọc lỗi chẩn đoán Yamaha FI Tool vào giắc DLC.</li>
  <li>Chọn mục <em>Diagnose Mode</em> &rarr; Code 70 (Reset ECU).</li>
  <li>Chạy thử trên bàn nâng ở tốc độ 60 km/h để kiểm tra độ mở solenoid VVA.</li>
</ol>",
                    SolutionStepsJson = "[\"Kiểm tra giắc cắm van Solenoid VVA\",\"Đo trở kháng cuộn hút VVA (chuẩn: 8-10Ω)\",\"Thực hiện Reset ECU qua cổng DLC\"]",
                    Diagrams = new List<string> { "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600" },
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await context.MechanicDocs.AddRangeAsync(doc1, doc2);
                await context.SaveChangesAsync();
            }
        }
    }
}
