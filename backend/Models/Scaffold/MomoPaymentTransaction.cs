using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DetailingStore.Api.Models.Scaffold;

[Table("momo_payment_transactions")]
[Index("BookingId", Name = "IX_momo_payment_transactions_booking_id")]
[Index("CreatedAt", Name = "IX_momo_payment_transactions_created_at")]
[Index("OrderId", Name = "IX_momo_payment_transactions_order_id")]
[Index("ProductOrderId", Name = "IX_momo_payment_transactions_product_order_id")]
[Index("RequestId", Name = "IX_momo_payment_transactions_request_id")]
[Index("Status", Name = "IX_momo_payment_transactions_status")]
public partial class MomoPaymentTransaction
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("request_id")]
    [StringLength(50)]
    public string RequestId { get; set; } = null!;

    [Column("order_id")]
    [StringLength(50)]
    public string OrderId { get; set; } = null!;

    [Column("booking_id")]
    public Guid? BookingId { get; set; }

    [Column("product_order_id")]
    public Guid? ProductOrderId { get; set; }

    [Column("amount")]
    [Precision(12, 2)]
    public decimal Amount { get; set; }

    [Column("status")]
    [StringLength(20)]
    public string Status { get; set; } = null!;

    [Column("payment_method")]
    [StringLength(50)]
    public string PaymentMethod { get; set; } = null!;

    [Column("momo_trans_id")]
    public long? MomoTransId { get; set; }

    [Column("result_code")]
    public int? ResultCode { get; set; }

    [Column("result_message")]
    [StringLength(500)]
    public string? ResultMessage { get; set; }

    [Column("payment_url")]
    [StringLength(500)]
    public string? PaymentUrl { get; set; }

    [Column("qr_code_url")]
    [StringLength(500)]
    public string? QrCodeUrl { get; set; }

    [Column("signature")]
    [StringLength(255)]
    public string? Signature { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column("completed_at", TypeName = "timestamp without time zone")]
    public DateTime? CompletedAt { get; set; }

    [Column("metadata", TypeName = "jsonb")]
    public string? Metadata { get; set; }

    [Column("refund_status")]
    [StringLength(20)]
    public string RefundStatus { get; set; } = null!;

    [Column("refunded_amount")]
    [Precision(12, 2)]
    public decimal RefundedAmount { get; set; }

    [Column("refund_transaction_id")]
    [StringLength(50)]
    public string? RefundTransactionId { get; set; }
}
