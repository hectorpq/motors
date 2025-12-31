import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getDashboard,
  getProductosStockBajo,
  getKardex
} from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [sedeSeleccionada, setSedeSeleccionada] = useState(1); // Por defecto sede 1
  const [stats, setStats] = useState(null);
  const [productosStockBajo, setProductosStockBajo] = useState([]);
  const [movimientosRecientes, setMovimientosRecientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sedes disponibles
  const sedes = [
    { id: 1, nombre: 'Deybimotors', icon: '🏢' },
    { id: 2, nombre: 'Deybi Parts', icon: '🔧' },
    { id: 3, nombre: 'Deybi Auto', icon: '🚗' }
  ];

  useEffect(() => {
    cargarDatosDashboard();
  }, [sedeSeleccionada]);

  const cargarDatosDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos del dashboard
      const dashboardResponse = await getDashboard(sedeSeleccionada);
      setStats(dashboardResponse.data);

      // Cargar productos con stock bajo
      const stockBajoResponse = await getProductosStockBajo(sedeSeleccionada);
      setProductosStockBajo(stockBajoResponse.data.slice(0, 5)); // Solo los primeros 5

      // Cargar movimientos recientes del kardex
      const kardexResponse = await getKardex();
      setMovimientosRecientes(kardexResponse.data.slice(0, 10)); // Últimos 10

      setLoading(false);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
      setError('Error al cargar los datos del dashboard');
      setLoading(false);
      
      // Datos de respaldo en caso de error
      setStats({
        totalProductos: 0,
        totalVentas: 0,
        totalCompras: 0,
        productosStock: 0,
        ventasMes: 0,
        comprasMes: 0,
        movimientosRecientes: 0
      });
    }
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(valor || 0);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const obtenerColorEstado = (tipo) => {
    const colores = {
      'ENTRADA': '#10b981',
      'SALIDA': '#ef4444',
      'COMPRA': '#3b82f6',
      'VENTA': '#f59e0b',
      'AJUSTE': '#6366f1'
    };
    return colores[tipo] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard - Deybimotors</h1>
          <p className="subtitle">Repuestos Automotrices</p>
        </div>
        
        {/* Selector de Sede */}
        <div className="sede-selector">
          <label>Sede:</label>
          <select 
            value={sedeSeleccionada} 
            onChange={(e) => setSedeSeleccionada(Number(e.target.value))}
            className="sede-select"
          >
            {sedes.map(sede => (
              <option key={sede.id} value={sede.id}>
                {sede.icon} {sede.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      {/* Tarjetas de Estadísticas Principales */}
      <div className="stats-grid">
        <div className="stat-card productos">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>Total Productos</h3>
            <p className="stat-value">{stats?.totalProductos || 0}</p>
            <span className="stat-label">En catálogo</span>
          </div>
        </div>

        <div className="stat-card ventas">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Ventas Totales</h3>
            <p className="stat-value">{formatearMoneda(stats?.totalVentas)}</p>
            <span className="stat-label">Acumulado</span>
          </div>
        </div>

        <div className="stat-card compras">
          <div className="stat-icon">🛒</div>
          <div className="stat-info">
            <h3>Compras Totales</h3>
            <p className="stat-value">{formatearMoneda(stats?.totalCompras)}</p>
            <span className="stat-label">Acumulado</span>
          </div>
        </div>

        <div className="stat-card stock">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Stock Disponible</h3>
            <p className="stat-value">{stats?.productosStock || 0}</p>
            <span className="stat-label">Productos en inventario</span>
          </div>
        </div>
      </div>

      {/* Estadísticas del Mes */}
      <div className="monthly-stats">
        <div className="monthly-card">
          <h3>Ventas del Mes</h3>
          <p className="monthly-value">{formatearMoneda(stats?.ventasMes)}</p>
          <div className="progress-bar">
            <div 
              className="progress-fill ventas-fill" 
              style={{width: `${Math.min((stats?.ventasMes / (stats?.totalVentas || 1)) * 100, 100)}%`}}
            ></div>
          </div>
        </div>

        <div className="monthly-card">
          <h3>Compras del Mes</h3>
          <p className="monthly-value">{formatearMoneda(stats?.comprasMes)}</p>
          <div className="progress-bar">
            <div 
              className="progress-fill compras-fill" 
              style={{width: `${Math.min((stats?.comprasMes / (stats?.totalCompras || 1)) * 100, 100)}%`}}
            ></div>
          </div>
        </div>

        <div className="monthly-card">
          <h3>Movimientos Recientes</h3>
          <p className="monthly-value">{movimientosRecientes.length}</p>
          <div className="progress-bar">
            <div 
              className="progress-fill movimientos-fill" 
              style={{width: '60%'}}
            ></div>
          </div>
        </div>
      </div>

      {/* Productos con Stock Bajo */}
      {productosStockBajo.length > 0 && (
        <div className="alert-section">
          <h2>⚠️ Productos con Stock Bajo</h2>
          <div className="alert-table">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Código</th>
                  <th>Stock Actual</th>
                  <th>Stock Mínimo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {productosStockBajo.map((producto) => (
                  <tr key={producto.id}>
                    <td className="product-name">
                      {producto.nombre || producto.producto?.nombre || 'N/A'}
                    </td>
                    <td>{producto.codigo || producto.producto?.codigo || 'N/A'}</td>
                    <td className="stock-actual">
                      <span className="badge danger">{producto.cantidadActual || producto.stock || 0}</span>
                    </td>
                    <td>{producto.stockMinimo || 10}</td>
                    <td>
                      <span className="badge warning">Stock Bajo</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Movimientos Recientes del Kardex */}
      <div className="movements-section">
        <h2>Movimientos Recientes</h2>
        <div className="movements-table">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {movimientosRecientes.length > 0 ? (
                movimientosRecientes.map((movimiento) => (
                  <tr key={movimiento.id}>
                    <td>{formatearFecha(movimiento.fecha)}</td>
                    <td>
                      <span 
                        className="badge-tipo" 
                        style={{backgroundColor: obtenerColorEstado(movimiento.tipoMovimiento)}}
                      >
                        {movimiento.tipoMovimiento}
                      </span>
                    </td>
                    <td>{movimiento.producto?.nombre || 'N/A'}</td>
                    <td className={movimiento.tipoMovimiento === 'ENTRADA' ? 'cantidad-entrada' : 'cantidad-salida'}>
                      {movimiento.tipoMovimiento === 'ENTRADA' ? '+' : '-'}{movimiento.cantidad}
                    </td>
                    <td>{movimiento.usuario?.nombre || 'Sistema'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>
                    No hay movimientos recientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="quick-actions">
        <h2>Acciones Rápidas</h2>
        <div className="actions-grid">
          <button 
            className="action-btn productos-btn"
            onClick={() => navigate('/productos')}
          >
            <span className="action-icon">📦</span>
            <span>Gestionar Productos</span>
          </button>
          <button 
            className="action-btn ventas-btn"
            onClick={() => navigate('/ventas/nueva')}
          >
            <span className="action-icon">💳</span>
            <span>Nueva Venta</span>
          </button>
          <button 
            className="action-btn compras-btn"
            onClick={() => navigate('/compras/nueva')}
          >
            <span className="action-icon">🛒</span>
            <span>Registrar Compra</span>
          </button>
          <button 
            className="action-btn reportes-btn"
            onClick={() => navigate('/kardex')}
          >
            <span className="action-icon">📊</span>
            <span>Ver Kardex</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;