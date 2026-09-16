import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { ShopInfo } from '@/types';
import { SHOP_INFO as DEFAULT_SHOP_INFO } from '@/data/sampleData';
import shopApi from '@/services/api/shopApi';

const LOCAL_STORAGE_KEY = 'detailing_shop_info';

const loadShopInfo = (): ShopInfo => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SHOP_INFO, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to load shop info from localStorage', e);
  }
  return DEFAULT_SHOP_INFO;
};

interface ShopState {
  info: ShopInfo;
  isLoading: boolean;
  error: string | null;
}

const initialState: ShopState = {
  info: loadShopInfo(),
  isLoading: false,
  error: null,
};

// Async Thunks
export const fetchShopInfoThunk = createAsyncThunk(
  'shop/fetchInfo',
  async (_, { rejectWithValue }) => {
    try {
      const data = await shopApi.getShopInfo();
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Không thể lấy thông tin cửa hàng.');
    }
  }
);

export const updateShopInfoThunk = createAsyncThunk(
  'shop/updateInfo',
  async (payload: Partial<ShopInfo>, { rejectWithValue }) => {
    try {
      const updated = await shopApi.updateShopInfo(payload);
      return updated;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Cập nhật thông tin cửa hàng thất bại.');
    }
  }
);

export const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {
    updateShopInfo: (state, action: PayloadAction<Partial<ShopInfo>>) => {
      state.info = { ...state.info, ...action.payload };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.info));
      } catch (e) {
        console.error('Failed to save shop info to localStorage', e);
      }
    },
    resetShopInfo: (state) => {
      state.info = DEFAULT_SHOP_INFO;
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    },
  },
  extraReducers: (builder) => {
    // Fetch Shop Info
    builder.addCase(fetchShopInfoThunk.fulfilled, (state, action) => {
      state.info = { ...DEFAULT_SHOP_INFO, ...action.payload };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.info));
      } catch (e) {}
    });

    // Update Shop Info
    builder.addCase(updateShopInfoThunk.fulfilled, (state, action) => {
      state.info = { ...state.info, ...action.payload };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.info));
      } catch (e) {}
    });
  },
});

export const { updateShopInfo, resetShopInfo } = shopSlice.actions;
export default shopSlice.reducer;
