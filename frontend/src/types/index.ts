// ── Auth & Theme Types ──
export type UserRole = 'customer' | 'staff' | 'admin';
export type ThemeMode = 'light' | 'dark' | 'dim';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  avatar?: string;    // used by sampleData / legacy
  avatarUrl?: string; // returned by real backend API
  role: UserRole;
  phone?: string;
  address?: string;
  authProvider?: string;
  hasPassword?: boolean;
  createdAt: string;
}

export interface UserAddress {
  id: string;
  label?: string; // e.g. "Nhà riêng", "Văn phòng"
  receiverName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  streetAddress: string;
  isDefault?: boolean;
}

// ── Service Types ──
export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  category?: ServiceCategory;
  description: string;
  shortDescription: string;
  priceFrom: number;
  priceTo?: number;
  duration?: string;
  images: string[];
  videoUrl?: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type ServiceItem = Service;

// ── Product Types ──
export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  category?: ProductCategory;
  description: string;
  shortDescription: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: string[];
  brand?: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type ProductItem = Product;

// ── Post Types ──
export type PostMediaType = 'image' | 'video' | 'text';

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  mediaType: PostMediaType;
  mediaUrls?: string[];
  coverImage?: string;
  authorId: string;
  author?: User;
  tags: string[];
  likes: number;
  commentCount: number;
  isLiked?: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type PostItem = Post;

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author?: User;
  content: string;
  likes: number;
  isLiked?: boolean;
  createdAt: string;
}

// ── Job Types ──
export interface Job {
  id: string;
  title: string;
  type: 'fulltime' | 'parttime' | 'apprentice' | 'full-time' | 'part-time';
  salary?: string;
  location?: string;
  department?: string;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  isActive: boolean;
  deadline?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type JobPosition = Job;

// ── Cart Types ──
export interface CartItem {
  product: Product;
  quantity: number;
}

// ── Notification Types ──
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'order' | 'message';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

// ── Schedule Types ──
export interface WorkShiftConfig {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  icon?: string;
  color?: string;
  isActive: boolean;
}

export interface ScheduleShift {
  id: string;
  staffId: string;
  shiftTypeId: string;
  date: string;
  notes?: string;
  createdAt?: string;
}

export type WorkShift = ScheduleShift;

// ── Vehicle Booking / Work Order Types ──
export type BookingStatusType = 'Pending' | 'Confirmed' | 'InProgress' | 'Completed' | 'Cancelled' | 'pending' | 'in_progress' | 'completed';

export interface ServiceBooking {
  id: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  licensePlate: string;
  vehicleModel: string;
  serviceId: string;
  serviceName?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  assignedStaffAvatar?: string;
  bookingDate: string;
  bookingTime: string;
  status: BookingStatusType;
  notes?: string;
  estimatedCompletion?: string;
  totalPrice?: number;
  createdAt?: string;
}

// ── Chat Types ──
export interface ChatMessage {
  id: string;
  channelId?: string;
  conversationId?: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  senderRole?: string;
  content: string;
  mediaUrls?: string[];
  isRead?: boolean;
  createdAt?: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'error';
  tempId?: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  description?: string;
  isPublic?: boolean;
  isDirect?: boolean;
  creatorId?: string;
  memberIds?: string[];
  unreadCount?: number;
}

export interface ChatConversation {
  id: string;
  participants: User[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
}

// ── Mechanic Docs ──
export interface MechanicDoc {
  id: string;
  title: string;
  brand: string;
  vehicleModel: string;
  bikeModel?: string;
  category: string;
  errorCode?: string;
  symptoms: string;
  contentHtml?: string;
  solutionSteps: string[];
  diagrams?: string[];
  attachments?: string[];
  videoUrl?: string;
  tags?: string[];
  createdBy?: string;
  createdAt?: string;
  updatedAt: string;
}

// ── Contact/Info ──
export interface ShopInfo {
  name: string;
  logoIcon?: string;
  logoUrl?: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  mapEmbedUrl: string;
  workingHours: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    zalo?: string;
    youtube?: string;
  };
}

// ── Service Request & Work Order Types ──

// Enums
export type ServiceRequestStatus = 'Pending' | 'Accepted' | 'Rejected';
export type WorkOrderStatus = 'Pending' | 'Accepted' | 'Rejected' | 'InProgress' | 'Completed' | 'Expired';
export type RequestSource = 'CustomerRequest' | 'DirectEntry';

// Shared types
export interface VehicleInfoDto {
  licensePlate: string;
  model: string;
  year?: number;
}

export interface StaffSummaryDto {
  id: string;
  name: string;
  profilePicture?: string;
}

export interface StaffShiftInfoDto {
  shiftTypeName: string;
  shiftStartTime: string;
  shiftEndTime: string;
}

export interface AvailableStaffDto {
  staffId: string;
  staffName: string;
  profilePicture?: string;
  matchingShifts: StaffShiftInfoDto[];
}

// Service Request types
export interface CreateServiceRequestDto {
  licensePlate: string;
  vehicleModel: string;
  vehicleYear?: number;
  requestedServiceId: string;
  preferredDate: string; // DateOnly -> string (YYYY-MM-DD)
  preferredTime: string; // TimeOnly -> string (HH:mm:ss)
  customerPhone?: string;
  customerNotes?: string;
}

export interface ServiceRequestDto {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  vehicleInfo: VehicleInfoDto;
  requestedServiceId: string;
  requestedServiceName: string;
  preferredDate: string; // DateOnly -> string (YYYY-MM-DD)
  preferredTime: string; // TimeOnly -> string (HH:mm:ss)
  customerNotes?: string;
  status: ServiceRequestStatus;
  createdAt: string; // DateTime -> string (ISO 8601)
}

export interface ServiceRequestDetailDto extends ServiceRequestDto {
  reviewedAt?: string; // DateTime -> string (ISO 8601)
  reviewedByAdminId?: string;
  reviewedByAdminName?: string;
}

export interface AcceptServiceRequestDto {
  scheduledStartTime: string; // DateTime -> string (ISO 8601)
  scheduledEndTime: string; // DateTime -> string (ISO 8601)
  assignedStaffIds: string[];
  priceQuote?: number;
  adminNotes?: string;
}

// Work Order types
export interface CreateWorkOrderDto {
  scheduledStartTime: string; // DateTime -> string (ISO 8601)
  scheduledEndTime: string; // DateTime -> string (ISO 8601)
  assignedStaffIds: string[];
  vehicleInfo: VehicleInfoDto;
  serviceDetails: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  priceQuote?: number;
  adminNotes?: string;
}

export interface WorkOrderDto {
  id: string;
  scheduledStartTime: string; // DateTime -> string (ISO 8601)
  scheduledEndTime: string; // DateTime -> string (ISO 8601)
  assignedStaffIds: string[];
  assignedStaff: StaffSummaryDto[];
  requestSource: RequestSource;
  vehicleInfo: VehicleInfoDto;
  serviceDetails: string;
  workOrderStatus: WorkOrderStatus;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  priceQuote?: number;
  adminNotes?: string;
  createdByAdminId: string;
  createdByAdminName: string;
  createdAt: string; // DateTime -> string (ISO 8601)
  completedAt?: string; // DateTime -> string (ISO 8601)
  isExpired: boolean;
  isExpiringSoon: boolean; // Within 30 minutes
}

export interface WorkOrderDetailDto extends WorkOrderDto {
  originServiceRequestId?: string;
}

export interface UpdateWorkOrderStatusDto {
  newStatus: WorkOrderStatus;
}
