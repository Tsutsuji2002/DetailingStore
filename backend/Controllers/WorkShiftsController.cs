using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DetailingStore.Api.Data;
using DetailingStore.Api.Models;

namespace DetailingStore.Api.Controllers
{
    [ApiController]
    [Route("api/workshifts")]
    public class WorkShiftsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WorkShiftsController(AppDbContext context)
        {
            _context = context;
        }

        #region Shift Config Endpoints (Ca Làm Việc)

        // GET /api/workshifts/configs
        [HttpGet("configs")]
        public async Task<IActionResult> GetConfigs([FromQuery] bool? all)
        {
            var query = _context.WorkShiftConfigs.AsQueryable();
            if (all != true)
                query = query.Where(c => c.IsActive);
            var configs = await query.OrderBy(c => c.CreatedAt).ToListAsync();
            return Ok(configs);
        }

        // POST /api/workshifts/configs (Admin only)
        [Authorize(Roles = "Admin")]
        [HttpPost("configs")]
        public async Task<IActionResult> CreateConfig([FromBody] UpsertWorkShiftConfigDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest("Tên ca làm việc không được để trống.");

            string configId = string.IsNullOrWhiteSpace(dto.Id)
                ? "shift_" + Guid.NewGuid().ToString("N")[..8]
                : dto.Id.Trim().ToLower();

            var existing = await _context.WorkShiftConfigs.FindAsync(configId);
            if (existing != null)
                return BadRequest("Mã ca làm việc này đã tồn tại.");

            var config = new WorkShiftConfigEntity
            {
                Id = configId,
                Name = dto.Name,
                StartTime = dto.StartTime ?? "07:30",
                EndTime = dto.EndTime ?? "12:00",
                Icon = dto.Icon ?? "🌅",
                Color = dto.Color ?? "#3b82f6",
                IsActive = dto.IsActive ?? true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.WorkShiftConfigs.Add(config);
            await _context.SaveChangesAsync();
            return Ok(config);
        }

        // PUT /api/workshifts/configs/{id} (Admin only)
        [Authorize(Roles = "Admin")]
        [HttpPut("configs/{id}")]
        public async Task<IActionResult> UpdateConfig(string id, [FromBody] UpsertWorkShiftConfigDto dto)
        {
            var config = await _context.WorkShiftConfigs.FindAsync(id);
            if (config == null) return NotFound("Không tìm thấy ca làm việc.");

            config.Name = dto.Name ?? config.Name;
            config.StartTime = dto.StartTime ?? config.StartTime;
            config.EndTime = dto.EndTime ?? config.EndTime;
            config.Icon = dto.Icon ?? config.Icon;
            config.Color = dto.Color ?? config.Color;
            config.IsActive = dto.IsActive ?? config.IsActive;
            config.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(config);
        }

        // DELETE /api/workshifts/configs/{id} (Admin only)
        [Authorize(Roles = "Admin")]
        [HttpDelete("configs/{id}")]
        public async Task<IActionResult> DeleteConfig(string id)
        {
            var config = await _context.WorkShiftConfigs.FindAsync(id);
            if (config == null) return NotFound("Không tìm thấy ca làm việc.");

            _context.WorkShiftConfigs.Remove(config);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xóa ca làm việc." });
        }

        #endregion

        #region Assigned Work Shifts Endpoints (Phân Ca)

        // GET /api/workshifts
        [HttpGet]
        public async Task<IActionResult> GetAssignedShifts([FromQuery] string? staffId, [FromQuery] string? date)
        {
            var query = _context.WorkShifts.AsQueryable();

            if (!string.IsNullOrWhiteSpace(staffId))
                query = query.Where(s => s.StaffId == staffId);

            if (!string.IsNullOrWhiteSpace(date))
                query = query.Where(s => s.Date == date);

            var shifts = await query.OrderByDescending(s => s.Date).ThenByDescending(s => s.CreatedAt).ToListAsync();
            return Ok(shifts);
        }

        // POST /api/workshifts (Admin only)
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> AssignShift([FromBody] CreateWorkShiftDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.StaffId))
                return BadRequest("Vui lòng chọn nhân viên.");

            if (string.IsNullOrWhiteSpace(dto.Date))
                return BadRequest("Vui lòng chọn ngày trực.");

            var shift = new WorkShiftEntity
            {
                StaffId = dto.StaffId,
                ShiftTypeId = dto.ShiftTypeId ?? "morning",
                Date = dto.Date,
                Notes = dto.Notes,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.WorkShifts.Add(shift);
            await _context.SaveChangesAsync();
            return Ok(shift);
        }

        // DELETE /api/workshifts/{id:guid} (Admin only)
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteAssignedShift(Guid id)
        {
            var shift = await _context.WorkShifts.FindAsync(id);
            if (shift == null) return NotFound("Không tìm thấy ca trực.");

            _context.WorkShifts.Remove(shift);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xóa ca trực." });
        }

        #endregion
    }

    public class UpsertWorkShiftConfigDto
    {
        public string? Id { get; set; }
        public string? Name { get; set; }
        public string? StartTime { get; set; }
        public string? EndTime { get; set; }
        public string? Icon { get; set; }
        public string? Color { get; set; }
        public bool? IsActive { get; set; }
    }

    public class CreateWorkShiftDto
    {
        public string StaffId { get; set; } = string.Empty;
        public string ShiftTypeId { get; set; } = "morning";
        public string Date { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }
}
