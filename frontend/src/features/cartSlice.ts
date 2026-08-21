import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

const storedCart = localStorage.getItem('motoshine_cart');

const initialState: CartState = {
  items: storedCart ? JSON.parse(storedCart) : [],
  isOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<Product>) {
      const existing = state.items.find(i => i.product.id === action.payload.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ product: action.payload, quantity: 1 });
      }
      localStorage.setItem('motoshine_cart', JSON.stringify(state.items));
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter(i => i.product.id !== action.payload);
      localStorage.setItem('motoshine_cart', JSON.stringify(state.items));
    },
    updateQuantity(state, action: PayloadAction<{ id: string; quantity: number }>) {
      const item = state.items.find(i => i.product.id === action.payload.id);
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter(i => i.product.id !== action.payload.id);
        } else {
          item.quantity = action.payload.quantity;
        }
        localStorage.setItem('motoshine_cart', JSON.stringify(state.items));
      }
    },
    clearCart(state) {
      state.items = [];
      localStorage.removeItem('motoshine_cart');
    },
    toggleCart(state) {
      state.isOpen = !state.isOpen;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, toggleCart } = cartSlice.actions;
export default cartSlice.reducer;
