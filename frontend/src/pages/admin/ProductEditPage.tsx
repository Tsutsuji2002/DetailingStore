import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiFolder, FiAlertCircle, FiSearch } from 'react-icons/fi';
import AdminLayout from '@/components/layout/AdminLayout';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Pagination from '@/components/ui/Pagination';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import {
  fetchProductsThunk,
  fetchCategoriesThunk,
  createProductThunk,
  updateProductThunk,
  deleteProductThunk,
  createProductCategoryThunk,
  deleteProductCategoryThunk
} from '@/features/productsSlice';
import type { ProductItem } from '@/types';
import { productStorage } from '@/utils/productStorage';

interface ToastState {
  type: 'success' | 'error';
  text: string;
}

const ProductEditPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, categories } = useAppSelector(s => s.products);

  const [editingProduct, setEditingProduct] = useState<Partial<ProductItem> | null>(null);
  const [imagesInput, setImagesInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  
  const [toastMsg, setToastMsg] = useState<ToastState | null>(null);
  const [catModalMsg, setCatModalMsg] = useState<ToastState | null>(null);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);

  // Search, Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const showCatMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setCatModalMsg({ text, type });
    setTimeout(() => setCatModalMsg(null), 3000);
  };

  useEffect(() => {
    dispatch(fetchProductsThunk());
    dispatch(fetchCategoriesThunk());
  }, [dispatch]);

  const openNewModal = () => {
    const defaultImg = 'https://placehold.co/600x400/1e293b/94a3b8?text=Product+Image';
    setEditingProduct({
      id: '',
      name: '',
      slug: '',
      categoryId: '',
      brand: 'Honda',
      price: 0,
      discountPrice: undefined,
      stock: 0,
      rating: 5.0,
      reviewCount: 1,
      shortDescription: '',
      description: '',
      images: [defaultImg],
      tags: ['phu-tung', 'chinh-hang'],
      isActive: true,
      createdAt: new Date().toISOString(),
    });
    setImagesInput(defaultImg);
    setIsModalOpen(true);
  };

  const openEditModal = (p: ProductItem) => {
    setEditingProduct({ ...p });
    setImagesInput((p.images || []).join(', '));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editingProduct.categoryId) {
      showToast('Vui lòng chọn danh mục cho sản phẩm!', 'error');
      return;
    }
    if (!editingProduct.name || !editingProduct.name.trim()) {
      showToast('Vui lòng nhập tên sản phẩm!', 'error');
      return;
    }
    if (!editingProduct.price || editingProduct.price <= 0) {
      showToast('Vui lòng nhập giá niêm yết sản phẩm hợp lệ!', 'error');
      return;
    }

    const slug = editingProduct.slug || editingProduct.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const finalImages = imagesInput.split(',').map(s => s.trim()).filter(Boolean);

    const isExisting = items.some(p => p.id === editingProduct.id);

    try {
      if (isExisting && editingProduct.id) {
        const finalProd = { ...editingProduct, slug, images: finalImages } as ProductItem;
        await dispatch(updateProductThunk({ id: finalProd.id, data: finalProd })).unwrap();
        productStorage.updateSingleProduct(finalProd);
        showToast('Đã cập nhật sản phẩm thành công!');
      } else {
        const createPayload = {
          categoryId: editingProduct.categoryId,
          name: editingProduct.name.trim(),
          brand: editingProduct.brand || 'Khác',
          shortDescription: editingProduct.shortDescription || '',
          description: editingProduct.description || '',
          price: editingProduct.price,
          discountPrice: editingProduct.discountPrice,
          stock: editingProduct.stock || 0,
          images: finalImages,
          isActive: editingProduct.isActive ?? true
        };
        const created = await dispatch(createProductThunk(createPayload)).unwrap();
        if (created) {
          productStorage.updateSingleProduct({ ...created, tags: ['san-pham'] } as any);
        }
        showToast('Đã thêm sản phẩm mới thành công!');
      }

      setIsModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Lưu sản phẩm thất bại!', 'error');
    }
  };

  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete) return;
    const { id } = productToDelete;
    setProductToDelete(null);
    try {
      await dispatch(deleteProductThunk(id)).unwrap();
      showToast('Đã xóa sản phẩm.');
    } catch (err: any) {
      showToast(err.message || 'Xóa sản phẩm thất bại!', 'error');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const slug = newCatName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      await dispatch(createProductCategoryThunk({ name: newCatName.trim(), slug })).unwrap();
      setNewCatName('');
      showCatMsg('Đã thêm danh mục sản phẩm mới thành công!');
      showToast('Đã thêm danh mục sản phẩm mới!');
    } catch (err: any) {
      showCatMsg(err.message || 'Lỗi khi thêm danh mục sản phẩm', 'error');
    }
  };

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    const { id } = categoryToDelete;
    setCategoryToDelete(null);
    try {
      await dispatch(deleteProductCategoryThunk(id)).unwrap();
      showCatMsg('Đã xóa danh mục sản phẩm.');
      showToast('Đã xóa danh mục.');
    } catch (err: any) {
      showCatMsg(err.message || 'Lỗi khi xóa danh mục sản phẩm', 'error');
    }
  };

  return (
    <AdminLayout>
      {/* Floating Toast Notification on top of everything */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 99999,
          background: toastMsg.type === 'error' ? '#fef2f2' : '#dcfce7',
          color: toastMsg.type === 'error' ? '#991b1b' : '#15803d',
          border: `1px solid ${toastMsg.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
          padding: '0.85rem 1.35rem',
          borderRadius: '14px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.925rem'
        }}>
          {toastMsg.type === 'error' ? <FiAlertCircle style={{ fontSize: '1.2rem' }} /> : <FiCheck style={{ fontSize: '1.2rem' }} />}
          {toastMsg.text}
        </div>
      )}

      <div className="admin-page-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="admin-page-title" style={{ fontSize: '1.5rem', fontWeight: 800 }}>Quản Lý Cửa Hàng & Phụ Tùng</h1>
          <p className="admin-page-sub" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Quản lý kho hàng, cập nhật giá bán, khuyến mãi & thông tin linh kiện</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', width: '100%', maxWidth: 'max-content' }}>
          <button
            onClick={() => setIsCatModalOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.625rem 1rem', borderRadius: 10, background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontWeight: 600, cursor: 'pointer', flex: 1, whiteSpace: 'nowrap' }}
            id="manage-product-cats-btn"
          >
            <FiFolder /> Quản Lý Danh Mục
          </button>
          <button
            onClick={openNewModal}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.625rem 1.25rem', borderRadius: 10, background: 'var(--accent-primary)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer', flex: 1, whiteSpace: 'nowrap' }}
            id="add-new-product-btn"
          >
            <FiPlus /> Thêm Sản Phẩm Mới
          </button>
        </div>
      </div>

      {/* Toolbar: Search & Filters */}
      <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 16, border: '1px solid var(--border-color)', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', width: 280, maxWidth: '100%' }}>
          <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm, thương hiệu..."
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
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
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
            <option value="all">Tất cả danh mục</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

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
            <option value="active">Đang Bán</option>
            <option value="hidden">Tạm Ẩn</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <table className="admin-table" style={{ width: '100%', minWidth: 650 }}>
          <thead>
            <tr>
              <th>Hình ảnh</th>
              <th>Sản Phẩm</th>
              <th>Thương Hiệu</th>
              <th>Danh Mục</th>
              <th>Giá Bán (VND)</th>
              <th>Tồn Kho</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const filtered = items.filter(p => {
                if (categoryFilter !== 'all' && p.categoryId !== categoryFilter) return false;
                if (statusFilter === 'active' && !p.isActive) return false;
                if (statusFilter === 'hidden' && p.isActive) return false;
                if (searchQuery.trim()) {
                  const q = searchQuery.toLowerCase().trim();
                  return (
                    p.name.toLowerCase().includes(q) ||
                    (p.brand || '').toLowerCase().includes(q) ||
                    (p.slug || '').toLowerCase().includes(q)
                  );
                }
                return true;
              });

              const totalPages = Math.ceil(filtered.length / pageSize) || 1;
              const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

              if (filtered.length === 0) {
                return (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                );
              }

              return paginated.map(p => {
                const cat = categories.find(c => c.id === p.categoryId);
                return (
                  <tr key={p.id}>
                    <td>
                      <img src={p.images[0]} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                    </td>
                    <td>
                      <strong>{p.name}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>/{p.slug}</div>
                    </td>
                    <td><span style={{ fontWeight: 600, color: 'var(--accent-primary)', fontSize: '0.8rem' }}>{p.brand || 'Khác'}</span></td>
                    <td><span style={{ fontSize: '0.8rem', background: 'var(--bg-tertiary)', padding: '0.2em 0.5em', borderRadius: 6, whiteSpace: 'nowrap' }}>{cat?.name || 'Chưa phân loại'}</span></td>
                    <td>
                      {p.discountPrice ? (
                        <>
                          <strong style={{ color: 'var(--accent-primary)' }}>{p.discountPrice.toLocaleString('vi-VN')}₫</strong>
                          <div style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>{p.price.toLocaleString('vi-VN')}₫</div>
                        </>
                      ) : (
                        <strong>{p.price.toLocaleString('vi-VN')}₫</strong>
                      )}
                    </td>
                    <td>
                      <strong style={{ color: p.stock > 0 ? 'var(--text-primary)' : 'var(--danger)' }}>{p.stock} cái</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2em 0.6em', borderRadius: 9999, background: p.isActive ? '#dcfce7' : '#fee2e2', color: p.isActive ? '#15803d' : '#b91c1c' }}>
                        {p.isActive ? 'Đang Bán' : 'Tạm Ẩn'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button onClick={() => openEditModal(p)} className="btn-del-icon" title="Sửa"><FiEdit2 /></button>
                        <button onClick={() => setProductToDelete({ id: p.id, name: p.name })} className="btn-del-icon" title="Xóa"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {(() => {
        const filtered = items.filter(p => {
          if (categoryFilter !== 'all' && p.categoryId !== categoryFilter) return false;
          if (statusFilter === 'active' && !p.isActive) return false;
          if (statusFilter === 'hidden' && p.isActive) return false;
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            return (
              p.name.toLowerCase().includes(q) ||
              (p.brand || '').toLowerCase().includes(q) ||
              (p.slug || '').toLowerCase().includes(q)
            );
          }
          return true;
        });
        const totalPages = Math.ceil(filtered.length / pageSize) || 1;

        return (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={ps => { setPageSize(ps); setCurrentPage(1); }}
          />
        );
      })()}

      {/* Category Management Modal */}
      {isCatModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '0.75rem' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border-color)', width: '100%', maxWidth: 480, padding: '1.25rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Quản Lý Danh Mục Sản Phẩm</h3>
              <button onClick={() => setIsCatModalOpen(false)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer', padding: '0.25rem' }}><FiX /></button>
            </div>

            {/* Inline Notification inside Modal */}
            {catModalMsg && (
              <div style={{
                background: catModalMsg.type === 'error' ? '#fef2f2' : '#dcfce7',
                color: catModalMsg.type === 'error' ? '#991b1b' : '#15803d',
                border: `1px solid ${catModalMsg.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
                padding: '0.5rem 0.75rem',
                borderRadius: 8,
                fontSize: '0.825rem',
                fontWeight: 600,
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                {catModalMsg.type === 'error' ? <FiAlertCircle /> : <FiCheck />}
                {catModalMsg.text}
              </div>
            )}

            {/* Form Add Category */}
            <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <input
                type="text"
                required
                placeholder="Tên danh mục sản phẩm mới..."
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
              />
              <button type="submit" style={{ width: '100%', padding: '0.65rem', borderRadius: 10, background: 'var(--accent-primary)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
                + Thêm Danh Mục Sản Phẩm
              </button>
            </form>

            {/* List Existing Categories */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '260px', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {categories.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>Chưa có danh mục sản phẩm nào.</div>
              ) : categories.map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                  <div style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '0.875rem', display: 'block' }}>{c.name}</strong>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{c.slug}</span>
                  </div>
                  <button onClick={() => setCategoryToDelete({ id: c.id, name: c.name })} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.35rem', flexShrink: 0 }} title="Xóa danh mục">
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {isModalOpen && editingProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '0.75rem' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border-color)', width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {items.some(p => p.id === editingProduct.id) ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}><FiX /></button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Tên Sản Phẩm *</label>
                  <input type="text" required value={editingProduct.name || ''} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Danh Mục *</label>
                  <select
                    required
                    value={editingProduct.categoryId || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}
                  >
                    <option value="" disabled style={{ background: '#1e293b', color: '#94a3b8' }}>-- Chọn danh mục sản phẩm * --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id} style={{ background: '#1e293b', color: '#ffffff' }}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Thương Hiệu</label>
                  <input type="text" value={editingProduct.brand || ''} onChange={e => setEditingProduct({ ...editingProduct, brand: e.target.value })} placeholder="Honda..." style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Giá Niêm Yết *</label>
                  <input
                    type="number"
                    required
                    step={5000}
                    min={0}
                    placeholder="60000..."
                    value={editingProduct.price === 0 || editingProduct.price === undefined ? '' : editingProduct.price}
                    onChange={e => {
                      const val = e.target.value;
                      setEditingProduct({ ...editingProduct, price: val ? Number(val) : 0 });
                    }}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Giá Khuyến Mãi</label>
                  <input
                    type="number"
                    step={5000}
                    min={0}
                    value={editingProduct.discountPrice === undefined || editingProduct.discountPrice === 0 ? '' : editingProduct.discountPrice}
                    onChange={e => {
                      const val = e.target.value;
                      setEditingProduct({ ...editingProduct, discountPrice: val ? Number(val) : undefined });
                    }}
                    placeholder="KM..."
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Kho *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingProduct.stock === 0 || editingProduct.stock === undefined ? '' : editingProduct.stock}
                    onChange={e => {
                      const val = e.target.value;
                      setEditingProduct({ ...editingProduct, stock: val ? Number(val) : 0 });
                    }}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Mô Tả Ngắn</label>
                <input type="text" value={editingProduct.shortDescription || ''} onChange={e => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>URL Hình Ảnh (Phân cách dấu phẩy)</label>
                <input type="text" value={imagesInput} onChange={e => setImagesInput(e.target.value)} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
                  <input type="checkbox" checked={editingProduct.isActive ?? true} onChange={e => setEditingProduct({ ...editingProduct, isActive: e.target.checked })} style={{ width: 18, height: 18 }} />
                  Đang mở bán
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.625rem 1.25rem', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>Hủy</button>
                  <button type="submit" style={{ padding: '0.625rem 1.5rem', borderRadius: 10, background: 'var(--accent-gradient)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }} id="save-product-modal-btn">Lưu Sản Phẩm</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Product Modal */}
      <ConfirmModal
        isOpen={!!productToDelete}
        title="Xác nhận xóa sản phẩm"
        message={productToDelete ? `Bạn có chắc chắn muốn xóa sản phẩm "${productToDelete.name}" khỏi cơ sở dữ liệu?` : ''}
        confirmText="Xóa Sản Phẩm"
        cancelText="Hủy"
        type="danger"
        onConfirm={handleConfirmDeleteProduct}
        onCancel={() => setProductToDelete(null)}
      />

      {/* Confirm Delete Category Modal */}
      <ConfirmModal
        isOpen={!!categoryToDelete}
        title="Xác nhận xóa danh mục sản phẩm"
        message={categoryToDelete ? `Bạn có chắc chắn muốn xóa danh mục "${categoryToDelete.name}"?` : ''}
        confirmText="Xóa Danh Mục"
        cancelText="Hủy"
        type="danger"
        onConfirm={handleConfirmDeleteCategory}
        onCancel={() => setCategoryToDelete(null)}
      />
    </AdminLayout>
  );
};

export default ProductEditPage;
