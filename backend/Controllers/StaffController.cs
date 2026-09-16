using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DetailingStore.Api.Data;
using DetailingStore.Api.DTOs;
using DetailingStore.Api.Models;

namespace DetailingStore.Api.Controllers
{
    [ApiController]
    [Route("api/staff")]
    public class StaffController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StaffController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// GET api/staff/available?startTime=2026-01-15T07:30:00&endTime=2026-01-15T11:00:00
        /// Query available staff based on work shift overlap
        /// </summary>
        [HttpGet("available")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<List<AvailableStaffDto>>>> GetAvailableStaff(
            [FromQuery] DateTime startTime,
            [FromQuery] DateTime endTime)
        {
            // 1. Validate endTime > startTime
            if (endTime <= startTime)
            {
                return BadRequest(ApiResponse<List<AvailableStaffDto>>.Fail(
                    "Thời gian kết thúc phải sau thời gian bắt đầu"));
            }

            // 2. Extract date from startTime (YYYY-MM-DD)
            var dateString = startTime.ToString("yyyy-MM-dd");

            // 3. Query work_shifts WHERE Date = extracted_date
            var shiftsOnDate = await _context.WorkShifts
                .Where(ws => ws.Date == dateString)
                .ToListAsync();

            if (!shiftsOnDate.Any())
            {
                return Ok(ApiResponse<List<AvailableStaffDto>>.Ok(
                    new List<AvailableStaffDto>(),
                    "Không tìm thấy ca làm việc nào cho ngày đã chọn"));
            }

            // 4. Load all WorkShiftConfig to get shift start/end times
            var shiftConfigs = await _context.WorkShiftConfigs
                .Where(c => c.IsActive)
                .ToDictionaryAsync(c => c.Id, c => c);

            // 5. Calculate shift absolute times and filter shifts with overlap
            var availableStaffShifts = new Dictionary<Guid, List<(WorkShiftEntity shift, WorkShiftConfigEntity config)>>();

            foreach (var shift in shiftsOnDate)
            {
                // Get the shift config
                if (!shiftConfigs.TryGetValue(shift.ShiftTypeId, out var config))
                {
                    continue; // Skip if config not found or not active
                }

                // Parse shift times and combine with date
                if (!TimeOnly.TryParse(config.StartTime, out var shiftStartTimeOnly) ||
                    !TimeOnly.TryParse(config.EndTime, out var shiftEndTimeOnly))
                {
                    continue; // Skip if time parsing fails
                }

                // Combine date with time to get absolute DateTime
                var shiftStartDateTime = DateOnly.Parse(dateString).ToDateTime(shiftStartTimeOnly);
                var shiftEndDateTime = DateOnly.Parse(dateString).ToDateTime(shiftEndTimeOnly);

                // 6. Filter shifts where shift_start < work_order_end AND shift_end > work_order_start
                if (shiftStartDateTime < endTime && shiftEndDateTime > startTime)
                {
                    // Parse staffId as Guid
                    if (!Guid.TryParse(shift.StaffId, out var staffGuid))
                    {
                        continue; // Skip if staffId is not a valid Guid
                    }

                    if (!availableStaffShifts.ContainsKey(staffGuid))
                    {
                        availableStaffShifts[staffGuid] = new List<(WorkShiftEntity, WorkShiftConfigEntity)>();
                    }

                    availableStaffShifts[staffGuid].Add((shift, config));
                }
            }

            // 7. Get distinct staff IDs from matching shifts
            var staffIds = availableStaffShifts.Keys.ToList();

            if (!staffIds.Any())
            {
                return Ok(ApiResponse<List<AvailableStaffDto>>.Ok(
                    new List<AvailableStaffDto>(),
                    "Không có nhân viên nào có sẵn trong khoảng thời gian được chỉ định"));
            }

            // 8. Load User entities for those staff IDs
            var staffUsers = await _context.Users
                .Where(u => staffIds.Contains(u.Id) && u.Role == UserRole.Staff)
                .ToListAsync();

            // 9. Return list of staff with their shift info
            var result = staffUsers.Select(staff => new AvailableStaffDto
            {
                StaffId = staff.Id,
                StaffName = staff.FullName,
                ProfilePicture = staff.AvatarUrl,
                MatchingShifts = availableStaffShifts[staff.Id]
                    .Select(item => new StaffShiftInfoDto
                    {
                        ShiftTypeName = item.config.Name,
                        ShiftStartTime = item.config.StartTime,
                        ShiftEndTime = item.config.EndTime
                    })
                    .ToList()
            }).ToList();

            return Ok(ApiResponse<List<AvailableStaffDto>>.Ok(
                result,
                $"Đã tìm thấy {result.Count} nhân viên có sẵn"));
        }
    }
}
