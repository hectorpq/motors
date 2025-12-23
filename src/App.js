import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Productos from './components/Productos';
import ProductoDetalle from './components/ProductoDetalle';
import ProductoEditar from './components/ProductoEditar'; // ← NUEVA IMPORTACIÓN
import ProductoVentas from './components/ProductoVentas';
import Movimientos from './components/Movimientos';
import Compras from './components/Compras';
import Facturas from './components/Facturas';
import ComprasRegistro from './components/ComprasRegistro';
import './App.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Detectar tamaño de pantalla inicial
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Ejecutar al cargar
    handleResize();

    // Escuchar cambios de tamaño
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

  return (
    <Router>
      <div className="app">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        <div className={`main-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              
              {/* Rutas de Productos */}
              <Route path="/productos" element={<Productos />} />
              <Route path="/productos/:id" element={<ProductoDetalle />} />
              <Route path="/productos/editar/:id" element={<ProductoEditar />} /> {/* ← NUEVA RUTA */}
              <Route path="/productos/ventas" element={<ProductoVentas />} />
              
              {/* Otras rutas */}
              <Route path="/movimientos" element={<Movimientos />} />
              <Route path="/compras" element={<Compras />} />
              
              {/* Rutas de Compras */}
              <Route path="/compras/facturas" element={<Facturas />} />
              <Route path="/compras/registro" element={<ComprasRegistro />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;