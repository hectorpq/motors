import React, { useState, useRef, useEffect } from 'react';
import './ComprasRegistro.css';

function ComprasRegistro() {
  const [sedeSeleccionada, setSedeSeleccionada] = useState('todas');
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
  const [modalImportarLote, setModalImportarLote] = useState(false);
  const fileInputRef = useRef(null);
  const excelInputRef = useRef(null);

  const [proveedores, setProveedores] = useState([
    { id: 1, ruc: '20987654321', nombre: 'Repuestos Honda Perú SAC', telefono: '987654321', email: 'ventas@honda.pe' },
    { id: 2, ruc: '20123456789', nombre: 'Toyota Parts SAC', telefono: '912345678', email: 'contacto@toyota.pe' }
  ]);

  const [formProveedor, setFormProveedor] = useState({
    ruc: '', nombre: '', telefono: '', email: ''
  });

  const [formProducto, setFormProducto] = useState({
    codigo: '', nombre: '', categoria: 'Motor', subcategoria: 'Aceites',
    marca: 'Toyota', modelo: 'Corolla', precioCompra: '', precioVenta: '',
    stockMinimo: 5, ubicacion: ''
  });

  const sedes = [
    { id: 'todas', nombre: '🌐 Todas las Sedes', icono: '🌐' },
    { id: 'deybimotors', nombre: '🏢 Deybimotors', icono: '🏢' },
    { id: 'deybiparts', nombre: '🔧 Deybi Parts', icono: '🔧' },
    { id: 'debiauto', nombre: '🚗 Deybi Auto', icono: '🚗' }
  ];

  const categorias = ['Motor', 'Transmisión', 'Frenos', 'Suspensión', 'Eléctrico'];
  const marcas = ['Toyota', 'Honda', 'Nissan', 'Mazda', 'Hyundai'];

  useEffect(() => {
    // Productos de ejemplo
    const productosEjemplo = [
      { id: 1, codigo: 'DM-001', nombre: 'Aceite Motor 5W-30', categoria: 'Motor', marca: 'Toyota', precioCompra: 50.00, stock: 25 },
      { id: 2, codigo: 'DP-015', nombre: 'Filtro de Aceite', categoria: 'Motor', marca: 'Honda', precioCompra: 30.00, stock: 40 },
      { id: 3, codigo: 'DA-023', nombre: 'Pastillas de Freno', categoria: 'Frenos', marca: 'Nissan', precioCompra: 120.00, stock: 15 }
    ];
    setProductos(productosEjemplo);
  }, []);

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

  const agregarProveedor = () => {
    if (!formProveedor.ruc || !formProveedor.nombre) {
      alert('Completa los campos obligatorios (RUC y Nombre)');
      return;
    }

    const nuevoProveedor = {
      id: proveedores.length + 1,
      ...formProveedor
    };

    setProveedores([...proveedores, nuevoProveedor]);
    setProveedorSeleccionado(nuevoProveedor.id.toString());
    setModalProveedor(false);
    setFormProveedor({ ruc: '', nombre: '', telefono: '', email: '' });
    alert('Proveedor registrado y seleccionado correctamente');
  };

  const agregarProducto = () => {
    if (!formProducto.codigo || !formProducto.nombre || !formProducto.precioCompra || !formProducto.precioVenta) {
      alert('Completa todos los campos obligatorios');
      return;
    }

    const nuevoProducto = {
      id: productos.length + 1,
      ...formProducto,
      precioCompra: parseFloat(formProducto.precioCompra),
      precioVenta: parseFloat(formProducto.precioVenta),
      stock: 0
    };

    setProductos([...productos, nuevoProducto]);
    
    // Agregar automáticamente a la compra
    setProductosCompra([...productosCompra, {
      ...nuevoProducto,
      cantidad: 1,
      subtotal: parseFloat(formProducto.precioCompra)
    }]);

    setModalProducto(false);
    setFormProducto({
      codigo: '', nombre: '', categoria: 'Motor', subcategoria: 'Aceites',
      marca: 'Toyota', modelo: 'Corolla', precioCompra: '', precioVenta: '',
      stockMinimo: 5, ubicacion: ''
    });
    alert('Producto creado y añadido a la compra');
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
      subtotal: producto.precioCompra
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

  const handleImportarExcel = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    // Simulación de importación de Excel
    alert('Importando productos desde Excel...\n\nFormato esperado:\nCódigo | Nombre | Categoría | Marca | Precio Compra | Cantidad');
    
    // Aquí iría la lógica real de importación con bibliotecas como xlsx o papaparse
    // Por ahora, agregamos productos de ejemplo
    const productosImportados = [
      { id: Date.now() + 1, codigo: 'IMP-001', nombre: 'Producto Importado 1', categoria: 'Motor', marca: 'Toyota', precioCompra: 100, cantidad: 10 },
      { id: Date.now() + 2, codigo: 'IMP-002', nombre: 'Producto Importado 2', categoria: 'Frenos', marca: 'Honda', precioCompra: 150, cantidad: 5 }
    ];

    const nuevosProductos = productosImportados.map(p => ({
      ...p,
      subtotal: p.cantidad * p.precioCompra
    }));

    setProductosCompra([...productosCompra, ...nuevosProductos]);
    setModalImportarLote(false);
    alert(`${productosImportados.length} productos importados correctamente`);
  };

  const exportarPlantillaExcel = () => {
    // Aquí iría la lógica para generar un Excel vacío con el formato correcto
    alert('Descargando plantilla Excel...\n\nColumnas:\n- Código\n- Nombre\n- Categoría\n- Marca\n- Precio Compra\n- Cantidad');
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
    if (sedeSeleccionada === 'todas') {
      alert('Selecciona una sede específica');
      return;
    }

    setModalConfirmacion(true);
  };

  const confirmarRegistro = () => {
    const compra = {
      id: Date.now(),
      proveedor: proveedores.find(p => p.id === parseInt(proveedorSeleccionado)),
      sede: sedeSeleccionada,
      numeroFactura,
      fechaCompra,
      archivoFactura: archivoFactura?.name || null,
      productos: productosCompra,
      total: calcularTotal(),
      estado: 'Registrada'
    };

    console.log('Compra registrada:', compra);
    alert('✅ Compra registrada correctamente\n\nNota: El stock NO se actualiza hasta que la compra esté "Completada"');
    
    // Limpiar formulario
    limpiarFormulario();
    setModalConfirmacion(false);
  };

  const limpiarFormulario = () => {
    setProveedorSeleccionado('');
    setNumeroFactura('');
    setFechaCompra(new Date().toISOString().split('T')[0]);
    setArchivoFactura(null);
    setProductosCompra([]);
    setSedeSeleccionada('todas');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const calcularTotal = () => {
    return productosCompra.reduce((sum, p) => sum + p.subtotal, 0);
  };

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="compras-registro-container">
      {/* Header */}
      <div className="registro-header">
        <div className="header-info">
          <h1>📦 Registro de Compras</h1>
          <p>Registra nuevas compras de productos</p>
        </div>
        <button className="btn-limpiar" onClick={limpiarFormulario}>
          🔄 Limpiar Formulario
        </button>
      </div>

      {/* Selector de Sedes */}
      <div className="sedes-selector-grande">
        {sedes.map(sede => (
          <button
            key={sede.id}
            className={`sede-btn ${sedeSeleccionada === sede.id ? 'activo' : ''}`}
            onClick={() => setSedeSeleccionada(sede.id)}
          >
            <span className="sede-icono">{sede.icono}</span>
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
                className="btn-secondary-small"
                onClick={() => setModalImportarLote(true)}
              >
                📊 Importar Lote
              </button>
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
            {productosFiltrados.map(producto => (
              <div key={producto.id} className="producto-card-compra">
                <div className="producto-info-compra">
                  <span className="producto-codigo">{producto.codigo}</span>
                  <h4>{producto.nombre}</h4>
                  <div className="producto-detalles">
                    <span className="badge">{producto.categoria}</span>
                    <span className="badge">{producto.marca}</span>
                    <span className="precio">S/ {producto.precioCompra.toFixed(2)}</span>
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
                          <strong>{producto.nombre}</strong>
                          <br />
                          <small>{producto.categoria} - {producto.marca}</small>
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
                <strong>📌 Nota Importante:</strong> El stock de los productos NO se actualizará hasta que cambies el estado de la compra a "Completada" desde el módulo de Facturas.
              </div>

              <button className="btn-registrar-compra" onClick={registrarCompra}>
                💾 Registrar Compra
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
                ℹ️ La compra se registrará con estado "Registrada". El stock no se actualizará hasta cambiar a "Completada".
              </div>
            </div>
            <div className="modal-footer-confirm">
              <button className="btn-cancelar" onClick={() => setModalConfirmacion(false)}>
                Cancelar
              </button>
              <button className="btn-confirmar" onClick={confirmarRegistro}>
                ✅ Confirmar Registro
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
                <label>Razón Social / Nombre *</label>
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
                    value={formProducto.categoria}
                    onChange={e => setFormProducto({...formProducto, categoria: e.target.value})}
                  >
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Marca *</label>
                  <select
                    value={formProducto.marca}
                    onChange={e => setFormProducto({...formProducto, marca: e.target.value})}
                  >
                    {marcas.map(marca => (
                      <option key={marca} value={marca}>{marca}</option>
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
                <div className="form-group">
                  <label>Ubicación</label>
                  <input
                    type="text"
                    value={formProducto.ubicacion}
                    onChange={e => setFormProducto({...formProducto, ubicacion: e.target.value})}
                    placeholder="A-12-3"
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

      {/* Modal Importar Lote */}
      {modalImportarLote && (
        <div className="modal-overlay" onClick={() => setModalImportarLote(false)}>
          <div className="modal-admin" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📊 Importar Lote de Productos</h3>
              <button className="btn-cerrar" onClick={() => setModalImportarLote(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="import-info">
                <h4>Instrucciones:</h4>
                <ol>
                  <li>Descarga la plantilla Excel con el formato correcto</li>
                  <li>Completa los datos de los productos (Código, Nombre, Categoría, Marca, Precio, Cantidad)</li>
                  <li>Sube el archivo completado</li>
                </ol>
              </div>

              <button className="btn-download-template" onClick={exportarPlantillaExcel}>
                📥 Descargar Plantilla Excel
              </button>

              <div className="divider">O</div>

              <div className="file-upload-area-excel">
                <input
                  type="file"
                  ref={excelInputRef}
                  onChange={handleImportarExcel}
                  accept=".xlsx,.xls"
                  className="input-file"
                  id="archivo-excel"
                />
                <label htmlFor="archivo-excel" className="file-label-excel">
                  📂 Seleccionar archivo Excel
                </label>
              </div>

              <div className="alert-info">
                ⚠️ Asegúrate de que el archivo tenga el formato correcto para evitar errores en la importación.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalImportarLote(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComprasRegistro;