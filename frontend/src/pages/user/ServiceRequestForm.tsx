import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';
import UserLayout from '@/components/layout/UserLayout';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { fetchServicesThunk } from '@/features/servicesSlice';
import { createServiceRequest } from '@/features/serviceRequestsSlice';
import type { CreateServiceRequestDto } from '@/types';

// ── Initial form state ────────────────────────────────────────────────────────

interface FormState {
  licensePlate: string;
  vehicleModel: string;
  vehicleYear: string;
  requestedServiceId: string;
  preferredDate: string;
  preferredTime: string;
  customerPhone: string;
  customerNotes: string;
}

const getDefaultDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const initialForm: FormState = {
  licensePlate: '',
  vehicleModel: '',
  vehicleYear: '',
  requestedServiceId: '',
  preferredDate: getDefaultDate(),
  preferredTime: '09:00',
  customerPhone: '',
  customerNotes: '',
};

// ── Component ─────────────────────────────────────────────────────────────────

const ServiceRequestForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const services = useAppSelector(s => s.services.items);
  const { loading } = useAppSelector(s => s.serviceRequests);
  const { showToast } = useToast();

  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    dispatch(fetchServicesThunk());
  }, [dispatch]);

  useEffect(() => {
    const serviceId = searchParams.get('serviceId');
    if (serviceId) {
      setForm(prev => ({ ...prev, requestedServiceId: serviceId }));
    }
  }, [searchParams]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormState]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormState> = {};
    if (!form.licensePlate.trim()) newErrors.licensePlate = 'Vui long nhap Biển số xe';
    if (!form.vehicleModel.trim()) newErrors.vehicleModel = 'Vui lòng nhập dòng xe';
    if (!form.customerPhone.trim()) newErrors.customerPhone = 'Vui lòng nhập số điện thoại';
    if (!form.requestedServiceId) newErrors.requestedServiceId = 'Vui long Chọn dịch vụ';
    if (!form.preferredDate) newErrors.preferredDate = 'Vui lòng chọn ngày mong muốn';
    if (!form.preferredTime) newErrors.preferredTime = 'Vui long chon Giờ mong muốn';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    const dto: CreateServiceRequestDto = {
      licensePlate: form.licensePlate.trim(),
      vehicleModel: form.vehicleModel.trim(),
      vehicleYear: form.vehicleYear ? parseInt(form.vehicleYear, 10) : undefined,
      requestedServiceId: form.requestedServiceId,
      preferredDate: form.preferredDate,
      preferredTime: form.preferredTime + ':00',
      customerPhone: form.customerPhone.trim(),
      customerNotes: form.customerNotes.trim() || undefined,
    };

    const result = await dispatch(createServiceRequest(dto));
    if (createServiceRequest.fulfilled.match(result)) {
      showToast({
        type: 'success',
        title: 'Yeu cau da duoc gui!',
        subtitle: 'Vui long kiem tra email de nhan xac nhan.',
      });
      setForm(initialForm);
      setErrors({});
    } else {
      const errMsg = (result.payload as string) || 'Da xay ra loi khi Gửi yêu cầu. Vui long thu lai.';
      console.error('[ServiceRequestForm] Submit failed:', errMsg, result);
      setSubmitError(errMsg);
    }
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: 680,
    margin: '2.5rem auto',
    padding: '0 1rem 3rem',
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-card)',
    borderRadius: 14,
    border: '1px solid var(--border-color)',
    padding: '2rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: '0.35rem',
  };

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '0.6rem 0.85rem',
    borderRadius: 8,
    border: `1px solid ${hasError ? '#ef4444' : 'var(--border-color)'}`,
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
  });

  const errorStyle: React.CSSProperties = {
    fontSize: '0.78rem',
    color: '#ef4444',
    marginTop: '0.25rem',
  };

  const fieldStyle: React.CSSProperties = {
    marginBottom: '1.25rem',
  };

  const submitBtnStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem 2rem',
    borderRadius: 9,
    border: 'none',
    background: 'var(--accent-gradient)',
    color: '#fff',
    fontWeight: 700,
    fontSize: '1rem',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
    transition: 'opacity 0.15s ease',
  };

  return (
    <UserLayout>
      <div style={containerStyle}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Gửi yêu cầu Dịch vụ
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem', fontSize: '0.95rem' }}>
            Dien thong tin ben duoi va chung toi se lien he xac nhan lich voi ban.
          </p>
        </div>

        {submitError && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '1rem 1.25rem', color: '#b91c1c', fontWeight: 500, marginBottom: '1.5rem' }}>
            {submitError}
          </div>
        )}

        <div style={cardStyle}>
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label htmlFor="licensePlate" style={labelStyle}>Biển số xe <span style={{ color: '#ef4444' }}>*</span></label>
                <input id="licensePlate" name="licensePlate" type="text" placeholder="51G-ABCDE" value={form.licensePlate} onChange={handleChange} style={inputStyle(!!errors.licensePlate)} />
                {errors.licensePlate && <p style={errorStyle}>{errors.licensePlate}</p>}
              </div>
              <div>
                <label htmlFor="vehicleModel" style={labelStyle}>Dòng xe <span style={{ color: '#ef4444' }}>*</span></label>
                <input id="vehicleModel" name="vehicleModel" type="text" placeholder="Thông tin hãng-dòng xe" value={form.vehicleModel} onChange={handleChange} style={inputStyle(!!errors.vehicleModel)} />
                {errors.vehicleModel && <p style={errorStyle}>{errors.vehicleModel}</p>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label htmlFor="vehicleYear" style={labelStyle}>Năm sản xuất</label>
                <input id="vehicleYear" name="vehicleYear" type="number" placeholder="xxxx" min={1990} max={new Date().getFullYear() + 1} value={form.vehicleYear} onChange={handleChange} style={inputStyle()} />
              </div>
              <div>
                <label htmlFor="customerPhone" style={labelStyle}>Số điện thoại <span style={{ color: '#ef4444' }}>*</span></label>
                <input id="customerPhone" name="customerPhone" type="tel" placeholder="xxxxxxxxxx" value={form.customerPhone} onChange={handleChange} style={inputStyle(!!errors.customerPhone)} />
                {errors.customerPhone && <p style={errorStyle}>{errors.customerPhone}</p>}
              </div>
            </div>

            <div style={fieldStyle}>
              <label htmlFor="requestedServiceId" style={labelStyle}>Dịch vụ <span style={{ color: '#ef4444' }}>*</span></label>
              <select id="requestedServiceId" name="requestedServiceId" value={form.requestedServiceId} onChange={handleChange} style={inputStyle(!!errors.requestedServiceId)}>
                <option value="">-- Chọn dịch vụ --</option>
                {services.filter(s => s.isActive).map(s => (
                  <option key={s.id} value={s.id}>{s.name}{s.priceFrom ? ` – tu ${s.priceFrom.toLocaleString('vi-VN')}d` : ''}</option>
                ))}
              </select>
              {errors.requestedServiceId && <p style={errorStyle}>{errors.requestedServiceId}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label htmlFor="preferredDate" style={labelStyle}>Ngày mong muốn <span style={{ color: '#ef4444' }}>*</span></label>
                <input id="preferredDate" name="preferredDate" type="date" value={form.preferredDate} onChange={handleChange} min={new Date().toISOString().split('T')[0]} style={inputStyle(!!errors.preferredDate)} />
                {errors.preferredDate && <p style={errorStyle}>{errors.preferredDate}</p>}
              </div>
              <div>
                <label htmlFor="preferredTime" style={labelStyle}>Giờ mong muốn <span style={{ color: '#ef4444' }}>*</span></label>
                <input id="preferredTime" name="preferredTime" type="time" value={form.preferredTime} onChange={handleChange} style={inputStyle(!!errors.preferredTime)} />
                {errors.preferredTime && <p style={errorStyle}>{errors.preferredTime}</p>}
              </div>
            </div>

            <div style={fieldStyle}>
              <label htmlFor="customerNotes" style={labelStyle}>Ghi chú</label>
              <textarea id="customerNotes" name="customerNotes" rows={3} placeholder="Thông tin thêm về tình trạng xe..." value={form.customerNotes} onChange={handleChange} style={{ ...inputStyle(), resize: 'vertical', minHeight: 80 }} />
            </div>

            <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
              <button type="submit" style={submitBtnStyle} disabled={loading}>
                {loading ? 'Dang gui...' : 'Gửi yêu cầu'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </UserLayout>
  );
};

export default ServiceRequestForm;