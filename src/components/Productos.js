import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProductos, deleteProducto } from '../services/api';

function Productos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [sedeActiva, setSedeActiva] = useState('Todas las Sedes');
  const [filtroStock, setFiltroStock] = useState('Todos los stocks');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas las categorias');
  const [filtroSubcategoria, setFiltroSubcategoria] = useState('Todas las subcategorias');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);

  const sedes = [
    { id: 'todas', nombre: 'Todas las Sedes', icon: '🌐' },
    { id: 'deybimotors', nombre: 'Deybimotors', icon: '🏢' },
    { id: 'deybi-parts', nombre: 'Deybi Parts', icon: '🔧' },
    { id: 'deybi-auto', nombre: 'Deybi Auto', icon: '🚗' }
  ];

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const response = await getProductos();
      setProductos(response.data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setProductos([
        {
          id: 1,
          sede: 'Deybimotors',
          codigo: 'DM-001',
          nombre: 'Pastillas de Freno Delanteras',
          marca: 'Brembo',
          marcaAuto: 'Toyota',
          modelo: 'Corolla',
          stock: 45,
          stockMinimo: 10,
          precioCompra: 85.00,
          precio: 120.00,
          categoria: 'Frenos'
        },
        {
          id: 2,
          sede: 'Deybi Parts',
          codigo: 'DP-002',
          nombre: 'Filtro de Aceite',
          marca: 'Filtron',
          marcaAuto: 'Honda',
          modelo: 'Civic',
          stock: 8,
          stockMinimo: 15,
          precioCompra: 20.00,
          precio: 35.00,
          categoria: 'Motor'
        },
        {
          id: 3,
          sede: 'Deybi Auto',
          codigo: 'DA-003',
          nombre: 'Amortiguador Trasero',
          marca: 'Monroe',
          marcaAuto: 'Nissan',
          modelo: 'Sentra',
          stock: 0,
          stockMinimo: 5,
          precioCompra: 180.00,
          precio: 280.00,
          categoria: 'Suspensión'
        },
        {
          id: 4,
          sede: 'Deybimotors',
          codigo: 'DM-004',
          nombre: 'Juego de Cables de Bujía',
          marca: 'Bosch',
          marcaAuto: 'Volkswagen',
          modelo: 'Gol',
          stock: 28,
          stockMinimo: 10,
          precioCompra: 45.00,
          precio: 75.00,
          categoria: 'Eléctrico'
        },
        {
          id: 5,
          sede: 'Deybi Parts',
          codigo: 'DP-005',
          nombre: 'Batería 12V 60Ah',
          marca: 'AC Delco',
          marcaAuto: 'Chevrolet',
          modelo: 'Aveo',
          stock: 15,
          stockMinimo: 5,
          precioCompra: 320.00,
          precio: 450.00,
          categoria: 'Eléctrico'
        },
        {
          id: 6,
          sede: 'Deybi Auto',
          codigo: 'DA-006',
          nombre: 'Kit de Distribución',
          marca: 'Gates',
          marcaAuto: 'Mazda',
          modelo: 'Mazda 3',
          stock: 3,
          stockMinimo: 10,
          precioCompra: 280.00,
          precio: 420.00,
          categoria: 'Motor'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const productosFiltrados = productos.filter(p => {
    const matchSede = sedeActiva === 'Todas las Sedes' || p.sede === sedeActiva;
    const matchBusqueda = 
      p.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.marca?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.marcaAuto?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.modelo?.toLowerCase().includes(busqueda.toLowerCase());
    
    const matchCategoria = filtroCategoria === 'Todas las categorias' || p.categoria === filtroCategoria;
    
    let matchStock = true;
    if (filtroStock === 'En Stock') matchStock = p.stock > (p.stockMinimo || 10);
    if (filtroStock === 'Stock Bajo') matchStock = p.stock > 0 && p.stock <= (p.stockMinimo || 10);
    if (filtroStock === 'Sin Stock') matchStock = p.stock === 0;
    
    return matchSede && matchBusqueda && matchCategoria && matchStock;
  });

  const getEstado = (producto) => {
    const stockMin = producto.stockMinimo || 10;
    if (producto.stock === 0) return { texto: 'Sin Stock', color: '#fee2e2', textColor: '#991b1b' };
    if (producto.stock <= stockMin) return { texto: 'Stock Bajo', color: '#fef3c7', textColor: '#92400e' };
    return { texto: 'En Stock', color: '#d1fae5', textColor: '#065f46' };
  };

  const getSedeColor = (sede) => {
    const colores = {
      'Deybimotors': { bg: '#dbeafe', text: '#1e40af' },
      'Deybi Parts': { bg: '#fed7aa', text: '#c2410c' },
      'Deybi Auto': { bg: '#d1fae5', text: '#065f46' }
    };
    return colores[sede] || { bg: '#f3f4f6', text: '#374151' };
  };

  const confirmarEliminar = (producto) => {
    setProductoAEliminar(producto);
    setMostrarModal(true);
  };

  const eliminarProducto = async () => {
    try {
      await deleteProducto(productoAEliminar.id);
      setProductos(productos.filter(p => p.id !== productoAEliminar.id));
      setMostrarModal(false);
      setProductoAEliminar(null);
      alert('✅ Producto eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('❌ Error al eliminar el producto');
    }
  };

  const exportarExcel = () => {
    alert('📊 Exportando a Excel...');
  };

  const exportarPDF = () => {
    alert('📄 Exportando a PDF...');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ width: '64px', height: '64px', border: '4px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }}></div>
        <p style={{ fontSize: '16px', color: '#6b7280' }}>Cargando productos...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: '0' }}>Productos - Gestión</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px', color: '#8b5cf6' }}>👤</span>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: '0' }}>Admin</p>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>Administrador</p>
          </div>
        </div>
      </div>

      {/* Sedes - GRANDES Y BONITAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {sedes.map((sede) => (
          <button
            key={sede.id}
            onClick={() => setSedeActiva(sede.nombre)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '20px 24px',
              fontSize: '16px',
              fontWeight: '600',
              border: sedeActiva === sede.nombre ? '2px solid #6366f1' : '2px solid #e5e7eb',
              borderRadius: '12px',
              background: sedeActiva === sede.nombre ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'white',
              color: sedeActiva === sede.nombre ? 'white' : '#374151',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: sedeActiva === sede.nombre ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
            }}
          >
            <span style={{ fontSize: '22px' }}>{sede.icon}</span>
            {sede.nombre}
          </button>
        ))}
      </div>

      {/* Búsqueda y Filtros */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: '1', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px' }}>🔍</span>
            <input
              type="text"
              placeholder="Buscar por cualquier campo: código, marca, modelo, descripción..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ width: '100%', padding: '14px 16px 14px 48px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
            />
          </div>
          <button style={{ padding: '14px 20px', border: 'none', borderRadius: '8px', fontSize: '18px', backgroundColor: '#6366f1', color: 'white', cursor: 'pointer' }}>🔍</button>
          <button style={{ padding: '14px 20px', border: 'none', borderRadius: '8px', fontSize: '18px', backgroundColor: '#f3f4f6', cursor: 'pointer' }}>📊</button>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <select value={filtroStock} onChange={(e) => setFiltroStock(e.target.value)} style={{ flex: '1', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
            <option>Todos los stocks</option>
            <option>En Stock</option>
            <option>Stock Bajo</option>
            <option>Sin Stock</option>
          </select>
          
          <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} style={{ flex: '1', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
            <option>Todas las categorias</option>
            <option>Motor</option>
            <option>Frenos</option>
            <option>Suspensión</option>
            <option>Eléctrico</option>
            <option>Transmisión</option>
          </select>
          
          <select value={filtroSubcategoria} onChange={(e) => setFiltroSubcategoria(e.target.value)} style={{ flex: '1', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
            <option>Todas las subcategorias</option>
            <option>Filtros</option>
            <option>Pastillas</option>
            <option>Bujías</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#374151' }}>Ver Ficha</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#374151' }}>Sede</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#374151' }}>Código Interno</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#374151' }}>Marca Producto</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#374151' }}>Marca Auto</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#374151' }}>Modelo</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#374151' }}>Descripción</th>
              <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#374151' }}>Stock</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#374151' }}>P.C.</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#374151' }}>P.V.</th>
              <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#374151' }}>Estado</th>
              <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#374151' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map((producto) => {
              const estado = getEstado(producto);
              const sedeColor = getSedeColor(producto.sede);
              
              return (
                <tr key={producto.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '16px' }}>
                    <Link to={`/productos/${producto.id}`} style={{ textDecoration: 'none' }}>
                      <button style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                        📋 Ver Ficha
                      </button>
                    </Link>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ display: 'inline-block', padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', backgroundColor: sedeColor.bg, color: sedeColor.text }}>
                      {producto.sede}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontWeight: '600', color: '#111827' }}>{producto.codigo}</td>
                  <td style={{ padding: '16px', color: '#1f2937' }}>{producto.marca}</td>
                  <td style={{ padding: '16px', color: '#1f2937' }}>{producto.marcaAuto}</td>
                  <td style={{ padding: '16px', color: '#1f2937' }}>{producto.modelo}</td>
                  <td style={{ padding: '16px', color: '#1f2937' }}>{producto.nombre}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{ fontWeight: '700', fontSize: '15px', color: producto.stock === 0 ? '#dc2626' : producto.stock <= (producto.stockMinimo || 10) ? '#f59e0b' : '#111827' }}>
                      {producto.stock}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: '#1f2937' }}>S/ {producto.precioCompra?.toFixed(2) || '0.00'}</td>
                  <td style={{ padding: '16px', color: '#1f2937' }}>S/ {producto.precio?.toFixed(2) || '0.00'}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{ display: 'inline-block', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', backgroundColor: estado.color, color: estado.textColor }}>
                      {estado.texto}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Link to={`/productos/${producto.id}`} style={{ padding: '8px', fontSize: '18px', textDecoration: 'none', cursor: 'pointer' }} title="Ver detalles">👁️</Link>
                      <Link to={`/productos/editar/${producto.id}`} style={{ padding: '8px', fontSize: '18px', textDecoration: 'none', cursor: 'pointer' }} title="Editar">✏️</Link>
                      <button onClick={() => confirmarEliminar(producto)} style={{ padding: '8px', fontSize: '18px', border: 'none', background: 'none', cursor: 'pointer' }} title="Eliminar">🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {productosFiltrados.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <span style={{ fontSize: '64px', display: 'block', marginBottom: '16px' }}>📦</span>
            <p style={{ fontSize: '18px', fontWeight: '600', color: '#6b7280', margin: '0 0 8px 0' }}>No se encontraron productos</p>
            <small style={{ fontSize: '14px', color: '#9ca3af' }}>Intenta con otros términos de búsqueda</small>
          </div>
        )}
      </div>

      {/* Botones Exportar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button onClick={exportarExcel} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', color: 'white', backgroundColor: '#10b981', cursor: 'pointer' }}>
          <span>📊</span>
          Exportar a Excel
        </button>
        <button onClick={exportarPDF} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', color: 'white', backgroundColor: '#10b981', cursor: 'pointer' }}>
          <span>📄</span>
          Exportar a PDF
        </button>
      </div>

      {/* Modal */}
      {mostrarModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setMostrarModal(false)}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', maxWidth: '480px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: '0 0 12px 0' }}>⚠️ Confirmar Eliminación</h3>
            <p style={{ fontSize: '15px', color: '#6b7280', margin: '0 0 20px 0' }}>¿Estás seguro de eliminar este producto?</p>
            {productoAEliminar && (
              <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                <strong style={{ display: 'block', fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>{productoAEliminar.codigo}</strong>
                <span style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '4px' }}>{productoAEliminar.nombre}</span>
                <small style={{ display: 'block', fontSize: '12px', color: '#6b7280' }}>{productoAEliminar.marca} - {productoAEliminar.marcaAuto} {productoAEliminar.modelo}</small>
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setMostrarModal(false)} style={{ flex: 1, padding: '12px 24px', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', backgroundColor: '#f3f4f6', color: '#374151', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={eliminarProducto} style={{ flex: 1, padding: '12px 24px', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', backgroundColor: '#dc2626', color: 'white', cursor: 'pointer' }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Productos;