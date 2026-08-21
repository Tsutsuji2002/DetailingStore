using Microsoft.AspNetCore.Mvc;
using DetailingStore.Api.DTOs;

namespace DetailingStore.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServicesController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetServices()
        {
            var sampleServices = new[]
            {
                new { Id = "s1", Name = "Detailing Toàn Diện Premium", PriceFrom = 800000, PriceTo = 2500000, Category = "Detailing", Duration = "4-8 giờ" },
                new { Id = "s2", Name = "Rửa Xe & Dưỡng Xe Cơ Bản", PriceFrom = 50000, PriceTo = 150000, Category = "Detailing", Duration = "1-2 giờ" },
                new { Id = "s3", Name = "Sửa Chữa Động Cơ Tổng Thể", PriceFrom = 500000, PriceTo = 3000000, Category = "Sửa Chữa", Duration = "1-3 ngày" }
            };

            return Ok(ApiResponse<object>.Ok(sampleServices, "Fetched services successfully."));
        }
    }
}
