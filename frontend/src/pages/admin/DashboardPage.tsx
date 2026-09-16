import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiDollarSign,
  FiTrendingUp,
  FiCalendar,
  FiCheckCircle,
  FiPlus,
  FiTrash2,
  FiShoppingBag,
  FiPackage,
  FiTool,
  FiFileText,
  FiBriefcase,
  FiArrowRight,
  FiClock,
  FiAlertTriangle,
  FiEye,
  FiInbox,
  FiClipboard,
} from 'react-icons/fi';
import AdminLayout from '@/components/layout/AdminLayout';
import UserAvatar from '@/components/ui/UserAvatar';
import { orderStorage, type UserOrder } from '@/utils/orderStorage';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { fetchProductsThunk } from '@/features/productsSlice';
import { fetchServicesThunk } from '@/features/servicesSlice';
import { fetchPostsThunk } from '@/features/postsSlice';
import { fetchJobsThunk } from '@/features/jobsSlice';
import { fetchServiceRequests } from '@/features/serviceRequestsSlice';
import { fetchWorkOrders } from '@/features/workOrdersSlice';
import { fetchStaffUsersThunk } from '@/features/usersSlice';
import {
  fetchShiftConfigsThunk,
  fetchAssignedShiftsThunk,
  assignShiftThunk,
  deleteAssignedShiftThunk,
} from '@/features/workShiftsSlice';
import './DashboardPage.css';

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();

  // Redux Selectors
  const { items: products } = useAppSelector(s => s.products);
  const { items: services } = useAppSelector(s => s.services);
  const { items: posts } = useAppSelector(s => s.posts);
  const { items: jobs } = useAppSelector(s => s.jobs);

  // Users & Work Shifts Selectors
  const { staffUsers } = useAppSelector(s => s.users);
  const { items: serviceRequests, loading: srLoading } = useAppSelector(s => s.serviceRequests);
  const { items: workOrders } = useAppSelector(s => s.workOrders);
  const { configs, shifts: reduxShifts } = useAppSelector(s => s.workShifts);

  // Local Storage & Local State
  const [orders, setOrders] = useState<UserOrder[]>([]);

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [staffId, setStaffId] = useState('');
  const [selectedShiftTypeId, setSelectedShiftTypeId] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Combined Staff List from Redux
  const staffList = staffUsers || [];

  // Active Shifts List from Redux
  const displayShifts = reduxShifts || [];

  // Fetch all dashboard data on mount
  useEffect(() => {
    dispatch(fetchProductsThunk());
    dispatch(fetchServicesThunk());
    dispatch(fetchPostsThunk());
    dispatch(fetchJobsThunk(true));
    dispatch(fetchStaffUsersThunk());
    dispatch(fetchShiftConfigsThunk(true));
    dispatch(fetchServiceRequests());
    dispatch(fetchWorkOrders());
    dispatch(fetchAssignedShiftsThunk());
    setOrders(orderStorage.getOrders());
  }, [dispatch]);

  // Sync staffId default once staffList is loaded
  useEffect(() => {
    if (staffList.length > 0 && (!staffId || !staffList.some(u => u.id === staffId))) {
      setStaffId(staffList[0].id);
    }
  }, [staffList, staffId]);

  // Sync shiftTypeId default once configs are loaded
  useEffect(() => {
    if (configs.length > 0 && (!selectedShiftTypeId || !configs.some(c => c.id === selectedShiftTypeId))) {
      setSelectedShiftTypeId(configs[0].id);
    }
  }, [configs, selectedShiftTypeId]);

  const handleAddShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId) return;

    try {
      const shiftTypeId = selectedShiftTypeId || (configs[0]?.id || 'morning');
      await dispatch(
        assignShiftThunk({
          staffId,
          shiftTypeId,
          date: selectedDate,
          notes: notes || undefined,
        })
      ).unwrap();
      setNotes('');
    } catch (err: any) {
      console.error('Lỗi khi phân ca trực:', err);
    }
  };

  const handleDeleteShift = async (id: string) => {
    try {
      await dispatch(deleteAssignedShiftThunk(id)).unwrap();
    } catch (err: any) {
      console.error('Lỗi khi xóa ca trực:', err);
    }
  };

  // Dynamic Calculated Real Statistics
  const validOrders = orders.filter(o => o.status !== 'Đã hủy');
  const totalRevenue = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'Đang xử lý').length;
  const completedOrdersCount = orders.filter(o => o.status === 'Hoàn thành').length;
  const lowStockProductsCount = products.filter(p => (p.stock ?? 0) <= 5).length;
  const activeServicesCount = services.filter(s => s.isActive).length;
  const publishedPostsCount = posts.length;
  const activeJobsCount = jobs.filter(j => j.isActive).length;

  const recentOrders = orders.slice(0, 5);

  // Service request & work order stats
  const pendingServiceRequests = serviceRequests.filter(r => r.status === 'Pending');
  const recentServiceRequests = pendingServiceRequests.slice(0, 4);
  const activeWorkOrders = workOrders.filter(w => w.workOrderStatus === 'Pending' || w.workOrderStatus === 'Accepted' || w.workOrderStatus === 'InProgress');

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Báo Cáo Tổng Quan & Quản Lý Lịch Trực</h1>
          <p className="admin-page-sub">Theo dõi dữ liệu doanh thu thực tế, kho hàng, đơn hàng & xếp lịch làm việc thợ</p>
        </div>
      </div>

      {/* Real-Data Financial & System Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-income">
          <div className="sc-header">
            <span>Doanh Thu Đơn Hàng</span>
            <span className="sc-icon" style={{ color: 'var(--accent-primary)' }}><FiDollarSign /></span>
          </div>
          <div className="sc-value">{totalRevenue.toLocaleString('vi-VN')}₫</div>
          <div className="sc-sub positive">
            <FiTrendingUp /> Dựa trên {validOrders.length} đơn hàng hợp lệ
          </div>
        </div>

        <div className="stat-card stat-outcome">
          <div className="sc-header">
            <span>Tổng Đơn Hàng</span>
            <span className="sc-icon" style={{ color: '#3b82f6' }}><FiShoppingBag /></span>
          </div>
          <div className="sc-value">{orders.length} Đơn</div>
          <div className="sc-sub neutral">
            <FiClock /> {pendingOrdersCount} đơn đang xử lý • {completedOrdersCount} xong
          </div>
        </div>

        <div className="stat-card stat-profit">
          <div className="sc-header">
            <span>Sản Phẩm Trong Kho</span>
            <span className="sc-icon" style={{ color: '#8b5cf6' }}><FiPackage /></span>
          </div>
          <div className="sc-value">{products.length} Sản phẩm</div>
          <div className="sc-sub" style={{ color: lowStockProductsCount > 0 ? '#dc2626' : 'var(--success)' }}>
            {lowStockProductsCount > 0 ? (
              <><FiAlertTriangle /> {lowStockProductsCount} sản phẩm sắp hết hàng</>
            ) : (
              <><FiCheckCircle /> Tồn kho đảm bảo</>
            )}
          </div>
        </div>

        <div className="stat-card stat-jobs">
          <div className="sc-header">
            <span>Dịch Vụ & Bài Viết</span>
            <span className="sc-icon" style={{ color: '#10b981' }}><FiTool /></span>
          </div>
          <div className="sc-value">{activeServicesCount} Dịch vụ</div>
          <div className="sc-sub neutral">
            <FiFileText /> {publishedPostsCount} bài viết • {activeJobsCount} vị trí tuyển
          </div>
        </div>
      </div>

      {/* Dashboard Quick Navigation Modules */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { title: 'Quản Lý Đơn Hàng', icon: <FiShoppingBag />, link: '/admin/orders', color: '#3b82f6', desc: `${orders.length} Đơn` },
          { title: 'Quản Lý Sản Phẩm', icon: <FiPackage />, link: '/admin/products', color: '#8b5cf6', desc: `${products.length} Món` },
          { title: 'Bảng Giá Dịch Vụ', icon: <FiTool />, link: '/admin/services', color: '#10b981', desc: `${services.length} Gói` },
          { title: 'Bài Viết & Tin Tức', icon: <FiFileText />, link: '/admin/posts', color: '#f59e0b', desc: `${posts.length} Bài` },
          { title: 'Tuyển Dụng', icon: <FiBriefcase />, link: '/admin/recruitment', color: '#ec4899', desc: `${jobs.length} Tin` },
        ].map(item => (
          <Link
            key={item.title}
            to={item.link}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 14,
              padding: '1rem',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.25rem', color: item.color }}>{item.icon}</span>
              <FiArrowRight style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }} />
            </div>
            <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{item.title}</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.desc}</span>
          </Link>
        ))}
      </div>

      {/* Main 2-Column Dashboard Grid */}
      <div className="dashboard-content-grid">
        {/* Recent Orders List Widget */}
        <div className="dashboard-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 className="card-title" style={{ margin: 0 }}>
              <FiShoppingBag style={{ color: 'var(--accent-primary)' }} /> Đơn Hàng Mới Nhất
            </h3>
            <Link to="/admin/orders" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              Xem tất cả <FiArrowRight />
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã Đơn</th>
                  <th>Khách Hàng</th>
                  <th>Tổng Tiền</th>
                  <th>Trạng Thái</th>
                  <th>Xem</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      Chưa có đơn hàng nào.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map(o => (
                    <tr key={o.id}>
                      <td>
                        <strong style={{ color: 'var(--accent-primary)' }}>#{o.id}</strong>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{o.date}</div>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--text-primary)' }}>{o.customerName}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.phone}</div>
                      </td>
                      <td>
                        <strong style={{ color: '#15803d' }}>{o.total.toLocaleString('vi-VN')}₫</strong>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.2em 0.5em',
                            borderRadius: 9999,
                            background:
                              o.status === 'Hoàn thành'
                                ? '#dcfce7'
                                : o.status === 'Đã hủy'
                                ? '#fee2e2'
                                : '#fef3c7',
                            color:
                              o.status === 'Hoàn thành'
                                ? '#15803d'
                                : o.status === 'Đã hủy'
                                ? '#b91c1c'
                                : '#b45309',
                          }}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td>
                        <Link to="/admin/orders" className="btn-del-icon" title="Đến Quản Lý Đơn Hàng">
                          <FiEye />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Schedule Editor Widget with Real WorkShift & Staff Data */}
        <div className="dashboard-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 className="card-title" style={{ margin: 0 }}>
              <FiCalendar style={{ color: 'var(--accent-primary)' }} /> Phân Ca Làm Việc Kỹ Thuật Viên
            </h3>
            <Link to="/admin/schedule" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              Quản lý ca <FiArrowRight />
            </Link>
          </div>

          {/* Add shift form */}
          <form onSubmit={handleAddShift} className="add-shift-form">
            <div className="form-row-2">
              <div>
                <label>Chọn Nhân Viên / Thợ *</label>
                <select value={staffId} onChange={e => setStaffId(e.target.value)} required>
                  {staffList.map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName || u.username} ({u.role === 'admin' ? 'Quản trị' : u.role === 'staff' ? 'Thợ kỹ thuật' : u.role || 'Nhân viên'})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Ngày Làm Việc *</label>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} required />
              </div>
            </div>

            <div className="form-row-2">
              <div>
                <label>Ca Trực *</label>
                <select value={selectedShiftTypeId} onChange={e => setSelectedShiftTypeId(e.target.value)}>
                  {configs.length > 0 ? (
                    configs.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.icon || '⏰'} {c.name} ({c.startTime} – {c.endTime})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="morning">🌅 Ca Sáng (07:30 – 12:00)</option>
                      <option value="afternoon">🌆 Ca Chiều (13:00 – 18:30)</option>
                      <option value="full">☀️ Ca Cả Ngày (07:30 – 18:30)</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label>Ghi Chú Công Việc</label>
                <input type="text" placeholder="Phụ trách khoang sơn, nhận xe VIP..." value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            </div>

            <button type="submit" className="btn-add-shift">
              <FiPlus /> Thêm Ca Làm Việc
            </button>
          </form>

          {/* Shift Table */}
          <div className="shift-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nhân Viên</th>
                  <th>Ngày</th>
                  <th>Ca Làm</th>
                  <th>Ghi Chú</th>
                  <th>Xóa</th>
                </tr>
              </thead>
              <tbody>
                {displayShifts.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                      Chưa có ca làm việc nào.
                    </td>
                  </tr>
                ) : (
                  displayShifts.map((s: any) => {
                    const u = staffList.find((user: any) => user.id === s.staffId);
                    const cfg = configs.find(c => c.id === s.shiftTypeId);

                    return (
                      <tr key={s.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <UserAvatar src={u?.avatar || u?.avatarUrl} name={u?.fullName || u?.username || s.staffId} size={28} />
                            <div>
                              <strong style={{ color: 'var(--text-primary)' }}>{u?.fullName || u?.username || s.staffId}</strong>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u?.role || 'Kỹ thuật viên'}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong style={{ fontSize: '0.82rem' }}>{s.date}</strong>
                        </td>
                        <td>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              padding: '0.2em 0.55em',
                              borderRadius: 6,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: cfg?.color ? `${cfg.color}20` : 'var(--bg-secondary)',
                              color: cfg?.color || 'var(--accent-primary)',
                              border: `1px solid ${cfg?.color || 'var(--border-color)'}`,
                            }}
                          >
                            {cfg?.name || (s.shiftTypeId === 'morning' ? 'Ca Sáng' : s.shiftTypeId === 'afternoon' ? 'Ca Chiều' : 'Cả Ngày')}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.notes || '—'}</td>
                        <td>
                          <button onClick={() => handleDeleteShift(s.id)} className="btn-del-icon" title="Xóa ca làm việc">
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Service Requests & Work Orders Zone ── */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiInbox style={{ color: 'var(--accent-primary)' }} /> Yêu Cầu Dịch Vụ & Công Việc
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/admin/service-requests" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem', padding: '0.35rem 0.75rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
              Yêu cầu <FiArrowRight />
            </Link>
            <Link to="/admin/work-orders" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem', padding: '0.35rem 0.75rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
              Công việc <FiArrowRight />
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Pending Service Requests */}
          <div className="dashboard-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FiInbox style={{ color: '#f59e0b' }} />
                Yêu Cầu Chờ Xử Lý
                <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.15em 0.55em', borderRadius: 9999, background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                  {pendingServiceRequests.length}
                </span>
              </h3>
              <Link to="/admin/service-requests" style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>
                Xem tất cả
              </Link>
            </div>

            {srLoading ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Đang tải...</div>
            ) : recentServiceRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                ✅ Không có yêu cầu nào đang chờ xử lý
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {recentServiceRequests.map(req => (
                  <div key={req.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.75rem', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {req.customerName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {req.requestedServiceName} · {req.vehicleInfo?.licensePlate}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(req.preferredDate).toLocaleDateString('vi-VN')}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {req.preferredTime?.substring(0, 5)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Work Orders */}
          <div className="dashboard-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FiClipboard style={{ color: '#3b82f6' }} />
                Công Việc Đang Chạy
                <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.15em 0.55em', borderRadius: 9999, background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
                  {activeWorkOrders.length}
                </span>
              </h3>
              <Link to="/admin/work-orders" style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>
                Xem tất cả
              </Link>
            </div>

            {activeWorkOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                ✅ Không có công việc nào đang xử lý
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {activeWorkOrders.slice(0, 4).map(wo => {
                  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
                    Pending:    { label: 'Chờ duyệt',  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
                    Accepted:   { label: 'Đã nhận',    color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
                    InProgress: { label: 'Đang làm',   color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
                  };
                  const sc = statusConfig[wo.workOrderStatus] || { label: wo.workOrderStatus, color: 'var(--text-muted)', bg: 'var(--bg-secondary)' };
                  return (
                    <div key={wo.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.75rem', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {wo.vehicleInfo?.licensePlate} · {wo.vehicleInfo?.model}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {wo.serviceDetails}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15em 0.5em', borderRadius: 9999, background: sc.bg, color: sc.color }}>
                          {sc.label}
                        </span>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          {new Date(wo.scheduledStartTime).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
