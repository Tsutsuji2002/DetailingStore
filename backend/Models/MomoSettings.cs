namespace DetailingStore.Api.Models;

/// <summary>
/// Configuration settings for Momo Payment Gateway integration
/// </summary>
public class MomoSettings
{
    /// <summary>
    /// Partner code provided by Momo
    /// </summary>
    public string PartnerCode { get; set; } = string.Empty;

    /// <summary>
    /// Access key for API authentication
    /// </summary>
    public string AccessKey { get; set; } = string.Empty;

    /// <summary>
    /// Secret key for signature generation and validation
    /// </summary>
    public string SecretKey { get; set; } = string.Empty;

    /// <summary>
    /// Momo API endpoint URL (test or production)
    /// </summary>
    public string ApiEndpoint { get; set; } = string.Empty;

    /// <summary>
    /// IPN (Instant Payment Notification) callback URL for webhook notifications
    /// </summary>
    public string IpnCallbackUrl { get; set; } = string.Empty;

    /// <summary>
    /// URL to redirect users after payment completion
    /// </summary>
    public string PaymentRedirectUrl { get; set; } = string.Empty;

    /// <summary>
    /// Indicates whether the system is running in test/sandbox mode
    /// </summary>
    public bool IsTestMode { get; set; } = true;
}
