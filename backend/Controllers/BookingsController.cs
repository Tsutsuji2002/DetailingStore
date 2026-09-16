using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DetailingStore.Api.Data;
using DetailingStore.Api.Models;

namespace DetailingStore.Api.Controllers
{
    [ApiController]
    [Route("api/bookings")]
    public class BookingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BookingsController(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/bookings?date=2026-08-28&staffId=...&status=...
        [HttpGet]
        public async Task<IActionResult> GetBookings(
            [FromQuery] string? date,
            [FromQuery] string? staffId,
            [FromQuery] string? status)
        {
            var query = _context.ServiceBookings
                .Include(b => b.Service)
                .Include(b => b.AssignedStaff)
                .Include(b => b.Customer)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(date) && DateOnly.TryParse(date, out var parsedDate))
            {
                query = query.Where(b => b.BookingDate == parsedDate);
            }

            if (!string.IsNullOrWhiteSpace(staffId) && Guid.TryParse(staffId, out var parsedStaffId))
            {
                query = query.Where(b => b.AssignedStaffId == parsedStaffId);
            }

            if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<BookingStatus>(status, true, out var parsedStatus))
            {
                query = query.Where(b => b.Status == parsedStatus);
            }

            var rawList = await query
                .OrderByDescending(b => b.BookingDate)
                .ThenBy(b => b.BookingTime)
                .ToListAsync();

            var items = rawList.Select(b => new
            {
                b.Id,
                b.CustomerId,
                CustomerName = !string.IsNullOrEmpty(b.CustomerName) ? b.CustomerName : (b.Customer != null ? b.Customer.FullName : "Khách Lẻ"),
                CustomerPhone = b.CustomerPhone ?? (b.Customer != null ? b.Customer.Phone : null),
                b.LicensePlate,
                b.VehicleModel,
                b.ServiceId,
                ServiceName = b.Service != null ? b.Service.Name : "Dịch Vụ Chăm Sóc Xe",
                b.AssignedStaffId,
                AssignedStaffName = b.AssignedStaff != null ? b.AssignedStaff.FullName : null,
                AssignedStaffAvatar = b.AssignedStaff != null ? (b.AssignedStaff.AvatarUrl) : null,
                BookingDate = b.BookingDate.ToString("yyyy-MM-dd"),
                BookingTime = b.BookingTime.ToString("HH:mm"),
                Status = b.Status.ToString(),
                b.Notes,
                b.EstimatedCompletion,
                b.TotalPrice,
                b.CreatedAt
            });

            return Ok(items);
        }

        // GET /api/bookings/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var booking = await _context.ServiceBookings
                .Include(b => b.Service)
                .Include(b => b.AssignedStaff)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null) return NotFound(new { message = "Không tìm thấy lịch đặt xe." });

            return Ok(new
            {
                booking.Id,
                booking.CustomerId,
                booking.CustomerName,
                booking.CustomerPhone,
                booking.LicensePlate,
                booking.VehicleModel,
                booking.ServiceId,
                ServiceName = booking.Service?.Name,
                booking.AssignedStaffId,
                AssignedStaffName = booking.AssignedStaff?.FullName,
                BookingDate = booking.BookingDate.ToString("yyyy-MM-dd"),
                BookingTime = booking.BookingTime.ToString("HH:mm"),
                Status = booking.Status.ToString(),
                booking.Notes,
                booking.EstimatedCompletion,
                booking.TotalPrice,
                booking.CreatedAt
            });
        }

        // POST /api/bookings
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] UpsertBookingDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.LicensePlate))
                return BadRequest(new { message = "Vui lòng nhập biển số xe." });

            if (string.IsNullOrWhiteSpace(dto.CustomerName))
                return BadRequest(new { message = "Vui lòng nhập tên khách hàng." });

            DateOnly bookingDate = DateOnly.FromDateTime(DateTime.Today);
            if (!string.IsNullOrWhiteSpace(dto.BookingDate) && DateOnly.TryParse(dto.BookingDate, out var parsedDate))
            {
                bookingDate = parsedDate;
            }

            TimeOnly bookingTime = new TimeOnly(8, 0);
            if (!string.IsNullOrWhiteSpace(dto.BookingTime) && TimeOnly.TryParse(dto.BookingTime, out var parsedTime))
            {
                bookingTime = parsedTime;
            }

            BookingStatus status = BookingStatus.Pending;
            if (!string.IsNullOrWhiteSpace(dto.Status) && Enum.TryParse<BookingStatus>(dto.Status, true, out var parsedStatus))
            {
                status = parsedStatus;
            }

            Guid? assignedStaffId = null;
            if (!string.IsNullOrWhiteSpace(dto.AssignedStaffId) && Guid.TryParse(dto.AssignedStaffId, out var staffId))
            {
                assignedStaffId = staffId;
            }

            Guid serviceId = Guid.Empty;
            if (!string.IsNullOrWhiteSpace(dto.ServiceId) && Guid.TryParse(dto.ServiceId, out var sId))
            {
                serviceId = sId;
            }
            else
            {
                var firstService = await _context.Services.FirstOrDefaultAsync();
                if (firstService != null) serviceId = firstService.Id;
            }

            var booking = new ServiceBooking
            {
                Id = Guid.NewGuid(),
                ServiceId = serviceId,
                AssignedStaffId = assignedStaffId,
                LicensePlate = dto.LicensePlate.Trim(),
                VehicleModel = dto.VehicleModel?.Trim() ?? "Xe máy",
                CustomerName = dto.CustomerName.Trim(),
                CustomerPhone = dto.CustomerPhone?.Trim(),
                BookingDate = bookingDate,
                BookingTime = bookingTime,
                Status = status,
                Notes = dto.Notes,
                EstimatedCompletion = dto.EstimatedCompletion?.Trim(),
                TotalPrice = dto.TotalPrice ?? 0,
                CreatedAt = DateTime.UtcNow
            };

            _context.ServiceBookings.Add(booking);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tạo lịch tiếp nhận xe thành công!", id = booking.Id });
        }

        // PUT /api/bookings/{id:guid}
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpsertBookingDto dto)
        {
            var booking = await _context.ServiceBookings.FindAsync(id);
            if (booking == null) return NotFound(new { message = "Không tìm thấy lịch đặt xe." });

            if (!string.IsNullOrWhiteSpace(dto.LicensePlate)) booking.LicensePlate = dto.LicensePlate.Trim();
            if (!string.IsNullOrWhiteSpace(dto.VehicleModel)) booking.VehicleModel = dto.VehicleModel.Trim();
            if (!string.IsNullOrWhiteSpace(dto.CustomerName)) booking.CustomerName = dto.CustomerName.Trim();
            if (dto.CustomerPhone != null) booking.CustomerPhone = dto.CustomerPhone.Trim();

            if (!string.IsNullOrWhiteSpace(dto.BookingDate) && DateOnly.TryParse(dto.BookingDate, out var parsedDate))
            {
                booking.BookingDate = parsedDate;
            }

            if (!string.IsNullOrWhiteSpace(dto.BookingTime) && TimeOnly.TryParse(dto.BookingTime, out var parsedTime))
            {
                booking.BookingTime = parsedTime;
            }

            if (!string.IsNullOrWhiteSpace(dto.Status) && Enum.TryParse<BookingStatus>(dto.Status, true, out var parsedStatus))
            {
                booking.Status = parsedStatus;
            }

            if (dto.AssignedStaffId != null)
            {
                if (Guid.TryParse(dto.AssignedStaffId, out var staffId))
                    booking.AssignedStaffId = staffId;
                else
                    booking.AssignedStaffId = null;
            }

            if (!string.IsNullOrWhiteSpace(dto.ServiceId) && Guid.TryParse(dto.ServiceId, out var sId))
            {
                booking.ServiceId = sId;
            }

            if (dto.Notes != null) booking.Notes = dto.Notes;
            if (dto.EstimatedCompletion != null) booking.EstimatedCompletion = dto.EstimatedCompletion.Trim();
            if (dto.TotalPrice.HasValue) booking.TotalPrice = dto.TotalPrice.Value;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã cập nhật lịch xe thành công." });
        }

        // PATCH /api/bookings/{id:guid}/status
        [HttpPatch("{id:guid}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateBookingStatusDto dto)
        {
            var booking = await _context.ServiceBookings.FindAsync(id);
            if (booking == null) return NotFound(new { message = "Không tìm thấy lịch xe." });

            if (Enum.TryParse<BookingStatus>(dto.Status, true, out var parsedStatus))
            {
                booking.Status = parsedStatus;
                await _context.SaveChangesAsync();
                return Ok(new { message = "Đã cập nhật trạng thái xe.", status = booking.Status.ToString() });
            }

            return BadRequest(new { message = "Trạng thái không hợp lệ." });
        }

        // DELETE /api/bookings/{id:guid}
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var booking = await _context.ServiceBookings.FindAsync(id);
            if (booking == null) return NotFound(new { message = "Không tìm thấy lịch xe." });

            _context.ServiceBookings.Remove(booking);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa lịch tiếp nhận xe." });
        }
    }

    public class UpsertBookingDto
    {
        public string? ServiceId { get; set; }
        public string? AssignedStaffId { get; set; }
        public string LicensePlate { get; set; } = string.Empty;
        public string VehicleModel { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string? CustomerPhone { get; set; }
        public string? BookingDate { get; set; }
        public string? BookingTime { get; set; }
        public string? Status { get; set; }
        public string? Notes { get; set; }
        public string? EstimatedCompletion { get; set; }
        public decimal? TotalPrice { get; set; }
    }

    public class UpdateBookingStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }
}
