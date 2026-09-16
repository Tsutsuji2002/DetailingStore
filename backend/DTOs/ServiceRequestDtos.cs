using System.ComponentModel.DataAnnotations;
using DetailingStore.Api.Models;

namespace DetailingStore.Api.DTOs
{
    /// <summary>
    /// DTO for customer service request submission
    /// </summary>
    public class CreateServiceRequestDto
    {
        [Required(ErrorMessage = "Biển số xe là bắt buộc")]
        [MaxLength(20)]
        public string LicensePlate { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mẫu xe là bắt buộc")]
        [MaxLength(100)]
        public string VehicleModel { get; set; } = string.Empty;

        public int? VehicleYear { get; set; }

        [Required(ErrorMessage = "Dịch vụ là bắt buộc")]
        public Guid RequestedServiceId { get; set; }

        [Required(ErrorMessage = "Ngày ưu tiên là bắt buộc")]
        public DateOnly PreferredDate { get; set; }

        [Required(ErrorMessage = "Giờ ưu tiên là bắt buộc")]
        public TimeOnly PreferredTime { get; set; }

        public string? CustomerNotes { get; set; }
    }

    /// <summary>
    /// DTO for service request response with related data
    /// </summary>
    public class ServiceRequestDto
    {
        public Guid Id { get; set; }
        public Guid CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public VehicleInfoDto VehicleInfo { get; set; } = new VehicleInfoDto();
        public Guid RequestedServiceId { get; set; }
        public string RequestedServiceName { get; set; } = string.Empty;
        public DateOnly PreferredDate { get; set; }
        public TimeOnly PreferredTime { get; set; }
        public string? CustomerNotes { get; set; }
        public ServiceRequestStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>
    /// DTO for detailed service request view (admin)
    /// </summary>
    public class ServiceRequestDetailDto
    {
        public Guid Id { get; set; }
        public Guid CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public VehicleInfoDto VehicleInfo { get; set; } = new VehicleInfoDto();
        public Guid RequestedServiceId { get; set; }
        public string RequestedServiceName { get; set; } = string.Empty;
        public DateOnly PreferredDate { get; set; }
        public TimeOnly PreferredTime { get; set; }
        public string? CustomerNotes { get; set; }
        public ServiceRequestStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public Guid? ReviewedByAdminId { get; set; }
        public string? ReviewedByAdminName { get; set; }
    }

    /// <summary>
    /// DTO for admin accepting service request
    /// </summary>
    public class AcceptServiceRequestDto
    {
        [Required(ErrorMessage = "Thời gian bắt đầu là bắt buộc")]
        public DateTime ScheduledStartTime { get; set; }

        [Required(ErrorMessage = "Thời gian kết thúc là bắt buộc")]
        public DateTime ScheduledEndTime { get; set; }

        public List<Guid> AssignedStaffIds { get; set; } = new List<Guid>();

        public decimal? PriceQuote { get; set; }

        public string? AdminNotes { get; set; }
    }

    /// <summary>
    /// DTO for vehicle information (nested in ServiceRequest)
    /// </summary>
    public class VehicleInfoDto
    {
        [Required(ErrorMessage = "Biển số xe là bắt buộc")]
        [MaxLength(20)]
        public string LicensePlate { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mẫu xe là bắt buộc")]
        [MaxLength(100)]
        public string Model { get; set; } = string.Empty;

        public int? Year { get; set; }
    }
}
