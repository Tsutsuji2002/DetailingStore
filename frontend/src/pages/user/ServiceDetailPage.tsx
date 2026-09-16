import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiPhone, FiCheckCircle } from 'react-icons/fi';
import UserLayout from '@/components/layout/UserLayout';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { fetchServicesThunk } from '@/features/servicesSlice';
import { createServiceRequest } from '@/features/serviceRequestsSlice';
import { useToast } from '@/context/ToastContext';
import type { CreateServiceRequestDto } from '@/types';
import './ServiceDetailPage.css';

const ServiceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { items, categories } = useAppSelector(s => s.services);
  const service = items.find(s => s.slug === slug);
  const [selectedImg, setSelectedImg] = useState(0);

  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({ licensePlate: '', vehicleModel: '', vehicleYear: '', preferredDate: '', preferredTime: '', customerNotes: '' });
  const [bookingErrors, setBookingErrors] = useState<Record<string, string>>({});
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchServicesThunk());
  }, [dispatch]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!bookingForm.licensePlate.trim()) errs.licensePlate = 'Vui lòng nhập biển số xe';
    if (!bookingForm.vehicleModel.trim()) errs.vehicleModel = 'Vui lòng nhập dòng xe';
    if (!bookingForm.preferredDate) errs.preferredDate = 'Vui lòng chọn ngày';
    if (!bookingForm.preferredTime) errs.preferredTime = 'Vui lòng chọn giờ';
    if (Object.keys(errs).length > 0) { setBookingErrors(errs); return; }

    setBookingSubmitting(true);
    if (!service) return;
    const dto: CreateServiceRequestDto = {
      licensePlate: bookingForm.licensePlate.trim(),
      vehicleModel: bookingForm.vehicleModel.trim(),
      vehicleYear: bookingForm.vehicleYear ? parseInt(bookingForm.vehicleYear) : undefined,
      requestedServiceId: service.id,
      preferredDate: bookingForm.preferredDate,
      preferredTime: bookingForm.preferredTime + ':00',
      customerPhone: '',
      customerNotes: bookingForm.customerNotes.trim() || undefined,
    };
    const result = await dispatch(createServiceRequest(dto));
    setBookingSubmitting(false);
    if (createServiceRequest.fulfilled.match(result)) {
      setShowBookingModal(false);
      setBookingForm({ licensePlate: '', vehicleModel: '', vehicleYear: '', preferredDate: '', preferredTime: '', customerNotes: '' });
      setBookingErrors({});
      showToast({ type: 'success', title: 'Đã gửi yêu cầu!', subtitle: 'Chúng tôi sẽ liên hệ xác nhận lịch với bạn.' });
    } else {
      showToast({ type: 'info', title: 'Gửi thất bại', subtitle: (result.payload as string) || 'Vui lòng thử lại.' });
    }
  };

  if (!service) return (
    <UserLayout>
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Dịch vụ không tồn tại.</h2>
        <Link to="/services" className="btn-back">← Về danh sách dịch vụ</Link>
      </div>
    </UserLayout>
  );

  const category = categories.find(c => c.id === service.categoryId);

  return (
    <UserLayout>
      <div className="page-hero">
        <div className="container">
          <Link to="/services" className="back-link"><FiArrowLeft /> Dịch Vụ</Link>
          <h1 className="page-hero-title">{service.name}</h1>
        </div>
      </div>

      <div className="container svc-detail-layout">
        {/* Left: Images */}
        <div className="svc-images">
          <div className="svc-main-img">
            <img src={service.images[selectedImg] || service.images[0]} alt={service.name} />
          </div>
          {service.images.length > 1 && (
            <div className="svc-thumbs">
              {service.images.map((img, i) => (
                <button key={i} className={`svc-thumb ${selectedImg === i ? 'active' : ''}`} onClick={() => setSelectedImg(i)}>
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="svc-info">
          {category && <div className="svc-cat">{category.icon} {category.name}</div>}
          <h2 className="svc-info-title">{service.name}</h2>
          <p className="svc-short-desc">{service.shortDescription}</p>

          <div className="svc-price-box">
            <div className="svc-price-row">
              <span className="price-label">Giá Dịch Vụ:</span>
              <div className="svc-price-value">
                <span className="price-main-lg">{service.priceFrom.toLocaleString('vi-VN')}₫</span>
                {service.priceTo && <span className="price-dash">–</span>}
                {service.priceTo && <span className="price-to-lg">{service.priceTo.toLocaleString('vi-VN')}₫</span>}
              </div>
            </div>
            {service.duration && (
              <div className="svc-duration"><FiClock /> Thời gian: <strong>{service.duration}</strong></div>
            )}
            <p className="price-note">* Giá cuối có thể thay đổi tùy tình trạng xe. Liên hệ để được báo giá chính xác.</p>
          </div>

          <div className="svc-tags">
            {service.tags.map(t => <span key={t} className="tag-chip">#{t}</span>)}
          </div>

          <div className="svc-contact-btns">
            <a href="tel:0901234567" className="btn-call"><FiPhone /> Gọi Ngay: 0901 234 567</a>
            <button onClick={() => setShowBookingModal(true)} className="btn-book" style={{ cursor: 'pointer', border: 'none' }}>
              Đặt Lịch Dịch Vụ
            </button>
          </div>
        </div>

        {/* Full description */}
        <div className="svc-description">
          <h3>Mô Tả Chi Tiết</h3>
          <div className="svc-desc-content" dangerouslySetInnerHTML={{ __html: service.description }} />
        </div>

        <div className="svc-guarantees">
          <h3>Cam Kết Dịch Vụ</h3>
          <div className="guarantee-list">
            {['Thợ lành nghề, được đào tạo chuyên nghiệp', 'Sử dụng sản phẩm/phụ tùng chính hãng', 'Bảo hành sau dịch vụ theo quy định', 'Báo giá trước khi thực hiện, không phát sinh ẩn', 'Hoàn tiền 100% nếu không đạt yêu cầu'].map(g => (
              <div key={g} className="guarantee-item"><FiCheckCircle className="check-icon" /> {g}</div>
            ))}
          </div>
        </div>
      </div>
      {/* Booking Modal */}
      {showBookingModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '1rem' }}
          onClick={() => setShowBookingModal(false)}
        >
          <div
            style={{ background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border-color)', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.6)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Đặt Lịch Dịch Vụ</h2>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--accent-color, #6366f1)', fontWeight: 600 }}>{service.name}</p>
              </div>
              <button onClick={() => setShowBookingModal(false)} style={{ border: 'none', background: 'none', fontSize: '1.25rem', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
            </div>
            {/* Form */}
            <form onSubmit={handleBookingSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Biển số xe *</label>
                  <input type="text" value={bookingForm.licensePlate} onChange={e => { setBookingForm(f => ({...f, licensePlate: e.target.value})); setBookingErrors(er => ({...er, licensePlate: ''})); }} placeholder="51G-123.45" style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 8, border: `1px solid ${bookingErrors.licensePlate ? '#ef4444' : 'var(--border-color)'}`, background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                  {bookingErrors.licensePlate && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '0.2rem 0 0' }}>{bookingErrors.licensePlate}</p>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Dòng xe *</label>
                  <input type="text" value={bookingForm.vehicleModel} onChange={e => { setBookingForm(f => ({...f, vehicleModel: e.target.value})); setBookingErrors(er => ({...er, vehicleModel: ''})); }} placeholder="Honda Wave" style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 8, border: `1px solid ${bookingErrors.vehicleModel ? '#ef4444' : 'var(--border-color)'}`, background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                  {bookingErrors.vehicleModel && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '0.2rem 0 0' }}>{bookingErrors.vehicleModel}</p>}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Năm sản xuất</label>
                <input type="number" value={bookingForm.vehicleYear} onChange={e => setBookingForm(f => ({...f, vehicleYear: e.target.value}))} placeholder="2021" min={1990} max={new Date().getFullYear()+1} style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Ngày mong muốn *</label>
                  <input type="date" value={bookingForm.preferredDate} min={new Date().toISOString().split('T')[0]} onChange={e => { setBookingForm(f => ({...f, preferredDate: e.target.value})); setBookingErrors(er => ({...er, preferredDate: ''})); }} style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 8, border: `1px solid ${bookingErrors.preferredDate ? '#ef4444' : 'var(--border-color)'}`, background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                  {bookingErrors.preferredDate && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '0.2rem 0 0' }}>{bookingErrors.preferredDate}</p>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Giờ mong muốn *</label>
                  <input type="time" value={bookingForm.preferredTime} onChange={e => { setBookingForm(f => ({...f, preferredTime: e.target.value})); setBookingErrors(er => ({...er, preferredTime: ''})); }} style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 8, border: `1px solid ${bookingErrors.preferredTime ? '#ef4444' : 'var(--border-color)'}`, background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                  {bookingErrors.preferredTime && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '0.2rem 0 0' }}>{bookingErrors.preferredTime}</p>}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Ghi chú</label>
                <textarea value={bookingForm.customerNotes} onChange={e => setBookingForm(f => ({...f, customerNotes: e.target.value}))} rows={3} placeholder="Mô tả tình trạng xe hoặc yêu cầu đặc biệt..." style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.25rem' }}>
                <button type="button" onClick={() => setShowBookingModal(false)} style={{ padding: '0.65rem 1.25rem', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>Hủy</button>
                <button type="submit" disabled={bookingSubmitting} style={{ padding: '0.65rem 1.5rem', borderRadius: 10, border: 'none', background: bookingSubmitting ? 'var(--bg-secondary)' : 'var(--accent-gradient)', color: bookingSubmitting ? 'var(--text-muted)' : '#fff', fontWeight: 700, cursor: bookingSubmitting ? 'not-allowed' : 'pointer', fontSize: '0.875rem' }}>{bookingSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </UserLayout>
  );
};

export default ServiceDetailPage;
