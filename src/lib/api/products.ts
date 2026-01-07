import { apiClient } from './config';
import { EnhancedProduct } from '@/types/enhanced-product.types';

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  paymentType?: 'money' | 'points' | 'hybrid';
  inStock?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export const productsApi = {
  getAll: async (filters?: ProductFilters) => {
    const response = await apiClient.get('/products', { params: filters });
    return response.data;
  },

  getById: async (id: string): Promise<EnhancedProduct> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await apiClient.get('/products/categories');
    return response.data;
  },

  getFeatured: async () => {
    const response = await apiClient.get('/products/featured');
    return response.data;
  },

  getOnSale: async () => {
    const response = await apiClient.get('/products/on-sale');
    return response.data;
  },

  search: async (query: string, filters?: ProductFilters) => {
    const response = await apiClient.get('/products/search', { 
      params: { q: query, ...filters } 
    });
    return response.data;
  }
};