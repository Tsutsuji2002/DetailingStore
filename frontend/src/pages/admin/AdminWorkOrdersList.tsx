import React, { useEffect, useState } from 'react';
import {
  FiClipboard,
  FiRefreshCw,
  FiPlus,
  FiUser,
  FiTruck,
  FiClock,
  FiTool,
  FiX,
} from 'react-icons/fi';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { fetchWorkOrders } from '@/features/workOrdersSlice';
import WorkOrderForm from '@/components/admin/WorkOrderForm';
import type { WorkOrderDto, WorkOrderStatus, RequestSource } from '@/types';
import './DashboardPage.css';

// ── Status badge config ────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<WorkOrderStatus, { label: string; bg: string; color: string }> = {
  Pending:   { label: 'Chờ xử lý',   bg: 'rgba(245, 158, 11, 0.15)',  color: '#f59e0b' },
  Accepted:  { label: 'Đã chấp nhận', bg: 'rgba(59, 130, 246, 0.15)',  color: '#3b82f6' },
  InProgress:{ label: 'Đang thực hiện', bg: 'rgba(249, 115, 22, 0.15)', color: '#f97316' },
  Completed: { label: 'Hoàn thành',   bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
  Expired:   { label: 'Hết hạn',      bg: 'rgba(239, 68, 68, 0.15)',  color: '#ef4444' },
  Rejected:  { label: 'Đã từ chối',   bg: 'rgba(107, 114, 128, 0.15)', color: '#6b7280' },
};

// ── Tab definitions ───────────────────────────────────────────────────────────

type TabKey = 'all' | 'unassigned' | 'today' | 'upcoming' | 'completed';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all',        label: 'Tất cả' },
  { key: 'unassigned', label: 'Chưa phân công' },
  { key: 'today',      label: 'Hôm nay' },
  { key: 'upcoming',   label: 'Sắp tới' },
  { key: 'completed',  label: 'Đã hoàn thành' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const todayStr = () => new Date().toISOString().split('T')[0]; // YYYY-MM-DD

function filterItems(items: WorkOrderDto[], tab: TabKey): WorkOrderDto[] {
  const today = todayStr();
  switch (tab) {
    case 'unassigned':
      return items.filter(w => w.assignedStaffIds.length === 0);
    case 'today':
      return items.filter(w => w.scheduledStartTime.split('T')[0] === today);
    case 'upcoming': {
      const nonFinalStatuses: WorkOrderStatus[] = ['Pending', 'Accepted', 'InProgress'];
      return items.filter(
        w =>
          w.scheduledStartTime.split('T')[0] > today &&
          nonFinalStatuses.includes(w.workOrderStatus)
      );
    }
    case 'completed':
      return items.filter(w => w.workOrderStatus === 'Completed');
    default:
      return items;
  }
}

function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('vi-VN'),
    time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
  };
}

function sourceLabel(source: RequestSource): string {
  return source === 'CustomerRequest' ? 'Yêu cầu KH' : 'Trực tiếp';
}

function sourceBadgeStyle(source: RequestSource): React.CSSProperties {
  if (source === 'CustomerRequest') {
    return {
      background: 'rgba(99, 102, 241, 0.12)',
      color: '#6366f1',
      border: '1px solid rgba(99, 102, 241, 0.25)',
    };
  }
  return {
    background: 'rgba(20, 184, 166, 0.12)',
    color: '#14b8a6',
    border: '1px solid rgba(20, 184, 166, 0.25)',
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

const AdminWorkOrdersList: React.FC = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(s => s.workOrders.items);
  const loading = useAppSelector(s => s.workOrders.loading);

  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    dispatch(fetchWorkOrders());
  }, [dispatch]);

  const filteredItems = filterItems(items, activeTab);

  const handleRowClick = (id: string) => {
    setSelectedWorkOrderId(id === selectedWorkOrderId ? null : id);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    dispatch(fetchWorkOrders());
  };

  const tabCount = (key: TabKey) => filterItems(items, key).length;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">
            <FiClipboard style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
            Quản Lý Công Việc
          </h1>
          <p className="admin-page-sub">
            Xem, tạo và theo dõi tất cả công việc đã lên lịch
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <button
            onClick={() => dispatch(fetchWorkOrders())}
            className="btn-save-acc"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              width: 'auto',
              padding: '0.55rem 1.1rem',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
            }}
          >
            <FiRefreshCw className={loading ? 'spin' : ''} /> Tải lại
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-save-acc"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              width: 'auto',
              padding: '0.55rem 1.1rem',
            }}
          >
            <FiPlus /> Tạo công việc
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div
        className="dashboard-card"
        style={{ marginBottom: '1.5rem', padding: '0.5rem', overflowX: 'auto' }}
      >
        <div style={{ display: 'flex', gap: '0.25rem', minWidth: 'max-content' }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.key;
            const count = tabCount(tab.key);
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 1.1rem',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  background: isActive ? 'var(--accent-gradient)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive
                    ? '0 2px 8px rgba(var(--accent-rgb, 99 102 241), 0.3)'
                    : 'none',
                }}
              >
                {tab.label}
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '1.25rem',
                    height: '1.25rem',
                    padding: '0 0.3rem',
                    borderRadius: 9999,
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    background: isActive
                      ? 'rgba(255,255,255,0.25)'
                      : 'var(--bg-secondary)',
                    color: isActive ? '#fff' : 'var(--text-muted)',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
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
                    <FiClock size={13} /> Thời gian lên lịch
                  </span>
                </th>
                <th>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <FiTruck size={13} /> Xe
                  </span>
                </th>
                <th>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <FiTool size={13} /> Dịch vụ
                  </span>
                </th>
                <th>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <FiUser size={13} /> Nhân viên
                  </span>
                </th>
                <th>Trạng thái</th>
                <th>Nguồn</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.75rem',
                      }}
                    >
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
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Đang tải...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: 'center',
                      padding: '3rem',
                      color: 'var(--text-muted)',
                      fontSize: '0.95rem',
                    }}
                  >
                    Không có công việc nào
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const isSelected = item.id === selectedWorkOrderId;
                  const start = formatDateTime(item.scheduledStartTime);
                  const end = formatDateTime(item.scheduledEndTime);
                  const statusCfg =
                    STATUS_CONFIG[item.workOrderStatus] ?? {
                      label: item.workOrderStatus,
                      bg: 'var(--bg-secondary)',
                      color: 'var(--text-muted)',
                    };
                  const staffNames =
                    item.assignedStaff.length > 0
                      ? item.assignedStaff.map(s => s.name).join(', ')
                      : 'Chưa phân công';

                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleRowClick(item.id)}
                      style={{
                        cursor: 'pointer',
                        background: isSelected
                          ? 'rgba(var(--accent-rgb, 99, 102, 241), 0.07)'
                          : undefined,
                        outline: isSelected
                          ? '2px solid var(--accent-color, #6366f1)'
                          : undefined,
                        outlineOffset: '-2px',
                        transition: 'background 0.15s',
                      }}
                    >
                      {/* Scheduled Time */}
                      <td>
                        <div
                          style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-primary)',
                            fontWeight: 600,
                          }}
                        >
                          {start.date}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {start.time} – {end.time}
                        </div>
                      </td>

                      {/* Vehicle */}
                      <td>
                        <div
                          style={{
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            fontSize: '0.875rem',
                          }}
                        >
                          {item.vehicleInfo.licensePlate}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {item.vehicleInfo.model}
                          {item.vehicleInfo.year ? ` · ${item.vehicleInfo.year}` : ''}
                        </div>
                      </td>

                      {/* Service Details */}
                      <td style={{ maxWidth: 200 }}>
                        <div
                          style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-primary)',
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 200,
                          }}
                          title={item.serviceDetails}
                        >
                          {item.serviceDetails}
                        </div>
                      </td>

                      {/* Staff */}
                      <td>
                        <div
                          style={{
                            fontSize: '0.875rem',
                            color:
                              item.assignedStaff.length === 0
                                ? 'var(--text-muted)'
                                : 'var(--text-primary)',
                            fontStyle:
                              item.assignedStaff.length === 0 ? 'italic' : 'normal',
                          }}
                        >
                          {staffNames}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.65rem',
                            borderRadius: 9999,
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            background: statusCfg.bg,
                            color: statusCfg.color,
                            letterSpacing: '0.01em',
                          }}
                        >
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* Source */}
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.2rem 0.55rem',
                            borderRadius: 9999,
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            ...sourceBadgeStyle(item.requestSource),
                          }}
                        >
                          {sourceLabel(item.requestSource)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {!loading && filteredItems.length > 0 && (
          <div
            style={{
              marginTop: '1rem',
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              textAlign: 'right',
            }}
          >
            Hiển thị <strong>{filteredItems.length}</strong> / {items.length} công việc
          </div>
        )}
      </div>

      {/* ── Create Work Order Modal ── */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '2rem 1rem',
            background: 'rgba(0, 0, 0, 0.45)',
            overflowY: 'auto',
          }}
          onClick={e => {
            // Close when clicking the backdrop (not the dialog itself)
            if (e.target === e.currentTarget) setShowCreateModal(false);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 680,
              background: 'var(--bg-card)',
              borderRadius: 18,
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
              >
                <FiPlus style={{ color: 'var(--accent-color)' }} />
                Tạo công việc mới
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  border: 'none',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-muted)',
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'color 0.15s',
                }}
              >
                <FiX />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem' }}>
              <WorkOrderForm
                onSubmitSuccess={handleCreateSuccess}
                onCancel={() => setShowCreateModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Spinner keyframes */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </AdminLayout>
  );
};

export default AdminWorkOrdersList;
