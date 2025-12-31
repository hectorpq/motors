import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from './services/api';
import Login from './components/Login';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Productos from './components/Productos';
import ProductoDetalle from './components/ProductoDetalle';
import ProductoEditar from './components/ProductoEditar';
import ProductoVentas from './components/ProductoVentas';
import Kardex from './components/Kardex'; // Cambiado de Movimientos a Kardex
import Compras from './components/Compras';
import Facturas from './components/Facturas';
import ComprasRegistro from './components/ComprasRegistro';
import Etiquetas from './components/Etiquetas';
import Stock from './components/Stock';
import Administracion from './components/Administracion';
import './App.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        const currentUser = getCurrentUser();
        setUser(currentUser);
        setAuthenticated(true);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Detectar tamaño de pantalla inicial
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setAuthenticated(true);
  };

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '20px',
        color: '#667eea',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <div>Cargando aplicación...</div>
      </div>
    );
  }

  // Si no está autenticado, mostrar Login
  if (!authenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Si está autenticado, mostrar la aplicación
  return (
    <Router>
      <div className="app">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} user={user} />
        <div className={`main-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} user={user} />
          <main className="main-content">
            <Routes>
              {/* Dashboard */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Productos */}
              <Route path="/productos" element={<Productos />} />
              <Route path="/productos/:id" element={<ProductoDetalle />} />
              <Route path="/productos/editar/:id" element={<ProductoEditar />} />
              
              {/* Ventas */}
              <Route path="/ventas" element={<ProductoVentas />} />
              <Route path="/productos/ventas" element={<ProductoVentas />} />
              
              {/* Kardex (Movimientos) */}
              <Route path="/kardex" element={<Kardex />} />
              <Route path="/movimientos" element={<Kardex />} />
              
              {/* Stock */}
              <Route path="/stock" element={<Stock />} />
              
              {/* Compras */}
              <Route path="/compras" element={<Compras />} />
              <Route path="/compras/nuevo" element={<ComprasRegistro />} />
              <Route path="/compras/registro" element={<ComprasRegistro />} />
              <Route path="/compras/facturas" element={<Facturas />} />
              <Route path="/facturas" element={<Facturas />} />
              
              {/* Etiquetas */}
              <Route path="/etiquetas" element={<Etiquetas />} />
              
              {/* Administración */}
              <Route path="/administracion" element={<Administracion modulo="sedes" />} />
              <Route path="/administracion/sedes" element={<Administracion modulo="sedes" />} />
              <Route path="/administracion/proveedores" element={<Administracion modulo="proveedores" />} />
              <Route path="/administracion/categorias" element={<Administracion modulo="categorias" />} />
              <Route path="/administracion/marcas" element={<Administracion modulo="marcas" />} />
              <Route path="/administracion/usuarios" element={<Administracion modulo="usuarios" />} />

              {/* Ruta por defecto - redirigir al dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;