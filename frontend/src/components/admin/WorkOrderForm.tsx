import React, { useState } from 'react';
import {
  FiTruck,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiLoader,
  FiAlertTriangle,
  FiCheckCircle,
} from 'react-icons/fi';
import { useAppDispatch } from '@/hooks/useAppStore';
import { createWorkOrder } from '@/features/workOrdersSlice';
import TimeSlotPicker from '@/components/ui/TimeSlotPicker';
import AvailableStaffSelector from '@/components/ui/AvailableStaffSelector';
import type { CreateWorkOrderDto, VehicleInfoDto } from '@/types';

// ── Props ─────────────────────────────────────────────────────────────────────

interface WorkOrderFormProps {
  onSubmitSuccess: () => void;
  onCancel: () => void;
}

// ── Section Heading ───────────────────────────────────────────────────────────

const SectionHeading: React.FC<{ icon: React.ReactNode; label: string }> = ({
  icon,
  label,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '1rem',
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

// ── Input Field Helper ────────────────────────────────────────────────────────

interface FieldWrapperProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

const FieldWrapper: React.FC<FieldWrapperProps> = ({
  label,
  required,
  error,
  children,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
    <label
      style={{
        fontSize: '0.83rem',
        fontWeight: 600,
        color: 'var(--text-secondary)',
      }}
    >
      {label}
      {required && (
        <span style={{ color: '#ef4444', marginLeft: '0.2rem' }}>*</span>
      )}
    </label>
    {children}
    {error && (
      <span
        style={{
          fontSize: '0.75rem',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
        }}
      >
        <FiAlertTriangle style={{ fontSize: '0.7rem' }} />
        {error}
      </span>
    )}
  </div>
);

const inputStyle = (hasError?: boolean): React.CSSProperties => ({
  padding: '0.55rem 0.75rem',
  borderRadius: 8,
  border: `1px solid ${hasError ? '#ef4444' : 'var(--border-color)'}`,
  background: 'var(--bg-card)',
  color: 'var(--text-primary)',
  fontSize: '0.875rem',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
});

// ── Form State ────────────────────────────────────────────────────────────────

interface FormErrors {
  licensePlate?: string;
  vehicleModel?: string;
  serviceDetails?: string;
  date?: string;
  scheduledTime?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

const WorkOrderForm: React.FC<WorkOrderFormProps> = ({
  onSubmitSuccess,
  onCancel,
}) => {
  const dispatch = useAppDispatch();

  // ── Section 1: Vehicle Information ──
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [serviceDetails, setServiceDetails] = useState('');

  // ── Section 2: Customer Information ──
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // ── Section 3: Scheduling ──
  const [date, setDate] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('morning');
  const [customStartTime, setCustomStartTime] = useState('');
  const [customEndTime, setCustomEndTime] = useState('');
  const [scheduledStartTime, setScheduledStartTime] = useState('');
  const [scheduledEndTime, setScheduledEndTime] = useState('');

  // ── Section 4: Staff ──
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);

  // ── Section 5: Pricing & Notes ──
  const [priceQuote, setPriceQuote] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  // ── Form state ──
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    // Reset custom times when switching to non-custom
    if (preset !== 'custom') {
      setCustomStartTime('');
      setCustomEndTime('');
    }
  };

  const handleCustomTimeChange = (start: string, end: string) => {
    setCustomStartTime(start);
    setCustomEndTime(end);
  };

  const handleTimeChange = (start: string, end: string) => {
    setScheduledStartTime(start);
    setScheduledEndTime(end);
    // Clear time error once times are set
    if (start && end) {
      setErrors((prev) => ({ ...prev, scheduledTime: undefined }));
    }
  };

  // When date changes, clear the previously resolved times so user picks a fresh preset
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDate(newDate);
    setScheduledStartTime('');
    setScheduledEndTime('');
    setCustomStartTime('');
    setCustomEndTime('');
    setSelectedPreset('morning');
    setSelectedStaffIds([]);
    if (newDate) {
      setErrors((prev) => ({ ...prev, date: undefined }));
    }
  };

  // ── Validation ─────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!licensePlate.trim()) {
      newErrors.licensePlate = 'Biển số xe là bắt buộc.';
    }
    if (!vehicleModel.trim()) {
      newErrors.vehicleModel = 'Dòng xe là bắt buộc.';
    }
    if (!serviceDetails.trim()) {
      newErrors.serviceDetails = 'Chi tiết dịch vụ là bắt buộc.';
    }
    if (!date) {
      newErrors.date = 'Ngày thực hiện là bắt buộc.';
    }
    if (!scheduledStartTime || !scheduledEndTime) {
      newErrors.scheduledTime = 'Vui lòng chọn khung giờ thực hiện.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    const vehicleInfo: VehicleInfoDto = {
      licensePlate: licensePlate.trim(),
      model: vehicleModel.trim(),
      year: vehicleYear ? parseInt(vehicleYear, 10) : undefined,
    };

    const dto: CreateWorkOrderDto = {
      scheduledStartTime,
      scheduledEndTime,
      assignedStaffIds: selectedStaffIds,
      vehicleInfo,
      serviceDetails: serviceDetails.trim(),
      ...(customerName.trim() ? { customerName: customerName.trim() } : {}),
      ...(customerPhone.trim() ? { customerPhone: customerPhone.trim() } : {}),
      ...(customerEmail.trim() ? { customerEmail: customerEmail.trim() } : {}),
      ...(priceQuote ? { priceQuote: parseFloat(priceQuote) } : {}),
      ...(adminNotes.trim() ? { adminNotes: adminNotes.trim() } : {}),
    };

    setSubmitting(true);
    try {
      await dispatch(createWorkOrder(dto)).unwrap();
      onSubmitSuccess();
    } catch (err: any) {
      setSubmitError(
        typeof err === 'string'
          ? err
          : err?.message ?? 'Lỗi khi tạo công việc. Vui lòng thử lại.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem',
        }}
      >
        {/* ── Section 1: Vehicle Information ── */}
        <div>
          <SectionHeading icon={<FiTruck />} label="Thông tin xe" />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.85rem',
            }}
          >
            <FieldWrapper label="Biển số xe" required error={errors.licensePlate}>
              <input
                type="text"
                value={licensePlate}
                onChange={(e) => {
                  setLicensePlate(e.target.value);
                  if (e.target.value.trim()) {
                    setErrors((prev) => ({ ...prev, licensePlate: undefined }));
                  }
                }}
                placeholder="51A-123.45"
                style={inputStyle(!!errors.licensePlate)}
              />
            </FieldWrapper>

            <FieldWrapper label="Dòng xe" required error={errors.vehicleModel}>
              <input
                type="text"
                value={vehicleModel}
                onChange={(e) => {
                  setVehicleModel(e.target.value);
                  if (e.target.value.trim()) {
                    setErrors((prev) => ({ ...prev, vehicleModel: undefined }));
                  }
                }}
                placeholder="Toyota Camry"
                style={inputStyle(!!errors.vehicleModel)}
              />
            </FieldWrapper>

            <FieldWrapper label="Năm sản xuất">
              <input
                type="number"
                value={vehicleYear}
                onChange={(e) => setVehicleYear(e.target.value)}
                placeholder="2022"
                min={1900}
                max={new Date().getFullYear() + 1}
                style={inputStyle()}
              />
            </FieldWrapper>
          </div>

          <div style={{ marginTop: '0.85rem' }}>
            <FieldWrapper
              label="Chi tiết dịch vụ"
              required
              error={errors.serviceDetails}
            >
              <textarea
                value={serviceDetails}
                onChange={(e) => {
                  setServiceDetails(e.target.value);
                  if (e.target.value.trim()) {
                    setErrors((prev) => ({
                      ...prev,
                      serviceDetails: undefined,
                    }));
                  }
                }}
                placeholder="Mô tả công việc cần thực hiện..."
                rows={3}
                style={{
                  ...inputStyle(!!errors.serviceDetails),
                  resize: 'vertical',
                  lineHeight: 1.5,
                }}
              />
            </FieldWrapper>
          </div>
        </div>

        {/* ── Section 2: Customer Information ── */}
        <div>
          <SectionHeading icon={<FiUser />} label="Thông tin khách hàng (tuỳ chọn)" />

          {/* Walk-in checkbox */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.85rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              checked={isWalkIn}
              onChange={(e) => setIsWalkIn(e.target.checked)}
              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--accent-color)' }}
            />
            Khách vãng lai (không có tài khoản)
          </label>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.85rem',
            }}
          >
            <FieldWrapper label="Tên khách hàng">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Họ và tên"
                style={inputStyle()}
              />
            </FieldWrapper>

            <FieldWrapper label="Số điện thoại">
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="0901234567"
                style={inputStyle()}
              />
            </FieldWrapper>

            {!isWalkIn && (
              <FieldWrapper label="Email">
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="email@example.com"
                  style={inputStyle()}
                />
              </FieldWrapper>
            )}
          </div>
        </div>

        {/* ── Section 3: Scheduling ── */}
        <div>
          <SectionHeading icon={<FiCalendar />} label="Lịch thực hiện" />

          {/* Date picker */}
          <div style={{ marginBottom: '1rem' }}>
            <FieldWrapper label="Ngày thực hiện" required error={errors.date}>
              <input
                type="date"
                value={date}
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]}
                style={inputStyle(!!errors.date)}
              />
            </FieldWrapper>
          </div>

          {/* Time slot picker – only active after a date is chosen */}
          {date ? (
            <TimeSlotPicker
              date={date}
              selectedPreset={selectedPreset}
              onPresetChange={handlePresetChange}
              customStartTime={customStartTime}
              customEndTime={customEndTime}
              onCustomTimeChange={handleCustomTimeChange}
              onTimeChange={handleTimeChange}
            />
          ) : (
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
              Chọn ngày để hiển thị khung giờ
            </div>
          )}

          {/* Scheduling error */}
          {errors.scheduledTime && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                marginTop: '0.5rem',
                fontSize: '0.75rem',
                color: '#ef4444',
              }}
            >
              <FiAlertTriangle style={{ fontSize: '0.7rem' }} />
              {errors.scheduledTime}
            </span>
          )}
        </div>

        {/* ── Section 4: Staff Assignment ── */}
        {scheduledStartTime && scheduledEndTime && (
          <div>
            <SectionHeading icon={<FiUser />} label="Phân công nhân viên" />
            <AvailableStaffSelector
              scheduledStartTime={scheduledStartTime}
              scheduledEndTime={scheduledEndTime}
              selectedStaffIds={selectedStaffIds}
              onSelectionChange={setSelectedStaffIds}
            />
          </div>
        )}

        {/* ── Section 5: Pricing & Notes ── */}
        <div>
          <SectionHeading icon={<FiDollarSign />} label="Giá & ghi chú" />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.85rem',
            }}
          >
            <FieldWrapper label="Báo giá (VNĐ)">
              <input
                type="number"
                value={priceQuote}
                onChange={(e) => setPriceQuote(e.target.value)}
                placeholder="500000"
                min={0}
                step={1000}
                style={inputStyle()}
              />
            </FieldWrapper>
          </div>

          <div style={{ marginTop: '0.85rem' }}>
            <FieldWrapper label="Ghi chú nội bộ">
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Ghi chú dành cho nhân viên hoặc quản trị viên..."
                rows={3}
                style={{
                  ...inputStyle(),
                  resize: 'vertical',
                  lineHeight: 1.5,
                }}
              />
            </FieldWrapper>
          </div>
        </div>

        {/* ── Submit error ── */}
        {submitError && (
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 10,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
            }}
          >
            <FiAlertTriangle style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            {submitError}
          </div>
        )}

        {/* ── Action Buttons ── */}
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'flex-end',
            paddingTop: '0.25rem',
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            style={{
              padding: '0.65rem 1.4rem',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.6 : 1,
              transition: 'opacity 0.15s ease',
            }}
          >
            Hủy
          </button>

          <button
            type="submit"
            disabled={submitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.65rem 1.6rem',
              borderRadius: 10,
              border: 'none',
              background: submitting ? 'var(--bg-secondary)' : 'var(--accent-gradient)',
              color: submitting ? 'var(--text-muted)' : '#fff',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: submitting
                ? 'none'
                : '0 4px 12px rgba(var(--accent-rgb, 99 102 241), 0.35)',
              transition: 'all 0.15s ease',
            }}
          >
            {submitting ? (
              <>
                <FiLoader
                  style={{ animation: 'spin 1s linear infinite', fontSize: '0.9rem' }}
                />
                Đang tạo...
              </>
            ) : (
              <>
                <FiCheckCircle style={{ fontSize: '0.9rem' }} />
                Tạo công việc
              </>
            )}
          </button>
        </div>
      </div>

      {/* Spinner keyframes (injected once) */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </form>
  );
};

export default WorkOrderForm;
