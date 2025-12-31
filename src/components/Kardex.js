import React, { useState, useEffect } from 'react';
import { 
  getKardex, 
  getKardexPorProducto, 
  getKardexPorSede, 
  getKardexPorTipo,
  getKardexPorFechas,
  getKardexPorProductoYFechas,
  getProductos,
  getSedes,
  exportarKardexPDF
} from '../services/api';
import './Kardex.css';

const Kardex = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState('general'); // 'general' o 'producto'
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    tipoMovimiento: 'todos',
    sedeId: null, // null = todas
    usuario: 'todos'
  });
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');

  const tiposMovimiento = [
    { id: 'ENTRADA', nombre: 'Entrada', icono: '📥', color: '#27ae60' },
    { id: 'SALIDA', nombre: 'Salida', icono: '📤', color: '#e74c3c' },
    { id: 'AJUSTE', nombre: 'Ajuste', icono: '⚙️', color: '#f39c12' },
    { id: 'TRANSFERENCIA', nombre: 'Transferencia', icono: '🔄', color: '#3498db' }
  ];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');

      // Cargar movimientos iniciales
      const movResponse = await getKardex();
      setMovimientos(movResponse.data);

      // Cargar productos
      const prodResponse = await getProductos();
      setProductos(prodResponse.data);

      // Cargar sedes
      const sedesResponse = await getSedes();
      setSedes([
        { id: null, nombre: 'Todas las Sedes', direccion: '', activo: true },
        ...sedesResponse.data
      ]);

    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos del kardex');
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros cuando cambian
  useEffect(() => {
    aplicarFiltros();
  }, [filtros, productoSeleccionado, vista]);

  const aplicarFiltros = async () => {
    try {
      setLoading(true);
      setError('');
      let response;

      // Vista por producto
      if (vista === 'producto' && productoSeleccionado) {
        if (filtros.fechaInicio && filtros.fechaFin) {
          // Producto + fechas
          response = await getKardexPorProductoYFechas(
            productoSeleccionado,
            filtros.fechaInicio + 'T00:00:00',
            filtros.fechaFin + 'T23:59:59'
          );
        } else {
          // Solo producto
          response = await getKardexPorProducto(productoSeleccionado);
        }
      }
      // Vista general con filtros
      else {
        if (filtros.fechaInicio && filtros.fechaFin) {
          // Por fechas
          response = await getKardexPorFechas(
            filtros.fechaInicio + 'T00:00:00',
            filtros.fechaFin + 'T23:59:59'
          );
        } else if (filtros.sedeId) {
          // Por sede
          response = await getKardexPorSede(filtros.sedeId);
        } else if (filtros.tipoMovimiento !== 'todos') {
          // Por tipo
          response = await getKardexPorTipo(filtros.tipoMovimiento);
        } else {
          // Todos los movimientos
          response = await getKardex();
        }
      }

      setMovimientos(response.data);
    } catch (error) {
      console.error('Error al filtrar:', error);
      setError('Error al aplicar filtros');
    } finally {
      setLoading(false);
    }
  };

  const movimientosFiltrados = movimientos.filter(mov => {
    // Filtro de sede (aplicado localmente para combinar con otros filtros)
    if (filtros.sedeId && mov.sedeId !== filtros.sedeId) {
      return false;
    }

    // Filtro de tipo (aplicado localmente para combinar con otros filtros)
    if (filtros.tipoMovimiento !== 'todos' && mov.tipoMovimiento !== filtros.tipoMovimiento) {
      return false;
    }

    // Búsqueda
    if (busqueda) {
      const searchLower = busqueda.toLowerCase();
      return (
        mov.productoNombre?.toLowerCase().includes(searchLower) ||
        mov.productoCodigo?.toLowerCase().includes(searchLower) ||
        mov.documento?.toLowerCase().includes(searchLower) ||
        mov.usuarioNombre?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const calcularEstadisticas = () => {
    const entradas = movimientosFiltrados.filter(m => m.tipoMovimiento === 'ENTRADA');
    const salidas = movimientosFiltrados.filter(m => m.tipoMovimiento === 'SALIDA');
    const ajustes = movimientosFiltrados.filter(m => m.tipoMovimiento === 'AJUSTE');

    const totalEntradas = entradas.reduce((sum, m) => sum + m.cantidad, 0);
    const totalSalidas = salidas.reduce((sum, m) => sum + Math.abs(m.cantidad), 0);
    const totalAjustes = ajustes.length;

    const valorEntradas = entradas.reduce((sum, m) => sum + (m.cantidad * (m.precioUnitario || 0)), 0);
    const valorSalidas = salidas.reduce((sum, m) => sum + (Math.abs(m.cantidad) * (m.precioUnitario || 0)), 0);

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
    }).format(valor || 0);
  };

  const getTipoInfo = (tipo) => {
    return tiposMovimiento.find(t => t.id === tipo) || tiposMovimiento[0];
  };

  const getSedeNombre = (sedeId) => {
    const sede = sedes.find(s => s.id === sedeId);
    return sede?.nombre || 'N/A';
  };

  const exportarPDF = async () => {
    try {
      setLoading(true);
      
      const filtrosExportar = {
        productoId: vista === 'producto' ? productoSeleccionado : null,
        fechaInicio: filtros.fechaInicio ? filtros.fechaInicio + 'T00:00:00' : null,
        fechaFin: filtros.fechaFin ? filtros.fechaFin + 'T23:59:59' : null
      };

      const response = await exportarKardexPDF(
        filtrosExportar.productoId,
        filtrosExportar.fechaInicio,
        filtrosExportar.fechaFin
      );

      // Crear blob y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `kardex_${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert('✅ PDF descargado correctamente');
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('❌ Error al exportar PDF');
    } finally {
      setLoading(false);
    }
  };

  const exportarExcel = () => {
    // Convertir a CSV para Excel
    const headers = ['Fecha', 'Tipo', 'Producto', 'Código', 'Documento', 'Cantidad', 'Stock Antes', 'Stock Después', 'Sede', 'Usuario', 'Motivo'];
    const rows = movimientosFiltrados.map(mov => [
      formatearFecha(mov.fechaMovimiento),
      mov.tipoMovimiento,
      mov.productoNombre,
      mov.productoCodigo,
      mov.documento || 'N/A',
      mov.cantidad,
      mov.stockAnterior,
      mov.stockNuevo,
      getSedeNombre(mov.sedeId),
      mov.usuarioNombre,
      mov.motivo || 'N/A'
    ]);

    let csvContent = '\uFEFF'; // BOM para Excel UTF-8
    csvContent += headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kardex_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    alert('✅ Excel descargado correctamente');
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaInicio: '',
      fechaFin: '',
      tipoMovimiento: 'todos',
      sedeId: null,
      usuario: 'todos'
    });
    setBusqueda('');
    setProductoSeleccionado('');
    cargarDatos(); // Recargar datos sin filtros
  };

  if (loading && movimientos.length === 0) {
    return (
      <div className="kardex-loading">
        <div className="spinner"></div>
        <p>Cargando movimientos...</p>
      </div>
    );
  }

  return (
    <div className="kardex-container">
      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

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
            key={sede.id || 'todas'}
            className={`sede-card ${filtros.sedeId === sede.id ? 'active' : ''}`}
            onClick={() => setFiltros({ ...filtros, sedeId: sede.id })}
          >
            <span className="sede-icon">
              {sede.id === null ? '🌐' : '🏢'}
            </span>
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
                  <option key={prod.id} value={prod.id}>
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
          Mostrando {movimientosFiltrados.length} movimientos
        </span>
        {vista === 'producto' && productoSeleccionado && (
          <span className="producto-actual">
            📦 Producto: <strong>{productos.find(p => p.id === parseInt(productoSeleccionado))?.nombre}</strong>
          </span>
        )}
      </div>

      {/* Tabla de Movimientos */}
      <div className="kardex-table-container">
        {loading ? (
          <div className="loading-overlay">
            <div className="spinner"></div>
          </div>
        ) : (
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
              </tr>
            </thead>
            <tbody>
              {movimientosFiltrados.map(mov => {
                const tipoInfo = getTipoInfo(mov.tipoMovimiento);
                return (
                  <tr key={mov.id}>
                    <td className="fecha-cell">{formatearFecha(mov.fechaMovimiento)}</td>
                    <td>
                      <span
                        className="tipo-badge"
                        style={{ backgroundColor: tipoInfo.color }}
                      >
                        {tipoInfo.icono} {tipoInfo.nombre}
                      </span>
                    </td>
                    <td>
                      <strong>{mov.productoNombre}</strong>
                    </td>
                    <td>
                      <span className="codigo-badge">{mov.productoCodigo}</span>
                    </td>
                    <td className="documento-cell">{mov.documento || 'N/A'}</td>
                    <td className="text-center">
                      <span className={`cantidad-badge ${mov.tipoMovimiento.toLowerCase()}`}>
                        {mov.tipoMovimiento === 'ENTRADA' ? '+' : mov.tipoMovimiento === 'SALIDA' ? '-' : ''}
                        {Math.abs(mov.cantidad)}
                      </span>
                    </td>
                    <td className="text-center stock-cell">{mov.stockAnterior}</td>
                    <td className="text-center stock-cell">
                      <strong>{mov.stockNuevo}</strong>
                    </td>
                    <td>
                      <span className="sede-badge">{getSedeNombre(mov.sedeId)}</span>
                    </td>
                    <td className="usuario-cell">👤 {mov.usuarioNombre}</td>
                    <td className="motivo-cell">{mov.motivo || 'N/A'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {movimientosFiltrados.length === 0 && !loading && (
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