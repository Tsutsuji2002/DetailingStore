namespace DetailingStore.Api.DTOs
{
    public class MechanicDocDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string VehicleModel { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string? ErrorCode { get; set; }
        public string Symptoms { get; set; } = string.Empty;
        public string ContentHtml { get; set; } = string.Empty;
        public List<string> SolutionSteps { get; set; } = new();
        public List<string> Diagrams { get; set; } = new();
        public string? VideoUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateMechanicDocDto
    {
        public string Title { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string VehicleModel { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string? ErrorCode { get; set; }
        public string Symptoms { get; set; } = string.Empty;
        public string ContentHtml { get; set; } = string.Empty;
        public List<string> SolutionSteps { get; set; } = new();
        public List<string> Diagrams { get; set; } = new();
        public string? VideoUrl { get; set; }
    }

    public class UpdateMechanicDocDto
    {
        public string Title { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string VehicleModel { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string? ErrorCode { get; set; }
        public string Symptoms { get; set; } = string.Empty;
        public string ContentHtml { get; set; } = string.Empty;
        public List<string> SolutionSteps { get; set; } = new();
        public List<string> Diagrams { get; set; } = new();
        public string? VideoUrl { get; set; }
    }
}
