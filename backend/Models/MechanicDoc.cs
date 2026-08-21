using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DetailingStore.Api.Models
{
    [Table("mechanic_docs")]
    public class MechanicDoc
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(200)]
        [Column("title")]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        [Column("brand")]
        public string Brand { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        [Column("vehicle_model")]
        public string VehicleModel { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        [Column("category")]
        public string Category { get; set; } = string.Empty;

        [MaxLength(50)]
        [Column("error_code")]
        public string? ErrorCode { get; set; }

        [Column("symptoms")]
        public string Symptoms { get; set; } = string.Empty;

        [Column("solution_steps", TypeName = "jsonb")]
        public string SolutionStepsJson { get; set; } = "[]";

        [Column("diagrams")]
        public List<string> Diagrams { get; set; } = new();

        [Column("video_url")]
        public string? VideoUrl { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
