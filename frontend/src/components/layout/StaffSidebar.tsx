import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiCalendar, FiMessageSquare, FiBook, FiShoppingBag, FiChevronLeft, FiChevronRight, FiLogOut, FiUsers, FiHome, FiTool } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { logout } from '@/features/authSlice';
import UserAvatar from '@/components/ui/UserAvatar';
import './Sidebar.css';

const STAFF_MENU = [
  { icon: <FiShoppingBag />, label: 'Quản Lý Đơn Hàng', to: '/staff/orders' },
  { icon: <FiTool />, label: 'Công Việc Của Tôi', to: '/staff/work-orders' },
  { icon: <FiCalendar />, label: 'Lịch Làm Việc', to: '/staff/schedule' },
  { icon: <FiMessageSquare />, label: 'Chat Nội Bộ', to: '/staff/chat' },
  { icon: <FiBook />, label: 'Tài Liệu Kỹ Thuật', to: '/staff/mechanic-docs' },
];

interface StaffSidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const StaffSidebar: React.FC<StaffSidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const [collapsed, setCollapsed] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector(s => s.auth);
  const { totalUnread } = useAppSelector(s => s.chat);

  const handleLinkClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside className={`sidebar staff-sidebar ${collapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <div className="sidebar-brand">
            <span className="sidebar-brand-icon"><FiUsers /></span>
            <span className="sidebar-brand-text">Staff Area</span>
          </div>
        )}
        <button className="sidebar-collapse-btn" onClick={() => setCollapsed(p => !p)} aria-label="Toggle sidebar">
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      {!collapsed && (
        <div className="sidebar-user">
          <UserAvatar src={user?.avatarUrl || user?.avatar} name={user?.fullName || `${user?.lastName || ''} ${user?.firstName || ''}`.trim() || 'Staff'} size={36} className="sidebar-user-avatar" />
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.fullName || `${user?.lastName || ''} ${user?.firstName || ''}`.trim() || 'Staff'}</div>
            <div className="sidebar-user-role">Nhân Viên</div>
          </div>
        </div>
      )}

      <nav className="sidebar-nav">
        {STAFF_MENU.map(item => {
          const isChatLink = item.to === '/staff/chat';
          const showBadge = isChatLink && totalUnread > 0;
          
          return (
            <NavLink key={item.to} to={item.to}
              onClick={handleLinkClick}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}>
              <span className="sidebar-link-icon">{item.icon}</span>
              {!collapsed && <span className="sidebar-link-label">{item.label}</span>}
              {showBadge && (
                <span className="sidebar-notification-badge" style={{
                  position: 'absolute',
                  top: '50%',
                  right: collapsed ? '0.5rem' : '1rem',
                  transform: 'translateY(-50%)',
                  background: '#ef4444',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.45rem',
                  borderRadius: 9999,
                  minWidth: '1.25rem',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
                }}>
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/" onClick={handleLinkClick} className="sidebar-link" title={collapsed ? 'Trang chủ' : undefined}>
          <span className="sidebar-link-icon"><FiHome /></span>
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
