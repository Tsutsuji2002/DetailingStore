using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DetailingStore.Api.DTOs;
using DetailingStore.Api.Exceptions;
using DetailingStore.Api.Services;

namespace DetailingStore.Api.Controllers;

/// <summary>
/// Controller for authenticated payment operations using Momo payment gateway
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentController : ControllerBase
{
    private readonly IMomoPaymentService _paymentService;
    private readonly ILogger<PaymentController> _logger;

    public PaymentController(
        IMomoPaymentService paymentService,
        ILogger<PaymentController> logger)
    {
        _paymentService = paymentService;
        _logger = logger;
    }

    /// <summary>
    /// Initiate payment for a service booking
    /// </summary>
    /// <param name="bookingId">ID of the booking to pay for</param>
    /// <returns>Payment initiation details including QR code URL</returns>
    /// <response code="200">Payment initiated successfully</response>
    /// <response code="400">Validation failed</response>
    /// <response code="401">User is not authenticated</response>
    /// <response code="404">Booking not found</response>
    [HttpPost("bookings/{bookingId}/initiate")]
    [ProducesResponseType(typeof(ApiResponse<InitiatePaymentResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<InitiatePaymentResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<InitiatePaymentResponse>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<InitiatePaymentResponse>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<InitiatePaymentResponse>>> InitiateBookingPayment(
        Guid bookingId)
    {
        try
        {
            var userId = GetCurrentUserId();
            _logger.LogInformation(
                "User {UserId} initiating payment for booking {BookingId}",
                userId,
                bookingId);

            var result = await _paymentService.InitiateBookingPaymentAsync(bookingId, userId);

            return Ok(ApiResponse<InitiatePaymentResponse>.Ok(
                result,
                "Payment initiated successfully"));
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(
                "Booking not found for payment initiation: {BookingId}. Error: {Message}",
                bookingId,
                ex.Message);
            return NotFound(ApiResponse<InitiatePaymentResponse>.Fail(ex.Message));
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(
                "Validation failed for booking payment: {BookingId}. Error: {Message}",
                bookingId,
                ex.Message);
            return BadRequest(ApiResponse<InitiatePaymentResponse>.Fail(ex.Message));
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(
                "Unauthorized payment attempt for booking {BookingId}: {Message}",
                bookingId,
                ex.Message);
            return Unauthorized(ApiResponse<InitiatePaymentResponse>.Fail(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Unexpected error initiating payment for booking {BookingId}",
                bookingId);
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                ApiResponse<InitiatePaymentResponse>.Fail("An unexpected error occurred"));
        }
    }

    /// <summary>
    /// Initiate payment for a product order
    /// </summary>
    /// <param name="orderId">ID of the order to pay for</param>
    /// <returns>Payment initiation details including QR code URL</returns>
    /// <response code="200">Payment initiated successfully</response>
    /// <response code="400">Validation failed</response>
    /// <response code="401">User is not authenticated</response>
    /// <response code="404">Order not found</response>
    [HttpPost("orders/{orderId}/initiate")]
    [ProducesResponseType(typeof(ApiResponse<InitiatePaymentResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<InitiatePaymentResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<InitiatePaymentResponse>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<InitiatePaymentResponse>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<InitiatePaymentResponse>>> InitiateOrderPayment(
        Guid orderId)
    {
        try
        {
            var userId = GetCurrentUserId();
            _logger.LogInformation(
                "User {UserId} initiating payment for order {OrderId}",
                userId,
                orderId);

            var result = await _paymentService.InitiateOrderPaymentAsync(orderId, userId);

            return Ok(ApiResponse<InitiatePaymentResponse>.Ok(
                result,
                "Payment initiated successfully"));
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(
                "Order not found for payment initiation: {OrderId}. Error: {Message}",
                orderId,
                ex.Message);
            return NotFound(ApiResponse<InitiatePaymentResponse>.Fail(ex.Message));
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(
                "Validation failed for order payment: {OrderId}. Error: {Message}",
                orderId,
                ex.Message);
            return BadRequest(ApiResponse<InitiatePaymentResponse>.Fail(ex.Message));
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(
                "Unauthorized payment attempt for order {OrderId}: {Message}",
                orderId,
                ex.Message);
            return Unauthorized(ApiResponse<InitiatePaymentResponse>.Fail(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Unexpected error initiating payment for order {OrderId}",
                orderId);
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                ApiResponse<InitiatePaymentResponse>.Fail("An unexpected error occurred"));
        }
    }

    /// <summary>
    /// Get payment status by Momo order ID
    /// </summary>
    /// <param name="orderId">Momo order ID to query</param>
    /// <returns>Current payment status</returns>
    /// <response code="200">Payment status retrieved successfully</response>
    /// <response code="401">User is not authenticated</response>
    /// <response code="404">Payment transaction not found</response>
    [HttpGet("status/{orderId}")]
    [ProducesResponseType(typeof(ApiResponse<PaymentStatusResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<PaymentStatusResponse>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<PaymentStatusResponse>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<PaymentStatusResponse>>> GetPaymentStatus(
        string orderId)
    {
        try
        {
            var userId = GetCurrentUserId();
            _logger.LogInformation(
                "User {UserId} querying payment status for order {OrderId}",
                userId,
                orderId);

            var result = await _paymentService.GetPaymentStatusAsync(orderId, userId);

            if (result == null)
            {
                _logger.LogWarning(
                    "Payment transaction not found for orderId: {OrderId}",
                    orderId);
                return NotFound(ApiResponse<PaymentStatusResponse>.Fail(
                    "Payment transaction not found"));
            }

            return Ok(ApiResponse<PaymentStatusResponse>.Ok(result));
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(
                "Unauthorized status query for order {OrderId}: {Message}",
                orderId,
                ex.Message);
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<PaymentStatusResponse>.Fail(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Unexpected error querying payment status for order {OrderId}",
                orderId);
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                ApiResponse<PaymentStatusResponse>.Fail("An unexpected error occurred"));
        }
    }

    /// <summary>
    /// Extract the current user ID from JWT claims
    /// </summary>
    /// <returns>User ID as Guid</returns>
    /// <exception cref="UnauthorizedAccessException">Thrown when user ID claim is not found</exception>
    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userIdClaim))
        {
            _logger.LogWarning("User ID claim not found in token");
            throw new UnauthorizedAccessException("User not authenticated");
        }

        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            _logger.LogError("Invalid user ID format in claims: {UserIdClaim}", userIdClaim);
            throw new UnauthorizedAccessException("Invalid user ID");
        }

        return userId;
    }
}
