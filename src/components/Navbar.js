import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>🏍️ DeybiMotors</h1>
      </div>
      <ul className="navbar-menu">
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/productos">Productos</Link></li>
        <li><Link to="/movimientos">Movimientos</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;