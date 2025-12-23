import React, { useState, useEffect } from 'react';
import './Etiquetas.css';

function Etiquetas() {
  const [productos, setProductos] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    categoria: '',
    subcategoria: '',
    sede: ''
  });
  const [categorias] = useState([
    'Motor', 'Transmisión', 'Frenos', 'Suspensión', 'Eléctrico'
  ]);
  const [subcategorias] = useState({
    'Motor': ['Aceites', 'Filtros', 'Bujías'],
    'Transmisión': ['Embragues', 'Cajas', 'Sincronizadores'],
    'Frenos': ['Pastillas', 'Discos', 'Líquidos'],
    'Suspensión': ['Amortiguadores', 'Resortes', 'Brazos'],
    'Eléctrico': ['Baterías', 'Alternadores', 'Arrancadores']
  });
  const [sedes] = useState([
    { id: 'todas', nombre: '🌐 Todas las Sedes' },
    { id: 'deybimotors', nombre: '🏢 Deybimotors' },
    { id: 'deybiparts', nombre: '🔧 Deybi Parts' },
    { id: 'debiauto', nombre: '🚗 Deybi Auto' }
  ]);
  
  const [productoDetalle, setProductoDetalle] = useState(null);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [busquedaVoz, setBusquedaVoz] = useState(false);
  const [busquedaCamara, setBusquedaCamara] = useState(false);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = () => {
    // Simulación de productos
    const productosEjemplo = [
      {
        id: 1,
        codigo: 'DM-001',
        nombre: 'Aceite Motor 5W-30',
        categoria: 'Motor',
        subcategoria: 'Aceites',
        marca: 'Castrol',
        modelo: 'Corolla 2020',
        precio: 50.00,
        stock: 25,
        sede: 'deybimotors',
        descripcion: 'Aceite sintético de alta calidad para motores modernos',
        ubicacion: 'A-12-3'
      },
      {
        id: 2,
        codigo: 'DP-015',
        nombre: 'Filtro de Aceite',
        categoria: 'Motor',
        subcategoria: 'Filtros',
        marca: 'Toyota',
        modelo: 'Hilux 2019',
        precio: 30.00,
        stock: 40,
        sede: 'deybiparts',
        descripcion: 'Filtro original para motor diesel',
        ubicacion: 'B-08-1'
      },
      {
        id: 3,
        codigo: 'DA-023',
        nombre: 'Pastillas de Freno Delanteras',
        categoria: 'Frenos',
        subcategoria: 'Pastillas',
        marca: 'Honda',
        modelo: 'Civic 2021',
        precio: 120.00,
        stock: 15,
        sede: 'debiauto',
        descripcion: 'Pastillas cerámicas de alto rendimiento',
        ubicacion: 'C-15-2'
      },
      {
        id: 4,
        codigo: 'DM-045',
        nombre: 'Bujía Iridium',
        categoria: 'Motor',
        subcategoria: 'Bujías',
        marca: 'Nissan',
        modelo: 'Sentra 2018',
        precio: 45.00,
        stock: 60,
        sede: 'deybimotors',
        descripcion: 'Bujía de larga duración con punta de iridio',
        ubicacion: 'A-05-4'
      },
      {
        id: 5,
        codigo: 'DP-067',
        nombre: 'Amortiguador Delantero',
        categoria: 'Suspensión',
        subcategoria: 'Amortiguadores',
        marca: 'Toyota',
        modelo: 'RAV4 2022',
        precio: 280.00,
        stock: 8,
        sede: 'deybiparts',
        descripcion: 'Amortiguador de gas con válvula progresiva',
        ubicacion: 'D-20-1'
      }
    ];
    setProductos(productosEjemplo);
  };

  const productosFiltrados = productos.filter(producto => {
    const cumpleBusqueda = producto.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
                          producto.codigo.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
                          producto.marca.toLowerCase().includes(filtros.busqueda.toLowerCase());
    const cumpleCategoria = !filtros.categoria || producto.categoria === filtros.categoria;
    const cumpleSubcategoria = !filtros.subcategoria || producto.subcategoria === filtros.subcategoria;
    const cumpleSede = !filtros.sede || filtros.sede === 'todas' || producto.sede === filtros.sede;
    
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
    setProductosSeleccionados(prev =>
      prev.map(p => p.id === productoId ? { ...p, cantidadEtiquetas: parseInt(cantidad) || 1 } : p)
    );
  };

  const verDetalle = (producto) => {
    setProductoDetalle(producto);
    setModalDetalle(true);
  };

  const iniciarBusquedaVoz = () => {
    setBusquedaVoz(true);
    // Simular reconocimiento de voz
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = false;
      
      recognition.onresult = (event) => {
        const texto = event.results[0][0].transcript;
        setFiltros(prev => ({ ...prev, busqueda: texto }));
        setBusquedaVoz(false);
      };
      
      recognition.onerror = () => {
        setBusquedaVoz(false);
        alert('Error en el reconocimiento de voz');
      };
      
      recognition.start();
    } else {
      alert('Tu navegador no soporta reconocimiento de voz');
      setBusquedaVoz(false);
    }
  };

  const iniciarBusquedaCamara = () => {
    setBusquedaCamara(true);
    // Aquí iría la lógica del escáner de código de barras
    alert('Función de escáner en desarrollo. Por ahora, busca manualmente.');
    setTimeout(() => setBusquedaCamara(false), 2000);
  };

  const generarPDF = () => {
    if (productosSeleccionados.length === 0) {
      alert('Selecciona al menos un producto para generar etiquetas');
      return;
    }

    alert(`Generando ${productosSeleccionados.reduce((sum, p) => sum + p.cantidadEtiquetas, 0)} etiquetas PDF con códigos de barras...`);
    
    // Aquí iría la lógica real de generación de PDF con biblioteca como jsPDF
    console.log('Productos seleccionados:', productosSeleccionados);
  };

  const totalEtiquetas = productosSeleccionados.reduce((sum, p) => sum + p.cantidadEtiquetas, 0);

  return (
    <div className="etiquetas-container">
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

      {/* Filtros Avanzados */}
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
            <button 
              className={`btn-voz ${busquedaVoz ? 'activo' : ''}`}
              onClick={iniciarBusquedaVoz}
              title="Búsqueda por voz"
            >
              {busquedaVoz ? '🎤 Escuchando...' : '🎤'}
            </button>
            <button 
              className={`btn-camara ${busquedaCamara ? 'activo' : ''}`}
              onClick={iniciarBusquedaCamara}
              title="Escanear código de barras"
            >
              {busquedaCamara ? '📷 Escaneando...' : '📷'}
            </button>
          </div>

          <select 
            value={filtros.sede}
            onChange={(e) => setFiltros({ ...filtros, sede: e.target.value })}
            className="select-filtro"
          >
            {sedes.map(sede => (
              <option key={sede.id} value={sede.id}>{sede.nombre}</option>
            ))}
          </select>

          <select 
            value={filtros.categoria}
            onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value, subcategoria: '' })}
            className="select-filtro"
          >
            <option value="">📦 Todas las Categorías</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {filtros.categoria && (
            <select 
              value={filtros.subcategoria}
              onChange={(e) => setFiltros({ ...filtros, subcategoria: e.target.value })}
              className="select-filtro"
            >
              <option value="">🔖 Todas las Subcategorías</option>
              {subcategorias[filtros.categoria]?.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          )}
        </div>

        <div className="filtros-info">
          <span>Mostrando {productosFiltrados.length} productos</span>
          {filtros.busqueda && <span className="badge">Búsqueda: "{filtros.busqueda}"</span>}
          {filtros.categoria && <span className="badge">{filtros.categoria}</span>}
          {filtros.subcategoria && <span className="badge">{filtros.subcategoria}</span>}
        </div>
      </div>

      <div className="etiquetas-content">
        {/* Lista de Productos */}
        <div className="productos-lista">
          <h3>📋 Listado de Productos</h3>
          <div className="productos-grid">
            {productosFiltrados.map(producto => {
              const seleccionado = productosSeleccionados.find(p => p.id === producto.id);
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
                    <span className="badge-categoria">{producto.categoria}</span>
                    <span className="badge-stock">Stock: {producto.stock}</span>
                    <span className="badge-precio">S/ {producto.precio.toFixed(2)}</span>
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
                
                <button className="btn-generar-pdf" onClick={generarPDF}>
                  📄 Generar PDF con Códigos de Barras
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
                  <span>{productoDetalle.categoria}</span>
                </div>
                <div className="detalle-item">
                  <label>Subcategoría:</label>
                  <span>{productoDetalle.subcategoria}</span>
                </div>
                <div className="detalle-item">
                  <label>Marca:</label>
                  <span>{productoDetalle.marca}</span>
                </div>
                <div className="detalle-item">
                  <label>Modelo:</label>
                  <span>{productoDetalle.modelo}</span>
                </div>
                <div className="detalle-item">
                  <label>Precio:</label>
                  <span className="precio">S/ {productoDetalle.precio.toFixed(2)}</span>
                </div>
                <div className="detalle-item">
                  <label>Stock:</label>
                  <span className="stock">{productoDetalle.stock} unidades</span>
                </div>
                <div className="detalle-item">
                  <label>Sede:</label>
                  <span>{sedes.find(s => s.id === productoDetalle.sede)?.nombre}</span>
                </div>
                <div className="detalle-item">
                  <label>Ubicación:</label>
                  <span>{productoDetalle.ubicacion}</span>
                </div>
                <div className="detalle-item full-width">
                  <label>Descripción:</label>
                  <p>{productoDetalle.descripcion}</p>
                </div>
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