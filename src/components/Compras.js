import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getCompras, 
  getComprasPorEstado,
  getComprasPorSede,
  deleteCompra 
} from '../services/api';
import './Compras.css';

function Compras() {
  const navigate = useNavigate();
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');
  const [sedeSeleccionada, setSedeSeleccionada] = useState('todas');
  const [showDetalles, setShowDetalles] = useState(null);
  const [error, setError] = useState(null);

  const sedes = [
    { id: 'todas', nombre: '🌐 Todas las Sedes' },
    { id: 1, nombre: '🏢 Deybimotors' },
    { id: 2, nombre: '🔧 Deybi Parts' },
    { id: 3, nombre: '🚗 Deybi Auto' }
  ];

  useEffect(() => {
    cargarCompras();
  }, [sedeSeleccionada, filtro]);

  const cargarCompras = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      
      // Filtrar por sede
      if (sedeSeleccionada !== 'todas') {
        response = await getComprasPorSede(sedeSeleccionada);
      } else {
        response = await getCompras();
      }
      
      let comprasData = response.data;
      
      // Aplicar filtro de tiempo
      if (filtro === 'mes') {
        const haceUnMes = new Date();
        haceUnMes.setMonth(haceUnMes.getMonth() - 1);
        comprasData = comprasData.filter(c => 
          new Date(c.fechaCompra) >= haceUnMes
        );
      } else if (filtro === 'semana') {
        const haceUnaSemana = new Date();
        haceUnaSemana.setDate(haceUnaSemana.getDate() - 7);
        comprasData = comprasData.filter(c => 
          new Date(c.fechaCompra) >= haceUnaSemana
        );
      }
      
      setCompras(comprasData);
    } catch (error) {
      console.error('Error al cargar compras:', error);
      setError('Error al cargar las compras');
      setCompras([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarCompra = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta compra? Solo se pueden eliminar compras en estado PENDIENTE.')) {
      return;
    }

    try {
      await deleteCompra(id);
      alert('✅ Compra eliminada correctamente');
      cargarCompras(); // Recargar lista
    } catch (error) {
      console.error('Error al eliminar compra:', error);
      alert('❌ Error al eliminar la compra. Solo se pueden eliminar compras en estado PENDIENTE.');
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(valor || 0);
  };

  const calcularTotalCompra = (compra) => {
    if (compra.items && Array.isArray(compra.items)) {
      return compra.items.reduce((sum, item) => 
        sum + (item.cantidad * item.precioCompra), 0
      );
    }
    return compra.total || 0;
  };

  const obtenerEstadoBadge = (estado) => {
    const clases = {
      'PENDIENTE': 'badge-estado registrada',
      'RECIBIDA': 'badge-estado encamino',
      'COMPLETADA': 'badge-estado completada'
    };
    return clases[estado] || 'badge-estado';
  };

  const calcularEstadisticas = () => {
    const totalCompras = compras.reduce((sum, c) => sum + calcularTotalCompra(c), 0);
    const totalProveedores = new Set(compras.map(c => c.proveedor?.id).filter(Boolean)).size;
    
    return {
      totalCompras: compras.length,
      montoTotal: totalCompras,
      totalProveedores
    };
  };

  const stats = calcularEstadisticas();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Cargando compras...</p>
      </div>
    );
  }

  return (
    <div className="compras-container">
      <div className="compras-header">
        <div>
          <h2>Registro de Compras</h2>
          <p className="subtitle">Historial de compras y facturas</p>
        </div>
        <div className="header-actions">
          <select 
            className="select-filtro"
            value={sedeSeleccionada}
            onChange={(e) => setSedeSeleccionada(e.target.value === 'todas' ? 'todas' : Number(e.target.value))}
          >
            {sedes.map(sede => (
              <option key={sede.id} value={sede.id}>
                {sede.nombre}
              </option>
            ))}
          </select>

          <select 
            className="filtro-select"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          >
            <option value="todos">Todas las compras</option>
            <option value="mes">Este mes</option>
            <option value="semana">Esta semana</option>
          </select>

          <button 
            className="btn-primary"
            onClick={() => navigate('/compras/registro')}
          >
            📥 Nueva Compra
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      <div className="table-wrapper">
        <table className="compras-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Proveedor</th>
              <th>Sede</th>
              <th>N° Factura</th>
              <th>Productos</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Archivo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {compras.length > 0 ? (
              compras.map((compra) => (
                <tr key={compra.id}>
                  <td className="id-cell">#{String(compra.id).padStart(4, '0')}</td>
                  <td>{formatearFecha(compra.fechaCompra)}</td>
                  <td className="proveedor-cell">
                    {compra.proveedor?.nombre || 'Sin especificar'}
                  </td>
                  <td>{compra.sede?.nombre || 'N/A'}</td>
                  <td className="factura-cell">
                    <span className="factura-numero">
                      {compra.numeroFactura || 'N/A'}
                    </span>
                  </td>
                  <td>{compra.items?.length || 0}</td>
                  <td className="total-cell">
                    {formatearMoneda(calcularTotalCompra(compra))}
                  </td>
                  <td>
                    <span className={obtenerEstadoBadge(compra.estado)}>
                      {compra.estado}
                    </span>
                  </td>
                  <td>
                    {compra.rutaFactura ? (
                      <button 
                        className="btn-archivo" 
                        title="Ver archivo"
                        onClick={() => window.open(compra.rutaFactura, '_blank')}
                      >
                        📄
                      </button>
                    ) : (
                      <span className="sin-archivo">-</span>
                    )}
                  </td>
                  <td>
                    <div className="acciones">
                      <button 
                        className="btn-icon view" 
                        onClick={() => setShowDetalles(compra)}
                        title="Ver detalles"
                      >
                        👁️
                      </button>
                      {compra.estado === 'PENDIENTE' && (
                        <button 
                          className="btn-icon delete" 
                          onClick={() => handleEliminarCompra(compra.id)}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="empty-state">
                    <span style={{ fontSize: '48px' }}>📦</span>
                    <p>No hay compras registradas</p>
                    <button 
                      className="btn-primary"
                      onClick={() => navigate('/compras/registro')}
                    >
                      Registrar primera compra
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Resumen de totales */}
      <div className="resumen-compras">
        <div className="resumen-card">
          <span className="resumen-label">Total Compras</span>
          <span className="resumen-valor">{formatearMoneda(stats.montoTotal)}</span>
        </div>
        <div className="resumen-card">
          <span className="resumen-label">N° de Compras</span>
          <span className="resumen-valor">{stats.totalCompras}</span>
        </div>
        <div className="resumen-card">
          <span className="resumen-label">Proveedores</span>
          <span className="resumen-valor">{stats.totalProveedores}</span>
        </div>
      </div>

      {/* Modal de detalles */}
      {showDetalles && (
        <div className="modal-overlay" onClick={() => setShowDetalles(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalles de Compra</h3>
              <button className="modal-close" onClick={() => setShowDetalles(null)}>✕</button>
            </div>
            
            <div className="detalles-content">
              <div className="detalle-row">
                <span className="detalle-label">ID de Compra:</span>
                <span className="detalle-valor">#{String(showDetalles.id).padStart(4, '0')}</span>
              </div>
              <div className="detalle-row">
                <span className="detalle-label">Fecha:</span>
                <span className="detalle-valor">{formatearFecha(showDetalles.fechaCompra)}</span>
              </div>
              <div className="detalle-row">
                <span className="detalle-label">Proveedor:</span>
                <span className="detalle-valor">{showDetalles.proveedor?.nombre || 'No especificado'}</span>
              </div>
              <div className="detalle-row">
                <span className="detalle-label">Sede:</span>
                <span className="detalle-valor">{showDetalles.sede?.nombre || 'N/A'}</span>
              </div>
              <div className="detalle-row">
                <span className="detalle-label">N° Factura:</span>
                <span className="detalle-valor">{showDetalles.numeroFactura || 'N/A'}</span>
              </div>
              <div className="detalle-row">
                <span className="detalle-label">Estado:</span>
                <span className={obtenerEstadoBadge(showDetalles.estado)}>
                  {showDetalles.estado}
                </span>
              </div>
              <div className="detalle-row">
                <span className="detalle-label">Total:</span>
                <span className="detalle-valor total">{formatearMoneda(calcularTotalCompra(showDetalles))}</span>
              </div>
              
              {showDetalles.items && showDetalles.items.length > 0 && (
                <>
                  <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Productos:</h4>
                  <div className="productos-list">
                    {showDetalles.items.map((item, index) => (
                      <div key={index} className="producto-item">
                        <div>
                          <strong>{item.producto?.nombre || 'Producto'}</strong>
                          <br />
                          <small>Cantidad: {item.cantidad} × {formatearMoneda(item.precioCompra)}</small>
                        </div>
                        <div className="producto-subtotal">
                          {formatearMoneda(item.cantidad * item.precioCompra)}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {showDetalles.observaciones && (
                <div className="detalle-row">
                  <span className="detalle-label">Observaciones:</span>
                  <span className="detalle-valor">{showDetalles.observaciones}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Compras;