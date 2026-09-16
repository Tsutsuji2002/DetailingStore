import React, { useEffect, useState } from 'react';
import {
  FiX,
  FiUser,
  FiTruck,
  FiTool,
  FiMessageSquare,
  FiCheckCircle,
  FiAlertTriangle,
  FiLoader,
} from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import {
  fetchServiceRequestById,
  rejectServiceRequest,
} from '@/features/serviceRequestsSlice';
import type { ServiceRequestDetailDto } from '@/types';
import AcceptServiceRequestForm from '@/components/admin/AcceptServiceRequestForm';

// ── Types ────────────────────────────────────────────────────────────────────

interface ServiceRequestDetailModalProps {
  requestId: string | null; // null = closed
  onClose: () => void;
  onAccepted?: () => void; // called after successful acceptance
  onRejected?: () => void; // called after successful rejection
}

// ── Status badge config ───────────────────────────────────────────────────────

const STATUS_CONFIG = {
  Pending: { label: 'Chờ xử lý', bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
  Accepted: { label: 'Đã chấp nhận', bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
  Rejected: { label: 'Đã từ chối', bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
};

// ── Helper: section heading ───────────────────────────────────────────────────

const SectionHeading: React.FC<{ icon: React.ReactNode; label: string }> = ({
  icon,
  label,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.75rem',
      paddingBottom: '0.5rem',
      borderBottom: '1px solid var(--border-color)',
    }}
  >
    <span style={{ color: 'var(--accent-color)', fontSize: '1rem' }}>{icon}</span>
    <span
      style={{
        fontSize: '0.8rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        color: 'var(--text-secondary)',
      }}
    >
      {label}
    </span>
  </div>
);

// ── Helper: field row ─────────────────────────────────────────────────────────

const FieldRow: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '1rem',
      padding: '0.35rem 0',
    }}
  >
    <span
      style={{
        fontSize: '0.83rem',
        color: 'var(--text-muted)',
        flexShrink: 0,
        minWidth: 120,
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: '0.875rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        textAlign: 'right',
        wordBreak: 'break-word',
      }}
    >
      {value}
    </span>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

const ServiceRequestDetailModal: React.FC<ServiceRequestDetailModalProps> = ({
  requestId,
  onClose,
  onAccepted,
  onRejected,
}) => {
  const dispatch = useAppDispatch();
  const selectedItem = useAppSelector(
    s => s.serviceRequests.selectedItem
  ) as ServiceRequestDetailDto | null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Accept form visibility
  const [showAcceptForm, setShowAcceptForm] = useState(false);

  // Inline rejection confirmation state
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  // ── Fetch on open / requestId change ──────────────────────────────────────

  useEffect(() => {
    if (!requestId) return;

    setLoading(true);
    setError(null);
    setShowAcceptForm(false);
    setShowRejectConfirm(false);

    dispatch(fetchServiceRequestById(requestId))
      .unwrap()
      .then(() => setLoading(false))
      .catch((err: any) => {
        setError(typeof err === 'string' ? err : 'Không thể tải chi tiết yêu cầu.');
        setLoading(false);
      });
  }, [requestId, dispatch]);

  // ── Don't render when closed ──────────────────────────────────────────────

  if (!requestId) return null;

  // ── Helpers ───────────────────────────────────────────────────────────────

  const formatDate = (dateStr?: string) =>
    dateStr ? new Date(dateStr).toLocaleDateString('vi-VN') : '—';

  const formatTime = (timeStr?: string) =>
    timeStr ? timeStr.substring(0, 5) : '—';

  const formatDateTime = (dtStr?: string) =>
    dtStr
      ? new Date(dtStr).toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—';

  // ── Rejection handler ──────────────────────────────────────────────────────

  const handleConfirmReject = async () => {
    if (!requestId) return;
    setRejecting(true);
    setError(null);
    try {
      await dispatch(rejectServiceRequest(requestId)).unwrap();
      setRejecting(false);
      setShowRejectConfirm(false);
      onRejected?.();
      onClose();
    } catch (err: any) {
      setError(typeof err === 'string' ? err : 'Lỗi khi từ chối yêu cầu.');
      setRejecting(false);
    }
  };

  // ── Status badge ──────────────────────────────────────────────────────────

  const renderStatus = (status?: string) => {
    if (!status) return null;
    const cfg =
      STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? {
        label: status,
        bg: 'var(--bg-secondary)',
        color: 'var(--text-muted)',
      };
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '0.3rem 0.85rem',
          borderRadius: 9999,
          fontSize: '0.82rem',
          fontWeight: 700,
          background: cfg.bg,
          color: cfg.color,
          letterSpacing: '0.01em',
        }}
      >
        {cfg.label}
      </span>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    /* Backdrop */
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      {/* Modal card */}
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 20,
          border: '1px solid var(--border-color)',
          width: '100%',
          maxWidth: 640,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '1.1rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
            }}
          >
            Chi tiết yêu cầu dịch vụ
          </h2>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'none',
              color: 'var(--text-muted)',
              fontSize: '1.25rem',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Đóng"
          >
            <FiX />
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: '1.5rem', flex: 1 }}>
          {/* Loading overlay */}
          {loading && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem 0',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  border: '3px solid var(--border-color)',
                  borderTopColor: 'var(--accent-color)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Đang tải...
              </span>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 10,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                fontSize: '0.875rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <FiAlertTriangle />
              {error}
            </div>
          )}

          {/* Content: shown once data is loaded */}
          {!loading && selectedItem && selectedItem.id === requestId && (
            <>
              {/* ── Section 1: Customer info ── */}
              <div style={{ marginBottom: '1.25rem' }}>
                <SectionHeading icon={<FiUser />} label="Thông tin khách hàng" />
                <FieldRow label="Họ tên" value={selectedItem.customerName} />
                <FieldRow label="Email" value={selectedItem.customerEmail} />
                <FieldRow label="Điện thoại" value={selectedItem.customerPhone || '—'} />
              </div>

              {/* ── Section 2: Vehicle info ── */}
              <div style={{ marginBottom: '1.25rem' }}>
                <SectionHeading icon={<FiTruck />} label="Thông tin xe" />
                <FieldRow
                  label="Biển số"
                  value={selectedItem.vehicleInfo?.licensePlate || '—'}
                />
                <FieldRow
                  label="Dòng xe"
                  value={selectedItem.vehicleInfo?.model || '—'}
                />
                <FieldRow
                  label="Năm sản xuất"
                  value={selectedItem.vehicleInfo?.year ? String(selectedItem.vehicleInfo.year) : '—'}
                />
              </div>

              {/* ── Section 3: Service details ── */}
              <div style={{ marginBottom: '1.25rem' }}>
                <SectionHeading icon={<FiTool />} label="Chi tiết dịch vụ" />
                <FieldRow
                  label="Dịch vụ"
                  value={selectedItem.requestedServiceName}
                />
                <FieldRow
                  label="Ngày mong muốn"
                  value={formatDate(selectedItem.preferredDate)}
                />
                <FieldRow
                  label="Giờ mong muốn"
                  value={formatTime(selectedItem.preferredTime)}
                />
              </div>

              {/* ── Section 4: Customer notes (conditional) ── */}
              {selectedItem.customerNotes && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <SectionHeading
                    icon={<FiMessageSquare />}
                    label="Ghi chú khách hàng"
                  />
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                      background: 'var(--bg-secondary)',
                      borderRadius: 10,
                      padding: '0.75rem 1rem',
                      border: '1px solid var(--border-color)',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {selectedItem.customerNotes}
                  </p>
                </div>
              )}

              {/* ── Section 5: Status ── */}
              <div style={{ marginBottom: '1.25rem' }}>
                <SectionHeading
                  icon={<FiCheckCircle />}
                  label="Trạng thái yêu cầu"
                />
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  {renderStatus(selectedItem.status)}
                  {selectedItem.status === 'Accepted' && (
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.2rem',
                      }}
                    >
                      {selectedItem.reviewedAt && (
                        <span>
                          Duyệt lúc:{' '}
                          <strong style={{ color: 'var(--text-secondary)' }}>
                            {formatDateTime(selectedItem.reviewedAt)}
                          </strong>
                        </span>
                      )}
                      {selectedItem.reviewedByAdminName && (
                        <span>
                          Người duyệt:{' '}
                          <strong style={{ color: 'var(--text-secondary)' }}>
                            {selectedItem.reviewedByAdminName}
                          </strong>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ── AcceptServiceRequestForm ── */}
              {showAcceptForm && (
                <div
                  style={{
                    marginBottom: '1.25rem',
                    padding: '1.25rem',
                    borderRadius: 12,
                    border: '1px dashed var(--border-color)',
                    background: 'var(--bg-secondary)',
                  }}
                >
                  <AcceptServiceRequestForm
                    serviceRequest={selectedItem}
                    onSave={() => { onAccepted?.(); onClose(); }}
                    onCancel={() => setShowAcceptForm(false)}
                  />
                </div>
              )}

              {/* ── Inline rejection confirmation ── */}
              {showRejectConfirm && (
                <div
                  style={{
                    marginBottom: '1.25rem',
                    padding: '1rem 1.25rem',
                    borderRadius: 12,
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <p
                    style={{
                      margin: '0 0 0.75rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ef4444',
                    }}
                  >
                    Bạn có chắc muốn từ chối yêu cầu này không? Hành động này
                    không thể hoàn tác.
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={handleConfirmReject}
                      disabled={rejecting}
                      style={{
                        padding: '0.5rem 1.1rem',
                        borderRadius: 8,
                        background:
                          'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.83rem',
                        border: 'none',
                        cursor: rejecting ? 'not-allowed' : 'pointer',
                        opacity: rejecting ? 0.7 : 1,
                      }}
                    >
                      {rejecting ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                    </button>
                    <button
                      onClick={() => setShowRejectConfirm(false)}
                      disabled={rejecting}
                      style={{
                        padding: '0.5rem 1.1rem',
                        borderRadius: 8,
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontWeight: 600,
                        fontSize: '0.83rem',
                        cursor: 'pointer',
                      }}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}

              {/* ── Action buttons (only for Pending status) ── */}
              {selectedItem.status === 'Pending' && !showAcceptForm && !showRejectConfirm && (
                <div
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                    paddingTop: '0.5rem',
                  }}
                >
                  <button
                    onClick={() => setShowAcceptForm(true)}
                    style={{
                      flex: 1,
                      minWidth: 140,
                      padding: '0.65rem 1.25rem',
                      borderRadius: 10,
                      background: 'var(--accent-gradient, linear-gradient(135deg, #10b981 0%, #059669 100%))',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    ✓ Chấp nhận
                  </button>
                  <button
                    onClick={() => setShowRejectConfirm(true)}
                    style={{
                      flex: 1,
                      minWidth: 140,
                      padding: '0.65rem 1.25rem',
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    ✕ Từ chối
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceRequestDetailModal;
