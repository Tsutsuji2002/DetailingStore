using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace DetailingStore.Api.DTOs;

/// <summary>
/// Request to initiate a payment for a booking or order
/// </summary>
public class InitiatePaymentRequest
{
    /// <summary>
    /// ID of the service booking to pay for (mutually exclusive with ProductOrderId)
    /// </summary>
    public Guid? BookingId { get; set; }

    /// <summary>
    /// ID of the product order to pay for (mutually exclusive with BookingId)
    /// </summary>
    public Guid? ProductOrderId { get; set; }

    /// <summary>
    /// Payment amount in VND
    /// </summary>
    [Required]
    [Range(1, 50_000_000, ErrorMessage = "Amount must be between 1 and 50,000,000 VND")]
    public decimal Amount { get; set; }

    /// <summary>
    /// Description of the order/booking being paid for
    /// </summary>
    [Required]
    [MaxLength(500)]
    public string OrderInfo { get; set; } = string.Empty;
}

/// <summary>
/// Payment request sent to Momo API
/// </summary>
public class MomoPaymentRequest
{
    [JsonPropertyName("partnerCode")]
    [Required]
    public string PartnerCode { get; set; } = string.Empty;

    [JsonPropertyName("accessKey")]
    [Required]
    public string AccessKey { get; set; } = string.Empty;

    [JsonPropertyName("requestId")]
    [Required]
    public string RequestId { get; set; } = string.Empty;

    [JsonPropertyName("amount")]
    [Required]
    public string Amount { get; set; } = string.Empty;

    [JsonPropertyName("orderId")]
    [Required]
    public string OrderId { get; set; } = string.Empty;

    [JsonPropertyName("orderInfo")]
    [Required]
    public string OrderInfo { get; set; } = string.Empty;

    [JsonPropertyName("redirectUrl")]
    [Required]
    public string RedirectUrl { get; set; } = string.Empty;

    [JsonPropertyName("ipnUrl")]
    [Required]
    public string IpnUrl { get; set; } = string.Empty;

    [JsonPropertyName("requestType")]
    [Required]
    public string RequestType { get; set; } = "captureWallet";

    [JsonPropertyName("extraData")]
    public string ExtraData { get; set; } = string.Empty;

    [JsonPropertyName("lang")]
    public string Lang { get; set; } = "vi";

    [JsonPropertyName("signature")]
    [Required]
    public string Signature { get; set; } = string.Empty;
}

/// <summary>
/// Response from Momo API after payment initiation
/// </summary>
public class MomoPaymentResponse
{
    [JsonPropertyName("partnerCode")]
    public string PartnerCode { get; set; } = string.Empty;

    [JsonPropertyName("requestId")]
    public string RequestId { get; set; } = string.Empty;

    [JsonPropertyName("orderId")]
    public string OrderId { get; set; } = string.Empty;

    [JsonPropertyName("amount")]
    public string Amount { get; set; } = string.Empty;

    [JsonPropertyName("responseTime")]
    public long ResponseTime { get; set; }

    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;

    [JsonPropertyName("resultCode")]
    public int ResultCode { get; set; }

    [JsonPropertyName("payUrl")]
    public string PayUrl { get; set; } = string.Empty;

    [JsonPropertyName("qrCodeUrl")]
    public string QrCodeUrl { get; set; } = string.Empty;

    [JsonPropertyName("deeplink")]
    public string Deeplink { get; set; } = string.Empty;
}

/// <summary>
/// Response containing payment transaction status
/// </summary>
public class PaymentStatusResponse
{
    /// <summary>
    /// Internal transaction ID
    /// </summary>
    public Guid TransactionId { get; set; }

    /// <summary>
    /// Current payment status (Pending, Success, Failed, Cancelled, Expired)
    /// </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Payment amount in VND
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// When the payment transaction was created
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// When the payment was completed (if completed)
    /// </summary>
    public DateTime? CompletedAt { get; set; }

    /// <summary>
    /// URL to complete payment
    /// </summary>
    public string? PaymentUrl { get; set; }

    /// <summary>
    /// URL of the QR code for payment
    /// </summary>
    public string? QrCodeUrl { get; set; }

    /// <summary>
    /// Momo result code
    /// </summary>
    public int? ResultCode { get; set; }

    /// <summary>
    /// User-friendly status message in Vietnamese
    /// </summary>
    public string? StatusMessage { get; set; }
}

/// <summary>
/// Response after successfully initiating a payment
/// </summary>
public class InitiatePaymentResponse
{
    /// <summary>
    /// Internal transaction ID for tracking
    /// </summary>
    public Guid TransactionId { get; set; }

    /// <summary>
    /// Momo request ID
    /// </summary>
    public string RequestId { get; set; } = string.Empty;

    /// <summary>
    /// Momo order ID
    /// </summary>
    public string OrderId { get; set; } = string.Empty;

    /// <summary>
    /// URL to redirect user for payment
    /// </summary>
    public string PaymentUrl { get; set; } = string.Empty;

    /// <summary>
    /// URL of the QR code image
    /// </summary>
    public string QrCodeUrl { get; set; } = string.Empty;

    /// <summary>
    /// Payment amount in VND
    /// </summary>
    public decimal Amount { get; set; }
}

/// <summary>
/// IPN (Instant Payment Notification) request from Momo webhook
/// </summary>
public class MomoIpnRequest
{
    [JsonPropertyName("partnerCode")]
    public string PartnerCode { get; set; } = string.Empty;

    [JsonPropertyName("requestId")]
    public string RequestId { get; set; } = string.Empty;

    [JsonPropertyName("orderId")]
    public string OrderId { get; set; } = string.Empty;

    [JsonPropertyName("amount")]
    public string Amount { get; set; } = string.Empty;

    [JsonPropertyName("orderInfo")]
    public string OrderInfo { get; set; } = string.Empty;

    [JsonPropertyName("orderType")]
    public string OrderType { get; set; } = string.Empty;

    [JsonPropertyName("transId")]
    public long TransId { get; set; }

    [JsonPropertyName("resultCode")]
    public int ResultCode { get; set; }

    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;

    [JsonPropertyName("payType")]
    public string PayType { get; set; } = string.Empty;

    [JsonPropertyName("responseTime")]
    public long ResponseTime { get; set; }

    [JsonPropertyName("extraData")]
    public string ExtraData { get; set; } = string.Empty;

    [JsonPropertyName("signature")]
    public string Signature { get; set; } = string.Empty;
}
