import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getProveedoresActivos,
  createProveedor,
  getProductos,
  createProducto,
  createCompra,
  subirFacturaCompra,
  getSedesActivas,
  getCategorias,
  getMarcas
} from '../services/api';
import './ComprasRegistro.css';

function ComprasRegistro() {
  const navigate = useNavigate();
  const [sedeSeleccionada, setSedeSeleccionada] = useState('');
  const [sedes, setSedes] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState('');
  const [numeroFactura, setNumeroFactura] = useState('');
  const [fechaCompra, setFechaCompra] = useState(new Date().toISOString().split('T')[0]);
  const [archivoFactura, setArchivoFactura] = useState(null);
  const [productos, setProductos] = useState([]);
  const [productosCompra, setProductosCompra] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [modalConfirmacion, setModalConfirmacion] = useState(false);
  const [modalProveedor, setModalProveedor] = useState(false);
  const [modalProducto, setModalProducto] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [formProveedor, setFormProveedor] = useState({
    ruc: '', nombre: '', telefono: '', email: '', direccion: ''
  });

  const [formProducto, setFormProducto] = useState({
    codigo: '', nombre: '', categoriaId: '', subcategoriaId: '',
    marcaId: '', descripcion: '', precioCompra: '', precioVenta: '',
    stockMinimo: 5
  });

  useEffect(() => {
    cargarDatosIniciales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      
      const [sedesRes, provRes, prodRes, catRes, marcasRes] = await Promise.all([
        getSedesActivas(),
        getProveedoresActivos(),
        getProductos(),
        getCategorias(),
        getMarcas()
      ]);
      
      setSedes(sedesRes.data || []);
      setProveedores(provRes.data || []);
      setProductos(prodRes.data || []);
      setCategorias(catRes.data || []);
      setMarcas(marcasRes.data || []);
      
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
      alert('Error al cargar datos del sistema');
    } finally {
      setLoading(false);
    }
  };

  const handleArchivoFactura = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      if (archivo.size > 5 * 1024 * 1024) {
        alert('El archivo no debe superar los 5MB');
        return;
      }
      setArchivoFactura(archivo);
    }
  };

  // ✅ FUNCIÓN CORREGIDA - agregarProveedor
  const agregarProveedor = async () => {
    if (!formProveedor.ruc || !formProveedor.nombre) {
      alert('Completa los campos obligatorios (RUC y Nombre)');
      return;
    }

    try {
      const nuevoProveedor = await createProveedor({
        nombreEmpresa: formProveedor.nombre,  // ✅ CAMBIADO: nombre → nombreEmpresa
        ruc: formProveedor.ruc,
        contacto: null,                       // ✅ AGREGADO
        telefono: formProveedor.telefono || null,
        email: formProveedor.email || null,
        direccion: formProveedor.direccion || null,
        observaciones: null,                  // ✅ AGREGADO
        activo: true
      });

      setProveedores([...proveedores, nuevoProveedor.data]);
      setProveedorSeleccionado(nuevoProveedor.data.id.toString());
      setModalProveedor(false);
      setFormProveedor({ ruc: '', nombre: '', telefono: '', email: '', direccion: '' });
      alert('✅ Proveedor registrado y seleccionado correctamente');
    } catch (error) {
      console.error('Error al crear proveedor:', error);
      console.error('Detalles:', error.response?.data);
      alert('❌ Error al registrar el proveedor: ' + (error.response?.data?.message || error.message));
    }
  };
  // 🔧 FIX: Función agregarProducto corregida con todos los campos obligatorios
  const agregarProducto = async () => {
    if (!formProducto.codigo || !formProducto.nombre || !formProducto.categoriaId || 
        !formProducto.marcaId || !formProducto.precioVenta) {
      alert('Completa todos los campos obligatorios');
      return;
    }

    // ✅ Validar que haya una sede seleccionada
    if (!sedeSeleccionada) {
      alert('⚠️ Primero debes seleccionar una sede antes de crear productos');
      return;
    }

    try {
      const nuevoProducto = await createProducto({
        codigo: formProducto.codigo,
        nombre: formProducto.nombre,  // ✅ Campo obligatorio
        descripcion: formProducto.descripcion || null,
        categoriaId: parseInt(formProducto.categoriaId),
        subcategoriaId: formProducto.subcategoriaId ? parseInt(formProducto.subcategoriaId) : null,
        marcaId: parseInt(formProducto.marcaId),
        sedeId: parseInt(sedeSeleccionada),  // ✅ Campo obligatorio - usa la sede seleccionada
        precioVenta: parseFloat(formProducto.precioVenta),
        precioCosto: formProducto.precioCompra ? parseFloat(formProducto.precioCompra) : null,
        publicoCatalogo: false
      });

      const productoCreado = nuevoProducto.data;
      setProductos([...productos, productoCreado]);
      
      setProductosCompra([...productosCompra, {
        ...productoCreado,
        cantidad: 1,
        precioCompra: parseFloat(formProducto.precioCompra) || productoCreado.precioCosto || 0,
        subtotal: parseFloat(formProducto.precioCompra) || productoCreado.precioCosto || 0
      }]);

      setModalProducto(false);
      setFormProducto({
        codigo: '', nombre: '', categoriaId: '', subcategoriaId: '',
        marcaId: '', descripcion: '', precioCompra: '', precioVenta: '',
        stockMinimo: 5
      });
      alert('✅ Producto creado y añadido a la compra');
    } catch (error) {
      console.error('Error al crear producto:', error);
      const errorMsg = error.response?.data?.message || error.message;
      alert('❌ Error al registrar el producto: ' + errorMsg);
    }
  };

  const agregarProductoCompra = (producto) => {
    const existe = productosCompra.find(p => p.id === producto.id);
    if (existe) {
      alert('Este producto ya está en la lista');
      return;
    }

    setProductosCompra([...productosCompra, {
      ...producto,
      cantidad: 1,
      precioCompra: producto.precioCosto || producto.precioVenta || 0,
      subtotal: producto.precioCosto || producto.precioVenta || 0
    }]);
  };

  const actualizarCantidad = (id, cantidad) => {
    const cant = parseInt(cantidad) || 0;
    setProductosCompra(productosCompra.map(p => 
      p.id === id 
        ? { ...p, cantidad: cant, subtotal: cant * p.precioCompra }
        : p
    ));
  };

  const actualizarPrecio = (id, precio) => {
    const prec = parseFloat(precio) || 0;
    setProductosCompra(productosCompra.map(p => 
      p.id === id 
        ? { ...p, precioCompra: prec, subtotal: p.cantidad * prec }
        : p
    ));
  };

  const eliminarProductoCompra = (id) => {
    setProductosCompra(productosCompra.filter(p => p.id !== id));
  };

  const registrarCompra = () => {
    if (!proveedorSeleccionado) {
      alert('Selecciona un proveedor');
      return;
    }
    if (!numeroFactura) {
      alert('Ingresa el número de factura');
      return;
    }
    if (productosCompra.length === 0) {
      alert('Agrega al menos un producto');
      return;
    }
    if (!sedeSeleccionada) {
      alert('Selecciona una sede');
      return;
    }

    setModalConfirmacion(true);
  };

  // ✅ FUNCIÓN CORREGIDA - Compatible con CrearCompraRequest del backend
  const confirmarRegistro = async () => {
    try {
      setLoading(true);

      // ✅ Construir el request según CrearCompraRequest del backend
      const compraData = {
        proveedorId: parseInt(proveedorSeleccionado),
        sedeId: parseInt(sedeSeleccionada),
        observaciones: `Factura: ${numeroFactura} | Fecha: ${fechaCompra}`, // ✅ Guardamos info de factura aquí
        detalles: productosCompra.map(p => ({  // ✅ CAMBIADO: "items" → "detalles"
          productoId: parseInt(p.id),
          cantidad: parseInt(p.cantidad),
          precioUnitario: parseFloat(p.precioCompra),  // ✅ CAMBIADO: "precioCompra" → "precioUnitario"
          observaciones: null
        }))
      };

      console.log('📦 Enviando compra:', compraData);

      // ✅ Crear la compra
      const response = await createCompra(compraData);
      const compraCreada = response.data;

      console.log('✅ Compra creada con ID:', compraCreada.id);

      // ✅ Subir factura si existe
      if (archivoFactura) {
        try {
          await subirFacturaCompra(compraCreada.id, archivoFactura);
          console.log('✅ Factura subida correctamente');
        } catch (error) {
          console.error('Error al subir factura:', error);
          alert('⚠️ Compra registrada pero hubo un error al subir el archivo de factura');
        }
      }

      alert('✅ Compra registrada correctamente con ID: ' + compraCreada.id + '\n\n📌 La compra está en estado "PENDIENTE". El stock se actualizará cuando cambies el estado a "RECIBIDA".');
      
      limpiarFormulario();
      setModalConfirmacion(false);

      navigate('/compras/facturas');
    } catch (error) {
      console.error('❌ Error completo:', error);
      console.error('📄 Detalles del error:', error.response?.data);
      
      const errorMsg = error.response?.data?.message 
                    || error.response?.data?.error
                    || error.message 
                    || 'Error desconocido';
      
      alert('❌ Error al registrar la compra: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const limpiarFormulario = () => {
    setProveedorSeleccionado('');
    setNumeroFactura('');
    setFechaCompra(new Date().toISOString().split('T')[0]);
    setArchivoFactura(null);
    setProductosCompra([]);
    setSedeSeleccionada('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const calcularTotal = () => {
    return productosCompra.reduce((sum, p) => sum + p.subtotal, 0);
  };

  // 🔧 FIX: Protección contra undefined en el filtro
  const productosFiltrados = productos.filter(p => {
    const nombreProducto = (p.nombre || '').toLowerCase();
    const codigoProducto = (p.codigo || '').toLowerCase();
    const busquedaLower = (busqueda || '').toLowerCase();
    
    return nombreProducto.includes(busquedaLower) || 
           codigoProducto.includes(busquedaLower);
  });

  if (loading && productos.length === 0) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="compras-registro-container">
      {/* Header */}
      <div className="registro-header">
        <div className="header-info">
          <h1>📦 Registro de Compras</h1>
          <p>Registra nuevas compras de productos</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-limpiar" onClick={limpiarFormulario}>
            🔄 Limpiar Formulario
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => navigate('/compras')}
          >
            ← Volver
          </button>
        </div>
      </div>

      {/* Selector de Sedes */}
      <div className="sedes-selector-grande">
        {sedes.map(sede => (
          <button
            key={sede.id}
            className={`sede-btn ${sedeSeleccionada === sede.id ? 'activo' : ''}`}
            onClick={() => setSedeSeleccionada(sede.id)}
          >
            <span className="sede-icono">🏢</span>
            <span className="sede-nombre">{sede.nombre}</span>
            {sedeSeleccionada === sede.id && <span className="check">✓</span>}
          </button>
        ))}
      </div>

      {/* Formulario Principal */}
      <div className="formulario-compra">
        <div className="form-section">
          <h3>📋 Información de la Compra</h3>
          
          <div className="form-grid-compra">
            <div className="form-group-compra">
              <label>Proveedor *</label>
              <div className="input-con-boton">
                <select
                  value={proveedorSeleccionado}
                  onChange={(e) => setProveedorSeleccionado(e.target.value)}
                  className="select-compra"
                >
                  <option value="">Seleccionar proveedor...</option>
                  {proveedores.map(prov => (
                    <option key={prov.id} value={prov.id}>
                      {prov.ruc} - {prov.nombre}
                    </option>
                  ))}
                </select>
                <button 
                  className="btn-agregar-inline"
                  onClick={() => setModalProveedor(true)}
                  title="Agregar nuevo proveedor"
                >
                  ➕
                </button>
              </div>
            </div>

            <div className="form-group-compra">
              <label>Número de Factura *</label>
              <input
                type="text"
                value={numeroFactura}
                onChange={(e) => setNumeroFactura(e.target.value)}
                placeholder="F001-00001"
                className="input-compra"
              />
            </div>

            <div className="form-group-compra">
              <label>Fecha de Compra *</label>
              <input
                type="date"
                value={fechaCompra}
                onChange={(e) => setFechaCompra(e.target.value)}
                className="input-compra"
              />
            </div>

            <div className="form-group-compra">
              <label>Archivo Factura (PDF, IMG) - Max 5MB</label>
              <div className="file-upload-area">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleArchivoFactura}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="input-file"
                  id="archivo-factura"
                />
                <label htmlFor="archivo-factura" className="file-label">
                  {archivoFactura ? (
                    <>📎 {archivoFactura.name}</>
                  ) : (
                    <>📁 Seleccionar archivo</>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Búsqueda y agregado de productos */}
        <div className="form-section">
          <div className="section-header">
            <h3>🔍 Buscar y Agregar Productos</h3>
            <div className="section-actions">
              <button 
                className="btn-primary-small"
                onClick={() => setModalProducto(true)}
              >
                ➕ Nuevo Producto
              </button>
            </div>
          </div>

          <input
            type="text"
            placeholder="🔍 Buscar por código o nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-busqueda-productos"
          />

          <div className="productos-disponibles">
            {productosFiltrados.slice(0, 10).map(producto => (
              <div key={producto.id} className="producto-card-compra">
                <div className="producto-info-compra">
                  <span className="producto-codigo">{producto.codigo}</span>
                  <h4>{producto.nombre || producto.descripcion}</h4>
                  <div className="producto-detalles">
                    <span className="badge">{producto.categoriaNombre || 'Sin categoría'}</span>
                    <span className="badge">{producto.marcaNombre || 'Sin marca'}</span>
                    <span className="precio">S/ {producto.precioVenta?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
                <button
                  className="btn-agregar-producto"
                  onClick={() => agregarProductoCompra(producto)}
                >
                  ➕ Agregar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen de Compra */}
        <div className="form-section resumen-section">
          <h3>📝 Resumen de la Compra</h3>
          
          {productosCompra.length === 0 ? (
            <div className="empty-compra">
              <span className="empty-icon">📦</span>
              <p>No hay productos agregados</p>
              <small>Busca y agrega productos a la compra</small>
            </div>
          ) : (
            <>
              <div className="tabla-compra-container">
                <table className="tabla-compra">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Producto</th>
                      <th>Precio Compra</th>
                      <th>Cantidad</th>
                      <th>Subtotal</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosCompra.map(producto => (
                      <tr key={producto.id}>
                        <td>{producto.codigo}</td>
                        <td>
                          <strong>{producto.nombre || producto.descripcion}</strong>
                          <br />
                          <small>{producto.categoriaNombre || ''} - {producto.marcaNombre || ''}</small>
                        </td>
                        <td>
                          <input
                            type="number"
                            value={producto.precioCompra}
                            onChange={(e) => actualizarPrecio(producto.id, e.target.value)}
                            className="input-precio-tabla"
                            step="0.01"
                            min="0"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={producto.cantidad}
                            onChange={(e) => actualizarCantidad(producto.id, e.target.value)}
                            className="input-cantidad-tabla"
                            min="1"
                          />
                        </td>
                        <td>
                          <strong>S/ {producto.subtotal.toFixed(2)}</strong>
                        </td>
                        <td>
                          <button
                            className="btn-eliminar-tabla"
                            onClick={() => eliminarProductoCompra(producto.id)}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="total-compra">
                <div className="total-info">
                  <span>Total de productos:</span>
                  <strong>{productosCompra.length}</strong>
                </div>
                <div className="total-info">
                  <span>Total unidades:</span>
                  <strong>{productosCompra.reduce((sum, p) => sum + p.cantidad, 0)}</strong>
                </div>
                <div className="total-info total-principal">
                  <span>TOTAL COMPRA:</span>
                  <strong>S/ {calcularTotal().toFixed(2)}</strong>
                </div>
              </div>

              <div className="nota-importante">
                <strong>📌 Nota Importante:</strong> El stock de los productos NO se actualizará hasta que cambies el estado de la compra a "RECIBIDA" desde el módulo de Facturas.
              </div>

              <button 
                className="btn-registrar-compra" 
                onClick={registrarCompra}
                disabled={loading}
              >
                {loading ? '⏳ Registrando...' : '💾 Registrar Compra'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Modal Confirmación */}
      {modalConfirmacion && (
        <div className="modal-overlay" onClick={() => setModalConfirmacion(false)}>
          <div className="modal-confirmacion" onClick={e => e.stopPropagation()}>
            <div className="modal-header-confirm">
              <h3>⚠️ Confirmar Registro de Compra</h3>
            </div>
            <div className="modal-body-confirm">
              <div className="resumen-confirmacion">
                <p><strong>Proveedor:</strong> {proveedores.find(p => p.id === parseInt(proveedorSeleccionado))?.nombre}</p>
                <p><strong>Factura:</strong> {numeroFactura}</p>
                <p><strong>Fecha:</strong> {fechaCompra}</p>
                <p><strong>Sede:</strong> {sedes.find(s => s.id === sedeSeleccionada)?.nombre}</p>
                <p><strong>Productos:</strong> {productosCompra.length}</p>
                <p><strong>Total:</strong> S/ {calcularTotal().toFixed(2)}</p>
                {archivoFactura && <p><strong>Archivo:</strong> {archivoFactura.name}</p>}
              </div>
              <div className="alert-info-modal">
                ℹ️ La compra se registrará con estado "PENDIENTE". El stock no se actualizará hasta cambiar a "RECIBIDA".
              </div>
            </div>
            <div className="modal-footer-confirm">
              <button className="btn-cancelar" onClick={() => setModalConfirmacion(false)}>
                Cancelar
              </button>
              <button 
                className="btn-confirmar" 
                onClick={confirmarRegistro}
                disabled={loading}
              >
                {loading ? '⏳ Registrando...' : '✅ Confirmar Registro'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Agregar Proveedor */}
      {modalProveedor && (
        <div className="modal-overlay" onClick={() => setModalProveedor(false)}>
          <div className="modal-admin" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Agregar Proveedor</h3>
              <button className="btn-cerrar" onClick={() => setModalProveedor(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>RUC *</label>
                <input
                  type="text"
                  value={formProveedor.ruc}
                  onChange={e => setFormProveedor({...formProveedor, ruc: e.target.value})}
                  placeholder="20987654321"
                  maxLength="11"
                />
              </div>
              <div className="form-group">
                <label>Nombre de la Empresa *</label> {/* ✅ CAMBIADO: "Razón Social / Nombre" → "Nombre de la Empresa" */}
                <input
                  type="text"
                  value={formProveedor.nombre}
                  onChange={e => setFormProveedor({...formProveedor, nombre: e.target.value})}
                  placeholder="Repuestos SAC"
                />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  value={formProveedor.telefono}
                  onChange={e => setFormProveedor({...formProveedor, telefono: e.target.value})}
                  placeholder="987654321"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formProveedor.email}
                  onChange={e => setFormProveedor({...formProveedor, email: e.target.value})}
                  placeholder="contacto@empresa.com"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalProveedor(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={agregarProveedor}>
                Guardar y Seleccionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Agregar Producto */}
      {modalProducto && (
        <div className="modal-overlay" onClick={() => setModalProducto(false)}>
          <div className="modal-admin modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Registrar Nuevo Producto</h3>
              <button className="btn-cerrar" onClick={() => setModalProducto(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Código *</label>
                  <input
                    type="text"
                    value={formProducto.codigo}
                    onChange={e => setFormProducto({...formProducto, codigo: e.target.value})}
                    placeholder="DM-001"
                  />
                </div>
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    value={formProducto.nombre}
                    onChange={e => setFormProducto({...formProducto, nombre: e.target.value})}
                    placeholder="Aceite Motor 5W-30"
                  />
                </div>
                <div className="form-group">
                  <label>Categoría *</label>
                  <select
                    value={formProducto.categoriaId}
                    onChange={e => setFormProducto({...formProducto, categoriaId: e.target.value})}
                  >
                    <option value="">Seleccionar...</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Marca *</label>
                  <select
                    value={formProducto.marcaId}
                    onChange={e => setFormProducto({...formProducto, marcaId: e.target.value})}
                  >
                    <option value="">Seleccionar...</option>
                    {marcas.map(marca => (
                      <option key={marca.id} value={marca.id}>{marca.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Precio de Compra *</label>
                  <input
                    type="number"
                    value={formProducto.precioCompra}
                    onChange={e => setFormProducto({...formProducto, precioCompra: e.target.value})}
                    placeholder="100.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Precio de Venta *</label>
                  <input
                    type="number"
                    value={formProducto.precioVenta}
                    onChange={e => setFormProducto({...formProducto, precioVenta: e.target.value})}
                    placeholder="150.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Stock Mínimo</label>
                  <input
                    type="number"
                    value={formProducto.stockMinimo}
                    onChange={e => setFormProducto({...formProducto, stockMinimo: e.target.value})}
                    placeholder="5"
                    min="0"
                  />
                </div>
                <div className="form-group form-group-full">
                  <label>Descripción</label>
                  <textarea
                    value={formProducto.descripcion}
                    onChange={e => setFormProducto({...formProducto, descripcion: e.target.value})}
                    placeholder="Descripción detallada del producto"
                    rows="3"
                  />
                </div>
              </div>
              <div className="alert-info">
                ℹ️ El producto se creará sin stock inicial. El stock se agregará automáticamente cuando esta compra sea completada.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalProducto(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={agregarProducto}>
                Crear y Agregar a Compra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComprasRegistro;