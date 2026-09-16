/**
 * orderStorage.ts
 * Manages saving and retrieving user orders in localStorage
 */

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface UserOrder {
  id: string;
  date: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  itemsSummary: string;
  total: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

const ORDERS_STORAGE_KEY = 'detailing_store_user_orders';

const SAMPLE_INITIAL_ORDERS: UserOrder[] = [
  {
    id: '61-893102',
    date: '2026-08-29',
    customerName: 'Trần Văn Khang',
    phone: '0923456789',
    address: 'Phường 12, Quận 10, Thành phố Hồ Chí Minh',
    items: [
      { id: 'p1', name: 'Nhớt Honda Ultra Gold 10W-30', price: 95000, quantity: 2, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
      { id: 'p3', name: 'Bộ Hóa Chất Detailing CarPro Set', price: 580000, quantity: 1, image: 'https://images.unsplash.com/photo-1607349913338-fca6f58f34cd?w=400' },
    ],
    itemsSummary: 'Nhớt Honda Ultra Gold 10W-30 (x2), Bộ Hóa Chất Detailing CarPro Set (x1)',
    total: 770000,
    paymentMethod: 'COD',
    status: 'Đang xử lý',
    createdAt: new Date().toISOString(),
  },
  {
    id: '61-754291',
    date: '2026-08-28',
    customerName: 'Nguyễn Thị Hoa',
    phone: '0987654321',
    address: 'Phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh',
    items: [
      { id: 'p4', name: 'Lốp Michelin Pilot Street 2 100/80-14', price: 890000, quantity: 1, image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400' },
    ],
    itemsSummary: 'Lốp Michelin Pilot Street 2 100/80-14 (x1)',
    total: 890000,
    paymentMethod: 'Banking',
    status: 'Đã xác nhận',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const orderStorage = {
  getOrders: (): UserOrder[] => {
    try {
      const data = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      } else {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(SAMPLE_INITIAL_ORDERS));
        return SAMPLE_INITIAL_ORDERS;
      }
    } catch (e) {
      console.error('Failed to parse saved orders', e);
    }
    return SAMPLE_INITIAL_ORDERS;
  },

  saveOrder: (newOrder: UserOrder): UserOrder[] => {
    try {
      const currentOrders = orderStorage.getOrders();
      const updated = [newOrder, ...currentOrders];
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to save order', e);
      return [];
    }
  },

  updateOrderStatus: (orderId: string, newStatus: string): UserOrder[] => {
    try {
      const orders = orderStorage.getOrders();
      const updated = orders.map(o => (o.id === orderId ? { ...o, status: newStatus } : o));
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to update order status', e);
      return [];
    }
  },

  deleteOrder: (orderId: string): UserOrder[] => {
    try {
      const orders = orderStorage.getOrders();
      const updated = orders.filter(o => o.id !== orderId);
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to delete order', e);
      return [];
    }
  },
};
