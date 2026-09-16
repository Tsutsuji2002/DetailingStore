using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DetailingStore.Api.Models
{
    public enum ServiceRequestStatus
    {
        Pending,
        Accepted,
        Rejected
    }

    [Table("service_requests")]
    public class ServiceRequestEntity
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column("customer_id")]
        public Guid CustomerId { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("customer_name")]
        public string CustomerName { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        [EmailAddress]
        [Column("customer_email")]
        public string CustomerEmail { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        [Column("customer_phone")]
        public string CustomerPhone { get; set; } = string.Empty;

        [Required]
        [Column("vehicle_info", TypeName = "jsonb")]
        public string VehicleInfo { get; set; } = string.Empty; // JSON: {licensePlate, model, year}

        [Required]
        [Column("requested_service_id")]
        public Guid RequestedServiceId { get; set; }

        [Required]
        [Column("preferred_date")]
        public DateOnly PreferredDate { get; set; }

        [Required]
        [Column("preferred_time")]
        public TimeOnly PreferredTime { get; set; }

        [Column("customer_notes")]
        public string? CustomerNotes { get; set; }

        [Required]
        [Column("status")]
        public ServiceRequestStatus Status { get; set; } = ServiceRequestStatus.Pending;

        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("reviewed_at")]
        public DateTime? ReviewedAt { get; set; }

        [Column("reviewed_by_admin_id")]
        public Guid? ReviewedByAdminId { get; set; }

        // Navigation properties
        [ForeignKey(nameof(CustomerId))]
        public User Customer { get; set; } = null!;

        [ForeignKey(nameof(RequestedServiceId))]
        public ServiceEntity RequestedService { get; set; } = null!;

        [ForeignKey(nameof(ReviewedByAdminId))]
        public User? ReviewedByAdmin { get; set; }
    }
}
