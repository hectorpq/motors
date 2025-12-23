import React, { useState, useEffect } from 'react';
import './Administracion.css';

// Componente de Sedes
const Sedes = () => {
  const [sedes, setSedes] = useState([
    { id: 1, nombre: 'Deybimotors', codigo: 'DM', activo: true },
    { id: 2, nombre: 'Deybi Parts', codigo: 'DP', activo: true },
    { id: 3, nombre: 'Deybi Auto', codigo: 'DA', activo: true }
  ]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [sedeEdit, setSedeEdit] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', codigo: '' });

  const abrirModal = (sede = null) => {
    if (sede) {
      setSedeEdit(sede);
      setFormData({ nombre: sede.nombre, codigo: sede.codigo });
    } else {
      setSedeEdit(null);
      setFormData({ nombre: '', codigo: '' });
    }
    setModalAbierto(true);
  };

  const guardarSede = () => {
    if (!formData.nombre || !formData.codigo) {
      alert('Completa todos los campos');
      return;
    }

    if (sedeEdit) {
      setSedes(sedes.map(s => s.id === sedeEdit.id ? { ...s, ...formData } : s));
      alert('Sede actualizada correctamente');
    } else {
      const nuevaSede = {
        id: sedes.length + 1,
        ...formData,
        activo: true
      };
      setSedes([...sedes, nuevaSede]);
      alert('Sede registrada correctamente');
    }
    setModalAbierto(false);
  };

  const eliminarSede = (id) => {
    if (window.confirm('¿Confirmar eliminación? Verifica que no tenga productos/compras asociadas')) {
      setSedes(sedes.filter(s => s.id !== id));
      alert('Sede eliminada correctamente');
    }
  };

  return (
    <div className="modulo-content">
      <div className="modulo-header">
        <h2>🏢 Gestión de Sedes</h2>
        <button className="btn-primary" onClick={() => abrirModal()}>
          ➕ Nueva Sede
        </button>
      </div>

      <div className="tabla-container">
        <table className="tabla-datos">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Código</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sedes.map(sede => (
              <tr key={sede.id}>
                <td>{sede.id}</td>
                <td>{sede.nombre}</td>
                <td><span className="badge-codigo">{sede.codigo}</span></td>
                <td>
                  <span className={`badge-estado ${sede.activo ? 'activo' : 'inactivo'}`}>
                    {sede.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <button className="btn-accion editar" onClick={() => abrirModal(sede)}>
                    ✏️
                  </button>
                  <button className="btn-accion eliminar" onClick={() => eliminarSede(sede.id)}>
                    🗑️
                  </button>
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
                <label>Código de Sede *</label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={e => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                  placeholder="Ej: DM"
                  maxLength="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalAbierto(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={guardarSede}>
                {sedeEdit ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de Proveedores
const Proveedores = () => {
  const [proveedores, setProveedores] = useState([
    { id: 1, ruc: '20987654321', razonSocial: 'Repuestos Honda Perú SAC', telefono: '987654321', email: 'ventas@honda.pe' },
    { id: 2, ruc: '20123456789', razonSocial: 'Toyota Parts SAC', telefono: '912345678', email: 'contacto@toyota.pe' }
  ]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [proveedorEdit, setProveedorEdit] = useState(null);
  const [formData, setFormData] = useState({ ruc: '', razonSocial: '', telefono: '', email: '' });
  const [busqueda, setBusqueda] = useState('');

  const abrirModal = (proveedor = null) => {
    if (proveedor) {
      setProveedorEdit(proveedor);
      setFormData(proveedor);
    } else {
      setProveedorEdit(null);
      setFormData({ ruc: '', razonSocial: '', telefono: '', email: '' });
    }
    setModalAbierto(true);
  };

  const guardarProveedor = () => {
    if (!formData.ruc || !formData.razonSocial) {
      alert('Completa los campos obligatorios');
      return;
    }

    if (proveedorEdit) {
      setProveedores(proveedores.map(p => p.id === proveedorEdit.id ? { ...p, ...formData } : p));
      alert('Proveedor actualizado correctamente');
    } else {
      const nuevoProveedor = {
        id: proveedores.length + 1,
        ...formData
      };
      setProveedores([...proveedores, nuevoProveedor]);
      alert('Proveedor registrado correctamente');
    }
    setModalAbierto(false);
  };

  const eliminarProveedor = (id) => {
    if (window.confirm('¿Confirmar eliminación? Verifica que no tenga compras asociadas')) {
      setProveedores(proveedores.filter(p => p.id !== id));
      alert('Proveedor eliminado correctamente');
    }
  };

  const proveedoresFiltrados = proveedores.filter(p =>
    p.razonSocial.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.ruc.includes(busqueda)
  );

  return (
    <div className="modulo-content">
      <div className="modulo-header">
        <h2>📦 Gestión de Proveedores</h2>
        <div className="header-actions">
          <input
            type="text"
            placeholder="🔍 Buscar por RUC o razón social..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="input-busqueda-admin"
          />
          <button className="btn-primary" onClick={() => abrirModal()}>
            ➕ Nuevo Proveedor
          </button>
        </div>
      </div>

      <div className="tabla-container">
        <table className="tabla-datos">
          <thead>
            <tr>
              <th>ID</th>
              <th>RUC</th>
              <th>Razón Social</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedoresFiltrados.map(proveedor => (
              <tr key={proveedor.id}>
                <td>{proveedor.id}</td>
                <td><span className="badge-codigo">{proveedor.ruc}</span></td>
                <td>{proveedor.razonSocial}</td>
                <td>{proveedor.telefono}</td>
                <td>{proveedor.email}</td>
                <td>
                  <button className="btn-accion editar" onClick={() => abrirModal(proveedor)}>
                    ✏️
                  </button>
                  <button className="btn-accion eliminar" onClick={() => eliminarProveedor(proveedor.id)}>
                    🗑️
                  </button>
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
                <label>RUC *</label>
                <input
                  type="text"
                  value={formData.ruc}
                  onChange={e => setFormData({ ...formData, ruc: e.target.value })}
                  placeholder="20987654321"
                  maxLength="11"
                />
              </div>
              <div className="form-group">
                <label>Razón Social *</label>
                <input
                  type="text"
                  value={formData.razonSocial}
                  onChange={e => setFormData({ ...formData, razonSocial: e.target.value })}
                  placeholder="Repuestos SAC"
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
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalAbierto(false)}>
                Cancelar
              </button>
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

// Componente de Categorías
const Categorias = () => {
  const [categorias, setCategorias] = useState([
    { 
      id: 1, 
      nombre: 'Motor', 
      subcategorias: [
        { id: 101, nombre: 'Aceites' },
        { id: 102, nombre: 'Filtros' },
        { id: 103, nombre: 'Bujías' }
      ]
    },
    { 
      id: 2, 
      nombre: 'Frenos', 
      subcategorias: [
        { id: 201, nombre: 'Pastillas' },
        { id: 202, nombre: 'Discos' }
      ]
    }
  ]);
  const [modalCategoria, setModalCategoria] = useState(false);
  const [modalSubcategoria, setModalSubcategoria] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [formCategoria, setFormCategoria] = useState('');
  const [formSubcategoria, setFormSubcategoria] = useState('');

  const agregarCategoria = () => {
    if (!formCategoria) {
      alert('Ingresa el nombre de la categoría');
      return;
    }
    const nuevaCategoria = {
      id: categorias.length + 1,
      nombre: formCategoria,
      subcategorias: []
    };
    setCategorias([...categorias, nuevaCategoria]);
    setFormCategoria('');
    setModalCategoria(false);
    alert('Categoría creada correctamente');
  };

  const agregarSubcategoria = () => {
    if (!formSubcategoria || !categoriaSeleccionada) {
      alert('Selecciona una categoría e ingresa el nombre');
      return;
    }
    setCategorias(categorias.map(cat => {
      if (cat.id === categoriaSeleccionada.id) {
        return {
          ...cat,
          subcategorias: [...cat.subcategorias, {
            id: Date.now(),
            nombre: formSubcategoria
          }]
        };
      }
      return cat;
    }));
    setFormSubcategoria('');
    setModalSubcategoria(false);
    alert('Subcategoría creada correctamente');
  };

  const eliminarCategoria = (id) => {
    const categoria = categorias.find(c => c.id === id);
    if (categoria.subcategorias.length > 0) {
      alert('No se puede eliminar. Elimina primero las subcategorías');
      return;
    }
    if (window.confirm('¿Eliminar esta categoría?')) {
      setCategorias(categorias.filter(c => c.id !== id));
    }
  };

  const eliminarSubcategoria = (catId, subId) => {
    if (window.confirm('¿Eliminar esta subcategoría?')) {
      setCategorias(categorias.map(cat => {
        if (cat.id === catId) {
          return {
            ...cat,
            subcategorias: cat.subcategorias.filter(sub => sub.id !== subId)
          };
        }
        return cat;
      }));
    }
  };

  return (
    <div className="modulo-content">
      <div className="modulo-header">
        <h2>📂 Gestión de Categorías</h2>
        <button className="btn-primary" onClick={() => setModalCategoria(true)}>
          ➕ Nueva Categoría
        </button>
      </div>

      <div className="categorias-tree">
        {categorias.map(categoria => (
          <div key={categoria.id} className="categoria-item">
            <div className="categoria-header">
              <h3>📁 {categoria.nombre}</h3>
              <div className="categoria-acciones">
                <button 
                  className="btn-accion agregar"
                  onClick={() => {
                    setCategoriaSeleccionada(categoria);
                    setModalSubcategoria(true);
                  }}
                >
                  ➕ Subcategoría
                </button>
                <button 
                  className="btn-accion eliminar"
                  onClick={() => eliminarCategoria(categoria.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
            <div className="subcategorias-list">
              {categoria.subcategorias.map(sub => (
                <div key={sub.id} className="subcategoria-item">
                  <span>📄 {sub.nombre}</span>
                  <button 
                    className="btn-accion eliminar"
                    onClick={() => eliminarSubcategoria(categoria.id, sub.id)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
              {categoria.subcategorias.length === 0 && (
                <p className="empty-message">No hay subcategorías</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nueva Categoría */}
      {modalCategoria && (
        <div className="modal-overlay" onClick={() => setModalCategoria(false)}>
          <div className="modal-admin" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nueva Categoría Principal</h3>
              <button className="btn-cerrar" onClick={() => setModalCategoria(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nombre de la Categoría *</label>
                <input
                  type="text"
                  value={formCategoria}
                  onChange={e => setFormCategoria(e.target.value)}
                  placeholder="Ej: Motor, Transmisión"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalCategoria(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={agregarCategoria}>
                Crear Categoría
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nueva Subcategoría */}
      {modalSubcategoria && (
        <div className="modal-overlay" onClick={() => setModalSubcategoria(false)}>
          <div className="modal-admin" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nueva Subcategoría - {categoriaSeleccionada?.nombre}</h3>
              <button className="btn-cerrar" onClick={() => setModalSubcategoria(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nombre de la Subcategoría *</label>
                <input
                  type="text"
                  value={formSubcategoria}
                  onChange={e => setFormSubcategoria(e.target.value)}
                  placeholder="Ej: Aceites, Filtros"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalSubcategoria(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={agregarSubcategoria}>
                Crear Subcategoría
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de Usuarios
const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([
    { 
      id: 1, 
      usuario: 'admin', 
      nombreCompleto: 'Juan Pérez Administrador',
      email: 'admin@deybimotors.com',
      rol: 'Admin', 
      sede: 'deybimotors',
      estado: 'Activo',
      fechaCreacion: '2025-01-15'
    },
    { 
      id: 2, 
      usuario: 'vendedor1', 
      nombreCompleto: 'María García Ventas',
      email: 'maria@deybimotors.com',
      rol: 'Vendedor', 
      sede: 'deybiparts',
      estado: 'Activo',
      fechaCreacion: '2025-02-10'
    },
    { 
      id: 3, 
      usuario: 'almacenero1', 
      nombreCompleto: 'Carlos López Almacén',
      email: 'carlos@deybimotors.com',
      rol: 'Almacenero', 
      sede: 'debiauto',
      estado: 'Activo',
      fechaCreacion: '2025-03-01'
    }
  ]);
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalPassword, setModalPassword] = useState(false);
  const [usuarioEdit, setUsuarioEdit] = useState(null);
  const [usuarioPassword, setUsuarioPassword] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroSede, setFiltroSede] = useState('');
  const [formData, setFormData] = useState({
    usuario: '',
    nombreCompleto: '',
    email: '',
    password: '',
    rol: 'Vendedor',
    sede: 'deybimotors',
    estado: 'Activo'
  });
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');

  const roles = ['Admin', 'Vendedor', 'Almacenero'];
  const sedes = [
    { id: 'deybimotors', nombre: 'Deybimotors' },
    { id: 'deybiparts', nombre: 'Deybi Parts' },
    { id: 'debiauto', nombre: 'Deybi Auto' }
  ];

  const abrirModal = (usuario = null) => {
    if (usuario) {
      setUsuarioEdit(usuario);
      setFormData({
        usuario: usuario.usuario,
        nombreCompleto: usuario.nombreCompleto,
        email: usuario.email,
        password: '',
        rol: usuario.rol,
        sede: usuario.sede,
        estado: usuario.estado
      });
    } else {
      setUsuarioEdit(null);
      setFormData({
        usuario: '',
        nombreCompleto: '',
        email: '',
        password: '',
        rol: 'Vendedor',
        sede: 'deybimotors',
        estado: 'Activo'
      });
    }
    setModalAbierto(true);
  };

  const abrirModalPassword = (usuario) => {
    setUsuarioPassword(usuario);
    setNuevaPassword('');
    setConfirmarPassword('');
    setModalPassword(true);
  };

  const guardarUsuario = () => {
    if (!formData.usuario || !formData.nombreCompleto || !formData.email) {
      alert('Completa los campos obligatorios');
      return;
    }

    if (!usuarioEdit && !formData.password) {
      alert('Ingresa una contraseña para el nuevo usuario');
      return;
    }

    if (usuarioEdit) {
      setUsuarios(usuarios.map(u => 
        u.id === usuarioEdit.id ? { ...u, ...formData } : u
      ));
      alert('Usuario actualizado correctamente');
    } else {
      const nuevoUsuario = {
        id: usuarios.length + 1,
        ...formData,
        fechaCreacion: new Date().toISOString().split('T')[0]
      };
      setUsuarios([...usuarios, nuevoUsuario]);
      alert('Usuario creado correctamente');
    }
    setModalAbierto(false);
  };

  const cambiarPassword = () => {
    if (!nuevaPassword || !confirmarPassword) {
      alert('Completa ambos campos de contraseña');
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (nuevaPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    alert(`Contraseña actualizada correctamente para ${usuarioPassword.nombreCompleto}`);
    setModalPassword(false);
  };

  const cambiarEstado = (id) => {
    setUsuarios(usuarios.map(u => 
      u.id === id ? { ...u, estado: u.estado === 'Activo' ? 'Inactivo' : 'Activo' } : u
    ));
  };

  const eliminarUsuario = (id, usuario) => {
    if (usuario.rol === 'Admin' && usuarios.filter(u => u.rol === 'Admin').length === 1) {
      alert('No puedes eliminar al único administrador del sistema');
      return;
    }

    if (window.confirm(`¿Confirmar eliminación del usuario "${usuario.nombreCompleto}"?`)) {
      setUsuarios(usuarios.filter(u => u.id !== id));
      alert('Usuario eliminado correctamente');
    }
  };

  const usuariosFiltrados = usuarios.filter(u => {
    const cumpleBusqueda = u.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
                          u.usuario.toLowerCase().includes(busqueda.toLowerCase()) ||
                          u.email.toLowerCase().includes(busqueda.toLowerCase());
    const cumpleRol = !filtroRol || u.rol === filtroRol;
    const cumpleSede = !filtroSede || u.sede === filtroSede;
    
    return cumpleBusqueda && cumpleRol && cumpleSede;
  });

  const getSedeNombre = (sedeId) => {
    return sedes.find(s => s.id === sedeId)?.nombre || sedeId;
  };

  return (
    <div className="modulo-content">
      <div className="modulo-header">
        <h2>👥 Gestión de Usuarios</h2>
        <button className="btn-primary" onClick={() => abrirModal()}>
          ➕ Nuevo Usuario
        </button>
      </div>

      {/* Filtros */}
      <div className="filtros-usuarios">
        <input
          type="text"
          placeholder="🔍 Buscar por nombre, usuario o email..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="input-busqueda-admin"
        />
        
        <select 
          value={filtroRol}
          onChange={e => setFiltroRol(e.target.value)}
          className="select-filtro-admin"
        >
          <option value="">📋 Todos los Roles</option>
          {roles.map(rol => (
            <option key={rol} value={rol}>{rol}</option>
          ))}
        </select>

        <select 
          value={filtroSede}
          onChange={e => setFiltroSede(e.target.value)}
          className="select-filtro-admin"
        >
          <option value="">🏢 Todas las Sedes</option>
          {sedes.map(sede => (
            <option key={sede.id} value={sede.id}>{sede.nombre}</option>
          ))}
        </select>
      </div>

      {/* Estadísticas rápidas */}
      <div className="usuarios-stats">
        <div className="stat-box">
          <span className="stat-icon">👥</span>
          <div className="stat-info">
            <span className="stat-number">{usuarios.length}</span>
            <span className="stat-label">Total Usuarios</span>
          </div>
        </div>
        <div className="stat-box">
          <span className="stat-icon">✅</span>
          <div className="stat-info">
            <span className="stat-number">{usuarios.filter(u => u.estado === 'Activo').length}</span>
            <span className="stat-label">Activos</span>
          </div>
        </div>
        <div className="stat-box">
          <span className="stat-icon">👑</span>
          <div className="stat-info">
            <span className="stat-number">{usuarios.filter(u => u.rol === 'Admin').length}</span>
            <span className="stat-label">Administradores</span>
          </div>
        </div>
        <div className="stat-box">
          <span className="stat-icon">💼</span>
          <div className="stat-info">
            <span className="stat-number">{usuarios.filter(u => u.rol === 'Vendedor').length}</span>
            <span className="stat-label">Vendedores</span>
          </div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="tabla-container">
        <table className="tabla-datos">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Nombre Completo</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Sede</th>
              <th>Estado</th>
              <th>Fecha Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map(usuario => (
              <tr key={usuario.id}>
                <td>{usuario.id}</td>
                <td>
                  <span className="badge-codigo">{usuario.usuario}</span>
                </td>
                <td>
                  <strong>{usuario.nombreCompleto}</strong>
                </td>
                <td>{usuario.email}</td>
                <td>
                  <span className={`badge-rol ${usuario.rol.toLowerCase()}`}>
                    {usuario.rol === 'Admin' && '👑 '}
                    {usuario.rol === 'Vendedor' && '💼 '}
                    {usuario.rol === 'Almacenero' && '📦 '}
                    {usuario.rol}
                  </span>
                </td>
                <td>{getSedeNombre(usuario.sede)}</td>
                <td>
                  <span 
                    className={`badge-estado ${usuario.estado.toLowerCase()} clickable`}
                    onClick={() => cambiarEstado(usuario.id)}
                    title="Click para cambiar estado"
                  >
                    {usuario.estado}
                  </span>
                </td>
                <td>{usuario.fechaCreacion}</td>
                <td>
                  <button 
                    className="btn-accion editar" 
                    onClick={() => abrirModal(usuario)}
                    title="Editar usuario"
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-accion password" 
                    onClick={() => abrirModalPassword(usuario)}
                    title="Cambiar contraseña"
                  >
                    🔑
                  </button>
                  <button 
                    className="btn-accion eliminar" 
                    onClick={() => eliminarUsuario(usuario.id, usuario)}
                    title="Eliminar usuario"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {usuariosFiltrados.length === 0 && (
          <div className="empty-state-table">
            <span className="empty-icon">🔍</span>
            <p>No se encontraron usuarios</p>
            <small>Intenta con otros filtros de búsqueda</small>
          </div>
        )}
      </div>

      {/* Modal Crear/Editar Usuario */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
          <div className="modal-admin modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{usuarioEdit ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}</h3>
              <button className="btn-cerrar" onClick={() => setModalAbierto(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Usuario * <small>(nombre de acceso)</small></label>
                  <input
                    type="text"
                    value={formData.usuario}
                    onChange={e => setFormData({ ...formData, usuario: e.target.value.toLowerCase().replace(/\s/g, '') })}
                    placeholder="usuario123"
                    disabled={!!usuarioEdit}
                  />
                  {usuarioEdit && <small className="help-text">El nombre de usuario no puede modificarse</small>}
                </div>

                <div className="form-group">
                  <label>Nombre Completo *</label>
                  <input
                    type="text"
                    value={formData.nombreCompleto}
                    onChange={e => setFormData({ ...formData, nombreCompleto: e.target.value })}
                    placeholder="Juan Pérez García"
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="usuario@deybimotors.com"
                  />
                </div>

                {!usuarioEdit && (
                  <div className="form-group">
                    <label>Contraseña *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Rol *</label>
                  <select
                    value={formData.rol}
                    onChange={e => setFormData({ ...formData, rol: e.target.value })}
                  >
                    {roles.map(rol => (
                      <option key={rol} value={rol}>{rol}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Sede Asignada *</label>
                  <select
                    value={formData.sede}
                    onChange={e => setFormData({ ...formData, sede: e.target.value })}
                  >
                    {sedes.map(sede => (
                      <option key={sede.id} value={sede.id}>{sede.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Estado</label>
                  <select
                    value={formData.estado}
                    onChange={e => setFormData({ ...formData, estado: e.target.value })}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="form-info">
                <p><strong>Información sobre Roles:</strong></p>
                <ul>
                  <li>👑 <strong>Admin:</strong> Acceso completo a todas las funciones del sistema</li>
                  <li>💼 <strong>Vendedor:</strong> Gestión de ventas y consulta de productos</li>
                  <li>📦 <strong>Almacenero:</strong> Gestión de inventario, compras y movimientos</li>
                </ul>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalAbierto(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={guardarUsuario}>
                {usuarioEdit ? 'Actualizar Usuario' : 'Crear Usuario'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cambiar Contraseña */}
      {modalPassword && usuarioPassword && (
        <div className="modal-overlay" onClick={() => setModalPassword(false)}>
          <div className="modal-admin" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔑 Cambiar Contraseña</h3>
              <button className="btn-cerrar" onClick={() => setModalPassword(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="usuario-info-box">
                <p><strong>Usuario:</strong> {usuarioPassword.usuario}</p>
                <p><strong>Nombre:</strong> {usuarioPassword.nombreCompleto}</p>
              </div>

              <div className="form-group">
                <label>Nueva Contraseña *</label>
                <input
                  type="password"
                  value={nuevaPassword}
                  onChange={e => setNuevaPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div className="form-group">
                <label>Confirmar Contraseña *</label>
                <input
                  type="password"
                  value={confirmarPassword}
                  onChange={e => setConfirmarPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                />
              </div>

              <div className="alert-info">
                ⚠️ El usuario deberá usar la nueva contraseña en su próximo inicio de sesión
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalPassword(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={cambiarPassword}>
                Cambiar Contraseña
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de Marcas y Modelos
const MarcasModelos = () => {
  const [marcas, setMarcas] = useState([
    { 
      id: 1, 
      nombre: 'Toyota', 
      modelos: [
        { id: 101, nombre: 'Corolla' },
        { id: 102, nombre: 'Hilux' },
        { id: 103, nombre: 'RAV4' }
      ]
    },
    { 
      id: 2, 
      nombre: 'Honda', 
      modelos: [
        { id: 201, nombre: 'Civic' },
        { id: 202, nombre: 'CR-V' }
      ]
    },
    { 
      id: 3, 
      nombre: 'Nissan', 
      modelos: [
        { id: 301, nombre: 'Sentra' },
        { id: 302, nombre: 'X-Trail' }
      ]
    }
  ]);
  const [modalMarca, setModalMarca] = useState(false);
  const [modalModelo, setModalModelo] = useState(false);
  const [modalEditMarca, setModalEditMarca] = useState(false);
  const [modalEditModelo, setModalEditModelo] = useState(false);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState(null);
  const [modeloSeleccionado, setModeloSeleccionado] = useState(null);
  const [formMarca, setFormMarca] = useState('');
  const [formModelo, setFormModelo] = useState('');

  const agregarMarca = () => {
    if (!formMarca) {
      alert('Ingresa el nombre de la marca');
      return;
    }
    const nuevaMarca = {
      id: marcas.length + 1,
      nombre: formMarca,
      modelos: []
    };
    setMarcas([...marcas, nuevaMarca]);
    setFormMarca('');
    setModalMarca(false);
    alert('Marca creada correctamente');
  };

  const editarMarca = () => {
    if (!formMarca) {
      alert('Ingresa el nombre de la marca');
      return;
    }
    setMarcas(marcas.map(m => 
      m.id === marcaSeleccionada.id ? { ...m, nombre: formMarca } : m
    ));
    setModalEditMarca(false);
    setFormMarca('');
    alert('Marca actualizada correctamente');
  };

  const agregarModelo = () => {
    if (!formModelo || !marcaSeleccionada) {
      alert('Selecciona una marca e ingresa el nombre del modelo');
      return;
    }
    setMarcas(marcas.map(marca => {
      if (marca.id === marcaSeleccionada.id) {
        return {
          ...marca,
          modelos: [...marca.modelos, {
            id: Date.now(),
            nombre: formModelo
          }]
        };
      }
      return marca;
    }));
    setFormModelo('');
    setModalModelo(false);
    alert('Modelo creado correctamente');
  };

  const editarModelo = () => {
    if (!formModelo) {
      alert('Ingresa el nombre del modelo');
      return;
    }
    setMarcas(marcas.map(marca => {
      if (marca.id === marcaSeleccionada.id) {
        return {
          ...marca,
          modelos: marca.modelos.map(modelo =>
            modelo.id === modeloSeleccionado.id 
              ? { ...modelo, nombre: formModelo }
              : modelo
          )
        };
      }
      return marca;
    }));
    setModalEditModelo(false);
    setFormModelo('');
    alert('Modelo actualizado correctamente');
  };

  const eliminarMarca = (id) => {
    const marca = marcas.find(m => m.id === id);
    if (marca.modelos.length > 0) {
      alert('No se puede eliminar. Elimina primero los modelos asociados');
      return;
    }
    if (window.confirm(`¿Eliminar la marca "${marca.nombre}"?`)) {
      setMarcas(marcas.filter(m => m.id !== id));
      alert('Marca eliminada correctamente');
    }
  };

  const eliminarModelo = (marcaId, modeloId) => {
    if (window.confirm('¿Eliminar este modelo? Verifica que no tenga productos asignados')) {
      setMarcas(marcas.map(marca => {
        if (marca.id === marcaId) {
          return {
            ...marca,
            modelos: marca.modelos.filter(modelo => modelo.id !== modeloId)
          };
        }
        return marca;
      }));
      alert('Modelo eliminado correctamente');
    }
  };

  const abrirEditarMarca = (marca) => {
    setMarcaSeleccionada(marca);
    setFormMarca(marca.nombre);
    setModalEditMarca(true);
  };

  const abrirEditarModelo = (marca, modelo) => {
    setMarcaSeleccionada(marca);
    setModeloSeleccionado(modelo);
    setFormModelo(modelo.nombre);
    setModalEditModelo(true);
  };

  return (
    <div className="modulo-content">
      <div className="modulo-header">
        <h2>🚗 Gestión de Marcas y Modelos</h2>
        <button className="btn-primary" onClick={() => setModalMarca(true)}>
          ➕ Nueva Marca
        </button>
      </div>

      <div className="marcas-tree">
        {marcas.map(marca => (
          <div key={marca.id} className="marca-item">
            <div className="marca-header">
              <h3>🚗 {marca.nombre}</h3>
              <div className="marca-acciones">
                <button 
                  className="btn-accion agregar"
                  onClick={() => {
                    setMarcaSeleccionada(marca);
                    setModalModelo(true);
                  }}
                >
                  ➕ Modelo
                </button>
                <button 
                  className="btn-accion editar"
                  onClick={() => abrirEditarMarca(marca)}
                >
                  ✏️
                </button>
                <button 
                  className="btn-accion eliminar"
                  onClick={() => eliminarMarca(marca.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
            <div className="modelos-list">
              {marca.modelos.map(modelo => (
                <div key={modelo.id} className="modelo-item">
                  <span>🚘 {modelo.nombre}</span>
                  <div className="modelo-acciones">
                    <button 
                      className="btn-accion-mini editar"
                      onClick={() => abrirEditarModelo(marca, modelo)}
                      title="Editar modelo"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-accion-mini eliminar"
                      onClick={() => eliminarModelo(marca.id, modelo.id)}
                      title="Eliminar modelo"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
              {marca.modelos.length === 0 && (
                <p className="empty-message">No hay modelos registrados</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nueva Marca */}
      {modalMarca && (
        <div className="modal-overlay" onClick={() => setModalMarca(false)}>
          <div className="modal-admin" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nueva Marca de Automóvil</h3>
              <button className="btn-cerrar" onClick={() => setModalMarca(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nombre de la Marca *</label>
                <input
                  type="text"
                  value={formMarca}
                  onChange={e => setFormMarca(e.target.value)}
                  placeholder="Ej: Toyota, Honda, Nissan"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalMarca(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={agregarMarca}>
                Crear Marca
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Marca */}
      {modalEditMarca && (
        <div className="modal-overlay" onClick={() => setModalEditMarca(false)}>
          <div className="modal-admin" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Marca</h3>
              <button className="btn-cerrar" onClick={() => setModalEditMarca(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nombre de la Marca *</label>
                <input
                  type="text"
                  value={formMarca}
                  onChange={e => setFormMarca(e.target.value)}
                  placeholder="Ej: Toyota, Honda, Nissan"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalEditMarca(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={editarMarca}>
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Modelo */}
      {modalModelo && (
        <div className="modal-overlay" onClick={() => setModalModelo(false)}>
          <div className="modal-admin" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nuevo Modelo - {marcaSeleccionada?.nombre}</h3>
              <button className="btn-cerrar" onClick={() => setModalModelo(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nombre del Modelo *</label>
                <input
                  type="text"
                  value={formModelo}
                  onChange={e => setFormModelo(e.target.value)}
                  placeholder="Ej: Corolla, Civic, Sentra"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalModelo(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={agregarModelo}>
                Crear Modelo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Modelo */}
      {modalEditModelo && (
        <div className="modal-overlay" onClick={() => setModalEditModelo(false)}>
          <div className="modal-admin" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Modelo - {marcaSeleccionada?.nombre}</h3>
              <button className="btn-cerrar" onClick={() => setModalEditModelo(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nombre del Modelo *</label>
                <input
                  type="text"
                  value={formModelo}
                  onChange={e => setFormModelo(e.target.value)}
                  placeholder="Ej: Corolla, Civic, Sentra"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalEditModelo(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={editarModelo}>
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente Principal de Administración
function Administracion({ modulo = 'sedes' }) {
  const [moduloActivo, setModuloActivo] = useState(modulo);

  // Actualizar cuando cambia el prop
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