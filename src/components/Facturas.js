import React, { useState, useEffect } from 'react';
import './Facturas.css';

const Facturas = () => {
  const [sedeSeleccionada, setSedeSeleccionada] = useState('todas');
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [facturas, setFacturas] = useState([]);
  const [menuAbierto, setMenuAbierto] = useState(null);
  const [modalEstado, setModalEstado] = useState(null);
  const [modalEliminar, setModalEliminar] = useState(null);
  const [motivoEliminacion, setMotivoEliminacion] = useState('');

  const sedes = [
    { id: 'todas', nombre: 'Todas las Sedes', icono: '🌐' },
    { id: 'deybimotors', nombre: 'Deybimotors', icono: '🏢' },
    { id: 'deybiparts', nombre: 'Deybi Parts', icono: '🔧' },
    { id: 'deybiauto', nombre: 'Deybi Auto', icono: '🚗' }
  ];

  const estadosFactura = [
    { id: 'registrada', nombre: 'Registrada', color: '#e74c3c', icono: '📋' },
    { id: 'encamino', nombre: 'En Camino', color: '#f39c12', icono: '🚚' },
    { id: 'completada', nombre: 'Completada', color: '#27ae60', icono: '✅' }
  ];

  useEffect(() => {
    cargarFacturas();
  }, []);

  const cargarFacturas = async () => {
    try {
      const response = await fetch('/api/facturas');
      const data = await response.json();
      setFacturas(data);
    } catch (error) {
      console.error('Error al cargar facturas:', error);
      // Datos de ejemplo
      setFacturas([
        {
          id: 1,
          numero: 'F001-00001',
          proveedor: 'Distribuidora Automotriz SAC',
          fecha: '9/12/2024',
          items: 15,
          total: 4500.00,
          estado: 'completada',
          sede: 'deybimotors'
        },
        {
          id: 2,
          numero: 'F001-00002',
          proveedor: 'Repuestos Honda Perú',
          fecha: '7/12/2024',
          items: 8,
          total: 2850.00,
          estado: 'encamino',
          sede: 'deybiparts'
        },
        {
          id: 3,
          numero: 'F001-00003',
          proveedor: 'Toyota Parts Distribution',
          fecha: '4/12/2024',
          items: 22,
          total: 6720.00,
          estado: 'completada',
          sede: 'deybiauto'
        },
        {
          id: 4,
          numero: 'F001-00004',
          proveedor: 'Importadora de Repuestos SA',
          fecha: '30/11/2024',
          items: 12,
          total: 3200.00,
          estado: 'registrada',
          sede: 'deybimotors'
        }
      ]);
    }
  };

  const facturasFiltradas = facturas.filter(factura => {
    const cumpleSede = sedeSeleccionada === 'todas' || factura.sede === sedeSeleccionada;
    const cumpleEstado = filtroEstado === 'todas' || factura.estado === filtroEstado;
    const cumpleBusqueda = factura.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
                          factura.proveedor.toLowerCase().includes(busqueda.toLowerCase());
    return cumpleSede && cumpleEstado && cumpleBusqueda;
  });

  const calcularEstadisticas = () => {
    const total = facturasFiltradas.length;
    const pagadas = facturasFiltradas.filter(f => f.estado === 'completada').length;
    const pendientes = facturasFiltradas.reduce((sum, f) => 
      f.estado !== 'completada' ? sum + f.total : sum, 0
    );
    const totalGeneral = facturasFiltradas.reduce((sum, f) => sum + f.total, 0);

    return { total, pagadas, pendientes, totalGeneral };
  };

  const stats = calcularEstadisticas();

  const getEstadoInfo = (estado) => {
    return estadosFactura.find(e => e.id === estado);
  };

  const handleCambiarEstado = (factura, nuevoEstado) => {
    setModalEstado({ factura, nuevoEstado });
    setMenuAbierto(null);
  };

  const confirmarCambioEstado = async () => {
    try {
      const response = await fetch(`/api/facturas/${modalEstado.factura.id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: modalEstado.nuevoEstado })
      });

      if (response.ok) {
        setFacturas(facturas.map(f => 
          f.id === modalEstado.factura.id 
            ? { ...f, estado: modalEstado.nuevoEstado }
            : f
        ));
        alert('✅ Estado actualizado correctamente');
        setModalEstado(null);
      } else {
        alert('❌ Error al actualizar el estado');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al actualizar el estado');
    }
  };

  const handleEliminar = (factura) => {
    setModalEliminar(factura);
    setMotivoEliminacion('');
    setMenuAbierto(null);
  };

  const confirmarEliminacion = async () => {
    if (!motivoEliminacion.trim()) {
      alert('⚠️ Por favor ingresa el motivo de eliminación');
      return;
    }

    try {
      const response = await fetch(`/api/facturas/${modalEliminar.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo: motivoEliminacion })
      });

      if (response.ok) {
        setFacturas(facturas.filter(f => f.id !== modalEliminar.id));
        alert('✅ Factura eliminada correctamente');
        setModalEliminar(null);
        setMotivoEliminacion('');
      } else {
        alert('❌ Error al eliminar la factura');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al eliminar la factura');
    }
  };

  const handleVer = (factura) => {
    alert(`Ver detalles de factura: ${factura.numero}`);
    // Aquí puedes abrir un modal con los detalles completos
    setMenuAbierto(null);
  };

  const handleEditar = (factura) => {
    alert(`Editar factura: ${factura.numero}`);
    // Aquí puedes abrir un formulario de edición
    setMenuAbierto(null);
  };

  const handleImprimirEtiquetas = (factura) => {
    alert(`Imprimir etiquetas de factura: ${factura.numero}`);
    // Aquí puedes generar un PDF o abrir ventana de impresión
    setMenuAbierto(null);
  };

  return (
    <div className="facturas-container">
      {/* Header */}
      <div className="facturas-header">
        <div className="header-left">
          <div className="header-icon">📋</div>
          <div>
            <h1>Gestión de Facturas</h1>
            <p className="subtitle">Control de facturas de proveedores</p>
          </div>
        </div>
        <button className="btn-nueva-factura">
          + Nueva Factura
        </button>
      </div>

      {/* Selector de Sedes */}
      <div className="sedes-selector">
        {sedes.map(sede => (
          <div
            key={sede.id}
            className={`sede-card ${sedeSeleccionada === sede.id ? 'active' : ''}`}
            onClick={() => setSedeSeleccionada(sede.id)}
          >
            <span className="sede-icon">{sede.icono}</span>
            <span className="sede-nombre">{sede.nombre}</span>
          </div>
        ))}
      </div>

      {/* Estadísticas */}
      <div className="estadisticas-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Total Facturas</h3>
            <p className="stat-value">{stats.total}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Completadas</h3>
            <p className="stat-value">{stats.pagadas}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pendientes</h3>
            <p className="stat-value">S/ {stats.pendientes.toFixed(2)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total General</h3>
            <p className="stat-value">S/ {stats.totalGeneral.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-section">
        <div className="filtros-tabs">
          <button
            className={`tab ${filtroEstado === 'todas' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('todas')}
          >
            Todas
          </button>
          {estadosFactura.map(estado => (
            <button
              key={estado.id}
              className={`tab ${filtroEstado === estado.id ? 'active' : ''}`}
              onClick={() => setFiltroEstado(estado.id)}
            >
              {estado.nombre}
            </button>
          ))}
        </div>

        <div className="busqueda-input">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por número o proveedor..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla de Facturas */}
      <div className="tabla-container">
        <table className="facturas-table">
          <thead>
            <tr>
              <th>NÚMERO</th>
              <th>PROVEEDOR</th>
              <th>FECHA</th>
              <th>ITEMS</th>
              <th>TOTAL</th>
              <th>ESTADO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {facturasFiltradas.map(factura => {
              const estadoInfo = getEstadoInfo(factura.estado);
              return (
                <tr key={factura.id}>
                  <td className="numero-factura">{factura.numero}</td>
                  <td>{factura.proveedor}</td>
                  <td>{factura.fecha}</td>
                  <td>{factura.items}</td>
                  <td className="total-factura">S/ {factura.total.toFixed(2)}</td>
                  <td>
                    <div className="estado-container">
                      <span
                        className="estado-badge"
                        style={{ backgroundColor: estadoInfo.color }}
                      >
                        {estadoInfo.icono} {estadoInfo.nombre}
                      </span>
                      <button
                        className="btn-menu-estado"
                        onClick={() => setMenuAbierto(menuAbierto === factura.id ? null : factura.id)}
                      >
                        ⋮
                      </button>
                      {menuAbierto === factura.id && (
                        <div className="menu-estado-dropdown">
                          <div className="menu-header">Cambiar Estado</div>
                          {estadosFactura.map(estado => (
                            <button
                              key={estado.id}
                              className="menu-item"
                              onClick={() => handleCambiarEstado(factura, estado.id)}
                              disabled={factura.estado === estado.id}
                            >
                              <span
                                className="menu-color"
                                style={{ backgroundColor: estado.color }}
                              ></span>
                              {estado.icono} {estado.nombre}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="acciones-buttons">
                      <button
                        className="btn-accion ver"
                        onClick={() => handleVer(factura)}
                        title="Ver detalles"
                      >
                        👁️
                      </button>
                      <button
                        className="btn-accion editar"
                        onClick={() => handleEditar(factura)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-accion imprimir"
                        onClick={() => handleImprimirEtiquetas(factura)}
                        title="Imprimir etiquetas"
                      >
                        🖨️
                      </button>
                      <button
                        className="btn-accion eliminar"
                        onClick={() => handleEliminar(factura)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {facturasFiltradas.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <p>No se encontraron facturas</p>
            <span className="empty-hint">Intenta con otros filtros de búsqueda</span>
          </div>
        )}
      </div>

      {/* Modal Cambiar Estado */}
      {modalEstado && (
        <div className="modal-overlay" onClick={() => setModalEstado(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚠️ Confirmar Cambio de Estado</h2>
            </div>
            <div className="modal-body">
              <p>¿Estás seguro de cambiar el estado de esta factura?</p>
              <div className="cambio-estado-info">
                <div className="estado-actual">
                  <span>Estado Actual:</span>
                  <span
                    className="estado-badge"
                    style={{ backgroundColor: getEstadoInfo(modalEstado.factura.estado).color }}
                  >
                    {getEstadoInfo(modalEstado.factura.estado).icono}{' '}
                    {getEstadoInfo(modalEstado.factura.estado).nombre}
                  </span>
                </div>
                <div className="flecha-cambio">➜</div>
                <div className="estado-nuevo">
                  <span>Nuevo Estado:</span>
                  <span
                    className="estado-badge"
                    style={{ backgroundColor: getEstadoInfo(modalEstado.nuevoEstado).color }}
                  >
                    {getEstadoInfo(modalEstado.nuevoEstado).icono}{' '}
                    {getEstadoInfo(modalEstado.nuevoEstado).nombre}
                  </span>
                </div>
              </div>
              <div className="factura-info">
                <p><strong>Factura:</strong> {modalEstado.factura.numero}</p>
                <p><strong>Proveedor:</strong> {modalEstado.factura.proveedor}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-modal-cancelar"
                onClick={() => setModalEstado(null)}
              >
                Cancelar
              </button>
              <button
                className="btn-modal-confirmar"
                onClick={confirmarCambioEstado}
              >
                ✅ Confirmar Cambio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {modalEliminar && (
        <div className="modal-overlay" onClick={() => setModalEliminar(null)}>
          <div className="modal-content modal-eliminar" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🗑️ Eliminar Factura</h2>
            </div>
            <div className="modal-body">
              <div className="warning-box">
                <span className="warning-icon">⚠️</span>
                <p>Esta acción no se puede deshacer</p>
              </div>
              <div className="factura-eliminar-info">
                <p><strong>Factura:</strong> {modalEliminar.numero}</p>
                <p><strong>Proveedor:</strong> {modalEliminar.proveedor}</p>
                <p><strong>Total:</strong> S/ {modalEliminar.total.toFixed(2)}</p>
              </div>
              <div className="form-group">
                <label>Motivo de Eliminación *</label>
                <textarea
                  className="textarea-motivo"
                  placeholder="Ingresa el motivo por el cual deseas eliminar esta factura..."
                  value={motivoEliminacion}
                  onChange={(e) => setMotivoEliminacion(e.target.value)}
                  rows="4"
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-modal-cancelar"
                onClick={() => setModalEliminar(null)}
              >
                Cancelar
              </button>
              <button
                className="btn-modal-eliminar"
                onClick={confirmarEliminacion}
              >
                🗑️ Eliminar Factura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Facturas;