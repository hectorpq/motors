import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getProducto,
  updateProducto,
  getCategorias,
  getSubcategorias,
  getMarcas,
  subirFotoProducto,
  eliminarFotoProducto
} from '../services/api';

function ProductoEditar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  
  const [producto, setProducto] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    categoriaId: '',
    subcategoriaId: '',
    marcaId: '',
    precioCompra: 0,
    precioVenta: 0,
    fotoUrl: ''
  });

  const [archivoFoto, setArchivoFoto] = useState(null);
  const [previsualizacion, setPrevisualizacion] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [id]);

  useEffect(() => {
    if (producto.categoriaId) {
      cargarSubcategorias(producto.categoriaId);
    }
  }, [producto.categoriaId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');

      // Cargar producto
      const productoResponse = await getProducto(id);
      const prod = productoResponse.data;
      
      setProducto({
        codigo: prod.codigo || '',
        nombre: prod.nombre || '',
        descripcion: prod.descripcion || '',
        categoriaId: prod.categoriaId || '',
        subcategoriaId: prod.subcategoriaId || '',
        marcaId: prod.marcaId || '',
        precioCompra: prod.precioCompra || 0,
        precioVenta: prod.precioVenta || 0,
        fotoUrl: prod.fotoUrl || ''
      });

      if (prod.fotoUrl) {
        setPrevisualizacion(prod.fotoUrl);
      }

      // Cargar catálogos
      const [categoriasRes, marcasRes] = await Promise.all([
        getCategorias(),
        getMarcas()
      ]);

      setCategorias(categoriasRes.data);
      setMarcas(marcasRes.data);

      // Cargar subcategorías si tiene categoría
      if (prod.categoriaId) {
        const subcategoriasRes = await getSubcategorias();
        setSubcategorias(subcategoriasRes.data.filter(s => s.categoriaId === prod.categoriaId));
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar el producto');
    } finally {
      setLoading(false);
    }
  };

  const cargarSubcategorias = async (categoriaId) => {
    try {
      const response = await getSubcategorias();
      setSubcategorias(response.data.filter(s => s.categoriaId === parseInt(categoriaId)));
    } catch (error) {
      console.error('Error al cargar subcategorías:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProducto(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoriaChange = (e) => {
    const categoriaId = e.target.value;
    setProducto(prev => ({
      ...prev,
      categoriaId: categoriaId,
      subcategoriaId: '' // Reset subcategoría
    }));
  };

  const handleFotoChange = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      setArchivoFoto(archivo);
      
      // Crear previsualización
      const reader = new FileReader();
      reader.onloadend = () => {
        setPrevisualizacion(reader.result);
      };
      reader.readAsDataURL(archivo);
    }
  };

  const handleEliminarFoto = async () => {
    if (!window.confirm('¿Estás seguro de eliminar la foto del producto?')) {
      return;
    }

    try {
      setGuardando(true);
      await eliminarFotoProducto(id);
      setProducto(prev => ({ ...prev, fotoUrl: '' }));
      setPrevisualizacion('');
      setArchivoFoto(null);
      alert('✅ Foto eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar foto:', error);
      alert('❌ Error al eliminar la foto');
    } finally {
      setGuardando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!producto.codigo || !producto.nombre || !producto.categoriaId || !producto.marcaId) {
      alert('⚠️ Por favor completa los campos obligatorios');
      return;
    }

    if (producto.precioVenta < producto.precioCompra) {
      if (!window.confirm('⚠️ El precio de venta es menor al precio de compra. ¿Deseas continuar?')) {
        return;
      }
    }

    try {
      setGuardando(true);
      setError('');

      // Preparar datos
      const datosProducto = {
        codigo: producto.codigo,
        nombre: producto.nombre,
        descripcion: producto.descripcion || null,
        categoriaId: parseInt(producto.categoriaId),
        subcategoriaId: producto.subcategoriaId ? parseInt(producto.subcategoriaId) : null,
        marcaId: parseInt(producto.marcaId),
        precioCompra: parseFloat(producto.precioCompra),
        precioVenta: parseFloat(producto.precioVenta)
      };

      // Actualizar producto
      await updateProducto(id, datosProducto);

      // Subir foto si hay una nueva
      if (archivoFoto) {
        await subirFotoProducto(id, archivoFoto);
      }

      alert('✅ Producto actualizado exitosamente');
      navigate('/productos');
      
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      setError('Error al actualizar el producto: ' + (error.response?.data?.message || error.message));
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
      {/* Error Banner */}
      {error && (
        <div style={{ background: '#fee', border: '1px solid #fcc', color: '#c33', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#c33', cursor: 'pointer' }}>✕</button>
        </div>
      )}

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
          
          {/* Foto del Producto */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid #e5e7eb' }}>
              📸 Foto del Producto
            </h2>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'start' }}>
              {previsualizacion && (
                <div style={{ position: 'relative' }}>
                  <img 
                    src={previsualizacion} 
                    alt="Previsualización"
                    style={{ width: '200px', height: '200px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #e5e7eb' }}
                  />
                  <button
                    type="button"
                    onClick={handleEliminarFoto}
                    style={{ position: 'absolute', top: '8px', right: '8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px' }}
                    title="Eliminar foto"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  {previsualizacion ? 'Cambiar Foto' : 'Subir Foto'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                />
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                  Formatos aceptados: JPG, PNG, GIF. Tamaño máximo: 5MB
                </p>
              </div>
            </div>
          </div>

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
                  placeholder="Descripción detallada del producto..."
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* Categorización */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid #e5e7eb' }}>
              🔧 Categorización
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Categoría *
                </label>
                <select
                  name="categoriaId"
                  value={producto.categoriaId}
                  onChange={handleCategoriaChange}
                  required
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Subcategoría
                </label>
                <select
                  name="subcategoriaId"
                  value={producto.subcategoriaId}
                  onChange={handleChange}
                  disabled={!producto.categoriaId || subcategorias.length === 0}
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                >
                  <option value="">Sin subcategoría</option>
                  {subcategorias.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Marca *
                </label>
                <select
                  name="marcaId"
                  value={producto.marcaId}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                >
                  <option value="">Seleccionar marca</option>
                  {marcas.map(marca => (
                    <option key={marca.id} value={marca.id}>{marca.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Precios */}
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid #e5e7eb' }}>
              💰 Precios
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Precio de Compra (S/) *
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
                  Precio de Venta (S/) *
                </label>
                <input
                  type="number"
                  name="precioVenta"
                  value={producto.precioVenta}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                />
              </div>
            </div>

            {/* Cálculo de margen */}
            {producto.precioCompra > 0 && producto.precioVenta > 0 && (
              <div style={{ marginTop: '20px', padding: '16px', backgroundColor: producto.precioVenta >= producto.precioCompra ? '#f0fdf4' : '#fef3c7', borderRadius: '8px', border: producto.precioVenta >= producto.precioCompra ? '2px solid #86efac' : '2px solid #fcd34d' }}>
                <p style={{ fontSize: '14px', color: producto.precioVenta >= producto.precioCompra ? '#166534' : '#92400e', margin: '0 0 4px 0', fontWeight: '600' }}>
                  {producto.precioVenta >= producto.precioCompra ? '💡 Margen de Ganancia' : '⚠️ Advertencia: Precio de venta menor al de compra'}
                </p>
                <p style={{ fontSize: '20px', fontWeight: '700', color: producto.precioVenta >= producto.precioCompra ? '#15803d' : '#92400e', margin: 0 }}>
                  {producto.precioCompra > 0 ? (((producto.precioVenta - producto.precioCompra) / producto.precioCompra) * 100).toFixed(2) : 0}%
                  <span style={{ fontSize: '14px', fontWeight: '400', marginLeft: '12px' }}>
                    (S/ {(producto.precioVenta - producto.precioCompra).toFixed(2)} por unidad)
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
            style={{ padding: '12px 32px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', fontWeight: '600', backgroundColor: 'white', color: '#374151', cursor: guardando ? 'not-allowed' : 'pointer' }}
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