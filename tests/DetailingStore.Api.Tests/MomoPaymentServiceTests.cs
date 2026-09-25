using System;
using System.Threading.Tasks;
using DetailingStore.Api.Data;
using DetailingStore.Api.DTOs;
using DetailingStore.Api.Exceptions;
using DetailingStore.Api.Models;
using DetailingStore.Api.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace DetailingStore.Api.Tests;

/// <summary>
/// Unit tests for MomoPaymentService.GetPaymentStatusAsync method.
/// Tests payment status query functionality with authorization checks.
/// 
/// **Validates: Requirements 6.1, 6.2, 6.3**
/// </summary>
public class MomoPaymentServiceTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly MomoPaymentService _service;
    private readonly Mock<ISignatureService> _mockSignatureService;
    private readonly Mock<IMomoConfigurationService> _mockConfigService;
    private readonly Mock<IHttpClientFactory> _mockHttpClientFactory;
    private readonly Mock<ILogger<MomoPaymentService>> _mockLogger;

    private readonly Guid _customerId1;
    private readonly Guid _customerId2;
    private readonly Guid _bookingId;
    private readonly Guid _orderId;

    public MomoPaymentServiceTests()
    {
        // Setup in-memory database
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new AppDbContext(options);

        // Setup mocks
        _mockSignatureService = new Mock<ISignatureService>();
        _mockConfigService = new Mock<IMomoConfigurationService>();
        _mockHttpClientFactory = new Mock<IHttpClientFactory>();
        _mockLogger = new Mock<ILogger<MomoPaymentService>>();

        // Create service instance
        _service = new MomoPaymentService(
            _context,
            _mockSignatureService.Object,
            _mockConfigService.Object,
            _mockHttpClientFactory.Object,
            _mockLogger.Object);

        // Setup test data IDs
        _customerId1 = Guid.NewGuid();
        _customerId2 = Guid.NewGuid();
        _bookingId = Guid.NewGuid();
        _orderId = Guid.NewGuid();

        // Seed test data
        SeedTestData();
    }

    private void SeedTestData()
    {
        // Create test service category
        var category = new ServiceCategory
        {
            Id = Guid.NewGuid(),
            Name = "Test Category",
            Slug = "test-category",
            Icon = "🔧"
        };

        // Create test service
        var service = new ServiceEntity
        {
            Id = Guid.NewGuid(),
            CategoryId = category.Id,
            Category = category,
            Name = "Test Service",
            Slug = "test-service",
            ShortDescription = "Test short description",
            Description = "Test Description",
            PriceFrom = 100000,
            Duration = "60 minutes",
            CreatedAt = DateTime.UtcNow
        };

        // Create test booking for customer 1
        var booking = new ServiceBooking
        {
            Id = _bookingId,
            CustomerId = _customerId1,
            ServiceId = service.Id,
            Service = service,
            BookingDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            BookingTime = TimeOnly.Parse("10:00"),
            Status = BookingStatus.Pending,
            TotalPrice = 100000,
            LicensePlate = "29A-12345",
            VehicleModel = "Toyota Camry",
            CustomerName = "Customer One",
            CustomerPhone = "1234567890",
            CreatedAt = DateTime.UtcNow
        };

        // Create test order for customer 1
        var order = new Order
        {
            Id = _orderId,
            CustomerId = _customerId1,
            TotalAmount = 200000,
            Status = OrderStatus.Pending,
            ShippingAddress = "Test Address",
            Phone = "1234567890",
            PaymentMethod = "pending",
            IsPaid = false,
            CreatedAt = DateTime.UtcNow
        };

        // Create payment transaction for booking (customer 1)
        var bookingTransaction = new PaymentTransaction
        {
            Id = Guid.NewGuid(),
            RequestId = "REQ_BOOKING_001",
            OrderId = "BOOKING_ORDER_001",
            BookingId = _bookingId,
            Booking = booking,
            Amount = 100000,
            Status = "Pending",
            PaymentMethod = "momo_wallet",
            PaymentUrl = "https://test-payment.momo.vn/pay/123",
            QrCodeUrl = "https://test-payment.momo.vn/qr/123",
            CreatedAt = DateTime.UtcNow
        };

        // Create payment transaction for order (customer 1)
        var orderTransaction = new PaymentTransaction
        {
            Id = Guid.NewGuid(),
            RequestId = "REQ_ORDER_001",
            OrderId = "ORDER_ORDER_001",
            ProductOrderId = _orderId,
            ProductOrder = order,
            Amount = 200000,
            Status = "Success",
            PaymentMethod = "momo_wallet",
            PaymentUrl = "https://test-payment.momo.vn/pay/456",
            QrCodeUrl = "https://test-payment.momo.vn/qr/456",
            CreatedAt = DateTime.UtcNow.AddMinutes(-10),
            CompletedAt = DateTime.UtcNow.AddMinutes(-5),
            MomoTransId = 987654321
        };

        _context.ServiceCategories.Add(category);
        _context.Services.Add(service);
        _context.ServiceBookings.Add(booking);
        _context.Orders.Add(order);
        _context.PaymentTransactions.AddRange(bookingTransaction, orderTransaction);
        _context.SaveChanges();
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    [Fact]
    public async Task GetPaymentStatusAsync_WithValidBookingTransaction_ReturnsCorrectStatus()
    {
        // Arrange
        var orderId = "BOOKING_ORDER_001";

        // Act
        var result = await _service.GetPaymentStatusAsync(orderId, _customerId1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Pending", result.Status);
        Assert.Equal(100000, result.Amount);
        Assert.NotNull(result.PaymentUrl);
        Assert.NotNull(result.QrCodeUrl);
        Assert.Equal("https://test-payment.momo.vn/pay/123", result.PaymentUrl);
        Assert.Equal("https://test-payment.momo.vn/qr/123", result.QrCodeUrl);
        Assert.Null(result.CompletedAt);
    }

    [Fact]
    public async Task GetPaymentStatusAsync_WithValidOrderTransaction_ReturnsCorrectStatus()
    {
        // Arrange
        var orderId = "ORDER_ORDER_001";

        // Act
        var result = await _service.GetPaymentStatusAsync(orderId, _customerId1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Success", result.Status);
        Assert.Equal(200000, result.Amount);
        Assert.NotNull(result.CompletedAt);
        Assert.NotNull(result.PaymentUrl);
        Assert.NotNull(result.QrCodeUrl);
    }

    [Fact]
    public async Task GetPaymentStatusAsync_WithNonExistentOrderId_ThrowsNotFoundException()
    {
        // Arrange
        var nonExistentOrderId = "NON_EXISTENT_ORDER";

        // Act & Assert
        var exception = await Assert.ThrowsAsync<NotFoundException>(
            () => _service.GetPaymentStatusAsync(nonExistentOrderId, _customerId1));

        Assert.Equal("Payment transaction not found", exception.Message);
    }

    [Fact]
    public async Task GetPaymentStatusAsync_WithUnauthorizedUser_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var orderId = "BOOKING_ORDER_001";
        var unauthorizedUserId = _customerId2; // Different customer

        // Act & Assert
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _service.GetPaymentStatusAsync(orderId, unauthorizedUserId));

        Assert.Equal("You are not authorized to view this payment transaction", exception.Message);
    }

    [Fact]
    public async Task GetPaymentStatusAsync_VerifiesBookingOwnership_ForBookingTransaction()
    {
        // Arrange
        var orderId = "BOOKING_ORDER_001";
        var correctCustomerId = _customerId1;

        // Act
        var result = await _service.GetPaymentStatusAsync(orderId, correctCustomerId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Pending", result.Status);
    }

    [Fact]
    public async Task GetPaymentStatusAsync_VerifiesOrderOwnership_ForOrderTransaction()
    {
        // Arrange
        var orderId = "ORDER_ORDER_001";
        var correctCustomerId = _customerId1;

        // Act
        var result = await _service.GetPaymentStatusAsync(orderId, correctCustomerId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Success", result.Status);
    }

    [Fact]
    public async Task GetPaymentStatusAsync_ReturnsAllRequiredFields()
    {
        // Arrange
        var orderId = "ORDER_ORDER_001";

        // Act
        var result = await _service.GetPaymentStatusAsync(orderId, _customerId1);

        // Assert - Validates Requirements 6.3
        Assert.NotNull(result);
        Assert.NotEqual(Guid.Empty, result.TransactionId);
        Assert.NotNull(result.Status);
        Assert.True(result.Amount > 0);
        Assert.NotEqual(DateTime.MinValue, result.CreatedAt);
        // CompletedAt can be null for pending transactions, but should be set for completed ones
        Assert.NotNull(result.CompletedAt); // This specific transaction is completed
        Assert.NotNull(result.PaymentUrl);
        Assert.NotNull(result.QrCodeUrl);
    }

    [Fact]
    public async Task GetPaymentStatusAsync_WithPendingTransaction_CompletedAtIsNull()
    {
        // Arrange
        var orderId = "BOOKING_ORDER_001"; // This is a Pending transaction

        // Act
        var result = await _service.GetPaymentStatusAsync(orderId, _customerId1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Pending", result.Status);
        Assert.Null(result.CompletedAt);
    }

    [Fact]
    public async Task GetPaymentStatusAsync_WithCompletedTransaction_HasCompletedAt()
    {
        // Arrange
        var orderId = "ORDER_ORDER_001"; // This is a Success transaction

        // Act
        var result = await _service.GetPaymentStatusAsync(orderId, _customerId1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Success", result.Status);
        Assert.NotNull(result.CompletedAt);
        Assert.True(result.CompletedAt > result.CreatedAt);
    }
}

/// <summary>
/// Unit tests for MomoPaymentService.ProcessIpnNotificationAsync method.
/// Tests IPN processing, signature validation, idempotency, and status updates.
/// 
/// **Validates: Requirements 5.1-5.14, 8.1-8.3, 9.1-9.3, 16.3, 16.4, 20.3, 20.4**
/// </summary>
public class MomoPaymentServiceIpnTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly MomoPaymentService _service;
    private readonly Mock<ISignatureService> _mockSignatureService;
    private readonly Mock<IMomoConfigurationService> _mockConfigService;
    private readonly Mock<IHttpClientFactory> _mockHttpClientFactory;
    private readonly Mock<ILogger<MomoPaymentService>> _mockLogger;

    private readonly Guid _customerId;
    private readonly Guid _bookingId;
    private readonly Guid _orderId;
    private readonly PaymentTransaction _bookingTransaction;
    private readonly PaymentTransaction _orderTransaction;
    private readonly ServiceBooking _booking;
    private readonly Order _order;

    public MomoPaymentServiceIpnTests()
    {
        // Setup in-memory database
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new AppDbContext(options);

        // Setup mocks
        _mockSignatureService = new Mock<ISignatureService>();
        _mockConfigService = new Mock<IMomoConfigurationService>();
        _mockHttpClientFactory = new Mock<IHttpClientFactory>();
        _mockLogger = new Mock<ILogger<MomoPaymentService>>();

        // Configure mock to return valid settings
        _mockConfigService.Setup(x => x.GetSettings()).Returns(new MomoSettings
        {
            PartnerCode = "TEST_PARTNER",
            AccessKey = "TEST_ACCESS_KEY",
            SecretKey = "TEST_SECRET_KEY",
            ApiEndpoint = "https://test-payment.momo.vn",
            IpnCallbackUrl = "https://test.com/ipn",
            PaymentRedirectUrl = "https://test.com/redirect",
            IsTestMode = true
        });

        // Create service instance
        _service = new MomoPaymentService(
            _context,
            _mockSignatureService.Object,
            _mockConfigService.Object,
            _mockHttpClientFactory.Object,
            _mockLogger.Object);

        // Setup test data IDs
        _customerId = Guid.NewGuid();
        _bookingId = Guid.NewGuid();
        _orderId = Guid.NewGuid();

        // Seed test data
        var category = new ServiceCategory
        {
            Id = Guid.NewGuid(),
            Name = "Test Category",
            Slug = "test-category",
            Icon = "🔧"
        };

        var service = new ServiceEntity
        {
            Id = Guid.NewGuid(),
            CategoryId = category.Id,
            Category = category,
            Name = "Test Service",
            Slug = "test-service",
            ShortDescription = "Test short description",
            Description = "Test Description",
            PriceFrom = 100000,
            Duration = "60 minutes",
            CreatedAt = DateTime.UtcNow
        };

        _booking = new ServiceBooking
        {
            Id = _bookingId,
            CustomerId = _customerId,
            ServiceId = service.Id,
            Service = service,
            BookingDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            BookingTime = TimeOnly.Parse("10:00"),
            Status = BookingStatus.Pending,
            TotalPrice = 100000,
            LicensePlate = "29A-12345",
            VehicleModel = "Toyota Camry",
            CustomerName = "Test Customer",
            CustomerPhone = "1234567890",
            IsPaid = false,
            CreatedAt = DateTime.UtcNow
        };

        _order = new Order
        {
            Id = _orderId,
            CustomerId = _customerId,
            TotalAmount = 200000,
            Status = OrderStatus.Pending,
            ShippingAddress = "Test Address",
            Phone = "1234567890",
            PaymentMethod = "pending",
            IsPaid = false,
            CreatedAt = DateTime.UtcNow
        };

        _bookingTransaction = new PaymentTransaction
        {
            Id = Guid.NewGuid(),
            RequestId = "REQ_IPN_BOOKING_001",
            OrderId = "BOOKING_IPN_001",
            BookingId = _bookingId,
            Booking = _booking,
            Amount = 100000,
            Status = "Pending",
            PaymentMethod = "momo_wallet",
            CreatedAt = DateTime.UtcNow
        };

        _orderTransaction = new PaymentTransaction
        {
            Id = Guid.NewGuid(),
            RequestId = "REQ_IPN_ORDER_001",
            OrderId = "ORDER_IPN_001",
            ProductOrderId = _orderId,
            ProductOrder = _order,
            Amount = 200000,
            Status = "Pending",
            PaymentMethod = "momo_wallet",
            CreatedAt = DateTime.UtcNow
        };

        _context.ServiceCategories.Add(category);
        _context.Services.Add(service);
        _context.ServiceBookings.Add(_booking);
        _context.Orders.Add(_order);
        _context.PaymentTransactions.AddRange(_bookingTransaction, _orderTransaction);
        _context.SaveChanges();
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    [Fact]
    public async Task ProcessIpnNotificationAsync_WithValidSignatureAndSuccessCode_UpdatesTransactionToSuccess()
    {
        // Arrange
        var ipnRequest = new MomoIpnRequest
        {
            PartnerCode = "TEST_PARTNER",
            RequestId = "REQ_IPN_BOOKING_001",
            OrderId = "BOOKING_IPN_001",
            Amount = "100000",
            OrderInfo = "Test payment",
            OrderType = "captureWallet",
            TransId = 123456789,
            ResultCode = 0,
            Message = "Success",
            PayType = "qr",
            ResponseTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            ExtraData = "",
            Signature = "valid_signature"
        };

        _mockSignatureService.Setup(x => x.ValidateIpnSignature(It.IsAny<MomoIpnRequest>(), It.IsAny<string>()))
            .Returns(true);

        // Act
        await _service.ProcessIpnNotificationAsync(ipnRequest);

        // Assert - Validates Requirements 5.9, 5.10, 5.11
        var transaction = await _context.PaymentTransactions.FindAsync(_bookingTransaction.Id);
        Assert.NotNull(transaction);
        Assert.Equal("Success", transaction.Status);
        Assert.Equal(123456789, transaction.MomoTransId);
        Assert.Equal(0, transaction.ResultCode);
        Assert.Equal("Success", transaction.ResultMessage);
        Assert.NotNull(transaction.CompletedAt);
        Assert.Equal("valid_signature", transaction.Signature);
    }

    [Fact]
    public async Task ProcessIpnNotificationAsync_WithSuccessCode_UpdatesBookingPaymentStatus()
    {
        // Arrange
        var ipnRequest = new MomoIpnRequest
        {
            PartnerCode = "TEST_PARTNER",
            RequestId = "REQ_IPN_BOOKING_001",
            OrderId = "BOOKING_IPN_001",
            Amount = "100000",
            OrderInfo = "Test payment",
            OrderType = "captureWallet",
            TransId = 123456789,
            ResultCode = 0,
            Message = "Success",
            PayType = "qr",
            ResponseTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            ExtraData = "",
            Signature = "valid_signature"
        };

        _mockSignatureService.Setup(x => x.ValidateIpnSignature(It.IsAny<MomoIpnRequest>(), It.IsAny<string>()))
            .Returns(true);

        // Act
        await _service.ProcessIpnNotificationAsync(ipnRequest);

        // Assert - Validates Requirements 5.11, 8.1, 8.2
        var booking = await _context.ServiceBookings.FindAsync(_bookingId);
        Assert.NotNull(booking);
        Assert.True(booking.IsPaid);
        Assert.Equal("momo", booking.PaymentMethod);
        Assert.Equal(BookingStatus.Confirmed, booking.Status); // Status updated from Pending to Confirmed
    }

    [Fact]
    public async Task ProcessIpnNotificationAsync_WithSuccessCode_UpdatesOrderPaymentStatus()
    {
        // Arrange
        var ipnRequest = new MomoIpnRequest
        {
            PartnerCode = "TEST_PARTNER",
            RequestId = "REQ_IPN_ORDER_001",
            OrderId = "ORDER_IPN_001",
            Amount = "200000",
            OrderInfo = "Test payment",
            OrderType = "captureWallet",
            TransId = 987654321,
            ResultCode = 0,
            Message = "Success",
            PayType = "qr",
            ResponseTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            ExtraData = "",
            Signature = "valid_signature"
        };

        _mockSignatureService.Setup(x => x.ValidateIpnSignature(It.IsAny<MomoIpnRequest>(), It.IsAny<string>()))
            .Returns(true);

        // Act
        await _service.ProcessIpnNotificationAsync(ipnRequest);

        // Assert - Validates Requirements 5.11, 9.1, 9.2
        var order = await _context.Orders.FindAsync(_orderId);
        Assert.NotNull(order);
        Assert.True(order.IsPaid);
        Assert.Equal("momo", order.PaymentMethod);
        Assert.Equal(OrderStatus.Processing, order.Status); // Status updated from Pending to Processing
    }

    [Fact]
    public async Task ProcessIpnNotificationAsync_WithFailureCode_UpdatesTransactionToFailed()
    {
        // Arrange
        var ipnRequest = new MomoIpnRequest
        {
            PartnerCode = "TEST_PARTNER",
            RequestId = "REQ_IPN_BOOKING_001",
            OrderId = "BOOKING_IPN_001",
            Amount = "100000",
            OrderInfo = "Test payment",
            OrderType = "captureWallet",
            TransId = 123456789,
            ResultCode = 1001, // Insufficient funds
            Message = "Insufficient funds",
            PayType = "qr",
            ResponseTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            ExtraData = "",
            Signature = "valid_signature"
        };

        _mockSignatureService.Setup(x => x.ValidateIpnSignature(It.IsAny<MomoIpnRequest>(), It.IsAny<string>()))
            .Returns(true);

        // Act
        await _service.ProcessIpnNotificationAsync(ipnRequest);

        // Assert - Validates Requirements 5.10
        var transaction = await _context.PaymentTransactions.FindAsync(_bookingTransaction.Id);
        Assert.NotNull(transaction);
        Assert.Equal("Failed", transaction.Status);
        Assert.Equal(1001, transaction.ResultCode);
        Assert.Equal("Insufficient funds", transaction.ResultMessage);
        Assert.NotNull(transaction.CompletedAt);
    }

    [Fact]
    public async Task ProcessIpnNotificationAsync_WithInvalidSignature_ThrowsSecurityException()
    {
        // Arrange
        var ipnRequest = new MomoIpnRequest
        {
            PartnerCode = "TEST_PARTNER",
            RequestId = "REQ_IPN_BOOKING_001",
            OrderId = "BOOKING_IPN_001",
            Amount = "100000",
            OrderInfo = "Test payment",
            OrderType = "captureWallet",
            TransId = 123456789,
            ResultCode = 0,
            Message = "Success",
            PayType = "qr",
            ResponseTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            ExtraData = "",
            Signature = "invalid_signature"
        };

        _mockSignatureService.Setup(x => x.ValidateIpnSignature(It.IsAny<MomoIpnRequest>(), It.IsAny<string>()))
            .Returns(false);

        // Act & Assert - Validates Requirements 5.6
        var exception = await Assert.ThrowsAsync<SecurityException>(
            () => _service.ProcessIpnNotificationAsync(ipnRequest));

        Assert.Equal("Invalid IPN signature", exception.Message);

        // Verify transaction status unchanged
        var transaction = await _context.PaymentTransactions.FindAsync(_bookingTransaction.Id);
        Assert.Equal("Pending", transaction.Status);
    }

    [Fact]
    public async Task ProcessIpnNotificationAsync_WithNonExistentTransaction_ThrowsNotFoundException()
    {
        // Arrange
        var ipnRequest = new MomoIpnRequest
        {
            PartnerCode = "TEST_PARTNER",
            RequestId = "REQ_NON_EXISTENT",
            OrderId = "ORDER_NON_EXISTENT",
            Amount = "100000",
            OrderInfo = "Test payment",
            OrderType = "captureWallet",
            TransId = 123456789,
            ResultCode = 0,
            Message = "Success",
            PayType = "qr",
            ResponseTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            ExtraData = "",
            Signature = "valid_signature"
        };

        _mockSignatureService.Setup(x => x.ValidateIpnSignature(It.IsAny<MomoIpnRequest>(), It.IsAny<string>()))
            .Returns(true);

        // Act & Assert - Validates Requirements 5.8
        var exception = await Assert.ThrowsAsync<NotFoundException>(
            () => _service.ProcessIpnNotificationAsync(ipnRequest));

        Assert.Equal("Transaction not found", exception.Message);
    }

    [Fact]
    public async Task ProcessIpnNotificationAsync_WithAmountMismatch_MarksTransactionAsFailed()
    {
        // Arrange
        var ipnRequest = new MomoIpnRequest
        {
            PartnerCode = "TEST_PARTNER",
            RequestId = "REQ_IPN_BOOKING_001",
            OrderId = "BOOKING_IPN_001",
            Amount = "999999", // Mismatched amount (expected 100000)
            OrderInfo = "Test payment",
            OrderType = "captureWallet",
            TransId = 123456789,
            ResultCode = 0,
            Message = "Success",
            PayType = "qr",
            ResponseTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            ExtraData = "",
            Signature = "valid_signature"
        };

        _mockSignatureService.Setup(x => x.ValidateIpnSignature(It.IsAny<MomoIpnRequest>(), It.IsAny<string>()))
            .Returns(true);

        // Act
        await _service.ProcessIpnNotificationAsync(ipnRequest);

        // Assert - Validates Requirements 16.3, 16.4
        var transaction = await _context.PaymentTransactions.FindAsync(_bookingTransaction.Id);
        Assert.NotNull(transaction);
        Assert.Equal("Failed", transaction.Status);
        Assert.Equal("Amount mismatch", transaction.ResultMessage);
        Assert.NotNull(transaction.CompletedAt);

        // Verify booking is NOT marked as paid
        var booking = await _context.ServiceBookings.FindAsync(_bookingId);
        Assert.False(booking.IsPaid);
    }

    [Fact]
    public async Task ProcessIpnNotificationAsync_WithAlreadyProcessedTransaction_DoesNotReprocess()
    {
        // Arrange - First, process the IPN successfully
        var ipnRequest = new MomoIpnRequest
        {
            PartnerCode = "TEST_PARTNER",
            RequestId = "REQ_IPN_BOOKING_001",
            OrderId = "BOOKING_IPN_001",
            Amount = "100000",
            OrderInfo = "Test payment",
            OrderType = "captureWallet",
            TransId = 123456789,
            ResultCode = 0,
            Message = "Success",
            PayType = "qr",
            ResponseTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            ExtraData = "",
            Signature = "valid_signature"
        };

        _mockSignatureService.Setup(x => x.ValidateIpnSignature(It.IsAny<MomoIpnRequest>(), It.IsAny<string>()))
            .Returns(true);

        await _service.ProcessIpnNotificationAsync(ipnRequest);

        // Get the completed time from first processing
        var firstCompletedAt = (await _context.PaymentTransactions.FindAsync(_bookingTransaction.Id))!.CompletedAt;

        // Wait a moment to ensure timestamp would be different
        await Task.Delay(100);

        // Act - Process the same IPN again (duplicate)
        await _service.ProcessIpnNotificationAsync(ipnRequest);

        // Assert - Validates Requirements 20.3, 20.4 (Idempotency)
        var transaction = await _context.PaymentTransactions.FindAsync(_bookingTransaction.Id);
        Assert.NotNull(transaction);
        Assert.Equal("Success", transaction.Status);
        // CompletedAt should be unchanged (proving no reprocessing occurred)
        Assert.Equal(firstCompletedAt, transaction.CompletedAt);
    }

    [Fact]
    public async Task ProcessIpnNotificationAsync_FindsTransactionByRequestId()
    {
        // Arrange - IPN with only requestId matching
        var ipnRequest = new MomoIpnRequest
        {
            PartnerCode = "TEST_PARTNER",
            RequestId = "REQ_IPN_BOOKING_001",
            OrderId = "DIFFERENT_ORDER_ID", // Different orderId
            Amount = "100000",
            OrderInfo = "Test payment",
            OrderType = "captureWallet",
            TransId = 123456789,
            ResultCode = 0,
            Message = "Success",
            PayType = "qr",
            ResponseTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            ExtraData = "",
            Signature = "valid_signature"
        };

        _mockSignatureService.Setup(x => x.ValidateIpnSignature(It.IsAny<MomoIpnRequest>(), It.IsAny<string>()))
            .Returns(true);

        // Act
        await _service.ProcessIpnNotificationAsync(ipnRequest);

        // Assert - Validates Requirements 5.7 (Find by requestId)
        var transaction = await _context.PaymentTransactions.FindAsync(_bookingTransaction.Id);
        Assert.NotNull(transaction);
        Assert.Equal("Success", transaction.Status);
    }

    [Fact]
    public async Task ProcessIpnNotificationAsync_StoresAllIpnData()
    {
        // Arrange
        var ipnRequest = new MomoIpnRequest
        {
            PartnerCode = "TEST_PARTNER",
            RequestId = "REQ_IPN_BOOKING_001",
            OrderId = "BOOKING_IPN_001",
            Amount = "100000",
            OrderInfo = "Test payment",
            OrderType = "captureWallet",
            TransId = 123456789,
            ResultCode = 0,
            Message = "Payment successful",
            PayType = "qr",
            ResponseTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            ExtraData = "extra_data_test",
            Signature = "valid_signature_test"
        };

        _mockSignatureService.Setup(x => x.ValidateIpnSignature(It.IsAny<MomoIpnRequest>(), It.IsAny<string>()))
            .Returns(true);

        // Act
        await _service.ProcessIpnNotificationAsync(ipnRequest);

        // Assert - Validates Requirements 5.13 (Store all IPN data)
        var transaction = await _context.PaymentTransactions.FindAsync(_bookingTransaction.Id);
        Assert.NotNull(transaction);
        Assert.Equal(123456789, transaction.MomoTransId);
        Assert.Equal(0, transaction.ResultCode);
        Assert.Equal("Payment successful", transaction.ResultMessage);
        Assert.NotNull(transaction.CompletedAt);
        Assert.Equal("valid_signature_test", transaction.Signature);
    }
}
