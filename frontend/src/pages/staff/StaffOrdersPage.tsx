import React, { useState, useEffect } from 'react';
import { FiShoppingBag, FiSearch, FiCheckCircle, FiClock, FiTruck, FiXCircle, FiEye, FiPhone, FiMapPin, FiCalendar, FiDollarSign } from 'react-icons/fi';
import StaffLayout from '@/components/layout/StaffLayout';
import Pagination from '@/components/ui/Pagination';
import { orderStorage, type UserOrder } from '@/utils/orderStorage';
import '@/pages/admin/DashboardPage.css';
import '@/styles/admin-common.css';

const STATUS_OPTIONS = [
  'Đang xử lý',
  'Đã xác nhận',
  'Đang giao',
  'Hoàn thành',
  'Đã hủy',
];

const StaffOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<UserOrder | null>(null);
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
    orderStorage.updateOrderStatus(orderId, newStatus);
    loadOrders();
    setSuccessMsg(`Cập nhật trạng thái đơn #${orderId.substring(0, 8)} thành "${newStatus}"`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Đang xử lý': return 'badge-pending';
      case 'Đã xác nhận': return 'badge-confirmed';
      case 'Đang giao': return 'badge-shipping';
      case 'Hoàn thành': return 'badge-completed';
      case 'Đã hủy': return 'badge-cancelled';
      default: return 'badge-pending';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Đang xử lý': return <FiClock />;
      case 'Đã xác nhận': return <FiCheckCircle />;
      case 'Đang giao': return <FiTruck />;
      case 'Hoàn thành': return <FiCheckCircle />;
      case 'Đã hủy': return <FiXCircle />;
      default: return <FiClock />;
    }
  };

  let filteredOrders = orders.filter(o => {
    const matchesSearch = searchQuery === '' ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.phone.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'all' || o.status === activeTab;
    return matchesSearch && matchesTab;
  });

  filteredOrders = filteredOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Đang xử lý').length,
    confirmed: orders.filter(o => o.status === 'Đã xác nhận').length,
    shipping: orders.filter(o => o.status === 'Đang giao').length,
    completed: orders.filter(o => o.status === 'Hoàn thành').length,
    cancelled: orders.filter(o => o.status === 'Đã hủy').length,
  };

  return (
    <StaffLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title"><FiShoppingBag /> Quản Lý Đơn Hàng</h1>
          <p className="admin-page-subtitle">Theo dõi, xử lý các đơn hàng từ khách hàng</p>
        </div>
      </div>

      {successMsg && (
        <div className="toast-success" style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'var(--success-light)', color: 'var(--success)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiCheckCircle /> {successMsg}
        </div>
      )}

      <div className="admin-stats-grid">
        {[
          { label: 'Tổng đơn hàng', value: stats.total, icon: '📦', color: '#3b82f6' },
          { label: 'Đang xử lý', value: stats.pending, icon: '⏳', color: '#f59e0b' },
          { label: 'Đã xác nhận', value: stats.confirmed, icon: '✅', color: '#10b981' },
          { label: 'Đang giao', value: stats.shipping, icon: '🚚', color: '#8b5cf6' },
        ].map((s, i) => (
          <div key={i} className="admin-stat-card">
            <div className="stat-icon" style={{ background: `${s.color}15`, color: s.color }}>{s.icon}</div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm theo mã đơn, tên KH, số ĐT..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="tabs-nav">
          <button className={activeTab === 'all' ? 'active' : ''} onClick={() => setActiveTab('all')}>
            Tất cả ({stats.total})
          </button>
          <button className={activeTab === 'Đang xử lý' ? 'active' : ''} onClick={() => setActiveTab('Đang xử lý')}>
            Đang xử lý ({stats.pending})
          </button>
          <button className={activeTab === 'Đã xác nhận' ? 'active' : ''} onClick={() => setActiveTab('Đã xác nhận')}>
            Đã xác nhận ({stats.confirmed})
          </button>
          <button className={activeTab === 'Đang giao' ? 'active' : ''} onClick={() => setActiveTab('Đang giao')}>
            Đang giao ({stats.shipping})
          </button>
          <button className={activeTab === 'Hoàn thành' ? 'active' : ''} onClick={() => setActiveTab('Hoàn thành')}>
            Hoàn thành ({stats.completed})
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>MÃ ĐƠN HÀNG</th>
                <th>KHÁCH HÀNG</th>
                <th>ĐỊA CHỈ GIAO HÀNG</th>
                <th>SẢN PHẨM</th>
                <th>TỔNG TIỀN</th>
                <th>TRẠNG THÁI</th>
                <th>HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Không tìm thấy đơn hàng nào</td></tr>
              ) : (
                (() => {
                  const paginated = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);
                  return paginated.map(o => {
                    const badge = getStatusBadgeClass(o.status);
                    return (
                      <tr key={o.id}>
                        <td><strong>#{o.id.substring(0, 8)}</strong><br /><small style={{ color: 'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleString('vi-VN')}</small></td>
                        <td>
                          {o.customerName}<br />
                          <small style={{ color: 'var(--text-muted)' }}><FiPhone size={12} /> {o.phone}</small>
                        </td>
                        <td style={{ maxWidth: 200 }}>
                          <small><FiMapPin size={12} /> {o.address}</small>
                        </td>
                        <td>
                          {o.items && o.items.length > 0 ? (
                            <details>
                              <summary style={{ cursor: 'pointer', color: 'var(--accent-primary)' }}>
                                {o.items.reduce((sum, item) => sum + item.quantity, 0)} món
                              </summary>
                              <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem', fontSize: '0.85rem' }}>
                                {o.items.map((item, idx) => (
                                  <li key={idx}>{item.name} x{item.quantity}</li>
                                ))}
                              </ul>
                            </details>
                          ) : 'N/A'}
                        </td>
                        <td><strong style={{ color: 'var(--accent-primary)' }}>{o.total.toLocaleString('vi-VN')}₫</strong></td>
                        <td>
                          <span className={`status-badge ${badge}`}>
                            {getStatusIcon(o.status)} {o.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn-icon-sm" onClick={() => setSelectedOrder(o)} title="Xem chi tiết">
                            <FiEye />
                          </button>
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
          onPageSizeChange={(newSize) => { setPageSize(newSize); setCurrentPage(1); }}
        />
      </div>

      {selectedOrder && (
        <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content order-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi Tiết Đơn Hàng #{selectedOrder.id.substring(0, 8)}</h2>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="order-detail-grid">
                <div className="order-info-section">
                  <h3><FiCalendar /> Thông Tin Đơn Hàng</h3>
                  <div className="info-row">
                    <span>Mã đơn:</span> <strong>#{selectedOrder.id}</strong>
                  </div>
                  <div className="info-row">
                    <span>Ngày đặt:</span> {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                  </div>
                  <div className="info-row">
                    <span>Trạng thái:</span>
                    <select
                      value={selectedOrder.status}
                      onChange={e => handleStatusChange(selectedOrder.id, e.target.value)}
                      className="status-select"
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="order-info-section">
                  <h3><FiPhone /> Thông Tin Khách Hàng</h3>
                  <div className="info-row">
                    <span>Tên:</span> <strong>{selectedOrder.customerName}</strong>
                  </div>
                  <div className="info-row">
                    <span>Số ĐT:</span> {selectedOrder.phone}
                  </div>
                  <div className="info-row">
                    <span>Địa chỉ:</span> {selectedOrder.address}
                  </div>
                </div>
              </div>

              <div className="order-info-section">
                <h3><FiShoppingBag /> Sản Phẩm</h3>
                <div className="order-items-list">
                  {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="order-item-row">
                      <div className="item-info">
                        <strong>{item.name}</strong>
                        <small>Số lượng: {item.quantity}</small>
                      </div>
                      <div className="item-price">{(item.price * item.quantity).toLocaleString('vi-VN')}₫</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-total-row">
                <span><FiDollarSign /> Tổng cộng:</span>
                <strong>{selectedOrder.total.toLocaleString('vi-VN')}₫</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
};

export default StaffOrdersPage;
