using DetailingStore.Api.Data;
using DetailingStore.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace DetailingStore.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<PostsController> _logger;

        public PostsController(AppDbContext context, ILogger<PostsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        private static string ConvertToVietnameseSlug(string input)
        {
            if (string.IsNullOrWhiteSpace(input)) return string.Empty;
            var str = input.ToLower();
            str = Regex.Replace(str, @"[àáạảãâầấậẩẫăằắặẳẵ]", "a");
            str = Regex.Replace(str, @"[èéẹẻẽêềếệểễ]", "e");
            str = Regex.Replace(str, @"[ìíịỉĩ]", "i");
            str = Regex.Replace(str, @"[òóọỏõôồốộổỗơờớợởỡ]", "o");
            str = Regex.Replace(str, @"[ùúụủũưừứựửữ]", "u");
            str = Regex.Replace(str, @"[ỳýỵỷỹ]", "y");
            str = str.Replace("đ", "d");
            str = Regex.Replace(str, @"[^a-z0-9\s-]", "");
            str = Regex.Replace(str, @"\s+", "-");
            return Regex.Replace(str, @"-+", "-").Trim('-');
        }

        // GET: api/posts
        [HttpGet]
        public async Task<IActionResult> GetPosts([FromQuery] string? search, [FromQuery] string? tag)
        {
            // Get current user/client identity
            Guid? currentUserId = null;
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (Guid.TryParse(userIdClaim, out var parsedGuid))
            {
                currentUserId = parsedGuid;
            }

            var currentClientId = Request.Headers["X-Client-Id"].FirstOrDefault()
                               ?? HttpContext.Connection.RemoteIpAddress?.ToString()
                               ?? "anonymous";

            var query = _context.Posts
                .Include(p => p.PostLikes)
                .Include(p => p.Author)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.ToLower().Trim();
                query = query.Where(p => p.Title.ToLower().Contains(s) || p.Excerpt.ToLower().Contains(s) || p.Content.ToLower().Contains(s));
            }

            var posts = await query.OrderByDescending(p => p.CreatedAt).ToListAsync();

            var result = posts.Select(p => new
            {
                p.Id,
                p.Title,
                p.Slug,
                p.Excerpt,
                p.Content,
                p.CoverImage,
                p.MediaType,
                p.Tags,
                Likes = p.PostLikes.Count,
                p.CommentCount,
                p.IsPublished,
                p.AuthorId,
                AuthorName = p.Author != null
                    ? $"{(string.IsNullOrWhiteSpace(p.Author.FullName) ? p.Author.Username : p.Author.FullName)} ({p.Author.Role})"
                    : "MotoShine Admin (Admin)",
                AuthorAvatar = p.Author?.AvatarUrl,
                p.CreatedAt,
                LikedUserIds = p.PostLikes.Select(l => l.UserId.HasValue ? l.UserId.Value.ToString() : l.ClientId).ToList(),
                IsLikedByCurrentUser = currentUserId.HasValue
                    ? p.PostLikes.Any(l => l.UserId == currentUserId.Value)
                    : p.PostLikes.Any(l => !string.IsNullOrEmpty(l.ClientId) && l.ClientId == currentClientId)
            });

            return Ok(new { success = true, data = result });
        }

        // GET: api/posts/{idOrSlug}
        [HttpGet("{idOrSlug}")]
        public async Task<IActionResult> GetPostByIdOrSlug(string idOrSlug)
        {
            // Get current user/client identity
            Guid? currentUserId = null;
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (Guid.TryParse(userIdClaim, out var parsedGuid))
            {
                currentUserId = parsedGuid;
            }

            var currentClientId = Request.Headers["X-Client-Id"].FirstOrDefault()
                               ?? HttpContext.Connection.RemoteIpAddress?.ToString()
                               ?? "anonymous";

            PostEntity? post = null;

            if (Guid.TryParse(idOrSlug, out var id))
            {
                post = await _context.Posts
                    .Include(p => p.PostLikes)
                    .Include(p => p.Author)
                    .FirstOrDefaultAsync(p => p.Id == id);
            }
            else
            {
                var cleanSearchSlug = ConvertToVietnameseSlug(idOrSlug);
                var allPosts = await _context.Posts
                    .Include(p => p.PostLikes)
                    .Include(p => p.Author)
                    .ToListAsync();
                post = allPosts.FirstOrDefault(p =>
                    p.Slug.Equals(idOrSlug, StringComparison.OrdinalIgnoreCase) ||
                    ConvertToVietnameseSlug(p.Slug).Equals(cleanSearchSlug, StringComparison.OrdinalIgnoreCase)
                );
            }

            if (post == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy bài viết." });
            }

            var dto = new
            {
                post.Id,
                post.Title,
                post.Slug,
                post.Excerpt,
                post.Content,
                post.CoverImage,
                post.MediaType,
                post.Tags,
                Likes = post.PostLikes.Count,
                post.CommentCount,
                post.IsPublished,
                post.AuthorId,
                AuthorName = post.Author != null
                    ? $"{(string.IsNullOrWhiteSpace(post.Author.FullName) ? post.Author.Username : post.Author.FullName)} ({post.Author.Role})"
                    : "MotoShine Admin (Admin)",
                AuthorAvatar = post.Author?.AvatarUrl,
                post.CreatedAt,
                LikedUserIds = post.PostLikes.Select(l => l.UserId.HasValue ? l.UserId.Value.ToString() : l.ClientId).ToList(),
                IsLikedByCurrentUser = currentUserId.HasValue
                    ? post.PostLikes.Any(l => l.UserId == currentUserId.Value)
                    : post.PostLikes.Any(l => !string.IsNullOrEmpty(l.ClientId) && l.ClientId == currentClientId)
            };

            return Ok(new { success = true, data = dto });
        }

        // POST: api/posts
        [HttpPost]
        public async Task<IActionResult> CreatePost([FromBody] CreatePostDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Title))
            {
                return BadRequest(new { success = false, message = "Tiêu đề bài viết không được để trống." });
            }

            var cleanSlug = ConvertToVietnameseSlug(dto.Title);
            if (string.IsNullOrWhiteSpace(cleanSlug)) cleanSlug = "bai-viet";

            var baseSlug = cleanSlug;
            var counter = 1;
            while (await _context.Posts.AnyAsync(p => p.Slug == cleanSlug))
            {
                cleanSlug = $"{baseSlug}-{counter++}";
            }

            // Determine author ID (Guid)
            Guid? authorIdGuid = null;
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                        ?? User.FindFirst("sub")?.Value;

            if (Guid.TryParse(userIdClaim, out var parsedAuthorGuid))
            {
                var authorUser = await _context.Users.FindAsync(parsedAuthorGuid);
                if (authorUser != null)
                {
                    authorIdGuid = authorUser.Id;
                }
            }
            else
            {
                // Fallback to first Admin user in database if available
                var firstAdmin = await _context.Users.FirstOrDefaultAsync(u => u.Role == UserRole.Admin);
                if (firstAdmin != null)
                {
                    authorIdGuid = firstAdmin.Id;
                }
            }

            var post = new PostEntity
            {
                Id = Guid.NewGuid(),
                Title = dto.Title.Trim(),
                Slug = string.IsNullOrWhiteSpace(dto.Slug) ? cleanSlug : ConvertToVietnameseSlug(dto.Slug),
                Excerpt = dto.Excerpt?.Trim() ?? string.Empty,
                Content = dto.Content?.Trim() ?? string.Empty,
                CoverImage = string.IsNullOrWhiteSpace(dto.CoverImage) ? "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800" : dto.CoverImage.Trim(),
                MediaType = string.IsNullOrWhiteSpace(dto.MediaType) ? "image" : dto.MediaType.Trim(),
                Tags = dto.Tags ?? new List<string>(),
                CommentCount = 0,
                IsPublished = dto.IsPublished,
                AuthorId = authorIdGuid,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Posts.AddAsync(post);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, data = post, message = "Đăng bài viết thành công!" });
        }

        // PUT: api/posts/{id}
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdatePost(Guid id, [FromBody] CreatePostDto dto)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy bài viết để cập nhật." });
            }

            if (!string.IsNullOrWhiteSpace(dto.Title)) post.Title = dto.Title.Trim();
            if (!string.IsNullOrWhiteSpace(dto.Slug)) post.Slug = ConvertToVietnameseSlug(dto.Slug);
            post.Excerpt = dto.Excerpt?.Trim() ?? post.Excerpt;
            post.Content = dto.Content?.Trim() ?? post.Content;
            post.CoverImage = string.IsNullOrWhiteSpace(dto.CoverImage) ? post.CoverImage : dto.CoverImage.Trim();
            post.MediaType = string.IsNullOrWhiteSpace(dto.MediaType) ? post.MediaType : dto.MediaType.Trim();
            post.Tags = dto.Tags ?? post.Tags;
            post.IsPublished = dto.IsPublished;

            await _context.SaveChangesAsync();

            return Ok(new { success = true, data = post, message = "Cập nhật bài viết thành công!" });
        }

        // DELETE: api/posts/{id}
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeletePost(Guid id)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy bài viết." });
            }

            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Đã xóa bài viết thành công!" });
        }

        // POST: api/posts/{id}/like
        [HttpPost("{id:guid}/like")]
        public async Task<IActionResult> ToggleLike(Guid id)
        {
            var post = await _context.Posts.Include(p => p.PostLikes).FirstOrDefaultAsync(p => p.Id == id);
            if (post == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy bài viết." });
            }

            Guid? userIdGuid = null;
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (Guid.TryParse(userIdClaim, out var parsedGuid))
            {
                userIdGuid = parsedGuid;
            }

            var clientId = Request.Headers["X-Client-Id"].FirstOrDefault()
                        ?? HttpContext.Connection.RemoteIpAddress?.ToString()
                        ?? "anonymous";

            // Check if existing like by User ID or Client ID
            PostLikeEntity? existingLike = null;
            if (userIdGuid.HasValue)
            {
                existingLike = post.PostLikes.FirstOrDefault(l => l.UserId == userIdGuid.Value);
            }
            else if (!string.IsNullOrEmpty(clientId))
            {
                existingLike = post.PostLikes.FirstOrDefault(l => l.ClientId == clientId);
            }

            bool isLiked;
            if (existingLike != null)
            {
                _context.PostLikes.Remove(existingLike);
                isLiked = false;
            }
            else
            {
                var newLike = new PostLikeEntity
                {
                    Id = Guid.NewGuid(),
                    PostId = id,
                    UserId = userIdGuid,
                    ClientId = clientId,
                    CreatedAt = DateTime.UtcNow
                };
                await _context.PostLikes.AddAsync(newLike);
                isLiked = true;
            }

            await _context.SaveChangesAsync();

            // Refresh likedUserIds list and total likes count dynamically from post_likes
            var updatedLikes = await _context.PostLikes.Where(l => l.PostId == id).ToListAsync();
            var likedUserIds = updatedLikes.Select(l => l.UserId.HasValue ? l.UserId.Value.ToString() : l.ClientId).ToList();

            return Ok(new { success = true, likes = updatedLikes.Count, isLiked, likedUserIds });
        }
    }

    public class CreatePostDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Slug { get; set; }
        public string? Excerpt { get; set; }
        public string? Content { get; set; }
        public string? CoverImage { get; set; }
        public string? MediaType { get; set; }
        public List<string>? Tags { get; set; }
        public bool IsPublished { get; set; } = true;
    }
}
