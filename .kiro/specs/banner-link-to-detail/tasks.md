# Implementation Plan: Banner Link to Detail

## Overview

This implementation plan breaks down the Banner Link to Detail feature into discrete, testable coding tasks. The feature extends the existing HeroSlide system to support configurable navigation links to Services, Products, and Posts detail pages.

The implementation follows a phased approach:
1. Database schema changes via EF Core migration
2. Model and DTO updates
3. Validation logic implementation
4. Controller endpoint updates with validation
5. Integration and testing

All tasks reference specific requirements from the requirements document to ensure complete coverage.

## Tasks

- [x] 1. Create database migration for link configuration fields
  - Generate EF Core migration to add three new columns to hero_slides table
  - Add `link_type` column (varchar(20), default 'None')
  - Add `linked_content_id` column (uuid, nullable)
  - Add `linked_content_slug` column (varchar(150), nullable)
  - Verify migration Up/Down methods are correct
  - _Requirements: 1.4, 1.5, 1.6_

- [x] 2. Update HeroSlide model with link configuration properties
  - [x] 2.1 Define LinkType enum in Models/SiteContent.cs
    - Create enum with values: None, Service, Product, Post
    - Add XML documentation comments
    - _Requirements: 1.1, 8.1_
  
  - [x] 2.2 Add link configuration properties to HeroSlide model
    - Add LinkType property with Column attribute "link_type"
    - Add LinkedContentId property (Guid?, nullable) with Column attribute "linked_content_id"
    - Add LinkedContentSlug property (string?, nullable, MaxLength 150) with Column attribute "linked_content_slug"
    - Set LinkType default value to LinkType.None
    - _Requirements: 1.1, 1.2, 1.3, 8.2_

- [x] 3. Create DTOs for banner link configuration
  - [x] 3.1 Create DTOs/HeroSlideDtos.cs file
    - Define CreateHeroSlideDto with link configuration fields (string? LinkType, Guid? LinkedContentId, string? LinkedContentSlug)
    - Define UpdateHeroSlideDto with link configuration fields
    - Define HeroSlideResponseDto with link configuration fields (string LinkType, Guid? LinkedContentId, string? LinkedContentSlug)
    - Add XML documentation comments to all DTOs
    - _Requirements: 3.1, 3.2, 3.3, 4.1, 5.1, 5.2, 5.3_

- [x] 4. Implement validation logic for link configuration
  - [x] 4.1 Create validation helper class
    - Create HeroSlideLinkValidator class in a new Validators folder or in DTOs/HeroSlideDtos.cs
    - Implement ValidateLinkConfiguration method
    - Implement ValidateSlugFormat method with regex pattern `^[a-z0-9]+(-[a-z0-9]+)*$`
    - Return tuple (bool IsValid, string? ErrorMessage) for validation results
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 10.1, 10.2, 10.3, 10.4_
  
  - [ ]* 4.2 Write unit tests for validation logic
    - Test ValidateLinkConfiguration with all valid combinations
    - Test ValidateLinkConfiguration with all invalid combinations
    - Test ValidateSlugFormat with valid slugs (lowercase-with-hyphens, alphanumeric-123)
    - Test ValidateSlugFormat with invalid slugs (uppercase, leading/trailing hyphens, special characters)
    - Test slug length validation (150 chars valid, 151 chars invalid)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 10.1, 10.2, 10.3, 10.4_

- [x] 5. Checkpoint - Apply migration and verify database schema
  - Apply migration to development database using `dotnet ef database update`
  - Verify new columns exist in hero_slides table
  - Verify default value for link_type is 'None'
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Update ContentController GET endpoint
  - [x] 6.1 Update GET /api/content/slides to return link configuration
    - Modify Select projection to include LinkType, LinkedContentId, LinkedContentSlug
    - Map LinkType enum to lowercase string format using .ToString().ToLower()
    - Return HeroSlideResponseDto structure
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 7.1, 8.3_
  
  - [ ]* 6.2 Write integration test for GET endpoint with link data
    - Create test banner with link configuration
    - Call GET /api/content/slides
    - Verify response includes linkType, linkedContentId, linkedContentSlug fields
    - Verify LinkType is serialized as lowercase string
    - _Requirements: 5.1, 5.2, 5.3, 8.3_

- [x] 7. Update ContentController POST endpoint
  - [x] 7.1 Update POST /api/content/slides to accept link configuration
    - Update method signature to accept CreateHeroSlideDto parameter
    - Call HeroSlideLinkValidator.ValidateLinkConfiguration before saving
    - Parse LinkType from string using Enum.TryParse (case-insensitive)
    - Map DTO fields to HeroSlide entity properties
    - Return HeroSlideResponseDto with link fields in response
    - Handle validation errors with 400 BadRequest and Vietnamese error messages
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 2.4, 2.5, 7.2, 8.4_
  
  - [ ]* 7.2 Write integration tests for POST endpoint with link validation
    - Test creating banner with valid service link → expect 200 OK
    - Test creating banner with valid product link → expect 200 OK
    - Test creating banner with valid post link → expect 200 OK
    - Test creating banner without link configuration → expect 200 OK with LinkType=None
    - Test creating banner with LinkType=None but LinkedContentId provided → expect 400 BadRequest
    - Test creating banner with LinkType=Service but no LinkedContentId → expect 400 BadRequest
    - Test creating banner with invalid slug format → expect 400 BadRequest with Vietnamese error message
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 2.4, 2.5_

- [x] 8. Update ContentController PUT endpoint
  - [x] 8.1 Update PUT /api/content/slides/{id} to accept link configuration updates
    - Update method signature to accept UpdateHeroSlideDto parameter
    - Detect if any link fields are provided in request
    - If link fields provided, validate entire link configuration using existing + new values
    - Handle LinkType change to None by clearing LinkedContentId and LinkedContentSlug
    - Preserve existing link values for fields not included in request
    - Return HeroSlideResponseDto with updated link fields
    - Handle validation errors with 400 BadRequest
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 7.3_
  
  - [ ]* 8.2 Write integration tests for PUT endpoint with link updates
    - Test updating banner to add link configuration → expect 200 OK
    - Test updating banner from Service link to None → expect LinkedContentId and Slug cleared
    - Test updating banner with partial link config (only slug changed) → expect 200 OK
    - Test updating banner without link fields → expect existing link config preserved
    - Test updating banner with invalid link config → expect 400 BadRequest
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 9. Checkpoint - Manual testing and verification
  - Test end-to-end scenario: Create service → Create banner linked to service → Verify GET returns link data
  - Test backward compatibility: Retrieve existing banners created before feature
  - Test validation: Attempt to create banner with invalid configurations
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Update existing banner DTOs in ContentController
  - [x] 10.1 Replace inline CreateHeroSlideDto and UpdateContentDto with imported DTOs
    - Remove inline DTO definitions from ContentController.cs
    - Add using statement for DetailingStore.Api.DTOs namespace
    - Update POST and PUT methods to use new DTO classes from HeroSlideDtos.cs
    - Ensure backward compatibility for existing fields
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 11. Final integration and documentation
  - [ ] 11.1 Add XML documentation comments to controller methods
    - Document expected request/response formats for POST and PUT endpoints
    - Document validation error scenarios
    - Add example JSON payloads in comments
    - _Requirements: All requirements for API documentation_
  
  - [ ]* 11.2 Write end-to-end integration tests
    - Test complete workflow: Create content → Create linked banner → Retrieve banner → Delete content → Verify banner still exists
    - Test soft reference behavior: Verify no cascade deletion when content is deleted
    - Test frontend URL construction scenario with all LinkType values
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 12. Final checkpoint - Ensure all tests pass
  - Run full test suite with `dotnet test`
  - Verify all validation scenarios work correctly
  - Verify backward compatibility with existing banners
  - Check database schema matches design
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for full traceability
- Checkpoints ensure incremental validation and allow for user feedback
- Migration must be applied before model changes can be tested
- Validation logic is centralized in HeroSlideLinkValidator for reusability
- All error messages are in Vietnamese per existing codebase convention
- Backward compatibility is maintained - existing banners will have LinkType=None by default
- No foreign key constraints are added (soft reference pattern) to prevent cascade deletion issues

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1", "2.1"]
    },
    {
      "id": 1,
      "tasks": ["2.2", "3.1"]
    },
    {
      "id": 2,
      "tasks": ["4.1"]
    },
    {
      "id": 3,
      "tasks": ["4.2", "6.1"]
    },
    {
      "id": 4,
      "tasks": ["6.2", "7.1"]
    },
    {
      "id": 5,
      "tasks": ["7.2", "8.1"]
    },
    {
      "id": 6,
      "tasks": ["8.2", "10.1"]
    },
    {
      "id": 7,
      "tasks": ["11.1"]
    },
    {
      "id": 8,
      "tasks": ["11.2"]
    }
  ]
}
```
