import React, { useState, useEffect } from 'react';
import { getMovimientosRecientes } from '../services/api';
import './Movimientos.css';

function Movimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarMovimientos();
  }, []);

  const cargarMovimientos = async () => {
    try {
      setLoading(true);
      const response = await getMovimientosRecientes();
      setMovimientos(response.data);
    } catch (error) {
      console.error('Error:', error);
      // Datos de ejemplo
      setMovimientos([
        {
          id: 1,
          fecha: '2024-12-15',
          tipo: 'ENTRADA',
          producto: 'Pastillas de Freno Delanteras',
          codigo: 'DM-001',
          cantidad: 50,
          precio_unitario: 120.00,
          proveedor_cliente: 'Distribuidora Automotriz SAC',
          usuario: 'Admin',
          observaciones: 'Compra de stock mensual'
        },
        {
          id: 2,
          fecha: '2024-12-14',
          tipo: 'SALIDA',
          producto: 'Filtro de Aceite Honda',
          codigo: 'DM-002',
          cantidad: 5,
          precio_unitario: 35.00,
          proveedor_cliente: 'Cliente Regular',
          usuario: 'Admin',
          observaciones: 'Venta mostrador'
        },
        {
          id: 3,
          fecha: '2024-12-13',
          tipo: 'ENTRADA',
          producto: 'Amortiguador Delantero Nissan',
          codigo: 'DM-004',
          cantidad: 20,
          precio_unitario: 280.00,
          proveedor_cliente: 'Toyota Parts Distribution',
          usuario: 'Admin',
          observaciones: null
        },
        {
          id: 4,
          fecha: '2024-12-12',
          tipo: 'SALIDA',
          producto: 'Batería 12V 45Ah',
          codigo: 'DM-005',
          cantidad: 2,
          precio_unitario: 350.00,
          proveedor_cliente: 'Taller Mecánico Express',
          usuario: 'Vendedor1',
          observaciones: 'Venta al por mayor'
        },
        {
          id: 5,
          fecha: '2024-12-11',
          tipo: 'AJUSTE',
          producto: 'Bujías NGK',
          codigo: 'DM-003',
          cantidad: -3,
          precio_unitario: 15.00,
          proveedor_cliente: '-',
          usuario: 'Admin',
          observaciones: 'Ajuste por inventario físico'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const movimientosFiltrados = movimientos.filter(m => {
    const matchTipo = filtroTipo === 'Todos' || m.tipo === filtroTipo;
    const matchBusqueda = 
      m.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.producto.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.proveedor_cliente?.toLowerCase().includes(busqueda.toLowerCase());
    
    let matchFecha = true;
    if (fechaInicio && fechaFin) {
      const fechaMov = new Date(m.fecha);
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      matchFecha = fechaMov >= inicio && fechaMov <= fin;
    }
    
    return matchTipo && matchBusqueda && matchFecha;
  });

  const estadisticas = {
    entradas: movimientos.filter(m => m.tipo === 'ENTRADA').length,
    salidas: movimientos.filter(m => m.tipo === 'SALIDA').length,
    ajustes: movimientos.filter(m => m.tipo === 'AJUSTE').length,
    valorEntradas: movimientos
      .filter(m => m.tipo === 'ENTRADA')
      .reduce((sum, m) => sum + (m.cantidad * m.precio_unitario), 0),
    valorSalidas: movimientos
      .filter(m => m.tipo === 'SALIDA')
      .reduce((sum, m) => sum + (m.cantidad * m.precio_unitario), 0)
  };

  const exportarExcel = () => {
    alert('📊 Exportando movimientos a Excel...');
    // Aquí iría la lógica de exportación
  };

  if (loading) return <div className="loading">⏳ Cargando movimientos...</div>;

  return (
    <div className="movimientos-container">
      {/* Header */}
      <div className="movimientos-header">
        <div>
          <h2>📝 Historial de Movimientos</h2>
          <p className="subtitle">Registro de entradas, salidas y ajustes de inventario</p>
        </div>
        <button className="btn-exportar" onClick={exportarExcel}>
          📊 Exportar Excel
        </button>
      </div>

      {/* Estadísticas */}
      <div className="stats-grid-mov">
        <div className="stat-card-mov entrada">
          <div className="stat-icon-mov">📥</div>
          <div className="stat-info-mov">
            <span className="stat-label-mov">Entradas</span>
            <span className="stat-value-mov">{estadisticas.entradas}</span>
            <span className="stat-monto">S/ {estadisticas.valorEntradas.toFixed(2)}</span>
          </div>
        </div>
        <div className="stat-card-mov salida">
          <div className="stat-icon-mov">📤</div>
          <div className="stat-info-mov">
            <span className="stat-label-mov">Salidas</span>
            <span className="stat-value-mov">{estadisticas.salidas}</span>
            <span className="stat-monto">S/ {estadisticas.valorSalidas.toFixed(2)}</span>
          </div>
        </div>
        <div className="stat-card-mov ajuste">
          <div className="stat-icon-mov">🔧</div>
          <div className="stat-info-mov">
            <span className="stat-label-mov">Ajustes</span>
            <span className="stat-value-mov">{estadisticas.ajustes}</span>
          </div>
        </div>
        <div className="stat-card-mov total">
          <div className="stat-icon-mov">📊</div>
          <div className="stat-info-mov">
            <span className="stat-label-mov">Total Movimientos</span>
            <span className="stat-value-mov">{movimientos.length}</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-movimientos">
        <div className="filtros-tipo">
          {['Todos', 'ENTRADA', 'SALIDA', 'AJUSTE'].map(tipo => (
            <button
              key={tipo}
              className={`filtro-btn-mov ${filtroTipo === tipo ? 'active' : ''}`}
              onClick={() => setFiltroTipo(tipo)}
            >
              {tipo}
            </button>
          ))}
        </div>
        
        <div className="filtros-fecha">
          <div className="fecha-group">
            <label>Desde:</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="fecha-input"
            />
          </div>
          <div className="fecha-group">
            <label>Hasta:</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="fecha-input"
            />
          </div>
        </div>

        <div className="busqueda-mov">
          <input
            type="text"
            placeholder="Buscar por código, producto o proveedor/cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <span className="search-icon-mov">🔍</span>
        </div>
      </div>

      {/* Tabla */}
      <div className="movimientos-table-wrapper">
        <table className="movimientos-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Código</th>
              <th>Producto</th>
              <th className="text-center">Cantidad</th>
              <th>P. Unitario</th>
              <th>Total</th>
              <th>Proveedor/Cliente</th>
              <th>Usuario</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {movimientosFiltrados.map(mov => (
              <tr key={mov.id}>
                <td>{new Date(mov.fecha).toLocaleDateString('es-PE')}</td>
                <td>
                  <span className={`tipo-badge ${mov.tipo.toLowerCase()}`}>
                    {mov.tipo === 'ENTRADA' && '📥 '}
                    {mov.tipo === 'SALIDA' && '📤 '}
                    {mov.tipo === 'AJUSTE' && '🔧 '}
                    {mov.tipo}
                  </span>
                </td>
                <td><span className="codigo-mov">{mov.codigo}</span></td>
                <td><strong>{mov.producto}</strong></td>
                <td className="text-center">
                  <span className={`cantidad-mov ${mov.cantidad < 0 ? 'negativo' : ''}`}>
                    {mov.cantidad > 0 ? '+' : ''}{mov.cantidad}
                  </span>
                </td>
                <td>S/ {mov.precio_unitario.toFixed(2)}</td>
                <td className="total-mov">S/ {(Math.abs(mov.cantidad) * mov.precio_unitario).toFixed(2)}</td>
                <td>{mov.proveedor_cliente || '-'}</td>
                <td><span className="usuario-tag">{mov.usuario}</span></td>
                <td>
                  <span className="observaciones-text">
                    {mov.observaciones || '-'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {movimientosFiltrados.length === 0 && (
          <div className="no-resultados-mov">
            <span className="icon-empty-mov">📋</span>
            <p>No se encontraron movimientos</p>
            <small>Intenta ajustar los filtros de búsqueda</small>
          </div>
        )}
      </div>

      <div className="resultados-info">
        Mostrando {movimientosFiltrados.length} de {movimientos.length} movimientos
      </div>
    </div>
  );
}

export default Movimientos;