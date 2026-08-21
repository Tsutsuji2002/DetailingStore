import React, { useState } from 'react';
import { FiSearch, FiBookOpen, FiAlertCircle, FiCheckCircle, FiCheck, FiFilter, FiVideo, FiImage } from 'react-icons/fi';
import StaffLayout from '@/components/layout/StaffLayout';
import { SAMPLE_MECHANIC_DOCS } from '@/data/sampleData';
import type { MechanicDoc } from '@/types';

const MechanicDocsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedDoc, setSelectedDoc] = useState<MechanicDoc | null>(SAMPLE_MECHANIC_DOCS[0]);

  const brands = ['all', 'Honda', 'Yamaha', 'Piaggio', 'Kawasaki', 'Suzuki'];

  const filteredDocs = SAMPLE_MECHANIC_DOCS.filter(d => {
    if (selectedBrand !== 'all' && d.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        d.vehicleModel.toLowerCase().includes(q) ||
        (d.errorCode && d.errorCode.toLowerCase().includes(q)) ||
        d.symptoms.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <StaffLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">📖 Thư Viện Cẩm Nang Kỹ Thuật & Tra Cứu Mã Lỗi</h1>
          <p className="admin-page-sub">Hệ thống tra cứu sơ đồ mạch điện, mã lỗi FI & quy trình chuẩn đoán cho thợ</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.75rem', alignItems: 'start' }}>
        {/* Left Search & Docs Selector */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 18, border: '1px solid var(--border-color)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Search box */}
          <div style={{ position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Nhập mã lỗi P0115, Winner, SH..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.4rem', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
              id="mechanic-doc-search"
            />
          </div>

          {/* Brand Filter chips */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {brands.map(b => (
              <button
                key={b}
                onClick={() => setSelectedBrand(b)}
                style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: selectedBrand === b ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                  color: selectedBrand === b ? 'white' : 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}>
                {b === 'all' ? 'Tất cả Hãng' : b}
              </button>
            ))}
          </div>

          {/* Docs list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '55vh', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {filteredDocs.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1.5rem 0' }}>Không tìm thấy tài liệu phù hợp</div>
            ) : (
              filteredDocs.map(d => (
                <div
                  key={d.id}
                  onClick={() => setSelectedDoc(d)}
                  style={{
                    padding: '0.875rem',
                    borderRadius: 12,
                    background: selectedDoc?.id === d.id ? 'var(--accent-light)' : 'var(--bg-secondary)',
                    border: selectedDoc?.id === d.id ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{d.brand} - {d.vehicleModel}</span>
                    {d.errorCode && <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#fee2e2', color: '#b91c1c', padding: '0.1em 0.4em', borderRadius: 4 }}>{d.errorCode}</span>}
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{d.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{d.symptoms}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Reader view */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 18, border: '1px solid var(--border-color)', padding: '2rem' }}>
          {selectedDoc ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ background: 'var(--accent-light)', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 700, padding: '0.2em 0.6em', borderRadius: 6 }}>
                    {selectedDoc.brand} ({selectedDoc.vehicleModel})
                  </span>
                  <span style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, padding: '0.2em 0.6em', borderRadius: 6 }}>
                    {selectedDoc.category}
                  </span>
                  {selectedDoc.errorCode && (
                    <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '0.8rem', fontWeight: 800, padding: '0.2em 0.6em', borderRadius: 6 }}>
                      MÃ LỖI: {selectedDoc.errorCode}
                    </span>
                  )}
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedDoc.title}</h2>
              </div>

              {/* Symptoms box */}
              <div style={{ background: '#fef3c7', borderRadius: 12, padding: '1rem 1.25rem', borderLeft: '4px solid #b45309', color: '#78350f' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FiAlertCircle /> Triệu Chứng Nhận Biết:
                </div>
                <div style={{ fontSize: '0.9rem' }}>{selectedDoc.symptoms}</div>
              </div>

              {/* Resolution steps */}
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.875rem' }}>Quy Trình Chuẩn Đoán & Sửa Chữa Chuyên Sâu:</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedDoc.solutionSteps.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start', padding: '0.875rem', borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                      <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--accent-primary)', color: 'white', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {idx + 1}
                      </span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', paddingTop: '0.15rem' }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diagrams / Media */}
              {selectedDoc.diagrams && selectedDoc.diagrams.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FiImage /> Sơ Đồ Mạch Điện / Hình Minh Họa Kỹ Thuật
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    {selectedDoc.diagrams.map((url, i) => (
                      <img key={i} src={url} alt={`Sơ đồ ${i + 1}`} style={{ width: '100%', height: 180, borderRadius: 12, objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              <FiBookOpen style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
              <p>Chọn một tài liệu bên trái để xem nội dung chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </StaffLayout>
  );
};

export default MechanicDocsPage;
