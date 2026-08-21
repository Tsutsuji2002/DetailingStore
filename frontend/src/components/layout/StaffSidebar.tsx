import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiCalendar, FiMessageSquare, FiBook, FiChevronLeft, FiChevronRight, FiLogOut } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { logout } from '@/features/authSlice';
import './Sidebar.css';

const STAFF_MENU = [
  { icon: <FiCalendar />, label: 'Lịch Làm Việc', to: '/staff/schedule' },
  { icon: <FiMessageSquare />, label: 'Chat Nội Bộ', to: '/staff/chat' },
  { icon: <FiBook />, label: 'Tài Liệu Kỹ Thuật', to: '/staff/mechanic-docs' },
];

const StaffSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector(s => s.auth);

  return (
    <aside className={`sidebar staff-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <div className="sidebar-brand">
            <span className="sidebar-brand-icon">👨‍🔧</span>
            <span className="sidebar-brand-text">Staff Area</span>
          </div>
        )}
        <button className="sidebar-collapse-btn" onClick={() => setCollapsed(p => !p)} aria-label="Toggle sidebar">
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      {!collapsed && (
        <div className="sidebar-user">
          <img src={user?.avatarUrl || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.firstName || 'Staff')}&background=1a5cff&color=ffffff&bold=true`} alt={user?.fullName} className="sidebar-user-avatar" />
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.fullName || `${user?.lastName || ''} ${user?.firstName || ''}`.trim() || 'Staff'}</div>
            <div className="sidebar-user-role">Nhân Viên</div>
          </div>
        </div>
      )}

      <nav className="sidebar-nav">
        {STAFF_MENU.map(item => (
          <NavLink key={item.to} to={item.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            title={collapsed ? item.label : undefined}>
            <span className="sidebar-link-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar-link-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/" className="sidebar-link" title={collapsed ? 'Trang chủ' : undefined}>
          <span className="sidebar-link-icon">🏍️</span>
          {!collapsed && <span className="sidebar-link-label">Trang Chủ</span>}
        </NavLink>
        <button className="sidebar-link sidebar-logout" onClick={() => { dispatch(logout()); navigate('/login'); }} title={collapsed ? 'Đăng xuất' : undefined}>
          <span className="sidebar-link-icon"><FiLogOut /></span>
          {!collapsed && <span className="sidebar-link-label">Đăng Xuất</span>}
        </button>
      </div>
    </aside>
  );
};

export default StaffSidebar;
