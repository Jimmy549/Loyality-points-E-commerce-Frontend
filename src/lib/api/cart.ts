import { apiClient } from './config';

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  productId: string;
  quantity: number;
}

export interface ApplyPromoRequest {
  code: string;
}

export const cartApi = {
  getCart: async () => {
    const response = await apiClient.get('/cart');
    return response.data;
  },

  addItem: async (data: AddToCartRequest) => {
    const response = await apiClient.post('/cart/add', data);
    return response.data;
  },

  updateItem: async (data: UpdateCartItemRequest) => {
    const response = await apiClient.put('/cart/update', data);
    return response.data;
  },

  removeItem: async (productId: string) => {
    const response = await apiClient.delete(`/cart/remove/${productId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await apiClient.delete('/cart/clear');
    return response.data;
  },

  applyPromo: async (data: ApplyPromoRequest) => {
    const response = await apiClient.post('/cart/promo', data);
    return response.data;
  },

  removePromo: async () => {
    const response = await apiClient.delete('/cart/promo');
    return response.data;
  }
};