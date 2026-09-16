import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '@/components/layout/UserLayout';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { fetchServiceRequests } from '@/features/serviceRequestsSlice';
import type { ServiceRequestStatus } from '@/types';

// ── Status helpers ─────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<ServiceRequestStatus, string> = {
  Pending: 'Chờ xử lý',
  Accepted: 'Đã chấp nhận',
  Rejected: 'Đã từ chối',
};

const STATUS_COLORS: Record<ServiceRequestStatus, { bg: string; text: string }> = {
  Pending: { bg: '#fef3c7', text: '#92400e' },
  Accepted: { bg: '#d1fae5', text: '#065f46' },
  Rejected: { bg: '#fee2e2', text: '#991b1b' },
};

const STATUS_DOTS: Record<ServiceRequestStatus, string> = {
  Pending: '#f59e0b',
  Accepted: '#10b981',
  Rejected: '#ef4444',
};

type FilterValue = 'all' | ServiceRequestStatus;

const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'Pending', label: 'Chờ xử lý' },
  { value: 'Accepted', label: 'Đã chấp nhận' },
  { value: 'Rejected', label: 'Đã từ chối' },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── Component ──────────────────────────────────────────────────────────────────

const ServiceRequestsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector(s => s.serviceRequests);
  const [statusFilter, setStatusFilter] = useState<FilterValue>('all');

  useEffect(() => {
    dispatch(fetchServiceRequests());
  }, [dispatch]);

  const filtered = statusFilter === 'all'
    ? items
    : items.filter(r => r.status === statusFilter);

  // ── Styles ─────────────────────────────────────────────────────────────────

  const containerStyle: React.CSSProperties = {
    maxWidth: 860,
    margin: '2.5rem auto',
    padding: '0 1rem 3rem',
  };

  const headerRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '1.5rem',
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-card)',
    borderRadius: 12,
    border: '1px solid var(--border-color)',
    padding: '1.25rem 1.5rem',
    marginBottom: '1rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
  };

  const badgeStyle = (status: ServiceRequestStatus): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.3rem 0.75rem',
    borderRadius: 20,
    background: STATUS_COLORS[status].bg,
    color: STATUS_COLORS[status].text,
    fontWeight: 600,
    fontSize: '0.8rem',
    whiteSpace: 'nowrap',
  });

  const dotStyle = (status: ServiceRequestStatus): React.CSSProperties => ({
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: STATUS_DOTS[status],
    flexShrink: 0,
  });

  const metaLabelStyle: React.CSSProperties = {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  };

  const metaValueStyle: React.CSSProperties = {
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
    marginTop: '0.15rem',
  };

  const selectStyle: React.CSSProperties = {
    padding: '0.5rem 0.85rem',
    borderRadius: 8,
    border: '1px solid var(--border-color)',
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    cursor: 'pointer',
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <UserLayout>
      <div style={containerStyle}>
        {/* Header */}
        <div style={headerRowStyle}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Yêu Cầu Dịch Vụ Của Tôi
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem', fontSize: '0.9rem' }}>
              Theo dõi trạng thái các yêu cầu bạn đã gửi
            </p>
          </div>

          <Link
            to="/user/service-requests/new"
            style={{ padding: '0.6rem 1.25rem', borderRadius: 9, background: 'var(--accent-gradient)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}
          >
            + Gui yeu cau moi
          </Link>

          {/* Status filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Lọc:
            </span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as FilterValue)}
              style={selectStyle}
              aria-label="Lọc theo trạng thái"
            >
              {FILTER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '3rem',
              color: 'var(--text-secondary)',
              fontSize: '1rem',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 24,
                height: 24,
                border: '3px solid var(--border-color)',
                borderTopColor: '#6366f1',
                borderRadius: '50%',
                animation: 'spin 0.75s linear infinite',
                marginRight: '0.75rem',
              }}
            />
            Đang tải...
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div
            style={{
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: 10,
              padding: '1rem 1.25rem',
              color: '#b91c1c',
              fontWeight: 500,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 1rem',
              color: 'var(--text-secondary)',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📋</div>
            <p style={{ fontSize: '1.05rem', fontWeight: 500 }}>
              {statusFilter === 'all'
                ? 'Bạn chưa có yêu cầu dịch vụ nào'
                : `Không có yêu cầu nào với trạng thái "${STATUS_LABELS[statusFilter as ServiceRequestStatus]}"`}
            </p>
          </div>
        )}

        {/* Request cards */}
        {!loading && !error && filtered.map(req => (
          <div key={req.id} style={cardStyle}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              {/* Left: service name + status */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                    marginBottom: '0.75rem',
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {req.requestedServiceName}
                  </h3>
                  <span style={badgeStyle(req.status)}>
                    <span style={dotStyle(req.status)} />
                    {STATUS_LABELS[req.status]}
                  </span>
                </div>

                {/* Meta grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: '0.75rem 1.5rem',
                  }}
                >
                  <div>
                    <p style={metaLabelStyle}>Xe</p>
                    <p style={metaValueStyle}>
                      {req.vehicleInfo.licensePlate} – {req.vehicleInfo.model}
                      {req.vehicleInfo.year ? ` (${req.vehicleInfo.year})` : ''}
                    </p>
                  </div>

                  <div>
                    <p style={metaLabelStyle}>Ngày mong muốn</p>
                    <p style={metaValueStyle}>{formatDate(req.preferredDate)}</p>
                  </div>

                  <div>
                    <p style={metaLabelStyle}>Giờ mong muốn</p>
                    <p style={metaValueStyle}>
                      {req.preferredTime ? req.preferredTime.substring(0, 5) : '—'}
                    </p>
                  </div>

                  <div>
                    <p style={metaLabelStyle}>Ngày gửi</p>
                    <p style={metaValueStyle}>{formatDateTime(req.createdAt)}</p>
                  </div>
                </div>

                {/* Notes */}
                {req.customerNotes && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <p style={metaLabelStyle}>Ghi chú</p>
                    <p
                      style={{
                        ...metaValueStyle,
                        fontStyle: 'italic',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      "{req.customerNotes}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </UserLayout>
  );
};

export default ServiceRequestsList;
