import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProducto, updateProducto } from '../services/api';

function ProductoEditar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [producto, setProducto] = useState({
    codigo: '',
    nombre: '',
    marca: '',
    marcaAuto: '',
    modelo: '',
    stock: 0,
    stockMinimo: 0,
    precioCompra: 0,
    precio: 0,
    categoria: '',
    sede: '',
    descripcion: '',
    ubicacion: '',
    proveedor: ''
  });

  const categorias = ['Motor', 'Frenos', 'Suspensión', 'Eléctrico', 'Transmisión', 'Carrocería'];
  const sedes = ['Deybimotors', 'Deybi Parts', 'Deybi Auto'];

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
        sede: 'Deybimotors',
        descripcion: 'Pastillas de freno de alta calidad para Toyota Corolla',
        ubicacion: 'Pasillo A - Estante 3',
        proveedor: 'Importadora ABC'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProducto(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!producto.codigo || !producto.nombre || !producto.marca) {
      alert('⚠️ Por favor completa los campos obligatorios: Código, Nombre y Marca');
      return;
    }

    try {
      setGuardando(true);
      await updateProducto(id, producto);
      alert('✅ Producto actualizado exitosamente');
      navigate('/productos');
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      alert('❌ Error al actualizar el producto');
    } finally {
      setGuardando(false);
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button onClick={() => navigate('/productos')} style={{ padding: '10px 20px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
          ← Volver
        </button>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0 }}>Editar Producto</h1>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}>
          {/* Información Básica */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid #e5e7eb' }}>
              📋 Información Básica
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Código Interno *
                </label>
                <input
                  type="text"
                  name="codigo"
                  value={producto.codigo}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Sede *
                </label>
                <select
                  name="sede"
                  value={producto.sede}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                >
                  <option value="">Seleccionar sede</option>
                  {sedes.map(sede => (
                    <option key={sede} value={sede}>{sede}</option>
                  ))}
                </select>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={producto.nombre}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={producto.descripcion}
                  onChange={handleChange}
                  rows="3"
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* Producto y Compatibilidad */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid #e5e7eb' }}>
              🔧 Producto y Compatibilidad
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Marca Producto *
                </label>
                <input
                  type="text"
                  name="marca"
                  value={producto.marca}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Marca Auto
                </label>
                <input
                  type="text"
                  name="marcaAuto"
                  value={producto.marcaAuto}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Modelo
                </label>
                <input
                  type="text"
                  name="modelo"
                  value={producto.modelo}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Categoría *
                </label>
                <select
                  name="categoria"
                  value={producto.categoria}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Ubicación
                </label>
                <input
                  type="text"
                  name="ubicacion"
                  value={producto.ubicacion}
                  onChange={handleChange}
                  placeholder="Ej: Pasillo A - Estante 3"
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Proveedor
                </label>
                <input
                  type="text"
                  name="proveedor"
                  value={producto.proveedor}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Stock y Precios */}
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid #e5e7eb' }}>
              💰 Stock y Precios
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Stock Actual *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={producto.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Stock Mínimo *
                </label>
                <input
                  type="number"
                  name="stockMinimo"
                  value={producto.stockMinimo}
                  onChange={handleChange}
                  required
                  min="0"
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Precio Compra (S/) *
                </label>
                <input
                  type="number"
                  name="precioCompra"
                  value={producto.precioCompra}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Precio Venta (S/) *
                </label>
                <input
                  type="number"
                  name="precio"
                  value={producto.precio}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                />
              </div>
            </div>

            {/* Cálculo de margen */}
            {producto.precioCompra > 0 && producto.precio > 0 && (
              <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '2px solid #86efac' }}>
                <p style={{ fontSize: '14px', color: '#166534', margin: '0 0 4px 0', fontWeight: '600' }}>💡 Margen de Ganancia</p>
                <p style={{ fontSize: '20px', fontWeight: '700', color: '#15803d', margin: 0 }}>
                  {(((producto.precio - producto.precioCompra) / producto.precioCompra) * 100).toFixed(2)}%
                  <span style={{ fontSize: '14px', fontWeight: '400', marginLeft: '12px' }}>
                    (S/ {(producto.precio - producto.precioCompra).toFixed(2)} por unidad)
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Botones de Acción */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => navigate('/productos')}
            disabled={guardando}
            style={{ padding: '12px 32px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', fontWeight: '600', backgroundColor: 'white', color: '#374151', cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            style={{ 
              padding: '12px 32px', 
              border: 'none', 
              borderRadius: '8px', 
              fontSize: '14px', 
              fontWeight: '600', 
              backgroundColor: guardando ? '#9ca3af' : '#10b981', 
              color: 'white', 
              cursor: guardando ? 'not-allowed' : 'pointer' 
            }}
          >
            {guardando ? '⏳ Guardando...' : '✅ Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductoEditar;