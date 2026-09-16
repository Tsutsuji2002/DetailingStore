using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DetailingStore.Api.Data;
using DetailingStore.Api.Models;

namespace DetailingStore.Api.Controllers
{
    [ApiController]
    [Route("api/jobs")]
    public class JobsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public JobsController(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/jobs — Public: list all active (or all for admin)
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] bool? all)
        {
            var query = _context.JobPositions.AsQueryable();
            if (all != true)
                query = query.Where(j => j.IsActive);
            var jobs = await query.OrderByDescending(j => j.CreatedAt).ToListAsync();
            return Ok(jobs);
        }

        // GET /api/jobs/{id} — Public
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var job = await _context.JobPositions.FindAsync(id);
            if (job == null) return NotFound();
            return Ok(job);
        }

        // POST /api/jobs — Admin only
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] UpsertJobDto dto)
        {
            var job = new JobPositionEntity
            {
                Title = dto.Title,
                Type = dto.Type ?? "fulltime",
                Salary = dto.Salary,
                Location = dto.Location,
                Department = dto.Department,
                Description = dto.Description,
                Requirements = dto.Requirements ?? new List<string>(),
                Benefits = dto.Benefits ?? new List<string>(),
                IsActive = dto.IsActive ?? true,
                Deadline = dto.Deadline,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };
            _context.JobPositions.Add(job);
            await _context.SaveChangesAsync();
            return Ok(job);
        }

        // PUT /api/jobs/{id} — Admin only
        [Authorize(Roles = "Admin")]
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpsertJobDto dto)
        {
            var job = await _context.JobPositions.FindAsync(id);
            if (job == null) return NotFound();

            job.Title = dto.Title ?? job.Title;
            job.Type = dto.Type ?? job.Type;
            job.Salary = dto.Salary ?? job.Salary;
            job.Location = dto.Location ?? job.Location;
            job.Department = dto.Department ?? job.Department;
            job.Description = dto.Description ?? job.Description;
            job.Requirements = dto.Requirements ?? job.Requirements;
            job.Benefits = dto.Benefits ?? job.Benefits;
            job.IsActive = dto.IsActive ?? job.IsActive;
            job.Deadline = dto.Deadline ?? job.Deadline;
            job.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(job);
        }

        // DELETE /api/jobs/{id} — Admin only
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var job = await _context.JobPositions.FindAsync(id);
            if (job == null) return NotFound();
            _context.JobPositions.Remove(job);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xóa vị trí tuyển dụng." });
        }
    }

    public class UpsertJobDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Type { get; set; }
        public string? Salary { get; set; }
        public string? Location { get; set; }
        public string? Department { get; set; }
        public string? Description { get; set; }
        public List<string>? Requirements { get; set; }
        public List<string>? Benefits { get; set; }
        public bool? IsActive { get; set; }
        public string? Deadline { get; set; }
    }
}
