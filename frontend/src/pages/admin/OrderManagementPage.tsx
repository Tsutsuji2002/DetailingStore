import React, { useState, useEffect } from 'react';
import { FiShoppingBag, FiSearch, FiCheckCircle, FiClock, FiTruck, FiXCircle, FiTrash2, FiEye, FiPhone, FiMapPin, FiCalendar, FiDollarSign } from 'react-icons/fi';
import AdminLayout from '@/components/layout/AdminLayout';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Pagination from '@/components/ui/Pagination';
import { orderStorage, type UserOrder } from '@/utils/orderStorage';
import { productStorage } from '@/utils/productStorage';
import { useAppDispatch } from '@/hooks/useAppStore';
import { fetchProductsThunk } from '@/features/productsSlice';

const STATUS_OPTIONS = [
  'Đang xử lý',
  'Đã xác nhận',
  'Đang giao',
  'Hoàn thành',
  'Đã hủy',
];

const OrderManagementPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<UserOrder | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<UserOrder | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadOrders = () => {
    setOrders(orderStorage.getOrders());
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = (orderId: string, newStatus: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    const oldStatus = targetOrder.status;

    // Handle stock quantity sync
    if (oldStatus !== 'Đã hủy' && newStatus === 'Đã hủy' && targetOrder.items) {
      productStorage.restoreStock(targetOrder.items);
      dispatch(fetchProductsThunk());
    } else if (oldStatus === 'Đã hủy' && newStatus !== 'Đã hủy' && targetOrder.items) {
      productStorage.deductStock(targetOrder.items);
      dispatch(fetchProductsThunk());
    }

    const updated = orderStorage.updateOrderStatus(orderId, newStatus);
    setOrders(updated);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
    setSuccessMsg(`Đã cập nhật trạng thái đơn #${orderId} sang "${newStatus}"`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDeleteConfirm = () => {
    if (!orderToDelete) return;
    if (orderToDelete.status !== 'Đã hủy' && orderToDelete.items) {
      productStorage.restoreStock(orderToDelete.items);
      dispatch(fetchProductsThunk());
    }
    const updated = orderStorage.deleteOrder(orderToDelete.id);
    setOrders(updated);
    if (selectedOrder?.id === orderToDelete.id) {
      setSelectedOrder(null);
    }
    setOrderToDelete(null);
    setSuccessMsg(`Đã xóa đơn hàng #${orderToDelete.id}`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Stats calculation
  const totalOrders = orders.length;
  const pendingCount = orders.filter(o => o.status === 'Đang xử lý').length;
  const shippingCount = orders.filter(o => o.status === 'Đang giao').length;
  const completedRevenue = orders
    .filter(o => o.status === 'Hoàn thành')
    .reduce((acc, o) => acc + o.total, 0);

  // Filter & Search
  const filteredOrders = orders.filter(o => {
    if (activeTab !== 'all' && o.status !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q) ||
        o.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Hoàn thành':
        return { bg: '#dcfce7', color: '#15803d', icon: <FiCheckCircle /> };
      case 'Đang giao':
        return { bg: '#e0f2fe', color: '#0369a1', icon: <FiTruck /> };
      case 'Đã xác nhận':
        return { bg: '#fef3c7', color: '#b45309', icon: <FiClock /> };
      case 'Đã hủy':
        return { bg: '#fee2e2', color: '#b91c1c', icon: <FiXCircle /> };
      default:
        return { bg: '#f3e8ff', color: '#6b21a8', icon: <FiClock /> };
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="admin-page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FiShoppingBag style={{ color: 'var(--accent-primary)' }} /> Quản Lý Đơn Hàng
          </h1>
          <p className="admin-page-sub">Theo dõi, duyệt và cập nhật trạng thái các đơn hàng từ khách hàng</p>
        </div>
      </div>

      {/* Alert toast */}
      {successMsg && (
        <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.75rem 1rem', borderRadius: 12, fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiCheckCircle /> {successMsg}
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 16, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(26,92,255,0.1)', color: '#1a5cff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
            <FiShoppingBag />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TỔNG ĐƠN HÀNG</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalOrders}</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 16, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(168,85,247,0.1)', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
            <FiClock />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>CẦN XỬ LÝ</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#9333ea' }}>{pendingCount}</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 16, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(3,105,161,0.1)', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
            <FiTruck />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ĐANG GIAO HÀNG</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0369a1' }}>{shippingCount}</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 16, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(21,128,61,0.1)', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
            <FiDollarSign />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>DOANH THU HOÀN THÀNH</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d' }}>{completedRevenue.toLocaleString('vi-VN')}₫</div>
          </div>
        </div>
      </div>

      {/* Toolbar: Search + Filter Tabs */}
      <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 16, border: '1px solid var(--border-color)', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: 2 }}>
          {['all', 'Đang xử lý', 'Đã xác nhận', 'Đang giao', 'Hoàn thành', 'Đã hủy'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 10,
                border: 'none',
                background: activeTab === tab ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: activeTab === tab ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {tab === 'all' ? 'Tất Cả Đơn' : tab}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: 280, maxWidth: '100%' }}>
          <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Tìm theo Mã đơn, Tên, SĐT..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem 0.5rem 2.2rem',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
            }}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã Đơn Hàng</th>
              <th>Khách Hàng</th>
              <th>Địa Chỉ Giao Hàng</th>
              <th>Sản Phẩm</th>
              <th>Tổng Tiền</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Không tìm thấy đơn hàng nào.
                </td>
              </tr>
            ) : (
              (() => {
                const paginated = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);
                return paginated.map(o => {
                  const badge = getStatusBadgeClass(o.status);
                  return (
                    <tr key={o.id}>
                      <td>
                        <strong style={{ color: 'var(--accent-primary)' }}>#{o.id}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <FiCalendar size={10} /> {o.date}
                        </div>
                      </td>

                      <td>
                        <strong style={{ color: 'var(--text-primary)' }}>{o.customerName}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <FiPhone size={11} /> {o.phone}
                        </div>
                      </td>

                      <td style={{ maxWidth: 220, fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={o.address}>
                          <FiMapPin size={11} style={{ marginRight: 4 }} />
                          {o.address}
                        </div>
                      </td>

                      <td style={{ maxWidth: 220, fontSize: '0.825rem' }}>
                        <div style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {o.itemsSummary || o.items?.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                        </div>
                      </td>

                      <td>
                        <strong style={{ color: '#15803d', fontSize: '0.95rem' }}>{o.total.toLocaleString('vi-VN')}₫</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.paymentMethod || 'COD'}</div>
                      </td>

                      <td>
                        <select
                          value={o.status}
                          onChange={e => handleStatusChange(o.id, e.target.value)}
                          style={{
                            background: badge.bg,
                            color: badge.color,
                            border: 'none',
                            padding: '0.35rem 0.75rem',
                            borderRadius: 20,
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            outline: 'none',
                          }}
                        >
                          {STATUS_OPTIONS.map(st => (
                            <option key={st} value={st} style={{ background: '#fff', color: '#333' }}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="btn-del-icon"
                            title="Xem Chi Tiết Đơn Hàng"
                          >
                            <FiEye />
                          </button>
                          <button
                            onClick={() => setOrderToDelete(o)}
                            className="btn-del-icon"
                            title="Xóa Đơn Hàng"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                });
              })()
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredOrders.length / pageSize) || 1}
        totalItems={filteredOrders.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={ps => { setPageSize(ps); setCurrentPage(1); }}
      />

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border-color)', width: '100%', maxWidth: 640, padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  📦 Chi Tiết Đơn Hàng #{selectedOrder.id}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ngày đặt: {selectedOrder.date}</div>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Customer Info Card */}
            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 12, marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>👤 Thông Tin Khách Hàng</div>
              <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', color: 'var(--text-secondary)' }}>
                <div><strong>Họ tên:</strong> {selectedOrder.customerName}</div>
                <div><strong>Số điện thoại:</strong> {selectedOrder.phone}</div>
                <div><strong>Địa chỉ nhận hàng:</strong> {selectedOrder.address}</div>
                <div><strong>Phương thức thanh toán:</strong> {selectedOrder.paymentMethod || 'COD (Thanh toán khi nhận hàng)'}</div>
              </div>
            </div>

            {/* Product Items List */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>🛒 Sản Phẩm Đặt Mua</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: 10 }}>
                    {item.image && (
                      <img src={item.image} alt={item.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{item.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {item.price.toLocaleString('vi-VN')}₫ x {item.quantity}
                      </div>
                    </div>
                    <strong style={{ color: 'var(--accent-primary)' }}>
                      {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                    </strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Total & Status Selector */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tổng thanh toán</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d' }}>
                  {selectedOrder.total.toLocaleString('vi-VN')}₫
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Trạng thái:</span>
                <select
                  value={selectedOrder.status}
                  onChange={e => handleStatusChange(selectedOrder.id, e.target.value)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 10,
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontWeight: 700,
                  }}
                >
                  {STATUS_OPTIONS.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!orderToDelete}
        title="Xác nhận xóa đơn hàng"
        message={orderToDelete ? `Bạn có chắc chắn muốn xóa đơn hàng #${orderToDelete.id} của khách hàng ${orderToDelete.customerName}?` : ''}
        confirmText="Xóa Đơn Hàng"
        cancelText="Hủy"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setOrderToDelete(null)}
      />
    </AdminLayout>
  );
};

export default OrderManagementPage;
