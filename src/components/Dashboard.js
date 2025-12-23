import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProductos: 0,
    totalVentas: 0,
    totalCompras: 0,
    productosStock: 0,
    ventasMes: 0,
    comprasMes: 0,
    movimientosRecientes: 0
  });

  const [ventasPorMes, setVentasPorMes] = useState([]);
  const [productosPopulares, setProductosPopulares] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatosEstadisticas();
    cargarGraficoVentas();
    cargarProductosPopulares();
  }, []);

  const cargarDatosEstadisticas = async () => {
    try {
      // Simulación de carga de datos - Reemplaza con tu API real
      const response = await fetch('/api/dashboard/estadisticas');
      if (!response.ok) {
        throw new Error('Error al cargar estadísticas');
      }
      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
      // Datos de ejemplo en caso de error
      setStats({
        totalProductos: 150,
        totalVentas: 45000,
        totalCompras: 32000,
        productosStock: 120,
        ventasMes: 15000,
        comprasMes: 8000,
        movimientosRecientes: 25
      });
      setLoading(false);
    }
  };

  const cargarGraficoVentas = async () => {
    try {
      const response = await fetch('/api/dashboard/ventas-mensuales');
      const data = await response.json();
      setVentasPorMes(data);
    } catch (error) {
      console.error('Error al cargar gráfico de ventas:', error);
      // Datos de ejemplo
      setVentasPorMes([
        { mes: 'Ene', ventas: 12000, compras: 8000 },
        { mes: 'Feb', ventas: 15000, compras: 9000 },
        { mes: 'Mar', ventas: 18000, compras: 10000 },
        { mes: 'Abr', ventas: 14000, compras: 7500 },
        { mes: 'May', ventas: 16000, compras: 8500 },
        { mes: 'Jun', ventas: 20000, compras: 11000 }
      ]);
    }
  };

  const cargarProductosPopulares = async () => {
    try {
      const response = await fetch('/api/dashboard/productos-populares');
      const data = await response.json();
      setProductosPopulares(data);
    } catch (error) {
      console.error('Error al cargar productos populares:', error);
      // Datos de ejemplo
      setProductosPopulares([
        { nombre: 'Aceite Motor 5W-30', ventas: 45, monto: 2250 },
        { nombre: 'Filtro de Aire', ventas: 38, monto: 1140 },
        { nombre: 'Pastillas de Freno', ventas: 32, monto: 4800 },
        { nombre: 'Batería 12V', ventas: 28, monto: 8400 },
        { nombre: 'Amortiguadores', ventas: 25, monto: 7500 }
      ]);
    }
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(valor);
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
        <h1>Dashboard - Deybimotors</h1>
        <p className="subtitle">Repuestos Automotrices</p>
      </div>

      {/* Tarjetas de Estadísticas Principales */}
      <div className="stats-grid">
        <div className="stat-card productos">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>Total Productos</h3>
            <p className="stat-value">{stats.totalProductos}</p>
            <span className="stat-label">En catálogo</span>
          </div>
        </div>

        <div className="stat-card ventas">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Ventas Totales</h3>
            <p className="stat-value">{formatearMoneda(stats.totalVentas)}</p>
            <span className="stat-label">Acumulado</span>
          </div>
        </div>

        <div className="stat-card compras">
          <div className="stat-icon">🛒</div>
          <div className="stat-info">
            <h3>Compras Totales</h3>
            <p className="stat-value">{formatearMoneda(stats.totalCompras)}</p>
            <span className="stat-label">Acumulado</span>
          </div>
        </div>

        <div className="stat-card stock">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Stock Disponible</h3>
            <p className="stat-value">{stats.productosStock}</p>
            <span className="stat-label">Productos en inventario</span>
          </div>
        </div>
      </div>

      {/* Estadísticas del Mes */}
      <div className="monthly-stats">
        <div className="monthly-card">
          <h3>Ventas del Mes</h3>
          <p className="monthly-value">{formatearMoneda(stats.ventasMes)}</p>
          <div className="progress-bar">
            <div className="progress-fill ventas-fill" style={{width: '70%'}}></div>
          </div>
        </div>

        <div className="monthly-card">
          <h3>Compras del Mes</h3>
          <p className="monthly-value">{formatearMoneda(stats.comprasMes)}</p>
          <div className="progress-bar">
            <div className="progress-fill compras-fill" style={{width: '50%'}}></div>
          </div>
        </div>

        <div className="monthly-card">
          <h3>Movimientos Recientes</h3>
          <p className="monthly-value">{stats.movimientosRecientes}</p>
          <div className="progress-bar">
            <div className="progress-fill movimientos-fill" style={{width: '60%'}}></div>
          </div>
        </div>
      </div>

      {/* Gráfico de Ventas vs Compras */}
      <div className="chart-section">
        <h2>Ventas vs Compras - Últimos 6 Meses</h2>
        <div className="chart-container">
          <div className="chart-bars">
            {ventasPorMes.map((dato, index) => {
              const maxValor = Math.max(...ventasPorMes.map(d => Math.max(d.ventas, d.compras)));
              const alturaVentas = (dato.ventas / maxValor) * 100;
              const alturaCompras = (dato.compras / maxValor) * 100;
              
              return (
                <div key={index} className="chart-bar-group">
                  <div className="bar-pair">
                    <div 
                      className="bar ventas-bar" 
                      style={{height: `${alturaVentas}%`}}
                      title={`Ventas: ${formatearMoneda(dato.ventas)}`}
                    >
                      <span className="bar-label">{formatearMoneda(dato.ventas)}</span>
                    </div>
                    <div 
                      className="bar compras-bar" 
                      style={{height: `${alturaCompras}%`}}
                      title={`Compras: ${formatearMoneda(dato.compras)}`}
                    >
                      <span className="bar-label">{formatearMoneda(dato.compras)}</span>
                    </div>
                  </div>
                  <span className="bar-month">{dato.mes}</span>
                </div>
              );
            })}
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-color ventas"></span>
              <span>Ventas</span>
            </div>
            <div className="legend-item">
              <span className="legend-color compras"></span>
              <span>Compras</span>
            </div>
          </div>
        </div>
      </div>

      {/* Productos Más Vendidos */}
      <div className="products-section">
        <h2>Productos Más Vendidos</h2>
        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Ventas</th>
                <th>Monto Total</th>
                <th>Tendencia</th>
              </tr>
            </thead>
            <tbody>
              {productosPopulares.map((producto, index) => (
                <tr key={index}>
                  <td className="product-name">
                    <span className="rank">#{index + 1}</span>
                    {producto.nombre}
                  </td>
                  <td>{producto.ventas} unidades</td>
                  <td className="monto">{formatearMoneda(producto.monto)}</td>
                  <td>
                    <span className="trend up">↑ {Math.floor(Math.random() * 20 + 5)}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="quick-actions">
        <h2>Acciones Rápidas</h2>
        <div className="actions-grid">
          <button className="action-btn productos-btn">
            <span className="action-icon">📦</span>
            <span>Gestionar Productos</span>
          </button>
          <button className="action-btn ventas-btn">
            <span className="action-icon">💳</span>
            <span>Nueva Venta</span>
          </button>
          <button className="action-btn compras-btn">
            <span className="action-icon">🛒</span>
            <span>Registrar Compra</span>
          </button>
          <button className="action-btn reportes-btn">
            <span className="action-icon">📊</span>
            <span>Ver Reportes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;