import React, { useEffect } from 'react';
import { FiBell, FiX } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { toggleOpen, markAllRead, markAsRead, closePanel } from '@/features/notificationsSlice';
import './NotificationPanel.css';

const NotificationPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, isOpen } = useAppSelector(s => s.notifications);
  const unread = items.filter(n => !n.isRead).length;

  // Auto-close any stale open state on component mount
  useEffect(() => {
    return () => {
      dispatch(closePanel());
    };
  }, [dispatch]);

  if (!isOpen) return null;

  return (
    <>
      <div className="notif-overlay" onClick={() => dispatch(toggleOpen())} />
      <div className="notif-panel">
        <div className="notif-panel-header">
          <div className="notif-panel-title-row">
            <FiBell />
            <span>Thông Báo</span>
            {unread > 0 && <span className="notif-unread-badge">{unread}</span>}
          </div>
          <div className="notif-panel-actions">
            {unread > 0 && <button className="notif-mark-all" onClick={() => dispatch(markAllRead())}>Đọc tất cả</button>}
            <button className="notif-close" onClick={() => dispatch(toggleOpen())}><FiX /></button>
          </div>
        </div>
        <div className="notif-list">
          {items.length === 0 ? (
            <div className="notif-empty">Không có thông báo nào.</div>
          ) : items.map(n => (
            <div key={n.id} className={`notif-item ${!n.isRead ? 'unread' : ''} notif-${n.type}`}
              onClick={() => dispatch(markAsRead(n.id))}>
              <div className="notif-icon">{n.type === 'order' ? '📦' : n.type === 'success' ? '✅' : n.type === 'warning' ? '⚠️' : n.type === 'message' ? '💬' : 'ℹ️'}</div>
              <div className="notif-body">
                <div className="notif-title">{n.title}</div>
                <div className="notif-message">{n.message}</div>
                <div className="notif-time">{new Date(n.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              {!n.isRead && <div className="notif-dot" />}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
