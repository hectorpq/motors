import React from 'react';
import './Header.css';

function Header({ toggleSidebar, isSidebarOpen }) {
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
      </div>
    </header>
  );
}

export default Header;