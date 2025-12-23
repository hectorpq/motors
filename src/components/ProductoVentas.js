import React, { useState, useEffect } from 'react';
import './ProductoVentas.css';

const ProductoVentas = () => {
  // Estados principales
  const [sedeSeleccionada, setSedeSeleccionada] = useState('todas');
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false);
  const [motivoSalida, setMotivoSalida] = useState('VENTA');
  const [observacion, setObservacion] = useState('');
  const [vistaActual, setVistaActual] = useState('tabla'); // 'tabla' o 'tarjetas'

  // Sedes según tu captura
  const sedes = [
    { id: 'todas', nombre: 'Todas las Sedes', icono: '🌐', color: '#7c3aed' },
    { id: 'deybimotors', nombre: 'Deybimotors', icono: '🏢', color: '#3b82f6' },
    { id: 'deybi-parts', nombre: 'Deybi Parts', icono: '🔧', color: '#f59e0b' },
    { id: 'deybi-auto', nombre: 'Deybi Auto', icono: '🚗', color: '#10b981' }
  ];

  // Productos de ejemplo - reemplazar con tu API
  const productosEjemplo = [
    {
      id: 1,
      codigo: 'DM-001',
      nombre: 'Pastillas de Freno Delanteras',
      sede: 'deybimotors',
      marca_producto: 'Brembo',
      marca_auto: 'Toyota',
      modelo: 'Corolla',
      stock: 45,
      precio_compra: 85.00,
      precio_venta: 120.00,
      estado: 'En Stock'
    },
    {
      id: 2,
      codigo: 'DP-002',
      nombre: 'Filtro de Aceite',
      sede: 'deybi-parts',
      marca_producto: 'Filtron',
      marca_auto: 'Honda',
      modelo: 'Civic',
      stock: 8,
      precio_compra: 20.00,
      precio_venta: 35.00,
      estado: 'Stock Bajo'
    },
    {
      id: 3,
      codigo: 'DA-003',
      nombre: 'Amortiguador Trasero',
      sede: 'deybi-auto',
      marca_producto: 'Monroe',
      marca_auto: 'Nissan',
      modelo: 'Sentra',
      stock: 0,
      precio_compra: 180.00,
      precio_venta: 280.00,
      estado: 'Sin Stock'
    },
    {
      id: 4,
      codigo: 'DM-004',
      nombre: 'Juego de Cables de Bujía',
      sede: 'deybimotors',
      marca_producto: 'Bosch',
      marca_auto: 'Volkswagen',
      modelo: 'Gol',
      stock: 28,
      precio_compra: 45.00,
      precio_venta: 75.00,
      estado: 'En Stock'
    },
    {
      id: 5,
      codigo: 'DP-005',
      nombre: 'Batería 12V 60Ah',
      sede: 'deybi-parts',
      marca_producto: 'AC Delco',
      marca_auto: 'Chevrolet',
      modelo: 'Aveo',
      stock: 15,
      precio_compra: 320.00,
      precio_venta: 450.00,
      estado: 'En Stock'
    },
    {
      id: 6,
      codigo: 'DA-006',
      nombre: 'Bujías NGK Platinum',
      sede: 'deybi-auto',
      marca_producto: 'NGK',
      marca_auto: 'Mazda',
      modelo: '3',
      stock: 52,
      precio_compra: 12.00,
      precio_venta: 18.00,
      estado: 'En Stock'
    },
    {
      id: 7,
      codigo: 'DM-007',
      nombre: 'Kit de Embrague',
      sede: 'deybimotors',
      marca_producto: 'Valeo',
      marca_auto: 'Renault',
      modelo: 'Logan',
      stock: 6,
      precio_compra: 450.00,
      precio_venta: 620.00,
      estado: 'Stock Bajo'
    },
    {
      id: 8,
      codigo: 'DP-008',
      nombre: 'Llanta 185/65R15',
      sede: 'deybi-parts',
      marca_producto: 'Michelin',
      marca_auto: 'Universal',
      modelo: 'Varios',
      stock: 24,
      precio_compra: 280.00,
      precio_venta: 420.00,
      estado: 'En Stock'
    }
  ];

  useEffect(() => {
    // Filtrar productos por sede
    if (sedeSeleccionada === 'todas') {
      setProductos(productosEjemplo);
    } else {
      setProductos(productosEjemplo.filter(p => p.sede === sedeSeleccionada));
    }
  }, [sedeSeleccionada]);

  // Filtrar productos según búsqueda
  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.marca_producto.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.marca_auto.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.modelo.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Obtener clase CSS según sede
  const getSedeClass = (sedeId) => {
    return `sede-${sedeId}`;
  };

  // Agregar producto al carrito
  const agregarAlCarrito = (producto) => {
    if (producto.stock === 0) {
      alert('⚠️ Este producto no tiene stock disponible');
      return;
    }

    const existente = carrito.find(item => item.id === producto.id);
    
    if (existente) {
      if (existente.cantidad >= producto.stock) {
        alert(`⚠️ Stock insuficiente. Disponible: ${producto.stock}`);
        return;
      }
      
      setCarrito(carrito.map(item => 
        item.id === producto.id 
          ? {...item, cantidad: item.cantidad + 1}
          : item
      ));
    } else {
      setCarrito([...carrito, {...producto, cantidad: 1}]);
    }
  };

  // Actualizar cantidad en carrito
  const actualizarCantidad = (productoId, nuevaCantidad) => {
    const producto = productos.find(p => p.id === productoId);
    const num = parseInt(nuevaCantidad) || 0;
    
    if (num > producto.stock) {
      alert(`⚠️ Stock insuficiente. Máximo: ${producto.stock}`);
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
    return carrito.reduce((sum, item) => sum + (item.precio_venta * item.cantidad), 0);
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
    const ventaData = {
      items: carrito,
      motivo: motivoSalida,
      observacion: observacion.trim(),
      total: calcularTotal(),
      fecha: new Date().toISOString(),
      usuario: 'Admin' // Obtener del contexto
    };

    try {
      // TODO: Reemplazar con tu endpoint de API
      console.log('📦 Registrando venta:', ventaData);
      
      // Ejemplo de llamada a tu API:
      // const response = await fetch('/api/ventas', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(ventaData)
      // });
      // const result = await response.json();
      
      // Simular registro exitoso
      await new Promise(resolve => setTimeout(resolve, 800));
      
      alert('✅ Venta registrada exitosamente\n' + 
            `💰 Total: S/ ${calcularTotal().toFixed(2)}\n` +
            `📋 Productos: ${carrito.length}`);
      
      // Limpiar formulario
      setCarrito([]);
      setObservacion('');
      setMotivoSalida('VENTA');
      setMostrarModalConfirmacion(false);
      
    } catch (error) {
      alert('❌ Error al registrar la venta');
      console.error(error);
    }
  };

  return (
    <div className="ventas-container">
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
            key={sede.id}
            onClick={() => setSedeSeleccionada(sede.id)}
            className={`sede-card ${sedeSeleccionada === sede.id ? 'active' : ''} ${getSedeClass(sede.id)}`}
          >
            <span className="sede-icono">{sede.icono}</span>
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
            placeholder="Buscar por cualquier campo: código, marca, modelo, descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="btn-add" title="Agregar producto">➕</button>
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
        <button className="btn-export" title="Exportar datos">📊</button>
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
                    <th>Producto</th>
                    <th>Marca Auto</th>
                    <th>Modelo</th>
                    <th>Descripción</th>
                    <th>Stock</th>
                    <th>P.C.</th>
                    <th>P.V.</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {productosFiltrados.map(producto => (
                    <tr key={producto.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={`sede-badge ${getSedeClass(producto.sede)}`}>
                            {sedes.find(s => s.id === producto.sede)?.icono}
                          </span>
                          <span>{producto.codigo}</span>
                        </div>
                      </td>
                      <td>{producto.marca_auto}</td>
                      <td>{producto.modelo}</td>
                      <td>{producto.nombre}</td>
                      <td>
                        <span className={`stock-badge ${
                          producto.stock === 0 ? 'sin-stock' : 
                          producto.stock < 10 ? 'stock-bajo' : 
                          'stock-normal'
                        }`}>
                          {producto.stock}
                        </span>
                      </td>
                      <td>S/ {producto.precio_compra.toFixed(2)}</td>
                      <td>S/ {producto.precio_venta.toFixed(2)}</td>
                      <td>
                        <span className={`estado-badge ${
                          producto.estado === 'En Stock' ? 'en-stock' : 
                          producto.estado === 'Stock Bajo' ? 'stock-bajo' : 
                          'sin-stock'
                        }`}>
                          {producto.estado}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => agregarAlCarrito(producto)}
                          className="btn-agregar-tabla"
                          disabled={producto.stock === 0}
                        >
                          🛒 Agregar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // VISTA DE TARJETAS
            <div className="productos-grid">
              {productosFiltrados.map(producto => (
                <div key={producto.id} className="producto-card">
                  <div className="producto-card-header">
                    <span className={`sede-badge-card ${getSedeClass(producto.sede)}`}>
                      {sedes.find(s => s.id === producto.sede)?.icono}
                    </span>
                    <span className={`stock-badge-card ${
                      producto.stock === 0 ? 'sin-stock' : 
                      producto.stock < 10 ? 'stock-bajo' : 
                      'stock-normal'
                    }`}>
                      Stock: {producto.stock}
                    </span>
                  </div>
                  
                  <div className="producto-card-body">
                    <div className="producto-icon">📦</div>
                    <h4 className="producto-card-titulo">{producto.nombre}</h4>
                    <p className="producto-card-codigo">{producto.codigo}</p>
                    <div className="producto-card-info">
                      <span className="info-item">
                        <strong>Marca:</strong> {producto.marca_auto}
                      </span>
                      <span className="info-item">
                        <strong>Modelo:</strong> {producto.modelo}
                      </span>
                      <span className="info-item">
                        <strong>Producto:</strong> {producto.marca_producto}
                      </span>
                    </div>
                    
                    <div className="producto-card-precios">
                      <div className="precio-item">
                        <span className="precio-label">P.C.</span>
                        <span className="precio-valor">S/ {producto.precio_compra.toFixed(2)}</span>
                      </div>
                      <div className="precio-item precio-venta">
                        <span className="precio-label">P.V.</span>
                        <span className="precio-valor">S/ {producto.precio_venta.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="producto-card-footer">
                    <span className={`estado-badge ${
                      producto.estado === 'En Stock' ? 'en-stock' : 
                      producto.estado === 'Stock Bajo' ? 'stock-bajo' : 
                      'sin-stock'
                    }`}>
                      {producto.estado}
                    </span>
                    <button 
                      onClick={() => agregarAlCarrito(producto)}
                      className="btn-agregar-card"
                      disabled={producto.stock === 0}
                    >
                      🛒 Agregar
                    </button>
                  </div>
                </div>
              ))}
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
                      {item.marca_auto} {item.modelo} • {item.codigo}
                    </div>
                    <div className="item-precio">S/ {item.precio_venta.toFixed(2)}</div>
                  </div>
                  
                  <div className="item-controles">
                    <input
                      type="number"
                      min="1"
                      max={item.stock}
                      value={item.cantidad}
                      onChange={(e) => actualizarCantidad(item.id, e.target.value)}
                      className="input-cantidad"
                    />
                    <div className="item-total">
                      S/ {(item.precio_venta * item.cantidad).toFixed(2)}
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
              disabled={carrito.length === 0}
            >
              ✅ Registrar Venta
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
                        S/ {(item.precio_venta * item.cantidad).toFixed(2)}
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
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarRegistroVenta}
                className="btn-modal-confirmar"
              >
                ✅ Confirmar y Registrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductoVentas;