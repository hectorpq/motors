import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const [facturas, setFacturas] = useState([
    {
      id: 1,
      numeroFactura: 'F001-00123',
      proveedor: 'Repuestos Honda Perú SAC',
      sede: 'deybimotors',
      fecha: '2025-01-15',
      total: 5420.00,
      estado: 'Completada',
      productos: 12,
      archivo: 'factura_001.pdf'
    },
    {
      id: 2,
      numeroFactura: 'F002-00456',
      proveedor: 'Toyota Parts SAC',
      sede: 'deybiparts',
      fecha: '2025-01-18',
      total: 8750.50,
      estado: 'En Camino',
      productos: 25,
      archivo: null
    },
    {
      id: 3,
      numeroFactura: 'F001-00124',
      proveedor: 'Repuestos Honda Perú SAC',
      sede: 'debiauto',
      fecha: '2025-01-20',
      total: 3200.00,
      estado: 'Registrada',
      productos: 8,
      archivo: 'factura_003.pdf'
    }
  ]);

  const sedes = [
    { id: 'todas', nombre: '🌐 Todas las Sedes' },
    { id: 'deybimotors', nombre: '🏢 Deybimotors' },
    { id: 'deybiparts', nombre: '🔧 Deybi Parts' },
    { id: 'debiauto', nombre: '🚗 Deybi Auto' }
  ];

  const estados = [
    { id: 'registrada', nombre: 'Registrada', color: '#e74c3c', icono: '📋' },
    { id: 'encamino', nombre: 'En Camino', color: '#f39c12', icono: '🚚' },
    { id: 'completada', nombre: 'Completada', color: '#27ae60', icono: '✅' }
  ];

  const toggleSeleccionFactura = (id) => {
    setFacturasSeleccionadas(prev => 
      prev.includes(id) 
        ? prev.filter(fid => fid !== id)
        : [...prev, id]
    );
  };

  const seleccionarTodas = () => {
    if (facturasSeleccionadas.length === facturasFiltradas.length) {
      setFacturasSeleccionadas([]);
    } else {
      setFacturasSeleccionadas(facturasFiltradas.map(f => f.id));
    }
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

  const confirmarCambioEstado = () => {
    setFacturas(facturas.map(f => 
      f.id === facturaActual.id 
        ? { ...f, estado: nuevoEstado }
        : f
    ));

    if (nuevoEstado === 'Completada') {
      alert('✅ Estado actualizado a "Completada"\n\n📦 Stock actualizado automáticamente\n🏷️ Ahora puedes generar etiquetas');
    } else {
      alert(`Estado actualizado a "${nuevoEstado}" correctamente`);
    }

    setModalCambiarEstado(false);
    setFacturaActual(null);
    setNuevoEstado('');
  };

  const verFactura = (factura) => {
    setFacturaActual(factura);
    setModalVer(true);
  };

  const editarFactura = (factura) => {
    alert(`Redirigiendo a editar factura ${factura.numeroFactura}...`);
    // navigate(`/compras/editar/${factura.id}`);
  };

  const imprimirEtiquetas = (factura) => {
    if (factura.estado !== 'Completada') {
      alert('⚠️ Solo puedes generar etiquetas para compras completadas');
      return;
    }
    alert(`Generando etiquetas para ${factura.productos} productos de la factura ${factura.numeroFactura}...`);
    // navigate('/etiquetas', { state: { facturaId: factura.id } });
  };

  const abrirModalEliminar = (factura) => {
    setFacturaActual(factura);
    setMotivoEliminacion('');
    setModalEliminar(true);
  };

  const confirmarEliminacion = () => {
    if (!motivoEliminacion.trim()) {
      alert('Debes ingresar un motivo para eliminar');
      return;
    }

    console.log('Eliminando factura:', {
      factura: facturaActual,
      motivo: motivoEliminacion
    });

    setFacturas(facturas.filter(f => f.id !== facturaActual.id));
    alert('Factura eliminada correctamente');
    setModalEliminar(false);
    setFacturaActual(null);
    setMotivoEliminacion('');
  };

  const exportarSeleccionadas = () => {
    if (facturasSeleccionadas.length === 0) {
      alert('Selecciona al menos una factura para exportar');
      return;
    }

    const facturasAExportar = facturas.filter(f => facturasSeleccionadas.includes(f.id));
    console.log('Exportando facturas:', facturasAExportar);
    alert(`Exportando ${facturasSeleccionadas.length} facturas a Excel...`);
    // Aquí iría la lógica de exportación real
  };

  const facturasFiltradas = facturas.filter(f => {
    const cumpleSede = sedeSeleccionada === 'todas' || f.sede === sedeSeleccionada;
    const cumpleEstado = filtroEstado === 'todas' || 
      (filtroEstado === 'registrada' && f.estado === 'Registrada') ||
      (filtroEstado === 'encamino' && f.estado === 'En Camino') ||
      (filtroEstado === 'completada' && f.estado === 'Completada');
    const cumpleBusqueda = f.numeroFactura.toLowerCase().includes(busqueda.toLowerCase()) ||
                          f.proveedor.toLowerCase().includes(busqueda.toLowerCase());
    
    return cumpleSede && cumpleEstado && cumpleBusqueda;
  });

  const calcularEstadisticas = () => {
    return {
      total: facturas.length,
      completadas: facturas.filter(f => f.estado === 'Completada').length,
      pendiente: facturas.filter(f => f.estado !== 'Completada').reduce((sum, f) => sum + f.total, 0),
      totalGeneral: facturas.reduce((sum, f) => sum + f.total, 0)
    };
  };

  const stats = calcularEstadisticas();

  const getEstadoClase = (estado) => {
    switch(estado) {
      case 'Registrada': return 'registrada';
      case 'En Camino': return 'encamino';
      case 'Completada': return 'completada';
      default: return '';
    }
  };

  const getSedeNombre = (sedeId) => {
    return sedes.find(s => s.id === sedeId)?.nombre || sedeId;
  };

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
            <span className="stat-numero">S/ {stats.pendiente.toFixed(2)}</span>
            <span className="stat-label">Monto Pendiente</span>
          </div>
        </div>
        <div className="stat-card-factura">
          <div className="stat-icono">💰</div>
          <div className="stat-datos">
            <span className="stat-numero">S/ {stats.totalGeneral.toFixed(2)}</span>
            <span className="stat-label">Total General</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-facturas">
        <div className="filtros-principales">
          <select
            value={sedeSeleccionada}
            onChange={(e) => setSedeSeleccionada(e.target.value)}
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
                  <strong>{factura.numeroFactura}</strong>
                  {factura.archivo && (
                    <span className="badge-archivo" title="Tiene archivo adjunto">
                      📎
                    </span>
                  )}
                </td>
                <td>{factura.proveedor}</td>
                <td>{getSedeNombre(factura.sede)}</td>
                <td>{factura.fecha}</td>
                <td>{factura.productos}</td>
                <td><strong>S/ {factura.total.toFixed(2)}</strong></td>
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
                          onClick={() => cambiarEstado(factura, 'Registrada')}
                        >
                          📋 Registrada
                        </button>
                        <button
                          className="menu-estado-item encamino"
                          onClick={() => cambiarEstado(factura, 'En Camino')}
                        >
                          🚚 En Camino
                        </button>
                        <button
                          className="menu-estado-item completada"
                          onClick={() => cambiarEstado(factura, 'Completada')}
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
                    <button
                      className="btn-accion-factura editar"
                      onClick={() => editarFactura(factura)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    {factura.estado === 'Completada' && (
                      <button
                        className="btn-accion-factura imprimir"
                        onClick={() => imprimirEtiquetas(factura)}
                        title="Imprimir etiquetas"
                      >
                        🏷️
                      </button>
                    )}
                    <button
                      className="btn-accion-factura eliminar"
                      onClick={() => abrirModalEliminar(factura)}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
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
                <p><strong>Proveedor:</strong> {facturaActual.proveedor}</p>
                <p><strong>Total:</strong> S/ {facturaActual.total.toFixed(2)}</p>
              </div>

              {nuevoEstado === 'Completada' && (
                <div className="alert-importante">
                  <strong>⚠️ Importante:</strong> Al cambiar a "Completada", se actualizará automáticamente el stock de todos los productos de esta compra.
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
                <p><strong>Proveedor:</strong> {facturaActual.proveedor}</p>
                <p><strong>Total:</strong> S/ {facturaActual.total.toFixed(2)}</p>
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

      {/* Modal Ver Detalles */}
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
                  <span>{facturaActual.proveedor}</span>
                </div>
                <div className="detalle-item">
                  <label>Sede:</label>
                  <span>{getSedeNombre(facturaActual.sede)}</span>
                </div>
                <div className="detalle-item">
                  <label>Fecha:</label>
                  <span>{facturaActual.fecha}</span>
                </div>
                <div className="detalle-item">
                  <label>Total Productos:</label>
                  <span>{facturaActual.productos}</span>
                </div>
                <div className="detalle-item">
                  <label>Monto Total:</label>
                  <span className="monto-total">S/ {facturaActual.total.toFixed(2)}</span>
                </div>
                <div className="detalle-item">
                  <label>Estado:</label>
                  <span className={`badge-estado ${getEstadoClase(facturaActual.estado)}`}>
                    {facturaActual.estado}
                  </span>
                </div>
                {facturaActual.archivo && (
                  <div className="detalle-item">
                    <label>Archivo Adjunto:</label>
                    <a href="#" className="link-archivo">
                      📎 {facturaActual.archivo}
                    </a>
                  </div>
                )}
              </div>

              <div className="nota-productos">
                <p>💡 Para ver el detalle completo de los productos, haz clic en el botón "Editar"</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalVer(false)}>
                Cerrar
              </button>
              <button className="btn-primary" onClick={() => editarFactura(facturaActual)}>
                Editar Factura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Facturas;