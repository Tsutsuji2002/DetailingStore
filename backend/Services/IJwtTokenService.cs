using DetailingStore.Api.Models;

namespace DetailingStore.Api.Services
{
    public interface IJwtTokenService
    {
        string GenerateToken(User user);
    }
}
