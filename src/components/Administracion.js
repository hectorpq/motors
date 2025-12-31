import React, { useState, useEffect } from 'react';
import {
  // Sedes
  getSedes, createSede, updateSede, cambiarEstadoSede, deleteSede,
  // Proveedores
  getProveedores, createProveedor, updateProveedor, cambiarEstadoProveedor, deleteProveedor,
  // Categorías
  getCategorias, createCategoria, updateCategoria, deleteCategoria,
  // Subcategorías
  getSubcategorias, getSubcategoriasPorCategoria, createSubcategoria, updateSubcategoria, deleteSubcategoria,
  // Marcas
  getMarcas, createMarca, updateMarca, deleteMarca,
  // Modelos
  getModelos, getModelosPorMarca, createModelo, updateModelo, deleteModelo,
  // Usuarios
  getUsuarios, createUsuario, updateUsuario, cambiarEstadoUsuario, deleteUsuario, resetearPasswordUsuario
} from '../services/api';
import './Administracion.css';

// ===== COMPONENTE DE SEDES =====
const Sedes = () => {
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [sedeEdit, setSedeEdit] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', direccion: '', activo: true });

  useEffect(() => {
    cargarSedes();
  }, []);

  const cargarSedes = async () => {
    try {
      setLoading(true);
      const response = await getSedes();
      setSedes(response.data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar sedes');
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (sede = null) => {
    if (sede) {
      setSedeEdit(sede);
      setFormData({ nombre: sede.nombre, direccion: sede.direccion || '', activo: sede.activo });
    } else {
      setSedeEdit(null);
      setFormData({ nombre: '', direccion: '', activo: true });
    }
    setModalAbierto(true);
  };

  const guardarSede = async () => {
    if (!formData.nombre) {
      alert('Completa el nombre de la sede');
      return;
    }

    try {
      if (sedeEdit) {
        await updateSede(sedeEdit.id, formData);
        alert('Sede actualizada correctamente');
      } else {
        await createSede(formData);
        alert('Sede registrada correctamente');
      }
      setModalAbierto(false);
      cargarSedes();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const eliminarSede = async (id) => {
    if (window.confirm('¿Confirmar eliminación? Verifica que no tenga productos/compras asociadas')) {
      try {
        await deleteSede(id);
        alert('Sede eliminada correctamente');
        cargarSedes();
      } catch (error) {
        alert('Error: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  if (loading) return <div className="loading-spinner">Cargando...</div>;

  return (
    <div className="modulo-content">
      <div className="modulo-header">
        <h2>🏢 Gestión de Sedes</h2>
        <button className="btn-primary" onClick={() => abrirModal()}>➕ Nueva Sede</button>
      </div>

      <div className="tabla-container">
        <table className="tabla-datos">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Dirección</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sedes.map(sede => (
              <tr key={sede.id}>
                <td>{sede.id}</td>
                <td>{sede.nombre}</td>
                <td>{sede.direccion || 'Sin dirección'}</td>
                <td>
                  <span className={`badge-estado ${sede.activo ? 'activo' : 'inactivo'}`}>
                    {sede.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <button className="btn-accion editar" onClick={() => abrirModal(sede)}>✏️</button>
                  <button className="btn-accion eliminar" onClick={() => eliminarSede(sede.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
          <div className="modal-admin" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{sedeEdit ? 'Editar Sede' : 'Nueva Sede'}</h3>
              <button className="btn-cerrar" onClick={() => setModalAbierto(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nombre de la Sede *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Deybimotors"
                />
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                  placeholder="Ej: Av. Principal 123"
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={e => setFormData({ ...formData, activo: e.target.checked })}
                  />
                  {' '}Activo
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalAbierto(false)}>Cancelar</button>
              <button className="btn-primary" onClick={guardarSede}>{sedeEdit ? 'Actualizar' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== COMPONENTE DE PROVEEDORES =====
const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [proveedorEdit, setProveedorEdit] = useState(null);
  const [formData, setFormData] = useState({ 
    nombreEmpresa: '',  // ✅ CAMBIADO: razonSocial → nombreEmpresa
    ruc: '', 
    contacto: '',       // ✅ AGREGADO
    telefono: '', 
    email: '', 
    direccion: '',
    observaciones: ''   // ✅ AGREGADO
  });
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    try {
      setLoading(true);
      const response = await getProveedores();
      setProveedores(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (proveedor = null) => {
    if (proveedor) {
      setProveedorEdit(proveedor);
      setFormData({
        nombreEmpresa: proveedor.nombreEmpresa || '',
        ruc: proveedor.ruc || '',
        contacto: proveedor.contacto || '',
        telefono: proveedor.telefono || '',
        email: proveedor.email || '',
        direccion: proveedor.direccion || '',
        observaciones: proveedor.observaciones || ''
      });
    } else {
      setProveedorEdit(null);
      setFormData({ 
        nombreEmpresa: '', 
        ruc: '', 
        contacto: '', 
        telefono: '', 
        email: '', 
        direccion: '',
        observaciones: ''
      });
    }
    setModalAbierto(true);
  };

  const guardarProveedor = async () => {
    if (!formData.nombreEmpresa) {  // ✅ CAMBIADO: razonSocial → nombreEmpresa
      alert('Completa el nombre de la empresa');
      return;
    }

    try {
      if (proveedorEdit) {
        await updateProveedor(proveedorEdit.id, formData);
        alert('Proveedor actualizado correctamente');
      } else {
        await createProveedor(formData);
        alert('Proveedor registrado correctamente');
      }
      setModalAbierto(false);
      cargarProveedores();
    } catch (error) {
      console.error('Error completo:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const eliminarProveedor = async (id) => {
    if (window.confirm('¿Confirmar eliminación?')) {
      try {
        await deleteProveedor(id);
        alert('Proveedor eliminado');
        cargarProveedores();
      } catch (error) {
        alert('Error: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  // ✅ FIX: Protección contra undefined
  const proveedoresFiltrados = proveedores.filter(p => {
    const nombreEmpresa = (p.nombreEmpresa || '').toLowerCase();
    const ruc = (p.ruc || '').toLowerCase();
    const contacto = (p.contacto || '').toLowerCase();
    const busquedaLower = (busqueda || '').toLowerCase();
    
    return nombreEmpresa.includes(busquedaLower) || 
           ruc.includes(busquedaLower) ||
           contacto.includes(busquedaLower);
  });

  if (loading) return <div className="loading-spinner">Cargando...</div>;

  return (
    <div className="modulo-content">
      <div className="modulo-header">
        <h2>📦 Gestión de Proveedores</h2>
        <div className="header-actions">
          <input
            type="text"
            placeholder="🔍 Buscar por RUC, empresa o contacto..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="input-busqueda-admin"
          />
          <button className="btn-primary" onClick={() => abrirModal()}>➕ Nuevo Proveedor</button>
        </div>
      </div>

      <div className="tabla-container">
        <table className="tabla-datos">
          <thead>
            <tr>
              <th>ID</th>
              <th>RUC</th>
              <th>Empresa</th>
              <th>Contacto</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedoresFiltrados.map(proveedor => (
              <tr key={proveedor.id}>
                <td>{proveedor.id}</td>
                <td><span className="badge-codigo">{proveedor.ruc || 'N/A'}</span></td>
                <td><strong>{proveedor.nombreEmpresa}</strong></td>
                <td>{proveedor.contacto || 'N/A'}</td>
                <td>{proveedor.telefono || 'N/A'}</td>
                <td>{proveedor.email || 'N/A'}</td>
                <td>
                  <span className={`badge-estado ${proveedor.activo ? 'activo' : 'inactivo'}`}>
                    {proveedor.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <button className="btn-accion editar" onClick={() => abrirModal(proveedor)}>✏️</button>
                  <button className="btn-accion eliminar" onClick={() => eliminarProveedor(proveedor.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
          <div className="modal-admin" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{proveedorEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h3>
              <button className="btn-cerrar" onClick={() => setModalAbierto(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>RUC</label>
                <input 
                  type="text" 
                  value={formData.ruc} 
                  onChange={e => setFormData({ ...formData, ruc: e.target.value })} 
                  placeholder="20987654321" 
                  maxLength="11" 
                />
              </div>
              <div className="form-group">
                <label>Nombre de la Empresa *</label>
                <input 
                  type="text" 
                  value={formData.nombreEmpresa} 
                  onChange={e => setFormData({ ...formData, nombreEmpresa: e.target.value })} 
                  placeholder="Ej: Repuestos SAC"
                />
              </div>
              <div className="form-group">
                <label>Persona de Contacto</label>
                <input 
                  type="text" 
                  value={formData.contacto} 
                  onChange={e => setFormData({ ...formData, contacto: e.target.value })} 
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input 
                  type="tel" 
                  value={formData.telefono} 
                  onChange={e => setFormData({ ...formData, telefono: e.target.value })} 
                  placeholder="987654321"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({ ...formData, email: e.target.value })} 
                  placeholder="contacto@empresa.com"
                />
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input 
                  type="text" 
                  value={formData.direccion} 
                  onChange={e => setFormData({ ...formData, direccion: e.target.value })} 
                  placeholder="Av. Principal 123"
                />
              </div>
              <div className="form-group">
                <label>Observaciones</label>
                <textarea 
                  value={formData.observaciones} 
                  onChange={e => setFormData({ ...formData, observaciones: e.target.value })} 
                  placeholder="Notas adicionales..."
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalAbierto(false)}>Cancelar</button>
              <button className="btn-primary" onClick={guardarProveedor}>
                {proveedorEdit ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// ===== COMPONENTE DE CATEGORÍAS Y SUBCATEGORÍAS =====
const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalCategoria, setModalCategoria] = useState(false);
  const [modalSubcategoria, setModalSubcategoria] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [formCategoria, setFormCategoria] = useState({ nombre: '', descripcion: '' });
  const [formSubcategoria, setFormSubcategoria] = useState({ nombre: '', descripcion: '' });

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      const [catRes, subRes] = await Promise.all([getCategorias(), getSubcategorias()]);
      
      // Mapear subcategorías a sus categorías
      const categoriasConSubs = catRes.data.map(cat => ({
        ...cat,
        subcategorias: subRes.data.filter(sub => sub.categoriaId === cat.id)
      }));
      
      setCategorias(categoriasConSubs);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const agregarCategoria = async () => {
    if (!formCategoria.nombre) {
      alert('Ingresa el nombre de la categoría');
      return;
    }
    try {
      await createCategoria(formCategoria);
      setFormCategoria({ nombre: '', descripcion: '' });
      setModalCategoria(false);
      alert('Categoría creada correctamente');
      cargarCategorias();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const agregarSubcategoria = async () => {
    if (!formSubcategoria.nombre || !categoriaSeleccionada) {
      alert('Completa los campos');
      return;
    }
    try {
      await createSubcategoria({ ...formSubcategoria, categoriaId: categoriaSeleccionada.id });
      setFormSubcategoria({ nombre: '', descripcion: '' });
      setModalSubcategoria(false);
      alert('Subcategoría creada correctamente');
      cargarCategorias();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const eliminarCategoria = async (id) => {
    const categoria = categorias.find(c => c.id === id);
    if (categoria.subcategorias.length > 0) {
      alert('No se puede eliminar. Elimina primero las subcategorías');
      return;
    }
    if (window.confirm('¿Eliminar esta categoría?')) {
      try {
        await deleteCategoria(id);
        cargarCategorias();
      } catch (error) {
        alert('Error: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const eliminarSubcategoria = async (subId) => {
    if (window.confirm('¿Eliminar esta subcategoría?')) {
      try {
        await deleteSubcategoria(subId);
        cargarCategorias();
      } catch (error) {
        alert('Error: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  if (loading) return <div className="loading-spinner">Cargando...</div>;

  return (
    <div className="modulo-content">
      <div className="modulo-header">
        <h2>📂 Gestión de Categorías</h2>
        <button className="btn-primary" onClick={() => setModalCategoria(true)}>➕ Nueva Categoría</button>
      </div>

      <div className="categorias-tree">
        {categorias.map(categoria => (
          <div key={categoria.id} className="categoria-item">
            <div className="categoria-header">
              <h3>📁 {categoria.nombre}</h3>
              <div className="categoria-acciones">
                <button className="btn-accion agregar" onClick={() => { setCategoriaSeleccionada(categoria); setModalSubcategoria(true); }}>➕ Subcategoría</button>
                <button className="btn-accion eliminar" onClick={() => eliminarCategoria(categoria.id)}>🗑️</button>
              </div>
            </div>
            <div className="subcategorias-list">
              {categoria.subcategorias.map(sub => (
                <div key={sub.id} className="subcategoria-item">
                  <span>📄 {sub.nombre}</span>
                  <button className="btn-accion eliminar" onClick={() => eliminarSubcategoria(sub.id)}>🗑️</button>
                </div>
              ))}
              {categoria.subcategorias.length === 0 && <p className="empty-message">No hay subcategorías</p>}
            </div>
          </div>
        ))}
      </div>

      {modalCategoria && (
        <div className="modal-overlay" onClick={() => setModalCategoria(false)}>
          <div className="modal-admin" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nueva Categoría</h3>
              <button className="btn-cerrar" onClick={() => setModalCategoria(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nombre *</label>
                <input type="text" value={formCategoria.nombre} onChange={e => setFormCategoria({ ...formCategoria, nombre: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea value={formCategoria.descripcion} onChange={e => setFormCategoria({ ...formCategoria, descripcion: e.target.value })} rows="3" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalCategoria(false)}>Cancelar</button>
              <button className="btn-primary" onClick={agregarCategoria}>Crear</button>
            </div>
          </div>
        </div>
      )}

      {modalSubcategoria && (
        <div className="modal-overlay" onClick={() => setModalSubcategoria(false)}>
          <div className="modal-admin" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nueva Subcategoría - {categoriaSeleccionada?.nombre}</h3>
              <button className="btn-cerrar" onClick={() => setModalSubcategoria(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nombre *</label>
                <input type="text" value={formSubcategoria.nombre} onChange={e => setFormSubcategoria({ ...formSubcategoria, nombre: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea value={formSubcategoria.descripcion} onChange={e => setFormSubcategoria({ ...formSubcategoria, descripcion: e.target.value })} rows="3" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalSubcategoria(false)}>Cancelar</button>
              <button className="btn-primary" onClick={agregarSubcategoria}>Crear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== COMPONENTE DE MARCAS Y MODELOS =====
const MarcasModelos = () => {
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMarca, setModalMarca] = useState(false);
  const [modalModelo, setModalModelo] = useState(false);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState(null);
  const [formMarca, setFormMarca] = useState({ nombre: '' });
  const [formModelo, setFormModelo] = useState({ nombre: '' });

  useEffect(() => {
    cargarMarcas();
  }, []);

  const cargarMarcas = async () => {
    try {
      setLoading(true);
      const [marcasRes, modelosRes] = await Promise.all([getMarcas(), getModelos()]);
      
      const marcasConModelos = marcasRes.data.map(marca => ({
        ...marca,
        modelos: modelosRes.data.filter(modelo => modelo.marcaId === marca.id)
      }));
      
      setMarcas(marcasConModelos);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const agregarMarca = async () => {
    if (!formMarca.nombre) {
      alert('Ingresa el nombre de la marca');
      return;
    }
    try {
      await createMarca(formMarca);
      setFormMarca({ nombre: '' });
      setModalMarca(false);
      alert('Marca creada correctamente');
      cargarMarcas();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const agregarModelo = async () => {
    if (!formModelo.nombre || !marcaSeleccionada) {
      alert('Completa los campos');
      return;
    }
    try {
      await createModelo({ ...formModelo, marcaId: marcaSeleccionada.id });
      setFormModelo({ nombre: '' });
      setModalModelo(false);
      alert('Modelo creado correctamente');
      cargarMarcas();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const eliminarMarca = async (id) => {
    const marca = marcas.find(m => m.id === id);
    if (marca.modelos.length > 0) {
      alert('No se puede eliminar. Elimina primero los modelos');
      return;
    }
    if (window.confirm('¿Eliminar esta marca?')) {
      try {
        await deleteMarca(id);
        cargarMarcas();
      } catch (error) {
        alert('Error: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const eliminarModelo = async (modeloId) => {
    if (window.confirm('¿Eliminar este modelo?')) {
      try {
        await deleteModelo(modeloId);
        cargarMarcas();
      } catch (error) {
        alert('Error: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  if (loading) return <div className="loading-spinner">Cargando...</div>;

  return (
    <div className="modulo-content">
      <div className="modulo-header">
        <h2>🚗 Gestión de Marcas y Modelos</h2>
        <button className="btn-primary" onClick={() => setModalMarca(true)}>➕ Nueva Marca</button>
      </div>

      <div className="marcas-tree">
        {marcas.map(marca => (
          <div key={marca.id} className="marca-item">
            <div className="marca-header">
              <h3>🚗 {marca.nombre}</h3>
              <div className="marca-acciones">
                <button className="btn-accion agregar" onClick={() => { setMarcaSeleccionada(marca); setModalModelo(true); }}>➕ Modelo</button>
                <button className="btn-accion eliminar" onClick={() => eliminarMarca(marca.id)}>🗑️</button>
              </div>
            </div>
            <div className="modelos-list">
              {marca.modelos.map(modelo => (
                <div key={modelo.id} className="modelo-item">
                  <span>🚘 {modelo.nombre}</span>
                  <button className="btn-accion-mini eliminar" onClick={() => eliminarModelo(modelo.id)}>🗑️</button>
                </div>
              ))}
              {marca.modelos.length === 0 && <p className="empty-message">No hay modelos</p>}
            </div>
          </div>
        ))}
      </div>

      {modalMarca && (
        <div className="modal-overlay" onClick={() => setModalMarca(false)}>
          <div className="modal-admin" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nueva Marca</h3>
              <button className="btn-cerrar" onClick={() => setModalMarca(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nombre *</label>
                <input type="text" value={formMarca.nombre} onChange={e => setFormMarca({ ...formMarca, nombre: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalMarca(false)}>Cancelar</button>
              <button className="btn-primary" onClick={agregarMarca}>Crear</button>
            </div>
          </div>
        </div>
      )}

      {modalModelo && (
        <div className="modal-overlay" onClick={() => setModalModelo(false)}>
          <div className="modal-admin" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nuevo Modelo - {marcaSeleccionada?.nombre}</h3>
              <button className="btn-cerrar" onClick={() => setModalModelo(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nombre *</label>
                <input type="text" value={formModelo.nombre} onChange={e => setFormModelo({ ...formModelo, nombre: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalModelo(false)}>Cancelar</button>
              <button className="btn-primary" onClick={agregarModelo}>Crear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== COMPONENTE DE USUARIOS =====
const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalPassword, setModalPassword] = useState(false);
  const [usuarioEdit, setUsuarioEdit] = useState(null);
  const [usuarioPassword, setUsuarioPassword] = useState(null);
  const [sedes, setSedes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nombreCompleto: '',
    email: '',
    rol: 'VENDEDOR',
    sedeId: null
  });
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');

  const roles = ['ADMIN', 'VENDEDOR', 'ALMACENERO'];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [usuariosRes, sedesRes] = await Promise.all([getUsuarios(), getSedes()]);
      setUsuarios(usuariosRes.data);
      setSedes(sedesRes.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (usuario = null) => {
    if (usuario) {
      setUsuarioEdit(usuario);
      setFormData({
        username: usuario.username,
        password: '',
        nombreCompleto: usuario.nombreCompleto,
        email: usuario.email,
        rol: usuario.rol,
        sedeId: usuario.sedeId
      });
    } else {
      setUsuarioEdit(null);
      setFormData({ username: '', password: '', nombreCompleto: '', email: '', rol: 'VENDEDOR', sedeId: sedes[0]?.id || null });
    }
    setModalAbierto(true);
  };

  const guardarUsuario = async () => {
    if (!formData.username || !formData.nombreCompleto || !formData.email) {
      alert('Completa los campos obligatorios');
      return;
    }
    if (!usuarioEdit && !formData.password) {
      alert('Ingresa una contraseña');
      return;
    }
    try {
      if (usuarioEdit) {
        await updateUsuario(usuarioEdit.id, formData);
        alert('Usuario actualizado');
      } else {
        await createUsuario(formData);
        alert('Usuario creado');
      }
      setModalAbierto(false);
      cargarDatos();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const cambiarPassword = async () => {
    if (!nuevaPassword || nuevaPassword !== confirmarPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    try {
      await resetearPasswordUsuario(usuarioPassword.id, { nuevaPassword });
      alert('Contraseña actualizada');
      setModalPassword(false);
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const eliminarUsuario = async (id) => {
    if (window.confirm('¿Eliminar usuario?')) {
      try {
        await deleteUsuario(id);
        alert('Usuario eliminado');
        cargarDatos();
      } catch (error) {
        alert('Error: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const usuariosFiltrados = usuarios.filter(u => {
    const cumpleBusqueda = u.nombreCompleto?.toLowerCase().includes(busqueda.toLowerCase()) || u.username?.toLowerCase().includes(busqueda.toLowerCase());
    const cumpleRol = !filtroRol || u.rol === filtroRol;
    return cumpleBusqueda && cumpleRol;
  });

  if (loading) return <div className="loading-spinner">Cargando...</div>;

  return (
    <div className="modulo-content">
      <div className="modulo-header">
        <h2>👥 Gestión de Usuarios</h2>
        <button className="btn-primary" onClick={() => abrirModal()}>➕ Nuevo Usuario</button>
      </div>

      <div className="filtros-usuarios">
        <input type="text" placeholder="🔍 Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="input-busqueda-admin" />
        <select value={filtroRol} onChange={e => setFiltroRol(e.target.value)} className="select-filtro-admin">
          <option value="">Todos los Roles</option>
          {roles.map(rol => <option key={rol} value={rol}>{rol}</option>)}
        </select>
      </div>

      <div className="tabla-container">
        <table className="tabla-datos">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map(usuario => (
              <tr key={usuario.id}>
                <td>{usuario.id}</td>
                <td><span className="badge-codigo">{usuario.username}</span></td>
                <td>{usuario.nombreCompleto}</td>
                <td>{usuario.email}</td>
                <td><span className={`badge-rol ${usuario.rol.toLowerCase()}`}>{usuario.rol}</span></td>
                <td><span className={`badge-estado ${usuario.activo ? 'activo' : 'inactivo'}`}>{usuario.activo ? 'Activo' : 'Inactivo'}</span></td>
                <td>
                  <button className="btn-accion editar" onClick={() => abrirModal(usuario)}>✏️</button>
                  <button className="btn-accion password" onClick={() => { setUsuarioPassword(usuario); setModalPassword(true); }}>🔑</button>
                  <button className="btn-accion eliminar" onClick={() => eliminarUsuario(usuario.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
          <div className="modal-admin modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{usuarioEdit ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
              <button className="btn-cerrar" onClick={() => setModalAbierto(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Usuario *</label>
                  <input type="text" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} disabled={!!usuarioEdit} />
                </div>
                <div className="form-group">
                  <label>Nombre *</label>
                  <input type="text" value={formData.nombreCompleto} onChange={e => setFormData({ ...formData, nombreCompleto: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
                {!usuarioEdit && (
                  <div className="form-group">
                    <label>Contraseña *</label>
                    <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                  </div>
                )}
                <div className="form-group">
                  <label>Rol *</label>
                  <select value={formData.rol} onChange={e => setFormData({ ...formData, rol: e.target.value })}>
                    {roles.map(rol => <option key={rol} value={rol}>{rol}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Sede</label>
                  <select value={formData.sedeId || ''} onChange={e => setFormData({ ...formData, sedeId: parseInt(e.target.value) || null })}>
                    <option value="">Sin sede</option>
                    {sedes.map(sede => <option key={sede.id} value={sede.id}>{sede.nombre}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalAbierto(false)}>Cancelar</button>
              <button className="btn-primary" onClick={guardarUsuario}>{usuarioEdit ? 'Actualizar' : 'Crear'}</button>
            </div>
          </div>
        </div>
      )}

      {modalPassword && (
        <div className="modal-overlay" onClick={() => setModalPassword(false)}>
          <div className="modal-admin" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔑 Cambiar Contraseña</h3>
              <button className="btn-cerrar" onClick={() => setModalPassword(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p><strong>Usuario:</strong> {usuarioPassword?.username}</p>
              <div className="form-group">
                <label>Nueva Contraseña *</label>
                <input type="password" value={nuevaPassword} onChange={e => setNuevaPassword(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Confirmar *</label>
                <input type="password" value={confirmarPassword} onChange={e => setConfirmarPassword(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalPassword(false)}>Cancelar</button>
              <button className="btn-primary" onClick={cambiarPassword}>Cambiar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== COMPONENTE PRINCIPAL =====
function Administracion({ modulo = 'sedes' }) {
  const [moduloActivo, setModuloActivo] = useState(modulo);

  useEffect(() => {
    setModuloActivo(modulo);
  }, [modulo]);

  const modulos = [
    { id: 'sedes', nombre: 'Sedes', icono: '🏢' },
    { id: 'proveedores', nombre: 'Proveedores', icono: '📦' },
    { id: 'categorias', nombre: 'Categorías', icono: '📂' },
    { id: 'marcas', nombre: 'Marcas y Modelos', icono: '🚗' },
    { id: 'usuarios', nombre: 'Usuarios', icono: '👥' }
  ];

  return (
    <div className="administracion-container">
      <div className="admin-header">
        <h1>⚙️ Administración del Sistema</h1>
        <p>Gestiona los recursos principales del sistema</p>
      </div>

      <div className="admin-layout">
        <div className="admin-sidebar">
          <h3>Módulos</h3>
          <div className="modulos-menu">
            {modulos.map(modulo => (
              <button
                key={modulo.id}
                className={`modulo-btn ${moduloActivo === modulo.id ? 'activo' : ''}`}
                onClick={() => setModuloActivo(modulo.id)}
              >
                <span className="modulo-icono">{modulo.icono}</span>
                <span>{modulo.nombre}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="admin-content">
          {moduloActivo === 'sedes' && <Sedes />}
          {moduloActivo === 'proveedores' && <Proveedores />}
          {moduloActivo === 'categorias' && <Categorias />}
          {moduloActivo === 'marcas' && <MarcasModelos />}
          {moduloActivo === 'usuarios' && <Usuarios />}
        </div>
      </div>
    </div>
  );
}

export default Administracion;