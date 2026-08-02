import api from '../utils/auth';

export const apiService = {
  getProducts: () => api.get('/bidding/products'),
  getProductById: (id) => api.get(`/bidding/products/${id}`),
  placeBid: (id, amount) => api.post(`/bidding/products/${id}/bid`, { amount }),
};
