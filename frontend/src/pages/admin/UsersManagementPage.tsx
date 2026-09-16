import React, { useState, useEffect } from 'react';
import { FiUsers, FiSearch, FiShield, FiUserCheck, FiCheck, FiFilter, FiRefreshCw } from 'react-icons/fi';
import AdminLayout from '@/components/layout/AdminLayout';
import UserAvatar from '@/components/ui/UserAvatar';
import Pagination from '@/components/ui/Pagination';
import { usersApi } from '@/services/api/usersApi';
import type { User } from '@/types';
import './DashboardPage.css';

const UsersManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await usersApi.getUsers();
      setUsers(data);
    } catch (err: any) {
      setFeedback({ type: 'error', text: 'Lỗi tải danh sách người dùng: ' + (err.message || '') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    setFeedback(null);
    try {
      const updatedUser = await usersApi.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, role: updatedUser.role } : u)));
      setFeedback({ type: 'success', text: `Đã cập nhật quyền thành công cho tài khoản!` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', text: 'Cập nhật phân quyền thất bại: ' + (err.message || '') });
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const name = (u.fullName || `${u.lastName || ''} ${u.firstName || ''}`).toLowerCase();
    const email = (u.email || '').toLowerCase();
    const username = (u.username || '').toLowerCase();
    const phone = (u.phone || '').toLowerCase();
    const term = search.toLowerCase();

    const matchesSearch = name.includes(term) || email.includes(term) || username.includes(term) || phone.includes(term);
    const matchesRole = roleFilter === 'all' || u.role?.toLowerCase() === roleFilter.toLowerCase();

    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <span className="status-badge success" style={{ background: '#dbeafe', color: '#1e40af' }}>👑 Admin</span>;
      case 'staff':
        return <span className="status-badge info" style={{ background: '#fef3c7', color: '#92400e' }}>🛠️ Kỹ thuật viên</span>;
      default:
        return <span className="status-badge neutral" style={{ background: '#f1f5f9', color: '#475569' }}>👤 Khách hàng</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title"><FiUsers /> Quản Lý Tài Khoản & Phân Quyền</h1>
          <p className="admin-page-sub">Xem danh sách toàn bộ người dùng, trạng thái và thiết lập phân quyền (Admin, Staff, Customer)</p>
        </div>
        <button onClick={fetchUsers} className="btn-save-acc" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', width: 'auto', padding: '0.55rem 1.1rem' }}>
          <FiRefreshCw className={loading ? 'spin' : ''} /> Tải lại
        </button>
      </div>

      {feedback && (
        <div style={{
          padding: '0.75rem 1rem', borderRadius: 10, marginBottom: '1rem', fontWeight: 600, fontSize: '0.9rem',
          background: feedback.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: feedback.type === 'success' ? '#15803d' : '#b91c1c',
          display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>
          {feedback.type === 'success' && <FiCheck />} {feedback.text}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="dashboard-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1', minWidth: 260 }}>
            <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, sđt, username..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '0.6rem 0.9rem 0.6rem 2.4rem', borderRadius: 10,
                border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)'
              }}
            />
          </div>

          {/* Role Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiFilter style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Vai trò:</span>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              style={{
                padding: '0.6rem 1rem', borderRadius: 10, border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 600
              }}
            >
              <option value="all">Tất cả ({users.length})</option>
              <option value="admin">Quản trị viên (Admin)</option>
              <option value="staff">Nhân viên (Staff)</option>
              <option value="customer">Khách hàng (Customer)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="dashboard-card">
        <div className="shift-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Người Dùng</th>
                <th>Tên Đăng Nhập</th>
                <th>Email / SĐT</th>
                <th>Phương Thức</th>
                <th>Quyền Hiện Tại</th>
                <th>Thay Đổi Quyền (Role)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Đang tải danh sách người dùng...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Không tìm thấy tài khoản phù hợp.
                  </td>
                </tr>
              ) : (
                (() => {
                  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
                  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

                  return paginatedUsers.map(u => {
                    const fullName = u.fullName || `${u.lastName || ''} ${u.firstName || ''}`.trim() || 'Người dùng';
                    return (
                      <tr key={u.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <UserAvatar src={(u as any).avatarUrl || (u as any).avatar} name={fullName} size={38} />
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{fullName}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Tham gia: {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : 'Mới'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <code style={{ background: 'var(--bg-secondary)', padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.85rem' }}>
                            @{u.username || 'chua_co'}
                          </code>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{u.email}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.phone || 'Chưa cập nhật SĐT'}</div>
                        </td>
                        <td>
                          <span style={{
                            fontSize: '0.78rem', padding: '0.2rem 0.6rem', borderRadius: 9999, fontWeight: 600,
                            background: u.authProvider === 'google' ? '#e0f2fe' : '#f1f5f9',
                            color: u.authProvider === 'google' ? '#0369a1' : '#475569'
                          }}>
                            {u.authProvider === 'google' ? '🔵 Google' : '⚪ Mật khẩu'}
                          </span>
                        </td>
                        <td>{getRoleBadge(u.role)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <select
                              value={u.role?.toLowerCase() || 'customer'}
                              disabled={updatingId === u.id}
                              onChange={e => handleRoleChange(u.id, e.target.value)}
                              style={{
                                padding: '0.45rem 0.75rem', borderRadius: 8,
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                                fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
                              }}
                            >
                              <option value="customer">👤 Khách Hàng</option>
                              <option value="staff">🛠️ Kỹ Thuật Viên (Staff)</option>
                              <option value="admin">👑 Quản Trị Viên (Admin)</option>
                            </select>
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
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredUsers.length / pageSize) || 1}
        totalItems={filteredUsers.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={ps => { setPageSize(ps); setCurrentPage(1); }}
      />
    </AdminLayout>
  );
};

export default UsersManagementPage;
