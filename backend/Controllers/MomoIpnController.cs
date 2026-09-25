using DetailingStore.Api.DTOs;
using DetailingStore.Api.Exceptions;
using DetailingStore.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DetailingStore.Api.Controllers;

/// <summary>
/// Controller for handling Momo Instant Payment Notification (IPN) webhooks
/// </summary>
[ApiController]
[Route("api/webhooks/momo")]
[AllowAnonymous] // IPN webhooks are not authenticated via JWT
public class MomoIpnController : ControllerBase
{
    private readonly IMomoPaymentService _paymentService;
    private readonly ILogger<MomoIpnController> _logger;

    public MomoIpnController(
        IMomoPaymentService paymentService,
        ILogger<MomoIpnController> logger)
    {
        _paymentService = paymentService;
        _logger = logger;
    }

    /// <summary>
    /// Handles IPN notifications from Momo payment gateway
    /// </summary>
    /// <param name="ipnRequest">IPN request data from Momo</param>
    /// <returns>HTTP 204 on success, HTTP 400 for invalid signature, HTTP 404 for transaction not found, HTTP 500 for other errors</returns>
    [HttpPost("ipn")]
    public async Task<IActionResult> HandleIpnNotification([FromBody] MomoIpnRequest ipnRequest)
    {
        try
        {
            _logger.LogInformation(
                "Received IPN notification for orderId: {OrderId}, resultCode: {ResultCode}",
                ipnRequest.OrderId,
                ipnRequest.ResultCode);

            await _paymentService.ProcessIpnNotificationAsync(ipnRequest);

            _logger.LogInformation(
                "Successfully processed IPN notification for orderId: {OrderId}",
                ipnRequest.OrderId);

            // Momo requires HTTP 204 response
            return NoContent();
        }
        catch (SecurityException ex)
        {
            _logger.LogError(
                ex,
                "IPN signature validation failed for orderId: {OrderId}. Signature: {Signature}",
                ipnRequest.OrderId,
                ipnRequest.Signature);

            return BadRequest(new { error = "Invalid signature" });
        }
        catch (NotFoundException ex)
        {
            _logger.LogError(
                ex,
                "Transaction not found for IPN. OrderId: {OrderId}, RequestId: {RequestId}",
                ipnRequest.OrderId,
                ipnRequest.RequestId);

            return NotFound(new { error = "Transaction not found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error processing IPN notification. OrderId: {OrderId}, RequestId: {RequestId}, ResultCode: {ResultCode}",
                ipnRequest.OrderId,
                ipnRequest.RequestId,
                ipnRequest.ResultCode);

            return StatusCode(500, new { error = "Internal server error" });
        }
    }
}
