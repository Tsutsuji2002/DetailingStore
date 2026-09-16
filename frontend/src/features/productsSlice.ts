import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Product, ProductCategory } from '@/types';
import { productApi } from '@/services/api/productApi';

interface ProductsState {
  items: Product[];
  categories: ProductCategory[];
  selectedCategory: string;
  searchQuery: string;
  sortBy: 'name' | 'price-asc' | 'price-desc' | 'newest' | 'rating';
  isLoading: boolean;
  error?: string | null;
}

const initialState: ProductsState = {
  items: [],
  categories: [],
  selectedCategory: 'all',
  searchQuery: '',
  sortBy: 'newest',
  isLoading: false,
  error: null,
};

import { toVietnameseSlug } from '@/utils/slugUtils';
import { productStorage } from '@/utils/productStorage';

export const fetchProductsThunk = createAsyncThunk(
  'products/fetchProducts',
  async (params: { categoryId?: string; search?: string; sortBy?: string } | undefined, { rejectWithValue }) => {
    const localProds = productStorage.getProducts();
    try {
      const data = await productApi.getProducts(params);
      if (data && data.length > 0) {
        return data.map(p => {
          const safeSlug = toVietnameseSlug(p.slug || p.name) || p.id;
          const localMatch = localProds.find(lp => lp.id === p.id);
          return {
            id: p.id,
            name: p.name,
            slug: safeSlug,
            categoryId: p.categoryId,
            brand: p.brand || 'Khác',
            price: p.price,
            discountPrice: p.discountPrice,
            stock: localMatch !== undefined ? localMatch.stock : p.stock,
            rating: p.rating,
            reviewCount: p.reviewCount,
            shortDescription: p.shortDescription,
            description: p.description,
            images: p.images && p.images.length > 0 ? p.images : ['https://placehold.co/600x400/1e293b/94a3b8?text=Product+Image'],
            tags: ['san-pham'],
            isActive: p.isActive,
            createdAt: p.createdAt,
          } as Product;
        });
      }
      return localProds;
    } catch (e: any) {
      console.warn('API fetch products failed, using local productStorage:', e.message);
      return localProds;
    }
  }
);

export const fetchCategoriesThunk = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const data = await productApi.getCategories();
      if (data && data.length > 0) {
        return data.map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
        })) as ProductCategory[];
      }
      return [];
    } catch (e: any) {
      return [];
    }
  }
);

export const createProductCategoryThunk = createAsyncThunk(
  'products/createCategory',
  async (catData: { name: string; slug?: string; icon?: string }, { dispatch }) => {
    try {
      await productApi.createCategory(catData);
      dispatch(fetchCategoriesThunk());
    } catch (e: any) {
      console.error('Tạo danh mục sản phẩm thất bại:', e);
      throw e;
    }
  }
);

export const deleteProductCategoryThunk = createAsyncThunk(
  'products/deleteCategory',
  async (id: string, { dispatch }) => {
    try {
      await productApi.deleteCategory(id);
      dispatch(fetchCategoriesThunk());
    } catch (e: any) {
      console.error('Xóa danh mục sản phẩm thất bại:', e);
      throw e;
    }
  }
);

export const createProductThunk = createAsyncThunk(
  'products/createProduct',
  async (productData: any, { dispatch }) => {
    try {
      const created = await productApi.createProduct(productData);
      dispatch(fetchProductsThunk());
      return created;
    } catch (e: any) {
      console.error('Tạo sản phẩm thất bại:', e);
      throw e;
    }
  }
);

export const updateProductThunk = createAsyncThunk(
  'products/updateProduct',
  async ({ id, data }: { id: string; data: any }, { dispatch }) => {
    try {
      const updated = await productApi.updateProduct(id, data);
      dispatch(fetchProductsThunk());
      return updated;
    } catch (e: any) {
      console.error('Cập nhật sản phẩm thất bại:', e);
      throw e;
    }
  }
);

export const deleteProductThunk = createAsyncThunk(
  'products/deleteProduct',
  async (id: string, { dispatch }) => {
    try {
      await productApi.deleteProduct(id);
      dispatch(deleteProduct(id));
    } catch (e: any) {
      console.error('Xóa sản phẩm thất bại:', e);
      throw e;
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setCategory(state, action: PayloadAction<string>) { state.selectedCategory = action.payload; },
    setSearch(state, action: PayloadAction<string>) { state.searchQuery = action.payload; },
    setSort(state, action: PayloadAction<ProductsState['sortBy']>) { state.sortBy = action.payload; },
    setProducts(state, action: PayloadAction<Product[]>) { state.items = action.payload; },
    addProduct(state, action: PayloadAction<Product>) { state.items.unshift(action.payload); },
    updateProduct(state, action: PayloadAction<Product>) {
      const idx = state.items.findIndex(p => p.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    deleteProduct(state, action: PayloadAction<string>) {
      state.items = state.items.filter(p => p.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsThunk.pending, (state) => { state.isLoading = true; })
      .addCase(fetchProductsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchProductsThunk.rejected, (state) => { state.isLoading = false; })
      .addCase(fetchCategoriesThunk.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

export const { setCategory, setSearch, setSort, setProducts, addProduct, updateProduct, deleteProduct } = productsSlice.actions;
export default productsSlice.reducer;
