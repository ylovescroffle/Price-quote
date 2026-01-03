import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Products API
export const productsAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  search: (query) => api.get(`/products/search?q=${query}`),

  // Variants
  getVariants: (productId) => api.get(`/products/${productId}/variants`),
  createVariant: (productId, data) => api.post(`/products/${productId}/variants`, data),
  updateVariant: (productId, variantId, data) =>
    api.put(`/products/${productId}/variants/${variantId}`, data),
  deleteVariant: (productId, variantId) =>
    api.delete(`/products/${productId}/variants/${variantId}`),

  // Prices
  getPrices: (productId) => api.get(`/products/${productId}/prices`),
  createPrice: (productId, data) => api.post(`/products/${productId}/prices`, data),
  crawlPrice: (productId, url, source, selector) =>
    api.post(`/products/${productId}/crawl-price`, { url, source, selector }),
  getPriceHistory: (productId) => api.get(`/products/${productId}/price-history`)
};

// Quotes API
export const quotesAPI = {
  getAll: (params = {}) => api.get('/quotes', { params }),
  getById: (id) => api.get(`/quotes/${id}`),
  create: (data) => api.post('/quotes', data),
  update: (id, data) => api.put(`/quotes/${id}`, data),
  updateStatus: (id, status) => api.patch(`/quotes/${id}/status`, { status }),
  delete: (id) => api.delete(`/quotes/${id}`),

  // Quote items
  addItem: (quoteId, data) => api.post(`/quotes/${quoteId}/items`, data),
  removeItem: (quoteId, itemId) => api.delete(`/quotes/${quoteId}/items/${itemId}`),
  recalculate: (quoteId) => api.post(`/quotes/${quoteId}/recalculate`)
};

// Customers API
export const customersAPI = {
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  search: (query) => api.get(`/customers/search?q=${query}`)
};

export default api;
