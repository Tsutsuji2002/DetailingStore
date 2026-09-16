using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DetailingStore.Api.Models
{
    [Table("work_shifts")]
    public class WorkShiftEntity
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(100)]
        public string StaffId { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string ShiftTypeId { get; set; } = "morning"; // FK to WorkShiftConfigEntity.Id

        [Required]
        [MaxLength(20)]
        public string Date { get; set; } = string.Empty; // YYYY-MM-DD

        [MaxLength(500)]
        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
