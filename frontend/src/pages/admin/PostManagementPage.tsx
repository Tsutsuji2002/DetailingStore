import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiCheck, FiSearch } from 'react-icons/fi';
import AdminLayout from '@/components/layout/AdminLayout';
import ConfirmModal from '@/components/ui/ConfirmModal';
import RichTextEditor from '@/components/ui/RichTextEditor';
import Pagination from '@/components/ui/Pagination';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { fetchPostsThunk, createPostThunk, updatePostThunk, deletePostThunk } from '@/features/postsSlice';
import type { PostDto } from '@/features/postsSlice';

const EMPTY_POST: Partial<PostDto> = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  mediaType: 'image',
  tags: [],
  likes: 0,
  commentCount: 0,
  isPublished: true,
  authorName: '61 Team Admin',
};

const PostManagementPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, isLoading } = useAppSelector(s => s.posts);
  const { user } = useAppSelector(s => s.auth);

  const [editingPost, setEditingPost] = useState<Partial<PostDto> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [postToDelete, setPostToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Search, Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [mediaFilter, setMediaFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    dispatch(fetchPostsThunk());
  }, [dispatch]);

  const openNewModal = () => {
    setEditingPost({ ...EMPTY_POST });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: PostDto) => {
    setEditingPost({ ...p });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    if (!editingPost.title?.trim()) {
      setErrorMsg('Tiêu đề bài viết không được để trống.');
      return;
    }

    const defaultAuthorName = user
      ? `${user.fullName || user.username} (${user.role === 'admin' ? 'Admin' : user.role === 'staff' ? 'Staff' : 'User'})`
      : '61 Team Admin (Admin)';

    const dto = {
      title: editingPost.title!.trim(),
      slug: editingPost.slug?.trim() || '',
      excerpt: editingPost.excerpt?.trim() || '',
      content: editingPost.content || '',
      coverImage: editingPost.coverImage?.trim() || '',
      mediaType: editingPost.mediaType || 'image',
      tags: editingPost.tags || [],
      isPublished: editingPost.isPublished ?? true,
      authorName: editingPost.authorName && editingPost.authorName.includes('(') ? editingPost.authorName : defaultAuthorName,
    };

    setIsSaving(true);
    setErrorMsg('');
    try {
      const isEditing = items.some(p => p.id === editingPost.id);
      if (isEditing && editingPost.id) {
        await dispatch(updatePostThunk({ id: editingPost.id, dto })).unwrap();
        setSuccessMsg('Đã cập nhật bài viết thành công!');
      } else {
        await dispatch(createPostThunk(dto)).unwrap();
        setSuccessMsg('Đã đăng bài viết mới!');
      }
      setIsModalOpen(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err || 'Có lỗi xảy ra khi lưu bài viết.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    try {
      await dispatch(deletePostThunk(postToDelete.id)).unwrap();
      setPostToDelete(null);
      setSuccessMsg('Đã xóa bài viết.');
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch {
      setErrorMsg('Không thể xóa bài viết.');
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="admin-page-title">Quản Lý Bài Viết & Bảng Tin</h1>
          <p className="admin-page-sub">Đăng bài viết mới, hình ảnh, video hướng dẫn chăm sóc xe & tin tức cửa hàng</p>
        </div>
        <button
          onClick={openNewModal}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.625rem 1.25rem', borderRadius: 10, background: 'var(--accent-primary)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }}
          id="add-new-post-btn"
        >
          <FiPlus /> Tạo Bài Viết Mới
        </button>
      </div>

      {successMsg && (
        <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.75rem 1rem', borderRadius: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}>
          <FiCheck /> {successMsg}
        </div>
      )}

      {/* Toolbar: Search & Filters */}
      <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 16, border: '1px solid var(--border-color)', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', width: 280, maxWidth: '100%' }}>
          <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Tìm bài viết theo tiêu đề, slug, tóm tắt..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem 0.5rem 2.2rem',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã Xuất Bản</option>
            <option value="draft">Bản Nháp</option>
          </select>

          {/* Media Filter */}
          <select
            value={mediaFilter}
            onChange={e => { setMediaFilter(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <option value="all">Tất cả loại bài</option>
            <option value="image">Hình Ảnh</option>
            <option value="video">Video</option>
            <option value="text">Văn Bản</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải bài viết...</div>
        ) : (
          (() => {
            const filtered = items.filter(post => {
              if (statusFilter === 'published' && !post.isPublished) return false;
              if (statusFilter === 'draft' && post.isPublished) return false;
              if (mediaFilter !== 'all' && post.mediaType !== mediaFilter) return false;
              if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                return (
                  post.title.toLowerCase().includes(q) ||
                  (post.slug || '').toLowerCase().includes(q) ||
                  (post.excerpt || '').toLowerCase().includes(q)
                );
              }
              return true;
            });

            const totalPages = Math.ceil(filtered.length / pageSize) || 1;
            const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

            return (
              <>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ảnh bìa</th>
                      <th>Tiêu Đề Bài Viết</th>
                      <th>Loại</th>
                      <th>Lượt Thích</th>
                      <th>Trạng Thái</th>
                      <th>Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                          Không tìm thấy bài viết phù hợp với bộ lọc.
                        </td>
                      </tr>
                    ) : (
                      paginated.map(post => (
                        <tr key={post.id}>
                          <td>
                            <img src={post.coverImage || 'https://via.placeholder.com/56x40'} alt="" style={{ width: 56, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                          </td>
                          <td>
                            <strong>{post.title}</strong>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>/{post.slug}</div>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.8rem', background: 'var(--bg-tertiary)', padding: '0.2em 0.6em', borderRadius: 6 }}>
                              {post.mediaType === 'image' ? 'Hình Ảnh' : post.mediaType === 'video' ? 'Video' : 'Văn Bản'}
                            </span>
                          </td>
                          <td>{post.likes}</td>
                          <td>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2em 0.6em', borderRadius: 9999, background: post.isPublished ? '#dcfce7' : '#fee2e2', color: post.isPublished ? '#15803d' : '#b91c1c' }}>
                              {post.isPublished ? 'Đã Xuất Bản' : 'Bản Nháp'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button onClick={() => openEditModal(post)} className="btn-del-icon" title="Sửa"><FiEdit2 /></button>
                              <button onClick={() => setPostToDelete({ id: post.id, title: post.title })} className="btn-del-icon" title="Xóa"><FiTrash2 /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </>
            );
          })()
        )}
      </div>

      {/* Pagination Controls */}
      {(() => {
        const filtered = items.filter(post => {
          if (statusFilter === 'published' && !post.isPublished) return false;
          if (statusFilter === 'draft' && post.isPublished) return false;
          if (mediaFilter !== 'all' && post.mediaType !== mediaFilter) return false;
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            return (
              post.title.toLowerCase().includes(q) ||
              (post.slug || '').toLowerCase().includes(q) ||
              (post.excerpt || '').toLowerCase().includes(q)
            );
          }
          return true;
        });

        return (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filtered.length / pageSize) || 1}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={ps => { setPageSize(ps); setCurrentPage(1); }}
          />
        );
      })()}

      {/* Editor Modal */}
      {isModalOpen && editingPost && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, padding: '1rem', overflowY: 'auto' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border-color)', width: '100%', maxWidth: 900, margin: '2rem auto', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {items.some(p => p.id === editingPost.id) ? '✏️ Chỉnh Sửa Bài Viết' : '📝 Soạn Bài Viết Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}><FiX /></button>
            </div>

            {errorMsg && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.625rem 1rem', borderRadius: 10, marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Row 1: Title + Media type */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Tiêu Đề Bài Viết *</label>
                  <input
                    type="text"
                    required
                    value={editingPost.title || ''}
                    onChange={e => setEditingPost({ ...editingPost, title: e.target.value })}
                    placeholder="Nhập tiêu đề bài viết..."
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Định Dạng Media</label>
                  <select
                    value={editingPost.mediaType || 'image'}
                    onChange={e => setEditingPost({ ...editingPost, mediaType: e.target.value as any })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  >
                    <option value="image">🖼️ Bài Ảnh</option>
                    <option value="video">🎬 Bài Video</option>
                    <option value="text">📝 Bài Viết Chữ</option>
                  </select>
                </div>
              </div>

              {/* Row 2: CoverImage + Author info (auto-resolved) */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>URL Ảnh Bìa (Cover Image)</label>
                  <input
                    type="text"
                    value={editingPost.coverImage || ''}
                    onChange={e => setEditingPost({ ...editingPost, coverImage: e.target.value })}
                    placeholder="https://..."
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Tác Giả Bài Đăng</label>
                  <input
                    type="text"
                    readOnly
                    value={
                      editingPost.authorName && editingPost.authorName.includes('(')
                        ? editingPost.authorName
                        : user
                        ? `${user.fullName || user.username} (${user.role === 'admin' ? 'Admin' : user.role === 'staff' ? 'Staff' : 'User'})`
                        : '61 Team Admin (Admin)'
                    }
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-muted)', cursor: 'not-allowed', fontWeight: 600 }}
                  />
                </div>
              </div>

              {/* Row 3: Excerpt */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Mô Tả Ngắn (Excerpt)</label>
                <input
                  type="text"
                  value={editingPost.excerpt || ''}
                  onChange={e => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                  placeholder="Tóm tắt nội dung bài viết..."
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                />
              </div>

              {/* Row 4: Rich Text Editor */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Nội Dung Bài Viết *
                </label>
                <RichTextEditor
                  value={editingPost.content || ''}
                  onChange={html => setEditingPost(prev => ({ ...prev, content: html }))}
                  placeholder="Bắt đầu soạn thảo nội dung bài viết... Bạn có thể chèn ảnh, tiêu đề, danh sách và hơn nữa!"
                  minHeight={380}
                />
              </div>

              {/* Row 5: Tags */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Hashtags (phân cách bằng dấu phẩy)</label>
                <input
                  type="text"
                  value={(editingPost.tags || []).join(', ')}
                  onChange={e => setEditingPost({ ...editingPost, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  placeholder="detailing, bao-duong, honda..."
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                />
              </div>

              {/* Row 6: Publish toggle + Save */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={editingPost.isPublished ?? true}
                    onChange={e => setEditingPost({ ...editingPost, isPublished: e.target.checked })}
                    style={{ width: 18, height: 18 }}
                  />
                  Xuất bản ngay lên bảng tin
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.625rem 1.25rem', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.625rem 1.5rem', borderRadius: 10, background: 'var(--accent-gradient)', color: 'white', fontWeight: 700, border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1 }}
                    id="save-post-modal-btn"
                  >
                    <FiSave /> {isSaving ? 'Đang Lưu...' : 'Lưu Bài Viết'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!postToDelete}
        title="Xác nhận xóa bài viết"
        message={postToDelete ? `Bạn có chắc chắn muốn xóa bài viết "${postToDelete.title}"?` : ''}
        confirmText="Xóa Bài Viết"
        cancelText="Hủy"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setPostToDelete(null)}
      />
    </AdminLayout>
  );
};

export default PostManagementPage;
