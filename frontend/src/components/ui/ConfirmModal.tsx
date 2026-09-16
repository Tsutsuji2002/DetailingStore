import React from 'react';
import { FiAlertTriangle, FiTrash2, FiX, FiInfo } from 'react-icons/fi';

export interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = 'Xác nhận thao tác',
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  type = 'danger',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const isDanger = type === 'danger';
  const isWarning = type === 'warning';

  const iconColor = isDanger ? '#ef4444' : isWarning ? '#f59e0b' : '#3b82f6';
  const iconBg = isDanger ? 'rgba(239, 68, 68, 0.15)' : isWarning ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)';
  const confirmBtnBg = isDanger
    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    : isWarning
    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    : 'var(--accent-gradient)';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100000,
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 20,
          border: '1px solid var(--border-color)',
          width: '100%',
          maxWidth: 420,
          padding: '1.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            border: 'none',
            background: 'none',
            color: 'var(--text-muted)',
            fontSize: '1.2rem',
            cursor: 'pointer',
            padding: '0.25rem',
          }}
        >
          <FiX />
        </button>

        {/* Icon */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: iconBg,
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            marginBottom: '1rem',
          }}
        >
          {isDanger ? <FiTrash2 /> : isWarning ? <FiAlertTriangle /> : <FiInfo />}
        </div>

        {/* Content */}
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          {message}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '0.65rem 1rem',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '0.65rem 1rem',
              borderRadius: 10,
              background: confirmBtnBg,
              color: 'white',
              fontWeight: 700,
              fontSize: '0.875rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: isDanger ? '0 4px 12px rgba(239, 68, 68, 0.3)' : 'none',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
