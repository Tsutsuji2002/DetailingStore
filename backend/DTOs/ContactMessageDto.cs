using System.ComponentModel.DataAnnotations;

namespace DetailingStore.Api.DTOs
{
    public class ContactMessageDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Phone { get; set; } = string.Empty;

        [MaxLength(255)]
        [EmailAddress]
        public string? Email { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Message { get; set; } = string.Empty;
    }
}
