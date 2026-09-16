import React, { useEffect, useState } from 'react';
import { FiFileText, FiFilter, FiRefreshCw, FiClock, FiUser, FiTool, FiCalendar } from 'react-icons/fi';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { fetchServiceRequests } from '@/features/serviceRequestsSlice';
import type { ServiceRequestDto, ServiceRequestStatus } from '@/types';
import ServiceRequestDetailModal from '@/components/admin/ServiceRequestDetailModal';
import './DashboardPage.css';

// Status badge config
const STATUS_CONFIG: Record<
  ServiceRequestStatus,
  { label: string; bg: string; color: string }
> = {
  Pending: { label: 'Chờ xử lý', bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
  Accepted: { label: 'Đã chấp nhận', bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
  Rejected: { label: 'Đã từ chối', bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
};

type FilterStatus = 'All' | ServiceRequestStatus;

const STATUS_FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: 'All', label: 'Tất cả' },
  { value: 'Pending', label: 'Chờ xử lý' },
  { value: 'Accepted', label: 'Đã chấp nhận' },
  { value: 'Rejected', label: 'Đã từ chối' },
];

interface AdminServiceRequestsListProps {
  onSelectRequest?: (requestId: string) => void;
}

const AdminServiceRequestsList: React.FC<AdminServiceRequestsListProps> = ({ onSelectRequest }) => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(s => s.serviceRequests.items);
  const loading = useAppSelector(s => s.serviceRequests.loading);

  const [statusFilter, setStatusFilter] = useState<FilterStatus>('Pending');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchServiceRequests());
  }, [dispatch]);

  const handleRowClick = (id: string) => {
    if (onSelectRequest) {
      onSelectRequest(id);
    } else {
      setSelectedRequestId(id === selectedRequestId ? null : id);
    }
  };

  const filteredItems: ServiceRequestDto[] =
    statusFilter === 'All'
      ? [...items]
      : items.filter(item => item.status === statusFilter);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('vi-VN');

  const formatTime = (timeStr: string) => {
    // timeStr from backend is "HH:mm:ss" — display as HH:mm
    return timeStr ? timeStr.substring(0, 5) : timeStr;
  };

  const renderStatusBadge = (status: ServiceRequestStatus) => {
    const cfg = STATUS_CONFIG[status] ?? { label: status, bg: '#f1f5f9', color: '#475569' };
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '0.25rem 0.65rem',
          borderRadius: 9999,
          fontSize: '0.78rem',
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

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">
            <FiFileText /> Yêu Cầu Dịch Vụ
          </h1>
          <p className="admin-page-sub">
            Xem và xử lý tất cả yêu cầu dịch vụ từ khách hàng
          </p>
        </div>
        <button
          onClick={() => dispatch(fetchServiceRequests())}
          className="btn-save-acc"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', width: 'auto', padding: '0.55rem 1.1rem' }}
        >
          <FiRefreshCw className={loading ? 'spin' : ''} /> Tải lại
        </button>
      </div>

      {/* Filter Bar */}
      <div className="dashboard-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiFilter style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Trạng thái:
            </span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as FilterStatus)}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: 10,
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontWeight: 600,
              }}
            >
              {STATUS_FILTER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                  {opt.value === 'All'
                    ? ` (${items.length})`
                    : ` (${items.filter(i => i.status === opt.value).length})`}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Hiển thị <strong>{filteredItems.length}</strong> / {items.length} yêu cầu
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="dashboard-card">
        <div className="shift-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <FiClock size={14} /> Ngày tạo
                  </span>
                </th>
                <th>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <FiUser size={14} /> Khách hàng
                  </span>
                </th>
                <th>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <FiTool size={14} /> Dịch vụ yêu cầu
                  </span>
                </th>
                <th>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <FiCalendar size={14} /> Ngày / Giờ mong muốn
                  </span>
                </th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          border: '3px solid var(--border-color)',
                          borderTopColor: 'var(--accent-color)',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                        }}
                      />
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: 'center',
                      padding: '3rem',
                      color: 'var(--text-muted)',
                      fontSize: '0.95rem',
                    }}
                  >
                    Không có yêu cầu dịch vụ nào
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const isSelected = item.id === selectedRequestId;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleRowClick(item.id)}
                      style={{
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(var(--accent-rgb, 99, 102, 241), 0.07)' : undefined,
                        outline: isSelected ? '2px solid var(--accent-color, #6366f1)' : undefined,
                        outlineOffset: '-2px',
                        transition: 'background 0.15s',
                      }}
                    >
                      {/* Created Date */}
                      <td>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                          {formatDate(item.createdAt)}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Customer Name */}
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                          {item.customerName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {item.customerEmail}
                        </div>
                      </td>

                      {/* Service Name */}
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                          {item.requestedServiceName}
                        </div>
                        {item.vehicleInfo && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {item.vehicleInfo.licensePlate} · {item.vehicleInfo.model}
                          </div>
                        )}
                      </td>

                      {/* Preferred Date / Time */}
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                          {formatDate(item.preferredDate)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {formatTime(item.preferredTime)}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td>{renderStatusBadge(item.status)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <ServiceRequestDetailModal
          requestId={selectedRequestId}
          onClose={() => setSelectedRequestId(null)}
          onAccepted={() => { setSelectedRequestId(null); dispatch(fetchServiceRequests()); }}
          onRejected={() => { setSelectedRequestId(null); dispatch(fetchServiceRequests()); }}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminServiceRequestsList;
