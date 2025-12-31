import React, { useState, useEffect } from 'react';
import {
  getProductos,
  getCategorias,
  getSubcategorias,
  getSedes,
  generarEtiquetas
} from '../services/api';
import './Etiquetas.css';

function Etiquetas() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState('');
  
  const [filtros, setFiltros] = useState({
    busqueda: '',
    categoriaId: null,
    subcategoriaId: null,
    sedeId: null
  });
  
  const [productoDetalle, setProductoDetalle] = useState(null);
  const [modalDetalle, setModalDetalle] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');

      const [prodRes, catRes, subRes, sedesRes] = await Promise.all([
        getProductos(),
        getCategorias(),
        getSubcategorias(),
        getSedes()
      ]);

      setProductos(prodRes.data);
      setCategorias(catRes.data);
      setSubcategorias(subRes.data);
      setSedes([
        { id: null, nombre: 'Todas las Sedes' },
        ...sedesRes.data
      ]);

    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const productosFiltrados = productos.filter(producto => {
    // Búsqueda segura
    const busquedaLower = (filtros.busqueda || '').toLowerCase();
    const cumpleBusqueda = !filtros.busqueda || 
      (producto.nombre || '').toLowerCase().includes(busquedaLower) ||
      (producto.codigo || '').toLowerCase().includes(busquedaLower) ||
      (producto.marcaNombre || '').toLowerCase().includes(busquedaLower);
    
    const cumpleCategoria = !filtros.categoriaId || producto.categoriaId === filtros.categoriaId;
    const cumpleSubcategoria = !filtros.subcategoriaId || producto.subcategoriaId === filtros.subcategoriaId;
    const cumpleSede = !filtros.sedeId || producto.stocks?.some(s => s.sedeId === filtros.sedeId);
    
    return cumpleBusqueda && cumpleCategoria && cumpleSubcategoria && cumpleSede;
  });

  const toggleSeleccion = (productoId) => {
    setProductosSeleccionados(prev => {
      const existe = prev.find(p => p.id === productoId);
      if (existe) {
        return prev.filter(p => p.id !== productoId);
      } else {
        const producto = productos.find(p => p.id === productoId);
        return [...prev, { ...producto, cantidadEtiquetas: 1 }];
      }
    });
  };

  const actualizarCantidad = (productoId, cantidad) => {
    const num = parseInt(cantidad) || 1;
    setProductosSeleccionados(prev =>
      prev.map(p => p.id === productoId ? { ...p, cantidadEtiquetas: Math.max(1, num) } : p)
    );
  };

  const verDetalle = (producto) => {
    setProductoDetalle(producto);
    setModalDetalle(true);
  };

  const generarPDF = async () => {
    if (productosSeleccionados.length === 0) {
      alert('Selecciona al menos un producto para generar etiquetas');
      return;
    }

    try {
      setGenerando(true);
      
      const productosIds = productosSeleccionados.map(p => p.id);
      const cantidadPorProducto = productosSeleccionados[0].cantidadEtiquetas; // Usar la primera cantidad

      const response = await generarEtiquetas(productosIds, cantidadPorProducto);

      // Crear blob y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `etiquetas_${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert(`✅ Etiquetas generadas correctamente: ${totalEtiquetas} etiquetas`);
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('❌ Error al generar las etiquetas');
    } finally {
      setGenerando(false);
    }
  };

  const getStockTotal = (producto) => {
    return producto.stocks?.reduce((sum, s) => sum + s.cantidad, 0) || 0;
  };

  const totalEtiquetas = productosSeleccionados.reduce((sum, p) => sum + p.cantidadEtiquetas, 0);

  const subcategoriasFiltradas = subcategorias.filter(
    sub => !filtros.categoriaId || sub.categoriaId === filtros.categoriaId
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="spinner"></div>
        <p style={{ marginLeft: '16px' }}>Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="etiquetas-container">
      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      {/* Header */}
      <div className="etiquetas-header">
        <div className="header-titulo">
          <h1>🏷️ Generador de Etiquetas</h1>
          <p>Selecciona productos y genera etiquetas con códigos de barras</p>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <span className="stat-numero">{productosSeleccionados.length}</span>
            <span className="stat-label">Productos</span>
          </div>
          <div className="stat-card">
            <span className="stat-numero">{totalEtiquetas}</span>
            <span className="stat-label">Etiquetas</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-section">
        <div className="filtros-principales">
          <div className="filtro-busqueda">
            <input
              type="text"
              placeholder="🔍 Buscar por código, nombre o marca..."
              value={filtros.busqueda}
              onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
              className="input-busqueda"
            />
          </div>

          <select 
            value={filtros.sedeId || ''}
            onChange={(e) => setFiltros({ ...filtros, sedeId: e.target.value ? parseInt(e.target.value) : null })}
            className="select-filtro"
          >
            {sedes.map(sede => (
              <option key={sede.id || 'todas'} value={sede.id || ''}>
                {sede.id === null ? '🌐 ' : '🏢 '}{sede.nombre}
              </option>
            ))}
          </select>

          <select 
            value={filtros.categoriaId || ''}
            onChange={(e) => setFiltros({ 
              ...filtros, 
              categoriaId: e.target.value ? parseInt(e.target.value) : null,
              subcategoriaId: null 
            })}
            className="select-filtro"
          >
            <option value="">📦 Todas las Categorías</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>

          {filtros.categoriaId && subcategoriasFiltradas.length > 0 && (
            <select 
              value={filtros.subcategoriaId || ''}
              onChange={(e) => setFiltros({ 
                ...filtros, 
                subcategoriaId: e.target.value ? parseInt(e.target.value) : null 
              })}
              className="select-filtro"
            >
              <option value="">🔖 Todas las Subcategorías</option>
              {subcategoriasFiltradas.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.nombre}</option>
              ))}
            </select>
          )}
        </div>

        <div className="filtros-info">
          <span>Mostrando {productosFiltrados.length} productos</span>
        </div>
      </div>

      <div className="etiquetas-content">
        {/* Lista de Productos */}
        <div className="productos-lista">
          <h3>📋 Listado de Productos</h3>
          <div className="productos-grid">
            {productosFiltrados.map(producto => {
              const seleccionado = productosSeleccionados.find(p => p.id === producto.id);
              const stockTotal = getStockTotal(producto);
              
              return (
                <div 
                  key={producto.id} 
                  className={`producto-card ${seleccionado ? 'seleccionado' : ''}`}
                >
                  <div className="producto-header">
                    <input
                      type="checkbox"
                      checked={!!seleccionado}
                      onChange={() => toggleSeleccion(producto.id)}
                      className="checkbox-producto"
                    />
                    <div className="producto-info">
                      <h4>{producto.nombre}</h4>
                      <span className="producto-codigo">{producto.codigo}</span>
                    </div>
                  </div>
                  
                  <div className="producto-detalles-mini">
                    <span className="badge-categoria">{producto.categoriaNombre || 'Sin categoría'}</span>
                    <span className="badge-stock">Stock: {stockTotal}</span>
                    <span className="badge-precio">S/ {producto.precioVenta?.toFixed(2) || '0.00'}</span>
                  </div>

                  {seleccionado && (
                    <div className="cantidad-etiquetas">
                      <label>Cantidad de etiquetas:</label>
                      <input
                        type="number"
                        min="1"
                        value={seleccionado.cantidadEtiquetas}
                        onChange={(e) => actualizarCantidad(producto.id, e.target.value)}
                        className="input-cantidad"
                      />
                    </div>
                  )}

                  <button 
                    className="btn-ver-mas"
                    onClick={() => verDetalle(producto)}
                  >
                    👁️ Ver más detalles
                  </button>
                </div>
              );
            })}
          </div>

          {productosFiltrados.length === 0 && (
            <div className="empty-state">
              <span>📦</span>
              <p>No se encontraron productos</p>
              <small>Intenta con otros filtros</small>
            </div>
          )}
        </div>

        {/* Panel de Seleccionados */}
        <div className="panel-seleccionados">
          <h3>✅ Productos Seleccionados</h3>
          {productosSeleccionados.length === 0 ? (
            <div className="empty-state">
              <span>📋</span>
              <p>No hay productos seleccionados</p>
              <small>Marca los productos que deseas etiquetar</small>
            </div>
          ) : (
            <>
              <div className="lista-seleccionados">
                {productosSeleccionados.map(producto => (
                  <div key={producto.id} className="item-seleccionado">
                    <div className="item-info">
                      <strong>{producto.nombre}</strong>
                      <span>{producto.codigo}</span>
                    </div>
                    <div className="item-cantidad">
                      <span>{producto.cantidadEtiquetas}x</span>
                      <button
                        onClick={() => toggleSeleccion(producto.id)}
                        className="btn-quitar"
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="panel-resumen">
                <div className="resumen-totales">
                  <div className="total-item">
                    <span>Total productos:</span>
                    <strong>{productosSeleccionados.length}</strong>
                  </div>
                  <div className="total-item">
                    <span>Total etiquetas:</span>
                    <strong>{totalEtiquetas}</strong>
                  </div>
                </div>
                
                <button 
                  className="btn-generar-pdf" 
                  onClick={generarPDF}
                  disabled={generando}
                >
                  {generando ? '⏳ Generando...' : '📄 Generar PDF con Códigos de Barras'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de Detalle */}
      {modalDetalle && productoDetalle && (
        <div className="modal-overlay" onClick={() => setModalDetalle(false)}>
          <div className="modal-detalle" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📦 Detalles del Producto</h2>
              <button onClick={() => setModalDetalle(false)} className="btn-cerrar">✕</button>
            </div>
            
            <div className="modal-body">
              <div className="detalle-grid">
                <div className="detalle-item">
                  <label>Código:</label>
                  <span>{productoDetalle.codigo}</span>
                </div>
                <div className="detalle-item">
                  <label>Nombre:</label>
                  <span>{productoDetalle.nombre}</span>
                </div>
                <div className="detalle-item">
                  <label>Categoría:</label>
                  <span>{productoDetalle.categoriaNombre || 'N/A'}</span>
                </div>
                <div className="detalle-item">
                  <label>Subcategoría:</label>
                  <span>{productoDetalle.subcategoriaNombre || 'N/A'}</span>
                </div>
                <div className="detalle-item">
                  <label>Marca:</label>
                  <span>{productoDetalle.marcaNombre || 'N/A'}</span>
                </div>
                <div className="detalle-item">
                  <label>Precio:</label>
                  <span className="precio">S/ {productoDetalle.precioVenta?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="detalle-item">
                  <label>Stock Total:</label>
                  <span className="stock">{getStockTotal(productoDetalle)} unidades</span>
                </div>
                {productoDetalle.descripcion && (
                  <div className="detalle-item full-width">
                    <label>Descripción:</label>
                    <p>{productoDetalle.descripcion}</p>
                  </div>
                )}
              </div>

              <div className="codigo-barras-preview">
                <p>Vista previa del código de barras:</p>
                <div className="barcode">
                  <div className="barcode-lines">
                    {[...Array(30)].map((_, i) => (
                      <div key={i} className="line" style={{width: `${Math.random() * 3 + 1}px`}}></div>
                    ))}
                  </div>
                  <span>{productoDetalle.codigo}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Etiquetas;