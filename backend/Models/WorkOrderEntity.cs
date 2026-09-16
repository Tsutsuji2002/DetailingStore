using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DetailingStore.Api.Models
{
    public enum WorkOrderStatus
    {
        Pending,
        Accepted,
        Rejected,
        InProgress,
        Completed,
        Expired
    }

    public enum RequestSource
    {
        CustomerRequest,
        DirectEntry
    }

    [Table("work_orders")]
    public class WorkOrderEntity
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column("scheduled_start_time")]
        public DateTime ScheduledStartTime { get; set; }

        [Required]
        [Column("scheduled_end_time")]
        public DateTime ScheduledEndTime { get; set; }

        [Required]
        [Column("assigned_staff_ids", TypeName = "jsonb")]
        public string AssignedStaffIds { get; set; } = "[]";

        [Required]
        [Column("request_source")]
        public RequestSource RequestSource { get; set; }

        [Required]
        [Column("vehicle_info", TypeName = "jsonb")]
        public string VehicleInfo { get; set; } = string.Empty;

        [Required]
        [Column("service_details")]
        public string ServiceDetails { get; set; } = string.Empty;

        [Required]
        [Column("work_order_status")]
        public WorkOrderStatus WorkOrderStatus { get; set; } = WorkOrderStatus.Pending;

        // Optional customer information
        [Column("customer_id")]
        public Guid? CustomerId { get; set; }

        [MaxLength(100)]
        [Column("customer_name")]
        public string? CustomerName { get; set; }

        [MaxLength(20)]
        [Column("customer_phone")]
        public string? CustomerPhone { get; set; }

        [MaxLength(255)]
        [Column("customer_email")]
        public string? CustomerEmail { get; set; }

        // Admin fields
        [Column("price_quote", TypeName = "decimal(12,2)")]
        public decimal? PriceQuote { get; set; }

        [Column("admin_notes")]
        public string? AdminNotes { get; set; }

        [Required]
        [Column("created_by_admin_id")]
        public Guid CreatedByAdminId { get; set; }

        // Timestamps
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("completed_at")]
        public DateTime? CompletedAt { get; set; }

        // Link back to service request if applicable
        [Column("origin_service_request_id")]
        public Guid? OriginServiceRequestId { get; set; }

        // Navigation properties
        [ForeignKey(nameof(CustomerId))]
        public User? Customer { get; set; }

        [ForeignKey(nameof(CreatedByAdminId))]
        public User CreatedByAdmin { get; set; } = null!;

        [ForeignKey(nameof(OriginServiceRequestId))]
        public ServiceRequestEntity? OriginServiceRequest { get; set; }
    }
}
