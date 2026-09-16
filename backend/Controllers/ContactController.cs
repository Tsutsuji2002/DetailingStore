using DetailingStore.Api.DTOs;
using DetailingStore.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DetailingStore.Api.Controllers
{
    [ApiController]
    [Route("api/contact")]
    public class ContactController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly ILogger<ContactController> _logger;

        public ContactController(IEmailService emailService, ILogger<ContactController> logger)
        {
            _emailService = emailService;
            _logger = logger;
        }

        /// <summary>
        /// POST /api/contact
        /// Receives a contact form message and forwards it to the shop's email.
        /// No authentication required — public endpoint.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ApiResponse<object>>> SendContactMessage(
            [FromBody] ContactMessageDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.Fail("Dữ liệu không hợp lệ."));

            // Fire-and-forget — don't block response on email delivery
            _ = Task.Run(async () =>
            {
                await _emailService.SendContactMessageAsync(
                    dto.Name,
                    dto.Phone,
                    dto.Email ?? string.Empty,
                    dto.Message);
            });

            _logger.LogInformation("Contact message received from {Name} ({Phone}).", dto.Name, dto.Phone);

            return Ok(ApiResponse<object>.Ok(new { }, "Lời nhắn của bạn đã được gửi thành công."));
        }
    }
}
