using System.Text.Json;
using DetailingStore.Api.Data;
using DetailingStore.Api.DTOs;
using DetailingStore.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DetailingStore.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MechanicDocsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MechanicDocsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/mechanicdocs
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MechanicDocDto>>> GetDocs([FromQuery] string? search, [FromQuery] string? brand, [FromQuery] string? category)
        {
            var query = _context.MechanicDocs.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim().ToLower();
                query = query.Where(d => d.Title.ToLower().Contains(s)
                                      || d.Brand.ToLower().Contains(s)
                                      || d.VehicleModel.ToLower().Contains(s)
                                      || (d.ErrorCode != null && d.ErrorCode.ToLower().Contains(s))
                                      || d.Symptoms.ToLower().Contains(s));
            }

            if (!string.IsNullOrWhiteSpace(brand) && brand != "all")
            {
                query = query.Where(d => d.Brand.ToLower() == brand.Trim().ToLower());
            }

            if (!string.IsNullOrWhiteSpace(category) && category != "all")
            {
                query = query.Where(d => d.Category.ToLower() == category.Trim().ToLower());
            }

            var docs = await query.OrderByDescending(d => d.UpdatedAt).ToListAsync();

            var dtos = docs.Select(d => MapToDto(d)).ToList();
            return Ok(dtos);
        }

        // GET: api/mechanicdocs/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<MechanicDocDto>> GetDocById(Guid id)
        {
            var doc = await _context.MechanicDocs.FindAsync(id);
            if (doc == null)
            {
                return NotFound(new { message = "Không tìm thấy tài liệu kỹ thuật." });
            }

            return Ok(MapToDto(doc));
        }

        // POST: api/mechanicdocs
        [HttpPost]
        public async Task<ActionResult<MechanicDocDto>> CreateDoc([FromBody] CreateMechanicDocDto dto)
        {
            if (!ModelState.IsValid || string.IsNullOrWhiteSpace(dto.Title))
            {
                return BadRequest(new { message = "Tiêu đề tài liệu không được để trống." });
            }

            var doc = new MechanicDoc
            {
                Id = Guid.NewGuid(),
                Title = dto.Title.Trim(),
                Brand = dto.Brand?.Trim() ?? "Chung",
                VehicleModel = dto.VehicleModel?.Trim() ?? "Tất cả dòng xe",
                Category = dto.Category?.Trim() ?? "Hệ Thống Kỹ Thuật",
                ErrorCode = dto.ErrorCode?.Trim(),
                Symptoms = dto.Symptoms?.Trim() ?? string.Empty,
                ContentHtml = dto.ContentHtml ?? string.Empty,
                SolutionStepsJson = JsonSerializer.Serialize(dto.SolutionSteps ?? new List<string>()),
                Diagrams = dto.Diagrams ?? new List<string>(),
                VideoUrl = dto.VideoUrl?.Trim(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.MechanicDocs.Add(doc);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDocById), new { id = doc.Id }, MapToDto(doc));
        }

        // PUT: api/mechanicdocs/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<MechanicDocDto>> UpdateDoc(Guid id, [FromBody] UpdateMechanicDocDto dto)
        {
            var doc = await _context.MechanicDocs.FindAsync(id);
            if (doc == null)
            {
                return NotFound(new { message = "Không tìm thấy tài liệu kỹ thuật." });
            }

            doc.Title = dto.Title?.Trim() ?? doc.Title;
            doc.Brand = dto.Brand?.Trim() ?? doc.Brand;
            doc.VehicleModel = dto.VehicleModel?.Trim() ?? doc.VehicleModel;
            doc.Category = dto.Category?.Trim() ?? doc.Category;
            doc.ErrorCode = dto.ErrorCode?.Trim();
            doc.Symptoms = dto.Symptoms?.Trim() ?? string.Empty;
            doc.ContentHtml = dto.ContentHtml ?? string.Empty;
            doc.SolutionStepsJson = JsonSerializer.Serialize(dto.SolutionSteps ?? new List<string>());
            doc.Diagrams = dto.Diagrams ?? new List<string>();
            doc.VideoUrl = dto.VideoUrl?.Trim();
            doc.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(MapToDto(doc));
        }

        // DELETE: api/mechanicdocs/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDoc(Guid id)
        {
            var doc = await _context.MechanicDocs.FindAsync(id);
            if (doc == null)
            {
                return NotFound(new { message = "Không tìm thấy tài liệu kỹ thuật." });
            }

            _context.MechanicDocs.Remove(doc);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa tài liệu thành công." });
        }

        private static MechanicDocDto MapToDto(MechanicDoc doc)
        {
            List<string> steps;
            try
            {
                steps = JsonSerializer.Deserialize<List<string>>(doc.SolutionStepsJson) ?? new List<string>();
            }
            catch
            {
                steps = new List<string>();
            }

            return new MechanicDocDto
            {
                Id = doc.Id,
                Title = doc.Title,
                Brand = doc.Brand,
                VehicleModel = doc.VehicleModel,
                Category = doc.Category,
                ErrorCode = doc.ErrorCode,
                Symptoms = doc.Symptoms,
                ContentHtml = doc.ContentHtml,
                SolutionSteps = steps,
                Diagrams = doc.Diagrams ?? new List<string>(),
                VideoUrl = doc.VideoUrl,
                CreatedAt = doc.CreatedAt,
                UpdatedAt = doc.UpdatedAt
            };
        }
    }
}
