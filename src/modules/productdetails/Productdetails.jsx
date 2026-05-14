import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductImage } from '../../utils/imageMapper';
import { formatPrice } from '../../utils/currencyFormatter';
import { API_BASE_URL } from '../../config';
import '../productdetails/productdetails.css';

const ProductDetails = ({ onAddToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/home/products/${id}`, {
          signal: controller.signal
        });
        const data = await response.json();
        setProduct(data.data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Failed to fetch product details:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    return () => controller.abort();
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: 'white' }}>Loading product details... 🎂</div>;
  if (!product) return <div style={{ textAlign: 'center', padding: '100px', color: 'white' }}>Product not found. 🌹</div>;

  const handleQuantityChange = (value) => {
    if (value >= 1) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    const cartItem = { ...product, quantity };
    if (onAddToCart) {
      onAddToCart(cartItem);
    }
    alert(`${product.name} (x${quantity}) added to cart! 🛒`);
  };

  return (
    <div className="product-details-page">
      <div className="product-details-container">
        <div className="product-details-content">
          {/* Product Image */}
          <div className="product-image-section">
            <div className="product-large-image">
              <img src={getProductImage(product.image)} alt={product.name} />
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info-section">
            <h1>{product.name}</h1>
            <div className="product-rating">
              ⭐ {product.rating} ({product.reviews} reviews)
            </div>

            <div className="product-price-section">
              <span className="product-price-large">{formatPrice(product.price)}</span>
              <span className="product-category-badge">
                {product.category === 'cakes' && '🎂 Cakes'}
                {product.category === 'flowers' && '🌹 Flowers'}
                {product.category === 'gifts' && '🎁 Gifts'}
              </span>
            </div>

            <div className="product-description-section">
              <h3>Description</h3>
              <p>{product.fullDescription}</p>
            </div>

            <div className="product-features">
              <h3>✨ Features</h3>
              <ul>
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="quantity-section">
              <label>Quantity:</label>
              <div className="quantity-input">
                <button onClick={() => handleQuantityChange(quantity - 1)}>−</button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  min="1"
                />
                <button onClick={() => handleQuantityChange(quantity + 1)}>+</button>
              </div>
              <span style={{ marginLeft: 'auto', fontWeight: '600', color: 'var(--dark-purple)' }}>
                Total: {formatPrice(Number(product.price) * quantity)}
              </span>
            </div>

            <div className="add-to-cart-section">
              <button className="add-to-cart-large-btn" onClick={handleAddToCart}>
                🛒 Add to Cart
              </button>
              <button className="wishlist-btn">❤️ Wishlist</button>
            </div>

            <button
              style={{
                
                padding: '12px',
                background: 'white',
                border: '2px solid var(--dark-purple)',
                color: '#cc9be9 !important',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                marginTop: '15px',
              }}
              onClick={() => navigate('/products')}
            >
              ← Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
