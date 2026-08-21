import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Product, ProductCategory } from '@/types';
import { SAMPLE_PRODUCTS, SAMPLE_PRODUCT_CATEGORIES } from '@/data/sampleData';

interface ProductsState {
  items: Product[];
  categories: ProductCategory[];
  selectedCategory: string;
  searchQuery: string;
  sortBy: 'name' | 'price-asc' | 'price-desc' | 'newest' | 'rating';
  isLoading: boolean;
}

const initialState: ProductsState = {
  items: SAMPLE_PRODUCTS,
  categories: SAMPLE_PRODUCT_CATEGORIES,
  selectedCategory: 'all',
  searchQuery: '',
  sortBy: 'newest',
  isLoading: false,
};

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
});

export const { setCategory, setSearch, setSort, setProducts, addProduct, updateProduct, deleteProduct } = productsSlice.actions;
export default productsSlice.reducer;
