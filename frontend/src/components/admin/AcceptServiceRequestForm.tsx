import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiCalendar, FiUsers, FiDollarSign, FiFileText } from 'react-icons/fi';
import { useAppDispatch } from '@/hooks/useAppStore';
import { acceptServiceRequest } from '@/features/serviceRequestsSlice';
import type { ServiceRequestDto, AcceptServiceRequestDto } from '@/types';
import TimeSlotPicker, { TIME_PRESETS } from '@/components/ui/TimeSlotPicker';
import type { TimePresetKey } from '@/components/ui/TimeSlotPicker';
import AvailableStaffSelector from '@/components/ui/AvailableStaffSelector';

// ── Props ─────────────────────────────────────────────────────────────────────

interface AcceptServiceRequestFormProps {
  serviceRequest: ServiceRequestDto;
  onSave: () => void;
  onCancel: () => void;
}

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

// ── Main component ────────────────────────────────────────────────────────────

const AcceptServiceRequestForm: React.FC<AcceptServiceRequestFormProps> = ({
  serviceRequest,
  onSave,
  onCancel,
}) => {
  const dispatch = useAppDispatch();

  // ── Form state ──────────────────────────────────────────────────────────────

  const [date, setDate] = useState<string>(serviceRequest.preferredDate ?? '');
  const [selectedPreset, setSelectedPreset] = useState<string>('morning');
  const [customStartTime, setCustomStartTime] = useState<string>('');
  const [customEndTime, setCustomEndTime] = useState<string>('');
  const [scheduledStartTime, setScheduledStartTime] = useState<string>('');
  const [scheduledEndTime, setScheduledEndTime] = useState<string>('');
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [priceQuote, setPriceQuote] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Auto-resolve times on mount / when date changes for non-custom presets ──

  useEffect(() => {
    if (date && selectedPreset !== 'custom') {
      const preset = TIME_PRESETS[selectedPreset as TimePresetKey];
      if (preset?.start && preset?.end) {
        setScheduledStartTime(`${date}T${preset.start}:00`);
        setScheduledEndTime(`${date}T${preset.end}:00`);
      }
    }
  }, [date]); // intentionally only on date change, not on every selectedPreset change (clicking buttons handles that)

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDate(newDate);

    // If a non-custom preset is active and date changes, recompute times
    if (selectedPreset !== 'custom' && newDate) {
      // TimeSlotPicker will recompute via onTimeChange when preset is re-applied
      // Reset scheduled times so AvailableStaffSelector hides until user reselects
      setScheduledStartTime('');
      setScheduledEndTime('');
    }
  };

  const handleTimeChange = (startTime: string, endTime: string) => {
    setScheduledStartTime(startTime);
    setScheduledEndTime(endTime);
  };

  const handleCustomTimeChange = (start: string, end: string) => {
    setCustomStartTime(start);
    setCustomEndTime(end);
  };

  // ── Submit ────────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!scheduledStartTime || !scheduledEndTime) {
      setError('Vui lòng chọn khung giờ làm việc.');
      return;
    }

    if (!priceQuote || parseFloat(priceQuote) <= 0) {
      setError('Vui lòng nhập báo giá (bắt buộc).');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload: AcceptServiceRequestDto = {
      scheduledStartTime,
      scheduledEndTime,
      assignedStaffIds: selectedStaffIds,
      priceQuote: priceQuote ? parseFloat(priceQuote) : undefined,
      adminNotes: adminNotes || undefined,
    };

    try {
      await dispatch(acceptServiceRequest({ id: serviceRequest.id, data: payload })).unwrap();
      onSave();
    } catch (err: any) {
      setError(typeof err === 'string' ? err : 'Lỗi khi chấp nhận yêu cầu dịch vụ.');
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Error banner ── */}
      {error && (
        <div
          style={{
            padding: '0.85rem 1rem',
            borderRadius: 10,
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <FiAlertTriangle />
          {error}
        </div>
      )}

      {/* ── Section 1: Scheduling ── */}
      <div>
        <SectionHeading icon={<FiCalendar />} label="Lịch làm việc" />

        {/* Date picker */}
        <div style={{ marginBottom: '1rem' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.83rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '0.4rem',
            }}
          >
            Ngày làm việc
          </label>
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            required
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 8,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Time slot picker */}
        <TimeSlotPicker
          date={date}
          selectedPreset={selectedPreset}
          onPresetChange={setSelectedPreset}
          customStartTime={customStartTime}
          customEndTime={customEndTime}
          onCustomTimeChange={handleCustomTimeChange}
          onTimeChange={handleTimeChange}
        />
      </div>

      {/* ── Section 2: Staff Assignment (only when times are set) ── */}
      {scheduledStartTime && scheduledEndTime && (
        <div>
          <SectionHeading icon={<FiUsers />} label="Phân công nhân viên" />
          <AvailableStaffSelector
            scheduledStartTime={scheduledStartTime}
            scheduledEndTime={scheduledEndTime}
            selectedStaffIds={selectedStaffIds}
            onSelectionChange={setSelectedStaffIds}
          />
        </div>
      )}

      {/* ── Section 3: Pricing & Notes ── */}
      <div>
        <SectionHeading icon={<FiDollarSign />} label="Giá & Ghi chú" />

        {/* Price quote */}
        <div style={{ marginBottom: '0.85rem' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.83rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '0.4rem',
            }}
          >
            Báo giá (VNĐ) *
          </label>
          <input
            type="number"
            min="0"
            step="1000"
            value={priceQuote}
            onChange={e => setPriceQuote(e.target.value)}
            placeholder="Nhập báo giá (tùy chọn)"
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 8,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Admin notes */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.83rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '0.4rem',
            }}
          >
            <FiFileText style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />
            Ghi chú nội bộ
          </label>
          <textarea
            value={adminNotes}
            onChange={e => setAdminNotes(e.target.value)}
            rows={3}
            placeholder="Ghi chú dành cho admin (tùy chọn)"
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 8,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box',
              resize: 'vertical',
              fontFamily: 'inherit',
              lineHeight: 1.5,
            }}
          />
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          type="submit"
          disabled={submitting}
          style={{
            flex: 1,
            minWidth: 140,
            padding: '0.65rem 1.25rem',
            borderRadius: 10,
            background: submitting
              ? 'var(--bg-secondary)'
              : 'var(--accent-gradient, linear-gradient(135deg, #10b981 0%, #059669 100%))',
            color: submitting ? 'var(--text-muted)' : 'white',
            fontWeight: 700,
            fontSize: '0.875rem',
            border: 'none',
            cursor: submitting ? 'not-allowed' : 'pointer',
            boxShadow: submitting ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.15s ease',
          }}
        >
          {submitting ? 'Đang xử lý...' : '✓ Xác nhận chấp nhận'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          style={{
            flex: 1,
            minWidth: 140,
            padding: '0.65rem 1.25rem',
            borderRadius: 10,
            border: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: submitting ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Hủy
        </button>
      </div>
    </form>
  );
};

export default AcceptServiceRequestForm;
