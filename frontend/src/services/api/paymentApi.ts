const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5080/api';

function getToken(): string | null {
  return (
    localStorage.getItem('auth_token') ||
    localStorage.getItem('motoshine_token') ||
    localStorage.getItem('token')
  );
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.message || data?.title || 'Đã có lỗi xảy ra khi gọi máy chủ.';
    throw new Error(errorMsg);
  }

  return data as T;
}

// TypeScript interfaces for payment-related data structures

/**
 * Response from payment initiation endpoint
 */
export interface InitiatePaymentResponse {
  transactionId: string;
  requestId: string;
  orderId: string;
  paymentUrl: string;
  qrCodeUrl: string;
  amount: number;
}

/**
 * Response from payment status query endpoint
 */
export interface PaymentStatusResponse {
  transactionId: string;
  status: string;
  amount: number;
  createdAt: string;
  completedAt?: string;
  paymentUrl?: string;
  qrCodeUrl?: string;
}

/**
 * Payment transaction data model
 */
export interface PaymentTransaction {
  id: string;
  requestId: string;
  orderId: string;
  bookingId?: string;
  productOrderId?: string;
  amount: number;
  status: 'Pending' | 'Success' | 'Failed' | 'Cancelled' | 'Expired';
  paymentMethod: string;
  momoTransId?: number;
  resultCode?: number;
  resultMessage?: string;
  paymentUrl?: string;
  qrCodeUrl?: string;
  createdAt: string;
  completedAt?: string;
}

/**
 * Wrapped API response format used by backend
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export const paymentApi = {
  /**
   * Initiate payment for a service booking
   * @param bookingId - The booking ID to pay for
   * @returns Payment initiation response with QR code URL
   */
  async initiateBookingPayment(bookingId: string): Promise<InitiatePaymentResponse> {
    const response = await request<ApiResponse<InitiatePaymentResponse>>(
      `/payment/bookings/${bookingId}/initiate`,
      {
        method: 'POST',
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to initiate booking payment');
    }

    return response.data;
  },

  /**
   * Initiate payment for a product order
   * @param orderId - The order ID to pay for
   * @returns Payment initiation response with QR code URL
   */
  async initiateOrderPayment(orderId: string): Promise<InitiatePaymentResponse> {
    const response = await request<ApiResponse<InitiatePaymentResponse>>(
      `/payment/orders/${orderId}/initiate`,
      {
        method: 'POST',
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to initiate order payment');
    }

    return response.data;
  },

  /**
   * Get payment status by order ID
   * @param orderId - The Momo order ID to query
   * @returns Payment status response
   */
  async getPaymentStatus(orderId: string): Promise<PaymentStatusResponse> {
    const response = await request<ApiResponse<PaymentStatusResponse>>(
      `/payment/status/${orderId}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get payment status');
    }

    return response.data;
  },
};
