using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DetailingStore.Api.Data;
using DetailingStore.Api.DTOs;
using DetailingStore.Api.Models;

namespace DetailingStore.Api.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/users
        [HttpGet]
        public async Task<IActionResult> GetUsers([FromQuery] string? role)
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(role))
            {
                if (Enum.TryParse<UserRole>(role, true, out var roleEnum))
                {
                    query = query.Where(u => u.Role == roleEnum);
                }
            }

            var usersList = await query
                .OrderBy(u => u.Role)
                .ThenBy(u => u.LastName)
                .ToListAsync();

            var result = usersList.Select(u => UserDto.FromEntity(u)).ToList();

            return Ok(result);
        }

        // GET /api/users/staff (Gets all staff and admin users for scheduling)
        [HttpGet("staff")]
        public async Task<IActionResult> GetStaffUsers()
        {
            var staffList = await _context.Users
                .Where(u => u.Role == UserRole.Staff || u.Role == UserRole.Admin)
                .OrderBy(u => u.Role)
                .ThenBy(u => u.LastName)
                .ToListAsync();

            var result = staffList.Select(u => UserDto.FromEntity(u)).ToList();

            return Ok(result);
        }

        public class UpdateRoleDto
        {
            public string Role { get; set; } = string.Empty;
        }

        // PUT /api/users/{id}/role
        [HttpPut("{id}/role")]
        public async Task<IActionResult> UpdateRole(Guid id, [FromBody] UpdateRoleDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "Không tìm thấy người dùng." });
            }

            if (!Enum.TryParse<UserRole>(dto.Role, true, out var newRole))
            {
                return BadRequest(new { message = "Vai trò không hợp lệ. (Customer, Staff, Admin)" });
            }

            user.Role = newRole;
            await _context.SaveChangesAsync();

            return Ok(UserDto.FromEntity(user));
        }
    }
}
