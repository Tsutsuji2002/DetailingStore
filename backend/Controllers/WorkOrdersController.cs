using System.Security.Claims;
using System.Text.Json;
using DetailingStore.Api.Data;
using DetailingStore.Api.DTOs;
using DetailingStore.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DetailingStore.Api.Controllers
{
    [ApiController]
    [Route("api/work-orders")]
    public class WorkOrdersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<WorkOrdersController> _logger;

        public WorkOrdersController(
            AppDbContext context,
            ILogger<WorkOrdersController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Admin creates work order directly (for walk-in customers)
        /// POST /api/work-orders
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<WorkOrderDto>>> CreateWorkOrder(
            [FromBody] CreateWorkOrderDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<WorkOrderDto>.Fail("Dữ liệu không hợp lệ"));

            // Extract authenticated admin ID from JWT claims
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                           ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var authenticatedAdminId))
            {
                return Unauthorized(ApiResponse<WorkOrderDto>.Fail("Không thể xác thực người dùng"));
            }

            // Validate scheduled times (end > start)
            if (dto.ScheduledEndTime <= dto.ScheduledStartTime)
            {
                return BadRequest(ApiResponse<WorkOrderDto>.Fail(
                    "Thời gian kết thúc phải sau thời gian bắt đầu"));
            }

            // Validate service details not empty
            if (string.IsNullOrWhiteSpace(dto.ServiceDetails))
            {
                return BadRequest(ApiResponse<WorkOrderDto>.Fail("Chi tiết dịch vụ là bắt buộc"));
            }

            // Validate vehicle info fields
            if (string.IsNullOrWhiteSpace(dto.VehicleInfo.LicensePlate))
            {
                return BadRequest(ApiResponse<WorkOrderDto>.Fail("Biển số xe là bắt buộc"));
            }

            // Serialize VehicleInfo to JSON
            string vehicleInfoJson;
            try
            {
                vehicleInfoJson = JsonSerializer.Serialize(dto.VehicleInfo);
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Failed to serialize VehicleInfo");
                return BadRequest(ApiResponse<WorkOrderDto>.Fail("Thông tin xe không hợp lệ"));
            }

            // Serialize AssignedStaffIds to JSON
            string assignedStaffIdsJson;
            try
            {
                assignedStaffIdsJson = JsonSerializer.Serialize(dto.AssignedStaffIds);
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Failed to serialize AssignedStaffIds");
                return BadRequest(ApiResponse<WorkOrderDto>.Fail("Danh sách nhân viên không hợp lệ"));
            }

            // Create WorkOrderEntity with RequestSource = DirectEntry
            var workOrder = new WorkOrderEntity
            {
                Id = Guid.NewGuid(),
                ScheduledStartTime = dto.ScheduledStartTime,
                ScheduledEndTime = dto.ScheduledEndTime,
                AssignedStaffIds = assignedStaffIdsJson,
                RequestSource = RequestSource.DirectEntry,
                VehicleInfo = vehicleInfoJson,
                ServiceDetails = dto.ServiceDetails,
                WorkOrderStatus = WorkOrderStatus.Pending,
                CustomerId = dto.CustomerId,
                CustomerName = dto.CustomerName,
                CustomerPhone = dto.CustomerPhone,
                CustomerEmail = dto.CustomerEmail,
                PriceQuote = dto.PriceQuote,
                AdminNotes = dto.AdminNotes,
                CreatedByAdminId = authenticatedAdminId,
                CreatedAt = DateTime.UtcNow
            };

            // Save to database
            await _context.WorkOrders.AddAsync(workOrder);
            await _context.SaveChangesAsync();

            // Build response WorkOrderDto
            var workOrderDto = new WorkOrderDto
            {
                Id = workOrder.Id,
                ScheduledStartTime = workOrder.ScheduledStartTime,
                ScheduledEndTime = workOrder.ScheduledEndTime,
                AssignedStaffIds = dto.AssignedStaffIds,
                AssignedStaff = new List<StaffSummaryDto>(), // Empty for now, can be populated if needed
                RequestSource = workOrder.RequestSource,
                VehicleInfo = dto.VehicleInfo,
                ServiceDetails = workOrder.ServiceDetails,
                WorkOrderStatus = workOrder.WorkOrderStatus,
                CustomerId = workOrder.CustomerId,
                CustomerName = workOrder.CustomerName,
                CustomerPhone = workOrder.CustomerPhone,
                CustomerEmail = workOrder.CustomerEmail,
                PriceQuote = workOrder.PriceQuote,
                AdminNotes = workOrder.AdminNotes,
                CreatedByAdminId = workOrder.CreatedByAdminId,
                CreatedByAdminName = string.Empty, // Could be populated from admin user if needed
                CreatedAt = workOrder.CreatedAt,
                CompletedAt = workOrder.CompletedAt,
                IsExpired = workOrder.ScheduledEndTime < DateTime.UtcNow && 
                           workOrder.WorkOrderStatus != WorkOrderStatus.Completed,
                IsExpiringSoon = (workOrder.ScheduledEndTime - DateTime.UtcNow).TotalMinutes <= 30 &&
                                workOrder.WorkOrderStatus != WorkOrderStatus.Completed
            };

            _logger.LogInformation(
                "Work order {WorkOrderId} created directly by admin {AdminId}",
                workOrder.Id, authenticatedAdminId);

            return CreatedAtAction(
                nameof(CreateWorkOrder),
                new { id = workOrder.Id },
                ApiResponse<WorkOrderDto>.Ok(
                    workOrderDto,
                    "Lệnh làm việc đã được tạo thành công"));
        }

        /// <summary>
        /// Get work orders with role-based filtering
        /// GET /api/work-orders
        /// - Staff: returns only work orders assigned to the authenticated staff member
        /// - Admin: returns all work orders with optional filters (staffId, status, date)
        /// - Customer: returns work orders associated with the authenticated customer
        /// </summary>
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<ApiResponse<List<WorkOrderDto>>>> GetWorkOrders(
            [FromQuery] Guid? staffId = null,
            [FromQuery] WorkOrderStatus? status = null,
            [FromQuery] DateOnly? date = null)
        {
            // Extract authenticated user ID and role
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                           ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var authenticatedUserId))
            {
                return Unauthorized(ApiResponse<List<WorkOrderDto>>.Fail("Không thể xác thực người dùng"));
            }

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            // Start building the query with related entities
            var query = _context.WorkOrders
                .Include(wo => wo.Customer)
                .Include(wo => wo.CreatedByAdmin)
                .AsQueryable();

            if (userRole == "Staff")
            {
                // Staff: filter to only work orders where this staff member is assigned
                // Use string Contains on the JSONB field to find the staff ID
                var staffIdStr = authenticatedUserId.ToString();
                query = query.Where(wo => wo.AssignedStaffIds.Contains(staffIdStr));
            }
            else if (userRole == "Admin")
            {
                // Admin: apply optional filters
                if (staffId.HasValue)
                {
                    var filterStaffIdStr = staffId.Value.ToString();
                    query = query.Where(wo => wo.AssignedStaffIds.Contains(filterStaffIdStr));
                }

                if (status.HasValue)
                {
                    query = query.Where(wo => wo.WorkOrderStatus == status.Value);
                }

                if (date.HasValue)
                {
                    // Filter work orders that overlap with the given date
                    var dateStart = date.Value.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
                    var dateEnd = date.Value.ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc);
                    query = query.Where(wo => wo.ScheduledStartTime <= dateEnd && wo.ScheduledEndTime >= dateStart);
                }
            }
            else
            {
                // Customer: filter to work orders associated with the authenticated customer
                query = query.Where(wo => wo.CustomerId == authenticatedUserId);
            }

            // Order by ScheduledStartTime ascending
            var workOrders = await query
                .OrderBy(wo => wo.ScheduledStartTime)
                .ToListAsync();

            // Collect all unique assigned staff IDs across all work orders
            var allStaffIds = new HashSet<Guid>();
            var staffIdsByOrder = new Dictionary<Guid, List<Guid>>();

            foreach (var wo in workOrders)
            {
                var staffIds = DeserializeStaffIds(wo.AssignedStaffIds);
                staffIdsByOrder[wo.Id] = staffIds;
                foreach (var sid in staffIds)
                    allStaffIds.Add(sid);
            }

            // Load all referenced staff users in one query
            var staffUsers = allStaffIds.Count > 0
                ? await _context.Users
                    .Where(u => allStaffIds.Contains(u.Id))
                    .ToDictionaryAsync(u => u.Id)
                : new Dictionary<Guid, User>();

            var now = DateTime.UtcNow;
            var responseDtos = workOrders.Select(wo =>
            {
                var assignedIds = staffIdsByOrder[wo.Id];
                var vehicleInfo = DeserializeVehicleInfo(wo.VehicleInfo);
                var adminName = wo.CreatedByAdmin != null
                    ? wo.CreatedByAdmin.FullName
                    : string.Empty;

                return new WorkOrderDto
                {
                    Id = wo.Id,
                    ScheduledStartTime = wo.ScheduledStartTime,
                    ScheduledEndTime = wo.ScheduledEndTime,
                    AssignedStaffIds = assignedIds,
                    AssignedStaff = assignedIds
                        .Where(staffUsers.ContainsKey)
                        .Select(sid => new StaffSummaryDto
                        {
                            Id = sid,
                            Name = staffUsers[sid].FullName,
                            ProfilePicture = staffUsers[sid].AvatarUrl
                        })
                        .ToList(),
                    RequestSource = wo.RequestSource,
                    VehicleInfo = vehicleInfo,
                    ServiceDetails = wo.ServiceDetails,
                    WorkOrderStatus = wo.WorkOrderStatus,
                    CustomerId = wo.CustomerId,
                    CustomerName = wo.CustomerName,
                    CustomerPhone = wo.CustomerPhone,
                    CustomerEmail = wo.CustomerEmail,
                    PriceQuote = wo.PriceQuote,
                    AdminNotes = wo.AdminNotes,
                    CreatedByAdminId = wo.CreatedByAdminId,
                    CreatedByAdminName = adminName,
                    CreatedAt = wo.CreatedAt,
                    CompletedAt = wo.CompletedAt,
                    IsExpired = wo.ScheduledEndTime < now &&
                               wo.WorkOrderStatus != WorkOrderStatus.Completed &&
                               wo.WorkOrderStatus != WorkOrderStatus.Rejected,
                    IsExpiringSoon = (wo.ScheduledEndTime - now).TotalMinutes <= 30 &&
                                    (wo.ScheduledEndTime - now).TotalMinutes > 0 &&
                                    wo.WorkOrderStatus != WorkOrderStatus.Completed
                };
            }).ToList();

            return Ok(ApiResponse<List<WorkOrderDto>>.Ok(responseDtos));
        }

        /// <summary>
        /// Get a single work order by ID
        /// GET /api/work-orders/{id}
        /// - Staff: only accessible if the staff member is assigned to the work order
        /// - Admin / Customer: can access any work order (admin: any; customer: only their own)
        /// </summary>
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<WorkOrderDetailDto>>> GetWorkOrderById(Guid id)
        {
            // Extract authenticated user ID and role
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                           ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var authenticatedUserId))
            {
                return Unauthorized(ApiResponse<WorkOrderDetailDto>.Fail("Không thể xác thực người dùng"));
            }

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            // Load work order with all related data
            var workOrder = await _context.WorkOrders
                .Include(wo => wo.Customer)
                .Include(wo => wo.CreatedByAdmin)
                .Include(wo => wo.OriginServiceRequest)
                .FirstOrDefaultAsync(wo => wo.Id == id);

            if (workOrder == null)
            {
                return NotFound(ApiResponse<WorkOrderDetailDto>.Fail("Không tìm thấy lệnh làm việc"));
            }

            var assignedIds = DeserializeStaffIds(workOrder.AssignedStaffIds);

            // Role-based access control
            if (userRole == "Staff")
            {
                // Staff can only access work orders they are assigned to
                if (!assignedIds.Contains(authenticatedUserId))
                {
                    return StatusCode(403, ApiResponse<WorkOrderDetailDto>.Fail(
                        "Bạn không có quyền truy cập lệnh làm việc này"));
                }
            }
            else if (userRole == "Customer")
            {
                // Customers can only access their own work orders
                if (workOrder.CustomerId != authenticatedUserId)
                {
                    return StatusCode(403, ApiResponse<WorkOrderDetailDto>.Fail(
                        "Bạn không có quyền truy cập lệnh làm việc này"));
                }
            }
            // Admin: unrestricted access

            // Load staff details for assigned staff IDs
            var staffUsers = assignedIds.Count > 0
                ? await _context.Users
                    .Where(u => assignedIds.Contains(u.Id))
                    .ToDictionaryAsync(u => u.Id)
                : new Dictionary<Guid, User>();

            var vehicleInfo = DeserializeVehicleInfo(workOrder.VehicleInfo);
            var adminName = workOrder.CreatedByAdmin != null
                ? workOrder.CreatedByAdmin.FullName
                : string.Empty;

            var now = DateTime.UtcNow;
            var detailDto = new WorkOrderDetailDto
            {
                Id = workOrder.Id,
                ScheduledStartTime = workOrder.ScheduledStartTime,
                ScheduledEndTime = workOrder.ScheduledEndTime,
                AssignedStaffIds = assignedIds,
                AssignedStaff = assignedIds
                    .Where(staffUsers.ContainsKey)
                    .Select(sid => new StaffSummaryDto
                    {
                        Id = sid,
                        Name = staffUsers[sid].FullName,
                        ProfilePicture = staffUsers[sid].AvatarUrl
                    })
                    .ToList(),
                RequestSource = workOrder.RequestSource,
                VehicleInfo = vehicleInfo,
                ServiceDetails = workOrder.ServiceDetails,
                WorkOrderStatus = workOrder.WorkOrderStatus,
                CustomerId = workOrder.CustomerId,
                CustomerName = workOrder.CustomerName,
                CustomerPhone = workOrder.CustomerPhone,
                CustomerEmail = workOrder.CustomerEmail,
                PriceQuote = workOrder.PriceQuote,
                AdminNotes = workOrder.AdminNotes,
                CreatedByAdminId = workOrder.CreatedByAdminId,
                CreatedByAdminName = adminName,
                CreatedAt = workOrder.CreatedAt,
                CompletedAt = workOrder.CompletedAt,
                IsExpired = workOrder.ScheduledEndTime < now &&
                           workOrder.WorkOrderStatus != WorkOrderStatus.Completed &&
                           workOrder.WorkOrderStatus != WorkOrderStatus.Rejected,
                IsExpiringSoon = (workOrder.ScheduledEndTime - now).TotalMinutes <= 30 &&
                                (workOrder.ScheduledEndTime - now).TotalMinutes > 0 &&
                                workOrder.WorkOrderStatus != WorkOrderStatus.Completed,
                OriginServiceRequestId = workOrder.OriginServiceRequestId
            };

            return Ok(ApiResponse<WorkOrderDetailDto>.Ok(detailDto));
        }

        /// <summary>
        /// Update the status of a work order
        /// PUT /api/work-orders/{id}/status
        /// - Staff: can update status only for work orders they are assigned to;
        ///   allowed transitions: Accepted → InProgress, InProgress → Completed, Expired → Completed
        /// - Admin: can update any work order status;
        ///   additionally allows Pending → Accepted
        /// </summary>
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<ActionResult<ApiResponse<WorkOrderDto>>> UpdateWorkOrderStatus(
            Guid id,
            [FromBody] UpdateWorkOrderStatusDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<WorkOrderDto>.Fail("Dữ liệu không hợp lệ"));

            // Extract authenticated user ID and role
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                           ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var authenticatedUserId))
            {
                return Unauthorized(ApiResponse<WorkOrderDto>.Fail("Không thể xác thực người dùng"));
            }

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            // Load work order with related data
            var workOrder = await _context.WorkOrders
                .Include(wo => wo.Customer)
                .Include(wo => wo.CreatedByAdmin)
                .FirstOrDefaultAsync(wo => wo.Id == id);

            if (workOrder == null)
            {
                return NotFound(ApiResponse<WorkOrderDto>.Fail("Không tìm thấy lệnh làm việc"));
            }

            var assignedIds = DeserializeStaffIds(workOrder.AssignedStaffIds);

            // If Staff: verify they are assigned to this work order
            if (userRole == "Staff" && !assignedIds.Contains(authenticatedUserId))
            {
                return StatusCode(403, ApiResponse<WorkOrderDto>.Fail(
                    "Bạn không có quyền cập nhật lệnh làm việc này"));
            }

            // Validate status transition
            var currentStatus = workOrder.WorkOrderStatus;
            var newStatus = dto.NewStatus;

            bool isValidTransition = IsValidStatusTransition(currentStatus, newStatus, userRole ?? "");

            if (!isValidTransition)
            {
                return BadRequest(ApiResponse<WorkOrderDto>.Fail(
                    $"Không thể chuyển trạng thái từ {currentStatus} sang {newStatus}"));
            }

            // Apply the status update
            workOrder.WorkOrderStatus = newStatus;

            // Record completion timestamp when status changes to Completed
            if (newStatus == WorkOrderStatus.Completed)
            {
                workOrder.CompletedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            // Load staff details for response
            var staffUsers = assignedIds.Count > 0
                ? await _context.Users
                    .Where(u => assignedIds.Contains(u.Id))
                    .ToDictionaryAsync(u => u.Id)
                : new Dictionary<Guid, User>();

            var vehicleInfo = DeserializeVehicleInfo(workOrder.VehicleInfo);
            var adminName = workOrder.CreatedByAdmin != null
                ? workOrder.CreatedByAdmin.FullName
                : string.Empty;

            var now = DateTime.UtcNow;
            var workOrderDto = new WorkOrderDto
            {
                Id = workOrder.Id,
                ScheduledStartTime = workOrder.ScheduledStartTime,
                ScheduledEndTime = workOrder.ScheduledEndTime,
                AssignedStaffIds = assignedIds,
                AssignedStaff = assignedIds
                    .Where(staffUsers.ContainsKey)
                    .Select(sid => new StaffSummaryDto
                    {
                        Id = sid,
                        Name = staffUsers[sid].FullName,
                        ProfilePicture = staffUsers[sid].AvatarUrl
                    })
                    .ToList(),
                RequestSource = workOrder.RequestSource,
                VehicleInfo = vehicleInfo,
                ServiceDetails = workOrder.ServiceDetails,
                WorkOrderStatus = workOrder.WorkOrderStatus,
                CustomerId = workOrder.CustomerId,
                CustomerName = workOrder.CustomerName,
                CustomerPhone = workOrder.CustomerPhone,
                CustomerEmail = workOrder.CustomerEmail,
                PriceQuote = workOrder.PriceQuote,
                AdminNotes = workOrder.AdminNotes,
                CreatedByAdminId = workOrder.CreatedByAdminId,
                CreatedByAdminName = adminName,
                CreatedAt = workOrder.CreatedAt,
                CompletedAt = workOrder.CompletedAt,
                IsExpired = workOrder.ScheduledEndTime < now &&
                           workOrder.WorkOrderStatus != WorkOrderStatus.Completed &&
                           workOrder.WorkOrderStatus != WorkOrderStatus.Rejected,
                IsExpiringSoon = (workOrder.ScheduledEndTime - now).TotalMinutes <= 30 &&
                                (workOrder.ScheduledEndTime - now).TotalMinutes > 0 &&
                                workOrder.WorkOrderStatus != WorkOrderStatus.Completed
            };

            _logger.LogInformation(
                "Work order {WorkOrderId} status updated from {OldStatus} to {NewStatus} by {UserId}",
                workOrder.Id, currentStatus, newStatus, authenticatedUserId);

            return Ok(ApiResponse<WorkOrderDto>.Ok(
                workOrderDto,
                "Trạng thái lệnh làm việc đã được cập nhật"));
        }

        // ── Private helpers ────────────────────────────────────────────────────

        /// <summary>
        /// Deserialize the JSONB assigned_staff_ids string back to a List&lt;Guid&gt;.
        /// Returns an empty list on any error.
        /// </summary>
        private static List<Guid> DeserializeStaffIds(string json)
        {
            try
            {
                return JsonSerializer.Deserialize<List<Guid>>(json) ?? new List<Guid>();
            }
            catch (JsonException)
            {
                return new List<Guid>();
            }
        }

        /// <summary>
        /// Deserialize the JSONB vehicle_info string to VehicleInfoDto.
        /// Returns an empty DTO on any error.
        /// </summary>
        private static VehicleInfoDto DeserializeVehicleInfo(string json)
        {
            try
            {
                return JsonSerializer.Deserialize<VehicleInfoDto>(json) ?? new VehicleInfoDto();
            }
            catch (JsonException)
            {
                return new VehicleInfoDto();
            }
        }

        /// <summary>
        /// Validates whether a status transition is permitted for the given role.
        /// </summary>
        private static bool IsValidStatusTransition(WorkOrderStatus current, WorkOrderStatus next, string role)
        {
            // Admin-only transition: Pending → Accepted
            if (role == "Admin" && current == WorkOrderStatus.Pending && next == WorkOrderStatus.Accepted)
                return true;

            // Staff & Admin transitions
            if (current == WorkOrderStatus.Accepted && next == WorkOrderStatus.InProgress)
                return true;

            if (current == WorkOrderStatus.InProgress && next == WorkOrderStatus.Completed)
                return true;

            if (current == WorkOrderStatus.Expired && next == WorkOrderStatus.Completed)
                return true;

            return false;
        }
    }
}
