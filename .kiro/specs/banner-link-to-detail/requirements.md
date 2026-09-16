# Requirements Document

## Introduction

Tính năng này cho phép liên kết banner (HeroSlide) trên trang chủ đến các trang chi tiết tương ứng (dịch vụ, sản phẩm, hoặc bài viết) trong hệ thống DetailingStore. Banner có thể được cấu hình để điều hướng người dùng đến nội dung cụ thể hoặc hiển thị mà không có liên kết.

## Glossary

- **Banner_System**: Hệ thống quản lý và hiển thị HeroSlide trên trang chủ (bao gồm model HeroSlide, ContentController, và database hero_slides table)
- **Admin**: Người dùng có quyền quản trị, có thể tạo và chỉnh sửa banner thông qua API
- **End_User**: Người dùng cuối truy cập trang chủ và tương tác với banner
- **Content_Item**: Một trong ba loại nội dung: ServiceEntity, ProductEntity, hoặc PostEntity
- **Link_Configuration**: Thông tin cấu hình liên kết của banner bao gồm loại nội dung (LinkType), ID của nội dung (LinkedContentId), và Slug để xây dựng URL
- **LinkType**: Enum định nghĩa loại nội dung mà banner liên kết đến, có các giá trị: None, Service, Product, Post
- **Frontend_Router**: Hệ thống định tuyến phía frontend sử dụng slug để điều hướng đến trang chi tiết
- **Database_Migration**: Script migration Entity Framework Core để thêm các trường mới vào bảng hero_slides
- **API_Response**: Dữ liệu JSON trả về từ API endpoint GET /api/content/slides

## Requirements

### Requirement 1: Extend Banner Model with Link Configuration

**User Story:** As an Admin, I want to configure banner linking options, so that I can create banners that navigate to specific content items or display without links.

#### Acceptance Criteria

1. THE Banner_System SHALL extend the HeroSlide model with a LinkType field of type enum (None, Service, Product, Post)
2. THE Banner_System SHALL extend the HeroSlide model with a LinkedContentId field of type nullable Guid
3. THE Banner_System SHALL extend the HeroSlide model with a LinkedContentSlug field of type nullable string with max length 150 characters
4. THE Database_Migration SHALL add column "link_type" to table "hero_slides" with default value "None"
5. THE Database_Migration SHALL add column "linked_content_id" to table "hero_slides" as nullable uuid
6. THE Database_Migration SHALL add column "linked_content_slug" to table "hero_slides" as nullable varchar(150)

### Requirement 2: Validate Link Configuration

**User Story:** As an Admin, I want the system to validate link configurations, so that I can prevent invalid banner setups.

#### Acceptance Criteria

1. WHEN LinkType is "None", THE Banner_System SHALL accept null values for LinkedContentId and LinkedContentSlug
2. WHEN LinkType is "Service", "Product", or "Post", THE Banner_System SHALL require LinkedContentId to be non-null
3. WHEN LinkType is "Service", "Product", or "Post", THE Banner_System SHALL require LinkedContentSlug to be non-null and non-empty
4. IF LinkedContentId is provided but LinkType is "None", THEN THE Banner_System SHALL return validation error "LinkType must be specified when LinkedContentId is provided"
5. IF LinkType is not "None" but LinkedContentId is null, THEN THE Banner_System SHALL return validation error "LinkedContentId is required when LinkType is not None"

### Requirement 3: Create Banner with Link Configuration

**User Story:** As an Admin, I want to create banners with link configurations, so that I can set up navigation from banners to content items.

#### Acceptance Criteria

1. WHEN Admin creates a banner via POST /api/content/slides, THE Banner_System SHALL accept LinkType in request body
2. WHEN Admin creates a banner via POST /api/content/slides, THE Banner_System SHALL accept LinkedContentId in request body
3. WHEN Admin creates a banner via POST /api/content/slides, THE Banner_System SHALL accept LinkedContentSlug in request body
4. WHEN Admin provides valid Link_Configuration, THE Banner_System SHALL store all link fields in database within 500 milliseconds
5. WHEN Admin creates a banner without Link_Configuration, THE Banner_System SHALL set LinkType to "None" and leave LinkedContentId and LinkedContentSlug as null

### Requirement 4: Update Banner Link Configuration

**User Story:** As an Admin, I want to update banner link configurations, so that I can change banner navigation targets or remove links.

#### Acceptance Criteria

1. WHEN Admin updates a banner via PUT /api/content/slides/{id}, THE Banner_System SHALL accept Link_Configuration fields in request body
2. WHEN Admin changes LinkType from a non-None value to "None", THE Banner_System SHALL set LinkedContentId and LinkedContentSlug to null
3. WHEN Admin updates LinkedContentId, THE Banner_System SHALL also require updated LinkedContentSlug in the same request
4. WHEN Admin provides partial Link_Configuration updates, THE Banner_System SHALL preserve existing values for fields not included in request

### Requirement 5: Return Link Information in API Response

**User Story:** As a Frontend_Router, I want to receive link configuration data in banner API responses, so that I can construct navigation URLs.

#### Acceptance Criteria

1. WHEN Frontend_Router requests GET /api/content/slides, THE Banner_System SHALL include linkType field in API_Response for each banner
2. WHEN Frontend_Router requests GET /api/content/slides, THE Banner_System SHALL include linkedContentId field in API_Response for each banner
3. WHEN Frontend_Router requests GET /api/content/slides, THE Banner_System SHALL include linkedContentSlug field in API_Response for each banner
4. WHEN a banner has LinkType "None", THE API_Response SHALL return linkType as "None" and linkedContentId and linkedContentSlug as null
5. WHEN a banner has LinkType "Service", "Product", or "Post", THE API_Response SHALL return all three fields with non-null values

### Requirement 6: Maintain Data Integrity When Content is Deleted

**User Story:** As an End_User, I want banners to display correctly even when linked content is deleted, so that I don't encounter broken experiences.

#### Acceptance Criteria

1. WHEN a Content_Item is deleted from database, THE Banner_System SHALL preserve the banner record without cascade deletion
2. WHEN a banner's linked Content_Item no longer exists, THE Banner_System SHALL still return the banner in GET /api/content/slides response
3. WHEN Frontend_Router receives a banner with deleted Content_Item, THE Frontend_Router SHALL display the banner without a clickable link
4. THE Banner_System SHALL NOT enforce foreign key constraints between HeroSlide.LinkedContentId and Content_Item tables

### Requirement 7: Maintain Backward Compatibility

**User Story:** As a System_Administrator, I want existing API endpoints to continue working after adding link features, so that I can deploy updates without breaking existing integrations.

#### Acceptance Criteria

1. WHEN Frontend_Router calls GET /api/content/slides, THE Banner_System SHALL return all previously existing fields (Id, Tag, Title, Description, ImageUrl, SortOrder, IsActive)
2. WHEN Admin calls POST /api/content/slides without Link_Configuration fields, THE Banner_System SHALL create banner successfully with LinkType defaulted to "None"
3. WHEN Admin calls PUT /api/content/slides/{id} without Link_Configuration fields, THE Banner_System SHALL update other fields without modifying existing Link_Configuration
4. THE Banner_System SHALL maintain snake_case column naming convention in database (link_type, linked_content_id, linked_content_slug)

### Requirement 8: Support Link Type Enumeration

**User Story:** As a Developer, I want a clear enumeration for link types, so that I can maintain type safety and clarity in code.

#### Acceptance Criteria

1. THE Banner_System SHALL define LinkType enum with exactly four values: None, Service, Product, Post
2. THE Banner_System SHALL store LinkType in database as string type with max length 20 characters
3. WHEN serializing to JSON, THE Banner_System SHALL convert LinkType enum to lowercase string format ("none", "service", "product", "post")
4. WHEN deserializing from JSON, THE Banner_System SHALL accept case-insensitive LinkType values and convert to proper enum

### Requirement 9: Construct Frontend Navigation URLs

**User Story:** As a Frontend_Router, I want to construct navigation URLs from banner link data, so that I can route users to the correct detail pages.

#### Acceptance Criteria

1. WHEN LinkType is "service", THE Frontend_Router SHALL construct URL in format "/services/{slug}"
2. WHEN LinkType is "product", THE Frontend_Router SHALL construct URL in format "/products/{slug}"
3. WHEN LinkType is "post", THE Frontend_Router SHALL construct URL in format "/posts/{slug}"
4. WHEN LinkType is "none", THE Frontend_Router SHALL not construct any URL and display banner as non-clickable
5. WHERE Frontend_Router encounters linkedContentSlug as null but linkType is not "None", THE Frontend_Router SHALL log an error and display banner as non-clickable

### Requirement 10: Parse and Validate Slug Format

**User Story:** As a Banner_System, I want to validate slug format, so that I can ensure URL construction will succeed.

#### Acceptance Criteria

1. WHEN Admin provides LinkedContentSlug, THE Banner_System SHALL validate that it contains only lowercase letters, numbers, and hyphens
2. WHEN Admin provides LinkedContentSlug, THE Banner_System SHALL validate that it does not start or end with a hyphen
3. WHEN Admin provides LinkedContentSlug with length greater than 150 characters, THE Banner_System SHALL return validation error "Slug must not exceed 150 characters"
4. IF LinkedContentSlug contains invalid characters, THEN THE Banner_System SHALL return validation error "Slug must contain only lowercase letters, numbers, and hyphens"
