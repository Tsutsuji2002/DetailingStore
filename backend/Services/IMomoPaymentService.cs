using DetailingStore.Api.DTOs;

namespace DetailingStore.Api.Services;

/// <summary>
/// Service interface for handling Momo payment gateway operations
/// </summary>
public interface IMomoPaymentService
{
    /// <summary>
    /// Initiates a payment for a service booking
    /// </summary>
    /// <param name="bookingId">ID of the service booking to pay for</param>
    /// <param name="userId">ID of the user initiating the payment</param>
    /// <returns>Payment initiation response with QR code URL and payment URL</returns>
    Task<InitiatePaymentResponse> InitiateBookingPaymentAsync(Guid bookingId, Guid userId);

    /// <summary>
    /// Initiates a payment for a product order
    /// </summary>
    /// <param name="orderId">ID of the product order to pay for</param>
    /// <param name="userId">ID of the user initiating the payment</param>
    /// <returns>Payment initiation response with QR code URL and payment URL</returns>
    Task<InitiatePaymentResponse> InitiateOrderPaymentAsync(Guid orderId, Guid userId);

    /// <summary>
    /// Gets the current status of a payment transaction
    /// </summary>
    /// <param name="orderId">Momo order ID to query</param>
    /// <param name="userId">ID of the user querying the payment status</param>
    /// <returns>Current payment status or null if not found</returns>
    Task<PaymentStatusResponse?> GetPaymentStatusAsync(string orderId, Guid userId);

    /// <summary>
    /// Processes an Instant Payment Notification (IPN) callback from Momo
    /// </summary>
    /// <param name="ipnRequest">IPN request data from Momo</param>
    Task ProcessIpnNotificationAsync(MomoIpnRequest ipnRequest);

    /// <summary>
    /// Verifies payment status with Momo API directly
    /// </summary>
    /// <param name="orderId">Momo order ID to verify</param>
    /// <returns>True if payment is verified as successful, false otherwise</returns>
    Task<bool> VerifyPaymentWithMomoAsync(string orderId);
}
