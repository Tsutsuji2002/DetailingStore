import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Service, ServiceCategory } from '@/types';
import { SAMPLE_SERVICES, SAMPLE_SERVICE_CATEGORIES } from '@/data/sampleData';

interface ServicesState {
  items: Service[];
  categories: ServiceCategory[];
  selectedCategory: string;
  searchQuery: string;
  sortBy: 'name' | 'price-asc' | 'price-desc' | 'newest';
  isLoading: boolean;
}

const initialState: ServicesState = {
  items: [],
  categories: SAMPLE_SERVICE_CATEGORIES,
  selectedCategory: 'all',
  searchQuery: '',
  sortBy: 'newest',
  isLoading: false,
};

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
});

export const { setCategory, setSearch, setSort, setServices, addService, updateService, deleteService } = servicesSlice.actions;
export default servicesSlice.reducer;
