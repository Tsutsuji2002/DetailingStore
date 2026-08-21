using System.ComponentModel.DataAnnotations;
using DetailingStore.Api.Models;

namespace DetailingStore.Api.DTOs
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "Họ & Tên Đệm là bắt buộc")]
        [MaxLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Tên là bắt buộc")]
        [MaxLength(50)]
        public string LastName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
        [MinLength(8, ErrorMessage = "Mật khẩu phải có ít nhất 8 ký tự")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':""\\|,.<>\/?]).{8,}$", ErrorMessage = "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt.")]
        public string Password { get; set; } = string.Empty;

        public string? Phone { get; set; }
    }

    public class LoginDto
    {
        [Required(ErrorMessage = "Email là bắt buộc")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
        public string Password { get; set; } = string.Empty;
    }

    public class GoogleAuthDto
    {
        [Required(ErrorMessage = "Google Credential Token là bắt buộc")]
        public string Credential { get; set; } = string.Empty;

        public bool ConfirmLinking { get; set; } = false;
        public string? Password { get; set; }
    }

    public class AuthResponseDto
    {
        public string? Token { get; set; }
        public UserDto? User { get; set; }
        public bool RequiresLinking { get; set; } = false;
        public string? Email { get; set; }
        public string? Message { get; set; }
    }

    public class SendOtpDto
    {
        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; } = string.Empty;
    }

    public class ChangePasswordOtpDto
    {
        [Required(ErrorMessage = "Mã OTP là bắt buộc")]
        public string OtpCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu mới là bắt buộc")]
        [MinLength(8, ErrorMessage = "Mật khẩu phải có ít nhất 8 ký tự")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':""\\|,.<>\/?]).{8,}$", ErrorMessage = "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt.")]
        public string NewPassword { get; set; } = string.Empty;
    }

    public class SetCredentialsDto
    {
        [Required(ErrorMessage = "Tên đăng nhập là bắt buộc")]
        [MinLength(3, ErrorMessage = "Tên đăng nhập phải có ít nhất 3 ký tự")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
        [MinLength(8, ErrorMessage = "Mật khẩu phải có ít nhất 8 ký tự")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':""\\|,.<>\/?]).{8,}$", ErrorMessage = "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt.")]
        public string Password { get; set; } = string.Empty;
    }

    public class UserDto
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string AuthProvider { get; set; } = "local";
        public bool HasPassword { get; set; } = false;
        public DateTime CreatedAt { get; set; }

        public static UserDto FromEntity(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                FullName = user.FullName,
                Role = user.Role.ToString().ToLower(),
                AvatarUrl = user.AvatarUrl,
                Phone = user.Phone,
                Address = user.Address,
                AuthProvider = user.AuthProvider,
                HasPassword = !string.IsNullOrEmpty(user.PasswordHash),
                CreatedAt = user.CreatedAt
            };
        }
    }
}
