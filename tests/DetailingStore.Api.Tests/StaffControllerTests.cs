using System.Security.Claims;
using DetailingStore.Api.Controllers;
using DetailingStore.Api.Data;
using DetailingStore.Api.DTOs;
using DetailingStore.Api.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace DetailingStore.Api.Tests
{
    /// <summary>
    /// Unit tests for StaffController.
    /// Tests staff availability query functionality based on work shift overlap.
    /// 
    /// **Validates: Requirements 6, 12**
    /// </summary>
    public class StaffControllerTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly StaffController _controller;
        private readonly User _staff1;
        private readonly User _staff2;
        private readonly User _staff3;
        private readonly WorkShiftConfigEntity _morningShiftConfig;
        private readonly WorkShiftConfigEntity _afternoonShiftConfig;
        private readonly WorkShiftConfigEntity _eveningShiftConfig;

        public StaffControllerTests()
        {
            // Setup in-memory database
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new AppDbContext(options);

            // Create test staff users
            _staff1 = new User
            {
                Id = Guid.NewGuid(),
                FirstName = "Staff",
                LastName = "One",
                Email = "staff1@example.com",
                Username = "staff1",
                Role = UserRole.Staff,
                PasswordHash = "hashedpassword",
                AuthProvider = "local",
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };

            _staff2 = new User
            {
                Id = Guid.NewGuid(),
                FirstName = "Staff",
                LastName = "Two",
                Email = "staff2@example.com",
                Username = "staff2",
                Role = UserRole.Staff,
                PasswordHash = "hashedpassword",
                AuthProvider = "local",
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };

            _staff3 = new User
            {
                Id = Guid.NewGuid(),
                FirstName = "Staff",
                LastName = "Three",
                Email = "staff3@example.com",
                Username = "staff3",
                Role = UserRole.Staff,
                PasswordHash = "hashedpassword",
                AuthProvider = "local",
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.AddRange(_staff1, _staff2, _staff3);

            // Create shift configurations
            _morningShiftConfig = new WorkShiftConfigEntity
            {
                Id = "morning",
                Name = "Ca Sáng",
                StartTime = "07:30",
                EndTime = "12:00",
                Icon = "🌅",
                Color = "#3b82f6",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _afternoonShiftConfig = new WorkShiftConfigEntity
            {
                Id = "afternoon",
                Name = "Ca Chiều",
                StartTime = "13:00",
                EndTime = "17:00",
                Icon = "☀️",
                Color = "#f59e0b",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _eveningShiftConfig = new WorkShiftConfigEntity
            {
                Id = "evening",
                Name = "Ca Tối",
                StartTime = "17:00",
                EndTime = "21:00",
                Icon = "🌙",
                Color = "#8b5cf6",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.WorkShiftConfigs.AddRange(_morningShiftConfig, _afternoonShiftConfig, _eveningShiftConfig);
            _context.SaveChanges();

            // Create controller
            _controller = new StaffController(_context);

            // Setup authenticated admin user context
            SetupAuthenticatedAdmin();
        }

        private void SetupAuthenticatedAdmin()
        {
            var adminId = Guid.NewGuid();
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, adminId.ToString()),
                new Claim(ClaimTypes.Role, "Admin")
            };
            var identity = new ClaimsIdentity(claims, "TestAuthType");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };
        }

        [Fact]
        public async Task GetAvailableStaff_ValidTimeRange_ReturnsStaffWithOverlappingShifts()
        {
            // Arrange
            var targetDate = "2026-01-15";
            var workOrderStart = new DateTime(2026, 1, 15, 9, 0, 0); // 9:00 AM
            var workOrderEnd = new DateTime(2026, 1, 15, 11, 0, 0);   // 11:00 AM

            // Staff1 has morning shift (7:30-12:00) - should overlap
            var shift1 = new WorkShiftEntity
            {
                Id = Guid.NewGuid(),
                StaffId = _staff1.Id.ToString(),
                ShiftTypeId = "morning",
                Date = targetDate,
                CreatedAt = DateTime.UtcNow
            };

            _context.WorkShifts.Add(shift1);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetAvailableStaff(workOrderStart, workOrderEnd);

            // Assert
            var actionResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponse<List<AvailableStaffDto>>>(actionResult.Value);

            Assert.True(response.Success);
            Assert.NotNull(response.Data);
            Assert.Single(response.Data);
            Assert.Equal(_staff1.Id, response.Data[0].StaffId);
            Assert.Equal("One Staff", response.Data[0].StaffName);
            Assert.Single(response.Data[0].MatchingShifts);
            Assert.Equal("Ca Sáng", response.Data[0].MatchingShifts[0].ShiftTypeName);
        }

        [Fact]
        public async Task GetAvailableStaff_MultipleStaffWithOverlappingShifts_ReturnsAll()
        {
            // Arrange
            var targetDate = "2026-01-20";
            var workOrderStart = new DateTime(2026, 1, 20, 10, 0, 0); // 10:00 AM
            var workOrderEnd = new DateTime(2026, 1, 20, 11, 30, 0);   // 11:30 AM

            // Staff1 and Staff2 have morning shifts - both should overlap
            var shift1 = new WorkShiftEntity
            {
                Id = Guid.NewGuid(),
                StaffId = _staff1.Id.ToString(),
                ShiftTypeId = "morning",
                Date = targetDate,
                CreatedAt = DateTime.UtcNow
            };

            var shift2 = new WorkShiftEntity
            {
                Id = Guid.NewGuid(),
                StaffId = _staff2.Id.ToString(),
                ShiftTypeId = "morning",
                Date = targetDate,
                CreatedAt = DateTime.UtcNow
            };

            _context.WorkShifts.AddRange(shift1, shift2);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetAvailableStaff(workOrderStart, workOrderEnd);

            // Assert
            var actionResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponse<List<AvailableStaffDto>>>(actionResult.Value);

            Assert.True(response.Success);
            Assert.NotNull(response.Data);
            Assert.Equal(2, response.Data.Count);
            Assert.Contains(response.Data, s => s.StaffId == _staff1.Id);
            Assert.Contains(response.Data, s => s.StaffId == _staff2.Id);
        }

        [Fact]
        public async Task GetAvailableStaff_NoOverlappingShifts_ReturnsEmptyList()
        {
            // Arrange
            var targetDate = "2026-01-25";
            var workOrderStart = new DateTime(2026, 1, 25, 14, 0, 0); // 2:00 PM
            var workOrderEnd = new DateTime(2026, 1, 25, 15, 0, 0);   // 3:00 PM

            // Staff1 has morning shift (7:30-12:00) - no overlap with afternoon work order
            var shift1 = new WorkShiftEntity
            {
                Id = Guid.NewGuid(),
                StaffId = _staff1.Id.ToString(),
                ShiftTypeId = "morning",
                Date = targetDate,
                CreatedAt = DateTime.UtcNow
            };

            _context.WorkShifts.Add(shift1);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetAvailableStaff(workOrderStart, workOrderEnd);

            // Assert
            var actionResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponse<List<AvailableStaffDto>>>(actionResult.Value);

            Assert.True(response.Success);
            Assert.NotNull(response.Data);
            Assert.Empty(response.Data);
            Assert.Contains("Không có nhân viên nào có sẵn", response.Message);
        }

        [Fact]
        public async Task GetAvailableStaff_NoShiftsOnDate_ReturnsEmptyList()
        {
            // Arrange
            var workOrderStart = new DateTime(2026, 2, 1, 9, 0, 0);
            var workOrderEnd = new DateTime(2026, 2, 1, 11, 0, 0);

            // No shifts created for this date

            // Act
            var result = await _controller.GetAvailableStaff(workOrderStart, workOrderEnd);

            // Assert
            var actionResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponse<List<AvailableStaffDto>>>(actionResult.Value);

            Assert.True(response.Success);
            Assert.NotNull(response.Data);
            Assert.Empty(response.Data);
            Assert.Contains("Không tìm thấy ca làm việc", response.Message);
        }

        [Fact]
        public async Task GetAvailableStaff_EndTimeBeforeStartTime_ReturnsBadRequest()
        {
            // Arrange
            var workOrderStart = new DateTime(2026, 1, 15, 11, 0, 0);
            var workOrderEnd = new DateTime(2026, 1, 15, 9, 0, 0); // End before start

            // Act
            var result = await _controller.GetAvailableStaff(workOrderStart, workOrderEnd);

            // Assert
            var actionResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponse<List<AvailableStaffDto>>>(actionResult.Value);

            Assert.False(response.Success);
            Assert.Contains("phải sau thời gian bắt đầu", response.Message);
        }

        [Fact]
        public async Task GetAvailableStaff_WorkOrderSpansEntireShift_IncludesStaff()
        {
            // Arrange
            var targetDate = "2026-01-30";
            var workOrderStart = new DateTime(2026, 1, 30, 7, 0, 0); // 7:00 AM (before shift)
            var workOrderEnd = new DateTime(2026, 1, 30, 13, 0, 0);   // 1:00 PM (after shift)

            // Staff1 has morning shift (7:30-12:00) - work order spans entire shift
            var shift1 = new WorkShiftEntity
            {
                Id = Guid.NewGuid(),
                StaffId = _staff1.Id.ToString(),
                ShiftTypeId = "morning",
                Date = targetDate,
                CreatedAt = DateTime.UtcNow
            };

            _context.WorkShifts.Add(shift1);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetAvailableStaff(workOrderStart, workOrderEnd);

            // Assert
            var actionResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponse<List<AvailableStaffDto>>>(actionResult.Value);

            Assert.True(response.Success);
            Assert.NotNull(response.Data);
            Assert.Single(response.Data);
            Assert.Equal(_staff1.Id, response.Data[0].StaffId);
        }

        [Fact]
        public async Task GetAvailableStaff_WorkOrderAtShiftBoundary_IncludesStaff()
        {
            // Arrange
            var targetDate = "2026-02-05";
            var workOrderStart = new DateTime(2026, 2, 5, 11, 30, 0); // 11:30 AM (near shift end)
            var workOrderEnd = new DateTime(2026, 2, 5, 13, 30, 0);   // 1:30 PM (into afternoon)

            // Staff1 has morning shift (7:30-12:00) - overlaps at boundary
            // Staff2 has afternoon shift (13:00-17:00) - overlaps at boundary
            var shift1 = new WorkShiftEntity
            {
                Id = Guid.NewGuid(),
                StaffId = _staff1.Id.ToString(),
                ShiftTypeId = "morning",
                Date = targetDate,
                CreatedAt = DateTime.UtcNow
            };

            var shift2 = new WorkShiftEntity
            {
                Id = Guid.NewGuid(),
                StaffId = _staff2.Id.ToString(),
                ShiftTypeId = "afternoon",
                Date = targetDate,
                CreatedAt = DateTime.UtcNow
            };

            _context.WorkShifts.AddRange(shift1, shift2);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetAvailableStaff(workOrderStart, workOrderEnd);

            // Assert
            var actionResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponse<List<AvailableStaffDto>>>(actionResult.Value);

            Assert.True(response.Success);
            Assert.NotNull(response.Data);
            Assert.Equal(2, response.Data.Count);
        }

        [Fact]
        public async Task GetAvailableStaff_StaffWithMultipleShiftsOnSameDay_ReturnsAllMatchingShifts()
        {
            // Arrange
            var targetDate = "2026-02-10";
            var workOrderStart = new DateTime(2026, 2, 10, 11, 0, 0); // 11:00 AM
            var workOrderEnd = new DateTime(2026, 2, 10, 18, 0, 0);   // 6:00 PM

            // Staff1 has both morning and afternoon shifts - both should be included
            var shift1Morning = new WorkShiftEntity
            {
                Id = Guid.NewGuid(),
                StaffId = _staff1.Id.ToString(),
                ShiftTypeId = "morning",
                Date = targetDate,
                CreatedAt = DateTime.UtcNow
            };

            var shift1Afternoon = new WorkShiftEntity
            {
                Id = Guid.NewGuid(),
                StaffId = _staff1.Id.ToString(),
                ShiftTypeId = "afternoon",
                Date = targetDate,
                CreatedAt = DateTime.UtcNow
            };

            _context.WorkShifts.AddRange(shift1Morning, shift1Afternoon);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetAvailableStaff(workOrderStart, workOrderEnd);

            // Assert
            var actionResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponse<List<AvailableStaffDto>>>(actionResult.Value);

            Assert.True(response.Success);
            Assert.NotNull(response.Data);
            Assert.Single(response.Data);
            Assert.Equal(_staff1.Id, response.Data[0].StaffId);
            Assert.Equal(2, response.Data[0].MatchingShifts.Count);
        }

        [Fact]
        public async Task GetAvailableStaff_InactiveShiftConfig_ExcludesStaff()
        {
            // Arrange
            var targetDate = "2026-02-15";
            var workOrderStart = new DateTime(2026, 2, 15, 9, 0, 0);
            var workOrderEnd = new DateTime(2026, 2, 15, 11, 0, 0);

            // Create an inactive shift config
            var inactiveConfig = new WorkShiftConfigEntity
            {
                Id = "inactive",
                Name = "Inactive Shift",
                StartTime = "08:00",
                EndTime = "12:00",
                IsActive = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.WorkShiftConfigs.Add(inactiveConfig);

            // Staff1 has shift with inactive config
            var shift1 = new WorkShiftEntity
            {
                Id = Guid.NewGuid(),
                StaffId = _staff1.Id.ToString(),
                ShiftTypeId = "inactive",
                Date = targetDate,
                CreatedAt = DateTime.UtcNow
            };

            _context.WorkShifts.Add(shift1);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetAvailableStaff(workOrderStart, workOrderEnd);

            // Assert
            var actionResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponse<List<AvailableStaffDto>>>(actionResult.Value);

            Assert.True(response.Success);
            Assert.NotNull(response.Data);
            Assert.Empty(response.Data);
        }

        [Fact]
        public async Task GetAvailableStaff_OverlapAlgorithm_ShiftStartLessThanWorkOrderEnd()
        {
            // Arrange - Test: shift_start < work_order_end
            var targetDate = "2026-02-20";
            var workOrderStart = new DateTime(2026, 2, 20, 8, 0, 0);  // 8:00 AM
            var workOrderEnd = new DateTime(2026, 2, 20, 8, 30, 0);    // 8:30 AM

            // Staff1 has morning shift starting at 7:30 (shift_start < work_order_end)
            var shift1 = new WorkShiftEntity
            {
                Id = Guid.NewGuid(),
                StaffId = _staff1.Id.ToString(),
                ShiftTypeId = "morning",
                Date = targetDate,
                CreatedAt = DateTime.UtcNow
            };

            _context.WorkShifts.Add(shift1);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetAvailableStaff(workOrderStart, workOrderEnd);

            // Assert
            var actionResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponse<List<AvailableStaffDto>>>(actionResult.Value);

            Assert.True(response.Success);
            Assert.Single(response.Data);
        }

        [Fact]
        public async Task GetAvailableStaff_OverlapAlgorithm_ShiftEndGreaterThanWorkOrderStart()
        {
            // Arrange - Test: shift_end > work_order_start
            var targetDate = "2026-02-25";
            var workOrderStart = new DateTime(2026, 2, 25, 11, 30, 0); // 11:30 AM
            var workOrderEnd = new DateTime(2026, 2, 25, 13, 0, 0);    // 1:00 PM

            // Staff1 has morning shift ending at 12:00 (shift_end > work_order_start)
            var shift1 = new WorkShiftEntity
            {
                Id = Guid.NewGuid(),
                StaffId = _staff1.Id.ToString(),
                ShiftTypeId = "morning",
                Date = targetDate,
                CreatedAt = DateTime.UtcNow
            };

            _context.WorkShifts.Add(shift1);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetAvailableStaff(workOrderStart, workOrderEnd);

            // Assert
            var actionResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponse<List<AvailableStaffDto>>>(actionResult.Value);

            Assert.True(response.Success);
            Assert.Single(response.Data);
        }

        [Fact]
        public async Task GetAvailableStaff_InvalidStaffId_ExcludesInvalidEntry()
        {
            // Arrange
            var targetDate = "2026-03-01";
            var workOrderStart = new DateTime(2026, 3, 1, 9, 0, 0);
            var workOrderEnd = new DateTime(2026, 3, 1, 11, 0, 0);

            // Valid staff shift
            var validShift = new WorkShiftEntity
            {
                Id = Guid.NewGuid(),
                StaffId = _staff1.Id.ToString(),
                ShiftTypeId = "morning",
                Date = targetDate,
                CreatedAt = DateTime.UtcNow
            };

            // Invalid staff ID (not a valid GUID)
            var invalidShift = new WorkShiftEntity
            {
                Id = Guid.NewGuid(),
                StaffId = "invalid-staff-id",
                ShiftTypeId = "morning",
                Date = targetDate,
                CreatedAt = DateTime.UtcNow
            };

            _context.WorkShifts.AddRange(validShift, invalidShift);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetAvailableStaff(workOrderStart, workOrderEnd);

            // Assert
            var actionResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponse<List<AvailableStaffDto>>>(actionResult.Value);

            Assert.True(response.Success);
            Assert.Single(response.Data); // Only valid staff should be returned
            Assert.Equal(_staff1.Id, response.Data[0].StaffId);
        }

        [Fact]
        public async Task GetAvailableStaff_IncludesProfilePicture()
        {
            // Arrange
            var targetDate = "2026-03-05";
            var workOrderStart = new DateTime(2026, 3, 5, 9, 0, 0);
            var workOrderEnd = new DateTime(2026, 3, 5, 11, 0, 0);

            // Update staff with avatar URL
            _staff1.AvatarUrl = "https://example.com/avatar1.jpg";
            _context.Users.Update(_staff1);

            var shift1 = new WorkShiftEntity
            {
                Id = Guid.NewGuid(),
                StaffId = _staff1.Id.ToString(),
                ShiftTypeId = "morning",
                Date = targetDate,
                CreatedAt = DateTime.UtcNow
            };

            _context.WorkShifts.Add(shift1);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetAvailableStaff(workOrderStart, workOrderEnd);

            // Assert
            var actionResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponse<List<AvailableStaffDto>>>(actionResult.Value);

            Assert.True(response.Success);
            Assert.Single(response.Data);
            Assert.Equal("https://example.com/avatar1.jpg", response.Data[0].ProfilePicture);
        }

        [Fact]
        public async Task GetAvailableStaff_IncludesShiftDetails()
        {
            // Arrange
            var targetDate = "2026-03-10";
            var workOrderStart = new DateTime(2026, 3, 10, 9, 0, 0);
            var workOrderEnd = new DateTime(2026, 3, 10, 11, 0, 0);

            var shift1 = new WorkShiftEntity
            {
                Id = Guid.NewGuid(),
                StaffId = _staff1.Id.ToString(),
                ShiftTypeId = "morning",
                Date = targetDate,
                CreatedAt = DateTime.UtcNow
            };

            _context.WorkShifts.Add(shift1);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetAvailableStaff(workOrderStart, workOrderEnd);

            // Assert
            var actionResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponse<List<AvailableStaffDto>>>(actionResult.Value);

            Assert.True(response.Success);
            Assert.Single(response.Data);
            Assert.Single(response.Data[0].MatchingShifts);
            
            var shiftInfo = response.Data[0].MatchingShifts[0];
            Assert.Equal("Ca Sáng", shiftInfo.ShiftTypeName);
            Assert.Equal("07:30", shiftInfo.ShiftStartTime);
            Assert.Equal("12:00", shiftInfo.ShiftEndTime);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
