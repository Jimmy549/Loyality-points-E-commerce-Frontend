import { apiClient } from '../api/config';

export interface BackendProduct {
  _id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  isOnSale: boolean;
  salePrice?: number;
  loyaltyType: 'MONEY' | 'POINTS' | 'HYBRID';
  loyaltyPointsCost?: number;
  category?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  products: BackendProduct[];
  total: number;
  page: number;
  limit: number;
}

export const productsService = {
  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    isOnSale?: boolean;
    loyaltyType?: string;
    search?: string;
  }): Promise<ProductsResponse> {
    try {
      const response = await apiClient.get('/products', { params });
      return response.data;
    } catch (error) {
      console.warn('Products API failed, using fallback');
      return { products: [], total: 0, page: 1, limit: 10 };
    }
  },

  async getProductById(id: string): Promise<BackendProduct | null> {
    try {
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.warn('Product API failed');
      return null;
    }
  },

  async getSaleProducts(): Promise<BackendProduct[]> {
    try {
      const response = await apiClient.get('/products', { 
        params: { isOnSale: true } 
      });
      return response.data.products;
    } catch (error) {
      console.warn('Sale products API failed');
      return [];
    }
  },

  async getPointsProducts(): Promise<BackendProduct[]> {
    try {
      const response = await apiClient.get('/products', { 
        params: { loyaltyType: 'POINTS' } 
      });
      return response.data.products;
    } catch (error) {
      console.warn('Points products API failed');
      return [];
    }
  },

  async getHybridProducts(): Promise<BackendProduct[]> {
    try {
      const response = await apiClient.get('/products', { 
        params: { loyaltyType: 'HYBRID' } 
      });
      return response.data.products;
    } catch (error) {
      console.warn('Hybrid products API failed');
      return [];
    }
  },
};
