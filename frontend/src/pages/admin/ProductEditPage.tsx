import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiCheck, FiShoppingCart, FiDollarSign } from 'react-icons/fi';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { addProduct, updateProduct, deleteProduct } from '@/features/productsSlice';
import type { ProductItem } from '@/types';

const ProductEditPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, categories } = useAppSelector(s => s.products);

  const [editingProduct, setEditingProduct] = useState<Partial<ProductItem> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const openNewModal = () => {
    setEditingProduct({
      id: 'prod_' + Date.now(),
      name: '',
      slug: '',
      categoryId: categories[0]?.id || 'pcat1',
      brand: 'Honda',
      price: 150000,
      discountPrice: undefined,
      stock: 20,
      rating: 5.0,
      reviewCount: 1,
      shortDescription: '',
      description: '',
      images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'],
      tags: ['phu-tung', 'chinh-hang'],
      isActive: true,
      createdAt: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: ProductItem) => {
    setEditingProduct({ ...p });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name) return;

    const slug = editingProduct.slug || editingProduct.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const finalProd = { ...editingProduct, slug } as ProductItem;

    const exists = items.some(p => p.id === finalProd.id);
    if (exists) {
      dispatch(updateProduct(finalProd));
      setSuccessMsg('Đã cập nhật sản phẩm!');
    } else {
      dispatch(addProduct(finalProd));
      setSuccessMsg('Đã thêm sản phẩm mới!');
    }

    setIsModalOpen(false);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      dispatch(deleteProduct(id));
      setSuccessMsg('Đã xóa sản phẩm.');
      setTimeout(() => setSuccessMsg(''), 2500);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="admin-page-title">Quản Lý Cửa Hàng & Phụ Tùng</h1>
          <p className="admin-page-sub">Quản lý kho hàng, cập nhật giá bán, khuyến mãi & thông tin linh kiện</p>
        </div>
        <button onClick={openNewModal} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.625rem 1.25rem', borderRadius: 10, background: 'var(--accent-primary)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }} id="add-new-product-btn">
          <FiPlus /> Thêm Sản Phẩm Mới
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
            {items.map(p => {
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
                  <td><span style={{ fontSize: '0.8rem', background: 'var(--bg-tertiary)', padding: '0.2em 0.5em', borderRadius: 6 }}>{cat?.name}</span></td>
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
                      <button onClick={() => handleDelete(p.id)} className="btn-del-icon" title="Xóa"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Editor Modal */}
      {isModalOpen && editingProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border-color)', width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {items.some(p => p.id === editingProduct.id) ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}><FiX /></button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Tên Sản Phẩm *</label>
                  <input type="text" required value={editingProduct.name || ''} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Danh Mục *</label>
                  <select value={editingProduct.categoryId} onChange={e => setEditingProduct({ ...editingProduct, categoryId: e.target.value })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Thương Hiệu</label>
                  <input type="text" value={editingProduct.brand || ''} onChange={e => setEditingProduct({ ...editingProduct, brand: e.target.value })} placeholder="Honda..." style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Giá Niêm Yết *</label>
                  <input type="number" required value={editingProduct.price || 0} onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Giá Khuyến Mãi</label>
                  <input type="number" value={editingProduct.discountPrice || ''} onChange={e => setEditingProduct({ ...editingProduct, discountPrice: e.target.value ? Number(e.target.value) : undefined })} placeholder="Bỏ trống nếu không KM" style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Số Lượng Kho *</label>
                  <input type="number" required value={editingProduct.stock || 0} onChange={e => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Mô Tả Ngắn</label>
                <input type="text" value={editingProduct.shortDescription || ''} onChange={e => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>URL Hình Ảnh (Phân cách dấu phẩy)</label>
                <input type="text" value={(editingProduct.images || []).join(', ')} onChange={e => setEditingProduct({ ...editingProduct, images: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
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
    </AdminLayout>
  );
};

export default ProductEditPage;
