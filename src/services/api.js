import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ============================================
// INTERCEPTORES PARA AUTENTICACIÓN
// ============================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH - AUTENTICACIÓN
// ============================================

export const login = async (username, password) => {
  const response = await api.post('/api/auth/login', { username, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.reload();
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// ============================================
// PRODUCTOS
// ============================================

export const getProductos = () => 
  api.get('/api/productos');

export const getProductosPaginados = (page = 0, size = 10) => 
  api.get(`/api/productos/paginado?page=${page}&size=${size}`);

export const getProductosPorSede = (sedeId) => 
  api.get(`/api/productos/sede/${sedeId}`);

export const getProducto = (id) => 
  api.get(`/api/productos/${id}`);

export const getProductoPorCodigo = (codigo) => 
  api.get(`/api/productos/codigo/${codigo}`);

export const buscarProductos = (filtros) => {
  const params = new URLSearchParams();
  if (filtros.nombre) params.append('nombre', filtros.nombre);
  if (filtros.categoriaId) params.append('categoriaId', filtros.categoriaId);
  if (filtros.subcategoriaId) params.append('subcategoriaId', filtros.subcategoriaId);
  if (filtros.marcaId) params.append('marcaId', filtros.marcaId);
  if (filtros.codigo) params.append('codigo', filtros.codigo);
  
  return api.get(`/api/productos/buscar?${params.toString()}`);
};

export const createProducto = (producto) => 
  api.post('/api/productos', producto);

export const updateProducto = (id, producto) => 
  api.put(`/api/productos/${id}`, producto);

export const actualizarCampoProducto = (id, campo, valor) => 
  api.patch(`/api/productos/${id}/campo?campo=${campo}&valor=${valor}`);

export const deleteProducto = (id) => 
  api.delete(`/api/productos/${id}`);

export const subirFotoProducto = (id, archivo) => {
  const formData = new FormData();
  formData.append('archivo', archivo);
  
  return api.post(`/api/productos/${id}/foto`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const eliminarFotoProducto = (id) => 
  api.delete(`/api/productos/${id}/foto`);

// ============================================
// COMPRAS
// ============================================

export const getCompras = () => 
  api.get('/api/compras');

export const getComprasUltimas = () => 
  api.get('/api/compras/ultimas');

export const getComprasPorEstado = (estado) => 
  api.get(`/api/compras/estado/${estado}`);

export const getComprasPorProveedor = (proveedorId) => 
  api.get(`/api/compras/proveedor/${proveedorId}`);

export const getComprasPorSede = (sedeId) => 
  api.get(`/api/compras/sede/${sedeId}`);

export const getComprasPorFechas = (fechaInicio, fechaFin) => 
  api.get(`/api/compras/fechas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);

export const getCompra = (id) => 
  api.get(`/api/compras/${id}`);

export const createCompra = (compra) => 
  api.post('/api/compras', compra);

export const subirFacturaCompra = (id, archivo) => {
  const formData = new FormData();
  formData.append('archivo', archivo);
  
  return api.post(`/api/compras/${id}/factura`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const actualizarEstadoCompra = (id, request) => 
  api.patch(`/api/compras/${id}/estado`, request);

export const deleteCompra = (id) => 
  api.delete(`/api/compras/${id}`);

// ============================================
// CATEGORÍAS
// ============================================

export const getCategorias = () => 
  api.get('/api/categorias');

export const getCategoriasActivas = () => 
  api.get('/api/categorias/activas');

export const getCategoria = (id) => 
  api.get(`/api/categorias/${id}`);

export const createCategoria = (categoria) => 
  api.post('/api/categorias', categoria);

export const updateCategoria = (id, categoria) => 
  api.put(`/api/categorias/${id}`, categoria);

export const deleteCategoria = (id) => 
  api.delete(`/api/categorias/${id}`);

// ============================================
// SUBCATEGORÍAS
// ============================================

export const getSubcategorias = () => 
  api.get('/api/subcategorias');

export const getSubcategoriasActivas = () => 
  api.get('/api/subcategorias/activas');

export const getSubcategoriasPorCategoria = (categoriaId) => 
  api.get(`/api/subcategorias/categoria/${categoriaId}`);

export const getSubcategoria = (id) => 
  api.get(`/api/subcategorias/${id}`);

export const createSubcategoria = (subcategoria) => 
  api.post('/api/subcategorias', subcategoria);

export const updateSubcategoria = (id, subcategoria) => 
  api.put(`/api/subcategorias/${id}`, subcategoria);

export const deleteSubcategoria = (id) => 
  api.delete(`/api/subcategorias/${id}`);

// ============================================
// MARCAS
// ============================================

export const getMarcas = () => 
  api.get('/api/marcas');

export const getMarcasActivas = () => 
  api.get('/api/marcas/activas');

export const getMarca = (id) => 
  api.get(`/api/marcas/${id}`);

export const createMarca = (marca) => 
  api.post('/api/marcas', marca);

export const updateMarca = (id, marca) => 
  api.put(`/api/marcas/${id}`, marca);

export const deleteMarca = (id) => 
  api.delete(`/api/marcas/${id}`);

// ============================================
// MODELOS
// ============================================

export const getModelos = () => 
  api.get('/api/modelos');

export const getModelosActivos = () => 
  api.get('/api/modelos/activos');

export const getModelosPorMarca = (marcaId) => 
  api.get(`/api/modelos/marca/${marcaId}`);

export const getModelo = (id) => 
  api.get(`/api/modelos/${id}`);

export const createModelo = (modelo) => 
  api.post('/api/modelos', modelo);

export const updateModelo = (id, modelo) => 
  api.put(`/api/modelos/${id}`, modelo);

export const deleteModelo = (id) => 
  api.delete(`/api/modelos/${id}`);

// ============================================
// PROVEEDORES
// ============================================

export const getProveedores = () => 
  api.get('/api/proveedores');

export const getProveedoresActivos = () => 
  api.get('/api/proveedores/activos');

export const getProveedor = (id) => 
  api.get(`/api/proveedores/${id}`);

export const buscarProveedoresPorNombre = (nombre) => 
  api.get(`/api/proveedores/buscar?nombre=${nombre}`);

export const createProveedor = (proveedor) => 
  api.post('/api/proveedores', proveedor);

export const updateProveedor = (id, proveedor) => 
  api.put(`/api/proveedores/${id}`, proveedor);

export const cambiarEstadoProveedor = (id, activo) => 
  api.patch(`/api/proveedores/${id}/estado?activo=${activo}`);

export const deleteProveedor = (id) => 
  api.delete(`/api/proveedores/${id}`);

// ============================================
// SEDES
// ============================================

export const getSedes = () => 
  api.get('/api/sedes');

export const getSedesActivas = () => 
  api.get('/api/sedes/activas');

export const getSede = (id) => 
  api.get(`/api/sedes/${id}`);

export const createSede = (sede) => 
  api.post('/api/sedes', sede);

export const updateSede = (id, sede) => 
  api.put(`/api/sedes/${id}`, sede);

export const cambiarEstadoSede = (id, activo) => 
  api.patch(`/api/sedes/${id}/estado?activo=${activo}`);

export const deleteSede = (id) => 
  api.delete(`/api/sedes/${id}`);

// ============================================
// STOCK
// ============================================

export const getStockProducto = (productoId) => 
  api.get(`/api/stock/producto/${productoId}`);

export const getStockSede = (sedeId) => 
  api.get(`/api/stock/sede/${sedeId}`);

export const getProductosSinStock = (sedeId) => 
  api.get(`/api/stock/sede/${sedeId}/sin-stock`);

export const getProductosStockBajo = (sedeId) => 
  api.get(`/api/stock/sede/${sedeId}/stock-bajo`);

export const ajustarStock = (request) => 
  api.post('/api/stock/ajustar', request);

export const registrarSalidaStock = (request) => 
  api.post('/api/stock/salida', request);

// ============================================
// USUARIOS
// ============================================

export const getUsuarios = () => 
  api.get('/api/usuarios');

export const getUsuariosActivos = () => 
  api.get('/api/usuarios/activos');

export const getUsuario = (id) => 
  api.get(`/api/usuarios/${id}`);

export const createUsuario = (usuario) => 
  api.post('/api/usuarios', usuario);

export const updateUsuario = (id, usuario) => 
  api.put(`/api/usuarios/${id}`, usuario);

export const cambiarEstadoUsuario = (id, activo) => 
  api.patch(`/api/usuarios/${id}/estado?activo=${activo}`);

export const deleteUsuario = (id) => 
  api.delete(`/api/usuarios/${id}`);

export const resetearPasswordUsuario = (id, request) => 
  api.post(`/api/usuarios/${id}/resetear-password`, request);

// ============================================
// CATÁLOGO PÚBLICO
// ============================================

export const getProductosCatalogoPublico = (categoriaId, marcaId) => {
  const params = new URLSearchParams();
  if (categoriaId) params.append('categoriaId', categoriaId);
  if (marcaId) params.append('marcaId', marcaId);
  
  return api.get(`/api/catalogo-publico/productos?${params.toString()}`);
};

// ============================================
// DASHBOARD
// ============================================

export const getDashboard = (sedeId) => 
  api.get(`/api/dashboard?sedeId=${sedeId}`);

// ============================================
// ETIQUETAS
// ============================================

export const generarEtiquetas = (productosIds, cantidadPorProducto = 1) => 
  api.post('/api/etiquetas/generar', {
    productosIds,
    cantidadPorProducto
  }, {
    responseType: 'blob'
  });

export const generarEtiquetasCompra = (compraId) => 
  api.post(`/api/etiquetas/compra/${compraId}`, {}, {
    responseType: 'blob'
  });

// ============================================
// EXPORTACIONES
// ============================================

export const exportarProductosExcel = (sedeId) => 
  api.get(`/api/exportar/productos/excel${sedeId ? `?sedeId=${sedeId}` : ''}`, {
    responseType: 'blob'
  });

export const exportarProductosStockBajoExcel = (sedeId) => 
  api.get(`/api/exportar/productos/stock-bajo/excel?sedeId=${sedeId}`, {
    responseType: 'blob'
  });

export const exportarKardexPDF = (productoId, fechaInicio, fechaFin) => {
  const params = new URLSearchParams();
  if (productoId) params.append('productoId', productoId);
  if (fechaInicio) params.append('fechaInicio', fechaInicio);
  if (fechaFin) params.append('fechaFin', fechaFin);
  
  return api.get(`/api/exportar/kardex/pdf?${params.toString()}`, {
    responseType: 'blob'
  });
};

// ============================================
// IMPORTACIONES
// ============================================

export const importarProductosExcel = (archivo) => {
  const formData = new FormData();
  formData.append('archivo', archivo);
  
  return api.post('/api/importar/productos/excel', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// ============================================
// KARDEX
// ============================================

export const getKardex = () => 
  api.get('/api/kardex');

export const getKardexPorProducto = (productoId) => 
  api.get(`/api/kardex/producto/${productoId}`);

export const getKardexPorSede = (sedeId) => 
  api.get(`/api/kardex/sede/${sedeId}`);

export const getKardexPorTipo = (tipo) => 
  api.get(`/api/kardex/tipo/${tipo}`);

export const getKardexPorFechas = (fechaInicio, fechaFin) => 
  api.get(`/api/kardex/fechas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);

export const getKardexPorProductoYFechas = (productoId, fechaInicio, fechaFin) => 
  api.get(`/api/kardex/producto/${productoId}/fechas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);

export const getKardexPorUsuario = (usuarioId) => 
  api.get(`/api/kardex/usuario/${usuarioId}`);

// ============================================
// TEST (TEMPORAL - ELIMINAR EN PRODUCCIÓN)
// ============================================

export const generarHashPassword = (password) => 
  api.get(`/api/test/hash?password=${password}`);

export default api;