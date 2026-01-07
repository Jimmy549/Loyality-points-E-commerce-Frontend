import { api } from '../api';
import { EnhancedProduct } from '@/types/enhanced-product.types';

export interface ProductsResponse {
  products: EnhancedProduct[];
  total: number;
  page: number;
  limit: number;
}

export const productsService = {
  async getAllProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    paymentType?: string;
    sortBy?: string;
  }): Promise<ProductsResponse> {
    try {
      const response = await api.get('/products', { params });
      return {
        products: response.data.products || [],
        total: response.data.total || 0,
        page: params?.page || 1,
        limit: params?.limit || 20
      };
    } catch (error) {
      console.warn('Products API call failed:', error);
      return {
        products: [],
        total: 0,
        page: params?.page || 1,
        limit: params?.limit || 20
      };
    }
  },

  async getProduct(id: string): Promise<EnhancedProduct | null> {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.warn('Product API call failed:', error);
      return null;
    }
  },

  async getCategories(): Promise<string[]> {
    try {
      const response = await api.get('/products/categories');
      return response.data || [];
    } catch (error) {
      console.warn('Categories API call failed:', error);
      return [];
    }
  }
};