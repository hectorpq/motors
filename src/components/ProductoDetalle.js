import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProducto } from '../services/api';

function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarProducto();
  }, [id]);

  const cargarProducto = async () => {
    try {
      setLoading(true);
      const response = await getProducto(id);
      setProducto(response.data);
    } catch (error) {
      console.error('Error al cargar producto:', error);
      // Datos de ejemplo
      setProducto({
        id: id,
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
        categoria: 'Frenos',
        descripcion: 'Pastillas de freno de alta calidad para Toyota Corolla',
        ubicacion: 'Pasillo A - Estante 3',
        proveedor: 'Importadora ABC'
      });
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

  if (!producto) {
    return (
      <div style={{ padding: '24px' }}>
        <p>Producto no encontrado</p>
        <Link to="/productos">Volver a productos</Link>
      </div>
    );
  }

  const getEstado = () => {
    if (producto.stock === 0) return { texto: 'Sin Stock', color: '#fee2e2', textColor: '#991b1b' };
    if (producto.stock <= producto.stockMinimo) return { texto: 'Stock Bajo', color: '#fef3c7', textColor: '#92400e' };
    return { texto: 'En Stock', color: '#d1fae5', textColor: '#065f46' };
  };

  const estado = getEstado();

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
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', margin: 0 }}>{producto.codigo}</h2>
              <span style={{ display: 'inline-block', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', backgroundColor: estado.color, color: estado.textColor }}>
                {estado.texto}
              </span>
            </div>
            <p style={{ fontSize: '20px', color: '#374151', margin: '0 0 8px 0' }}>{producto.nombre}</p>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{producto.descripcion}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Sede</p>
            <p style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>{producto.sede}</p>
          </div>
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
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Marca Producto</p>
                <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: 0 }}>{producto.marca}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Categoría</p>
                <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: 0 }}>{producto.categoria}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Ubicación</p>
                <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: 0 }}>{producto.ubicacion || 'No especificada'}</p>
              </div>
            </div>
          </div>

          {/* Compatibilidad */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🚗 Compatibilidad
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Marca Auto</p>
                <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: 0 }}>{producto.marcaAuto}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Modelo</p>
                <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: 0 }}>{producto.modelo}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Proveedor</p>
                <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: 0 }}>{producto.proveedor || 'No especificado'}</p>
              </div>
            </div>
          </div>

          {/* Stock y Precios */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              💰 Stock y Precios
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Stock Actual</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: producto.stock === 0 ? '#dc2626' : producto.stock <= producto.stockMinimo ? '#f59e0b' : '#10b981', margin: 0 }}>
                  {producto.stock} unidades
                </p>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>Stock mínimo: {producto.stockMinimo}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Precio Compra</p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>S/ {producto.precioCompra.toFixed(2)}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Precio Venta</p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#10b981', margin: 0 }}>S/ {producto.precio.toFixed(2)}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Margen</p>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#6366f1', margin: 0 }}>
                  {(((producto.precio - producto.precioCompra) / producto.precioCompra) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', padding: '24px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '32px', margin: '0 0 8px 0' }}>📊</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>S/ {(producto.precio * producto.stock).toFixed(2)}</p>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Valor en Stock</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '32px', margin: '0 0 8px 0' }}>💵</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>S/ {(producto.precio - producto.precioCompra).toFixed(2)}</p>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Ganancia por Unidad</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '32px', margin: '0 0 8px 0' }}>📦</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>{producto.stock}</p>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Unidades Disponibles</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '32px', margin: '0 0 8px 0' }}>⚡</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>{Math.max(0, producto.stock - producto.stockMinimo)}</p>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Sobre Stock Mínimo</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductoDetalle;