import React, { useState } from 'react';
import { WorkOrderDto, WorkOrderStatus } from '@/types';
import { updateWorkOrderStatus } from '@/features/workOrdersSlice';
import { useAppDispatch } from '@/hooks/useAppStore';

interface WorkOrderCardProps {
  workOrder: WorkOrderDto;
  onStatusUpdate?: (workOrderId: string, newStatus: WorkOrderStatus) => void;
}

// Returns the left-border color for each status
function getStatusBorderColor(status: WorkOrderStatus): string {
  switch (status) {
    case 'Accepted':   return '#3b82f6'; // blue
    case 'InProgress': return '#f97316'; // orange
    case 'Completed':  return '#22c55e'; // green
    case 'Expired':    return '#ef4444'; // red
    case 'Pending':    return '#f59e0b'; // amber
    case 'Rejected':   return '#6b7280'; // gray
    default:           return '#6b7280';
  }
}

// Returns the badge background and text colors for each status
function getStatusBadgeStyle(status: WorkOrderStatus): { background: string; color: string } {
  switch (status) {
    case 'Accepted':   return { background: 'rgba(59,130,246,0.15)',  color: '#3b82f6' };
    case 'InProgress': return { background: 'rgba(249,115,22,0.15)',  color: '#f97316' };
    case 'Completed':  return { background: 'rgba(34,197,94,0.15)',   color: '#22c55e' };
    case 'Expired':    return { background: 'rgba(239,68,68,0.15)',   color: '#ef4444' };
    case 'Pending':    return { background: 'rgba(245,158,11,0.15)',  color: '#f59e0b' };
    case 'Rejected':   return { background: 'rgba(107,114,128,0.15)', color: '#6b7280' };
    default:           return { background: 'rgba(107,114,128,0.15)', color: '#6b7280' };
  }
}

// Human-readable status labels (Vietnamese)
function getStatusLabel(status: WorkOrderStatus): string {
  switch (status) {
    case 'Pending':    return 'Chờ duyệt';
    case 'Accepted':   return 'Đã chấp nhận';
    case 'Rejected':   return 'Đã từ chối';
    case 'InProgress': return 'Đang thực hiện';
    case 'Completed':  return 'Hoàn thành';
    case 'Expired':    return 'Hết giờ';
    default:           return status;
  }
}

// Format ISO datetime -> "HH:mm – HH:mm · DD/MM/YYYY"
function formatScheduledTime(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const pad = (n: number) => String(n).padStart(2, '0');
  const startStr = `${pad(s.getHours())}:${pad(s.getMinutes())}`;
  const endStr   = `${pad(e.getHours())}:${pad(e.getMinutes())}`;
  const date     = `${pad(s.getDate())}/${pad(s.getMonth() + 1)}/${s.getFullYear()}`;
  return `${startStr} – ${endStr} · ${date}`;
}

// Calculate minutes remaining until the scheduled end time
function getMinutesLeft(scheduledEndTime: string): number {
  const now = Date.now();
  const end = new Date(scheduledEndTime).getTime();
  return Math.floor((end - now) / 60000);
}

const WorkOrderCard: React.FC<WorkOrderCardProps> = ({ workOrder, onStatusUpdate }) => {
  const dispatch = useAppDispatch();
  const [localStatus, setLocalStatus] = useState<WorkOrderStatus>(workOrder.workOrderStatus);
  const [error, setError] = useState<string | null>(null);

  const borderColor = getStatusBorderColor(localStatus);
  const badgeStyle  = getStatusBadgeStyle(localStatus);
  const minutesLeft = getMinutesLeft(workOrder.scheduledEndTime);

  const inactiveStatuses: WorkOrderStatus[] = ['Completed', 'Expired', 'Rejected'];
  const showExpiringSoon =
    minutesLeft <= 30 &&
    minutesLeft > 0 &&
    !inactiveStatuses.includes(localStatus);
  const showExpired = localStatus === 'Expired';

  const handleStatusChange = async (newStatus: WorkOrderStatus) => {
    const previousStatus = localStatus;
    setLocalStatus(newStatus);
    setError(null);

    const result = await dispatch(
      updateWorkOrderStatus({ id: workOrder.id, data: { newStatus } })
    );

    if (updateWorkOrderStatus.rejected.match(result)) {
      setLocalStatus(previousStatus);
      setError((result.payload as string) || 'Không thể cập nhật trạng thái. Vui lòng thử lại.');
    } else {
      onStatusUpdate?.(workOrder.id, newStatus);
    }
  };

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: 12,
        padding: '1rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        position: 'relative',
      }}
    >
      {/* Header row: time + status badge(s) */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          🕐 {formatScheduledTime(workOrder.scheduledStartTime, workOrder.scheduledEndTime)}
        </span>

        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Expiring-soon warning */}
          {showExpiringSoon && (
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: 20,
                background: 'rgba(249,115,22,0.15)',
                color: '#f97316',
              }}
            >
              ⚠️ Sắp hết giờ
            </span>
          )}

          {/* Expired badge */}
          {showExpired && (
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: 20,
                background: 'rgba(239,68,68,0.15)',
                color: '#ef4444',
              }}
            >
              Đã hết giờ
            </span>
          )}

          {/* Status badge */}
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: 20,
              background: badgeStyle.background,
              color: badgeStyle.color,
            }}
          >
            {getStatusLabel(localStatus)}
          </span>
        </div>
      </div>

      {/* Vehicle info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.9rem' }}>🚗</span>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {workOrder.vehicleInfo.licensePlate}
        </span>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          · {workOrder.vehicleInfo.model}
        </span>
      </div>

      {/* Service details (clamped to 2 lines) */}
      <p
        style={{
          fontSize: '0.825rem',
          color: 'var(--text-secondary)',
          margin: 0,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2,
          lineHeight: 1.5,
        } as React.CSSProperties}
      >
        {workOrder.serviceDetails}
      </p>

      {/* Customer name (optional) */}
      {workOrder.customerName && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          👤 {workOrder.customerName}
        </div>
      )}

      {/* Inline error */}
      {error && (
        <div
          style={{
            fontSize: '0.8rem',
            color: '#ef4444',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8,
            padding: '0.4rem 0.75rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Action buttons */}
      {localStatus === 'Accepted' && (
        <button
          type="button"
          onClick={() => handleStatusChange('InProgress')}
          style={{
            alignSelf: 'flex-start',
            padding: '0.5rem 1rem',
            borderRadius: 8,
            border: 'none',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.825rem',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(59,130,246,0.3)',
          }}
        >
          ▶ Bắt đầu
        </button>
      )}

      {localStatus === 'InProgress' && (
        <button
          type="button"
          onClick={() => handleStatusChange('Completed')}
          style={{
            alignSelf: 'flex-start',
            padding: '0.5rem 1rem',
            borderRadius: 8,
            border: 'none',
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.825rem',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(34,197,94,0.3)',
          }}
        >
          ✓ Hoàn thành
        </button>
      )}

      {localStatus === 'Expired' && (
        <button
          type="button"
          onClick={() => handleStatusChange('Completed')}
          style={{
            alignSelf: 'flex-start',
            padding: '0.5rem 1rem',
            borderRadius: 8,
            border: 'none',
            background: 'linear-gradient(135deg, #f97316 0%, #22c55e 100%)',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.825rem',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(249,115,22,0.3)',
          }}
        >
          ✓ Đánh dấu hoàn thành
        </button>
      )}
    </div>
  );
};

export default WorkOrderCard;
