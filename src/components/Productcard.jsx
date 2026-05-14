import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductImage } from '../utils/imageMapper';
import { formatPrice } from '../utils/currencyFormatter';
import { API_BASE_URL } from '../config';
import './Productcard.css';

const ProductCard = ({ product, onAddToCart, isAdmin, onDeleteSuccess }) => {
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) return;

    try {
      const token = localStorage.getItem('token') || '';
      const response = await fetch(`${API_BASE_URL}/home/products/${product.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        if (onDeleteSuccess) onDeleteSuccess();
      } else {
        alert(data.message || 'Failed to delete product.');
      }
    } catch (err) {
      console.error(err);
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        alert('Server not reachable. Please check your connection.');
      } else {
        alert('Error deleting product.');
      }
    }
  };

  return (
    <div className="product-card" onClick={handleClick}>
      <img 
        src={getProductImage(product.image)} 
        alt={product.name}
        className="product-image"
      />
      {isAdmin && (
        <button className="product-delete-btn" onClick={handleDelete} title="Delete Product">
          🗑️
        </button>
      )}
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">{formatPrice(product.price)}</p>
        {product.description && (
          <p className="product-description">{product.description}</p>
        )}
        <button 
          className="add-to-cart-btn"
          onClick={handleAddToCart}
          aria-label={`Add ${product.name} to cart`}
        >
          🛒 Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
