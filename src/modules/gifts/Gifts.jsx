import React, { useState, useEffect } from 'react';
import ProductCard from '../../components/Productcard';
import { API_BASE_URL } from '../../config';
import './Gifts.css';

const Gifts = ({ onAddToCart, refreshTrigger, isAdmin, onDeleteSuccess }) => {
  const [giftProducts, setGiftProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGifts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/home/products?category=gifts`);
        const data = await response.json();
        setGiftProducts(data.data || []);
      } catch (err) {
        console.error('Failed to fetch gifts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGifts();
  }, [refreshTrigger]);

  const handleAddToCart = (product) => {
    if (onAddToCart) {
      onAddToCart(product);
    }
    alert(`${product.name} added to cart! 🛒`);
  };

  return (
    <div className="gifts-page">
      <div className="gifts-container">
        <div className="gifts-header">
          <h1 className="gifts-title">🎁 Perfect Gifts for Every Occasion</h1>
          <p className="gifts-subtitle">
            Curated gift bundles combining beautiful flowers, delicious cakes, and special treasures
          </p>
        </div>

        <div className="gifts-grid">
          {loading ? (
            <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '40px', color: 'var(--primary-pink)' }}>Loading gift sets... 🎁</div>
          ) : giftProducts.length > 0 ? (
            giftProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                isAdmin={isAdmin}
                onDeleteSuccess={onDeleteSuccess}
              />
            ))
          ) : (
            <div style={{ textAlign: 'center', gridColumn: '1/-1', color: '#aaa' }}>No gift products available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Gifts;
