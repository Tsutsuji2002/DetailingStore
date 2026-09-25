using DetailingStore.Api.DTOs;

namespace DetailingStore.Api.Services;

/// <summary>
/// Service for generating and validating HMAC-SHA256 signatures for Momo payment requests and IPN notifications
/// </summary>
public interface ISignatureService
{
    /// <summary>
    /// Generates HMAC-SHA256 signature for a Momo payment request
    /// </summary>
    /// <param name="request">The Momo payment request to sign</param>
    /// <param name="secretKey">The Momo secret key for signing</param>
    /// <returns>Lowercase hex string representation of the signature</returns>
    string GeneratePaymentRequestSignature(MomoPaymentRequest request, string secretKey);

    /// <summary>
    /// Generates HMAC-SHA256 signature for IPN validation
    /// </summary>
    /// <param name="ipnRequest">The IPN request to sign</param>
    /// <param name="secretKey">The Momo secret key for signing</param>
    /// <returns>Lowercase hex string representation of the signature</returns>
    string GenerateIpnValidationSignature(MomoIpnRequest ipnRequest, string secretKey);

    /// <summary>
    /// Validates an IPN notification signature
    /// </summary>
    /// <param name="ipnRequest">The IPN request with signature to validate</param>
    /// <param name="secretKey">The Momo secret key for validation</param>
    /// <returns>True if signature is valid, false otherwise</returns>
    bool ValidateIpnSignature(MomoIpnRequest ipnRequest, string secretKey);
}
