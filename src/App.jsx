import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Admin from './admin/Admin.jsx';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AddProductModal from './components/AddProductModal';

// Pages
import Home from './modules/home/Home.jsx';
import Products from './modules/products/Products.jsx';
import ProductDetails from './modules/productdetails/Productdetails.jsx';
import Gifts from './modules/gifts/Gifts.jsx';
import Plants from './modules/plants/Plants.jsx';
import Cart from './modules/cart/Cart.jsx';
import Checkout from './modules/checkout/Checkout.jsx';
import Login from './login/Login.jsx';
import Signup from './login/Signup.jsx';
import Orders from './modules/orders/Orders.jsx';
import DeliveryOrders from './modules/orders/DeliveryOrders.jsx';
import TrackOrders from './modules/trackorders/TrackOrders.jsx';

// Inner component that uses useNavigate (must be inside Router)
function AppContent() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => Boolean(localStorage.getItem('token') && localStorage.getItem('user'))
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ── Cart handlers ──────────────────────────────────────────────────────────
  const handleAddToCart = (product) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === product.id);
      if (existing) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + (product.quantity || 1) }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: product.quantity || 1 }];
    });
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const clearCart = () => setCartItems([]);

  // ── Auth handlers ──────────────────────────────────────────────────────────
  const handleAuthSuccess = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsLoggedIn(false);
    navigate('/login');
  };

  // ── Product refresh ────────────────────────────────────────────────────────
  const handleProductAdded = () => setRefreshTrigger((prev) => prev + 1);

  return (
    <div className="main-container">
      {isLoggedIn && (
        <Navbar
          cartCount={cartItems.length}
          user={user}
          onAddItem={user?.role === 'admin' ? () => setIsModalOpen(true) : null}
          onLogout={handleLogout}
        />
      )}

      <div className={`content ${isLoggedIn ? 'with-navbar' : ''}`}>
        <Routes>
          {/* Home */}
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <Home
                  onAddToCart={handleAddToCart}
                  refreshTrigger={refreshTrigger}
                  isAdmin={user?.role === 'admin'}
                  onDeleteSuccess={handleProductAdded}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Products */}
          <Route
            path="/products"
            element={
              isLoggedIn ? (
                <Products
                  onAddToCart={handleAddToCart}
                  refreshTrigger={refreshTrigger}
                  isAdmin={user?.role === 'admin'}
                  onDeleteSuccess={handleProductAdded}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Product detail */}
          <Route
            path="/product/:id"
            element={
              isLoggedIn ? (
                <ProductDetails
                  onAddToCart={handleAddToCart}
                  isAdmin={user?.role === 'admin'}
                  onDeleteSuccess={handleProductAdded}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Gifts */}
          <Route
            path="/gifts"
            element={
              isLoggedIn ? (
                <Gifts
                  onAddToCart={handleAddToCart}
                  refreshTrigger={refreshTrigger}
                  isAdmin={user?.role === 'admin'}
                  onDeleteSuccess={handleProductAdded}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Plants */}
          <Route
            path="/plants"
            element={
              isLoggedIn ? (
                <Plants
                  onAddToCart={handleAddToCart}
                  refreshTrigger={refreshTrigger}
                  isAdmin={user?.role === 'admin'}
                  onDeleteSuccess={handleProductAdded}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Cart */}
          <Route
            path="/cart"
            element={
              isLoggedIn ? (
                <Cart
                  cartItems={cartItems}
                  onRemoveFromCart={handleRemoveFromCart}
                  onUpdateQuantity={handleUpdateQuantity}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Checkout */}
          <Route
            path="/checkout"
            element={
              isLoggedIn ? (
                <Checkout cartItems={cartItems} user={user} onOrderSuccess={clearCart} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Login */}
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to="/" replace />
              ) : (
                <Login onLogin={handleAuthSuccess} onSwitchToSignup={() => {}} />
              )
            }
          />

          {/* Signup */}
          <Route
            path="/signup"
            element={
              isLoggedIn ? (
                <Navigate to="/" replace />
              ) : (
                <Signup onSignup={handleAuthSuccess} onSwitchToLogin={() => {}} />
              )
            }
          />

          {/* Orders */}
          <Route
            path="/orders"
            element={
              isLoggedIn ? (
                user?.role === 'admin' ? <Orders /> : <TrackOrders />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Delivery orders */}
          <Route
            path="/delivery-orders"
            element={
              isLoggedIn && user?.role === 'delivery' ? (
                <DeliveryOrders />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              isLoggedIn && user?.role === 'admin' ? (
                <Admin />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to={isLoggedIn ? '/' : '/login'} replace />} />
        </Routes>
      </div>

      {isLoggedIn && (
        <AddProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onProductAdded={handleProductAdded}
          isAdmin={user?.role === 'admin'}
        />
      )}

      {isLoggedIn && <Footer />}
    </div>
  );
}

// Outer wrapper that provides the Router context
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;