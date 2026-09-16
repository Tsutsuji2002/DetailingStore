import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiSearch, FiX, FiDownload, FiPrinter } from 'react-icons/fi';
import AdminLayout from '@/components/layout/AdminLayout';
import ConfirmModal from '@/components/ui/ConfirmModal';
import DocEditor from '@/components/ui/DocEditor';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import {
  fetchMechanicDocsThunk,
  createMechanicDocThunk,
  updateMechanicDocThunk,
  deleteMechanicDocThunk,
} from '@/features/mechanicDocsSlice';
import type { MechanicDoc } from '@/types';

/* ── Helpers ─────────────────────────────────────────────── */
const CATEGORIES = [
  'Hệ Thống Động Cơ & FI',
  'Hệ Thống Điện & ECU',
  'Hệ Thống Phanh',
  'Hệ Thống Treo & Khung',
  'Hệ Thống Nhiên Liệu',
  'Hệ Thống Làm Mát',
  'Detailing & Bảo Dưỡng',
];

interface EditForm {
  title: string;
  brand: string;
  vehicleModel: string;
  category: string;
  errorCode: string;
  symptoms: string;
  contentHtml: string;
  solutionSteps: string;
  diagrams: string;
  videoUrl: string;
}

const emptyForm = (): EditForm => ({
  title: '',
  brand: 'Honda',
  vehicleModel: '',
  category: CATEGORIES[0],
  errorCode: '',
  symptoms: '',
  contentHtml: '',
  solutionSteps: '',
  diagrams: '',
  videoUrl: '',
});

const exportDocFromHtml = (doc: MechanicDoc) => {
  const html = `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:w="urn:schemas-microsoft-com:office:word"
  xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${doc.title}</title>
<style>body{font-family:'Times New Roman',serif;font-size:12pt;margin:2cm;}
table{border-collapse:collapse;width:100%}th,td{border:1px solid #333;padding:6px 10px}
h1{font-size:18pt}h2{font-size:14pt}</style>
</head><body>${doc.contentHtml || `<h1>${doc.title}</h1><p>${doc.symptoms}</p>`}</body></html>`;
  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${doc.title.replace(/\s+/g, '-')}.doc`;
  a.click();
  URL.revokeObjectURL(url);
};

const exportDocPdf = (doc: MechanicDoc) => {
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

/* ─────────────────────────────────────────────────────────── */

const MechanicDocsEditPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: docs, loading } = useAppSelector((s) => s.mechanicDocs);

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EditForm>(emptyForm());
  const [successMsg, setSuccessMsg] = useState('');
  const [docToDelete, setDocToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchMechanicDocsThunk());
  }, [dispatch]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 2800);
  };

  const openNewModal = () => {
    setEditingId(null);
    setForm(emptyForm());
    setIsModalOpen(true);
  };

  const openEditModal = (d: MechanicDoc) => {
    setEditingId(d.id);
    setForm({
      title: d.title,
      brand: d.brand,
      vehicleModel: d.vehicleModel,
      category: d.category,
      errorCode: d.errorCode || '',
      symptoms: d.symptoms,
      contentHtml: d.contentHtml || '',
      solutionSteps: (d.solutionSteps || []).join('\n'),
      diagrams: (d.diagrams || []).join(', '),
      videoUrl: d.videoUrl || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setIsSubmitting(true);

    const payload = {
      title: form.title.trim(),
      brand: form.brand.trim(),
      vehicleModel: form.vehicleModel.trim(),
      category: form.category,
      errorCode: form.errorCode.trim() || undefined,
      symptoms: form.symptoms.trim(),
      contentHtml: form.contentHtml,
      solutionSteps: form.solutionSteps.split('\n').map((s) => s.trim()).filter(Boolean),
      diagrams: form.diagrams.split(',').map((s) => s.trim()).filter(Boolean),
      videoUrl: form.videoUrl.trim() || undefined,
    };

    try {
      if (editingId) {
        await dispatch(updateMechanicDocThunk({ id: editingId, payload })).unwrap();
        showSuccess('Đã cập nhật tài liệu kỹ thuật!');
      } else {
        await dispatch(createMechanicDocThunk(payload)).unwrap();
        showSuccess('Đã biên soạn tài liệu mới!');
      }
      closeModal();
    } catch {
      // error handled by Redux
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    await dispatch(deleteMechanicDocThunk(docToDelete.id)).unwrap();
    setDocToDelete(null);
    showSuccess('Đã xóa tài liệu.');
  };

  const filteredDocs = docs.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.brand.toLowerCase().includes(q) ||
      (d.errorCode?.toLowerCase().includes(q) ?? false) ||
      d.vehicleModel.toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout>
      {/* Header */}
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="admin-page-title">Quản Lý Thư Viện Tài Liệu Sửa Chữa (Kỹ Thuật)</h1>
          <p className="admin-page-sub">Biên soạn cẩm nang kỹ thuật, mã lỗi xe máy, sơ đồ mạch điện & video hướng dẫn xử lý</p>
        </div>
        <button
          onClick={openNewModal}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.625rem 1.25rem', borderRadius: 10, background: 'var(--accent-primary)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }}
          id="add-new-doc-btn"
        >
          <FiPlus /> Biên Soạn Tài Liệu Mới
        </button>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.75rem 1rem', borderRadius: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}>
          <FiCheck /> {successMsg}
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: '1.25rem', position: 'relative', maxWidth: 450 }}>
        <FiSearch style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Tìm theo dòng xe, hãng xe, mã lỗi (P0115)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '0.625rem 0.875rem 0.625rem 2.5rem', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
        />
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Đang tải tài liệu…</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Hãng & Dòng Xe</th>
                <th>Tiêu Đề Hướng Dẫn</th>
                <th>Danh Mục</th>
                <th>Mã Lỗi / Triệu Chứng</th>
                <th>Cập Nhật</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Chưa có tài liệu nào.</td>
                </tr>
              ) : filteredDocs.map((d) => (
                <tr key={d.id}>
                  <td>
                    <strong>{d.brand}</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{d.vehicleModel}</div>
                  </td>
                  <td>
                    <strong>{d.title}</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{d.symptoms}</div>
                  </td>
                  <td><span style={{ fontSize: '0.8rem', background: 'var(--bg-tertiary)', padding: '0.2em 0.5em', borderRadius: 6 }}>{d.category}</span></td>
                  <td>
                    {d.errorCode ? (
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--danger)', background: '#fee2e2', padding: '0.15em 0.5em', borderRadius: 6 }}>{d.errorCode}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(d.updatedAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button onClick={() => openEditModal(d)} className="btn-del-icon" title="Sửa tài liệu"><FiEdit2 /></button>
                      <button onClick={() => exportDocFromHtml(d)} className="btn-del-icon" title="Xuất .doc (Word)" style={{ color: '#3b82f6' }}><FiDownload /></button>
                      <button onClick={() => exportDocPdf(d)} className="btn-del-icon" title="Xuất / In PDF" style={{ color: '#ef4444' }}><FiPrinter /></button>
                      <button onClick={() => setDocToDelete({ id: d.id, title: d.title })} className="btn-del-icon" title="Xóa"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit / Create Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, padding: '1rem', overflowY: 'auto' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border-color)', width: '100%', maxWidth: 900, padding: '1.75rem', marginTop: '1rem', marginBottom: '2rem' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {editingId ? '✏️ Cập Nhật Tài Liệu Kỹ Thuật' : '📋 Biên Soạn Cẩm Nang Kỹ Thuật Mới'}
              </h3>
              <button onClick={closeModal} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}><FiX /></button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Basic fields */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Tiêu Đề Hướng Dẫn *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Quy trình vệ sinh kim phun..."
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Hãng Xe *</label>
                  <input type="text" required value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Honda, Yamaha…" style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Dòng Xe / Đời Xe *</label>
                  <input type="text" required value={form.vehicleModel} onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })} placeholder="Winner X v3…" style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Danh Mục *</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Mã Lỗi</label>
                  <input type="text" value={form.errorCode} onChange={(e) => setForm({ ...form, errorCode: e.target.value })} placeholder="P0115, C00…" style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Triệu Chứng Nhận Biết</label>
                <input type="text" value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
              </div>

              {/* Rich Document Canvas Editor */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    📄 Trình Biên Soạn Văn Bản Cẩm Nang (Đầy Đủ Nội Dung & Định Dạng .doc)
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Soạn thảo quy trình, chèn bảng thông số & hình ảnh trực tiếp trong tài liệu
                  </span>
                </div>
                <DocEditor
                  value={form.contentHtml}
                  onChange={(html) => setForm((prev) => ({ ...prev, contentHtml: html }))}
                  metaHeader={{
                    title: form.title,
                    brand: form.brand,
                    vehicleModel: form.vehicleModel,
                    category: form.category,
                    errorCode: form.errorCode,
                    symptoms: form.symptoms,
                  }}
                  placeholder="Soạn thảo toàn bộ nội dung cẩm nang kỹ thuật tại đây… Bạn có thể nhập/xuất file .doc trực tiếp từ thanh công cụ."
                />
              </div>

              {/* Supplementary Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>URL Video Hướng Dẫn Kỹ Thuật (Nếu có)</label>
                  <input type="text" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://youtube.com/watch?v=..." style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
              </div>

              {/* Footer Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" onClick={closeModal} style={{ padding: '0.625rem 1.25rem', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>Hủy</button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '0.625rem 1.5rem', borderRadius: 10, background: 'var(--accent-gradient)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
                  id="save-doc-modal-btn"
                >
                  {isSubmitting ? 'Đang lưu…' : (editingId ? 'Cập Nhật Tài Liệu' : 'Lưu Tài Liệu Mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!docToDelete}
        title="Xác nhận xóa tài liệu kỹ thuật"
        message={docToDelete ? `Bạn có chắc chắn muốn xóa tài liệu "${docToDelete.title}" khỏi thư viện?` : ''}
        confirmText="Xóa Tài Liệu"
        cancelText="Hủy"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDocToDelete(null)}
      />
    </AdminLayout>
  );
};

export default MechanicDocsEditPage;
