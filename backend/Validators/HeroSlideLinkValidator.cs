using DetailingStore.Api.Models;

namespace DetailingStore.Api.Validators
{
    /// <summary>
    /// Validation helper class for hero slide link configuration.
    /// Validates linkType, linkedContentId, and linkedContentSlug combinations.
    /// </summary>
    public class HeroSlideLinkValidator
    {
        /// <summary>
        /// Validates the complete link configuration for a hero slide.
        /// Ensures that linkType, linkedContentId, and linkedContentSlug form a valid combination
        /// according to business rules defined in requirements 2.1-2.5.
        /// </summary>
        /// <param name="linkTypeStr">The link type as a string (case-insensitive). Defaults to "none" if null/empty.</param>
        /// <param name="linkedContentId">The ID of the linked content item (nullable).</param>
        /// <param name="linkedContentSlug">The slug of the linked content (nullable).</param>
        /// <returns>A tuple containing validation result and error message (null if valid).</returns>
        public static (bool IsValid, string? ErrorMessage) ValidateLinkConfiguration(
            string? linkTypeStr,
            Guid? linkedContentId,
            string? linkedContentSlug)
        {
            // Parse LinkType from string (case-insensitive)
            if (string.IsNullOrWhiteSpace(linkTypeStr))
            {
                linkTypeStr = "none";
            }

            if (!Enum.TryParse<LinkType>(linkTypeStr, ignoreCase: true, out var linkType))
            {
                return (false, $"Invalid LinkType value: {linkTypeStr}. Must be one of: None, Service, Product, Post");
            }

            // Requirement 2.1: If LinkType is None, LinkedContentId and Slug must be null
            if (linkType == LinkType.None)
            {
                // Requirement 2.4: If LinkedContentId is provided but LinkType is None, return error
                if (linkedContentId.HasValue)
                {
                    return (false, "LinkType must be specified when LinkedContentId is provided");
                }
                // Slug can be ignored if ID is null - this is valid
                return (true, null);
            }

            // Requirement 2.2: If LinkType is not None, LinkedContentId must be provided
            if (!linkedContentId.HasValue)
            {
                return (false, "LinkedContentId is required when LinkType is not None");
            }

            // Requirement 2.3: If LinkType is not None, LinkedContentSlug must be provided
            if (string.IsNullOrWhiteSpace(linkedContentSlug))
            {
                return (false, "LinkedContentSlug is required when LinkType is not None");
            }

            // Requirement 10.1-10.4: Validate slug format
            var slugValidation = ValidateSlugFormat(linkedContentSlug);
            if (!slugValidation.IsValid)
            {
                return slugValidation;
            }

            return (true, null);
        }

        /// <summary>
        /// Validates the format of a content slug.
        /// Ensures the slug contains only lowercase letters, numbers, and hyphens,
        /// does not start or end with a hyphen, and does not exceed 150 characters.
        /// Validates requirements 10.1-10.4.
        /// </summary>
        /// <param name="slug">The slug string to validate.</param>
        /// <returns>A tuple containing validation result and error message (null if valid).</returns>
        public static (bool IsValid, string? ErrorMessage) ValidateSlugFormat(string? slug)
        {
            if (string.IsNullOrWhiteSpace(slug))
            {
                return (false, "Slug cannot be empty");
            }

            // Requirement 10.3: Slug must not exceed 150 characters
            if (slug.Length > 150)
            {
                return (false, "Slug must not exceed 150 characters");
            }

            // Requirement 10.1 & 10.2: Validate pattern - lowercase letters, numbers, hyphens only
            // Pattern ^[a-z0-9]+(-[a-z0-9]+)*$ ensures:
            // - Starts with alphanumeric (not hyphen)
            // - Ends with alphanumeric (not hyphen)
            // - Contains only lowercase letters, numbers, and single hyphens between words
            if (!System.Text.RegularExpressions.Regex.IsMatch(slug, @"^[a-z0-9]+(-[a-z0-9]+)*$"))
            {
                // Requirement 10.4: Return error for invalid characters
                return (false, "Slug must contain only lowercase letters, numbers, and hyphens");
            }

            return (true, null);
        }
    }
}
