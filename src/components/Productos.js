import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getProductos,
  getProductosPorSede,
  buscarProductos,
  deleteProducto,
  getSedes,
  getCategorias,
  exportarProductosExcel
} from '../services/api';

function Productos() {
  const [productos, setProductos] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [sedeSeleccionada, setSedeSeleccionada] = useState(null);
  const [filtroStock, setFiltroStock] = useState('Todos los stocks');
  const [filtroCategoria, setFiltroCategoria] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [sedeSeleccionada, filtroCategoria]);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar sedes
      const sedesResponse = await getSedes();
      setSedes([
        { id: null, nombre: 'Todas las Sedes', activo: true },
        ...sedesResponse.data.filter(s => s.activo)
      ]);

      // Cargar categorías
      const categoriasResponse = await getCategorias();
      setCategorias(categoriasResponse.data);

    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  const cargarProductos = async () => {
    try {
      setLoading(true);
      setError('');

      let response;

      // Aplicar filtros
      if (filtroCategoria || busqueda) {
        const filtros = {};
        if (busqueda) filtros.nombre = busqueda;
        if (filtroCategoria) filtros.categoriaId = filtroCategoria;
        response = await buscarProductos(filtros);
      } else if (sedeSeleccionada) {
        response = await getProductosPorSede(sedeSeleccionada);
      } else {
        response = await getProductos();
      }

      setProductos(response.data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    cargarProductos();
  };

  const productosFiltrados = productos.filter(p => {
    // Filtro de búsqueda local
    if (busqueda) {
      const searchLower = busqueda.toLowerCase();
      const cumpleBusqueda = 
        p.codigo?.toLowerCase().includes(searchLower) ||
        p.nombre?.toLowerCase().includes(searchLower) ||
        p.marcaNombre?.toLowerCase().includes(searchLower) ||
        p.categoriaNombre?.toLowerCase().includes(searchLower);
      
      if (!cumpleBusqueda) return false;
    }

    // Filtro de sede local (si no se aplicó en el servidor)
    if (sedeSeleccionada && !p.stocks?.some(s => s.sedeId === sedeSeleccionada)) {
      return false;
    }
    
    // Filtro de stock
    if (filtroStock !== 'Todos los stocks') {
      const stockTotal = p.stocks?.reduce((sum, s) => sum + s.cantidad, 0) || 0;
      const stockMin = p.stocks?.[0]?.stockMinimo || 10;

      if (filtroStock === 'En Stock' && stockTotal <= stockMin) return false;
      if (filtroStock === 'Stock Bajo' && (stockTotal === 0 || stockTotal > stockMin)) return false;
      if (filtroStock === 'Sin Stock' && stockTotal !== 0) return false;
    }
    
    return true;
  });

  const getEstado = (producto) => {
    const stockTotal = producto.stocks?.reduce((sum, s) => sum + s.cantidad, 0) || 0;
    const stockMin = producto.stocks?.[0]?.stockMinimo || 10;

    if (stockTotal === 0) return { texto: 'Sin Stock', color: '#fee2e2', textColor: '#991b1b' };
    if (stockTotal <= stockMin) return { texto: 'Stock Bajo', color: '#fef3c7', textColor: '#92400e' };
    return { texto: 'En Stock', color: '#d1fae5', textColor: '#065f46' };
  };

  const getSedeColor = (sedeName) => {
    const colores = {
      'Deybimotors': { bg: '#dbeafe', text: '#1e40af' },
      'Deybi Parts': { bg: '#fed7aa', text: '#c2410c' },
      'Deybi Auto': { bg: '#d1fae5', text: '#065f46' }
    };
    return colores[sedeName] || { bg: '#f3f4f6', text: '#374151' };
  };

  const confirmarEliminar = (producto) => {
    setProductoAEliminar(producto);
    setMostrarModal(true);
  };

  const eliminarProducto = async () => {
    try {
      await deleteProducto(productoAEliminar.id);
      setProductos(productos.filter(p => p.id !== productoAEliminar.id));
      setMostrarModal(false);
      setProductoAEliminar(null);
      alert('✅ Producto eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('❌ Error al eliminar el producto: ' + (error.response?.data?.message || error.message));
    }
  };

  const exportarExcel = async () => {
    try {
      setLoading(true);
      const response = await exportarProductosExcel(sedeSeleccionada);
      
      // Crear blob y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `productos_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert('✅ Excel exportado correctamente');
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('❌ Error al exportar a Excel');
    } finally {
      setLoading(false);
    }
  };

  const exportarPDF = () => {
    alert('📄 Exportación a PDF en desarrollo');
  };

  const getStockTotal = (producto) => {
    return producto.stocks?.reduce((sum, s) => sum + s.cantidad, 0) || 0;
  };

  if (loading && productos.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ width: '64px', height: '64px', border: '4px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }}></div>
        <p style={{ fontSize: '16px', color: '#6b7280' }}>Cargando productos...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '24px' }}>
      {/* Error Banner */}
      {error && (
        <div style={{ background: '#fee', border: '1px solid #fcc', color: '#c33', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#c33', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: '0' }}>Productos - Gestión</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/productos/nuevo" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '12px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
              ➕ Nuevo Producto
            </button>
          </Link>
          <span style={{ fontSize: '24px', color: '#8b5cf6' }}>👤</span>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: '0' }}>Admin</p>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>Administrador</p>
          </div>
        </div>
      </div>

      {/* Sedes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {sedes.map((sede) => (
          <button
            key={sede.id || 'todas'}
            onClick={() => setSedeSeleccionada(sede.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '20px 24px',
              fontSize: '16px',
              fontWeight: '600',
              border: sedeSeleccionada === sede.id ? '2px solid #6366f1' : '2px solid #e5e7eb',
              borderRadius: '12px',
              background: sedeSeleccionada === sede.id ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'white',
              color: sedeSeleccionada === sede.id ? 'white' : '#374151',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: sedeSeleccionada === sede.id ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
            }}
          >
            <span style={{ fontSize: '22px' }}>
              {sede.id === null ? '🌐' : '🏢'}
            </span>
            {sede.nombre}
          </button>
        ))}
      </div>

      {/* Búsqueda y Filtros */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: '1', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px' }}>🔍</span>
            <input
              type="text"
              placeholder="Buscar por código, nombre, marca, categoría..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
              style={{ width: '100%', padding: '14px 16px 14px 48px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
            />
          </div>
          <button onClick={handleBuscar} style={{ padding: '14px 20px', border: 'none', borderRadius: '8px', fontSize: '18px', backgroundColor: '#6366f1', color: 'white', cursor: 'pointer' }}>🔍</button>
          <button onClick={exportarExcel} style={{ padding: '14px 20px', border: 'none', borderRadius: '8px', fontSize: '18px', backgroundColor: '#10b981', color: 'white', cursor: 'pointer' }} title="Exportar Excel">📊</button>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <select value={filtroStock} onChange={(e) => setFiltroStock(e.target.value)} style={{ flex: '1', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
            <option>Todos los stocks</option>
            <option>En Stock</option>
            <option>Stock Bajo</option>
            <option>Sin Stock</option>
          </select>
          
          <select 
            value={filtroCategoria || ''} 
            onChange={(e) => setFiltroCategoria(e.target.value ? parseInt(e.target.value) : null)} 
            style={{ flex: '1', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}
          >
            <option value="">Todas las categorías</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#374151' }}>Ver Ficha</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#374151' }}>Código</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#374151' }}>Producto</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#374151' }}>Marca</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#374151' }}>Categoría</th>
              <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#374151' }}>Stock Total</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#374151' }}>P.C.</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#374151' }}>P.V.</th>
              <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#374151' }}>Estado</th>
              <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#374151' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map((producto) => {
              const estado = getEstado(producto);
              const stockTotal = getStockTotal(producto);
              
              return (
                <tr key={producto.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '16px' }}>
                    <Link to={`/productos/${producto.id}`} style={{ textDecoration: 'none' }}>
                      <button style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                        📋 Ver
                      </button>
                    </Link>
                  </td>
                  <td style={{ padding: '16px', fontWeight: '600', color: '#111827' }}>{producto.codigo}</td>
                  <td style={{ padding: '16px', color: '#1f2937' }}>{producto.nombre}</td>
                  <td style={{ padding: '16px', color: '#1f2937' }}>{producto.marcaNombre || 'N/A'}</td>
                  <td style={{ padding: '16px', color: '#1f2937' }}>{producto.categoriaNombre || 'N/A'}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{ fontWeight: '700', fontSize: '15px', color: stockTotal === 0 ? '#dc2626' : stockTotal <= 10 ? '#f59e0b' : '#111827' }}>
                      {stockTotal}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: '#1f2937' }}>S/ {producto.precioCompra?.toFixed(2) || '0.00'}</td>
                  <td style={{ padding: '16px', color: '#1f2937' }}>S/ {producto.precioVenta?.toFixed(2) || '0.00'}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{ display: 'inline-block', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', backgroundColor: estado.color, color: estado.textColor }}>
                      {estado.texto}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Link to={`/productos/${producto.id}`} style={{ padding: '8px', fontSize: '18px', textDecoration: 'none', cursor: 'pointer' }} title="Ver detalles">👁️</Link>
                      <Link to={`/productos/editar/${producto.id}`} style={{ padding: '8px', fontSize: '18px', textDecoration: 'none', cursor: 'pointer' }} title="Editar">✏️</Link>
                      <button onClick={() => confirmarEliminar(producto)} style={{ padding: '8px', fontSize: '18px', border: 'none', background: 'none', cursor: 'pointer' }} title="Eliminar">🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {productosFiltrados.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <span style={{ fontSize: '64px', display: 'block', marginBottom: '16px' }}>📦</span>
            <p style={{ fontSize: '18px', fontWeight: '600', color: '#6b7280', margin: '0 0 8px 0' }}>No se encontraron productos</p>
            <small style={{ fontSize: '14px', color: '#9ca3af' }}>Intenta con otros términos de búsqueda</small>
          </div>
        )}
      </div>

      {/* Botones Exportar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>
          Mostrando {productosFiltrados.length} de {productos.length} productos
        </span>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={exportarExcel} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', color: 'white', backgroundColor: '#10b981', cursor: 'pointer' }}>
            <span>📊</span>
            Exportar a Excel
          </button>
        </div>
      </div>

      {/* Modal */}
      {mostrarModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setMostrarModal(false)}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', maxWidth: '480px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: '0 0 12px 0' }}>⚠️ Confirmar Eliminación</h3>
            <p style={{ fontSize: '15px', color: '#6b7280', margin: '0 0 20px 0' }}>¿Estás seguro de eliminar este producto?</p>
            {productoAEliminar && (
              <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                <strong style={{ display: 'block', fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>{productoAEliminar.codigo}</strong>
                <span style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '4px' }}>{productoAEliminar.nombre}</span>
                <small style={{ display: 'block', fontSize: '12px', color: '#6b7280' }}>{productoAEliminar.marcaNombre} - {productoAEliminar.categoriaNombre}</small>
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setMostrarModal(false)} style={{ flex: 1, padding: '12px 24px', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', backgroundColor: '#f3f4f6', color: '#374151', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={eliminarProducto} style={{ flex: 1, padding: '12px 24px', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', backgroundColor: '#dc2626', color: 'white', cursor: 'pointer' }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Productos;