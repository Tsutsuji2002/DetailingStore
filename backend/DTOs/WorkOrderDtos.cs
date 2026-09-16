using System.ComponentModel.DataAnnotations;
using DetailingStore.Api.Models;

namespace DetailingStore.Api.DTOs
{
    /// <summary>
    /// DTO for creating a new work order (admin direct entry)
    /// </summary>
    public class CreateWorkOrderDto
    {
        [Required(ErrorMessage = "Scheduled start time is required")]
        public DateTime ScheduledStartTime { get; set; }

        [Required(ErrorMessage = "Scheduled end time is required")]
        public DateTime ScheduledEndTime { get; set; }

        [Required(ErrorMessage = "Assigned staff IDs are required")]
        public List<Guid> AssignedStaffIds { get; set; } = new List<Guid>();

        [Required(ErrorMessage = "Vehicle information is required")]
        public VehicleInfoDto VehicleInfo { get; set; } = null!;

        [Required(ErrorMessage = "Service details are required")]
        public string ServiceDetails { get; set; } = string.Empty;

        public Guid? CustomerId { get; set; }

        [MaxLength(100)]
        public string? CustomerName { get; set; }

        [MaxLength(20)]
        public string? CustomerPhone { get; set; }

        [MaxLength(255)]
        [EmailAddress]
        public string? CustomerEmail { get; set; }

        public decimal? PriceQuote { get; set; }

        public string? AdminNotes { get; set; }
    }

    /// <summary>
    /// DTO for work order response with related data
    /// </summary>
    public class WorkOrderDto
    {
        public Guid Id { get; set; }
        public DateTime ScheduledStartTime { get; set; }
        public DateTime ScheduledEndTime { get; set; }
        public List<Guid> AssignedStaffIds { get; set; } = new List<Guid>();
        public List<StaffSummaryDto> AssignedStaff { get; set; } = new List<StaffSummaryDto>();
        public RequestSource RequestSource { get; set; }
        public VehicleInfoDto VehicleInfo { get; set; } = null!;
        public string ServiceDetails { get; set; } = string.Empty;
        public WorkOrderStatus WorkOrderStatus { get; set; }
        public Guid? CustomerId { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string? CustomerEmail { get; set; }
        public decimal? PriceQuote { get; set; }
        public string? AdminNotes { get; set; }
        public Guid CreatedByAdminId { get; set; }
        public string CreatedByAdminName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public bool IsExpired { get; set; }
        public bool IsExpiringSoon { get; set; } // Within 30 minutes
    }

    /// <summary>
    /// DTO for detailed work order view including full customer info
    /// </summary>
    public class WorkOrderDetailDto
    {
        public Guid Id { get; set; }
        public DateTime ScheduledStartTime { get; set; }
        public DateTime ScheduledEndTime { get; set; }
        public List<Guid> AssignedStaffIds { get; set; } = new List<Guid>();
        public List<StaffSummaryDto> AssignedStaff { get; set; } = new List<StaffSummaryDto>();
        public RequestSource RequestSource { get; set; }
        public VehicleInfoDto VehicleInfo { get; set; } = null!;
        public string ServiceDetails { get; set; } = string.Empty;
        public WorkOrderStatus WorkOrderStatus { get; set; }
        public Guid? CustomerId { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string? CustomerEmail { get; set; }
        public decimal? PriceQuote { get; set; }
        public string? AdminNotes { get; set; }
        public Guid CreatedByAdminId { get; set; }
        public string CreatedByAdminName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public bool IsExpired { get; set; }
        public bool IsExpiringSoon { get; set; } // Within 30 minutes
        public Guid? OriginServiceRequestId { get; set; }
    }

    /// <summary>
    /// DTO for updating work order status
    /// </summary>
    public class UpdateWorkOrderStatusDto
    {
        [Required(ErrorMessage = "New status is required")]
        public WorkOrderStatus NewStatus { get; set; }
    }

    /// <summary>
    /// DTO for available staff response with shift details
    /// </summary>
    public class AvailableStaffDto
    {
        public Guid StaffId { get; set; }
        public string StaffName { get; set; } = string.Empty;
        public string? ProfilePicture { get; set; }
        public List<StaffShiftInfoDto> MatchingShifts { get; set; } = new List<StaffShiftInfoDto>();
    }

    /// <summary>
    /// DTO for staff shift information
    /// </summary>
    public class StaffShiftInfoDto
    {
        public string ShiftTypeName { get; set; } = string.Empty;
        public string ShiftStartTime { get; set; } = string.Empty;
        public string ShiftEndTime { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO for staff summary information
    /// </summary>
    public class StaffSummaryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? ProfilePicture { get; set; }
    }
}
