import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({
    productos: false,
    compras: false,
    administracion: false
  });

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isParentActive = (paths) => {
    return paths.some(path => location.pathname.startsWith(path));
  };

  return (
    <>
      {/* Overlay para móviles */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose}></div>
      )}

      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        {/* Logo */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">🚗</span>
            <h2 className="logo-text">Deybimotors</h2>
          </div>
          <p className="sidebar-subtitle">Repuestos Automotrices</p>
        </div>

        {/* Navegación */}
        <nav className="sidebar-nav">
          {/* Dashboard */}
          <Link 
            to="/" 
            className={`nav-item ${isActive('/') ? 'active' : ''}`}
            onClick={onClose}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Dashboard</span>
          </Link>

          {/* Productos con submenú */}
          <div className="nav-section">
            <div 
              className={`nav-item parent ${isParentActive(['/productos']) ? 'active' : ''}`}
              onClick={() => toggleMenu('productos')}
            >
              <span className="nav-icon">📦</span>
              <span className="nav-text">Productos</span>
              <span className={`nav-arrow ${expandedMenus.productos ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>
            {expandedMenus.productos && (
              <div className="submenu">
                <Link 
                  to="/productos" 
                  className={`submenu-item ${isActive('/productos') ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <span className="submenu-icon">•</span>
                  <span>Gestión</span>
                </Link>
                <Link 
                  to="/productos/ventas" 
                  className={`submenu-item ${isActive('/productos/ventas') ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <span className="submenu-icon">•</span>
                  <span>Ventas</span>
                </Link>
              </div>
            )}
          </div>

          {/* Movimientos (Kardex) */}
          <Link 
            to="/movimientos" 
            className={`nav-item ${isActive('/movimientos') ? 'active' : ''}`}
            onClick={onClose}
          >
            <span className="nav-icon">📋</span>
            <span className="nav-text">Kardex</span>
          </Link>

          {/* Compras con submenú */}
          <div className="nav-section">
            <div 
              className={`nav-item parent ${isParentActive(['/compras']) ? 'active' : ''}`}
              onClick={() => toggleMenu('compras')}
            >
              <span className="nav-icon">🛒</span>
              <span className="nav-text">Compras</span>
              <span className={`nav-arrow ${expandedMenus.compras ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>
            {expandedMenus.compras && (
              <div className="submenu">
                <Link 
                  to="/compras/facturas" 
                  className={`submenu-item ${isActive('/compras/facturas') ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <span className="submenu-icon">•</span>
                  <span>Facturas</span>
                </Link>
                <Link 
                  to="/compras/registro" 
                  className={`submenu-item ${isActive('/compras/registro') ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <span className="submenu-icon">•</span>
                  <span>Registro</span>
                </Link>
              </div>
            )}
          </div>

          {/* Etiquetas - NUEVO */}
          <Link 
            to="/etiquetas" 
            className={`nav-item ${isActive('/etiquetas') ? 'active' : ''}`}
            onClick={onClose}
          >
            <span className="nav-icon">🏷️</span>
            <span className="nav-text">Etiquetas</span>
          </Link>

          {/* Separador */}
          <div className="nav-divider"></div>

          {/* Administración con submenú - NUEVO */}
          <div className="nav-section">
            <div 
              className={`nav-item parent ${isParentActive(['/administracion']) ? 'active' : ''}`}
              onClick={() => toggleMenu('administracion')}
            >
              <span className="nav-icon">⚙️</span>
              <span className="nav-text">Administración</span>
              <span className={`nav-arrow ${expandedMenus.administracion ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>
            {expandedMenus.administracion && (
              <div className="submenu">
                <Link 
                  to="/administracion/sedes" 
                  className={`submenu-item ${isActive('/administracion/sedes') ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <span className="submenu-icon">•</span>
                  <span>Sedes</span>
                </Link>
                <Link 
                  to="/administracion/proveedores" 
                  className={`submenu-item ${isActive('/administracion/proveedores') ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <span className="submenu-icon">•</span>
                  <span>Proveedores</span>
                </Link>
                <Link 
                  to="/administracion/categorias" 
                  className={`submenu-item ${isActive('/administracion/categorias') ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <span className="submenu-icon">•</span>
                  <span>Categorías</span>
                </Link>
                <Link 
                  to="/administracion/marcas" 
                  className={`submenu-item ${isActive('/administracion/marcas') ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <span className="submenu-icon">•</span>
                  <span>Marcas y Modelos</span>
                </Link>
                <Link 
                  to="/administracion/usuarios" 
                  className={`submenu-item ${isActive('/administracion/usuarios') ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <span className="submenu-icon">•</span>
                  <span>Usuarios</span>
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Footer del Sidebar */}
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">👤</div>
            <div className="user-details">
              <span className="user-name">Admin</span>
              <span className="user-role">Administrador</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;