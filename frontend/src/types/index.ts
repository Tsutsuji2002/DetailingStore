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
export interface ScheduleShift {
  id: string;
  staffId: string;
  staffName?: string;
  date: string;
  shift: 'morning' | 'afternoon' | 'full';
  notes?: string;
  startTime?: string;
  endTime?: string;
  color?: string;
}

export type WorkShift = ScheduleShift;

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
}

export interface ChatChannel {
  id: string;
  name: string;
  description?: string;
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
