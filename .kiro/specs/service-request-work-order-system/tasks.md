# Implementation Plan: Service Request & Work Order Management System

## Overview

This implementation plan creates a comprehensive workflow management system that bridges customer service requests with staff work assignments. The system consists of three primary user flows: Customer submission flow, Admin review/management flow, and Staff work order execution flow. All implementation follows the existing project structure and conventions (snake_case for database, C# for backend, TypeScript/React for frontend).

## Tasks

- [x] 1. Set up backend data models and database migration
  - [x] 1.1 Create ServiceRequestEntity model
    - Create `backend/Models/ServiceRequestEntity.cs` with all required fields
    - Include enums: ServiceRequestStatus (Pending, Accepted, Rejected)
    - Configure navigation properties to User and ServiceEntity
    - Apply snake_case column naming with [Table] and [Column] attributes
    - _Requirements: 1.3, 2.2, 10.1, 10.2_
  
  - [x] 1.2 Create WorkOrderEntity model
    - Create `backend/Models/WorkOrderEntity.cs` with all required fields
    - Include enums: WorkOrderStatus (Pending, Accepted, Rejected, InProgress, Completed, Expired), RequestSource (CustomerRequest, DirectEntry)
    - Store AssignedStaffIds as JSONB column (use string property with JSON serialization)
    - Store VehicleInfo as JSONB column
    - Configure navigation properties to User (Customer, CreatedByAdmin) and ServiceRequestEntity
    - _Requirements: 3.7, 4.8, 5.1, 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [x] 1.3 Update AppDbContext with new DbSets
    - Add `public DbSet<ServiceRequestEntity> ServiceRequests => Set<ServiceRequestEntity>();`
    - Add `public DbSet<WorkOrderEntity> WorkOrders => Set<WorkOrderEntity>();`
    - Configure enum-to-string conversions in OnModelCreating
    - Configure unique indexes for service_requests (status, created_at)
    - Configure indexes for work_orders (scheduled_start_time, status, assigned_staff_ids GIN)
    - _Requirements: 10.1, 10.5_
  
  - [x] 1.4 Create and apply EF Core migration
    - Run `dotnet ef migrations add AddServiceRequestWorkOrderTables`
    - Review generated migration SQL for correctness
    - Verify snake_case table and column names
    - Verify JSONB column types for vehicle_info and assigned_staff_ids
    - Verify check constraints for status enums and scheduled time validation
    - Apply migration: `dotnet ef database update`
    - _Requirements: 5.2, 10.1_

- [x] 2. Checkpoint - Verify database schema
  - Ensure migration applied successfully, verify tables exist in PostgreSQL, ask the user if questions arise.

- [x] 3. Implement backend DTOs
  - [x] 3.1 Create ServiceRequest DTOs
    - Create `backend/DTOs/ServiceRequestDtos.cs`
    - Define CreateServiceRequestDto (customer input)
    - Define ServiceRequestDto (response with related data)
    - Define ServiceRequestDetailDto (full details for admin view)
    - Define AcceptServiceRequestDto (admin acceptance input)
    - Define VehicleInfoDto (nested in ServiceRequest)
    - _Requirements: 1.2, 2.2, 3.1_
  
  - [x] 3.2 Create WorkOrder DTOs
    - Create `backend/DTOs/WorkOrderDtos.cs`
    - Define CreateWorkOrderDto (admin direct entry input)
    - Define WorkOrderDto (response with related data)
    - Define WorkOrderDetailDto (full details including customer info)
    - Define UpdateWorkOrderStatusDto (status update input)
    - Define AvailableStaffDto (staff availability response)
    - _Requirements: 4.2, 6.6, 7.1, 9.2_

- [x] 4. Implement EmailService for confirmation emails
  - [x] 4.1 Create IEmailService interface and implementation
    - Create `backend/Services/IEmailService.cs` interface
    - Create `backend/Services/EmailService.cs` implementation
    - Implement SendServiceRequestConfirmationAsync method
    - Load SMTP configuration from appsettings.json (reuse existing config)
    - Build HTML email template with service request details
    - Use fire-and-forget pattern (don't block request)
    - Log errors but don't throw exceptions
    - _Requirements: 1.5, 1.6, 11.1, 11.2, 11.3, 11.4, 11.5_
  
  - [x] 4.2 Register EmailService in Program.cs
    - Add `builder.Services.AddScoped<IEmailService, EmailService>();`
    - _Requirements: 11.1_

- [x] 5. Implement ServiceRequestsController endpoints
  - [x] 5.1 Create ServiceRequestsController class and POST endpoint
    - Create `backend/Controllers/ServiceRequestsController.cs`
    - Implement POST /api/service-requests [Authorize(Roles = "Customer")]
    - Validate authenticated user matches CustomerId
    - Create ServiceRequestEntity with Status = Pending
    - Save to database
    - Trigger EmailService.SendServiceRequestConfirmationAsync (fire and forget)
    - Return ApiResponse<ServiceRequestDto>
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 1.6_
  
  - [x] 5.2 Implement GET /api/service-requests endpoint
    - Allow optional status query parameter
    - Require Admin role authorization
    - Query service_requests with Include for Customer and RequestedService
    - Order by CreatedAt descending
    - Return ApiResponse<List<ServiceRequestDto>>
    - _Requirements: 2.1_
  
  - [x] 5.3 Implement GET /api/service-requests/{id} endpoint
    - Require Admin role authorization
    - Load service request by ID with all related data
    - Return ApiResponse<ServiceRequestDetailDto> with 404 if not found
    - _Requirements: 2.2_
  
  - [x] 5.4 Implement PUT /api/service-requests/{id}/accept endpoint
    - Require Admin role authorization
    - Load ServiceRequest and validate Status is Pending
    - Create WorkOrderEntity with RequestSource = CustomerRequest
    - Copy customer info from service request
    - Parse assigned_staff_ids JSON array from AcceptServiceRequestDto
    - Set scheduling, price quote, and notes from DTO
    - Update ServiceRequest Status = Accepted, ReviewedAt = NOW(), ReviewedByAdminId
    - Save both entities in transaction
    - Return ApiResponse<WorkOrderDto>
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_
  
  - [x] 5.5 Implement PUT /api/service-requests/{id}/reject endpoint
    - Require Admin role authorization
    - Load ServiceRequest and validate Status is Pending
    - Update Status = Rejected, ReviewedAt = NOW(), ReviewedByAdminId from authenticated user
    - Return ApiResponse<ServiceRequestDto>
    - _Requirements: 2.3, 2.4_

- [x] 6. Checkpoint - Test ServiceRequestsController
  - Ensure all endpoints compile, test POST with authentication, verify email sending (check logs), ask the user if questions arise.

- [x] 7. Implement staff availability query
  - [x] 7.1 Create or extend StaffController with availability endpoint
    - Create or extend `backend/Controllers/StaffController.cs`
    - Implement GET /api/staff/available [Authorize(Roles = "Admin")]
    - Accept startTime and endTime query parameters
    - Validate endTime > startTime
    - Query work_shifts for the date extracted from startTime
    - For each shift, load WorkShiftConfig to get start/end times
    - Calculate absolute shift times (date + time)
    - Filter where shift_start < work_order_end AND shift_end > work_order_start
    - Get distinct staff IDs from matching shifts
    - Load User entities for staff IDs
    - Return ApiResponse<List<AvailableStaffDto>> with staff and shift info
    - _Requirements: 3.4, 3.5, 4.5, 6.1, 6.2, 6.3, 6.4, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [x] 8. Implement WorkOrdersController endpoints
  - [x] 8.1 Create WorkOrdersController class and POST endpoint
    - Create `backend/Controllers/WorkOrdersController.cs`
    - Implement POST /api/work-orders [Authorize(Roles = "Admin")]
    - Validate scheduled_end_time > scheduled_start_time
    - Create WorkOrderEntity with RequestSource = DirectEntry
    - Set CreatedByAdminId from authenticated user
    - Parse assigned_staff_ids JSON array from CreateWorkOrderDto
    - Set optional customer fields if provided in DTO
    - Initialize WorkOrderStatus = Pending
    - Save to database
    - Return ApiResponse<WorkOrderDto>
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.7, 4.8, 4.9, 4.10, 5.1, 5.2_
  
  - [x] 8.2 Implement GET /api/work-orders endpoint
    - Require authentication (Customer, Staff, or Admin)
    - Accept optional query parameters: staffId, status, date
    - If user role is Staff: filter where assigned_staff_ids array contains user ID (use EF.Functions.JsonContains)
    - If user role is Admin: apply query filters (staffId, status, date)
    - Include related entities (Customer, CreatedByAdmin)
    - Order by ScheduledStartTime ascending
    - Return ApiResponse<List<WorkOrderDto>>
    - _Requirements: 6.7, 6.8, 6.9, 9.1_
  
  - [x] 8.3 Implement GET /api/work-orders/{id} endpoint
    - Require authentication
    - Load work order by ID with all related data
    - If user role is Staff: verify user ID in assigned_staff_ids JSON array
    - If user role is Admin or Customer: allow access
    - Return ApiResponse<WorkOrderDetailDto> with 404 if not found or unauthorized
    - _Requirements: 6.8, 9.3_
  
  - [x] 8.4 Implement PUT /api/work-orders/{id}/status endpoint
    - Require authentication (Staff or Admin)
    - Load work order by ID
    - If user is Staff: verify user ID in assigned_staff_ids
    - Validate status transition (e.g., Accepted → InProgress → Completed, Expired → Completed)
    - Update WorkOrderStatus from UpdateWorkOrderStatusDto
    - If new status is Completed: set CompletedAt = NOW()
    - Save changes
    - Return ApiResponse<WorkOrderDto>
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 8.4, 8.5_

- [x] 9. Checkpoint - Test WorkOrdersController
  - Ensure all endpoints compile, test role-based filtering, verify JSON array queries work, ask the user if questions arise.

- [x] 10. Implement WorkOrderExpirationService background service
  - [x] 10.1 Create WorkOrderExpirationService
    - Create `backend/Services/WorkOrderExpirationService.cs`
    - Inherit from BackgroundService
    - Implement ExecuteAsync with infinite loop
    - Query work_orders where scheduled_end_time < NOW() AND status IN (Pending, Accepted, InProgress)
    - Update WorkOrderStatus = Expired for matching records
    - Log each expiration event
    - Catch and log exceptions without crashing service
    - Wait 5 minutes between checks (Task.Delay(TimeSpan.FromMinutes(5)))
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [x] 10.2 Register WorkOrderExpirationService in Program.cs
    - Add `builder.Services.AddHostedService<WorkOrderExpirationService>();`
    - _Requirements: 8.2_

- [x] 11. Checkpoint - Test background service
  - Ensure service starts on app launch, manually create test work order with past end time, verify expiration after 5 minutes, ask the user if questions arise.

- [x] 12. Implement frontend Redux slices
  - [x] 12.1 Create serviceRequestsSlice
    - Create `frontend/src/features/serviceRequestsSlice.ts`
    - Define ServiceRequest and related types
    - Create async thunks: fetchServiceRequests, createServiceRequest, fetchServiceRequestById, acceptServiceRequest, rejectServiceRequest
    - Implement slice with loading, error, and data state
    - Export actions and selectors
    - _Requirements: 1.1, 2.1, 2.2, 3.7_
  
  - [x] 12.2 Create workOrdersSlice
    - Create `frontend/src/features/workOrdersSlice.ts`
    - Define WorkOrder and related types
    - Create async thunks: fetchWorkOrders, createWorkOrder, fetchWorkOrderById, updateWorkOrderStatus, fetchAvailableStaff
    - Implement slice with loading, error, and data state
    - Export actions and selectors
    - _Requirements: 4.8, 6.7, 7.3, 7.4, 9.1_
  
  - [x] 12.3 Register slices in store
    - Update `frontend/src/app/store.ts` to include serviceRequests and workOrders reducers
    - _Requirements: 1.1, 4.8_

- [x] 13. Implement frontend API services
  - [x] 13.1 Create serviceRequestApi
    - Create `frontend/src/services/api/serviceRequestApi.ts`
    - Implement functions: createServiceRequest, getServiceRequests, getServiceRequestById, acceptServiceRequest, rejectServiceRequest
    - Use axios with proper error handling
    - Include auth token in headers
    - _Requirements: 1.3, 2.1, 2.2, 3.7_
  
  - [x] 13.2 Create workOrderApi
    - Create `frontend/src/services/api/workOrderApi.ts`
    - Implement functions: createWorkOrder, getWorkOrders, getWorkOrderById, updateWorkOrderStatus, getAvailableStaff
    - Use axios with proper error handling
    - Include auth token in headers
    - _Requirements: 4.8, 6.7, 7.4, 9.1_

- [x] 14. Implement shared frontend components
  - [x] 14.1 Create TimeSlotPicker component
    - Create `frontend/src/components/ui/TimeSlotPicker.tsx`
    - Define TIME_PRESETS constant: Morning (07:30-11:00), Afternoon (13:00-17:00), Custom
    - Render preset selection (radio buttons or button group)
    - Show DateTime pickers when Custom is selected
    - Emit onChange events with selected start/end times
    - Style according to project standards (custom CSS, no Tailwind)
    - _Requirements: 3.2, 3.3, 4.3, 5.3_
  
  - [x] 14.2 Create AvailableStaffSelector component
    - Create `frontend/src/components/ui/AvailableStaffSelector.tsx`
    - Accept props: scheduledStartTime, scheduledEndTime, selectedStaffIds, onSelectionChange
    - useEffect to fetch available staff when times change
    - Call workOrdersSlice.fetchAvailableStaff thunk
    - Display loading spinner during fetch
    - Render staff cards with checkboxes for multi-select
    - Show shift info for each staff member (shift name, start/end time)
    - Display "No staff available during this time period" message when empty
    - Handle selection changes with visual feedback
    - _Requirements: 3.5, 4.5, 6.4, 6.5, 12.4_

- [x] 15. Implement customer portal components
  - [x] 15.1 Create ServiceRequestForm component
    - Create `frontend/src/pages/user/ServiceRequestForm.tsx`
    - Implement form fields: License Plate, Vehicle Model, Vehicle Year, Service Selection (dropdown), Preferred Date (date picker), Preferred Time (time picker), Notes (textarea)
    - Validate all required fields before submission
    - On submit: dispatch createServiceRequest thunk
    - Show success toast: "Request submitted! Check your email for confirmation."
    - Reset form on success
    - Call onSubmitSuccess callback prop
    - Style form with custom CSS
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 15.2 Create ServiceRequestsList component
    - Create `frontend/src/pages/user/ServiceRequestsList.tsx`
    - Fetch customer's service requests on mount (filter by authenticated user ID)
    - Display cards with: date, service name, status badge, vehicle info
    - Color-code status badges: Pending (yellow), Accepted (green), Rejected (red)
    - Implement status filter dropdown
    - Sort by created date descending
    - _Requirements: 1.4_

- [x] 16. Implement admin portal components - Service Request management
  - [x] 16.1 Create AdminServiceRequestsList component
    - Create `frontend/src/pages/admin/AdminServiceRequestsList.tsx`
    - Fetch all service requests on mount
    - Display table/card grid with columns: Created Date, Customer Name, Service, Preferred Time, Status
    - Default filter: show only Pending requests
    - Add status filter dropdown
    - Sort by date (newest first)
    - On row click: open ServiceRequestDetailModal with requestId
    - _Requirements: 2.1_
  
  - [x] 16.2 Create ServiceRequestDetailModal component
    - Create `frontend/src/components/admin/ServiceRequestDetailModal.tsx`
    - Fetch service request details by ID on mount
    - Display sections: Customer Information (name, email, phone), Vehicle Information (plate, model, year), Service Details (name, preferred date/time), Customer Notes
    - Show action buttons: Accept (opens AcceptServiceRequestForm), Reject (confirm then call rejectServiceRequest), Close
    - Handle modal open/close state
    - _Requirements: 2.2, 2.3_
  
  - [x] 16.3 Create AcceptServiceRequestForm component
    - Create `frontend/src/components/admin/AcceptServiceRequestForm.tsx`
    - Accept props: serviceRequest, onSave, onCancel
    - Section 1: Scheduling - Use TimeSlotPicker component for preset/custom time selection
    - Section 2: Staff Assignment - Use AvailableStaffSelector component (only shown after time selected)
    - Section 3: Pricing & Notes - Price Quote (number input), Admin Notes (textarea)
    - On submit: call acceptServiceRequest thunk with all form data
    - Show success toast, call onSave callback
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 17. Checkpoint - Test customer and admin service request flow
  - Ensure customer can submit request, verify email confirmation, test admin review and acceptance, ask the user if questions arise.

- [x] 18. Implement admin portal components - Work Order management
  - [x] 18.1 Create WorkOrderForm component for direct entry
    - Create `frontend/src/components/admin/WorkOrderForm.tsx`
    - Section 1: Vehicle Information - License Plate, Model, Year, Service Details (textarea)
    - Section 2: Customer Information (optional) - Name, Phone, Email, Checkbox: "Walk-in customer (no account)"
    - Section 3: Scheduling - Date picker, TimeSlotPicker component
    - Section 4: Staff Assignment - AvailableStaffSelector component (shown after time selection)
    - Section 5: Pricing & Notes - Price Quote, Admin Notes
    - Validate scheduled_end_time > scheduled_start_time
    - On submit: call createWorkOrder thunk
    - Show success toast, call onSubmitSuccess callback
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_
  
  - [x] 18.2 Create AdminWorkOrdersList component
    - Create `frontend/src/pages/admin/AdminWorkOrdersList.tsx`
    - Implement tab navigation: All, Unassigned, Today, Upcoming, Completed
    - Display table with columns: Scheduled Time, Vehicle, Service, Assigned Staff, Status, Source
    - Color-code status badges: Pending (yellow), Accepted (blue), InProgress (orange), Completed (green), Expired (red)
    - Implement filters: Date range picker, Staff dropdown, Status dropdown
    - Sort by scheduled start time
    - On row click: open work order detail modal
    - _Requirements: 6.7_

- [x] 19. Implement staff portal components
  - [x] 19.1 Create WorkOrderCard component
    - Create `frontend/src/components/staff/WorkOrderCard.tsx`
    - Display scheduled time with countdown/timer visual indicator
    - Show vehicle info (license plate, model)
    - Display service details and customer notes
    - Render status badge with color coding
    - Show warning icon if within 30 minutes of end time and not completed
    - Action buttons based on status:
      - Accepted: "Start Work" button → dispatch updateWorkOrderStatus(InProgress)
      - InProgress: "Mark Complete" button → dispatch updateWorkOrderStatus(Completed)
      - Expired: "Mark Complete" button → dispatch updateWorkOrderStatus(Completed)
    - Implement optimistic UI update with error rollback
    - _Requirements: 7.3, 7.4, 8.4, 9.2, 9.3, 9.4_
  
  - [x] 19.2 Create StaffWorkOrdersList component
    - Create `frontend/src/pages/staff/StaffWorkOrdersList.tsx`
    - Fetch work orders filtered by authenticated staff ID on mount
    - Display card grid sorted by scheduled time
    - Implement filter tabs: All, Upcoming, In Progress, Completed, Expired
    - Each card uses WorkOrderCard component
    - Auto-refresh every 2 minutes to catch status changes
    - _Requirements: 6.7, 9.1, 9.2, 9.5_

- [x] 20. Checkpoint - Test staff work order flow
  - Ensure staff see only assigned work orders, test status updates, verify expiration warnings, ask the user if questions arise.

- [x] 21. Update routing and navigation
  - [x] 21.1 Add customer routes
    - Update `frontend/src/routes/AppRouter.tsx`
    - Add route: /user/service-requests → ServiceRequestsList
    - Add route: /user/service-requests/new → ServiceRequestForm
    - Protect routes with ProtectedRoute (role: Customer)
    - _Requirements: 1.1_
  
  - [x] 21.2 Add admin routes
    - Add route: /admin/service-requests → AdminServiceRequestsList
    - Add route: /admin/work-orders → AdminWorkOrdersList
    - Add route: /admin/work-orders/new → WorkOrderForm
    - Protect routes with ProtectedRoute (role: Admin)
    - _Requirements: 2.1, 4.1_
  
  - [x] 21.3 Add staff routes
    - Add route: /staff/work-orders → StaffWorkOrdersList
    - Protect route with ProtectedRoute (role: Staff)
    - _Requirements: 9.1_
  
  - [x] 21.4 Update navigation menus
    - Add "Service Requests" link to customer navigation
    - Add "Service Requests" and "Work Orders" links to admin navigation
    - Add "My Work Orders" link to staff navigation

- [x] 22. Implement frontend types
  - [x] 22.1 Add types to types/index.ts
    - Update `frontend/src/types/index.ts`
    - Add ServiceRequest, ServiceRequestStatus, ServiceRequestDetail types
    - Add WorkOrder, WorkOrderStatus, RequestSource, WorkOrderDetail types
    - Add VehicleInfo, AvailableStaff types
    - Add CreateServiceRequestDto, AcceptServiceRequestDto, CreateWorkOrderDto, UpdateWorkOrderStatusDto types
    - _Requirements: 1.2, 3.1, 4.2, 6.6_

- [x] 23. Final integration testing
  - [x] 23.1 Test complete customer flow
    - Customer submits service request
    - Verify email confirmation sent
    - Admin reviews and accepts request
    - Verify work order created
    - Staff sees work order in their list
    - Staff updates status to completed
    - _Requirements: 1.1, 1.5, 3.7, 6.7, 7.4_
  
  - [x] 23.2 Test direct work order creation flow
    - Admin creates work order directly
    - Verify staff availability filtering works
    - Staff sees work order in their list
    - Test status transitions
    - _Requirements: 4.8, 6.4, 9.1, 7.3_
  
  - [x] 23.3 Test expiration flow
    - Create work order with past end time
    - Wait for background service cycle (5 minutes)
    - Verify status changes to Expired
    - Staff marks expired work order as completed
    - _Requirements: 8.1, 8.2, 8.4, 8.5_

- [x] 24. Final checkpoint
  - Ensure all tests pass, verify all requirements met, check error handling, ask the user if questions arise.

## Notes

- All tasks follow existing project conventions: snake_case for database, C# for backend, TypeScript/React for frontend
- Email service uses fire-and-forget pattern to avoid blocking customer submissions
- Staff assignment filtering is based on work shift overlap calculation (existing work_shifts and work_shift_configs tables)
- JSON columns (vehicle_info, assigned_staff_ids) use JSONB in PostgreSQL for efficient querying
- Background service runs every 5 minutes to check for expired work orders
- Frontend uses Redux Toolkit for state management and Axios for API calls
- All components use custom CSS (no Tailwind) per project standards
- Role-based access control is enforced at both API and UI levels
- Each task references specific requirements for traceability

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3"] },
    { "id": 2, "tasks": ["1.4"] },
    { "id": 3, "tasks": ["3.1", "3.2", "22.1"] },
    { "id": 4, "tasks": ["4.1"] },
    { "id": 5, "tasks": ["4.2", "5.1"] },
    { "id": 6, "tasks": ["5.2", "5.3", "5.4", "5.5", "7.1"] },
    { "id": 7, "tasks": ["8.1", "8.2", "8.3", "8.4"] },
    { "id": 8, "tasks": ["10.1"] },
    { "id": 9, "tasks": ["10.2"] },
    { "id": 10, "tasks": ["12.1", "12.2", "13.1", "13.2"] },
    { "id": 11, "tasks": ["12.3", "14.1", "14.2"] },
    { "id": 12, "tasks": ["15.1", "15.2", "16.1"] },
    { "id": 13, "tasks": ["16.2"] },
    { "id": 14, "tasks": ["16.3", "18.1"] },
    { "id": 15, "tasks": ["18.2", "19.1"] },
    { "id": 16, "tasks": ["19.2"] },
    { "id": 17, "tasks": ["21.1", "21.2", "21.3"] },
    { "id": 18, "tasks": ["21.4", "23.1", "23.2", "23.3"] }
  ]
}
```
