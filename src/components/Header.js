import React from 'react';
import { logout } from '../services/api';
import './Header.css';

function Header({ toggleSidebar, isSidebarOpen, user }) {
  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de cerrar sesión?')) {
      logout();
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          {isSidebarOpen ? '◀' : '▶'}
        </button>
        <h1 className="page-title">Sistema de Inventario</h1>
      </div>

      <div className="header-right">
        <div className="header-search">
          <input type="text" placeholder="Buscar productos..." />
          <span className="search-icon">🔍</span>
        </div>

        {user && (
          <div className="user-info">
            <div className="user-details">
              <span className="user-name">{user.nombreCompleto}</span>
              <span className="user-role">{user.rol}</span>
            </div>
            <div className="user-avatar">
              {user.nombreCompleto?.charAt(0).toUpperCase()}
            </div>
            <button onClick={handleLogout} className="btn-logout" title="Cerrar Sesión">
              🚪
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;