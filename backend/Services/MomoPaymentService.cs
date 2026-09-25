using System.Text;
using System.Text.Json;
using DetailingStore.Api.Data;
using DetailingStore.Api.DTOs;
using DetailingStore.Api.Exceptions;
using DetailingStore.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DetailingStore.Api.Services;

/// <summary>
/// Service for handling Momo payment gateway operations
/// </summary>
public class MomoPaymentService : IMomoPaymentService
{
    private readonly AppDbContext _context;
    private readonly ISignatureService _signatureService;
    private readonly IMomoConfigurationService _configService;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<MomoPaymentService> _logger;

    public MomoPaymentService(
        AppDbContext context,
        ISignatureService signatureService,
        IMomoConfigurationService configService,
        IHttpClientFactory httpClientFactory,
        ILogger<MomoPaymentService> logger)
    {
        _context = context;
        _signatureService = signatureService;
        _configService = configService;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<InitiatePaymentResponse> InitiateBookingPaymentAsync(Guid bookingId, Guid userId)
    {
        // 1. Validate booking exists and belongs to user
        var booking = await _context.ServiceBookings
            .Include(b => b.Service)
            .FirstOrDefaultAsync(b => b.Id == bookingId && b.CustomerId == userId);

        if (booking == null)
        {
            _logger.LogWarning("Booking {BookingId} not found or does not belong to user {UserId}", bookingId, userId);
            throw new NotFoundException("Booking not found");
        }

        // 2. Check for existing pending transaction (idempotency check)
        var existingTransaction = await _context.PaymentTransactions
            .FirstOrDefaultAsync(pt => 
                pt.BookingId == bookingId && 
                pt.Status == "Pending");

        if (existingTransaction != null)
        {
            _logger.LogInformation(
                "Returning existing pending transaction {TransactionId} for booking {BookingId}", 
                existingTransaction.Id, 
                bookingId);
            return MapToInitiateResponse(existingTransaction);
        }

        // 3. Generate unique IDs
        var requestId = GenerateRequestId();
        var orderId = GenerateOrderId("BOOKING", bookingId);

        // 4. Validate amount
        if (booking.TotalPrice <= 0)
        {
            _logger.LogError("Invalid amount {Amount} for booking {BookingId}", booking.TotalPrice, bookingId);
            throw new ValidationException("Invalid payment amount");
        }

        if (booking.TotalPrice > 50_000_000)
        {
            _logger.LogError("Amount {Amount} exceeds maximum limit for booking {BookingId}", booking.TotalPrice, bookingId);
            throw new ValidationException("Payment amount exceeds maximum limit of 50,000,000 VND");
        }

        // 5. Create payment transaction record with Pending status
        var transaction = new PaymentTransaction
        {
            RequestId = requestId,
            OrderId = orderId,
            BookingId = bookingId,
            Amount = booking.TotalPrice,
            Status = "Pending",
            PaymentMethod = "momo_wallet",
            CreatedAt = DateTime.UtcNow
        };

        _context.PaymentTransactions.Add(transaction);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Created payment transaction {TransactionId} for booking {BookingId} with amount {Amount}",
            transaction.Id,
            bookingId,
            booking.TotalPrice);

        // 6. Build Momo request
        var settings = _configService.GetSettings();
        var momoRequest = new MomoPaymentRequest
        {
            PartnerCode = settings.PartnerCode,
            AccessKey = settings.AccessKey,
            RequestId = requestId,
            Amount = ((long)booking.TotalPrice).ToString(),
            OrderId = orderId,
            OrderInfo = $"Thanh toán dịch vụ: {booking.Service?.Name ?? "Service"}",
            RedirectUrl = settings.PaymentRedirectUrl,
            IpnUrl = settings.IpnCallbackUrl,
            RequestType = "captureWallet",
            ExtraData = Convert.ToBase64String(
                Encoding.UTF8.GetBytes($"{{\"bookingId\":\"{bookingId}\"}}")),
            Lang = "vi"
        };

        // 7. Generate signature
        momoRequest.Signature = _signatureService.GeneratePaymentRequestSignature(
            momoRequest, settings.SecretKey);

        // 8. Send request to Momo
        try
        {
            var httpClient = _httpClientFactory.CreateClient("MomoClient");
            var jsonContent = new StringContent(
                JsonSerializer.Serialize(momoRequest),
                Encoding.UTF8,
                "application/json");

            var response = await httpClient.PostAsync(
                $"{settings.ApiEndpoint}/v2/gateway/api/create",
                jsonContent);

            var responseContent = await response.Content.ReadAsStringAsync();
            
            // 9. Log Momo API response
            _logger.LogInformation(
                "Momo API response for requestId {RequestId}: StatusCode={StatusCode}, Response={Response}",
                requestId,
                response.StatusCode,
                responseContent);

            var momoResponse = JsonSerializer.Deserialize<MomoPaymentResponse>(
                responseContent,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            // 10. Handle Momo error response
            if (momoResponse == null || momoResponse.ResultCode != 0)
            {
                transaction.Status = "Failed";
                transaction.ResultCode = momoResponse?.ResultCode;
                transaction.ResultMessage = momoResponse?.Message;
                await _context.SaveChangesAsync();

                var technicalDescription = MomoErrorMapper.MapResultCodeToTechnicalDescription(momoResponse?.ResultCode);
                var userMessage = MomoErrorMapper.MapResultCodeToVietnameseMessage(momoResponse?.ResultCode);

                _logger.LogError(
                    "Momo payment creation failed for transaction {TransactionId}: ResultCode={ResultCode}, Technical={Technical}, Message={Message}",
                    transaction.Id,
                    momoResponse?.ResultCode,
                    technicalDescription,
                    momoResponse?.Message);

                throw new ExternalServiceException(userMessage);
            }

            // 11. On success: update transaction with payment URLs
            transaction.PaymentUrl = momoResponse.PayUrl;
            transaction.QrCodeUrl = momoResponse.QrCodeUrl;
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Payment initiated successfully for transaction {TransactionId}. PaymentUrl={PaymentUrl}",
                transaction.Id,
                momoResponse.PayUrl);

            // 12. Return InitiatePaymentResponse
            return new InitiatePaymentResponse
            {
                TransactionId = transaction.Id,
                RequestId = requestId,
                OrderId = orderId,
                PaymentUrl = momoResponse.PayUrl,
                QrCodeUrl = momoResponse.QrCodeUrl,
                Amount = booking.TotalPrice
            };
        }
        catch (HttpRequestException ex)
        {
            // Handle network errors
            transaction.Status = "Failed";
            transaction.ResultMessage = "Network error";
            await _context.SaveChangesAsync();

            _logger.LogError(ex, 
                "Network error when calling Momo API for transaction {TransactionId}",
                transaction.Id);

            throw new ExternalServiceException("Unable to connect to payment gateway. Please try again later.", ex);
        }
        catch (JsonException ex)
        {
            // Handle JSON parsing errors
            transaction.Status = "Failed";
            transaction.ResultMessage = "Invalid response from payment gateway";
            await _context.SaveChangesAsync();

            _logger.LogError(ex,
                "Failed to parse Momo API response for transaction {TransactionId}",
                transaction.Id);

            throw new ExternalServiceException("Invalid response from payment gateway", ex);
        }
    }

    /// <inheritdoc/>
    public async Task<InitiatePaymentResponse> InitiateOrderPaymentAsync(Guid orderId, Guid userId)
    {
        // 1. Validate order exists and belongs to user
        var order = await _context.Orders
            .FirstOrDefaultAsync(o => o.Id == orderId && o.CustomerId == userId);

        if (order == null)
        {
            _logger.LogWarning(
                "Order not found or unauthorized access. OrderId: {OrderId}, UserId: {UserId}",
                orderId,
                userId);
            throw new Exceptions.NotFoundException("Order not found");
        }

        // 2. Check for existing pending transaction (idempotency)
        var existingTransaction = await _context.PaymentTransactions
            .FirstOrDefaultAsync(pt =>
                pt.ProductOrderId == orderId &&
                pt.Status == "Pending");

        if (existingTransaction != null)
        {
            _logger.LogInformation(
                "Returning existing pending transaction for order {OrderId}. TransactionId: {TransactionId}",
                orderId,
                existingTransaction.Id);
            return MapToInitiateResponse(existingTransaction);
        }

        // 3. Generate unique IDs
        var requestId = GenerateRequestId();
        var momoOrderId = GenerateOrderId("ORDER", orderId);

        // 4. Validate amount
        if (order.TotalAmount <= 0 || order.TotalAmount > 50_000_000)
        {
            _logger.LogWarning(
                "Invalid payment amount for order {OrderId}. Amount: {Amount}",
                orderId,
                order.TotalAmount);
            throw new Exceptions.ValidationException(
                $"Invalid payment amount: {order.TotalAmount}. Amount must be between 1 and 50,000,000 VND");
        }

        // 5. Create payment transaction record
        var transaction = new PaymentTransaction
        {
            RequestId = requestId,
            OrderId = momoOrderId,
            ProductOrderId = orderId,
            Amount = order.TotalAmount,
            Status = "Pending",
            PaymentMethod = "momo_wallet",
            CreatedAt = DateTime.UtcNow
        };

        _context.PaymentTransactions.Add(transaction);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Created payment transaction for order {OrderId}. TransactionId: {TransactionId}, Amount: {Amount}",
            orderId,
            transaction.Id,
            transaction.Amount);

        // 6. Build Momo request
        var settings = _configService.GetSettings();
        var momoRequest = new MomoPaymentRequest
        {
            PartnerCode = settings.PartnerCode,
            AccessKey = settings.AccessKey,
            RequestId = requestId,
            Amount = ((long)order.TotalAmount).ToString(),
            OrderId = momoOrderId,
            OrderInfo = $"Thanh toán đơn hàng #{orderId.ToString().Substring(0, 8)}",
            RedirectUrl = settings.PaymentRedirectUrl,
            IpnUrl = settings.IpnCallbackUrl,
            RequestType = "captureWallet",
            ExtraData = Convert.ToBase64String(
                Encoding.UTF8.GetBytes($"{{\"orderId\":\"{orderId}\"}}")),
            Lang = "vi"
        };

        // 7. Generate signature
        momoRequest.Signature = _signatureService.GeneratePaymentRequestSignature(
            momoRequest,
            settings.SecretKey);

        // 8. Send request to Momo
        try
        {
            var httpClient = _httpClientFactory.CreateClient("MomoClient");
            var jsonContent = new StringContent(
                JsonSerializer.Serialize(momoRequest),
                Encoding.UTF8,
                "application/json");

            _logger.LogInformation(
                "Sending payment request to Momo API. RequestId: {RequestId}, OrderId: {OrderId}",
                requestId,
                momoOrderId);

            var response = await httpClient.PostAsync(
                $"{settings.ApiEndpoint}/v2/gateway/api/create",
                jsonContent);

            var responseContent = await response.Content.ReadAsStringAsync();

            _logger.LogInformation(
                "Received Momo API response for requestId {RequestId}: StatusCode={StatusCode}, Response={Response}",
                requestId,
                response.StatusCode,
                responseContent);

            var momoResponse = JsonSerializer.Deserialize<MomoPaymentResponse>(
                responseContent,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (momoResponse == null || momoResponse.ResultCode != 0)
            {
                // Handle Momo error response
                transaction.Status = "Failed";
                transaction.ResultCode = momoResponse?.ResultCode;
                transaction.ResultMessage = momoResponse?.Message;
                await _context.SaveChangesAsync();

                var technicalDescription = MomoErrorMapper.MapResultCodeToTechnicalDescription(momoResponse?.ResultCode);
                var userMessage = MomoErrorMapper.MapResultCodeToVietnameseMessage(momoResponse?.ResultCode);

                _logger.LogError(
                    "Momo payment creation failed for order {OrderId}. ResultCode: {ResultCode}, Technical={Technical}, Message: {Message}",
                    orderId,
                    momoResponse?.ResultCode,
                    technicalDescription,
                    momoResponse?.Message);

                throw new Exceptions.ExternalServiceException(userMessage);
            }

            // 9. Update transaction with payment URLs
            transaction.PaymentUrl = momoResponse.PayUrl;
            transaction.QrCodeUrl = momoResponse.QrCodeUrl;
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Payment initiated successfully for order {OrderId}. TransactionId: {TransactionId}",
                orderId,
                transaction.Id);

            return new InitiatePaymentResponse
            {
                TransactionId = transaction.Id,
                RequestId = requestId,
                OrderId = momoOrderId,
                PaymentUrl = momoResponse.PayUrl,
                QrCodeUrl = momoResponse.QrCodeUrl,
                Amount = order.TotalAmount
            };
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(
                ex,
                "HTTP error while calling Momo API for order {OrderId}",
                orderId);

            transaction.Status = "Failed";
            transaction.ResultMessage = "Network error";
            await _context.SaveChangesAsync();

            throw new Exceptions.ExternalServiceException(
                "Unable to connect to payment gateway. Please try again later.",
                ex);
        }
        catch (Exception ex) when (ex is not Exceptions.ExternalServiceException)
        {
            _logger.LogError(
                ex,
                "Unexpected error while initiating payment for order {OrderId}",
                orderId);

            transaction.Status = "Failed";
            transaction.ResultMessage = "Internal error";
            await _context.SaveChangesAsync();

            throw;
        }
    }

    /// <inheritdoc/>
    public async Task<PaymentStatusResponse?> GetPaymentStatusAsync(string orderId, Guid userId)
    {
        // 1. Find PaymentTransaction by orderId
        var transaction = await _context.PaymentTransactions
            .Include(pt => pt.Booking)
            .Include(pt => pt.ProductOrder)
            .FirstOrDefaultAsync(pt => pt.OrderId == orderId);

        // 2. Throw NotFoundException if not found
        if (transaction == null)
        {
            _logger.LogWarning(
                "Payment transaction not found for orderId: {OrderId}",
                orderId);
            throw new NotFoundException("Payment transaction not found");
        }

        // 3. Verify transaction belongs to user (check booking/order ownership)
        var isAuthorized = false;

        if (transaction.BookingId.HasValue && transaction.Booking != null)
        {
            isAuthorized = transaction.Booking.CustomerId == userId;
            
            if (!isAuthorized)
            {
                _logger.LogWarning(
                    "Unauthorized access attempt. UserId {UserId} tried to access transaction {TransactionId} for booking owned by {OwnerId}",
                    userId,
                    transaction.Id,
                    transaction.Booking.CustomerId);
            }
        }
        else if (transaction.ProductOrderId.HasValue && transaction.ProductOrder != null)
        {
            isAuthorized = transaction.ProductOrder.CustomerId == userId;
            
            if (!isAuthorized)
            {
                _logger.LogWarning(
                    "Unauthorized access attempt. UserId {UserId} tried to access transaction {TransactionId} for order owned by {OwnerId}",
                    userId,
                    transaction.Id,
                    transaction.ProductOrder.CustomerId);
            }
        }

        if (!isAuthorized)
        {
            throw new UnauthorizedAccessException("You are not authorized to view this payment transaction");
        }

        // 4. Return PaymentStatusResponse with status, amount, timestamps, URLs
        _logger.LogInformation(
            "Retrieved payment status for transaction {TransactionId}, orderId {OrderId}, status {Status}",
            transaction.Id,
            orderId,
            transaction.Status);

        return new PaymentStatusResponse
        {
            TransactionId = transaction.Id,
            Status = transaction.Status,
            Amount = transaction.Amount,
            CreatedAt = transaction.CreatedAt,
            CompletedAt = transaction.CompletedAt,
            PaymentUrl = transaction.PaymentUrl,
            QrCodeUrl = transaction.QrCodeUrl,
            ResultCode = transaction.ResultCode,
            StatusMessage = transaction.Status switch
            {
                "Success" => MomoErrorMapper.MapResultCodeToVietnameseMessage(0),
                "Pending" => "Đang chờ thanh toán",
                "Expired" => "Giao dịch đã hết hạn",
                "Failed" => MomoErrorMapper.MapResultCodeToVietnameseMessage(transaction.ResultCode),
                _ => "Trạng thái không xác định"
            }
        };
    }

    /// <inheritdoc/>
    public async Task ProcessIpnNotificationAsync(MomoIpnRequest ipnRequest)
    {
        // 1. Log incoming IPN with orderId and resultCode
        _logger.LogInformation(
            "Processing IPN notification. OrderId: {OrderId}, ResultCode: {ResultCode}, TransId: {TransId}",
            ipnRequest.OrderId,
            ipnRequest.ResultCode,
            ipnRequest.TransId);

        // 2. Validate IPN signature using SignatureService
        var settings = _configService.GetSettings();
        if (!_signatureService.ValidateIpnSignature(ipnRequest, settings.SecretKey))
        {
            _logger.LogWarning(
                "IPN signature validation failed for orderId: {OrderId}. Signature: {Signature}",
                ipnRequest.OrderId,
                ipnRequest.Signature);
            throw new SecurityException("Invalid IPN signature");
        }

        _logger.LogInformation(
            "IPN signature validated successfully for orderId: {OrderId}",
            ipnRequest.OrderId);

        // 3. Find PaymentTransaction by orderId or requestId
        var transaction = await _context.PaymentTransactions
            .Include(pt => pt.Booking)
            .Include(pt => pt.ProductOrder)
            .FirstOrDefaultAsync(pt => 
                pt.OrderId == ipnRequest.OrderId || 
                pt.RequestId == ipnRequest.RequestId);

        if (transaction == null)
        {
            _logger.LogError(
                "Transaction not found for IPN. OrderId: {OrderId}, RequestId: {RequestId}",
                ipnRequest.OrderId,
                ipnRequest.RequestId);
            throw new NotFoundException("Transaction not found");
        }

        _logger.LogInformation(
            "Found transaction {TransactionId} for IPN",
            transaction.Id);

        // 4. Check if already processed (Success/Failed status) - return early if so (idempotency)
        if (transaction.Status == "Success" || transaction.Status == "Failed")
        {
            _logger.LogInformation(
                "Transaction {TransactionId} already processed with status: {Status}. Skipping duplicate IPN.",
                transaction.Id,
                transaction.Status);
            return;
        }

        // 5. Verify amount matches transaction amount (mark Failed if mismatch)
        var expectedAmount = (long)transaction.Amount;
        var receivedAmount = long.Parse(ipnRequest.Amount);
        
        if (expectedAmount != receivedAmount)
        {
            _logger.LogWarning(
                "Amount mismatch for transaction {TransactionId}. Expected: {Expected}, Received: {Received}",
                transaction.Id,
                expectedAmount,
                receivedAmount);
            
            transaction.Status = "Failed";
            transaction.ResultCode = ipnRequest.ResultCode;
            transaction.ResultMessage = "Amount mismatch";
            transaction.MomoTransId = ipnRequest.TransId;
            transaction.CompletedAt = DateTime.UtcNow;
            transaction.Signature = ipnRequest.Signature;
            await _context.SaveChangesAsync();
            return;
        }

        // 6. Update transaction: set MomoTransId, ResultCode, ResultMessage, CompletedAt, Signature
        transaction.MomoTransId = ipnRequest.TransId;
        transaction.ResultCode = ipnRequest.ResultCode;
        transaction.ResultMessage = ipnRequest.Message;
        transaction.CompletedAt = DateTime.UtcNow;
        transaction.Signature = ipnRequest.Signature;

        // 7. If resultCode == 0: set status to Success, update booking/order
        if (ipnRequest.ResultCode == 0)
        {
            transaction.Status = "Success";

            // Update booking/order payment status
            if (transaction.BookingId.HasValue && transaction.Booking != null)
            {
                transaction.Booking.IsPaid = true;
                transaction.Booking.PaymentMethod = "momo";
                
                // Update booking status if currently Pending
                if (transaction.Booking.Status == BookingStatus.Pending)
                {
                    transaction.Booking.Status = BookingStatus.Confirmed;
                    _logger.LogInformation(
                        "Updated booking {BookingId} status from Pending to Confirmed",
                        transaction.BookingId);
                }

                _logger.LogInformation(
                    "Marked booking {BookingId} as paid with Momo",
                    transaction.BookingId);
            }
            else if (transaction.ProductOrderId.HasValue && transaction.ProductOrder != null)
            {
                transaction.ProductOrder.IsPaid = true;
                transaction.ProductOrder.PaymentMethod = "momo";
                
                // Update order status if currently Pending
                if (transaction.ProductOrder.Status == OrderStatus.Pending)
                {
                    transaction.ProductOrder.Status = OrderStatus.Processing;
                    _logger.LogInformation(
                        "Updated order {OrderId} status from Pending to Processing",
                        transaction.ProductOrderId);
                }

                _logger.LogInformation(
                    "Marked order {OrderId} as paid with Momo",
                    transaction.ProductOrderId);
            }

            _logger.LogInformation(
                "Payment successful for transaction {TransactionId}",
                transaction.Id);
        }
        else
        {
            // 8. If resultCode != 0: set status to Failed
            transaction.Status = "Failed";
            
            var technicalDescription = MomoErrorMapper.MapResultCodeToTechnicalDescription(ipnRequest.ResultCode);
            var userMessage = MomoErrorMapper.MapResultCodeToVietnameseMessage(ipnRequest.ResultCode);
            
            _logger.LogWarning(
                "Payment failed for transaction {TransactionId} with code {ResultCode}: Technical={Technical}, Message={Message}, UserMessage={UserMessage}",
                transaction.Id,
                ipnRequest.ResultCode,
                technicalDescription,
                ipnRequest.Message,
                userMessage);
        }

        // 9. Save changes to database
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "IPN processing completed for transaction {TransactionId}. Final status: {Status}",
            transaction.Id,
            transaction.Status);
    }

    /// <inheritdoc/>
    public async Task<bool> VerifyPaymentWithMomoAsync(string orderId)
    {
        // TODO: Implementation for future use (optional verification with Momo API)
        throw new NotImplementedException("VerifyPaymentWithMomoAsync is reserved for future implementation");
    }

    #region Helper Methods

    /// <summary>
    /// Generates a unique request ID for Momo payment requests
    /// Format: REQ_[UnixTimestampMilliseconds]
    /// </summary>
    /// <returns>Unique request ID string</returns>
    protected string GenerateRequestId()
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        return $"REQ_{timestamp}";
    }

    /// <summary>
    /// Generates a unique order ID for Momo payment requests
    /// </summary>
    /// <param name="prefix">Prefix to identify the order type (e.g., "BOOKING", "ORDER")</param>
    /// <param name="entityId">The booking or order ID</param>
    /// <returns>Unique order ID string</returns>
    protected string GenerateOrderId(string prefix, Guid entityId)
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        return $"{prefix}_{entityId}_{timestamp}";
    }

    /// <summary>
    /// Maps a PaymentTransaction entity to InitiatePaymentResponse DTO
    /// </summary>
    /// <param name="transaction">Payment transaction entity</param>
    /// <returns>Initiate payment response DTO</returns>
    protected InitiatePaymentResponse MapToInitiateResponse(PaymentTransaction transaction)
    {
        return new InitiatePaymentResponse
        {
            TransactionId = transaction.Id,
            RequestId = transaction.RequestId,
            OrderId = transaction.OrderId,
            PaymentUrl = transaction.PaymentUrl ?? string.Empty,
            QrCodeUrl = transaction.QrCodeUrl ?? string.Empty,
            Amount = transaction.Amount
        };
    }

    /// <summary>
    /// Converts MomoPaymentRequest to MomoIpnRequest format for signature validation
    /// This is used for testing signature round-trip validation
    /// </summary>
    /// <param name="paymentRequest">Momo payment request</param>
    /// <returns>IPN request format for validation</returns>
    protected MomoIpnRequest ConvertToIpnRequest(MomoPaymentRequest paymentRequest)
    {
        return new MomoIpnRequest
        {
            PartnerCode = paymentRequest.PartnerCode,
            RequestId = paymentRequest.RequestId,
            OrderId = paymentRequest.OrderId,
            Amount = paymentRequest.Amount,
            OrderInfo = paymentRequest.OrderInfo,
            OrderType = paymentRequest.RequestType,
            TransId = 0, // Will be populated by Momo in actual IPN
            ResultCode = 0,
            Message = string.Empty,
            PayType = "qr",
            ResponseTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            ExtraData = paymentRequest.ExtraData,
            Signature = paymentRequest.Signature
        };
    }

    #endregion
}
