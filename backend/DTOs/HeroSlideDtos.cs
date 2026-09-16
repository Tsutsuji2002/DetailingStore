using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace DetailingStore.Api.DTOs
{
    /// <summary>
    /// Request DTO for creating a hero slide/banner.
    /// All link configuration fields (LinkType, LinkedContentId, LinkedContentSlug) are optional.
    /// If not provided, the banner will be created with LinkType=None (non-clickable).
    /// </summary>
    public class CreateHeroSlideDto
    {
        /// <summary>
        /// Category tag displayed on the banner (e.g., "✨ Dịch vụ nổi bật").
        /// </summary>
        public string? Tag { get; set; }

        /// <summary>
        /// Main title of the banner.
        /// </summary>
        public string? Title { get; set; }

        /// <summary>
        /// Descriptive text for the banner.
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// URL to the banner image.
        /// </summary>
        public string? ImageUrl { get; set; }

        /// <summary>
        /// Display order for the banner (lower numbers appear first).
        /// </summary>
        public int? SortOrder { get; set; }

        /// <summary>
        /// Type of content the banner links to: "none", "service", "product", or "post".
        /// If not provided, defaults to "none" (non-clickable banner).
        /// </summary>
        public string? LinkType { get; set; }

        /// <summary>
        /// ID of the linked content item (Service, Product, or Post).
        /// Required when LinkType is not "none".
        /// </summary>
        public Guid? LinkedContentId { get; set; }

        /// <summary>
        /// Slug of the linked content for URL construction.
        /// Required when LinkType is not "none".
        /// Must contain only lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen.
        /// Maximum length: 150 characters.
        /// </summary>
        public string? LinkedContentSlug { get; set; }
    }

    /// <summary>
    /// Request DTO for updating a hero slide/banner.
    /// All fields are optional. Only provided fields will be updated.
    /// </summary>
    public class UpdateHeroSlideDto
    {
        /// <summary>
        /// Category tag displayed on the banner.
        /// </summary>
        public string? Tag { get; set; }

        /// <summary>
        /// Main title of the banner.
        /// </summary>
        public string? Title { get; set; }

        /// <summary>
        /// Descriptive text for the banner.
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// URL to the banner image.
        /// </summary>
        public string? ImageUrl { get; set; }

        /// <summary>
        /// Display order for the banner.
        /// </summary>
        public int? SortOrder { get; set; }

        /// <summary>
        /// Type of content the banner links to: "none", "service", "product", or "post".
        /// </summary>
        public string? LinkType { get; set; }

        /// <summary>
        /// ID of the linked content item.
        /// </summary>
        public Guid? LinkedContentId { get; set; }

        /// <summary>
        /// Slug of the linked content for URL construction.
        /// </summary>
        public string? LinkedContentSlug { get; set; }
    }

    /// <summary>
    /// Response DTO for hero slides returned by GET endpoints.
    /// All fields are always included, including link configuration fields which may be null.
    /// </summary>
    public class HeroSlideResponseDto
    {
        /// <summary>
        /// Unique identifier of the banner.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Category tag displayed on the banner.
        /// </summary>
        public string Tag { get; set; } = string.Empty;

        /// <summary>
        /// Main title of the banner.
        /// </summary>
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Descriptive text for the banner.
        /// </summary>
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// URL to the banner image.
        /// </summary>
        public string ImageUrl { get; set; } = string.Empty;

        /// <summary>
        /// Display order for the banner.
        /// </summary>
        public int SortOrder { get; set; }

        /// <summary>
        /// Whether the banner is active and visible.
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// Type of content the banner links to: "none", "service", "product", or "post".
        /// Always returned in lowercase format.
        /// </summary>
        public string LinkType { get; set; } = "none";

        /// <summary>
        /// ID of the linked content item (Service, Product, or Post).
        /// Null if LinkType is "none".
        /// </summary>
        public Guid? LinkedContentId { get; set; }

        /// <summary>
        /// Slug of the linked content for frontend URL construction.
        /// Null if LinkType is "none".
        /// Frontend can construct URLs like: /services/{slug}, /products/{slug}, /posts/{slug}.
        /// </summary>
        public string? LinkedContentSlug { get; set; }
    }
}
