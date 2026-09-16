import React, { useState, useEffect } from 'react';
import { FiSearch, FiBookOpen, FiAlertCircle, FiDownload, FiPrinter } from 'react-icons/fi';
import StaffLayout from '@/components/layout/StaffLayout';
import DocEditor from '@/components/ui/DocEditor';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { fetchMechanicDocsThunk } from '@/features/mechanicDocsSlice';
import type { MechanicDoc } from '@/types';

const BRANDS = ['all', 'Honda', 'Yamaha', 'Piaggio', 'Kawasaki', 'Suzuki'];

const exportDoc = (doc: MechanicDoc) => {
  const html = `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:w="urn:schemas-microsoft-com:office:word"
  xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${doc.title}</title>
<style>body{font-family:'Times New Roman',serif;font-size:12pt;margin:2cm;}
table{border-collapse:collapse;width:100%}th,td{border:1px solid #333;padding:6px 10px}
h1{font-size:18pt}h2{font-size:14pt}</style>
</head><body>
<h1>${doc.title}</h1>
<p><strong>Hãng xe:</strong> ${doc.brand} — ${doc.vehicleModel}</p>
<p><strong>Danh mục:</strong> ${doc.category}</p>
${doc.errorCode ? `<p><strong>Mã lỗi:</strong> ${doc.errorCode}</p>` : ''}
<p><strong>Triệu chứng:</strong> ${doc.symptoms}</p>
${doc.contentHtml || ''}
</body></html>`;
  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${doc.title.replace(/\s+/g, '-')}.doc`;
  a.click();
  URL.revokeObjectURL(url);
};

const exportPdf = (doc: MechanicDoc) => {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${doc.title}</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11pt; color: #1e293b; line-height: 1.6; margin: 0; padding: 0; }
          table { width: 100%; border-collapse: collapse; margin: 12px 0; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
          th { background-color: #f1f5f9; font-weight: 700; }
          h1 { font-size: 18pt; margin-top: 0; }
          h2 { font-size: 14pt; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
          h3 { font-size: 12pt; color: #334155; }
          ul, ol { padding-left: 20px; }
          img { max-width: 100%; height: auto; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div style="margin-bottom:20px;padding-bottom:15px;border-bottom:2px solid #333;">
          <p style="font-size:10pt;color:#555;margin:0 0 5px 0;"><strong>HÃNG XE:</strong> ${doc.brand} (${doc.vehicleModel}) | <strong>DANH MỤC:</strong> ${doc.category} ${doc.errorCode ? `| <strong style="color:#b91c1c;">MÃ LỖI: ${doc.errorCode}</strong>` : ''}</p>
          <h1 style="font-size:22pt;color:#0f172a;margin:5px 0;">${doc.title}</h1>
          <div style="background:#fff8dc;padding:8px 12px;border-left:4px solid #d97706;color:#78350f;margin-top:8px;"><strong>⚠️ Triệu chứng:</strong> ${doc.symptoms}</div>
        </div>
        ${doc.contentHtml || `<p>${doc.symptoms}</p>`}
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
    </html>
  `);
  win.document.close();
};

const MechanicDocsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: docs, loading } = useAppSelector((s) => s.mechanicDocs);

  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedDoc, setSelectedDoc] = useState<MechanicDoc | null>(null);

  useEffect(() => {
    dispatch(fetchMechanicDocsThunk()).then((res: any) => {
      if (res.payload?.length > 0) {
        setSelectedDoc(res.payload[0]);
      }
    });
  }, [dispatch]);

  const filteredDocs = docs.filter((d) => {
    if (selectedBrand !== 'all' && d.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        d.vehicleModel.toLowerCase().includes(q) ||
        (d.errorCode?.toLowerCase().includes(q) ?? false) ||
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
        {/* Left: Search & Doc List */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 18, border: '1px solid var(--border-color)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Nhập mã lỗi P0115, Winner, SH..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.4rem', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
              id="mechanic-doc-search"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {BRANDS.map((b) => (
              <button key={b} onClick={() => setSelectedBrand(b)} style={{ padding: '0.25rem 0.65rem', borderRadius: 8, border: '1px solid var(--border-color)', background: selectedBrand === b ? 'var(--accent-primary)' : 'var(--bg-secondary)', color: selectedBrand === b ? 'white' : 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                {b === 'all' ? 'Tất cả Hãng' : b}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '55vh', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1.5rem 0' }}>Đang tải…</div>
            ) : filteredDocs.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1.5rem 0' }}>Không tìm thấy tài liệu phù hợp</div>
            ) : filteredDocs.map((d) => (
              <div
                key={d.id}
                onClick={() => setSelectedDoc(d)}
                style={{ padding: '0.875rem', borderRadius: 12, background: selectedDoc?.id === d.id ? 'var(--accent-light)' : 'var(--bg-secondary)', border: selectedDoc?.id === d.id ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.15s' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{d.brand} - {d.vehicleModel}</span>
                  {d.errorCode && <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#fee2e2', color: '#b91c1c', padding: '0.1em 0.4em', borderRadius: 4 }}>{d.errorCode}</span>}
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{d.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.symptoms}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Document Reader */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 18, border: '1px solid var(--border-color)', padding: '2rem' }}>
          {selectedDoc ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Doc header */}
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
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
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => exportDoc(selectedDoc)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.9rem', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                      title="Xuất tài liệu ra file .doc"
                    >
                      <FiDownload /> Xuất .doc
                    </button>
                    <button
                      onClick={() => exportPdf(selectedDoc)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.9rem', borderRadius: 8, background: '#ef4444', border: 'none', color: '#ffffff', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                      title="Xuất tài liệu ra file PDF / In"
                    >
                      <FiPrinter /> Xuất PDF
                    </button>
                  </div>
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedDoc.title}</h2>
              </div>

              {/* Symptoms */}
              <div style={{ background: '#fef3c7', borderRadius: 12, padding: '1rem 1.25rem', borderLeft: '4px solid #b45309', color: '#78350f' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FiAlertCircle /> Triệu Chứng Nhận Biết:
                </div>
                <div style={{ fontSize: '0.9rem' }}>{selectedDoc.symptoms}</div>
              </div>

              {/* Rich HTML Document — readonly DocEditor */}
              {selectedDoc.contentHtml ? (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>📄 Nội Dung Cẩm Nang Chi Tiết</h3>
                  <DocEditor
                    value={selectedDoc.contentHtml}
                    onChange={() => {}}
                    metaHeader={{
                      title: selectedDoc.title,
                      brand: selectedDoc.brand,
                      vehicleModel: selectedDoc.vehicleModel,
                      category: selectedDoc.category,
                      errorCode: selectedDoc.errorCode,
                      symptoms: selectedDoc.symptoms,
                    }}
                    readOnly
                  />
                </div>
              ) : selectedDoc.solutionSteps?.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.875rem' }}>Quy Trình Chuẩn Đoán & Sửa Chữa:</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {selectedDoc.solutionSteps.map((step, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start', padding: '0.875rem', borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                        <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--accent-primary)', color: 'white', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{idx + 1}</span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', paddingTop: '0.15rem' }}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* YouTube Video */}
              {selectedDoc.videoUrl && (
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    🎥 Video Hướng Dẫn
                  </h3>
                  <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                    <iframe
                      src={selectedDoc.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                      title="Video hướng dẫn"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: 12 }}
                    />
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
