namespace DetailingStore.Api.Services;

using DetailingStore.Api.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

/// <summary>
/// Service for managing Momo Payment Gateway configuration and credentials
/// Validates configuration on startup and provides access to Momo settings
/// </summary>
public class MomoConfigurationService : IMomoConfigurationService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<MomoConfigurationService> _logger;
    private readonly MomoSettings _settings;

    /// <summary>
    /// Initializes the Momo configuration service
    /// Loads settings from IConfiguration and validates them on construction
    /// </summary>
    public MomoConfigurationService(
        IConfiguration configuration,
        ILogger<MomoConfigurationService> logger)
    {
        _configuration = configuration;
        _logger = logger;
        _settings = LoadSettings();
        
        // Validate configuration on startup
        if (!ValidateConfiguration())
        {
            _logger.LogError(
                "Momo payment gateway configuration is invalid or incomplete. " +
                "Please ensure all required settings are configured in appsettings.json or environment variables.");
        }
        
        // Warn if running in test mode
        if (_settings.IsTestMode)
        {
            _logger.LogWarning(
                "Momo payment gateway is running in TEST MODE. " +
                "Payments will be processed through Momo sandbox environment at {ApiEndpoint}",
                _settings.ApiEndpoint);
        }
    }

    /// <summary>
    /// Gets the current Momo configuration settings
    /// </summary>
    public MomoSettings GetSettings() => _settings;

    /// <summary>
    /// Validates that all required configuration fields are present and non-empty
    /// </summary>
    /// <returns>True if all required fields are valid, false otherwise</returns>
    public bool ValidateConfiguration()
    {
        var isValid = !string.IsNullOrWhiteSpace(_settings.PartnerCode) &&
                      !string.IsNullOrWhiteSpace(_settings.AccessKey) &&
                      !string.IsNullOrWhiteSpace(_settings.SecretKey) &&
                      !string.IsNullOrWhiteSpace(_settings.ApiEndpoint) &&
                      !string.IsNullOrWhiteSpace(_settings.IpnCallbackUrl) &&
                      !string.IsNullOrWhiteSpace(_settings.PaymentRedirectUrl);

        if (!isValid)
        {
            var missingFields = new List<string>();
            if (string.IsNullOrWhiteSpace(_settings.PartnerCode)) 
                missingFields.Add("PartnerCode");
            if (string.IsNullOrWhiteSpace(_settings.AccessKey)) 
                missingFields.Add("AccessKey");
            if (string.IsNullOrWhiteSpace(_settings.SecretKey)) 
                missingFields.Add("SecretKey");
            if (string.IsNullOrWhiteSpace(_settings.ApiEndpoint)) 
                missingFields.Add("ApiEndpoint");
            if (string.IsNullOrWhiteSpace(_settings.IpnCallbackUrl)) 
                missingFields.Add("IpnCallbackUrl");
            if (string.IsNullOrWhiteSpace(_settings.PaymentRedirectUrl)) 
                missingFields.Add("PaymentRedirectUrl");

            _logger.LogError(
                "Missing or empty Momo configuration fields: {MissingFields}",
                string.Join(", ", missingFields));
        }

        return isValid;
    }

    /// <summary>
    /// Loads Momo settings from IConfiguration
    /// Reads from MomoSettings section in appsettings.json or environment variables
    /// </summary>
    private MomoSettings LoadSettings()
    {
        return new MomoSettings
        {
            PartnerCode = _configuration["MomoSettings:PartnerCode"] ?? string.Empty,
            AccessKey = _configuration["MomoSettings:AccessKey"] ?? string.Empty,
            SecretKey = _configuration["MomoSettings:SecretKey"] ?? string.Empty,
            ApiEndpoint = _configuration["MomoSettings:ApiEndpoint"] ?? string.Empty,
            IpnCallbackUrl = _configuration["MomoSettings:IpnCallbackUrl"] ?? string.Empty,
            PaymentRedirectUrl = _configuration["MomoSettings:PaymentRedirectUrl"] ?? string.Empty,
            IsTestMode = bool.Parse(_configuration["MomoSettings:IsTestMode"] ?? "true")
        };
    }
}
