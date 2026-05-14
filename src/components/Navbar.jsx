import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/logo.png';

const Navbar = ({ cartCount = 0, user, onAddItem }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <img src={logo} alt="Cup & Petal Logo" />
        <h3 className='logo-name'>Cup<span className='and'>&</span>Petal</h3>
      </div>

      <div className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
        <li className="navbar-item">
          <Link to="/" onClick={closeMenu}>Home</Link>
        </li>
        <li className="navbar-item">
          <Link to="/products?category=cakes" onClick={closeMenu}>Cakes</Link>
        </li>
        <li className="navbar-item">
          <Link to="/products?category=flowers" onClick={closeMenu}>Flowers</Link>
        </li>
        <li className="navbar-item">
          <Link to="/gifts" onClick={closeMenu}>Gifts</Link>
        </li>
        <li className="navbar-item">
          <Link to="/plants" onClick={closeMenu}>Plants</Link>
        </li>
        {user?.role === 'admin' && (
          <li className="navbar-item">
            <Link to="/orders" className="admin-link" onClick={closeMenu}>Manage Orders</Link>
          </li>
        )}
        {user?.role === 'delivery' && (
          <li className="navbar-item">
            <Link to="/delivery-orders" className="delivery-link" onClick={closeMenu}>My Assignments</Link>
          </li>
        )}
        {user?.role === 'customer' && (
          <li className="navbar-item">
            <Link to="/orders" onClick={closeMenu}>My Orders</Link>
          </li>
        )}
      </ul>

      <div className="navbar-icons">
        {user && (
          <span className="user-greeting">
            {user.role === 'admin' && <span className="admin-badge">ADMIN 👑</span>}
            Hi, {user.name || 'User'}!
          </span>
        )}
        {user?.role === 'admin' && onAddItem && !isHomePage && (
          <button className="navbar-icon" onClick={onAddItem} title="Add New Product" style={{ border: 'none', fontSize: '24px' }}>
            +
          </button>
        )}
        <Link to="/cart" className="navbar-icon">
          🛒
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </Link>
        <Link to="/login" className="navbar-icon" title={user?.role === 'admin' ? 'Admin Profile' : (user?.role === 'delivery' ? 'Delivery Profile' : 'Profile')}>
          {user?.role === 'admin' ? '👑' : (user?.role === 'delivery' ? '🚚' : '👤')}
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;