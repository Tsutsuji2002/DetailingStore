using Microsoft.AspNetCore.Mvc;
using DetailingStore.Api.DTOs;

namespace DetailingStore.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        [HttpGet]
        public IActionResult CheckHealth()
        {
            var healthStatus = new
            {
                Status = "Healthy",
                Application = "Detailing Store API",
                Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development",
                ServerTime = DateTime.UtcNow
            };

            return Ok(ApiResponse<object>.Ok(healthStatus, "Detailing Store API backend is up and running."));
        }
    }
}
