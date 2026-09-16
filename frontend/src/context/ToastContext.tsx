import React, { createContext, useContext, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiTrash2, FiInfo, FiX, FiArrowRight } from 'react-icons/fi';
import '../components/ui/ToastNotification.css';

export type ToastType = 'success' | 'delete' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  subtitle?: string;
  image?: string;
  actionUrl?: string;
  actionText?: string;
  isLeaving?: boolean;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  showAddToCartToast: (productName: string, image?: string) => void;
  showRemoveFromCartToast: (productName: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.map(t => (t.id === id ? { ...t, isLeaving: true } : t)));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  const showToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { ...toast, id };

    setToasts(prev => [newToast, ...prev].slice(0, 4));

    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  const showAddToCartToast = useCallback((productName: string, image?: string) => {
    showToast({
      type: 'success',
      title: 'Đã thêm vào giỏ hàng!',
      subtitle: productName,
      image,
      actionUrl: '/cart',
      actionText: 'Xem giỏ →',
    });
  }, [showToast]);

  const showRemoveFromCartToast = useCallback((productName: string) => {
    showToast({
      type: 'delete',
      title: 'Đã xóa khỏi giỏ hàng',
      subtitle: productName,
    });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showAddToCartToast, showRemoveFromCartToast }}>
      {children}
      {/* Toast container overlay */}
      <div className="toast-container">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`toast-item toast-${t.type} ${t.isLeaving ? 'toast-leaving' : ''}`}
          >
            {t.image ? (
              <img src={t.image} alt={t.title} className="toast-img" />
            ) : (
              <div className="toast-icon-wrap">
                {t.type === 'success' && <FiCheckCircle />}
                {t.type === 'delete' && <FiTrash2 />}
                {t.type === 'info' && <FiInfo />}
              </div>
            )}
            <div className="toast-body">
              <div className="toast-title">{t.title}</div>
              {t.subtitle && <div className="toast-subtitle">{t.subtitle}</div>}
            </div>

            {t.actionUrl && (
              <Link to={t.actionUrl} className="toast-action-btn" onClick={() => removeToast(t.id)}>
                {t.actionText || 'Xem'} <FiArrowRight size={12} />
              </Link>
            )}

            <button className="toast-close-btn" onClick={() => removeToast(t.id)}>
              <FiX />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
