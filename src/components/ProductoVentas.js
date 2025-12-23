import React, { useState, useEffect } from 'react';
import './ProductoVentas.css';

function ProductoVentas() {
  const [productosDisponibles, setProductosDisponibles] = useState([
    { id: 1, codigo: 'DM-001', nombre: 'Pastillas de Freno Delanteras', marca: 'Toyota', modelo: 'Corolla', stock: 45, precio: 120.00 },
    { id: 2, codigo: 'DM-002', nombre: 'Filtro de Aceite', marca: 'Honda', modelo: 'Civic', stock: 78, precio: 35.00 },
    { id: 3, codigo: 'DM-003', nombre: 'Bujías NGK', marca: 'Universal', modelo: 'Varios', stock: 120, precio: 15.00 },
    { id: 4, codigo: 'DM-004', nombre: 'Amortiguador Delantero', marca: 'Nissan', modelo: 'Sentra', stock: 12, precio: 280.00 },
    { id: 5, codigo: 'DM-005', nombre: 'Batería 12V 45Ah', marca: 'Bosch', modelo: 'Universal', stock: 25, precio: 350.00 },
    { id: 6, codigo: 'DM-006', nombre: 'Llanta Michelin 185/65R15', marca: 'Michelin', modelo: 'Universal', stock: 32, precio: 420.00 },
  ]);

  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);

  const productosFiltrados = productosDisponibles.filter(p => 
    p.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.marca.toLowerCase().includes(busqueda.toLowerCase())
  );

  const agregarAlCarrito = (producto) => {
    const existe = carrito.find(item => item.id === producto.id);
    
    if (existe) {
      if (existe.cantidad < producto.stock) {
        setCarrito(carrito.map(item =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        ));
      } else {
        alert('No hay suficiente stock disponible');
      }
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  const actualizarCantidad = (id, cantidad) => {
    const producto = productosDisponibles.find(p => p.id === id);
    
    if (cantidad <= 0) {
      eliminarDelCarrito(id);
      return;
    }
    
    if (cantidad > producto.stock) {
      alert('No hay suficiente stock disponible');
      return;
    }

    setCarrito(carrito.map(item =>
      item.id === id ? { ...item, cantidad: parseInt(cantidad) || 1 } : item
    ));
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const confirmarVenta = () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    setMostrarModal(true);
  };

  const registrarVenta = () => {
    // Aquí irían las llamadas al backend
    console.log('Venta registrada:', {
      cliente: clienteNombre,
      productos: carrito,
      total: calcularTotal(),
      fecha: new Date()
    });

    alert('✅ Venta registrada exitosamente');
    setCarrito([]);
    setClienteNombre('');
    setMostrarModal(false);
  };

  const cancelarVenta = () => {
    setCarrito([]);
    setClienteNombre('');
  };

  return (
    <div className="ventas-container">
      <div className="ventas-header">
        <div className="header-info">
          <h2>🏪 Punto de Venta</h2>
          <p className="subtitle">Registrar salida de productos</p>
        </div>
      </div>

      <div className="ventas-layout">
        {/* Productos Disponibles */}
        <div className="productos-section">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar repuesto por código o nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <h3>📦 Productos Disponibles</h3>
          <div className="productos-grid">
            {productosFiltrados.map(producto => (
              <div key={producto.id} className="producto-card">
                <div className="producto-header">
                  <span className="producto-codigo">{producto.codigo}</span>
                  <span className={`stock-badge ${producto.stock < 20 ? 'bajo' : ''}`}>
                    Stock: {producto.stock}
                  </span>
                </div>
                <h4 className="producto-nombre">{producto.nombre}</h4>
                <div className="producto-info">
                  <span>🏭 {producto.marca}</span>
                  <span>🚗 {producto.modelo}</span>
                </div>
                <div className="producto-footer">
                  <span className="producto-precio">S/ {producto.precio.toFixed(2)}</span>
                  <button 
                    className="btn-agregar"
                    onClick={() => agregarAlCarrito(producto)}
                    disabled={producto.stock === 0}
                  >
                    Agregar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carrito de Ventas */}
        <div className="carrito-section">
          <div className="carrito-header">
            <h3>🛒 Productos en la Venta</h3>
            <span className="items-count">{carrito.length} items</span>
          </div>

          {carrito.length === 0 ? (
            <div className="carrito-vacio">
              <span className="icon-vacio">🛒</span>
              <p>No hay productos en la venta</p>
              <small>Agrega productos desde la lista de disponibles</small>
            </div>
          ) : (
            <>
              <div className="carrito-items">
                {carrito.map(item => (
                  <div key={item.id} className="carrito-item">
                    <div className="item-info">
                      <span className="item-codigo">{item.codigo}</span>
                      <span className="item-nombre">{item.nombre}</span>
                      <span className="item-precio">S/ {item.precio.toFixed(2)}</span>
                    </div>
                    <div className="item-actions">
                      <input
                        type="number"
                        min="1"
                        max={item.stock}
                        value={item.cantidad}
                        onChange={(e) => actualizarCantidad(item.id, e.target.value)}
                        className="cantidad-input"
                      />
                      <span className="item-subtotal">
                        S/ {(item.precio * item.cantidad).toFixed(2)}
                      </span>
                      <button
                        className="btn-eliminar"
                        onClick={() => eliminarDelCarrito(item.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="carrito-total">
                <div className="total-row">
                  <span>Total:</span>
                  <span className="total-amount">S/ {calcularTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="carrito-acciones">
                <button className="btn-cancelar" onClick={cancelarVenta}>
                  Cancelar
                </button>
                <button className="btn-confirmar" onClick={confirmarVenta}>
                  ✅ Registrar Venta
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de Confirmación */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>📋 Confirmación de Venta</h3>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Cliente (opcional):</label>
                <input
                  type="text"
                  placeholder="Nombre del cliente..."
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  className="input-cliente"
                />
              </div>

              <div className="resumen-venta">
                <h4>📦 Resumen:</h4>
                <div className="alert-success">
                  <span>✅ Venta registrada exitosamente</span>
                  <p>Total: S/ {calcularTotal().toFixed(2)}</p>
                  <p>Productos: {carrito.length}</p>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setMostrarModal(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={registrarVenta}>
                Confirmar Venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductoVentas;