import React, { useState, useEffect } from 'react';
import './Kardex.css';

const Kardex = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState('general'); // 'general' o 'producto'
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    tipoMovimiento: 'todos',
    sede: 'todas',
    usuario: 'todos'
  });
  const [busqueda, setBusqueda] = useState('');

  const sedes = [
    { id: 'todas', nombre: 'Todas las Sedes', icono: '🌐' },
    { id: 'deybimotors', nombre: 'Deybimotors', icono: '🏢' },
    { id: 'deybiparts', nombre: 'Deybi Parts', icono: '🔧' },
    { id: 'deybiauto', nombre: 'Deybi Auto', icono: '🚗' }
  ];

  const tiposMovimiento = [
    { id: 'entrada', nombre: 'Entrada', icono: '📥', color: '#27ae60' },
    { id: 'salida', nombre: 'Salida', icono: '📤', color: '#e74c3c' },
    { id: 'ajuste', nombre: 'Ajuste', icono: '⚙️', color: '#f39c12' }
  ];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      // Cargar movimientos
      const movResponse = await fetch('/api/kardex/movimientos');
      const movData = await movResponse.json();
      setMovimientos(movData);

      // Cargar productos
      const prodResponse = await fetch('/api/productos');
      const prodData = await prodResponse.json();
      setProductos(prodData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      // Datos de ejemplo
      setMovimientos([
        {
          id: 1,
          fecha: '2024-12-23 10:30:00',
          tipo: 'entrada',
          producto: 'Pastillas de Freno Delanteras',
          codigoProducto: 'DM-001',
          cantidad: 20,
          stockAntes: 45,
          stockDespues: 65,
          sede: 'deybimotors',
          usuario: 'Carlos Ramírez',
          documento: 'COMP-001',
          motivo: 'Compra a proveedor',
          precioUnitario: 85.00
        },
        {
          id: 2,
          fecha: '2024-12-23 11:15:00',
          tipo: 'salida',
          producto: 'Filtro de Aceite',
          codigoProducto: 'DP-002',
          cantidad: 5,
          stockAntes: 8,
          stockDespues: 3,
          sede: 'deybiparts',
          usuario: 'María García',
          documento: 'VENTA-102',
          motivo: 'Venta a cliente',
          precioUnitario: 35.00
        },
        {
          id: 3,
          fecha: '2024-12-23 14:45:00',
          tipo: 'ajuste',
          producto: 'Amortiguador Trasero',
          codigoProducto: 'DA-003',
          cantidad: -2,
          stockAntes: 10,
          stockDespues: 8,
          sede: 'deybiauto',
          usuario: 'Jorge López',
          documento: 'AJUSTE-005',
          motivo: 'Productos dañados',
          precioUnitario: 280.00
        },
        {
          id: 4,
          fecha: '2024-12-22 09:20:00',
          tipo: 'entrada',
          producto: 'Batería 12V 60Ah',
          codigoProducto: 'DP-005',
          cantidad: 10,
          stockAntes: 15,
          stockDespues: 25,
          sede: 'deybiparts',
          usuario: 'Ana Torres',
          documento: 'COMP-002',
          motivo: 'Compra a proveedor',
          precioUnitario: 320.00
        },
        {
          id: 5,
          fecha: '2024-12-22 16:30:00',
          tipo: 'salida',
          producto: 'Kit de Distribución',
          codigoProducto: 'DA-006',
          cantidad: 3,
          stockAntes: 6,
          stockDespues: 3,
          sede: 'deybiauto',
          usuario: 'María García',
          documento: 'VENTA-103',
          motivo: 'Venta a cliente',
          precioUnitario: 420.00
        },
        {
          id: 6,
          fecha: '2024-12-21 13:10:00',
          tipo: 'ajuste',
          producto: 'Pastillas de Freno Delanteras',
          codigoProducto: 'DM-001',
          cantidad: 5,
          stockAntes: 40,
          stockDespues: 45,
          sede: 'deybimotors',
          usuario: 'Carlos Ramírez',
          documento: 'AJUSTE-006',
          motivo: 'Corrección de inventario',
          precioUnitario: 85.00
        }
      ]);

      setProductos([
        { id: 1, codigo: 'DM-001', nombre: 'Pastillas de Freno Delanteras' },
        { id: 2, codigo: 'DP-002', nombre: 'Filtro de Aceite' },
        { id: 3, codigo: 'DA-003', nombre: 'Amortiguador Trasero' },
        { id: 4, codigo: 'DP-005', nombre: 'Batería 12V 60Ah' },
        { id: 5, codigo: 'DA-006', nombre: 'Kit de Distribución' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const movimientosFiltrados = movimientos.filter(mov => {
    // Filtro de vista
    if (vista === 'producto' && productoSeleccionado) {
      if (mov.codigoProducto !== productoSeleccionado) return false;
    }

    // Filtro de fecha
    if (filtros.fechaInicio) {
      const fechaMov = new Date(mov.fecha);
      const fechaIni = new Date(filtros.fechaInicio);
      if (fechaMov < fechaIni) return false;
    }
    if (filtros.fechaFin) {
      const fechaMov = new Date(mov.fecha);
      const fechaFin = new Date(filtros.fechaFin);
      fechaFin.setHours(23, 59, 59);
      if (fechaMov > fechaFin) return false;
    }

    // Filtro de tipo
    if (filtros.tipoMovimiento !== 'todos' && mov.tipo !== filtros.tipoMovimiento) {
      return false;
    }

    // Filtro de sede
    if (filtros.sede !== 'todas' && mov.sede !== filtros.sede) {
      return false;
    }

    // Búsqueda
    if (busqueda) {
      const searchLower = busqueda.toLowerCase();
      return (
        mov.producto.toLowerCase().includes(searchLower) ||
        mov.codigoProducto.toLowerCase().includes(searchLower) ||
        mov.documento.toLowerCase().includes(searchLower) ||
        mov.usuario.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const calcularEstadisticas = () => {
    const entradas = movimientosFiltrados.filter(m => m.tipo === 'entrada');
    const salidas = movimientosFiltrados.filter(m => m.tipo === 'salida');
    const ajustes = movimientosFiltrados.filter(m => m.tipo === 'ajuste');

    const totalEntradas = entradas.reduce((sum, m) => sum + m.cantidad, 0);
    const totalSalidas = salidas.reduce((sum, m) => sum + Math.abs(m.cantidad), 0);
    const totalAjustes = ajustes.length;

    const valorEntradas = entradas.reduce((sum, m) => sum + (m.cantidad * m.precioUnitario), 0);
    const valorSalidas = salidas.reduce((sum, m) => sum + (Math.abs(m.cantidad) * m.precioUnitario), 0);

    return {
      totalMovimientos: movimientosFiltrados.length,
      totalEntradas,
      totalSalidas,
      totalAjustes,
      valorEntradas,
      valorSalidas
    };
  };

  const stats = calcularEstadisticas();

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(valor);
  };

  const getTipoInfo = (tipo) => {
    return tiposMovimiento.find(t => t.id === tipo);
  };

  const exportarExcel = () => {
    alert(`📊 Exportando ${movimientosFiltrados.length} movimientos a Excel...`);
    // Aquí implementarías la lógica real de exportación
  };

  const exportarPDF = () => {
    alert(`📄 Generando PDF con ${movimientosFiltrados.length} movimientos...`);
    // Aquí implementarías la lógica real de exportación
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaInicio: '',
      fechaFin: '',
      tipoMovimiento: 'todos',
      sede: 'todas',
      usuario: 'todos'
    });
    setBusqueda('');
    setProductoSeleccionado('');
  };

  if (loading) {
    return (
      <div className="kardex-loading">
        <div className="spinner"></div>
        <p>Cargando movimientos...</p>
      </div>
    );
  }

  return (
    <div className="kardex-container">
      {/* Header */}
      <div className="kardex-header">
        <div className="header-left">
          <div className="header-icon">📊</div>
          <div>
            <h1>Kardex - Control de Movimientos</h1>
            <p className="subtitle">Sistema de control de inventario y movimientos</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-export excel" onClick={exportarExcel}>
            📊 Exportar Excel
          </button>
          <button className="btn-export pdf" onClick={exportarPDF}>
            📄 Exportar PDF
          </button>
        </div>
      </div>

      {/* Selector de Sedes */}
      <div className="sedes-selector">
        {sedes.map(sede => (
          <div
            key={sede.id}
            className={`sede-card ${filtros.sede === sede.id ? 'active' : ''}`}
            onClick={() => setFiltros({ ...filtros, sede: sede.id })}
          >
            <span className="sede-icon">{sede.icono}</span>
            <span className="sede-nombre">{sede.nombre}</span>
          </div>
        ))}
      </div>

      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Total Movimientos</h3>
            <p className="stat-value">{stats.totalMovimientos}</p>
          </div>
        </div>

        <div className="stat-card entrada">
          <div className="stat-icon">📥</div>
          <div className="stat-content">
            <h3>Entradas</h3>
            <p className="stat-value">{stats.totalEntradas} unid.</p>
            <span className="stat-detail">{formatearMoneda(stats.valorEntradas)}</span>
          </div>
        </div>

        <div className="stat-card salida">
          <div className="stat-icon">📤</div>
          <div className="stat-content">
            <h3>Salidas</h3>
            <p className="stat-value">{stats.totalSalidas} unid.</p>
            <span className="stat-detail">{formatearMoneda(stats.valorSalidas)}</span>
          </div>
        </div>

        <div className="stat-card ajuste">
          <div className="stat-icon">⚙️</div>
          <div className="stat-content">
            <h3>Ajustes</h3>
            <p className="stat-value">{stats.totalAjustes}</p>
          </div>
        </div>
      </div>

      {/* Selector de Vista */}
      <div className="vista-selector">
        <button
          className={`vista-btn ${vista === 'general' ? 'active' : ''}`}
          onClick={() => {
            setVista('general');
            setProductoSeleccionado('');
          }}
        >
          📋 Kardex General
        </button>
        <button
          className={`vista-btn ${vista === 'producto' ? 'active' : ''}`}
          onClick={() => setVista('producto')}
        >
          🔍 Kardex por Producto
        </button>
      </div>

      {/* Filtros */}
      <div className="filtros-section">
        <div className="filtros-row">
          {/* Selector de Producto (solo en vista por producto) */}
          {vista === 'producto' && (
            <div className="filtro-group">
              <label>Producto</label>
              <select
                value={productoSeleccionado}
                onChange={(e) => setProductoSeleccionado(e.target.value)}
                className="filtro-select"
              >
                <option value="">Seleccionar producto...</option>
                {productos.map(prod => (
                  <option key={prod.codigo} value={prod.codigo}>
                    {prod.codigo} - {prod.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Rango de Fechas */}
          <div className="filtro-group">
            <label>Fecha Inicio</label>
            <input
              type="date"
              value={filtros.fechaInicio}
              onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
              className="filtro-input"
            />
          </div>

          <div className="filtro-group">
            <label>Fecha Fin</label>
            <input
              type="date"
              value={filtros.fechaFin}
              onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
              className="filtro-input"
            />
          </div>

          {/* Tipo de Movimiento */}
          <div className="filtro-group">
            <label>Tipo de Movimiento</label>
            <select
              value={filtros.tipoMovimiento}
              onChange={(e) => setFiltros({ ...filtros, tipoMovimiento: e.target.value })}
              className="filtro-select"
            >
              <option value="todos">Todos</option>
              {tiposMovimiento.map(tipo => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.icono} {tipo.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Búsqueda */}
          <div className="filtro-group busqueda">
            <label>Buscar</label>
            <div className="busqueda-input">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Código, producto, documento..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="filtro-input"
              />
            </div>
          </div>

          {/* Botón Limpiar */}
          <div className="filtro-group">
            <label>&nbsp;</label>
            <button className="btn-limpiar" onClick={limpiarFiltros}>
              🔄 Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Contador de Resultados */}
      <div className="resultados-info">
        <span>
          Mostrando {movimientosFiltrados.length} de {movimientos.length} movimientos
        </span>
        {vista === 'producto' && productoSeleccionado && (
          <span className="producto-actual">
            📦 Producto: <strong>{productos.find(p => p.codigo === productoSeleccionado)?.nombre}</strong>
          </span>
        )}
      </div>

      {/* Tabla de Movimientos */}
      <div className="kardex-table-container">
        <table className="kardex-table">
          <thead>
            <tr>
              <th>Fecha/Hora</th>
              <th>Tipo</th>
              <th>Producto</th>
              <th>Código</th>
              <th>Documento</th>
              <th className="text-center">Cantidad</th>
              <th className="text-center">Stock Antes</th>
              <th className="text-center">Stock Después</th>
              <th>Sede</th>
              <th>Usuario</th>
              <th>Motivo</th>
              <th>Valor Unit.</th>
            </tr>
          </thead>
          <tbody>
            {movimientosFiltrados.map(mov => {
              const tipoInfo = getTipoInfo(mov.tipo);
              return (
                <tr key={mov.id}>
                  <td className="fecha-cell">{formatearFecha(mov.fecha)}</td>
                  <td>
                    <span
                      className="tipo-badge"
                      style={{ backgroundColor: tipoInfo.color }}
                    >
                      {tipoInfo.icono} {tipoInfo.nombre}
                    </span>
                  </td>
                  <td>
                    <strong>{mov.producto}</strong>
                  </td>
                  <td>
                    <span className="codigo-badge">{mov.codigoProducto}</span>
                  </td>
                  <td className="documento-cell">{mov.documento}</td>
                  <td className="text-center">
                    <span className={`cantidad-badge ${mov.tipo}`}>
                      {mov.tipo === 'entrada' ? '+' : mov.tipo === 'salida' ? '-' : ''}
                      {Math.abs(mov.cantidad)}
                    </span>
                  </td>
                  <td className="text-center stock-cell">{mov.stockAntes}</td>
                  <td className="text-center stock-cell">
                    <strong>{mov.stockDespues}</strong>
                  </td>
                  <td>
                    <span className="sede-badge">{mov.sede}</span>
                  </td>
                  <td className="usuario-cell">👤 {mov.usuario}</td>
                  <td className="motivo-cell">{mov.motivo}</td>
                  <td className="precio-cell">{formatearMoneda(mov.precioUnitario)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {movimientosFiltrados.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">📊</span>
            <p>No se encontraron movimientos</p>
            <span className="empty-hint">
              {vista === 'producto' && !productoSeleccionado
                ? 'Selecciona un producto para ver su historial'
                : 'Intenta con otros filtros de búsqueda'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Kardex;