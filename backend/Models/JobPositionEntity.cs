using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DetailingStore.Api.Models
{
    [Table("job_recruitment")]
    public class JobPositionEntity
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = "fulltime"; // fulltime, parttime, apprentice

        [MaxLength(100)]
        public string? Salary { get; set; }

        [MaxLength(200)]
        public string? Location { get; set; } = "TP. Hồ Chí Minh";

        [MaxLength(100)]
        public string? Department { get; set; } = "Kỹ Thuật & Detailing";

        public string? Description { get; set; }

        public List<string> Requirements { get; set; } = new List<string>();

        public List<string> Benefits { get; set; } = new List<string>();

        public bool IsActive { get; set; } = true;

        [MaxLength(50)]
        public string? Deadline { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
