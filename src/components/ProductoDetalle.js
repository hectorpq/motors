import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProducto, getStockProducto } from '../services/api';

function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarProducto();
  }, [id]);

  const cargarProducto = async () => {
    try {
      setLoading(true);
      setError('');

      // Cargar información del producto
      const productoResponse = await getProducto(id);
      setProducto(productoResponse.data);

      // Cargar stock en todas las sedes
      const stockResponse = await getStockProducto(id);
      setStocks(stockResponse.data);

    } catch (error) {
      console.error('Error al cargar producto:', error);
      setError('Error al cargar el producto');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ width: '64px', height: '64px', border: '4px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }}></div>
        <p style={{ fontSize: '16px', color: '#6b7280' }}>Cargando producto...</p>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ background: '#fee', border: '1px solid #fcc', color: '#c33', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <span>⚠️ {error || 'Producto no encontrado'}</span>
        </div>
        <Link to="/productos">
          <button style={{ padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            ← Volver a productos
          </button>
        </Link>
      </div>
    );
  }

  const getStockTotal = () => {
    return stocks.reduce((sum, s) => sum + s.cantidad, 0);
  };

  const getEstado = () => {
    const stockTotal = getStockTotal();
    const stockMin = stocks[0]?.stockMinimo || 10;

    if (stockTotal === 0) return { texto: 'Sin Stock', color: '#fee2e2', textColor: '#991b1b' };
    if (stockTotal <= stockMin) return { texto: 'Stock Bajo', color: '#fef3c7', textColor: '#92400e' };
    return { texto: 'En Stock', color: '#d1fae5', textColor: '#065f46' };
  };

  const estado = getEstado();
  const stockTotal = getStockTotal();
  const margen = producto.precioCompra > 0 
    ? (((producto.precioVenta - producto.precioCompra) / producto.precioCompra) * 100).toFixed(1)
    : 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/productos')} style={{ padding: '10px 20px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
            ← Volver
          </button>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0 }}>Detalle del Producto</h1>
        </div>
        <Link to={`/productos/editar/${producto.id}`}>
          <button style={{ padding: '10px 20px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
            ✏️ Editar Producto
          </button>
        </Link>
      </div>

      {/* Card Principal */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        {/* Header del producto */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '32px', paddingBottom: '24px', borderBottom: '2px solid #e5e7eb' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', margin: 0 }}>{producto.codigo}</h2>
              <span style={{ display: 'inline-block', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', backgroundColor: estado.color, color: estado.textColor }}>
                {estado.texto}
              </span>
            </div>
            <p style={{ fontSize: '20px', color: '#374151', margin: '0 0 8px 0' }}>{producto.nombre}</p>
            {producto.descripcion && (
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{producto.descripcion}</p>
            )}
          </div>
          {producto.fotoUrl && (
            <div style={{ width: '150px', height: '150px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #e5e7eb' }}>
              <img 
                src={producto.fotoUrl} 
                alt={producto.nombre}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}
        </div>

        {/* Grid de Información */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
          {/* Información del Producto */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📦 Información del Producto
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Marca</p>
                <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: 0 }}>{producto.marcaNombre || 'N/A'}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Categoría</p>
                <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: 0 }}>{producto.categoriaNombre || 'N/A'}</p>
              </div>
              {producto.subcategoriaNombre && (
                <div>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Subcategoría</p>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: 0 }}>{producto.subcategoriaNombre}</p>
                </div>
              )}
            </div>
          </div>

          {/* Stock por Sede */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🏢 Stock por Sede
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stocks.map(stock => (
                <div key={stock.id}>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>{stock.sedeNombre}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={{ fontSize: '18px', fontWeight: '700', color: stock.cantidad === 0 ? '#dc2626' : stock.cantidad <= stock.stockMinimo ? '#f59e0b' : '#10b981', margin: 0 }}>
                      {stock.cantidad}
                    </p>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>
                      (mín: {stock.stockMinimo})
                    </span>
                  </div>
                  {stock.ubicacion && (
                    <p style={{ fontSize: '11px', color: '#6b7280', margin: '4px 0 0 0' }}>📍 {stock.ubicacion}</p>
                  )}
                </div>
              ))}
              {stocks.length === 0 && (
                <p style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>
                  No hay stock registrado
                </p>
              )}
            </div>
          </div>

          {/* Precios */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              💰 Precios y Márgenes
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Precio Compra</p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>S/ {producto.precioCompra?.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Precio Venta</p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#10b981', margin: 0 }}>S/ {producto.precioVenta?.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Margen de Ganancia</p>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#6366f1', margin: 0 }}>
                  {margen}%
                </p>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
                  S/ {(producto.precioVenta - producto.precioCompra).toFixed(2)} por unidad
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', padding: '24px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '32px', margin: '0 0 8px 0' }}>📊</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
              S/ {(producto.precioVenta * stockTotal).toFixed(2)}
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Valor en Stock</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '32px', margin: '0 0 8px 0' }}>💵</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
              S/ {(producto.precioVenta - producto.precioCompra).toFixed(2)}
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Ganancia por Unidad</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '32px', margin: '0 0 8px 0' }}>📦</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
              {stockTotal}
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Unidades Totales</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '32px', margin: '0 0 8px 0' }}>🏢</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
              {stocks.length}
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Sedes con Stock</p>
          </div>
        </div>

        {/* Botones de Acción */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '24px', borderTop: '2px solid #e5e7eb' }}>
          <Link to={`/productos/editar/${producto.id}`} style={{ flex: 1, textDecoration: 'none' }}>
            <button style={{ width: '100%', padding: '14px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
              ✏️ Editar Producto
            </button>
          </Link>
          <Link to="/kardex" style={{ flex: 1, textDecoration: 'none' }}>
            <button style={{ width: '100%', padding: '14px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
              📊 Ver Movimientos
            </button>
          </Link>
          <Link to="/stock" style={{ flex: 1, textDecoration: 'none' }}>
            <button style={{ width: '100%', padding: '14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
              ⚙️ Ajustar Stock
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProductoDetalle;