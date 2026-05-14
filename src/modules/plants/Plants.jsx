import React, { useState, useEffect } from 'react';
import ProductCard from '../../components/Productcard';
import { API_BASE_URL } from '../../config';
import './Plants.css';

const Plants = ({ onAddToCart, refreshTrigger, isAdmin, onDeleteSuccess }) => {
  const [plantProducts, setPlantProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlants = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/home/products?category=plants`);
        const data = await response.json();
        setPlantProducts(data.data || []);
      } catch (err) {
        console.error('Failed to fetch plants:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlants();
  }, [refreshTrigger]);

  const handleAddToCart = (product) => {
    if (onAddToCart) {
      onAddToCart(product);
    }
    alert(`${product.name} added to cart! 🛒`);
  };

  return (
    <div className="plants-page">
      <div className="plants-container">
        <div className="plants-header">
          <h1 className="plants-title">🌿 Indoor Plants Collection</h1>
          <p className="plants-subtitle">
            Bring nature indoors with our beautiful, air-purifying plants
          </p>
        </div>

        <div className="plants-grid">
          {loading ? (
            <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '40px', color: 'var(--primary-pink)' }}>Loading plants... 🌿</div>
          ) : plantProducts.length > 0 ? (
            plantProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                isAdmin={isAdmin}
                onDeleteSuccess={onDeleteSuccess}
              />
            ))
          ) : (
            <div style={{ textAlign: 'center', gridColumn: '1/-1', color: '#aaa' }}>No plant products available yet. Admin can add plants using the + icon.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Plants;
