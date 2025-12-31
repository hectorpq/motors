import React, { useState, useEffect } from 'react';
import {
  getProductos,
  getProductosPorSede,
  buscarProductos,
  getSedes,
  registrarSalidaStock
} from '../services/api';
import './ProductoVentas.css';

const ProductoVentas = () => {
  // Estados principales
  const [sedes, setSedes] = useState([]);
  const [sedeSeleccionada, setSedeSeleccionada] = useState(null);
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false);
  const [motivoSalida, setMotivoSalida] = useState('VENTA');
  const [observacion, setObservacion] = useState('');
  const [vistaActual, setVistaActual] = useState('tabla'); // 'tabla' o 'tarjetas'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (sedeSeleccionada) {
      cargarProductosPorSede();
    }
  }, [sedeSeleccionada]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');

      // Cargar sedes
      const sedesResponse = await getSedes();
      const sedesActivas = sedesResponse.data.filter(s => s.activo);
      
      // Agregar opción "Todas las Sedes"
      setSedes([
        { id: null, nombre: 'Todas las Sedes', activo: true },
        ...sedesActivas
      ]);

      // Seleccionar primera sede por defecto
      if (sedesActivas.length > 0) {
        setSedeSeleccionada(sedesActivas[0].id);
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  const cargarProductosPorSede = async () => {
    if (!sedeSeleccionada) {
      // Cargar todos los productos
      try {
        setLoading(true);
        const response = await getProductos();
        setProductos(response.data);
      } catch (error) {
        console.error('Error al cargar productos:', error);
        setError('Error al cargar productos');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await getProductosPorSede(sedeSeleccionada);
      setProductos(response.data);
    } catch (error) {
      console.error('Error al cargar productos por sede:', error);
      setError('Error al cargar productos de la sede');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar productos según búsqueda
  const productosFiltrados = productos.filter(p => {
    if (!busqueda) return true;
    
    const searchLower = busqueda.toLowerCase();
    return (
      p.nombre?.toLowerCase().includes(searchLower) ||
      p.codigo?.toLowerCase().includes(searchLower) ||
      p.marcaNombre?.toLowerCase().includes(searchLower) ||
      p.categoriaNombre?.toLowerCase().includes(searchLower)
    );
  });

  const getSedeIcono = (sedeNombre) => {
    const iconos = {
      'Deybimotors': '🏢',
      'Deybi Parts': '🔧',
      'Deybi Auto': '🚗'
    };
    return iconos[sedeNombre] || '🏢';
  };

  const getSedeNombre = (sedeId) => {
    const sede = sedes.find(s => s.id === sedeId);
    return sede?.nombre || 'N/A';
  };

  // Agregar producto al carrito
  const agregarAlCarrito = (producto) => {
    // Buscar stock del producto en la sede seleccionada
    const stockDisponible = producto.stocks?.find(s => s.sedeId === sedeSeleccionada)?.cantidad || 0;

    if (stockDisponible === 0) {
      alert('⚠️ Este producto no tiene stock disponible en esta sede');
      return;
    }

    const existente = carrito.find(item => item.id === producto.id);
    
    if (existente) {
      if (existente.cantidad >= stockDisponible) {
        alert(`⚠️ Stock insuficiente. Disponible: ${stockDisponible}`);
        return;
      }
      
      setCarrito(carrito.map(item => 
        item.id === producto.id 
          ? {...item, cantidad: item.cantidad + 1}
          : item
      ));
    } else {
      setCarrito([...carrito, {
        ...producto,
        cantidad: 1,
        stockDisponible: stockDisponible
      }]);
    }
  };

  // Actualizar cantidad en carrito
  const actualizarCantidad = (productoId, nuevaCantidad) => {
    const item = carrito.find(i => i.id === productoId);
    const num = parseInt(nuevaCantidad) || 0;
    
    if (num > item.stockDisponible) {
      alert(`⚠️ Stock insuficiente. Máximo: ${item.stockDisponible}`);
      return;
    }
    
    if (num <= 0) {
      eliminarDelCarrito(productoId);
      return;
    }
    
    setCarrito(carrito.map(item =>
      item.id === productoId
        ? {...item, cantidad: num}
        : item
    ));
  };

  // Eliminar del carrito
  const eliminarDelCarrito = (productoId) => {
    setCarrito(carrito.filter(item => item.id !== productoId));
  };

  // Calcular total
  const calcularTotal = () => {
    return carrito.reduce((sum, item) => sum + (item.precioVenta * item.cantidad), 0);
  };

  // Abrir modal de confirmación
  const abrirModalConfirmacion = () => {
    if (carrito.length === 0) {
      alert('⚠️ El carrito está vacío');
      return;
    }
    setMostrarModalConfirmacion(true);
  };

  // Confirmar y registrar venta
  const confirmarRegistroVenta = async () => {
    if (!observacion.trim() && motivoSalida === 'OTRO') {
      alert('❌ Debes especificar una observación cuando el motivo es "Otro"');
      return;
    }

    try {
      setLoading(true);

      // Preparar datos para la API
      const request = {
        sedeId: sedeSeleccionada,
        items: carrito.map(item => ({
          productoId: item.id,
          cantidad: item.cantidad
        })),
        motivo: motivoSalida,
        observacion: observacion.trim() || null
      };

      await registrarSalidaStock(request);

      alert('✅ Venta registrada exitosamente\n' + 
            `💰 Total: S/ ${calcularTotal().toFixed(2)}\n` +
            `📋 Productos: ${carrito.length}`);
      
      // Limpiar formulario
      setCarrito([]);
      setObservacion('');
      setMotivoSalida('VENTA');
      setMostrarModalConfirmacion(false);
      
      // Recargar productos para actualizar stock
      cargarProductosPorSede();
      
    } catch (error) {
      console.error('Error al registrar venta:', error);
      alert('❌ Error al registrar la venta: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const exportarDatos = () => {
    alert('📊 Función de exportación en desarrollo');
  };

  if (loading && productos.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div className="spinner"></div>
        <p style={{ fontSize: '16px', color: '#6b7280', marginTop: '16px' }}>Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="ventas-container">
      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      {/* Header con título */}
      <div className="page-header">
        <h1 className="page-title">Productos - Ventas</h1>
        <div className="user-info">
          <div className="user-avatar">👤</div>
          <div>
            <div className="user-name">Admin</div>
            <div className="user-role">Administrador</div>
          </div>
        </div>
      </div>

      {/* Selector de Sedes */}
      <div className="sedes-container">
        {sedes.map(sede => (
          <button
            key={sede.id || 'todas'}
            onClick={() => setSedeSeleccionada(sede.id)}
            className={`sede-card ${sedeSeleccionada === sede.id ? 'active' : ''}`}
          >
            <span className="sede-icono">
              {sede.id === null ? '🌐' : getSedeIcono(sede.nombre)}
            </span>
            <span className="sede-nombre">{sede.nombre}</span>
          </button>
        ))}
      </div>

      {/* Búsqueda y filtros */}
      <div className="search-bar">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por código, nombre, marca, categoría..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="vista-toggle">
          <button 
            className={`btn-vista ${vistaActual === 'tabla' ? 'active' : ''}`}
            onClick={() => setVistaActual('tabla')}
            title="Vista de tabla"
          >
            ☰
          </button>
          <button 
            className={`btn-vista ${vistaActual === 'tarjetas' ? 'active' : ''}`}
            onClick={() => setVistaActual('tarjetas')}
            title="Vista de tarjetas"
          >
            ⊞
          </button>
        </div>
        <button className="btn-export" onClick={exportarDatos} title="Exportar datos">📊</button>
      </div>

      <div className="main-content">
        {/* Tabla de productos */}
        <div className="table-container">
          {vistaActual === 'tabla' ? (
            // VISTA DE TABLA
            <div style={{ overflowX: 'auto', flex: 1 }}>
              <table className="productos-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Producto</th>
                    <th>Marca</th>
                    <th>Categoría</th>
                    <th>Stock</th>
                    <th>P.C.</th>
                    <th>P.V.</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {productosFiltrados.map(producto => {
                    const stock = producto.stocks?.find(s => s.sedeId === sedeSeleccionada)?.cantidad || 0;
                    const stockMinimo = producto.stocks?.find(s => s.sedeId === sedeSeleccionada)?.stockMinimo || 10;
                    
                    return (
                      <tr key={producto.id}>
                        <td>
                          <span className="codigo-badge">{producto.codigo}</span>
                        </td>
                        <td>{producto.nombre}</td>
                        <td>{producto.marcaNombre || 'N/A'}</td>
                        <td>{producto.categoriaNombre || 'N/A'}</td>
                        <td>
                          <span className={`stock-badge ${
                            stock === 0 ? 'sin-stock' : 
                            stock <= stockMinimo ? 'stock-bajo' : 
                            'stock-normal'
                          }`}>
                            {stock}
                          </span>
                        </td>
                        <td>S/ {producto.precioCompra?.toFixed(2) || '0.00'}</td>
                        <td>S/ {producto.precioVenta?.toFixed(2) || '0.00'}</td>
                        <td>
                          <span className={`estado-badge ${
                            stock === 0 ? 'sin-stock' : 
                            stock <= stockMinimo ? 'stock-bajo' : 
                            'en-stock'
                          }`}>
                            {stock === 0 ? 'Sin Stock' : stock <= stockMinimo ? 'Stock Bajo' : 'En Stock'}
                          </span>
                        </td>
                        <td>
                          <button 
                            onClick={() => agregarAlCarrito(producto)}
                            className="btn-agregar-tabla"
                            disabled={stock === 0}
                          >
                            🛒 Agregar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            // VISTA DE TARJETAS
            <div className="productos-grid">
              {productosFiltrados.map(producto => {
                const stock = producto.stocks?.find(s => s.sedeId === sedeSeleccionada)?.cantidad || 0;
                const stockMinimo = producto.stocks?.find(s => s.sedeId === sedeSeleccionada)?.stockMinimo || 10;
                
                return (
                  <div key={producto.id} className="producto-card">
                    <div className="producto-card-header">
                      <span className={`stock-badge-card ${
                        stock === 0 ? 'sin-stock' : 
                        stock <= stockMinimo ? 'stock-bajo' : 
                        'stock-normal'
                      }`}>
                        Stock: {stock}
                      </span>
                    </div>
                    
                    <div className="producto-card-body">
                      <div className="producto-icon">📦</div>
                      <h4 className="producto-card-titulo">{producto.nombre}</h4>
                      <p className="producto-card-codigo">{producto.codigo}</p>
                      <div className="producto-card-info">
                        <span className="info-item">
                          <strong>Marca:</strong> {producto.marcaNombre || 'N/A'}
                        </span>
                        <span className="info-item">
                          <strong>Categoría:</strong> {producto.categoriaNombre || 'N/A'}
                        </span>
                      </div>
                      
                      <div className="producto-card-precios">
                        <div className="precio-item">
                          <span className="precio-label">P.C.</span>
                          <span className="precio-valor">S/ {producto.precioCompra?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="precio-item precio-venta">
                          <span className="precio-label">P.V.</span>
                          <span className="precio-valor">S/ {producto.precioVenta?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="producto-card-footer">
                      <span className={`estado-badge ${
                        stock === 0 ? 'sin-stock' : 
                        stock <= stockMinimo ? 'stock-bajo' : 
                        'en-stock'
                      }`}>
                        {stock === 0 ? 'Sin Stock' : stock <= stockMinimo ? 'Stock Bajo' : 'En Stock'}
                      </span>
                      <button 
                        onClick={() => agregarAlCarrito(producto)}
                        className="btn-agregar-card"
                        disabled={stock === 0}
                      >
                        🛒 Agregar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {productosFiltrados.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">📦</span>
              <p>No se encontraron productos</p>
              <span className="empty-hint">Intenta con otros términos de búsqueda</span>
            </div>
          )}
        </div>

        {/* Panel de Carrito */}
        <div className="carrito-panel">
          <div className="carrito-header">
            <span className="carrito-icon">🛒</span>
            <h3 className="carrito-titulo">Carrito de Venta</h3>
            <span className="badge-items">{carrito.length}</span>
          </div>

          <div className="carrito-body">
            {carrito.length === 0 ? (
              <div className="carrito-vacio">
                <div className="carrito-vacio-icon">🛒</div>
                <p className="carrito-vacio-text">Carrito vacío</p>
                <p className="carrito-vacio-subtext">Agrega productos desde la tabla</p>
              </div>
            ) : (
              carrito.map(item => (
                <div key={item.id} className="item-carrito">
                  <div className="item-info">
                    <div className="item-nombre">{item.nombre}</div>
                    <div className="item-detalle">
                      {item.codigo} • {item.marcaNombre}
                    </div>
                    <div className="item-precio">S/ {item.precioVenta.toFixed(2)}</div>
                  </div>
                  
                  <div className="item-controles">
                    <input
                      type="number"
                      min="1"
                      max={item.stockDisponible}
                      value={item.cantidad}
                      onChange={(e) => actualizarCantidad(item.id, e.target.value)}
                      className="input-cantidad"
                    />
                    <div className="item-total">
                      S/ {(item.precioVenta * item.cantidad).toFixed(2)}
                    </div>
                    <button 
                      onClick={() => eliminarDelCarrito(item.id)}
                      className="btn-eliminar"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="carrito-footer">
            <div className="total-container">
              <span className="total-label">Total:</span>
              <span className="total-monto">S/ {calcularTotal().toFixed(2)}</span>
            </div>
            
            <button 
              onClick={abrirModalConfirmacion}
              className="btn-registrar"
              disabled={carrito.length === 0 || loading}
            >
              {loading ? '⏳ Procesando...' : '✅ Registrar Venta'}
            </button>
            
            <button 
              onClick={() => setCarrito([])}
              className="btn-cancelar"
              disabled={carrito.length === 0}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación */}
      {mostrarModalConfirmacion && (
        <div className="modal-overlay" onClick={() => setMostrarModalConfirmacion(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-titulo">Confirmar Registro de Salida</h2>
              <button 
                onClick={() => setMostrarModalConfirmacion(false)}
                className="btn-cerrar"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {/* Resumen de productos */}
              <div className="resumen-productos">
                <h3 className="subtitulo-modal">📦 Productos a registrar:</h3>
                <div className="lista-resumen">
                  {carrito.map(item => (
                    <div key={item.id} className="item-resumen">
                      <div className="item-resumen-info">
                        <span className="item-resumen-cantidad">{item.cantidad}x</span>
                        <span className="item-resumen-nombre">{item.nombre}</span>
                        <span className="item-resumen-detalle">({item.codigo})</span>
                      </div>
                      <span className="item-resumen-precio">
                        S/ {(item.precioVenta * item.cantidad).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="total-resumen">
                  <strong>Total:</strong>
                  <strong>S/ {calcularTotal().toFixed(2)}</strong>
                </div>
              </div>

              {/* Formulario de motivo y observación */}
              <div className="formulario">
                <div className="form-group">
                  <label className="label">
                    Motivo de Salida <span className="required">*</span>
                  </label>
                  <select
                    value={motivoSalida}
                    onChange={(e) => setMotivoSalida(e.target.value)}
                    className="select"
                  >
                    <option value="VENTA">Venta</option>
                    <option value="GARANTIA">Garantía</option>
                    <option value="MUESTRA">Muestra</option>
                    <option value="TRASLADO">Traslado entre sedes</option>
                    <option value="DEVOLUCION">Devolución a proveedor</option>
                    <option value="OTRO">Otro motivo</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">
                    Observación <span className="opcional">(Opcional)</span>
                  </label>
                  <textarea
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                    placeholder="Ingrese cualquier observación adicional sobre esta salida..."
                    rows="4"
                    className="textarea"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                onClick={() => setMostrarModalConfirmacion(false)}
                className="btn-modal-cancelar"
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarRegistroVenta}
                className="btn-modal-confirmar"
                disabled={loading}
              >
                {loading ? '⏳ Procesando...' : '✅ Confirmar y Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductoVentas;