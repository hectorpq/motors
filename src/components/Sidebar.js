import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});

  const toggleSubmenu = (menuKey) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const handleMenuClick = () => {
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  const menuItems = [
    { 
      path: '/', 
      icon: '📊', 
      label: 'Dashboard',
      key: 'dashboard'
    },
    { 
      icon: '📦', 
      label: 'Productos',
      key: 'productos',
      submenu: [
        { path: '/productos', icon: '🔧', label: 'Gestión' },
        { path: '/productos/ventas', icon: '💰', label: 'Ventas' }
      ]
    },
    { 
      path: '/movimientos', 
      icon: '📝', 
      label: 'Movimientos',
      key: 'movimientos'
    },
    { 
      icon: '🛒', 
      label: 'Compras',
      key: 'compras',
      submenu: [
        { path: '/compras/facturas', icon: '📄', label: 'Facturas' },
        { path: '/compras/registro', icon: '📝', label: 'Registro' }
      ]
    }
  ];

  const isMenuActive = (item) => {
    if (item.path) {
      return location.pathname === item.path;
    }
    if (item.submenu) {
      return item.submenu.some(sub => location.pathname === sub.path);
    }
    return false;
  };

  return (
    <>
      {isOpen && window.innerWidth <= 768 && (
        <div className="sidebar-overlay" onClick={onClose}></div>
      )}
      
      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🏍️</span>
            {isOpen && <span className="logo-text">Deybimotors</span>}
          </div>
          {isOpen && <p className="logo-subtitle">Repuestos Automotrices</p>}
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <div key={item.key} className="menu-item-wrapper">
              {item.submenu ? (
                <>
                  <div
                    className={`menu-item ${isMenuActive(item) ? 'active' : ''} ${openMenus[item.key] ? 'expanded' : ''}`}
                    onClick={() => toggleSubmenu(item.key)}
                  >
                    <span className="menu-icon">{item.icon}</span>
                    {isOpen && (
                      <>
                        <span className="menu-label">{item.label}</span>
                        <span className="submenu-arrow">
                          {openMenus[item.key] ? '▼' : '▶'}
                        </span>
                      </>
                    )}
                  </div>
                  {isOpen && openMenus[item.key] && (
                    <div className="submenu">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`submenu-item ${location.pathname === subItem.path ? 'active' : ''}`}
                          onClick={handleMenuClick}
                        >
                          <span className="submenu-icon">{subItem.icon}</span>
                          <span className="submenu-label">{subItem.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.path}
                  className={`menu-item ${isMenuActive(item) ? 'active' : ''}`}
                  onClick={handleMenuClick}
                >
                  <span className="menu-icon">{item.icon}</span>
                  {isOpen && <span className="menu-label">{item.label}</span>}
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-avatar">👤</span>
            {isOpen && (
              <div className="user-details">
                <span className="user-name">Admin</span>
                <span className="user-role">Administrador</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;