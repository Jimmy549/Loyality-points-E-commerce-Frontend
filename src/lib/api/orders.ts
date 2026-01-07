import { apiClient } from './config';

export interface CreateOrderRequest {
  paymentMethod: 'money' | 'points' | 'hybrid';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  pointsToUse?: number;
}

export const ordersApi = {
  createOrder: async (data: CreateOrderRequest) => {
    const response = await apiClient.post('/orders', data);
    return response.data;
  },

  getOrders: async (page = 1, limit = 10) => {
    const response = await apiClient.get('/orders', { 
      params: { page, limit } 
    });
    return response.data;
  },

  getOrderById: async (id: string) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  cancelOrder: async (id: string) => {
    const response = await apiClient.patch(`/orders/${id}/cancel`);
    return response.data;
  },

  getOrderStatus: async (id: string) => {
    const response = await apiClient.get(`/orders/${id}/status`);
    return response.data;
  }
};