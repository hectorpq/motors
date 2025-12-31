import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getStockSede,
  getProductosStockBajo,
  getProductosSinStock,
  getSedes,
  getProductos,
  ajustarStock
} from '../services/api';
import './Stock.css';

const Stock = () => {
  const navigate = useNavigate();
  const [stockProductos, setStockProductos] = useState([]);
  const [productosStockBajo, setProductosStockBajo] = useState([]);
  const [productosSinStock, setProductosSinStock] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [sedeSeleccionada, setSedeSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vista, setVista] = useState('general'); // 'general', 'stock-bajo', 'sin-stock'
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModalAjuste, setMostrarModalAjuste] = useState(false);
  const [productoAjuste, setProductoAjuste] = useState(null);

  // Estados del modal de ajuste
  const [ajusteForm, setAjusteForm] = useState({
    cantidad: 0,
    tipoAjuste: 'POSITIVO',
    motivo: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (sedeSeleccionada) {
      cargarStockPorSede();
    }
  }, [sedeSeleccionada]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');

      // Cargar sedes
      const sedesResponse = await getSedes();
      setSedes(sedesResponse.data);

      // Seleccionar primera sede activa por defecto
      const primeraSedeActiva = sedesResponse.data.find(s => s.activo);
      if (primeraSedeActiva) {
        setSedeSeleccionada(primeraSedeActiva.id);
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  const cargarStockPorSede = async () => {
    if (!sedeSeleccionada) return;

    try {
      setLoading(true);
      setError('');

      // Cargar stock general
      const stockResponse = await getStockSede(sedeSeleccionada);
      setStockProductos(stockResponse.data);

      // Cargar productos con stock bajo
      const stockBajoResponse = await getProductosStockBajo(sedeSeleccionada);
      setProductosStockBajo(stockBajoResponse.data);

      // Cargar productos sin stock
      const sinStockResponse = await getProductosSinStock(sedeSeleccionada);
      setProductosSinStock(sinStockResponse.data);

    } catch (error) {
      console.error('Error al cargar stock:', error);
      setError('Error al cargar el stock de la sede');
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirModalAjuste = (stock) => {
    setProductoAjuste(stock);
    setAjusteForm({
      cantidad: 0,
      tipoAjuste: 'POSITIVO',
      motivo: ''
    });
    setMostrarModalAjuste(true);
  };

  const handleAjustarStock = async (e) => {
    e.preventDefault();

    if (!ajusteForm.motivo.trim()) {
      alert('❌ Debes especificar un motivo para el ajuste');
      return;
    }

    if (ajusteForm.cantidad <= 0) {
      alert('❌ La cantidad debe ser mayor a 0');
      return;
    }

    try {
      setLoading(true);

      const cantidadFinal = ajusteForm.tipoAjuste === 'POSITIVO' 
        ? ajusteForm.cantidad 
        : -ajusteForm.cantidad;

      const request = {
        productoId: productoAjuste.productoId,
        sedeId: sedeSeleccionada,
        cantidad: cantidadFinal,
        motivo: ajusteForm.motivo
      };

      await ajustarStock(request);

      alert('✅ Stock ajustado correctamente');
      setMostrarModalAjuste(false);
      cargarStockPorSede(); // Recargar datos

    } catch (error) {
      console.error('Error al ajustar stock:', error);
      alert('❌ Error al ajustar el stock');
    } finally {
      setLoading(false);
    }
  };

  const getProductosVista = () => {
    let productos = [];
    
    switch (vista) {
      case 'stock-bajo':
        productos = productosStockBajo;
        break;
      case 'sin-stock':
        productos = productosSinStock;
        break;
      default:
        productos = stockProductos;
    }

    // Aplicar búsqueda
    if (busqueda) {
      const searchLower = busqueda.toLowerCase();
      return productos.filter(p => 
        p.productoNombre?.toLowerCase().includes(searchLower) ||
        p.productoCodigo?.toLowerCase().includes(searchLower)
      );
    }

    return productos;
  };

  const productosFiltrados = getProductosVista();

  const calcularEstadisticas = () => {
    return {
      totalProductos: stockProductos.length,
      stockBajo: productosStockBajo.length,
      sinStock: productosSinStock.length,
      valorTotal: stockProductos.reduce((sum, p) => 
        sum + (p.cantidad * (p.precioCompra || 0)), 0
      )
    };
  };

  const stats = calcularEstadisticas();

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(valor || 0);
  };

  const getEstadoStock = (stock) => {
    if (stock.cantidad === 0) {
      return { clase: 'sin-stock', texto: 'Sin Stock', icono: '🔴' };
    }
    if (stock.cantidad <= stock.stockMinimo) {
      return { clase: 'stock-bajo', texto: 'Stock Bajo', icono: '⚠️' };
    }
    return { clase: 'stock-ok', texto: 'Stock OK', icono: '✅' };
  };

  const getSedeNombre = (sedeId) => {
    const sede = sedes.find(s => s.id === sedeId);
    return sede?.nombre || 'N/A';
  };

  if (loading && stockProductos.length === 0) {
    return (
      <div className="stock-loading">
        <div className="spinner"></div>
        <p>Cargando inventario...</p>
      </div>
    );
  }

  return (
    <div className="stock-container">
      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      {/* Header */}
      <div className="stock-header">
        <div className="header-left">
          <div className="header-icon">📦</div>
          <div>
            <h1>Gestión de Stock e Inventario</h1>
            <p className="subtitle">Control de existencias por sede</p>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={() => navigate('/stock/ajuste')}
          >
            ⚙️ Ajuste Manual
          </button>
          <button 
            className="btn-secondary"
            onClick={() => navigate('/kardex')}
          >
            📊 Ver Kardex
          </button>
        </div>
      </div>

      {/* Selector de Sedes */}
      <div className="sedes-selector">
        {sedes.filter(s => s.activo).map(sede => (
          <div
            key={sede.id}
            className={`sede-card ${sedeSeleccionada === sede.id ? 'active' : ''}`}
            onClick={() => setSedeSeleccionada(sede.id)}
          >
            <span className="sede-icon">🏢</span>
            <div className="sede-info">
              <span className="sede-nombre">{sede.nombre}</span>
              <span className="sede-direccion">{sede.direccion}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Total Productos</h3>
            <p className="stat-value">{stats.totalProductos}</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>Stock Bajo</h3>
            <p className="stat-value">{stats.stockBajo}</p>
            <button 
              className="stat-link"
              onClick={() => setVista('stock-bajo')}
            >
              Ver detalles →
            </button>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon">🔴</div>
          <div className="stat-content">
            <h3>Sin Stock</h3>
            <p className="stat-value">{stats.sinStock}</p>
            <button 
              className="stat-link"
              onClick={() => setVista('sin-stock')}
            >
              Ver detalles →
            </button>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Valor Total</h3>
            <p className="stat-value">{formatearMoneda(stats.valorTotal)}</p>
          </div>
        </div>
      </div>

      {/* Selector de Vista */}
      <div className="vista-selector">
        <button
          className={`vista-btn ${vista === 'general' ? 'active' : ''}`}
          onClick={() => setVista('general')}
        >
          📋 Todos ({stockProductos.length})
        </button>
        <button
          className={`vista-btn ${vista === 'stock-bajo' ? 'active' : ''}`}
          onClick={() => setVista('stock-bajo')}
        >
          ⚠️ Stock Bajo ({productosStockBajo.length})
        </button>
        <button
          className={`vista-btn ${vista === 'sin-stock' ? 'active' : ''}`}
          onClick={() => setVista('sin-stock')}
        >
          🔴 Sin Stock ({productosSinStock.length})
        </button>
      </div>

      {/* Búsqueda */}
      <div className="busqueda-section">
        <div className="busqueda-input">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por código o nombre de producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <span className="resultados-count">
          Mostrando {productosFiltrados.length} productos
        </span>
      </div>

      {/* Tabla de Stock */}
      <div className="stock-table-container">
        {loading ? (
          <div className="loading-overlay">
            <div className="spinner"></div>
          </div>
        ) : (
          <table className="stock-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th className="text-center">Stock Actual</th>
                <th className="text-center">Stock Mínimo</th>
                <th className="text-center">Estado</th>
                <th>Ubicación</th>
                <th>Precio Compra</th>
                <th>Valor Total</th>
                <th>Última Actualización</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map(stock => {
                const estado = getEstadoStock(stock);
                return (
                  <tr key={stock.id}>
                    <td>
                      <span className="codigo-badge">{stock.productoCodigo}</span>
                    </td>
                    <td>
                      <strong>{stock.productoNombre}</strong>
                    </td>
                    <td className="text-center">
                      <span className={`stock-cantidad ${estado.clase}`}>
                        {stock.cantidad}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="stock-minimo">{stock.stockMinimo}</span>
                    </td>
                    <td className="text-center">
                      <span className={`estado-badge ${estado.clase}`}>
                        {estado.icono} {estado.texto}
                      </span>
                    </td>
                    <td>{stock.ubicacion || 'Sin asignar'}</td>
                    <td>{formatearMoneda(stock.precioCompra)}</td>
                    <td>
                      <strong>{formatearMoneda(stock.cantidad * (stock.precioCompra || 0))}</strong>
                    </td>
                    <td className="fecha-cell">
                      {stock.ultimaActualizacion 
                        ? new Date(stock.ultimaActualizacion).toLocaleDateString('es-PE')
                        : 'N/A'
                      }
                    </td>
                    <td className="text-center">
                      <button
                        className="btn-icon"
                        onClick={() => handleAbrirModalAjuste(stock)}
                        title="Ajustar stock"
                      >
                        ⚙️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {productosFiltrados.length === 0 && !loading && (
          <div className="empty-state">
            <span className="empty-icon">📦</span>
            <p>No se encontraron productos</p>
            <span className="empty-hint">
              {vista === 'sin-stock' 
                ? '¡Excelente! No hay productos sin stock'
                : vista === 'stock-bajo'
                ? '¡Perfecto! No hay productos con stock bajo'
                : 'La sede no tiene productos registrados'
              }
            </span>
          </div>
        )}
      </div>

      {/* Modal de Ajuste Rápido */}
      {mostrarModalAjuste && (
        <div className="modal-overlay" onClick={() => setMostrarModalAjuste(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚙️ Ajustar Stock</h2>
              <button 
                className="modal-close"
                onClick={() => setMostrarModalAjuste(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="producto-info">
                <h3>{productoAjuste?.productoNombre}</h3>
                <p>Código: <strong>{productoAjuste?.productoCodigo}</strong></p>
                <p>Stock actual: <strong>{productoAjuste?.cantidad}</strong></p>
                <p>Sede: <strong>{getSedeNombre(sedeSeleccionada)}</strong></p>
              </div>

              <form onSubmit={handleAjustarStock}>
                <div className="form-group">
                  <label>Tipo de Ajuste</label>
                  <div className="tipo-ajuste-buttons">
                    <button
                      type="button"
                      className={`tipo-btn ${ajusteForm.tipoAjuste === 'POSITIVO' ? 'active positivo' : ''}`}
                      onClick={() => setAjusteForm({ ...ajusteForm, tipoAjuste: 'POSITIVO' })}
                    >
                      ➕ Sumar Stock
                    </button>
                    <button
                      type="button"
                      className={`tipo-btn ${ajusteForm.tipoAjuste === 'NEGATIVO' ? 'active negativo' : ''}`}
                      onClick={() => setAjusteForm({ ...ajusteForm, tipoAjuste: 'NEGATIVO' })}
                    >
                      ➖ Restar Stock
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={ajusteForm.cantidad}
                    onChange={(e) => setAjusteForm({ ...ajusteForm, cantidad: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Motivo del Ajuste *</label>
                  <textarea
                    value={ajusteForm.motivo}
                    onChange={(e) => setAjusteForm({ ...ajusteForm, motivo: e.target.value })}
                    placeholder="Ejemplo: Corrección de inventario, productos dañados, etc."
                    rows="3"
                    required
                  />
                </div>

                <div className="preview-ajuste">
                  <p>Stock resultante:</p>
                  <strong className={ajusteForm.tipoAjuste === 'POSITIVO' ? 'positivo' : 'negativo'}>
                    {productoAjuste?.cantidad} {ajusteForm.tipoAjuste === 'POSITIVO' ? '+' : '-'} {ajusteForm.cantidad} = {' '}
                    {ajusteForm.tipoAjuste === 'POSITIVO' 
                      ? (productoAjuste?.cantidad || 0) + ajusteForm.cantidad
                      : (productoAjuste?.cantidad || 0) - ajusteForm.cantidad
                    }
                  </strong>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setMostrarModalAjuste(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Ajustando...' : 'Confirmar Ajuste'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stock;