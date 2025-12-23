import React, { useState, useEffect } from 'react';
import { getMovimientos, getProductos } from '../services/api';
import './Compras.css';

function Compras() {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');
  const [showDetalles, setShowDetalles] = useState(null);

  useEffect(() => {
    cargarCompras();
  }, []);

  const cargarCompras = async () => {
    try {
      const response = await getMovimientos();
      // Filtrar solo las entradas (compras)
      const comprasData = response.data.filter(m => m.tipo === 'ENTRADA');
      setCompras(comprasData);
    } catch (error) {
      console.error('Error al cargar compras:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularTotal = (compra) => {
    return compra.cantidad * (compra.precio || 0);
  };

  if (loading) return <div className="loading">Cargando compras...</div>;

  return (
    <div className="compras-container">
      <div className="compras-header">
        <div>
          <h2>Registro de Compras</h2>
          <p className="subtitle">Historial de compras y facturas</p>
        </div>
        <div className="header-actions">
          <select 
            className="filtro-select"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          >
            <option value="todos">Todas las compras</option>
            <option value="mes">Este mes</option>
            <option value="semana">Esta semana</option>
          </select>
          <button className="btn-primary">
            📥 Nueva Compra
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="compras-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Proveedor</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>N° Factura</th>
              <th>Total</th>
              <th>Archivo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {compras.map((compra, index) => (
              <tr key={compra.id}>
                <td className="id-cell">#{String(compra.id).padStart(4, '0')}</td>
                <td>{new Date(compra.fecha).toLocaleDateString('es-PE')}</td>
                <td className="proveedor-cell">
                  {compra.proveedorCliente || 'Sin especificar'}
                </td>
                <td className="producto-cell">
                  <div className="producto-info">
                    <span className="nombre">{compra.productoNombre}</span>
                  </div>
                </td>
                <td className="cantidad-cell">{compra.cantidad}</td>
                <td className="factura-cell">
                  <span className="factura-numero">
                    F-{String(1000 + index).padStart(4, '0')}
                  </span>
                </td>
                <td className="total-cell">
                  S/ {(compra.cantidad * 50).toFixed(2)}
                </td>
                <td>
                  <button className="btn-archivo" title="Ver archivo">
                    📄
                  </button>
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
                    <button className="btn-icon download" title="Descargar">
                      ⬇️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resumen de totales */}
      <div className="resumen-compras">
        <div className="resumen-card">
          <span className="resumen-label">Total Compras</span>
          <span className="resumen-valor">
            S/ {compras.reduce((acc, c) => acc + (c.cantidad * 50), 0).toFixed(2)}
          </span>
        </div>
        <div className="resumen-card">
          <span className="resumen-label">N° de Compras</span>
          <span className="resumen-valor">{compras.length}</span>
        </div>
        <div className="resumen-card">
          <span className="resumen-label">Proveedores</span>
          <span className="resumen-valor">
            {new Set(compras.map(c => c.proveedorCliente).filter(Boolean)).size}
          </span>
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
                <span className="detalle-valor">{new Date(showDetalles.fecha).toLocaleString('es-PE')}</span>
              </div>
              <div className="detalle-row">
                <span className="detalle-label">Proveedor:</span>
                <span className="detalle-valor">{showDetalles.proveedorCliente || 'No especificado'}</span>
              </div>
              <div className="detalle-row">
                <span className="detalle-label">Producto:</span>
                <span className="detalle-valor">{showDetalles.productoNombre}</span>
              </div>
              <div className="detalle-row">
                <span className="detalle-label">Cantidad:</span>
                <span className="detalle-valor">{showDetalles.cantidad} unidades</span>
              </div>
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