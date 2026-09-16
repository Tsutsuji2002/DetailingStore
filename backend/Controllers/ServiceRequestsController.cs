using System.Security.Claims;
using System.Text.Json;
using DetailingStore.Api.Data;
using DetailingStore.Api.DTOs;
using DetailingStore.Api.Models;
using DetailingStore.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DetailingStore.Api.Controllers
{
    [ApiController]
    [Route("api/service-requests")]
    public class ServiceRequestsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ILogger<ServiceRequestsController> _logger;

        public ServiceRequestsController(
            AppDbContext context,
            IEmailService emailService,
            ILogger<ServiceRequestsController> logger)
        {
            _context = context;
            _emailService = emailService;
            _logger = logger;
        }

        /// <summary>
        /// Customer submits a service request
        /// POST /api/service-requests
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Customer,Admin")]
        public async Task<ActionResult<ApiResponse<ServiceRequestDto>>> CreateServiceRequest(
            [FromBody] CreateServiceRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<ServiceRequestDto>.Fail("Dữ liệu không hợp lệ"));

            // Extract authenticated user ID from JWT claims
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                           ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var authenticatedUserId))
            {
                return Unauthorized(ApiResponse<ServiceRequestDto>.Fail("Không thể xác thực người dùng"));
            }

            // Retrieve customer information from database
            var customer = await _context.Users.FindAsync(authenticatedUserId);
            if (customer == null)
            {
                return NotFound(ApiResponse<ServiceRequestDto>.Fail("Không tìm thấy thông tin khách hàng"));
            }

            // Verify the requested service exists
            var service = await _context.Services.FindAsync(dto.RequestedServiceId);
            if (service == null)
            {
                return BadRequest(ApiResponse<ServiceRequestDto>.Fail("Dịch vụ yêu cầu không tồn tại"));
            }

            // Build VehicleInfo JSON from DTO
            var vehicleInfo = new VehicleInfoDto
            {
                LicensePlate = dto.LicensePlate,
                Model = dto.VehicleModel,
                Year = dto.VehicleYear
            };
            var vehicleInfoJson = JsonSerializer.Serialize(vehicleInfo);

            // Create ServiceRequestEntity with Status = Pending
            var serviceRequest = new ServiceRequestEntity
            {
                Id = Guid.NewGuid(),
                CustomerId = authenticatedUserId,
                CustomerName = $"{customer.FirstName} {customer.LastName}".Trim(),
                CustomerEmail = customer.Email,
                CustomerPhone = customer.Phone ?? string.Empty,
                VehicleInfo = vehicleInfoJson,
                RequestedServiceId = dto.RequestedServiceId,
                PreferredDate = dto.PreferredDate,
                PreferredTime = dto.PreferredTime,
                CustomerNotes = dto.CustomerNotes,
                Status = ServiceRequestStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            // Save to database
            await _context.ServiceRequests.AddAsync(serviceRequest);
            await _context.SaveChangesAsync();

            // Build response DTO
            var responseDto = new ServiceRequestDto
            {
                Id = serviceRequest.Id,
                CustomerId = serviceRequest.CustomerId,
                CustomerName = serviceRequest.CustomerName,
                CustomerEmail = serviceRequest.CustomerEmail,
                CustomerPhone = serviceRequest.CustomerPhone,
                VehicleInfo = vehicleInfo,
                RequestedServiceId = serviceRequest.RequestedServiceId,
                RequestedServiceName = service.Name,
                PreferredDate = serviceRequest.PreferredDate,
                PreferredTime = serviceRequest.PreferredTime,
                CustomerNotes = serviceRequest.CustomerNotes,
                Status = serviceRequest.Status,
                CreatedAt = serviceRequest.CreatedAt
            };

            // Trigger email service (fire and forget)
            _ = Task.Run(async () =>
            {
                try
                {
                    await _emailService.SendServiceRequestConfirmationAsync(
                        serviceRequest.CustomerEmail,
                        serviceRequest.CustomerName,
                        responseDto);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, 
                        "Failed to send confirmation email for service request {RequestId}", 
                        serviceRequest.Id);
                }
            });

            _logger.LogInformation(
                "Service request {RequestId} created by customer {CustomerId}",
                serviceRequest.Id, authenticatedUserId);

            return CreatedAtAction(
                nameof(CreateServiceRequest),
                new { id = serviceRequest.Id },
                ApiResponse<ServiceRequestDto>.Ok(
                    responseDto,
                    "Yêu cầu dịch vụ đã được gửi thành công"));
        }

        /// <summary>
        /// Admin retrieves all service requests with optional status filter
        /// GET /api/service-requests
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<List<ServiceRequestDto>>>> GetServiceRequests(
            [FromQuery] ServiceRequestStatus? status = null)
        {
            // Query service_requests with optional status filter
            var query = _context.ServiceRequests
                .Include(sr => sr.Customer)
                .Include(sr => sr.RequestedService)
                .AsQueryable();

            // Apply status filter if provided
            if (status.HasValue)
            {
                query = query.Where(sr => sr.Status == status.Value);
            }

            // Order by CreatedAt descending
            var serviceRequests = await query
                .OrderByDescending(sr => sr.CreatedAt)
                .ToListAsync();

            // Build response DTOs with parsed VehicleInfo
            var responseDtos = serviceRequests.Select(sr =>
            {
                // Parse VehicleInfo JSON to VehicleInfoDto
                VehicleInfoDto vehicleInfo;
                try
                {
                    vehicleInfo = JsonSerializer.Deserialize<VehicleInfoDto>(sr.VehicleInfo)
                        ?? new VehicleInfoDto();
                }
                catch (JsonException)
                {
                    vehicleInfo = new VehicleInfoDto();
                }

                return new ServiceRequestDto
                {
                    Id = sr.Id,
                    CustomerId = sr.CustomerId,
                    CustomerName = sr.CustomerName,
                    CustomerEmail = sr.CustomerEmail,
                    CustomerPhone = sr.CustomerPhone,
                    VehicleInfo = vehicleInfo,
                    RequestedServiceId = sr.RequestedServiceId,
                    RequestedServiceName = sr.RequestedService.Name,
                    PreferredDate = sr.PreferredDate,
                    PreferredTime = sr.PreferredTime,
                    CustomerNotes = sr.CustomerNotes,
                    Status = sr.Status,
                    CreatedAt = sr.CreatedAt
                };
            }).ToList();

            return Ok(ApiResponse<List<ServiceRequestDto>>.Ok(responseDtos));
        }

        /// <summary>
        /// Admin retrieves single service request details
        /// GET /api/service-requests/{id}
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<ServiceRequestDetailDto>>> GetServiceRequestById(Guid id)
        {
            // Load service request by ID with all related data
            var serviceRequest = await _context.ServiceRequests
                .Include(sr => sr.Customer)
                .Include(sr => sr.RequestedService)
                .Include(sr => sr.ReviewedByAdmin)
                .FirstOrDefaultAsync(sr => sr.Id == id);

            if (serviceRequest == null)
            {
                return NotFound(ApiResponse<ServiceRequestDetailDto>.Fail("Không tìm thấy yêu cầu dịch vụ"));
            }

            // Parse VehicleInfo JSON to VehicleInfoDto
            VehicleInfoDto vehicleInfo;
            try
            {
                vehicleInfo = JsonSerializer.Deserialize<VehicleInfoDto>(serviceRequest.VehicleInfo)
                    ?? new VehicleInfoDto();
            }
            catch (JsonException)
            {
                vehicleInfo = new VehicleInfoDto();
            }

            // Build ServiceRequestDetailDto with review information
            var detailDto = new ServiceRequestDetailDto
            {
                Id = serviceRequest.Id,
                CustomerId = serviceRequest.CustomerId,
                CustomerName = serviceRequest.CustomerName,
                CustomerEmail = serviceRequest.CustomerEmail,
                CustomerPhone = serviceRequest.CustomerPhone,
                VehicleInfo = vehicleInfo,
                RequestedServiceId = serviceRequest.RequestedServiceId,
                RequestedServiceName = serviceRequest.RequestedService.Name,
                PreferredDate = serviceRequest.PreferredDate,
                PreferredTime = serviceRequest.PreferredTime,
                CustomerNotes = serviceRequest.CustomerNotes,
                Status = serviceRequest.Status,
                CreatedAt = serviceRequest.CreatedAt,
                ReviewedAt = serviceRequest.ReviewedAt,
                ReviewedByAdminId = serviceRequest.ReviewedByAdminId,
                ReviewedByAdminName = serviceRequest.ReviewedByAdmin != null 
                    ? $"{serviceRequest.ReviewedByAdmin.FirstName} {serviceRequest.ReviewedByAdmin.LastName}".Trim()
                    : null
            };

            return Ok(ApiResponse<ServiceRequestDetailDto>.Ok(detailDto));
        }

        /// <summary>
        /// Admin accepts service request and creates work order
        /// PUT /api/service-requests/{id}/accept
        /// </summary>
        [HttpPut("{id}/accept")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<WorkOrderDto>>> AcceptServiceRequest(
            Guid id,
            [FromBody] AcceptServiceRequestDto dto)
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

            // Start a transaction to ensure both ServiceRequest and WorkOrder are updated atomically
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                // Load service request by ID with related data
                var serviceRequest = await _context.ServiceRequests
                    .Include(sr => sr.RequestedService)
                    .FirstOrDefaultAsync(sr => sr.Id == id);

                if (serviceRequest == null)
                {
                    return NotFound(ApiResponse<WorkOrderDto>.Fail("Không tìm thấy yêu cầu dịch vụ"));
                }

                // Validate status is Pending
                if (serviceRequest.Status != ServiceRequestStatus.Pending)
                {
                    return BadRequest(ApiResponse<WorkOrderDto>.Fail(
                        "Chỉ có thể chấp nhận yêu cầu dịch vụ đang ở trạng thái chờ xử lý"));
                }

                // Validate scheduled times
                if (dto.ScheduledEndTime <= dto.ScheduledStartTime)
                {
                    return BadRequest(ApiResponse<WorkOrderDto>.Fail(
                        "Thời gian kết thúc phải sau thời gian bắt đầu"));
                }

                // Parse VehicleInfo from ServiceRequest
                VehicleInfoDto vehicleInfo;
                try
                {
                    vehicleInfo = JsonSerializer.Deserialize<VehicleInfoDto>(serviceRequest.VehicleInfo)
                        ?? new VehicleInfoDto();
                }
                catch (JsonException)
                {
                    vehicleInfo = new VehicleInfoDto();
                }

                // Serialize AssignedStaffIds to JSON
                var assignedStaffIdsJson = JsonSerializer.Serialize(dto.AssignedStaffIds);

                // Create WorkOrderEntity with RequestSource = CustomerRequest
                var workOrder = new WorkOrderEntity
                {
                    Id = Guid.NewGuid(),
                    ScheduledStartTime = dto.ScheduledStartTime,
                    ScheduledEndTime = dto.ScheduledEndTime,
                    AssignedStaffIds = assignedStaffIdsJson,
                    RequestSource = RequestSource.CustomerRequest,
                    VehicleInfo = serviceRequest.VehicleInfo, // Copy JSON as-is
                    ServiceDetails = serviceRequest.RequestedService.Name, // Use service name as details
                    WorkOrderStatus = WorkOrderStatus.Accepted,
                    CustomerId = serviceRequest.CustomerId,
                    CustomerName = serviceRequest.CustomerName,
                    CustomerPhone = serviceRequest.CustomerPhone,
                    CustomerEmail = serviceRequest.CustomerEmail,
                    PriceQuote = dto.PriceQuote,
                    AdminNotes = dto.AdminNotes,
                    CreatedByAdminId = authenticatedAdminId,
                    CreatedAt = DateTime.UtcNow,
                    OriginServiceRequestId = serviceRequest.Id
                };

                // Add work order to database
                await _context.WorkOrders.AddAsync(workOrder);

                // Update ServiceRequest status to Accepted
                serviceRequest.Status = ServiceRequestStatus.Accepted;
                serviceRequest.ReviewedAt = DateTime.UtcNow;
                serviceRequest.ReviewedByAdminId = authenticatedAdminId;

                // Save changes
                await _context.SaveChangesAsync();
                
                // Commit transaction
                await transaction.CommitAsync();

                // Build response WorkOrderDto
                var workOrderDto = new WorkOrderDto
                {
                    Id = workOrder.Id,
                    ScheduledStartTime = workOrder.ScheduledStartTime,
                    ScheduledEndTime = workOrder.ScheduledEndTime,
                    AssignedStaffIds = dto.AssignedStaffIds,
                    AssignedStaff = new List<StaffSummaryDto>(), // Empty for now, can be populated if needed
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
                    CreatedByAdminName = string.Empty, // Could be populated from admin user if needed
                    CreatedAt = workOrder.CreatedAt,
                    CompletedAt = workOrder.CompletedAt,
                    IsExpired = workOrder.ScheduledEndTime < DateTime.UtcNow && 
                               workOrder.WorkOrderStatus != WorkOrderStatus.Completed,
                    IsExpiringSoon = (workOrder.ScheduledEndTime - DateTime.UtcNow).TotalMinutes <= 30 &&
                                    workOrder.WorkOrderStatus != WorkOrderStatus.Completed
                };

                _logger.LogInformation(
                    "Service request {RequestId} accepted by admin {AdminId}, work order {WorkOrderId} created",
                    serviceRequest.Id, authenticatedAdminId, workOrder.Id);

                return Ok(ApiResponse<WorkOrderDto>.Ok(
                    workOrderDto,
                    "Yêu cầu dịch vụ đã được chấp nhận và tạo lệnh làm việc"));
            }
            catch (Exception ex)
            {
                // Rollback transaction on error
                await transaction.RollbackAsync();
                
                _logger.LogError(ex, 
                    "Error accepting service request {RequestId}", id);
                
                return StatusCode(500, ApiResponse<WorkOrderDto>.Fail(
                    "Có lỗi xảy ra khi xử lý yêu cầu"));
            }
        }

        /// <summary>
        /// Admin rejects service request
        /// PUT /api/service-requests/{id}/reject
        /// </summary>
        [HttpPut("{id}/reject")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<ServiceRequestDto>>> RejectServiceRequest(Guid id)
        {
            // Extract authenticated admin ID from JWT claims
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                           ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var authenticatedAdminId))
            {
                return Unauthorized(ApiResponse<ServiceRequestDto>.Fail("Không thể xác thực người dùng"));
            }

            // Load service request by ID with related data
            var serviceRequest = await _context.ServiceRequests
                .Include(sr => sr.RequestedService)
                .FirstOrDefaultAsync(sr => sr.Id == id);

            if (serviceRequest == null)
            {
                return NotFound(ApiResponse<ServiceRequestDto>.Fail("Không tìm thấy yêu cầu dịch vụ"));
            }

            // Validate status is Pending
            if (serviceRequest.Status != ServiceRequestStatus.Pending)
            {
                return BadRequest(ApiResponse<ServiceRequestDto>.Fail(
                    "Chỉ có thể từ chối yêu cầu dịch vụ đang ở trạng thái chờ xử lý"));
            }

            // Update status to Rejected with review information
            serviceRequest.Status = ServiceRequestStatus.Rejected;
            serviceRequest.ReviewedAt = DateTime.UtcNow;
            serviceRequest.ReviewedByAdminId = authenticatedAdminId;

            // Save changes to database
            await _context.SaveChangesAsync();

            // Parse VehicleInfo JSON to VehicleInfoDto
            VehicleInfoDto vehicleInfo;
            try
            {
                vehicleInfo = JsonSerializer.Deserialize<VehicleInfoDto>(serviceRequest.VehicleInfo)
                    ?? new VehicleInfoDto();
            }
            catch (JsonException)
            {
                vehicleInfo = new VehicleInfoDto();
            }

            // Build response DTO
            var responseDto = new ServiceRequestDto
            {
                Id = serviceRequest.Id,
                CustomerId = serviceRequest.CustomerId,
                CustomerName = serviceRequest.CustomerName,
                CustomerEmail = serviceRequest.CustomerEmail,
                CustomerPhone = serviceRequest.CustomerPhone,
                VehicleInfo = vehicleInfo,
                RequestedServiceId = serviceRequest.RequestedServiceId,
                RequestedServiceName = serviceRequest.RequestedService.Name,
                PreferredDate = serviceRequest.PreferredDate,
                PreferredTime = serviceRequest.PreferredTime,
                CustomerNotes = serviceRequest.CustomerNotes,
                Status = serviceRequest.Status,
                CreatedAt = serviceRequest.CreatedAt
            };

            _logger.LogInformation(
                "Service request {RequestId} rejected by admin {AdminId}",
                serviceRequest.Id, authenticatedAdminId);

            return Ok(ApiResponse<ServiceRequestDto>.Ok(
                responseDto,
                "Yêu cầu dịch vụ đã bị từ chối"));
        }
    }
}
