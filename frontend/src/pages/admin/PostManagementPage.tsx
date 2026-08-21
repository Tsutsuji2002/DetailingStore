import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiCheck, FiImage, FiVideo, FiFileText } from 'react-icons/fi';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { addPost, updatePost, deletePost } from '@/features/postsSlice';
import type { PostItem } from '@/types';

const PostManagementPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector(s => s.posts);

  const [editingPost, setEditingPost] = useState<Partial<PostItem> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const openNewModal = () => {
    setEditingPost({
      id: 'post_' + Date.now(),
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      coverImage: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600',
      mediaType: 'image',
      tags: ['meo-hay', 'bao-duong'],
      likes: 0,
      commentCount: 0,
      isPublished: true,
      authorId: 'u1',
      createdAt: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: PostItem) => {
    setEditingPost({ ...p });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost || !editingPost.title) return;

    const slug = editingPost.slug || editingPost.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const finalPost = { ...editingPost, slug } as PostItem;

    const exists = items.some(p => p.id === finalPost.id);
    if (exists) {
      dispatch(updatePost(finalPost));
      setSuccessMsg('Đã cập nhật bài viết!');
    } else {
      dispatch(addPost(finalPost));
      setSuccessMsg('Đã đăng bài viết mới!');
    }

    setIsModalOpen(false);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa bài viết này?')) {
      dispatch(deletePost(id));
      setSuccessMsg('Đã xóa bài viết.');
      setTimeout(() => setSuccessMsg(''), 2500);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="admin-page-title">Quản Lý Bài Viết & Bảng Tin (SNS)</h1>
          <p className="admin-page-sub">Đăng bài viết mới, hình ảnh, video hướng dẫn chăm sóc xe & tin tức cửa hàng</p>
        </div>
        <button onClick={openNewModal} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.625rem 1.25rem', borderRadius: 10, background: 'var(--accent-primary)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }} id="add-new-post-btn">
          <FiPlus /> Tạo Bài Viết Mới
        </button>
      </div>

      {successMsg && (
        <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.75rem 1rem', borderRadius: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}>
          <FiCheck /> {successMsg}
        </div>
      )}

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ảnh bìa</th>
              <th>Tiêu Đề Bài Viết</th>
              <th>Loại Định Dạng</th>
              <th>Lượt Thích</th>
              <th>Bình Luận</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {items.map(post => (
              <tr key={post.id}>
                <td>
                  <img src={post.coverImage || 'https://via.placeholder.com/60'} alt="" style={{ width: 56, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                </td>
                <td>
                  <strong>{post.title}</strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>/{post.slug}</div>
                </td>
                <td>
                  <span style={{ fontSize: '0.8rem', background: 'var(--bg-tertiary)', padding: '0.2em 0.6em', borderRadius: 6 }}>
                    {post.mediaType === 'image' ? '🖼️ Hình Ảnh' : post.mediaType === 'video' ? '🎬 Video' : '📝 Văn Bản'}
                  </span>
                </td>
                <td>❤️ {post.likes}</td>
                <td>💬 {post.commentCount}</td>
                <td>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2em 0.6em', borderRadius: 9999, background: post.isPublished ? '#dcfce7' : '#fee2e2', color: post.isPublished ? '#15803d' : '#b91c1c' }}>
                    {post.isPublished ? 'Đã Xuất Bản' : 'Bản Nháp'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => openEditModal(post)} className="btn-del-icon" title="Sửa"><FiEdit2 /></button>
                    <button onClick={() => handleDelete(post.id)} className="btn-del-icon" title="Xóa"><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Editor Modal */}
      {isModalOpen && editingPost && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border-color)', width: '100%', maxWidth: 750, maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {items.some(p => p.id === editingPost.id) ? 'Chỉnh Sửa Bài Viết' : 'Soạn Bài Viết Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}><FiX /></button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Tiêu Đề Bài Viết *</label>
                  <input type="text" required value={editingPost.title || ''} onChange={e => setEditingPost({ ...editingPost, title: e.target.value })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Định Dạng Media</label>
                  <select value={editingPost.mediaType || 'image'} onChange={e => setEditingPost({ ...editingPost, mediaType: e.target.value as any })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                    <option value="image">🖼️ Bài Ảnh</option>
                    <option value="video">🎬 Bài Video</option>
                    <option value="text">📝 Bài Viết Chữ</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>URL Ảnh Bìa (Cover Image)</label>
                <input type="text" value={editingPost.coverImage || ''} onChange={e => setEditingPost({ ...editingPost, coverImage: e.target.value })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Tóm Tắt Ngắn (Excerpt)</label>
                <input type="text" value={editingPost.excerpt || ''} onChange={e => setEditingPost({ ...editingPost, excerpt: e.target.value })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Nội Dung Chi Tiết (HTML / Markdown)</label>
                <textarea rows={6} value={editingPost.content || ''} onChange={e => setEditingPost({ ...editingPost, content: e.target.value })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.85rem' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Hashtags (Phân cách bằng dấu phẩy)</label>
                <input type="text" value={(editingPost.tags || []).join(', ')} onChange={e => setEditingPost({ ...editingPost, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="detailing, bao-duong, honda..." style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
                  <input type="checkbox" checked={editingPost.isPublished ?? true} onChange={e => setEditingPost({ ...editingPost, isPublished: e.target.checked })} style={{ width: 18, height: 18 }} />
                  Xuất bản ngay lên bảng tin
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.625rem 1.25rem', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>Hủy</button>
                  <button type="submit" style={{ padding: '0.625rem 1.5rem', borderRadius: 10, background: 'var(--accent-gradient)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }} id="save-post-modal-btn">Lưu Bài Viết</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default PostManagementPage;
