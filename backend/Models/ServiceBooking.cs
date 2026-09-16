using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DetailingStore.Api.Models
{
    public enum BookingStatus
    {
        Pending,
        Confirmed,
        InProgress,
        Completed,
        Cancelled
    }

    [Table("service_bookings")]
    public class ServiceBooking
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Column("customer_id")]
        public Guid? CustomerId { get; set; }

        [ForeignKey(nameof(CustomerId))]
        public User? Customer { get; set; }

        [Required]
        [Column("service_id")]
        public Guid ServiceId { get; set; }

        [ForeignKey(nameof(ServiceId))]
        public ServiceEntity? Service { get; set; }

        [Column("assigned_staff_id")]
        public Guid? AssignedStaffId { get; set; }

        [ForeignKey(nameof(AssignedStaffId))]
        public User? AssignedStaff { get; set; }

        [Column("license_plate")]
        [MaxLength(50)]
        public string LicensePlate { get; set; } = string.Empty;

        [Column("vehicle_model")]
        [MaxLength(100)]
        public string VehicleModel { get; set; } = string.Empty;

        [Column("customer_name")]
        [MaxLength(100)]
        public string CustomerName { get; set; } = string.Empty;

        [Column("customer_phone")]
        [MaxLength(20)]
        public string? CustomerPhone { get; set; }

        [Column("booking_date")]
        public DateOnly BookingDate { get; set; }

        [Column("booking_time")]
        public TimeOnly BookingTime { get; set; }

        [Column("status")]
        public BookingStatus Status { get; set; } = BookingStatus.Pending;

        [Column("notes")]
        public string? Notes { get; set; }

        [Column("estimated_completion")]
        [MaxLength(50)]
        public string? EstimatedCompletion { get; set; }

        [Column("total_price", TypeName = "decimal(12,2)")]
        public decimal TotalPrice { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public enum OrderStatus
    {
        Pending,
        Processing,
        Shipped,
        Delivered,
        Cancelled
    }

    [Table("orders")]
    public class Order
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Column("customer_id")]
        public Guid? CustomerId { get; set; }

        [ForeignKey(nameof(CustomerId))]
        public User? Customer { get; set; }

        [Column("status")]
        public OrderStatus Status { get; set; } = OrderStatus.Pending;

        [Column("total_amount", TypeName = "decimal(12,2)")]
        public decimal TotalAmount { get; set; }

        [Required]
        [Column("shipping_address")]
        public string ShippingAddress { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        [Column("phone")]
        public string Phone { get; set; } = string.Empty;

        [MaxLength(50)]
        [Column("payment_method")]
        public string PaymentMethod { get; set; } = "COD";

        [Column("is_paid")]
        public bool IsPaid { get; set; } = false;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    }

    [Table("order_items")]
    public class OrderItem
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column("order_id")]
        public Guid OrderId { get; set; }

        [ForeignKey(nameof(OrderId))]
        public Order? Order { get; set; }

        [Required]
        [Column("product_id")]
        public Guid ProductId { get; set; }

        [ForeignKey(nameof(ProductId))]
        public ProductEntity? Product { get; set; }

        [Column("quantity")]
        public int Quantity { get; set; }

        [Column("unit_price", TypeName = "decimal(12,2)")]
        public decimal UnitPrice { get; set; }
    }
}
