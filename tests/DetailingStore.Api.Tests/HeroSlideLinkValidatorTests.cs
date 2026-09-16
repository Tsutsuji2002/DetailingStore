using DetailingStore.Api.Validators;
using Xunit;

namespace DetailingStore.Api.Tests
{
    /// <summary>
    /// Unit tests for HeroSlideLinkValidator class.
    /// Tests validation logic for link configuration and slug format.
    /// </summary>
    public class HeroSlideLinkValidatorTests
    {
        #region ValidateLinkConfiguration Tests

        [Fact]
        public void ValidateLinkConfiguration_LinkTypeNoneWithNullIdAndSlug_ReturnsValid()
        {
            // Arrange
            string linkType = "none";
            Guid? linkedContentId = null;
            string? linkedContentSlug = null;

            // Act
            var (isValid, errorMessage) = HeroSlideLinkValidator.ValidateLinkConfiguration(linkType, linkedContentId, linkedContentSlug);

            // Assert
            Assert.True(isValid);
            Assert.Null(errorMessage);
        }

        [Fact]
        public void ValidateLinkConfiguration_LinkTypeNullDefaultsToNone_ReturnsValid()
        {
            // Arrange
            string? linkType = null;
            Guid? linkedContentId = null;
            string? linkedContentSlug = null;

            // Act
            var (isValid, errorMessage) = HeroSlideLinkValidator.ValidateLinkConfiguration(linkType, linkedContentId, linkedContentSlug);

            // Assert
            Assert.True(isValid);
            Assert.Null(errorMessage);
        }

        [Fact]
        public void ValidateLinkConfiguration_LinkTypeNoneWithProvidedId_ReturnsInvalid()
        {
            // Arrange
            string linkType = "none";
            Guid? linkedContentId = Guid.NewGuid();
            string? linkedContentSlug = null;

            // Act
            var (isValid, errorMessage) = HeroSlideLinkValidator.ValidateLinkConfiguration(linkType, linkedContentId, linkedContentSlug);

            // Assert
            Assert.False(isValid);
            Assert.Equal("LinkType must be specified when LinkedContentId is provided", errorMessage);
        }

        [Fact]
        public void ValidateLinkConfiguration_ServiceWithValidIdAndSlug_ReturnsValid()
        {
            // Arrange
            string linkType = "service";
            Guid? linkedContentId = Guid.NewGuid();
            string? linkedContentSlug = "ceramic-coating-service";

            // Act
            var (isValid, errorMessage) = HeroSlideLinkValidator.ValidateLinkConfiguration(linkType, linkedContentId, linkedContentSlug);

            // Assert
            Assert.True(isValid);
            Assert.Null(errorMessage);
        }

        [Fact]
        public void ValidateLinkConfiguration_ProductWithValidIdAndSlug_ReturnsValid()
        {
            // Arrange
            string linkType = "product";
            Guid? linkedContentId = Guid.NewGuid();
            string? linkedContentSlug = "premium-wax-product";

            // Act
            var (isValid, errorMessage) = HeroSlideLinkValidator.ValidateLinkConfiguration(linkType, linkedContentId, linkedContentSlug);

            // Assert
            Assert.True(isValid);
            Assert.Null(errorMessage);
        }

        [Fact]
        public void ValidateLinkConfiguration_PostWithValidIdAndSlug_ReturnsValid()
        {
            // Arrange
            string linkType = "post";
            Guid? linkedContentId = Guid.NewGuid();
            string? linkedContentSlug = "car-detailing-tips-123";

            // Act
            var (isValid, errorMessage) = HeroSlideLinkValidator.ValidateLinkConfiguration(linkType, linkedContentId, linkedContentSlug);

            // Assert
            Assert.True(isValid);
            Assert.Null(errorMessage);
        }

        [Fact]
        public void ValidateLinkConfiguration_ServiceWithNullId_ReturnsInvalid()
        {
            // Arrange
            string linkType = "service";
            Guid? linkedContentId = null;
            string? linkedContentSlug = "ceramic-coating-service";

            // Act
            var (isValid, errorMessage) = HeroSlideLinkValidator.ValidateLinkConfiguration(linkType, linkedContentId, linkedContentSlug);

            // Assert
            Assert.False(isValid);
            Assert.Equal("LinkedContentId is required when LinkType is not None", errorMessage);
        }

        [Fact]
        public void ValidateLinkConfiguration_ServiceWithNullSlug_ReturnsInvalid()
        {
            // Arrange
            string linkType = "service";
            Guid? linkedContentId = Guid.NewGuid();
            string? linkedContentSlug = null;

            // Act
            var (isValid, errorMessage) = HeroSlideLinkValidator.ValidateLinkConfiguration(linkType, linkedContentId, linkedContentSlug);

            // Assert
            Assert.False(isValid);
            Assert.Equal("LinkedContentSlug is required when LinkType is not None", errorMessage);
        }

        [Fact]
        public void ValidateLinkConfiguration_ServiceWithEmptySlug_ReturnsInvalid()
        {
            // Arrange
            string linkType = "service";
            Guid? linkedContentId = Guid.NewGuid();
            string? linkedContentSlug = "   ";

            // Act
            var (isValid, errorMessage) = HeroSlideLinkValidator.ValidateLinkConfiguration(linkType, linkedContentId, linkedContentSlug);

            // Assert
            Assert.False(isValid);
            Assert.Equal("LinkedContentSlug is required when LinkType is not None", errorMessage);
        }

        [Fact]
        public void ValidateLinkConfiguration_InvalidLinkType_ReturnsInvalid()
        {
            // Arrange
            string linkType = "invalid-type";
            Guid? linkedContentId = Guid.NewGuid();
            string? linkedContentSlug = "test-slug";

            // Act
            var (isValid, errorMessage) = HeroSlideLinkValidator.ValidateLinkConfiguration(linkType, linkedContentId, linkedContentSlug);

            // Assert
            Assert.False(isValid);
            Assert.Contains("Invalid LinkType value", errorMessage);
        }

        [Fact]
        public void ValidateLinkConfiguration_CaseInsensitiveLinkType_ReturnsValid()
        {
            // Arrange
            string linkType = "SERVICE"; // uppercase
            Guid? linkedContentId = Guid.NewGuid();
            string? linkedContentSlug = "test-service";

            // Act
            var (isValid, errorMessage) = HeroSlideLinkValidator.ValidateLinkConfiguration(linkType, linkedContentId, linkedContentSlug);

            // Assert
            Assert.True(isValid);
            Assert.Null(errorMessage);
        }

        [Fact]
        public void ValidateLinkConfiguration_ServiceWithInvalidSlugFormat_ReturnsInvalid()
        {
            // Arrange
            string linkType = "service";
            Guid? linkedContentId = Guid.NewGuid();
            string? linkedContentSlug = "Invalid-Slug-With-Uppercase";

            // Act
            var (isValid, errorMessage) = HeroSlideLinkValidator.ValidateLinkConfiguration(linkType, linkedContentId, linkedContentSlug);

            // Assert
            Assert.False(isValid);
            Assert.Equal("Slug must contain only lowercase letters, numbers, and hyphens", errorMessage);
        }

        #endregion

        #region ValidateSlugFormat Tests

        [Theory]
        [InlineData("ceramic-coating")]
        [InlineData("premium-wax")]
        [InlineData("car-detailing-service")]
        [InlineData("product-123")]
        [InlineData("test")]
        [InlineData("a-b-c-d-e")]
        [InlineData("service123")]
        [InlineData("123service")]
        [InlineData("abc123def456")]
        public void ValidateSlugFormat_ValidSlugs_ReturnsValid(string slug)
        {
            // Act
            var (isValid, errorMessage) = HeroSlideLinkValidator.ValidateSlugFormat(slug);

            // Assert
            Assert.True(isValid, $"Slug '{slug}' should be valid");
            Assert.Null(errorMessage);
        }

        [Theory]
        [InlineData("Ceramic-Coating", "Slug must contain only lowercase letters, numbers, and hyphens")]
        [InlineData("PREMIUM-WAX", "Slug must contain only lowercase letters, numbers, and hyphens")]
        [InlineData("-ceramic", "Slug must contain only lowercase letters, numbers, and hyphens")]
        [InlineData("ceramic-", "Slug must contain only lowercase letters, numbers, and hyphens")]
        [InlineData("-ceramic-coating-", "Slug must contain only lowercase letters, numbers, and hyphens")]
        [InlineData("ceramic--coating", "Slug must contain only lowercase letters, numbers, and hyphens")]
        [InlineData("ceramic_coating", "Slug must contain only lowercase letters, numbers, and hyphens")]
        [InlineData("ceramic coating", "Slug must contain only lowercase letters, numbers, and hyphens")]
        [InlineData("ceramic.coating", "Slug must contain only lowercase letters, numbers, and hyphens")]
        [InlineData("ceramic/coating", "Slug must contain only lowercase letters, numbers, and hyphens")]
        [InlineData("ceramic@coating", "Slug must contain only lowercase letters, numbers, and hyphens")]
        public void ValidateSlugFormat_InvalidSlugs_ReturnsInvalid(string slug, string expectedError)
        {
            // Act
            var (isValid, errorMessage) = HeroSlideLinkValidator.ValidateSlugFormat(slug);

            // Assert
            Assert.False(isValid, $"Slug '{slug}' should be invalid");
            Assert.Equal(expectedError, errorMessage);
        }

        [Fact]
        public void ValidateSlugFormat_NullSlug_ReturnsInvalid()
        {
            // Arrange
            string? slug = null;

            // Act
            var (isValid, errorMessage) = HeroSlideLinkValidator.ValidateSlugFormat(slug);

            // Assert
            Assert.False(isValid);
            Assert.Equal("Slug cannot be empty", errorMessage);
        }

        [Fact]
        public void ValidateSlugFormat_EmptySlug_ReturnsInvalid()
        {
            // Arrange
            string slug = "";

            // Act
            var (isValid, errorMessage) = HeroSlideLinkValidator.ValidateSlugFormat(slug);

            // Assert
            Assert.False(isValid);
            Assert.Equal("Slug cannot be empty", errorMessage);
        }

        [Fact]
        public void ValidateSlugFormat_WhitespaceSlug_ReturnsInvalid()
        {
            // Arrange
            string slug = "   ";

            // Act
            var (isValid, errorMessage) = HeroSlideLinkValidator.ValidateSlugFormat(slug);

            // Assert
            Assert.False(isValid);
            Assert.Equal("Slug cannot be empty", errorMessage);
        }

        [Fact]
        public void ValidateSlugFormat_Exactly150Characters_ReturnsValid()
        {
            // Arrange - Create a slug with exactly 150 characters
            string slug = new string('a', 150);

            // Act
            var (isValid, errorMessage) = HeroSlideLinkValidator.ValidateSlugFormat(slug);

            // Assert
            Assert.True(isValid);
            Assert.Null(errorMessage);
        }

        [Fact]
        public void ValidateSlugFormat_151Characters_ReturnsInvalid()
        {
            // Arrange - Create a slug with 151 characters
            string slug = new string('a', 151);

            // Act
            var (isValid, errorMessage) = HeroSlideLinkValidator.ValidateSlugFormat(slug);

            // Assert
            Assert.False(isValid);
            Assert.Equal("Slug must not exceed 150 characters", errorMessage);
        }

        [Fact]
        public void ValidateSlugFormat_LongValidSlugWithHyphens_ReturnsValid()
        {
            // Arrange - Create a valid slug close to 150 characters with hyphens
            string slug = "abc-" + new string('x', 140) + "-def"; // 4 + 140 + 4 = 148 chars

            // Act
            var (isValid, errorMessage) = HeroSlideLinkValidator.ValidateSlugFormat(slug);

            // Assert
            Assert.True(isValid);
            Assert.Null(errorMessage);
        }

        #endregion
    }
}
