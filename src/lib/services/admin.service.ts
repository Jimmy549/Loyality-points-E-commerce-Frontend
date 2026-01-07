import { api } from '../api';

export const adminService = {
  // Dashboard Analytics
  getDashboardStats: async () => {
    const response = await api.get('/admin/analytics/dashboard');
    return response.data;
  },

  // Product Management
  createProduct: async (productData: any) => {
    const response = await api.post('/admin/products', productData);
    return response.data;
  },

  updateProduct: async (id: string, productData: any) => {
    const response = await api.put(`/admin/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id: string) => {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
  },

  toggleProductSale: async (id: string, saleData: { isOnSale: boolean; salePrice?: number }) => {
    const response = await api.put(`/admin/products/${id}/sale`, saleData);
    return response.data;
  },

  // User Management
  getAllUsers: async (page = 1, limit = 20) => {
    const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  getUser: async (id: string) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  // Order Management
  getAllOrders: async (status?: string, page = 1, limit = 20) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (status) params.append('status', status);
    
    const response = await api.get(`/admin/orders?${params.toString()}`);
    return response.data;
  },

  updateOrderStatus: async (id: string, status: string) => {
    const response = await api.put(`/admin/orders/${id}`, { status });
    return response.data;
  },

  // Role Management
  assignRole: async (email: string, role: string) => {
    const response = await api.post('/roles/assign', { email, role });
    return response.data;
  }
};