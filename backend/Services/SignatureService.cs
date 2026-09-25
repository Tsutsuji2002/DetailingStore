using System.Security.Cryptography;
using System.Text;
using DetailingStore.Api.DTOs;

namespace DetailingStore.Api.Services;

/// <summary>
/// Service for generating and validating HMAC-SHA256 signatures for Momo payment requests
/// Implements signature generation following Momo's documented parameter ordering requirements
/// </summary>
public class SignatureService : ISignatureService
{
    private readonly ILogger<SignatureService> _logger;

    public SignatureService(ILogger<SignatureService> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Generates HMAC-SHA256 signature for a Momo payment request
    /// Parameter order: accessKey, amount, extraData, ipnUrl, orderId, orderInfo, 
    /// partnerCode, redirectUrl, requestId, requestType
    /// </summary>
    public string GeneratePaymentRequestSignature(MomoPaymentRequest request, string secretKey)
    {
        // Momo parameter order for payment requests as per Requirement 17.8
        var rawData = $"accessKey={request.AccessKey}" +
                      $"&amount={request.Amount}" +
                      $"&extraData={request.ExtraData}" +
                      $"&ipnUrl={request.IpnUrl}" +
                      $"&orderId={request.OrderId}" +
                      $"&orderInfo={request.OrderInfo}" +
                      $"&partnerCode={request.PartnerCode}" +
                      $"&redirectUrl={request.RedirectUrl}" +
                      $"&requestId={request.RequestId}" +
                      $"&requestType={request.RequestType}";

        var signature = ComputeHmacSha256(rawData, secretKey);
        
        _logger.LogDebug(
            "Generated payment request signature for orderId: {OrderId}, requestId: {RequestId}",
            request.OrderId,
            request.RequestId);

        return signature;
    }

    /// <summary>
    /// Generates HMAC-SHA256 signature for IPN validation
    /// Parameter order: accessKey, amount, extraData, message, orderId, orderInfo, 
    /// orderType, partnerCode, payType, requestId, responseTime, resultCode, transId
    /// </summary>
    public string GenerateIpnValidationSignature(MomoIpnRequest ipnRequest, string secretKey)
    {
        // Momo parameter order for IPN validation as per design document
        // Note: accessKey is represented by partnerCode in IPN context
        var rawData = $"accessKey={ipnRequest.PartnerCode}" +
                      $"&amount={ipnRequest.Amount}" +
                      $"&extraData={ipnRequest.ExtraData}" +
                      $"&message={ipnRequest.Message}" +
                      $"&orderId={ipnRequest.OrderId}" +
                      $"&orderInfo={ipnRequest.OrderInfo}" +
                      $"&orderType={ipnRequest.OrderType}" +
                      $"&partnerCode={ipnRequest.PartnerCode}" +
                      $"&payType={ipnRequest.PayType}" +
                      $"&requestId={ipnRequest.RequestId}" +
                      $"&responseTime={ipnRequest.ResponseTime}" +
                      $"&resultCode={ipnRequest.ResultCode}" +
                      $"&transId={ipnRequest.TransId}";

        return ComputeHmacSha256(rawData, secretKey);
    }

    /// <summary>
    /// Validates an IPN notification signature by comparing generated signature with received signature
    /// Comparison is case-insensitive as per Requirement 5.5
    /// </summary>
    public bool ValidateIpnSignature(MomoIpnRequest ipnRequest, string secretKey)
    {
        var expectedSignature = GenerateIpnValidationSignature(ipnRequest, secretKey);
        var isValid = string.Equals(expectedSignature, ipnRequest.Signature, 
                           StringComparison.OrdinalIgnoreCase);

        if (isValid)
        {
            _logger.LogInformation(
                "IPN signature validation PASSED for orderId: {OrderId}, requestId: {RequestId}",
                ipnRequest.OrderId,
                ipnRequest.RequestId);
        }
        else
        {
            _logger.LogWarning(
                "IPN signature validation FAILED for orderId: {OrderId}, requestId: {RequestId}. Expected signature prefix: {ExpectedPrefix}..., Received signature prefix: {ReceivedPrefix}...",
                ipnRequest.OrderId,
                ipnRequest.RequestId,
                expectedSignature.Substring(0, Math.Min(8, expectedSignature.Length)),
                ipnRequest.Signature?.Substring(0, Math.Min(8, ipnRequest.Signature?.Length ?? 0)) ?? "null");
        }

        return isValid;
    }

    /// <summary>
    /// Computes HMAC-SHA256 hash and returns lowercase hex string
    /// </summary>
    private string ComputeHmacSha256(string data, string key)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
        var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
    }
}
