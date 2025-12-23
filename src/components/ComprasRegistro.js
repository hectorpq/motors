import React, { useState, useEffect } from 'react';
import './ComprasRegistro.css';

const ComprasRegistro = () => {
  const [sedeSeleccionada, setSedeSeleccionada] = useState('todas');
  const [proveedor, setProveedor] = useState('');
  const [numeroFactura, setNumeroFactura] = useState('');
  const [fechaCompra, setFechaCompra] = useState(new Date().toISOString().split('T')[0]);
  const [productos, setProductos] = useState([]);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [proveedores, setProveedores] = useState([]);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [modalNuevoProveedor, setModalNuevoProveedor] = useState(false);
  const [nuevoProveedorData, setNuevoProveedorData] = useState({
    ruc: '',
    nombre: '',
    razonSocial: '',
    direccion: '',
    telefono: '',
    email: '',
    contacto: ''
  });

  const sedes = [
    { id: 'todas', nombre: 'Todas las Sedes', icono: '🌐' },
    { id: 'deybimotors', nombre: 'Deybimotors', icono: '🏢' },
    { id: 'deybiparts', nombre: 'Deybi Parts', icono: '🔧' },
    { id: 'deybiauto', nombre: 'Deybi Auto', icono: '🚗' }
  ];

  useEffect(() => {
    cargarProveedores();
    cargarProductosDisponibles();
  }, []);

  const cargarProveedores = async () => {
    try {
      // Reemplazar con tu API
      const response = await fetch('/api/proveedores');
      const data = await response.json();
      setProveedores(data);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      // Datos de ejemplo
      setProveedores([
        { id: 1, ruc: '20987654321', nombre: 'Repuestos Honda Perú' },
        { id: 2, ruc: '20123456789', nombre: 'Distribuidora Automotriz SAC' },
        { id: 3, ruc: '20456789123', nombre: 'Toyota Parts Distribution' }
      ]);
    }
  };

  const cargarProductosDisponibles = async () => {
    try {
      const response = await fetch('/api/productos');
      const data = await response.json();
      setProductosDisponibles(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      // Datos de ejemplo
      setProductosDisponibles([
        {
          codigo: 'DM-001',
          nombre: 'Pastillas de Freno Delanteras',
          marca: 'Toyota',
          modelo: 'Corolla',
          precioCompra: 100.00,
          stock: 45
        },
        {
          codigo: 'DM-002',
          nombre: 'Filtro de Aceite',
          marca: 'Honda',
          modelo: 'Civic',
          precioCompra: 30.00,
          stock: 78
        },
        {
          codigo: 'DM-003',
          nombre: 'Bujías NGK',
          marca: 'Universal',
          modelo: 'Varios',
          precioCompra: 12.00,
          stock: 120
        },
        {
          codigo: 'DM-004',
          nombre: 'Amortiguador Delantero',
          marca: 'Nissan',
          modelo: 'Sentra',
          precioCompra: 250.00,
          stock: 12
        },
        {
          codigo: 'DM-005',
          nombre: 'Batería 12V 45Ah',
          marca: 'Bosch',
          modelo: 'Universal',
          precioCompra: 300.00,
          stock: 23
        }
      ]);
    }
  };

  const productosFiltrados = productosDisponibles.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.marca.toLowerCase().includes(busqueda.toLowerCase())
  );

  const agregarProducto = (producto) => {
    const existe = productos.find(p => p.codigo === producto.codigo);
    if (existe) {
      setProductos(productos.map(p => 
        p.codigo === producto.codigo 
          ? { ...p, cantidad: p.cantidad + 1 }
          : p
      ));
    } else {
      setProductos([...productos, { ...producto, cantidad: 1 }]);
    }
  };

  const actualizarCantidad = (codigo, cantidad) => {
    if (cantidad <= 0) {
      eliminarProducto(codigo);
    } else {
      setProductos(productos.map(p => 
        p.codigo === codigo ? { ...p, cantidad: parseInt(cantidad) } : p
      ));
    }
  };

  const actualizarPrecioCompra = (codigo, precio) => {
    setProductos(productos.map(p => 
      p.codigo === codigo ? { ...p, precioCompra: parseFloat(precio) || 0 } : p
    ));
  };

  const eliminarProducto = (codigo) => {
    setProductos(productos.filter(p => p.codigo !== codigo));
  };

  const calcularTotal = () => {
    return productos.reduce((sum, p) => sum + (p.cantidad * p.precioCompra), 0);
  };

  const handleRegistrarCompra = () => {
    if (!proveedor || !numeroFactura || productos.length === 0) {
      alert('Por favor complete todos los campos y agregue al menos un producto');
      return;
    }
    setMostrarConfirmacion(true);
  };

  const confirmarRegistro = async () => {
    try {
      const compra = {
        sede: sedeSeleccionada,
        proveedor,
        numeroFactura,
        fechaCompra,
        productos,
        total: calcularTotal()
      };

      const response = await fetch('/api/compras/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(compra)
      });

      if (response.ok) {
        alert('✅ ¡Compra registrada exitosamente!');
        limpiarFormulario();
        setMostrarConfirmacion(false);
      } else {
        alert('❌ Error al registrar la compra');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al registrar la compra');
    }
  };

  const limpiarFormulario = () => {
    setSedeSeleccionada('todas');
    setProveedor('');
    setNumeroFactura('');
    setFechaCompra(new Date().toISOString().split('T')[0]);
    setProductos([]);
    setBusqueda('');
  };

  const handleInputProveedorChange = (field, value) => {
    setNuevoProveedorData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validarRUC = (ruc) => {
    // Validación básica de RUC peruano (11 dígitos)
    return /^\d{11}$/.test(ruc);
  };

  const guardarNuevoProveedor = async () => {
    // Validaciones
    if (!nuevoProveedorData.ruc || !nuevoProveedorData.nombre) {
      alert('⚠️ Por favor completa los campos obligatorios (RUC y Nombre)');
      return;
    }

    if (!validarRUC(nuevoProveedorData.ruc)) {
      alert('⚠️ El RUC debe tener 11 dígitos');
      return;
    }

    try {
      const response = await fetch('/api/proveedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoProveedorData)
      });

      if (response.ok) {
        const proveedorCreado = await response.json();
        // Actualizar lista de proveedores
        setProveedores([...proveedores, proveedorCreado]);
        // Seleccionar el nuevo proveedor
        setProveedor(proveedorCreado.id);
        // Cerrar modal y limpiar
        setModalNuevoProveedor(false);
        setNuevoProveedorData({
          ruc: '',
          nombre: '',
          razonSocial: '',
          direccion: '',
          telefono: '',
          email: '',
          contacto: ''
        });
        alert('✅ Proveedor registrado exitosamente');
      } else {
        const error = await response.json();
        alert(`❌ Error al registrar proveedor: ${error.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al registrar el proveedor');
    }
  };

  return (
    <div className="compras-registro-container">
      {/* Header */}
      <div className="compras-header">
        <div className="header-icon">🛒</div>
        <div>
          <h1>Registrar Nueva Compra</h1>
          <p className="subtitle">Ingreso de inventario a almacén</p>
        </div>
      </div>

      {/* Selector de Sedes */}
      <div className="sedes-selector">
        {sedes.map(sede => (
          <div
            key={sede.id}
            className={`sede-card ${sedeSeleccionada === sede.id ? 'active' : ''}`}
            onClick={() => setSedeSeleccionada(sede.id)}
          >
            <span className="sede-icon">{sede.icono}</span>
            <span className="sede-nombre">{sede.nombre}</span>
          </div>
        ))}
      </div>

      <div className="compras-content">
        {/* Formulario de Compra */}
        <div className="formulario-section">
          <div className="datos-compra-card">
            <div className="card-header">
              <span className="card-icon">📋</span>
              <h2>Datos de la Compra</h2>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Proveedor *</label>
                <select
                  value={proveedor}
                  onChange={(e) => {
                    if (e.target.value === 'nuevo') {
                      setModalNuevoProveedor(true);
                    } else {
                      setProveedor(e.target.value);
                    }
                  }}
                  className="form-control"
                >
                  <option value="">Seleccionar proveedor...</option>
                  {proveedores.map(prov => (
                    <option key={prov.id} value={prov.id}>
                      {prov.ruc} - {prov.nombre}
                    </option>
                  ))}
                  <option value="nuevo" className="option-agregar">
                    ➕ Agregar Nuevo Proveedor
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>N° Factura *</label>
                <input
                  type="text"
                  value={numeroFactura}
                  onChange={(e) => setNumeroFactura(e.target.value)}
                  placeholder="Ej: F001-00001"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Fecha de Compra *</label>
                <input
                  type="date"
                  value={fechaCompra}
                  onChange={(e) => setFechaCompra(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
          </div>

          {/* Búsqueda de Productos */}
          <div className="productos-busqueda-card">
            <div className="card-header">
              <span className="card-icon">📦</span>
              <h2>Productos Disponibles</h2>
            </div>

            <div className="busqueda-input">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Buscar repuesto por código o nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="productos-grid">
              {productosFiltrados.map(producto => (
                <div key={producto.codigo} className="producto-card">
                  <div className="producto-badge">{producto.codigo}</div>
                  <h3>{producto.nombre}</h3>
                  <div className="producto-info">
                    <span>🏭 {producto.marca}</span>
                    <span>🚗 {producto.modelo}</span>
                  </div>
                  <div className="producto-precio">
                    S/ {producto.precioCompra.toFixed(2)}
                  </div>
                  <button
                    className="btn-agregar"
                    onClick={() => agregarProducto(producto)}
                  >
                    Agregar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resumen de Compra */}
        <div className="resumen-section">
          <div className="resumen-card">
            <div className="card-header">
              <span className="card-icon">📝</span>
              <h2>Productos en la Compra</h2>
              <span className="items-count">{productos.length} items</span>
            </div>

            {productos.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📦</span>
                <p>No hay productos agregados</p>
                <span className="empty-hint">Busca y agrega productos a tu compra</span>
              </div>
            ) : (
              <div className="productos-lista">
                {productos.map(producto => (
                  <div key={producto.codigo} className="producto-item">
                    <div className="producto-item-header">
                      <span className="producto-codigo">{producto.codigo}</span>
                      <button
                        className="btn-eliminar"
                        onClick={() => eliminarProducto(producto.codigo)}
                      >
                        ❌
                      </button>
                    </div>
                    <h4>{producto.nombre}</h4>
                    <div className="producto-item-details">
                      <div className="detail-group">
                        <label>Cantidad</label>
                        <input
                          type="number"
                          min="1"
                          value={producto.cantidad}
                          onChange={(e) => actualizarCantidad(producto.codigo, e.target.value)}
                          className="input-cantidad"
                        />
                      </div>
                      <div className="detail-group">
                        <label>Precio Unitario</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={producto.precioCompra}
                          onChange={(e) => actualizarPrecioCompra(producto.codigo, e.target.value)}
                          className="input-precio"
                        />
                      </div>
                      <div className="detail-group">
                        <label>Subtotal</label>
                        <div className="subtotal">
                          S/ {(producto.cantidad * producto.precioCompra).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="resumen-info">
              <div className="info-row">
                <span>Proveedor:</span>
                <strong>
                  {proveedor ? proveedores.find(p => p.id == proveedor)?.nombre : '-'}
                </strong>
              </div>
              <div className="info-row">
                <span>Factura:</span>
                <strong>{numeroFactura || '-'}</strong>
              </div>
              <div className="info-row">
                <span>Fecha:</span>
                <strong>{fechaCompra}</strong>
              </div>
              <div className="info-row">
                <span>Productos:</span>
                <strong>{productos.length}</strong>
              </div>
              <div className="info-row">
                <span>Items Totales:</span>
                <strong>{productos.reduce((sum, p) => sum + p.cantidad, 0)}</strong>
              </div>
            </div>

            <div className="total-section">
              <span>Total:</span>
              <span className="total-amount">S/ {calcularTotal().toFixed(2)}</span>
            </div>

            <div className="acciones-buttons">
              <button className="btn-cancelar" onClick={limpiarFormulario}>
                Cancelar
              </button>
              <button
                className="btn-registrar"
                onClick={handleRegistrarCompra}
                disabled={productos.length === 0}
              >
                ✅ Registrar Compra
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación */}
      {mostrarConfirmacion && (
        <div className="modal-overlay" onClick={() => setMostrarConfirmacion(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚠️ Confirmar Registro de Compra</h2>
            </div>
            <div className="modal-body">
              <p>¿Estás seguro de registrar esta compra?</p>
              <div className="confirmacion-detalles">
                <div className="detalle-row">
                  <span>Sede:</span>
                  <strong>{sedes.find(s => s.id === sedeSeleccionada)?.nombre}</strong>
                </div>
                <div className="detalle-row">
                  <span>Proveedor:</span>
                  <strong>{proveedores.find(p => p.id == proveedor)?.nombre}</strong>
                </div>
                <div className="detalle-row">
                  <span>Factura:</span>
                  <strong>{numeroFactura}</strong>
                </div>
                <div className="detalle-row">
                  <span>Productos:</span>
                  <strong>{productos.length} items</strong>
                </div>
                <div className="detalle-row total-row">
                  <span>Total:</span>
                  <strong>S/ {calcularTotal().toFixed(2)}</strong>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-modal-cancelar"
                onClick={() => setMostrarConfirmacion(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-modal-confirmar"
                onClick={confirmarRegistro}
              >
                ✅ Confirmar Registro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Proveedor */}
      {modalNuevoProveedor && (
        <div className="modal-overlay" onClick={() => setModalNuevoProveedor(false)}>
          <div className="modal-content modal-proveedor" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Agregar Nuevo Proveedor</h2>
            </div>
            <div className="modal-body">
              <div className="form-proveedor-grid">
                <div className="form-group">
                  <label>RUC *</label>
                  <input
                    type="text"
                    placeholder="Ej: 20123456789"
                    maxLength="11"
                    value={nuevoProveedorData.ruc}
                    onChange={(e) => handleInputProveedorChange('ruc', e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Nombre Comercial *</label>
                  <input
                    type="text"
                    placeholder="Ej: Repuestos Honda Perú"
                    value={nuevoProveedorData.nombre}
                    onChange={(e) => handleInputProveedorChange('nombre', e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-group" style={{gridColumn: '1 / -1'}}>
                  <label>Razón Social</label>
                  <input
                    type="text"
                    placeholder="Ej: Distribuidora Automotriz SAC"
                    value={nuevoProveedorData.razonSocial}
                    onChange={(e) => handleInputProveedorChange('razonSocial', e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-group" style={{gridColumn: '1 / -1'}}>
                  <label>Dirección</label>
                  <input
                    type="text"
                    placeholder="Ej: Av. Industrial 123, Lima"
                    value={nuevoProveedorData.direccion}
                    onChange={(e) => handleInputProveedorChange('direccion', e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    placeholder="Ej: 987654321"
                    value={nuevoProveedorData.telefono}
                    onChange={(e) => handleInputProveedorChange('telefono', e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="Ej: ventas@proveedor.com"
                    value={nuevoProveedorData.email}
                    onChange={(e) => handleInputProveedorChange('email', e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-group" style={{gridColumn: '1 / -1'}}>
                  <label>Persona de Contacto</label>
                  <input
                    type="text"
                    placeholder="Ej: Juan Pérez"
                    value={nuevoProveedorData.contacto}
                    onChange={(e) => handleInputProveedorChange('contacto', e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="info-nota">
                <span className="icono-info">ℹ️</span>
                <p>Los campos marcados con * son obligatorios</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-modal-cancelar"
                onClick={() => {
                  setModalNuevoProveedor(false);
                  setNuevoProveedorData({
                    ruc: '',
                    nombre: '',
                    razonSocial: '',
                    direccion: '',
                    telefono: '',
                    email: '',
                    contacto: ''
                  });
                }}
              >
                Cancelar
              </button>
              <button
                className="btn-modal-confirmar"
                onClick={guardarNuevoProveedor}
              >
                ✅ Guardar Proveedor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprasRegistro;