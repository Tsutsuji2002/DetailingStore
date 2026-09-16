using System.Security.Claims;
using System.Text.Json;
using DetailingStore.Api.Controllers;
using DetailingStore.Api.Data;
using DetailingStore.Api.DTOs;
using DetailingStore.Api.Models;
using DetailingStore.Api.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace DetailingStore.Api.Tests
{
    /// <summary>
    /// Unit tests for ServiceRequestsController.
    /// Tests customer service request submission functionality.
    /// </summary>
    public class ServiceRequestsControllerTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly Mock<IEmailService> _mockEmailService;
        private readonly Mock<ILogger<ServiceRequestsController>> _mockLogger;
        private readonly ServiceRequestsController _controller;
        private readonly User _testCustomer;
        private readonly ServiceEntity _testService;

        public ServiceRequestsControllerTests()
        {
            // Setup in-memory database
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new AppDbContext(options);

            // Create test customer
            _testCustomer = new User
            {
                Id = Guid.NewGuid(),
                FirstName = "Test",
                LastName = "Customer",
                Email = "test@example.com",
                Phone = "0901234567",
                Username = "testcustomer",
                Role = UserRole.Customer,
                PasswordHash = "hashedpassword",
                AuthProvider = "local",
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };
            _context.Users.Add(_testCustomer);

            // Create test service
            _testService = new ServiceEntity
            {
                Id = Guid.NewGuid(),
                Name = "Test Detailing Service",
                Slug = "test-detailing-service",
                Description = "Test service description",
                ShortDescription = "Test service",
                PriceFrom = 500000m,
                Duration = "120",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CategoryId = Guid.NewGuid()
            };
            _context.Services.Add(_testService);

            _context.SaveChanges();

            // Setup mocks
            _mockEmailService = new Mock<IEmailService>();
            _mockEmailService
                .Setup(e => e.SendServiceRequestConfirmationAsync(
                    It.IsAny<string>(), 
                    It.IsAny<string>(), 
                    It.IsAny<ServiceRequestDto>()))
                .ReturnsAsync(true);

            _mockLogger = new Mock<ILogger<ServiceRequestsController>>();

            // Create controller
            _controller = new ServiceRequestsController(
                _context,
                _mockEmailService.Object,
                _mockLogger.Object);

            // Setup authenticated user context
            SetupAuthenticatedUser(_testCustomer.Id);
        }

        private void SetupAuthenticatedUser(Guid userId)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Role, "Customer")
            };
            var identity = new ClaimsIdentity(claims, "TestAuthType");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };
        }

        [Fact]
        public async Task CreateServiceRequest_ValidRequest_ReturnsCreatedWithServiceRequestDto()
        {
            // Arrange
            var dto = new CreateServiceRequestDto
            {
                LicensePlate = "51A-12345",
                VehicleModel = "Honda SH350i",
                VehicleYear = 2023,
                RequestedServiceId = _testService.Id,
                PreferredDate = DateOnly.FromDateTime(DateTime.Today.AddDays(7)),
                PreferredTime = new TimeOnly(10, 30),
                CustomerNotes = "Please call before arriving"
            };

            // Act
            var result = await _controller.CreateServiceRequest(dto);

            // Assert
            var actionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var response = Assert.IsType<ApiResponse<ServiceRequestDto>>(actionResult.Value);
            
            Assert.True(response.Success);
            Assert.NotNull(response.Data);
            Assert.Equal(_testCustomer.Id, response.Data.CustomerId);
            Assert.Equal(_testCustomer.Email, response.Data.CustomerEmail);
            Assert.Equal("51A-12345", response.Data.VehicleInfo.LicensePlate);
            Assert.Equal("Honda SH350i", response.Data.VehicleInfo.Model);
            Assert.Equal(2023, response.Data.VehicleInfo.Year);
            Assert.Equal(_testService.Id, response.Data.RequestedServiceId);
            Assert.Equal(_testService.Name, response.Data.RequestedServiceName);
            Assert.Equal(ServiceRequestStatus.Pending, response.Data.Status);
            Assert.Equal("Please call before arriving", response.Data.CustomerNotes);
        }

        [Fact]
        public async Task CreateServiceRequest_ValidRequest_SavesToDatabase()
        {
            // Arrange
            var dto = new CreateServiceRequestDto
            {
                LicensePlate = "51B-67890",
                VehicleModel = "Yamaha Exciter",
                VehicleYear = 2022,
                RequestedServiceId = _testService.Id,
                PreferredDate = DateOnly.FromDateTime(DateTime.Today.AddDays(5)),
                PreferredTime = new TimeOnly(14, 0),
                CustomerNotes = null
            };

            // Act
            await _controller.CreateServiceRequest(dto);

            // Assert
            var savedRequest = await _context.ServiceRequests
                .FirstOrDefaultAsync(sr => sr.VehicleInfo.Contains("51B-67890"));

            Assert.NotNull(savedRequest);
            Assert.Equal(_testCustomer.Id, savedRequest.CustomerId);
            Assert.Equal(ServiceRequestStatus.Pending, savedRequest.Status);
            
            var vehicleInfo = JsonSerializer.Deserialize<VehicleInfoDto>(savedRequest.VehicleInfo);
            Assert.NotNull(vehicleInfo);
            Assert.Equal("51B-67890", vehicleInfo.LicensePlate);
            Assert.Equal("Yamaha Exciter", vehicleInfo.Model);
            Assert.Equal(2022, vehicleInfo.Year);
        }

        [Fact]
        public async Task CreateServiceRequest_ValidRequest_TriggersEmailService()
        {
            // Arrange
            var dto = new CreateServiceRequestDto
            {
                LicensePlate = "51C-11111",
                VehicleModel = "Honda Wave",
                VehicleYear = 2021,
                RequestedServiceId = _testService.Id,
                PreferredDate = DateOnly.FromDateTime(DateTime.Today.AddDays(3)),
                PreferredTime = new TimeOnly(9, 0)
            };

            // Act
            await _controller.CreateServiceRequest(dto);

            // Wait for fire-and-forget task to complete
            await Task.Delay(200);

            // Assert - Email service should be called
            _mockEmailService.Verify(
                e => e.SendServiceRequestConfirmationAsync(
                    _testCustomer.Email,
                    It.IsAny<string>(),
                    It.Is<ServiceRequestDto>(d => d.CustomerId == _testCustomer.Id)),
                Times.Once);
        }

        [Fact]
        public async Task CreateServiceRequest_NonExistentService_ReturnsBadRequest()
        {
            // Arrange
            var nonExistentServiceId = Guid.NewGuid();
            var dto = new CreateServiceRequestDto
            {
                LicensePlate = "51D-22222",
                VehicleModel = "Honda Air Blade",
                VehicleYear = 2020,
                RequestedServiceId = nonExistentServiceId,
                PreferredDate = DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
                PreferredTime = new TimeOnly(15, 30)
            };

            // Act
            var result = await _controller.CreateServiceRequest(dto);

            // Assert
            var actionResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponse<ServiceRequestDto>>(actionResult.Value);
            
            Assert.False(response.Success);
            Assert.Contains("không tồn tại", response.Message);
        }

        [Fact]
        public async Task CreateServiceRequest_UnauthenticatedUser_ReturnsUnauthorized()
        {
            // Arrange
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };

            var dto = new CreateServiceRequestDto
            {
                LicensePlate = "51E-33333",
                VehicleModel = "Suzuki Raider",
                VehicleYear = 2019,
                RequestedServiceId = _testService.Id,
                PreferredDate = DateOnly.FromDateTime(DateTime.Today.AddDays(2)),
                PreferredTime = new TimeOnly(11, 0)
            };

            // Act
            var result = await _controller.CreateServiceRequest(dto);

            // Assert
            Assert.IsType<UnauthorizedObjectResult>(result.Result);
        }

        [Fact]
        public async Task CreateServiceRequest_NonExistentCustomer_ReturnsNotFound()
        {
            // Arrange
            var nonExistentUserId = Guid.NewGuid();
            SetupAuthenticatedUser(nonExistentUserId);

            var dto = new CreateServiceRequestDto
            {
                LicensePlate = "51F-44444",
                VehicleModel = "Honda Winner",
                VehicleYear = 2024,
                RequestedServiceId = _testService.Id,
                PreferredDate = DateOnly.FromDateTime(DateTime.Today.AddDays(6)),
                PreferredTime = new TimeOnly(13, 0)
            };

            // Act
            var result = await _controller.CreateServiceRequest(dto);

            // Assert
            var actionResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponse<ServiceRequestDto>>(actionResult.Value);
            
            Assert.False(response.Success);
            Assert.Contains("Không tìm thấy", response.Message);
        }

        [Fact]
        public async Task CreateServiceRequest_StoresCorrectCustomerInformation()
        {
            // Arrange
            var dto = new CreateServiceRequestDto
            {
                LicensePlate = "51G-55555",
                VehicleModel = "Vespa Sprint",
                VehicleYear = 2023,
                RequestedServiceId = _testService.Id,
                PreferredDate = DateOnly.FromDateTime(DateTime.Today.AddDays(4)),
                PreferredTime = new TimeOnly(16, 0)
            };

            // Act
            await _controller.CreateServiceRequest(dto);

            // Assert
            var savedRequest = await _context.ServiceRequests
                .FirstOrDefaultAsync(sr => sr.VehicleInfo.Contains("51G-55555"));

            Assert.NotNull(savedRequest);
            Assert.Equal("Test Customer", savedRequest.CustomerName);
            Assert.Equal("test@example.com", savedRequest.CustomerEmail);
            Assert.Equal("0901234567", savedRequest.CustomerPhone);
        }

        [Fact]
        public async Task CreateServiceRequest_WithoutNotes_SavesSuccessfully()
        {
            // Arrange
            var dto = new CreateServiceRequestDto
            {
                LicensePlate = "51H-66666",
                VehicleModel = "Honda Vision",
                VehicleYear = null,
                RequestedServiceId = _testService.Id,
                PreferredDate = DateOnly.FromDateTime(DateTime.Today.AddDays(8)),
                PreferredTime = new TimeOnly(8, 30),
                CustomerNotes = null
            };

            // Act
            var result = await _controller.CreateServiceRequest(dto);

            // Assert
            var actionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var response = Assert.IsType<ApiResponse<ServiceRequestDto>>(actionResult.Value);
            
            Assert.True(response.Success);
            Assert.Null(response.Data.CustomerNotes);
            Assert.Null(response.Data.VehicleInfo.Year);
        }

        [Fact]
        public async Task CreateServiceRequest_EmailServiceFailure_StillSavesRequest()
        {
            // Arrange
            _mockEmailService
                .Setup(e => e.SendServiceRequestConfirmationAsync(
                    It.IsAny<string>(), 
                    It.IsAny<string>(), 
                    It.IsAny<ServiceRequestDto>()))
                .ReturnsAsync(false);

            var dto = new CreateServiceRequestDto
            {
                LicensePlate = "51I-77777",
                VehicleModel = "Honda PCX",
                VehicleYear = 2023,
                RequestedServiceId = _testService.Id,
                PreferredDate = DateOnly.FromDateTime(DateTime.Today.AddDays(10)),
                PreferredTime = new TimeOnly(12, 0)
            };

            // Act
            var result = await _controller.CreateServiceRequest(dto);

            // Assert
            var actionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var response = Assert.IsType<ApiResponse<ServiceRequestDto>>(actionResult.Value);
            
            Assert.True(response.Success);
            
            // Verify request was still saved to database
            var savedRequest = await _context.ServiceRequests
                .FirstOrDefaultAsync(sr => sr.VehicleInfo.Contains("51I-77777"));
            Assert.NotNull(savedRequest);
        }

        [Fact]
        public async Task GetServiceRequests_AsAdmin_ReturnsAllServiceRequests()
        {
            // Arrange
            SetupAuthenticatedAdmin();

            // Create multiple service requests with different statuses
            var sr1 = CreateServiceRequestEntity("51J-11111", ServiceRequestStatus.Pending);
            var sr2 = CreateServiceRequestEntity("51J-22222", ServiceRequestStatus.Accepted);
            var sr3 = CreateServiceRequestEntity("51J-33333", ServiceRequestStatus.Rejected);
            
            _context.ServiceRequests.AddRange(sr1, sr2, sr3);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetServiceRequests(null);

            // Assert
            var actionResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponse<List<ServiceRequestDto>>>(actionResult.Value);
            
            Assert.True(response.Success);
            Assert.NotNull(response.Data);
            Assert.Equal(3, response.Data.Count);
            
            // Verify order by CreatedAt descending (newest first)
            Assert.True(response.Data[0].CreatedAt >= response.Data[1].CreatedAt);
            Assert.True(response.Data[1].CreatedAt >= response.Data[2].CreatedAt);
        }

        [Fact]
        public async Task GetServiceRequests_WithStatusFilter_ReturnsFilteredRequests()
        {
            // Arrange
            SetupAuthenticatedAdmin();

            var sr1 = CreateServiceRequestEntity("51K-11111", ServiceRequestStatus.Pending);
            var sr2 = CreateServiceRequestEntity("51K-22222", ServiceRequestStatus.Pending);
            var sr3 = CreateServiceRequestEntity("51K-33333", ServiceRequestStatus.Accepted);
            
            _context.ServiceRequests.AddRange(sr1, sr2, sr3);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetServiceRequests(ServiceRequestStatus.Pending);

            // Assert
            var actionResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponse<List<ServiceRequestDto>>>(actionResult.Value);
            
            Assert.True(response.Success);
            Assert.NotNull(response.Data);
            Assert.Equal(2, response.Data.Count);
            Assert.All(response.Data, sr => Assert.Equal(ServiceRequestStatus.Pending, sr.Status));
        }

        [Fact]
        public async Task GetServiceRequests_IncludesCustomerAndServiceDetails()
        {
            // Arrange
            SetupAuthenticatedAdmin();

            var sr = CreateServiceRequestEntity("51L-11111", ServiceRequestStatus.Pending);
            _context.ServiceRequests.Add(sr);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetServiceRequests(null);

            // Assert
            var actionResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponse<List<ServiceRequestDto>>>(actionResult.Value);
            
            Assert.True(response.Success);
            Assert.Single(response.Data);
            
            var dto = response.Data[0];
            Assert.Equal(_testCustomer.Email, dto.CustomerEmail);
            Assert.Equal("Test Customer", dto.CustomerName);
            Assert.Equal(_testService.Name, dto.RequestedServiceName);
            Assert.Equal("51L-11111", dto.VehicleInfo.LicensePlate);
        }

        [Fact]
        public async Task GetServiceRequests_ParsesVehicleInfoCorrectly()
        {
            // Arrange
            SetupAuthenticatedAdmin();

            var sr = CreateServiceRequestEntity("51M-99999", ServiceRequestStatus.Pending);
            _context.ServiceRequests.Add(sr);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetServiceRequests(null);

            // Assert
            var actionResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponse<List<ServiceRequestDto>>>(actionResult.Value);
            
            Assert.Single(response.Data);
            var vehicleInfo = response.Data[0].VehicleInfo;
            Assert.NotNull(vehicleInfo);
            Assert.Equal("51M-99999", vehicleInfo.LicensePlate);
            Assert.Equal("Honda SH350i", vehicleInfo.Model);
            Assert.Equal(2023, vehicleInfo.Year);
        }

        [Fact]
        public async Task GetServiceRequests_EmptyDatabase_ReturnsEmptyList()
        {
            // Arrange
            SetupAuthenticatedAdmin();

            // Act
            var result = await _controller.GetServiceRequests(null);

            // Assert
            var actionResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponse<List<ServiceRequestDto>>>(actionResult.Value);
            
            Assert.True(response.Success);
            Assert.NotNull(response.Data);
            Assert.Empty(response.Data);
        }

        private void SetupAuthenticatedAdmin()
        {
            var adminId = Guid.NewGuid();
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, adminId.ToString()),
                new Claim(ClaimTypes.Role, "Admin")
            };
            var identity = new ClaimsIdentity(claims, "TestAuthType");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };
        }

        private ServiceRequestEntity CreateServiceRequestEntity(string licensePlate, ServiceRequestStatus status)
        {
            var vehicleInfo = new VehicleInfoDto
            {
                LicensePlate = licensePlate,
                Model = "Honda SH350i",
                Year = 2023
            };

            return new ServiceRequestEntity
            {
                Id = Guid.NewGuid(),
                CustomerId = _testCustomer.Id,
                CustomerName = "Test Customer",
                CustomerEmail = _testCustomer.Email,
                CustomerPhone = _testCustomer.Phone ?? "0901234567",
                VehicleInfo = JsonSerializer.Serialize(vehicleInfo),
                RequestedServiceId = _testService.Id,
                PreferredDate = DateOnly.FromDateTime(DateTime.Today.AddDays(7)),
                PreferredTime = new TimeOnly(10, 30),
                CustomerNotes = "Test notes",
                Status = status,
                CreatedAt = DateTime.UtcNow.AddMinutes(-Random.Shared.Next(1, 100)),
                Customer = _testCustomer,
                RequestedService = _testService
            };
        }

        [Fact]
        public async Task RejectServiceRequest_ValidPendingRequest_ReturnsOkWithRejectedStatus()
        {
            // Arrange
            SetupAuthenticatedAdmin();
            
            var serviceRequest = CreateServiceRequestEntity("51N-11111", ServiceRequestStatus.Pending);
            _context.ServiceRequests.Add(serviceRequest);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.RejectServiceRequest(serviceRequest.Id);

            // Assert
            var actionResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponse<ServiceRequestDto>>(actionResult.Value);
            
            Assert.True(response.Success);
            Assert.NotNull(response.Data);
            Assert.Equal(ServiceRequestStatus.Rejected, response.Data.Status);
            Assert.Contains("từ chối", response.Message);
        }

        [Fact]
        public async Task RejectServiceRequest_ValidPendingRequest_UpdatesStatusInDatabase()
        {
            // Arrange
            SetupAuthenticatedAdmin();
            
            var adminId = Guid.Parse(_controller.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var serviceRequest = CreateServiceRequestEntity("51N-22222", ServiceRequestStatus.Pending);
            _context.ServiceRequests.Add(serviceRequest);
            await _context.SaveChangesAsync();

            // Act
            await _controller.RejectServiceRequest(serviceRequest.Id);

            // Assert
            var updatedRequest = await _context.ServiceRequests.FindAsync(serviceRequest.Id);
            Assert.NotNull(updatedRequest);
            Assert.Equal(ServiceRequestStatus.Rejected, updatedRequest.Status);
            Assert.NotNull(updatedRequest.ReviewedAt);
            Assert.Equal(adminId, updatedRequest.ReviewedByAdminId);
        }

        [Fact]
        public async Task RejectServiceRequest_ValidPendingRequest_SetsReviewedAtTimestamp()
        {
            // Arrange
            SetupAuthenticatedAdmin();
            
            var serviceRequest = CreateServiceRequestEntity("51N-33333", ServiceRequestStatus.Pending);
            _context.ServiceRequests.Add(serviceRequest);
            await _context.SaveChangesAsync();

            var beforeReject = DateTime.UtcNow;

            // Act
            await _controller.RejectServiceRequest(serviceRequest.Id);

            var afterReject = DateTime.UtcNow;

            // Assert
            var updatedRequest = await _context.ServiceRequests.FindAsync(serviceRequest.Id);
            Assert.NotNull(updatedRequest);
            Assert.NotNull(updatedRequest.ReviewedAt);
            Assert.True(updatedRequest.ReviewedAt >= beforeReject);
            Assert.True(updatedRequest.ReviewedAt <= afterReject);
        }

        [Fact]
        public async Task RejectServiceRequest_ValidPendingRequest_SetsReviewedByAdminId()
        {
            // Arrange
            var adminId = Guid.NewGuid();
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, adminId.ToString()),
                new Claim(ClaimTypes.Role, "Admin")
            };
            var identity = new ClaimsIdentity(claims, "TestAuthType");
            var claimsPrincipal = new ClaimsPrincipal(identity);
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };
            
            var serviceRequest = CreateServiceRequestEntity("51N-44444", ServiceRequestStatus.Pending);
            _context.ServiceRequests.Add(serviceRequest);
            await _context.SaveChangesAsync();

            // Act
            await _controller.RejectServiceRequest(serviceRequest.Id);

            // Assert
            var updatedRequest = await _context.ServiceRequests.FindAsync(serviceRequest.Id);
            Assert.NotNull(updatedRequest);
            Assert.Equal(adminId, updatedRequest.ReviewedByAdminId);
        }

        [Fact]
        public async Task RejectServiceRequest_NonExistentId_ReturnsNotFound()
        {
            // Arrange
            SetupAuthenticatedAdmin();
            var nonExistentId = Guid.NewGuid();

            // Act
            var result = await _controller.RejectServiceRequest(nonExistentId);

            // Assert
            var actionResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponse<ServiceRequestDto>>(actionResult.Value);
            
            Assert.False(response.Success);
            Assert.Contains("Không tìm thấy", response.Message);
        }

        [Fact]
        public async Task RejectServiceRequest_AcceptedRequest_ReturnsBadRequest()
        {
            // Arrange
            SetupAuthenticatedAdmin();
            
            var serviceRequest = CreateServiceRequestEntity("51N-55555", ServiceRequestStatus.Accepted);
            _context.ServiceRequests.Add(serviceRequest);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.RejectServiceRequest(serviceRequest.Id);

            // Assert
            var actionResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponse<ServiceRequestDto>>(actionResult.Value);
            
            Assert.False(response.Success);
            Assert.Contains("chờ xử lý", response.Message);
        }

        [Fact]
        public async Task RejectServiceRequest_RejectedRequest_ReturnsBadRequest()
        {
            // Arrange
            SetupAuthenticatedAdmin();
            
            var serviceRequest = CreateServiceRequestEntity("51N-66666", ServiceRequestStatus.Rejected);
            _context.ServiceRequests.Add(serviceRequest);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.RejectServiceRequest(serviceRequest.Id);

            // Assert
            var actionResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponse<ServiceRequestDto>>(actionResult.Value);
            
            Assert.False(response.Success);
            Assert.Contains("chờ xử lý", response.Message);
        }

        [Fact]
        public async Task RejectServiceRequest_UnauthenticatedUser_ReturnsUnauthorized()
        {
            // Arrange
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };
            
            var serviceRequest = CreateServiceRequestEntity("51N-77777", ServiceRequestStatus.Pending);
            _context.ServiceRequests.Add(serviceRequest);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.RejectServiceRequest(serviceRequest.Id);

            // Assert
            Assert.IsType<UnauthorizedObjectResult>(result.Result);
        }

        [Fact]
        public async Task RejectServiceRequest_ReturnsCorrectVehicleInfo()
        {
            // Arrange
            SetupAuthenticatedAdmin();
            
            var serviceRequest = CreateServiceRequestEntity("51N-88888", ServiceRequestStatus.Pending);
            _context.ServiceRequests.Add(serviceRequest);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.RejectServiceRequest(serviceRequest.Id);

            // Assert
            var actionResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponse<ServiceRequestDto>>(actionResult.Value);
            
            Assert.True(response.Success);
            Assert.NotNull(response.Data.VehicleInfo);
            Assert.Equal("51N-88888", response.Data.VehicleInfo.LicensePlate);
            Assert.Equal("Honda SH350i", response.Data.VehicleInfo.Model);
            Assert.Equal(2023, response.Data.VehicleInfo.Year);
        }

        [Fact]
        public async Task RejectServiceRequest_IncludesServiceDetails()
        {
            // Arrange
            SetupAuthenticatedAdmin();
            
            var serviceRequest = CreateServiceRequestEntity("51N-99999", ServiceRequestStatus.Pending);
            _context.ServiceRequests.Add(serviceRequest);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.RejectServiceRequest(serviceRequest.Id);

            // Assert
            var actionResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponse<ServiceRequestDto>>(actionResult.Value);
            
            Assert.True(response.Success);
            Assert.Equal(_testService.Id, response.Data.RequestedServiceId);
            Assert.Equal(_testService.Name, response.Data.RequestedServiceName);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
