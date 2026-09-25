namespace DetailingStore.Api.Services;

using DetailingStore.Api.Models;

/// <summary>
/// Service interface for managing Momo Payment Gateway configuration
/// </summary>
public interface IMomoConfigurationService
{
    /// <summary>
    /// Gets the current Momo configuration settings
    /// </summary>
    /// <returns>MomoSettings object containing all configuration values</returns>
    MomoSettings GetSettings();

    /// <summary>
    /// Validates that all required configuration fields are present and non-empty
    /// </summary>
    /// <returns>True if configuration is valid, false otherwise</returns>
    bool ValidateConfiguration();
}
