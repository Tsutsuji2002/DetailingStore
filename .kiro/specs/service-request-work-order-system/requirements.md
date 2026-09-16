# Requirements Document

## Introduction

The Service Request & Work Order Management System enables customers to submit service requests online, allows administrators to review and convert those requests into work orders, and provides staff with a unified view of all work orders (both from customer requests and direct admin entries). The system handles scheduling, staff assignment, status tracking, and automated email notifications.

## Glossary

- **Service_Request**: A customer-submitted request for vehicle service through the website
- **Work_Order**: A scheduled vehicle service task that appears in the staff work queue (either from an accepted service request or direct admin entry)
- **Customer**: A registered user who submits service requests through their account
- **Admin**: A system administrator who reviews service requests, creates work orders, and assigns staff
- **Staff**: A worker who receives assigned work orders and performs vehicle services
- **Admin_Area**: The administrative interface where admins manage service requests and work orders
- **Staff_Area**: The interface where staff view and update their assigned work orders
- **Scheduled_Time_Period**: A work order's start time and end time window
- **Request_Source**: Indicates whether a work order originated from a customer request or direct admin entry
- **Work_Order_Status**: Current state of a work order (pending, accepted, rejected, in_progress, completed, expired)
- **Confirmation_Email**: Automated email sent to customer acknowledging service request receipt
- **Time_Slot_Preset**: Predefined time ranges like "Morning: 7:30-11:00" or "Afternoon: 13:00-17:00"
- **Available_Staff**: Staff members who have active work shifts during the selected work order time period
- **Work_Shift**: A scheduled period when a staff member is on duty and available for work assignments

## Requirements

### Requirement 1: Customer Service Request Submission

**User Story:** As a customer, I want to submit service requests from my account, so that I can request vehicle services conveniently online.

#### Acceptance Criteria

1. WHEN a customer is logged in, THE System SHALL display a service request submission form
2. THE Form SHALL require customer information, vehicle details, requested service selection, preferred date, preferred time, and optional notes
3. WHEN a customer submits the form with all required fields, THE System SHALL save the service request to the database
4. WHEN a service request is saved, THE System SHALL send the request to the Admin_Area
5. WHEN a service request is saved, THE System SHALL send a Confirmation_Email to the customer
6. THE Confirmation_Email SHALL contain acknowledgment text and request the customer to wait for a response

### Requirement 2: Admin Service Request Review

**User Story:** As an admin, I want to view all incoming service requests, so that I can review and respond to customer requests.

#### Acceptance Criteria

1. THE Admin_Area SHALL display all service requests in a list view
2. WHEN an admin selects a service request, THE System SHALL display customer contact information, vehicle details, requested service, preferred date and time, and customer notes
3. THE System SHALL allow the admin to accept or reject the service request
4. WHEN an admin rejects a service request, THE System SHALL update the request status to rejected

### Requirement 3: Service Request Acceptance and Work Order Creation

**User Story:** As an admin, I want to accept service requests and convert them into work orders with time-based staff filtering, so that I can assign only available staff to scheduled work.

#### Acceptance Criteria

1. WHEN an admin accepts a service request, THE System SHALL allow the admin to enter a price quote, internal notes, scheduled start time, and scheduled end time
2. THE System SHALL provide Time_Slot_Presets including "Morning: 7:30-11:00", "Afternoon: 13:00-17:00", and "Custom"
3. WHEN an admin selects a Time_Slot_Preset, THE System SHALL populate the scheduled start time and end time fields
4. WHEN an admin enters or selects a scheduled time period, THE System SHALL query all staff members who have Work_Shifts overlapping with that time period
5. THE System SHALL display only Available_Staff in the staff assignment selection list
6. THE System SHALL allow the admin to assign zero, one, or multiple staff members to the work order
7. WHEN an admin completes the acceptance process, THE System SHALL create a Work_Order with Request_Source set to customer_request
8. WHEN a Work_Order is created from a service request with assigned staff, THE System SHALL make it visible in the Staff_Area for all assigned staff members
9. WHEN a Work_Order is created from a service request with no assigned staff, THE System SHALL make it visible only in the Admin_Area unassigned work orders list

### Requirement 4: Direct Work Order Entry

**User Story:** As an admin, I want to create work orders directly with time-based staff filtering, so that I can handle walk-in customers and assign only available staff.

#### Acceptance Criteria

1. THE Admin_Area SHALL provide a direct work order creation form
2. THE Form SHALL require vehicle information, service details, scheduled start time, and scheduled end time
3. THE Form SHALL provide Time_Slot_Presets for quick time selection
4. THE Form SHALL allow optional customer information entry
5. WHEN an admin enters or selects a scheduled time period, THE System SHALL query all staff members who have Work_Shifts overlapping with that time period
6. THE System SHALL display only Available_Staff in the staff assignment selection list
7. THE System SHALL allow the admin to assign zero, one, or multiple staff members
8. WHEN an admin submits the form, THE System SHALL create a Work_Order with Request_Source set to direct_entry
9. WHEN a Work_Order is created directly with assigned staff, THE System SHALL make it visible in the Staff_Area for all assigned staff members
10. WHEN a Work_Order is created directly with no assigned staff, THE System SHALL make it visible only in the Admin_Area unassigned work orders list

### Requirement 5: Work Order Scheduling

**User Story:** As an admin, I want to set time periods for work orders, so that staff know when to complete the work.

#### Acceptance Criteria

1. THE System SHALL require a scheduled start time and scheduled end time for every Work_Order
2. THE System SHALL validate that the scheduled end time is after the scheduled start time
3. THE System SHALL allow custom time entry when the admin selects "Custom" from Time_Slot_Presets
4. THE System SHALL display the scheduled time period prominently in the Staff_Area

### Requirement 6: Staff Work Order Assignment with Shift Filtering

**User Story:** As an admin, I want to assign work orders only to staff who are scheduled to work during the work order time period, so that assignments are realistic and feasible.

#### Acceptance Criteria

1. THE System SHALL require the admin to select a scheduled time period before displaying the staff assignment list
2. WHEN an admin selects a scheduled time period, THE System SHALL query the work_shifts table for all staff members with shifts overlapping that time period
3. THE System SHALL calculate shift overlap as: WHERE shift_start_time < work_order_end_time AND shift_end_time > work_order_start_time
4. THE System SHALL display only Available_Staff who have overlapping shifts in the staff selection UI
5. THE System SHALL allow the admin to assign zero, one, or multiple Available_Staff members to the work order
6. THE System SHALL store all assigned staff IDs in the assigned_staff_ids array field
7. WHEN a staff member is logged in, THE Staff_Area SHALL display only work orders where the staff member is in the assigned_staff_ids array
8. THE System SHALL prevent staff members from accessing work orders where they are not in the assigned_staff_ids array
9. WHEN a work order has an empty assigned_staff_ids array, THE System SHALL not display it in any Staff_Area

### Requirement 7: Work Order Status Tracking

**User Story:** As a staff member, I want to update work order status, so that others can track my progress.

#### Acceptance Criteria

1. THE System SHALL initialize new work orders with Work_Order_Status set to pending
2. WHEN an admin accepts a service request, THE System SHALL set Work_Order_Status to accepted
3. THE Staff_Area SHALL allow assigned staff to change Work_Order_Status from accepted to in_progress
4. THE Staff_Area SHALL allow assigned staff to change Work_Order_Status from in_progress to completed
5. THE System SHALL record the timestamp when Work_Order_Status changes to completed

### Requirement 8: Work Order Auto-Expiration

**User Story:** As an admin, I want work orders to auto-expire if not completed on time, so that overdue work is clearly identified.

#### Acceptance Criteria

1. WHEN the current time passes the scheduled end time AND Work_Order_Status is not completed, THE System SHALL change Work_Order_Status to expired
2. THE System SHALL check for expired work orders every 5 minutes
3. WHEN a Work_Order is expired, THE Staff_Area SHALL display an expiration indicator
4. THE System SHALL allow staff to change Work_Order_Status from expired to completed
5. THE System SHALL record the completion timestamp even when a Work_Order is completed after expiration

### Requirement 9: Staff Area Work Order Display

**User Story:** As a staff member, I want to see my assigned work orders with clear scheduling information, so that I can plan my work.

#### Acceptance Criteria

1. THE Staff_Area SHALL display only work orders assigned to the logged-in staff member
2. THE System SHALL display scheduled start time and scheduled end time prominently for each work order
3. THE System SHALL display vehicle information, service details, and customer notes for each work order
4. WHEN a work order is within 30 minutes of its scheduled end time AND Work_Order_Status is not completed, THE Staff_Area SHALL display a warning indicator
5. THE Staff_Area SHALL allow sorting work orders by scheduled start time

### Requirement 10: Work Order Data Model

**User Story:** As a developer, I want a unified data model for work orders, so that the system handles all work order types consistently.

#### Acceptance Criteria

1. THE System SHALL store work orders with these required fields: id, scheduled_start_time, scheduled_end_time, assigned_staff_ids array, request_source (customer_request or direct_entry), vehicle_info, service_details, work_order_status, created_at, created_by_admin_id
2. THE System SHALL store these optional fields: customer_id, customer_name, customer_phone, customer_email, price_quote, admin_notes
3. WHEN Request_Source is customer_request, THE System SHALL require customer_id
4. WHEN Request_Source is direct_entry, THE System SHALL allow customer_id to be null
5. THE System SHALL maintain referential integrity between work orders and assigned staff members

### Requirement 11: Email Notification System

**User Story:** As a customer, I want to receive confirmation when I submit a service request, so that I know my request was received.

#### Acceptance Criteria

1. WHEN a customer submits a service request, THE System SHALL send a Confirmation_Email within 30 seconds
2. THE Confirmation_Email SHALL include the customer's email address in the recipient field
3. THE Confirmation_Email SHALL contain the text "Thank you for your service request. We have received your request and will contact you shortly."
4. THE Confirmation_Email SHALL include the service request details: vehicle information, requested service, and preferred date and time
5. IF email sending fails, THE System SHALL log the error and still save the service request

### Requirement 12: Staff Shift Availability Filtering

**User Story:** As an admin, I want the system to show only staff members who are scheduled to work during the selected time period, so that I can assign work to available staff only.

#### Acceptance Criteria

1. THE System SHALL use the existing work_shifts table to determine staff availability
2. WHEN an admin selects a work order time period, THE System SHALL query work_shifts WHERE shift_start_time < work_order_end_time AND shift_end_time > work_order_start_time
3. THE System SHALL filter the staff selection list to show only staff members with matching shifts
4. WHEN no staff members have shifts during the selected time period, THE System SHALL display a message "No staff available during this time period"
5. THE System SHALL allow the admin to proceed with creating a work order even when no Available_Staff exist
6. THE System SHALL recalculate Available_Staff whenever the admin changes the scheduled start time or scheduled end time

