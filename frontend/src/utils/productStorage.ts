import { SAMPLE_PRODUCTS } from '@/data/sampleData';
import type { Product } from '@/types';
import type { OrderItem } from './orderStorage';

const PRODUCTS_STORAGE_KEY = 'detailing_store_products_data';

export const productStorage = {
  getProducts: (): Product[] => {
    try {
      const data = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      } else {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(SAMPLE_PRODUCTS));
        return SAMPLE_PRODUCTS;
      }
    } catch (e) {
      console.error('Failed to parse products storage', e);
    }
    return SAMPLE_PRODUCTS;
  },

  saveProducts: (products: Product[]): void => {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products storage', e);
    }
  },

  deductStock: (orderItems: OrderItem[]): Product[] => {
    const products = productStorage.getProducts();
    const updated = products.map(p => {
      const item = orderItems.find(i => i.id === p.id || i.name === p.name);
      if (item) {
        const newStock = Math.max(0, p.stock - item.quantity);
        return { ...p, stock: newStock };
      }
      return p;
    });
    productStorage.saveProducts(updated);
    return updated;
  },

  restoreStock: (orderItems: OrderItem[]): Product[] => {
    const products = productStorage.getProducts();
    const updated = products.map(p => {
      const item = orderItems.find(i => i.id === p.id || i.name === p.name);
      if (item) {
        return { ...p, stock: p.stock + item.quantity };
      }
      return p;
    });
    productStorage.saveProducts(updated);
    return updated;
  },

  updateSingleProduct: (updatedProduct: Product): Product[] => {
    const products = productStorage.getProducts();
    const idx = products.findIndex(p => p.id === updatedProduct.id);
    let newProducts: Product[];
    if (idx !== -1) {
      newProducts = products.map(p => (p.id === updatedProduct.id ? updatedProduct : p));
    } else {
      newProducts = [updatedProduct, ...products];
    }
    productStorage.saveProducts(newProducts);
    return newProducts;
  },
};
