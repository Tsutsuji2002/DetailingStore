using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DetailingStore.Api.Models
{
    [Table("work_shift_configs")]
    public class WorkShiftConfigEntity
    {
        [Key]
        [MaxLength(100)]
        public string Id { get; set; } = string.Empty; // e.g. "morning", "afternoon", "full", "custom_1"

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty; // e.g. "Ca Sáng"

        [Required]
        [MaxLength(20)]
        public string StartTime { get; set; } = "07:30";

        [Required]
        [MaxLength(20)]
        public string EndTime { get; set; } = "12:00";

        [MaxLength(20)]
        public string? Icon { get; set; } = "🌅";

        [MaxLength(30)]
        public string? Color { get; set; } = "#3b82f6";

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
