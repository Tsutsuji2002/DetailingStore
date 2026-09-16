import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Service, ServiceCategory } from '@/types';
import { serviceApi } from '@/services/api/serviceApi';

interface ServicesState {
  items: Service[];
  categories: ServiceCategory[];
  selectedCategory: string;
  searchQuery: string;
  sortBy: 'name' | 'price-asc' | 'price-desc' | 'newest';
  isLoading: boolean;
  error?: string | null;
}

const initialState: ServicesState = {
  items: [],
  categories: [],
  selectedCategory: 'all',
  searchQuery: '',
  sortBy: 'newest',
  isLoading: false,
  error: null,
};

export const fetchServicesThunk = createAsyncThunk(
  'services/fetchServices',
  async (params: { categoryId?: string; search?: string } | undefined, { rejectWithValue }) => {
    try {
      const data = await serviceApi.getServices(params);
      if (data && data.length > 0) {
        return data.map(s => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          categoryId: s.categoryId,
          shortDescription: s.shortDescription,
          description: s.description,
          priceFrom: s.priceFrom,
          priceTo: s.priceTo,
          duration: s.duration || '1-2 giờ',
          images: s.images && s.images.length > 0 ? s.images : ['https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=600'],
          tags: s.tags && s.tags.length > 0 ? s.tags : ['detailing'],
          isActive: s.isActive,
          createdAt: s.createdAt,
        })) as Service[];
      }
      return [];
    } catch (e: any) {
      console.warn('API fetch services failed:', e.message);
      return [];
    }
  }
);

export const fetchServiceCategoriesThunk = createAsyncThunk(
  'services/fetchServiceCategories',
  async (_, { rejectWithValue }) => {
    try {
      const data = await serviceApi.getCategories();
      if (data && data.length > 0) {
        return data.map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          icon: c.icon || '✨',
        })) as ServiceCategory[];
      }
      return [];
    } catch (e: any) {
      return [];
    }
  }
);

export const createServiceCategoryThunk = createAsyncThunk(
  'services/createCategory',
  async (catData: { name: string; icon?: string; slug?: string }, { dispatch }) => {
    try {
      await serviceApi.createCategory(catData);
      dispatch(fetchServiceCategoriesThunk());
    } catch (e: any) {
      console.error(e);
      throw e;
    }
  }
);

export const deleteServiceCategoryThunk = createAsyncThunk(
  'services/deleteCategory',
  async (id: string, { dispatch }) => {
    try {
      await serviceApi.deleteCategory(id);
      dispatch(fetchServiceCategoriesThunk());
    } catch (e: any) {
      console.error(e);
      throw e;
    }
  }
);

export const createServiceThunk = createAsyncThunk(
  'services/createService',
  async (serviceData: any, { dispatch }) => {
    try {
      const created = await serviceApi.createService(serviceData);
      dispatch(fetchServicesThunk());
      return created;
    } catch (e: any) {
      console.error('Tạo dịch vụ thất bại:', e);
      throw e;
    }
  }
);

export const updateServiceThunk = createAsyncThunk(
  'services/updateService',
  async ({ id, data }: { id: string; data: any }, { dispatch }) => {
    try {
      const updated = await serviceApi.updateService(id, data);
      dispatch(fetchServicesThunk());
      return updated;
    } catch (e: any) {
      console.error('Cập nhật dịch vụ thất bại:', e);
      throw e;
    }
  }
);

export const deleteServiceThunk = createAsyncThunk(
  'services/deleteService',
  async (id: string, { dispatch }) => {
    try {
      await serviceApi.deleteService(id);
      dispatch(deleteService(id));
    } catch (e: any) {
      console.error('Xóa dịch vụ thất bại:', e);
      throw e;
    }
  }
);

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    setCategory(state, action: PayloadAction<string>) {
      state.selectedCategory = action.payload;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setSort(state, action: PayloadAction<ServicesState['sortBy']>) {
      state.sortBy = action.payload;
    },
    setServices(state, action: PayloadAction<Service[]>) {
      state.items = action.payload;
    },
    addService(state, action: PayloadAction<Service>) {
      state.items.unshift(action.payload);
    },
    updateService(state, action: PayloadAction<Service>) {
      const idx = state.items.findIndex(s => s.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    deleteService(state, action: PayloadAction<string>) {
      state.items = state.items.filter(s => s.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServicesThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchServicesThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchServicesThunk.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchServiceCategoriesThunk.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

export const { setCategory, setSearch, setSort, setServices, addService, updateService, deleteService } = servicesSlice.actions;
export default servicesSlice.reducer;
