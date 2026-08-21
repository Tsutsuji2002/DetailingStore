namespace DetailingStore.Api.Services
{
    public class GoogleUserInfo
    {
        public string GoogleId { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Picture { get; set; }
        public bool EmailVerified { get; set; }
    }

    public interface IGoogleAuthService
    {
        Task<GoogleUserInfo?> ValidateGoogleTokenAsync(string credentialToken);
    }
}
