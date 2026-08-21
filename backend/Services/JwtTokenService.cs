using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DetailingStore.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace DetailingStore.Api.Services
{
    public class JwtTokenService : IJwtTokenService
    {
        private readonly IConfiguration _configuration;

        public JwtTokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"] ?? "SUPER_SECRET_DEFAULT_KEY_32_BYTES_LONG_JWT_KEY!";
            var issuer = jwtSettings["Issuer"] ?? "DetailingStoreApi";
            var audience = jwtSettings["Audience"] ?? "DetailingStoreApp";
            var expirationDays = int.TryParse(jwtSettings["ExpirationInDays"], out var days) ? days : 1;

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("first_name", user.FirstName),
                new Claim("last_name", user.LastName)
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(expirationDays),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
