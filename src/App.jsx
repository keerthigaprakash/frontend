import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

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

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showSignup, setShowSignup] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Add item to cart
  const handleAddToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);

      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + (product.quantity || 1) }
            : item
        );
      }

      return [...prevItems, { ...product, quantity: product.quantity || 1 }];
    });
  };

  // Remove item from cart
  const handleRemoveFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // Update item quantity
  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const clearCart = () => setCartItems([]);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleProductAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Router>
      <div className="main-container">
        {isLoggedIn && <Navbar cartCount={cartItems.length} user={user} onAddItem={user?.role === 'admin' ? () => setIsModalOpen(true) : null} />}

        <div className={`content ${isLoggedIn ? 'with-navbar' : ''}`}>
          <Routes>
            <Route path="/" element={isLoggedIn ? <Home onAddToCart={handleAddToCart} refreshTrigger={refreshTrigger} isAdmin={user?.role === 'admin'} onDeleteSuccess={handleProductAdded} /> : <Navigate to="/login" replace />} />
            <Route path="/products" element={isLoggedIn ? <Products onAddToCart={handleAddToCart} refreshTrigger={refreshTrigger} isAdmin={user?.role === 'admin'} onDeleteSuccess={handleProductAdded} /> : <Navigate to="/login" replace />} />
            <Route path="/product/:id" element={isLoggedIn ? <ProductDetails onAddToCart={handleAddToCart} isAdmin={user?.role === 'admin'} onDeleteSuccess={handleProductAdded} /> : <Navigate to="/login" replace />} />
            <Route path="/gifts" element={isLoggedIn ? <Gifts onAddToCart={handleAddToCart} refreshTrigger={refreshTrigger} isAdmin={user?.role === 'admin'} onDeleteSuccess={handleProductAdded} /> : <Navigate to="/login" replace />} />
            <Route path="/plants" element={isLoggedIn ? <Plants onAddToCart={handleAddToCart} refreshTrigger={refreshTrigger} isAdmin={user?.role === 'admin'} onDeleteSuccess={handleProductAdded} /> : <Navigate to="/login" replace />} />
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
            <Route path="/checkout" element={
              isLoggedIn ? (
                <Checkout
                  cartItems={cartItems}
                  user={user}
                  onOrderSuccess={clearCart}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
            />
            <Route path="/login" element={
              isLoggedIn ? <Navigate to="/" replace /> : (
                <Login
                  onLogin={handleAuthSuccess}
                  onSwitchToSignup={() => {}} 
                />
              )
            }
            />
            <Route path="/signup" element={
              isLoggedIn ? <Navigate to="/" replace /> : (
                <Signup
                  onSignup={handleAuthSuccess}
                  onSwitchToLogin={() => {}} 
                />
              )
            }
            />
            <Route path="/orders" element={
              isLoggedIn ? (
                user?.role === 'admin' ? <Orders /> : <TrackOrders />
              ) : (
                <Navigate to="/login" replace />
              )
            } />
            <Route path="/delivery-orders" element={
              isLoggedIn && user?.role === 'delivery' ? (
                <DeliveryOrders />
              ) : (
                <Navigate to="/" replace />
              )
            } />
            <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/login"} replace />} />
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
    </Router>
  );
}

export default App;