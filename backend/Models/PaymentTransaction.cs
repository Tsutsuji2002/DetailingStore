using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DetailingStore.Api.Models
{
    [Table("momo_payment_transactions")]
    public class PaymentTransaction
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column("request_id")]
        [MaxLength(50)]
        public string RequestId { get; set; } = string.Empty;

        [Required]
        [Column("order_id")]
        [MaxLength(50)]
        public string OrderId { get; set; } = string.Empty;

        [Column("booking_id")]
        public Guid? BookingId { get; set; }

        [ForeignKey(nameof(BookingId))]
        public ServiceBooking? Booking { get; set; }

        [Column("product_order_id")]
        public Guid? ProductOrderId { get; set; }

        [ForeignKey(nameof(ProductOrderId))]
        public Order? ProductOrder { get; set; }

        [Required]
        [Column("amount", TypeName = "decimal(12,2)")]
        public decimal Amount { get; set; }

        [Required]
        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "Pending"; // Pending, Success, Failed, Cancelled, Expired

        [Column("payment_method")]
        [MaxLength(50)]
        public string PaymentMethod { get; set; } = "momo_wallet";

        [Column("momo_trans_id")]
        public long? MomoTransId { get; set; }

        [Column("result_code")]
        public int? ResultCode { get; set; }

        [Column("result_message")]
        [MaxLength(500)]
        public string? ResultMessage { get; set; }

        [Column("payment_url")]
        [MaxLength(500)]
        public string? PaymentUrl { get; set; }

        [Column("qr_code_url")]
        [MaxLength(500)]
        public string? QrCodeUrl { get; set; }

        [Column("signature")]
        [MaxLength(255)]
        public string? Signature { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("completed_at")]
        public DateTime? CompletedAt { get; set; }

        [Column("metadata", TypeName = "jsonb")]
        public string? Metadata { get; set; }

        // Refund support fields (for future use)
        [Column("refund_status")]
        [MaxLength(20)]
        public string RefundStatus { get; set; } = "None"; // None, Pending, Completed, Failed

        [Column("refunded_amount", TypeName = "decimal(12,2)")]
        public decimal RefundedAmount { get; set; } = 0;

        [Column("refund_transaction_id")]
        [MaxLength(50)]
        public string? RefundTransactionId { get; set; }
    }
}
