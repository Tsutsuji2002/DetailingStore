import React, { useEffect, useState } from 'react';
import { FiCalendar, FiCheckCircle, FiCheck, FiAlertCircle } from 'react-icons/fi';
import StaffLayout from '@/components/layout/StaffLayout';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { fetchShiftConfigsThunk, fetchAssignedShiftsThunk } from '@/features/workShiftsSlice';
import { fetchBookingsThunk, updateBookingStatusThunk } from '@/features/bookingsSlice';
import type { BookingStatusType } from '@/types';

interface ToastState {
  type: 'success' | 'error';
  text: string;
}

const StaffSchedulePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { configs, shifts } = useAppSelector((s) => s.workShifts);
  const { items: bookings, loading: bookingsLoading } = useAppSelector((s) => s.bookings);

  const [toastMsg, setToastMsg] = useState<ToastState | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    dispatch(fetchShiftConfigsThunk());
    dispatch(fetchAssignedShiftsThunk());
    dispatch(fetchBookingsThunk());
  }, [dispatch]);

  const toggleJobStatus = async (id: string, currentStatus: string) => {
    const statusMap: Record<string, string> = {
      Pending: 'InProgress',
      pending: 'InProgress',
      Confirmed: 'InProgress',
      InProgress: 'Completed',
      in_progress: 'Completed',
      Completed: 'Pending',
      completed: 'Pending',
    };

    const nextStatus = statusMap[currentStatus] || 'InProgress';
    try {
      await dispatch(updateBookingStatusThunk({ id, status: nextStatus })).unwrap();
      showToast('Đã cập nhật trạng thái tiến độ xe!');
    } catch (err: any) {
      showToast(typeof err === 'string' ? err : err?.message || 'Không thể cập nhật trạng thái.', 'error');
    }
  };

  const myShifts = shifts.filter((s) => !user?.id || s.staffId === user.id);

  const getStatusBadge = (status: BookingStatusType) => {
    const s = String(status).toLowerCase();
    if (s === 'completed' || s === 'đã xong') {
      return { label: '✓ Đã Xong', bg: '#dcfce7', color: '#15803d' };
    }
    if (s === 'inprogress' || s === 'in_progress' || s === 'đang làm') {
      return { label: '⚡ Đang Làm', bg: '#fef3c7', color: '#b45309' };
    }
    return { label: '⏳ Chờ Nhận Xe', bg: '#fee2e2', color: '#b91c1c' };
  };

  return (
    <StaffLayout>
      {/* Floating Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 99999,
            background: toastMsg.type === 'error' ? '#fef2f2' : '#dcfce7',
            color: toastMsg.type === 'error' ? '#991b1b' : '#15803d',
            border: `1px solid ${toastMsg.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
            padding: '0.85rem 1.35rem',
            borderRadius: '14px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.925rem',
          }}>
          {toastMsg.type === 'error' ? <FiAlertCircle style={{ fontSize: '1.2rem' }} /> : <FiCheck style={{ fontSize: '1.2rem' }} />}
          {toastMsg.text}
        </div>
      )}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Chào {user?.fullName || 'Anh Em Kỹ Thuật'} 🛠️</h1>
          <p className="admin-page-sub">Xem ca làm việc hôm nay & danh sách xe được phân công tiếp nhận</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        {/* Shifts List */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FiCalendar /> Ca Làm Việc Được Phân Công ({myShifts.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myShifts.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: 12 }}>
                Bạn chưa được phân ca trực nào.
              </div>
            ) : (
              myShifts.map((s) => {
                const cfg = configs.find((c) => c.id === s.shiftTypeId);

                return (
                  <div
                    key={s.id}
                    style={{
                      padding: '1rem',
                      borderRadius: 12,
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Ngày: {s.date}</div>
                      <div style={{ fontSize: '0.825rem', color: cfg?.color || 'var(--accent-primary)', fontWeight: 600, marginTop: '0.2rem' }}>
                        {cfg ? `${cfg.name} (${cfg.startTime} – ${cfg.endTime})` : 'Ca Trực'}
                      </div>
                      {s.notes && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Ghi chú: {s.notes}</div>}
                    </div>
                    <span
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: 9999,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: cfg?.color ? `${cfg.color}18` : 'var(--bg-card)',
                        color: cfg?.color || 'var(--text-primary)',
                        border: `1px solid ${cfg?.color || 'var(--border-color)'}`,
                      }}>
                      {cfg?.name || s.shiftTypeId}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Vehicle Assignment checklist */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FiCheckCircle /> Xe Cần Làm Hôm Nay ({bookings.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bookingsLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Đang tải lịch xe...</div>
            ) : bookings.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: 12 }}>
                Chưa có xe nào được phân công hôm nay.
              </div>
            ) : (
              bookings.map((j) => {
                const badge = getStatusBadge(j.status);

                return (
                  <div key={j.id} style={{ padding: '1rem', borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-primary)', background: 'var(--accent-light)', padding: '0.15em 0.5em', borderRadius: 6, marginRight: 6 }}>
                          {j.licensePlate}
                        </span>
                        <strong style={{ fontSize: '0.95rem' }}>
                          {j.customerName} ({j.vehicleModel})
                        </strong>
                      </div>
                      <button
                        onClick={() => toggleJobStatus(j.id, j.status)}
                        style={{
                          padding: '0.25rem 0.65rem',
                          borderRadius: 9999,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                          background: badge.bg,
                          color: badge.color,
                        }}
                        title="Bấm để chuyển trạng thái">
                        {badge.label}
                      </button>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-primary)', background: 'var(--bg-card)', padding: '0.15rem 0.5rem', borderRadius: 6, border: '1px solid var(--border-color)' }}>
                        ⏱️ Hạn xong: {j.estimatedCompletion || 'Trong ngày'}
                      </span>
                      {j.assignedStaffName && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(Thợ: {j.assignedStaffName})</span>}
                    </div>

                    {j.notes && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '0.4rem 0.6rem', borderRadius: 6 }}>📝 {j.notes}</div>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default StaffSchedulePage;
