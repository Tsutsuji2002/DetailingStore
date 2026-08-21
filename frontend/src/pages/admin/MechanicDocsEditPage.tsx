import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiCheck, FiBookOpen, FiSearch } from 'react-icons/fi';
import AdminLayout from '@/components/layout/AdminLayout';
import { SAMPLE_MECHANIC_DOCS } from '@/data/sampleData';
import type { MechanicDoc } from '@/types';

const MechanicDocsEditPage: React.FC = () => {
  const [docs, setDocs] = useState<MechanicDoc[]>(SAMPLE_MECHANIC_DOCS);
  const [search, setSearch] = useState('');
  const [editingDoc, setEditingDoc] = useState<Partial<MechanicDoc> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const openNewModal = () => {
    setEditingDoc({
      id: 'doc_' + Date.now(),
      title: '',
      brand: 'Honda',
      vehicleModel: 'SH 150i (2020-2024)',
      category: 'Hệ Thống Động Cơ & FI',
      errorCode: 'P0115',
      symptoms: 'Đèn Check Engine sáng, xe hụt ga khi tăng tốc',
      solutionSteps: [
        'Kiểm tra điện áp cảm biến ECT',
        'Thay thế cảm biến nhiệt độ nước làm mát nếu hỏng',
      ],
      diagrams: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600'],
      videoUrl: '',
      updatedAt: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  const openEditModal = (d: MechanicDoc) => {
    setEditingDoc({ ...d });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc || !editingDoc.title) return;

    const finalDoc = { ...editingDoc, updatedAt: new Date().toISOString() } as MechanicDoc;
    const exists = docs.some(d => d.id === finalDoc.id);
    if (exists) {
      setDocs(docs.map(d => (d.id === finalDoc.id ? finalDoc : d)));
      setSuccessMsg('Đã cập nhật tài liệu kỹ thuật!');
    } else {
      setDocs([finalDoc, ...docs]);
      setSuccessMsg('Đã biên soạn tài liệu mới!');
    }

    setIsModalOpen(false);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa tài liệu kỹ thuật này?')) {
      setDocs(docs.filter(d => d.id !== id));
      setSuccessMsg('Đã xóa tài liệu.');
      setTimeout(() => setSuccessMsg(''), 2500);
    }
  };

  const filteredDocs = docs.filter(d => {
    const q = search.toLowerCase();
    return d.title.toLowerCase().includes(q) || d.brand.toLowerCase().includes(q) || (d.errorCode && d.errorCode.toLowerCase().includes(q)) || d.vehicleModel.toLowerCase().includes(q);
  });

  return (
    <AdminLayout>
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="admin-page-title">Quản Lý Thư Viện Tài Liệu Sửa Chữa (Kỹ Thuật)</h1>
          <p className="admin-page-sub">Biên soạn cẩm nang kỹ thuật, mã lỗi xe máy, sơ đồ mạch điện & video hướng dẫn xử lý</p>
        </div>
        <button onClick={openNewModal} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.625rem 1.25rem', borderRadius: 10, background: 'var(--accent-primary)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }} id="add-new-doc-btn">
          <FiPlus /> Biên Soạn Tài Liệu Mới
        </button>
      </div>

      {successMsg && (
        <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.75rem 1rem', borderRadius: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}>
          <FiCheck /> {successMsg}
        </div>
      )}

      {/* Search Bar */}
      <div style={{ marginBottom: '1.25rem', position: 'relative', maxWidth: 450 }}>
        <FiSearch style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input type="text" placeholder="Tìm theo dòng xe, hãng xe, mã lỗi (P0115)..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '0.625rem 0.875rem 0.625rem 2.5rem', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.875rem' }} />
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
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
            {filteredDocs.map(d => (
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
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(d.updatedAt).toLocaleDateString('vi-VN')}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => openEditModal(d)} className="btn-del-icon" title="Sửa"><FiEdit2 /></button>
                    <button onClick={() => handleDelete(d.id)} className="btn-del-icon" title="Xóa"><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && editingDoc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border-color)', width: '100%', maxWidth: 750, maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {docs.some(d => d.id === editingDoc.id) ? 'Sửa Tài Liệu Kỹ Thuật' : 'Soạn Cẩm Nang Kỹ Thuật Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}><FiX /></button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Tiêu Đề Hướng Dẫn *</label>
                <input type="text" required value={editingDoc.title || ''} onChange={e => setEditingDoc({ ...editingDoc, title: e.target.value })} placeholder="Quy trình vệ sinh kim phun..." style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Hãng Xe *</label>
                  <input type="text" required value={editingDoc.brand || ''} onChange={e => setEditingDoc({ ...editingDoc, brand: e.target.value })} placeholder="Honda, Yamaha..." style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Dòng Xe / Đời Xe *</label>
                  <input type="text" required value={editingDoc.vehicleModel || ''} onChange={e => setEditingDoc({ ...editingDoc, vehicleModel: e.target.value })} placeholder="Winner X v3..." style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Mã Lỗi (Error Code)</label>
                  <input type="text" value={editingDoc.errorCode || ''} onChange={e => setEditingDoc({ ...editingDoc, errorCode: e.target.value })} placeholder="P0115..." style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Triệu Chứng Nhận Biết</label>
                <input type="text" value={editingDoc.symptoms || ''} onChange={e => setEditingDoc({ ...editingDoc, symptoms: e.target.value })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Các Bước Xử Lý & Khắc Phục (Mỗi bước 1 dòng)</label>
                <textarea rows={5} value={(editingDoc.solutionSteps || []).join('\n')} onChange={e => setEditingDoc({ ...editingDoc, solutionSteps: e.target.value.split('\n').filter(Boolean) })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Sơ Đồ Mạch / Ảnh Minh Họa (URLs phẩy)</label>
                  <input type="text" value={(editingDoc.diagrams || []).join(', ')} onChange={e => setEditingDoc({ ...editingDoc, diagrams: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>URL Video Hướng Dẫn Kỹ Thuật</label>
                  <input type="text" value={editingDoc.videoUrl || ''} onChange={e => setEditingDoc({ ...editingDoc, videoUrl: e.target.value })} placeholder="https://..." style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.625rem 1.25rem', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>Hủy</button>
                <button type="submit" style={{ padding: '0.625rem 1.5rem', borderRadius: 10, background: 'var(--accent-gradient)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }} id="save-doc-modal-btn">Lưu Tài Liệu Kỹ Thuật</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default MechanicDocsEditPage;
