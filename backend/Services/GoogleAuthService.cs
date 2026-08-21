using Google.Apis.Auth;

namespace DetailingStore.Api.Services
{
    public class GoogleAuthService : IGoogleAuthService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<GoogleAuthService> _logger;

        public GoogleAuthService(IConfiguration configuration, ILogger<GoogleAuthService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<GoogleUserInfo?> ValidateGoogleTokenAsync(string credentialToken)
        {
            try
            {
                var clientId = _configuration["GoogleAuthSettings:ClientId"];
                
                var validationSettings = new GoogleJsonWebSignature.ValidationSettings();
                if (!string.IsNullOrEmpty(clientId) && clientId != "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com")
                {
                    validationSettings.Audience = new[] { clientId };
                }

                var payload = await GoogleJsonWebSignature.ValidateAsync(credentialToken, validationSettings);
                
                if (payload != null)
                {
                    return new GoogleUserInfo
                    {
                        GoogleId = payload.Subject,
                        Email = payload.Email,
                        FirstName = payload.GivenName ?? payload.Name ?? "Google",
                        LastName = payload.FamilyName ?? "User",
                        Picture = payload.Picture,
                        EmailVerified = payload.EmailVerified
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to validate Google ID Token via Google API");
            }

            return null;
        }
    }
}
