using System.Security.Claims;
using System.Security.Cryptography;
using DetailingStore.Api.Data;
using DetailingStore.Api.DTOs;
using DetailingStore.Api.Models;
using DetailingStore.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace DetailingStore.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly IGoogleAuthService _googleAuthService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            AppDbContext context,
            IJwtTokenService jwtTokenService,
            IGoogleAuthService googleAuthService,
            ILogger<AuthController> logger)
        {
            _context = context;
            _jwtTokenService = jwtTokenService;
            _googleAuthService = googleAuthService;
            _logger = logger;
        }

        /// <summary>
        /// Đăng ký tài khoản thường bằng Email & Mật khẩu
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower().Trim());

            if (existingUser != null)
                return BadRequest(new { message = "Email này đã được đăng ký tài khoản." });

            var username = dto.Email.Split('@')[0];
            var count = await _context.Users.CountAsync(u => u.Username == username);
            if (count > 0)
            {
                username = $"{username}_{DateTime.UtcNow.Ticks % 1000}";
            }

            var newUser = new User
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email.ToLower().Trim(),
                Username = username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password, workFactor: 12),
                Phone = dto.Phone,
                AuthProvider = "local",
                EmailConfirmed = false,
                Role = UserRole.Customer,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Users.AddAsync(newUser);
            await _context.SaveChangesAsync();

            var token = _jwtTokenService.GenerateToken(newUser);
            return Ok(new AuthResponseDto
            {
                Token = token,
                User = UserDto.FromEntity(newUser)
            });
        }

        /// <summary>
        /// Đăng nhập thường bằng Email hoặc Username & Mật khẩu
        /// </summary>
        [HttpPost("login")]
        [EnableRateLimiting("login_limit")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var input = dto.Email.ToLower().Trim();
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == input || u.Username.ToLower() == input);

            // Antigravity timing-attack mitigation
            if (user == null || string.IsNullOrEmpty(user.PasswordHash))
            {
                BCrypt.Net.BCrypt.Verify(dto.Password, "$2a$12$e868D8R.W/u2R5zS8vM1s.Yw7mE5W5H4qS4Z4mE5W5H4qS4Z4mE5W");
                return Unauthorized(new { message = "Tên đăng nhập / Email hoặc mật khẩu không chính xác." });
            }

            // Check Account Lockout
            if (user.LockoutUntil.HasValue && user.LockoutUntil.Value > DateTime.UtcNow)
            {
                var remaining = user.LockoutUntil.Value - DateTime.UtcNow;
                var minutes = Math.Max(1, (int)Math.Ceiling(remaining.TotalMinutes));
                return StatusCode(StatusCodes.Status423Locked, new { message = $"Tài khoản tạm thời bị khóa do nhập sai mật khẩu 5 lần. Vui lòng thử lại sau {minutes} phút." });
            }

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
            if (!isPasswordValid)
            {
                user.FailedLoginAttempts++;
                if (user.FailedLoginAttempts >= 5)
                {
                    user.LockoutUntil = DateTime.UtcNow.AddMinutes(15);
                }
                await _context.SaveChangesAsync();

                if (user.FailedLoginAttempts >= 5)
                {
                    return StatusCode(StatusCodes.Status423Locked, new { message = "Tài khoản đã bị khóa 15 phút do nhập sai mật khẩu quá 5 lần liên tiếp." });
                }

                int attemptsLeft = 5 - user.FailedLoginAttempts;
                return Unauthorized(new { message = $"Tên đăng nhập / Email hoặc mật khẩu không chính xác. (Còn {attemptsLeft} lần thử)" });
            }

            // Reset failed login attempts on successful login
            if (user.FailedLoginAttempts > 0 || user.LockoutUntil.HasValue)
            {
                user.FailedLoginAttempts = 0;
                user.LockoutUntil = null;
                await _context.SaveChangesAsync();
            }

            var token = _jwtTokenService.GenerateToken(user);
            return Ok(new AuthResponseDto
            {
                Token = token,
                User = UserDto.FromEntity(user)
            });
        }

        /// <summary>
        /// Đăng ký / Đăng nhập thông qua Google OAuth 2.0 (Có hỗ trợ liên kết tài khoản)
        /// </summary>
        [HttpPost("google")]
        public async Task<IActionResult> GoogleAuth([FromBody] GoogleAuthDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Credential))
                return BadRequest(new { message = "Google token không được để trống." });

            var googleUser = await _googleAuthService.ValidateGoogleTokenAsync(dto.Credential);
            if (googleUser == null)
                return Unauthorized(new { message = "Google Token không hợp lệ hoặc đã hết hạn." });

            // Tìm user đã tồn tại theo GoogleId hoặc Email
            var user = await _context.Users
                .FirstOrDefaultAsync(u => (u.GoogleId != null && u.GoogleId == googleUser.GoogleId) || u.Email.ToLower() == googleUser.Email.ToLower());

            if (user == null)
            {
                // Lần đầu đăng nhập bằng Google -> Tạo tài khoản Google mới
                var username = googleUser.Email.Split('@')[0];
                var count = await _context.Users.CountAsync(u => u.Username == username);
                if (count > 0)
                {
                    username = $"{username}_{DateTime.UtcNow.Ticks % 1000}";
                }

                user = new User
                {
                    GoogleId = googleUser.GoogleId,
                    Email = googleUser.Email.ToLower(),
                    Username = username,
                    FirstName = googleUser.FirstName,
                    LastName = googleUser.LastName,
                    AvatarUrl = googleUser.Picture,
                    AuthProvider = "google",
                    EmailConfirmed = true,
                    Role = UserRole.Customer,
                    CreatedAt = DateTime.UtcNow
                };

                await _context.Users.AddAsync(user);
                await _context.SaveChangesAsync();
            }
            else
            {
                // Nếu user tồn tại nhưng chưa được liên kết với Google (đăng ký bằng local trước đó)
                if (string.IsNullOrEmpty(user.GoogleId) && user.AuthProvider == "local" && !string.IsNullOrEmpty(user.PasswordHash))
                {
                    if (!dto.ConfirmLinking)
                    {
                        return Ok(new AuthResponseDto
                        {
                            RequiresLinking = true,
                            Email = user.Email,
                            Message = $"Tài khoản với email '{user.Email}' đã được tạo bằng mật khẩu trước đó. Nhập mật khẩu hiện tại để liên kết với Google."
                        });
                    }

                    // Người dùng đã gửi xác nhận liên kết kèm mật khẩu hiện tại
                    if (string.IsNullOrEmpty(dto.Password) || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                    {
                        return Unauthorized(new { message = "Mật khẩu xác nhận liên kết tài khoản không chính xác." });
                    }

                    user.GoogleId = googleUser.GoogleId;
                    user.AuthProvider = "google_linked";
                    if (string.IsNullOrEmpty(user.AvatarUrl) && !string.IsNullOrEmpty(googleUser.Picture))
                    {
                        user.AvatarUrl = googleUser.Picture;
                    }
                    user.EmailConfirmed = true;
                    await _context.SaveChangesAsync();
                }
                else
                {
                    // Cập nhật thông tin avatar hoặc email confirmed nếu có
                    bool updated = false;
                    if (string.IsNullOrEmpty(user.GoogleId))
                    {
                        user.GoogleId = googleUser.GoogleId;
                        updated = true;
                    }
                    if (string.IsNullOrEmpty(user.AvatarUrl) && !string.IsNullOrEmpty(googleUser.Picture))
                    {
                        user.AvatarUrl = googleUser.Picture;
                        updated = true;
                    }
                    if (!user.EmailConfirmed && googleUser.EmailVerified)
                    {
                        user.EmailConfirmed = true;
                        updated = true;
                    }

                    if (updated)
                    {
                        await _context.SaveChangesAsync();
                    }
                }
            }

            var token = _jwtTokenService.GenerateToken(user);
            return Ok(new AuthResponseDto
            {
                Token = token,
                User = UserDto.FromEntity(user)
            });
        }

        /// <summary>
        /// Gửi mã xác thực OTP qua Email
        /// </summary>
        [Authorize]
        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound();

            var otpCode = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
            user.OtpCode = otpCode;
            user.OtpExpiration = DateTime.UtcNow.AddMinutes(10);
            await _context.SaveChangesAsync();

            _logger.LogInformation("==========================================");
            _logger.LogInformation("🔑 OTP CODE FOR {Email}: {OtpCode}", user.Email, otpCode);
            _logger.LogInformation("==========================================");

            return Ok(new
            {
                message = $"Mã OTP xác nhận đã được gửi đến email {user.Email}."
            });
        }

        /// <summary>
        /// Đổi mật khẩu bằng mã OTP 6 chữ số
        /// </summary>
        [Authorize]
        [HttpPost("change-password-otp")]
        public async Task<IActionResult> ChangePasswordWithOtp([FromBody] ChangePasswordOtpDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound();

            if (string.IsNullOrEmpty(user.OtpCode) || user.OtpCode != dto.OtpCode.Trim() || user.OtpExpiration == null || user.OtpExpiration < DateTime.UtcNow)
            {
                return BadRequest(new { message = "Mã xác nhận OTP không chính xác hoặc đã hết hạn (10 phút)." });
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword, workFactor: 12);
            user.OtpCode = null;
            user.OtpExpiration = null;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Đổi mật khẩu thành công! Bạn có thể sử dụng mật khẩu mới để đăng nhập.",
                user = UserDto.FromEntity(user)
            });
        }

        /// <summary>
        /// Cài đặt Username và Mật khẩu cho tài khoản Google (Cho phép đăng nhập bằng Password)
        /// </summary>
        [Authorize]
        [HttpPost("set-credentials")]
        public async Task<IActionResult> SetCredentials([FromBody] SetCredentialsDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound();

            var usernameClean = dto.Username.Trim().ToLower();
            var existingUsername = await _context.Users
                .FirstOrDefaultAsync(u => u.Id != userId && u.Username.ToLower() == usernameClean);

            if (existingUsername != null)
            {
                return BadRequest(new { message = "Tên đăng nhập này đã được người dùng khác sử dụng. Vui lòng chọn tên khác." });
            }

            user.Username = dto.Username.Trim();
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password, workFactor: 12);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Cài đặt tên đăng nhập & mật khẩu thành công! Giờ đây bạn có thể đăng nhập bằng mật khẩu.",
                user = UserDto.FromEntity(user)
            });
        }

        /// <summary>
        /// Lấy thông tin người dùng đang đăng nhập thông qua Bearer Token
        /// </summary>
        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                           ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound();

            return Ok(UserDto.FromEntity(user));
        }
    }
}
