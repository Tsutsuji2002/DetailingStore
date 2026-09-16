import React, { useEffect } from 'react';
import { FiUser, FiClock, FiLoader } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { fetchAvailableStaff } from '@/features/workOrdersSlice';
import type { AvailableStaffDto } from '@/types';

// ── Props ─────────────────────────────────────────────────────────────────────

interface AvailableStaffSelectorProps {
  /** ISO datetime string or empty */
  scheduledStartTime: string;
  /** ISO datetime string or empty */
  scheduledEndTime: string;
  selectedStaffIds: string[];
  onSelectionChange: (staffIds: string[]) => void;
}

// ── Helper ────────────────────────────────────────────────────────────────────

function formatTime(timeStr: string): string {
  // timeStr may be "HH:mm:ss" or "HH:mm"
  return timeStr.slice(0, 5);
}

// ── Component ─────────────────────────────────────────────────────────────────

const AvailableStaffSelector: React.FC<AvailableStaffSelectorProps> = ({
  scheduledStartTime,
  scheduledEndTime,
  selectedStaffIds,
  onSelectionChange,
}) => {
  const dispatch = useAppDispatch();
  const availableStaff = useAppSelector((state) => state.workOrders.availableStaff);
  const staffLoading = useAppSelector((state) => state.workOrders.staffLoading);

  // Fetch available staff whenever both times are provided
  useEffect(() => {
    if (scheduledStartTime && scheduledEndTime) {
      dispatch(fetchAvailableStaff({ startTime: scheduledStartTime, endTime: scheduledEndTime }));
    }
  }, [dispatch, scheduledStartTime, scheduledEndTime]);

  const toggleStaff = (staffId: string) => {
    const isSelected = selectedStaffIds.includes(staffId);
    const updated = isSelected
      ? selectedStaffIds.filter((id) => id !== staffId)
      : [...selectedStaffIds, staffId];
    onSelectionChange(updated);
  };

  // ── Render states ──

  if (!scheduledStartTime || !scheduledEndTime) {
    return (
      <div
        style={{
          padding: '0.85rem 1rem',
          borderRadius: 10,
          border: '1px dashed var(--border-color)',
          background: 'var(--bg-secondary)',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          textAlign: 'center',
        }}
      >
        Chọn khung giờ để xem nhân viên khả dụng
      </div>
    );
  }

  if (staffLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '1.25rem',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
        }}
      >
        <FiLoader
          style={{
            animation: 'spin 1s linear infinite',
            fontSize: '1.1rem',
          }}
        />
        <span>Đang tải danh sách nhân viên...</span>

        {/* keyframes injected inline once */}
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (availableStaff.length === 0) {
    return (
      <div
        style={{
          padding: '0.85rem 1rem',
          borderRadius: 10,
          border: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          textAlign: 'center',
        }}
      >
        Không có nhân viên nào làm việc trong khung giờ này
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {/* Section label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <FiUser style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }} />
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Nhân viên khả dụng ({availableStaff.length})
        </span>
      </div>

      {/* Staff cards */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          maxHeight: 320,
          overflowY: 'auto',
          paddingRight: '0.25rem',
        }}
      >
        {availableStaff.map((staff: AvailableStaffDto) => {
          const isSelected = selectedStaffIds.includes(staff.staffId);

          return (
            <div
              key={staff.staffId}
              onClick={() => toggleStaff(staff.staffId)}
              role="checkbox"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  toggleStaff(staff.staffId);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.75rem',
                borderRadius: 10,
                border: isSelected
                  ? '2px solid transparent'
                  : '1px solid var(--border-color)',
                background: isSelected
                  ? 'linear-gradient(var(--bg-card), var(--bg-card)) padding-box, var(--accent-gradient) border-box'
                  : 'var(--bg-card)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                outline: 'none',
                userSelect: 'none',
              }}
            >
              {/* Avatar / initials */}
              <div
                style={{
                  flexShrink: 0,
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: isSelected
                    ? 'var(--accent-gradient)'
                    : 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isSelected ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.9rem',
                }}
              >
                {staff.profilePicture ? (
                  <img
                    src={staff.profilePicture}
                    alt={staff.staffName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <FiUser />
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)',
                    marginBottom: '0.3rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {staff.staffName}
                </div>

                {/* Shift badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  {staff.matchingShifts.map((shift, idx) => (
                    <span
                      key={idx}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: 6,
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <FiClock style={{ fontSize: '0.7rem' }} />
                      <strong>{shift.shiftTypeName}</strong>
                      &nbsp;{formatTime(shift.shiftStartTime)}–{formatTime(shift.shiftEndTime)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Checkbox indicator */}
              <div
                style={{
                  flexShrink: 0,
                  width: 20,
                  height: 20,
                  borderRadius: 5,
                  border: isSelected ? 'none' : '2px solid var(--border-color)',
                  background: isSelected ? 'var(--accent-gradient)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '0.75rem',
                  marginTop: '0.1rem',
                  transition: 'all 0.15s ease',
                }}
              >
                {isSelected && '✓'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selection summary */}
      {selectedStaffIds.length > 0 && (
        <div
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            textAlign: 'right',
          }}
        >
          Đã chọn {selectedStaffIds.length} nhân viên
        </div>
      )}
    </div>
  );
};

export default AvailableStaffSelector;
