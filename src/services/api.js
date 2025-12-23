import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ============ PRODUCTOS ============
export const getProductos = () => api.get('/api/productos');
export const getProducto = (id) => api.get(`/api/productos/${id}`);
export const createProducto = (producto) => api.post('/api/productos', producto);
export const updateProducto = (id, producto) => api.put(`/api/productos/${id}`, producto);
export const deleteProducto = (id) => api.delete(`/api/productos/${id}`);

// ============ MOVIMIENTOS ============
export const getMovimientos = () => api.get('/api/movimientos');
export const getMovimiento = (id) => api.get(`/api/movimientos/${id}`);
export const createMovimiento = (movimiento) => api.post('/api/movimientos', movimiento);
export const updateMovimiento = (id, movimiento) => api.put(`/api/movimientos/${id}`, movimiento);
export const deleteMovimiento = (id) => api.delete(`/api/movimientos/${id}`);

// ============ DASHBOARD ============
export const getInventarioResumen = () => api.get('/api/dashboard/inventario-resumen');
export const getStockBajo = () => api.get('/api/dashboard/stock-bajo');
export const getMovimientosRecientes = () => api.get('/api/dashboard/movimientos-recientes');

export default api;