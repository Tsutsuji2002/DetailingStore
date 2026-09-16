import React, { useEffect, useState, useRef } from 'react';
import { FiTool, FiRefreshCw } from 'react-icons/fi';
import StaffLayout from '@/components/layout/StaffLayout';
import WorkOrderCard from '@/components/staff/WorkOrderCard';
import { fetchWorkOrders } from '@/features/workOrdersSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { WorkOrderDto, WorkOrderStatus } from '@/types';

type FilterTab = 'all' | 'upcoming' | 'inprogress' | 'completed' | 'expired';

const TAB_CONFIG: { key: FilterTab; label: string }[] = [
  { key: 'all',        label: 'Tất cả' },
  { key: 'upcoming',   label: 'Sắp tới' },
  { key: 'inprogress', label: 'Đang làm' },
  { key: 'completed',  label: 'Đã hoàn thành' },
  { key: 'expired',    label: 'Hết hạn' },
];

function filterOrders(orders: WorkOrderDto[], tab: FilterTab): WorkOrderDto[] {
  const now = Date.now();
  switch (tab) {
    case 'upcoming':
      return orders.filter(
        (o) =>
          (o.workOrderStatus === 'Pending' || o.workOrderStatus === 'Accepted') &&
          new Date(o.scheduledStartTime).getTime() >= now
      );
    case 'inprogress':
      return orders.filter((o) => o.workOrderStatus === 'InProgress');
    case 'completed':
      return orders.filter((o) => o.workOrderStatus === 'Completed');
    case 'expired':
      return orders.filter((o) => o.workOrderStatus === 'Expired');
    case 'all':
    default:
      return orders;
  }
}

const StaffWorkOrdersList: React.FC = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.workOrders.items);
  const loading = useAppSelector((s) => s.workOrders.loading);

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [hasLoaded, setHasLoaded] = useState(false);

  // Initial load
  useEffect(() => {
    dispatch(fetchWorkOrders()).finally(() => setHasLoaded(true));
  }, [dispatch]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchWorkOrders());
    }, 120_000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleStatusUpdate = (_id: string, _newStatus: WorkOrderStatus) => {
    // WorkOrderCard already updates Redux state via dispatch; nothing extra needed here.
    // A full refresh ensures the tab counters are recalculated.
    dispatch(fetchWorkOrders());
  };

  // Sort all items by scheduledStartTime ascending (earliest first)
  const sorted = [...items].sort(
    (a, b) =>
      new Date(a.scheduledStartTime).getTime() - new Date(b.scheduledStartTime).getTime()
  );

  const displayed = filterOrders(sorted, activeTab);

  const tabCount = (tab: FilterTab) => filterOrders(sorted, tab).length;

  const isInitialLoading = loading && !hasLoaded;

  return (
    <StaffLayout>
      {/* Page header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">
            <FiTool /> Công Việc Của Tôi
          </h1>
          <p className="admin-page-subtitle">
            Danh sách các công việc được phân công cho bạn
          </p>
        </div>
        <button
          onClick={() => dispatch(fetchWorkOrders())}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            borderRadius: 8,
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            color: 'var(--text-secondary)',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '0.85rem',
            opacity: loading ? 0.6 : 1,
          }}
        >
          <FiRefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Làm mới
        </button>
      </div>

      {/* Filter tabs */}
      <div className="tabs-nav" style={{ marginBottom: '1rem' }}>
        {TAB_CONFIG.map((t) => (
          <button
            key={t.key}
            className={activeTab === t.key ? 'active' : ''}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label} ({tabCount(t.key)})
          </button>
        ))}
      </div>

      {/* Content area */}
      {isInitialLoading ? (
        /* Loading spinner (initial load only) */
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 200,
            flexDirection: 'column',
            gap: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '3px solid var(--border-color)',
              borderTopColor: 'var(--accent-primary)',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <span>Đang tải công việc...</span>
        </div>
      ) : displayed.length === 0 ? (
        /* Empty state */
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 220,
            color: 'var(--text-muted)',
            gap: '0.75rem',
          }}
        >
          <FiTool size={40} style={{ opacity: 0.3 }} />
          <p style={{ fontSize: '0.95rem', margin: 0 }}>
            {activeTab === 'all'
              ? 'Bạn chưa có công việc nào được phân công'
              : 'Không có công việc nào trong mục này'}
          </p>
        </div>
      ) : (
        /* Card grid */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1rem',
          }}
        >
          {displayed.map((wo) => (
            <WorkOrderCard
              key={wo.id}
              workOrder={wo}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      )}

      {/* Spin animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </StaffLayout>
  );
};

export default StaffWorkOrdersList;
