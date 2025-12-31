import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCompras,
  getComprasPorSede,
  getComprasPorEstado,
  getCompra,
  actualizarEstadoCompra,
  deleteCompra,
  generarEtiquetasCompra
} from '../services/api';
import './Facturas.css';

function Facturas() {
  const navigate = useNavigate();
  const [sedeSeleccionada, setSedeSeleccionada] = useState('todas');
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [facturasSeleccionadas, setFacturasSeleccionadas] = useState([]);
  const [menuEstadoAbierto, setMenuEstadoAbierto] = useState(null);
  const [modalCambiarEstado, setModalCambiarEstado] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [modalVer, setModalVer] = useState(false);
  const [facturaActual, setFacturaActual] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [motivoEliminacion, setMotivoEliminacion] = useState('');
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);

  const sedes = [
    { id: 'todas', nombre: '🌐 Todas las Sedes' },
    { id: 1, nombre: '🏢 Deybimotors' },
    { id: 2, nombre: '🔧 Deybi Parts' },
    { id: 3, nombre: '🚗 Deybi Auto' }
  ];

  const estados = [
    { id: 'PENDIENTE', nombre: 'Pendiente', color: '#e74c3c', icono: '📋' },
    { id: 'RECIBIDA', nombre: 'Recibida', color: '#f39c12', icono: '🚚' },
    { id: 'COMPLETADA', nombre: 'Completada', color: '#27ae60', icono: '✅' }
  ];

  useEffect(() => {
    cargarFacturas();
  }, [sedeSeleccionada, filtroEstado]);

  const cargarFacturas = async () => {
    try {
      setLoading(true);
      let response;

      if (filtroEstado !== 'todas') {
        response = await getComprasPorEstado(filtroEstado);
      } else if (sedeSeleccionada !== 'todas') {
        response = await getComprasPorSede(sedeSeleccionada);
      } else {
        response = await getCompras();
      }

      setFacturas(response.data || []);
    } catch (error) {
      console.error('Error al cargar facturas:', error);
      setFacturas([]);
      alert('Error al cargar las facturas');
    } finally {
      setLoading(false);
    }
  };

  const toggleSeleccionFactura = (id) => {
    setFacturasSeleccionadas(prev => 
      prev.includes(id) 
        ? prev.filter(fid => fid !== id)
        : [...prev, id]
    );
  };

  const abrirMenuEstado = (factura) => {
    setMenuEstadoAbierto(menuEstadoAbierto === factura.id ? null : factura.id);
  };

  const cambiarEstado = (factura, estado) => {
    setFacturaActual(factura);
    setNuevoEstado(estado);
    setMenuEstadoAbierto(null);
    setModalCambiarEstado(true);
  };

  const confirmarCambioEstado = async () => {
    try {
      await actualizarEstadoCompra(facturaActual.id, {
        nuevoEstado: nuevoEstado
      });

      if (nuevoEstado === 'RECIBIDA') {
        alert('✅ Estado actualizado a "RECIBIDA"\n\n📦 Stock actualizado automáticamente\n🏷️ Ahora puedes generar etiquetas');
      } else {
        alert(`✅ Estado actualizado a "${nuevoEstado}" correctamente`);
      }

      setModalCambiarEstado(false);
      setFacturaActual(null);
      setNuevoEstado('');
      cargarFacturas();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('❌ Error al cambiar el estado de la compra');
    }
  };

  const verFactura = async (factura) => {
    try {
      const response = await getCompra(factura.id);
      setFacturaActual(response.data);
      setModalVer(true);
    } catch (error) {
      console.error('Error al cargar detalles:', error);
      alert('Error al cargar los detalles de la compra');
    }
  };

  const editarFactura = (factura) => {
    alert(`Redirigiendo a editar factura ${factura.numeroFactura}...`);
  };

  const imprimirEtiquetas = async (factura) => {
    if (factura.estado !== 'RECIBIDA' && factura.estado !== 'COMPLETADA') {
      alert('⚠️ Solo puedes generar etiquetas para compras recibidas o completadas');
      return;
    }

    try {
      const response = await generarEtiquetasCompra(factura.id);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `etiquetas-compra-${factura.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      alert('✅ Etiquetas generadas correctamente');
    } catch (error) {
      console.error('Error al generar etiquetas:', error);
      alert('❌ Error al generar las etiquetas');
    }
  };

  const abrirModalEliminar = (factura) => {
    setFacturaActual(factura);
    setMotivoEliminacion('');
    setModalEliminar(true);
  };

  const confirmarEliminacion = async () => {
    if (!motivoEliminacion.trim()) {
      alert('Debes ingresar un motivo para eliminar');
      return;
    }

    try {
      await deleteCompra(facturaActual.id);
      alert('✅ Compra eliminada correctamente');
      setModalEliminar(false);
      setFacturaActual(null);
      setMotivoEliminacion('');
      cargarFacturas();
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('❌ Error al eliminar la compra. Solo se pueden eliminar compras en estado PENDIENTE.');
    }
  };

  const exportarSeleccionadas = () => {
    if (facturasSeleccionadas.length === 0) {
      alert('Selecciona al menos una factura para exportar');
      return;
    }
    alert(`📊 Exportando ${facturasSeleccionadas.length} facturas a Excel...`);
  };

  // 🔧 FIX: Protección contra undefined en el filtro
  const facturasFiltradas = facturas.filter(f => {
    const cumpleSede = sedeSeleccionada === 'todas' || f.sede?.id === sedeSeleccionada;
    const cumpleEstado = filtroEstado === 'todas' || f.estado === filtroEstado;
    
    // Proteger contra undefined/null
    const numFactura = (f.numeroFactura || '').toLowerCase();
    const nombreProveedor = (f.proveedor?.nombre || '').toLowerCase();
    const busquedaLower = (busqueda || '').toLowerCase();
    
    const cumpleBusqueda = numFactura.includes(busquedaLower) ||
                          nombreProveedor.includes(busquedaLower);
    
    return cumpleSede && cumpleEstado && cumpleBusqueda;
  });

  const seleccionarTodas = () => {
    if (facturasSeleccionadas.length === facturasFiltradas.length && facturasFiltradas.length > 0) {
      setFacturasSeleccionadas([]);
    } else {
      setFacturasSeleccionadas(facturasFiltradas.map(f => f.id));
    }
  };

  const calcularEstadisticas = () => {
    const completadas = facturas.filter(f => f.estado === 'COMPLETADA' || f.estado === 'RECIBIDA');
    const pendientes = facturas.filter(f => f.estado === 'PENDIENTE');
    
    return {
      total: facturas.length,
      completadas: completadas.length,
      pendiente: pendientes.reduce((sum, f) => sum + calcularTotal(f), 0),
      totalGeneral: facturas.reduce((sum, f) => sum + calcularTotal(f), 0)
    };
  };

  const calcularTotal = (compra) => {
    if (compra.items && Array.isArray(compra.items)) {
      return compra.items.reduce((sum, item) => 
        sum + (item.cantidad * item.precioCompra), 0
      );
    }
    return compra.total || 0;
  };

  const stats = calcularEstadisticas();

  const getEstadoClase = (estado) => {
    switch(estado) {
      case 'PENDIENTE': return 'registrada';
      case 'RECIBIDA': return 'encamino';
      case 'COMPLETADA': return 'completada';
      default: return '';
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
    return new Date(fecha).toLocaleDateString('es-PE');
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Cargando facturas...</p>
      </div>
    );
  }

  return (
    <div className="facturas-container">
      {/* Header */}
      <div className="facturas-header">
        <div className="header-titulo-facturas">
          <h1>📑 Historial de Compras</h1>
          <p>Visualiza y gestiona todas las facturas de compras</p>
        </div>
        <button className="btn-nueva-compra" onClick={() => navigate('/compras/registro')}>
          ➕ Nueva Compra
        </button>
      </div>

      {/* Estadísticas */}
      <div className="estadisticas-facturas">
        <div className="stat-card-factura">
          <div className="stat-icono">📊</div>
          <div className="stat-datos">
            <span className="stat-numero">{stats.total}</span>
            <span className="stat-label">Total Facturas</span>
          </div>
        </div>
        <div className="stat-card-factura">
          <div className="stat-icono">✅</div>
          <div className="stat-datos">
            <span className="stat-numero">{stats.completadas}</span>
            <span className="stat-label">Completadas</span>
          </div>
        </div>
        <div className="stat-card-factura">
          <div className="stat-icono">⏳</div>
          <div className="stat-datos">
            <span className="stat-numero">{formatearMoneda(stats.pendiente)}</span>
            <span className="stat-label">Monto Pendiente</span>
          </div>
        </div>
        <div className="stat-card-factura">
          <div className="stat-icono">💰</div>
          <div className="stat-datos">
            <span className="stat-numero">{formatearMoneda(stats.totalGeneral)}</span>
            <span className="stat-label">Total General</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-facturas">
        <div className="filtros-principales">
          <select
            value={sedeSeleccionada}
            onChange={(e) => setSedeSeleccionada(e.target.value === 'todas' ? 'todas' : Number(e.target.value))}
            className="select-filtro-factura"
          >
            {sedes.map(sede => (
              <option key={sede.id} value={sede.id}>{sede.nombre}</option>
            ))}
          </select>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="select-filtro-factura"
          >
            <option value="todas">📋 Todos los Estados</option>
            {estados.map(estado => (
              <option key={estado.id} value={estado.id}>
                {estado.icono} {estado.nombre}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="🔍 Buscar por número de factura o proveedor..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-busqueda-factura"
          />
        </div>

        {facturasSeleccionadas.length > 0 && (
          <div className="acciones-seleccionadas">
            <span>{facturasSeleccionadas.length} seleccionadas</span>
            <button className="btn-exportar" onClick={exportarSeleccionadas}>
              📤 Exportar Seleccionadas
            </button>
          </div>
        )}
      </div>

      {/* Tabla de Facturas */}
      <div className="tabla-facturas-container">
        <table className="tabla-facturas">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={facturasSeleccionadas.length === facturasFiltradas.length && facturasFiltradas.length > 0}
                  onChange={seleccionarTodas}
                />
              </th>
              <th>N° Factura</th>
              <th>Proveedor</th>
              <th>Sede</th>
              <th>Fecha</th>
              <th>Productos</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {facturasFiltradas.map(factura => (
              <tr key={factura.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={facturasSeleccionadas.includes(factura.id)}
                    onChange={() => toggleSeleccionFactura(factura.id)}
                  />
                </td>
                <td>
                  <strong>{factura.numeroFactura || 'N/A'}</strong>
                  {factura.rutaFactura && (
                    <span className="badge-archivo" title="Tiene archivo adjunto">
                      📎
                    </span>
                  )}
                </td>
                <td>{factura.proveedor?.nombre || 'N/A'}</td>
                <td>{factura.sede?.nombre || 'N/A'}</td>
                <td>{formatearFecha(factura.fechaCompra)}</td>
                <td>{factura.items?.length || 0}</td>
                <td><strong>{formatearMoneda(calcularTotal(factura))}</strong></td>
                <td>
                  <div className="estado-container">
                    <span className={`badge-estado ${getEstadoClase(factura.estado)}`}>
                      {factura.estado}
                    </span>
                    <button
                      className="btn-menu-estado"
                      onClick={() => abrirMenuEstado(factura)}
                    >
                      ⋮
                    </button>
                    {menuEstadoAbierto === factura.id && (
                      <div className="menu-estado">
                        <button
                          className="menu-estado-item registrada"
                          onClick={() => cambiarEstado(factura, 'PENDIENTE')}
                        >
                          📋 Pendiente
                        </button>
                        <button
                          className="menu-estado-item encamino"
                          onClick={() => cambiarEstado(factura, 'RECIBIDA')}
                        >
                          🚚 Recibida
                        </button>
                        <button
                          className="menu-estado-item completada"
                          onClick={() => cambiarEstado(factura, 'COMPLETADA')}
                        >
                          ✅ Completada
                        </button>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="acciones-factura">
                    <button
                      className="btn-accion-factura ver"
                      onClick={() => verFactura(factura)}
                      title="Ver detalles"
                    >
                      👁️
                    </button>
                    {(factura.estado === 'RECIBIDA' || factura.estado === 'COMPLETADA') && (
                      <button
                        className="btn-accion-factura imprimir"
                        onClick={() => imprimirEtiquetas(factura)}
                        title="Imprimir etiquetas"
                      >
                        🏷️
                      </button>
                    )}
                    {factura.estado === 'PENDIENTE' && (
                      <button
                        className="btn-accion-factura eliminar"
                        onClick={() => abrirModalEliminar(factura)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {facturasFiltradas.length === 0 && (
          <div className="empty-state-facturas">
            <span className="empty-icon">📭</span>
            <p>No se encontraron facturas</p>
            <small>Intenta ajustar los filtros o registra una nueva compra</small>
          </div>
        )}
      </div>

      {/* Modal Cambiar Estado */}
      {modalCambiarEstado && facturaActual && (
        <div className="modal-overlay" onClick={() => setModalCambiarEstado(false)}>
          <div className="modal-estado" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔄 Cambiar Estado de Compra</h3>
              <button className="btn-cerrar" onClick={() => setModalCambiarEstado(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="cambio-estado-info">
                <div className="estado-actual">
                  <span>Estado Actual:</span>
                  <span className={`badge-estado ${getEstadoClase(facturaActual.estado)}`}>
                    {facturaActual.estado}
                  </span>
                </div>
                <div className="flecha-cambio">→</div>
                <div className="estado-nuevo">
                  <span>Nuevo Estado:</span>
                  <span className={`badge-estado ${getEstadoClase(nuevoEstado)}`}>
                    {nuevoEstado}
                  </span>
                </div>
              </div>

              <div className="info-factura-modal">
                <p><strong>Factura:</strong> {facturaActual.numeroFactura}</p>
                <p><strong>Proveedor:</strong> {facturaActual.proveedor?.nombre}</p>
                <p><strong>Total:</strong> {formatearMoneda(calcularTotal(facturaActual))}</p>
              </div>

              {nuevoEstado === 'RECIBIDA' && (
                <div className="alert-importante">
                  <strong>⚠️ Importante:</strong> Al cambiar a "RECIBIDA", se actualizará automáticamente el stock de todos los productos de esta compra.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-cancelar" onClick={() => setModalCambiarEstado(false)}>
                Cancelar
              </button>
              <button className="btn-confirmar" onClick={confirmarCambioEstado}>
                Confirmar Cambio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {modalEliminar && facturaActual && (
        <div className="modal-overlay" onClick={() => setModalEliminar(false)}>
          <div className="modal-eliminar" onClick={e => e.stopPropagation()}>
            <div className="modal-header-eliminar">
              <h3>⚠️ Eliminar Factura</h3>
              <button className="btn-cerrar" onClick={() => setModalEliminar(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="alert-peligro">
                <strong>⚠️ Esta acción no se puede deshacer</strong>
                <p>Estás por eliminar la factura:</p>
              </div>

              <div className="info-factura-eliminar">
                <p><strong>N° Factura:</strong> {facturaActual.numeroFactura}</p>
                <p><strong>Proveedor:</strong> {facturaActual.proveedor?.nombre}</p>
                <p><strong>Total:</strong> {formatearMoneda(calcularTotal(facturaActual))}</p>
              </div>

              <div className="form-group">
                <label>Motivo de Eliminación *</label>
                <textarea
                  value={motivoEliminacion}
                  onChange={(e) => setMotivoEliminacion(e.target.value)}
                  placeholder="Indica el motivo por el cual deseas eliminar esta factura..."
                  rows="4"
                  className="textarea-motivo"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancelar" onClick={() => setModalEliminar(false)}>
                Cancelar
              </button>
              <button className="btn-eliminar-confirm" onClick={confirmarEliminacion}>
                Eliminar Factura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ver */}
      {modalVer && facturaActual && (
        <div className="modal-overlay" onClick={() => setModalVer(false)}>
          <div className="modal-ver" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📄 Detalles de la Factura</h3>
              <button className="btn-cerrar" onClick={() => setModalVer(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detalles-factura-grid">
                <div className="detalle-item">
                  <label>N° Factura:</label>
                  <span>{facturaActual.numeroFactura}</span>
                </div>
                <div className="detalle-item">
                  <label>Proveedor:</label>
                  <span>{facturaActual.proveedor?.nombre}</span>
                </div>
                <div className="detalle-item">
                  <label>Sede:</label>
                  <span>{facturaActual.sede?.nombre}</span>
                </div>
                <div className="detalle-item">
                  <label>Fecha:</label>
                  <span>{formatearFecha(facturaActual.fechaCompra)}</span>
                </div>
                <div className="detalle-item">
                  <label>Total Productos:</label>
                  <span>{facturaActual.items?.length || 0}</span>
                </div>
                <div className="detalle-item">
                  <label>Monto Total:</label>
                  <span className="monto-total">{formatearMoneda(calcularTotal(facturaActual))}</span>
                </div>
                <div className="detalle-item">
                  <label>Estado:</label>
                  <span className={`badge-estado ${getEstadoClase(facturaActual.estado)}`}>
                    {facturaActual.estado}
                  </span>
                </div>
                {facturaActual.rutaFactura && (
                  <div className="detalle-item">
                    <label>Archivo Adjunto:</label>
                    <a href={facturaActual.rutaFactura} target="_blank" rel="noopener noreferrer" className="link-archivo">
                      📎 Ver archivo
                    </a>
                  </div>
                )}
              </div>

              {facturaActual.items && facturaActual.items.length > 0 && (
                <div className="productos-detalle">
                  <h4>Productos:</h4>
                  <table className="tabla-productos-modal">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facturaActual.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.producto?.nombre || 'N/A'}</td>
                          <td>{item.cantidad}</td>
                          <td>{formatearMoneda(item.precioCompra)}</td>
                          <td>{formatearMoneda(item.cantidad * item.precioCompra)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalVer(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Facturas;