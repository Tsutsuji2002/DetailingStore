using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DetailingStore.Api.Models
{
    public enum UserRole
    {
        Customer,
        Staff,
        Admin
    }

    [Table("users")]
    public class User
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(50)]
        [Column("username")]
        public string Username { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        [EmailAddress]
        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [MaxLength(255)]
        [Column("password_hash")]
        public string? PasswordHash { get; set; }

        [MaxLength(100)]
        [Column("google_id")]
        public string? GoogleId { get; set; }

        [MaxLength(20)]
        [Column("auth_provider")]
        public string AuthProvider { get; set; } = "local";

        [Column("email_confirmed")]
        public bool EmailConfirmed { get; set; } = false;

        [Required]
        [MaxLength(50)]
        [Column("first_name")]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        [Column("last_name")]
        public string LastName { get; set; } = string.Empty;

        [NotMapped]
        public string FullName => $"{LastName} {FirstName}".Trim();

        [Column("role")]
        public UserRole Role { get; set; } = UserRole.Customer;

        [Column("avatar_url")]
        public string? AvatarUrl { get; set; }

        [MaxLength(20)]
        [Column("phone")]
        public string? Phone { get; set; }

        [Column("address")]
        public string? Address { get; set; }

        [MaxLength(10)]
        [Column("otp_code")]
        public string? OtpCode { get; set; }

        [Column("otp_expiration")]
        public DateTime? OtpExpiration { get; set; }

        [Column("failed_login_attempts")]
        public int FailedLoginAttempts { get; set; } = 0;

        [Column("lockout_until")]
        public DateTime? LockoutUntil { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
