import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductImage } from '../../utils/imageMapper';
import { formatPrice } from '../../utils/currencyFormatter';
import './Cart.css';

const Cart = ({ cartItems = [], onRemoveFromCart, onUpdateQuantity }) => {
  const navigate = useNavigate();

  const calculateTotal = () => {
    return cartItems
      .reduce((total, item) => total + Number(item.price) * item.quantity, 0)
      .toFixed(2);
  };

  const calculateSubtotal = () => {
    return cartItems
      .reduce((total, item) => total + Number(item.price) * item.quantity, 0)
      .toFixed(2);
  };

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      navigate('/checkout');
    } else {
      alert('Your cart is empty! Add items before checkout.');
    }
  };

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1 className="cart-title">🛒 Your Shopping Cart</h1>

        {cartItems.length > 0 ? (
          <div className="cart-content">
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-image">
                    <img src={getProductImage(item.image)} alt={item.name} />
                  </div>

                  <div className="cart-item-details">
                    <h3>{item.name}</h3>
                    <p>Category: {item.category}</p>
                    <p className="cart-item-price">
                      {formatPrice(item.price)} each
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      alignItems: 'flex-end',
                    }}
                  >
                    <div className="quantity-control">
                      <button
                        className="qty-btn"
                        onClick={() =>
                          onUpdateQuantity &&
                          onUpdateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <span className="qty-display">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() =>
                          onUpdateQuantity &&
                          onUpdateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <p
                      style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: 'var(--primary-pink)',
                      }}
                    >
                      {formatPrice(Number(item.price) * item.quantity)}
                    </p>
                    <button
                      className="remove-btn"
                      onClick={() =>
                        onRemoveFromCart && onRemoveFromCart(item.id)
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2 className="summary-title">Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>{formatPrice(calculateSubtotal())}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="summary-row">
                <span>Tax:</span>
                <span>{formatPrice(calculateSubtotal() * 0.05)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>
                  {formatPrice(parseFloat(calculateTotal()) + parseFloat(calculateTotal()) * 0.05)}
                </span>
              </div>
              <button className="checkout-btn" onClick={handleCheckout}>
                Proceed to Checkout →
              </button>
            </div>
          </div>
        ) : (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <p>Your cart is empty!</p>
            <button
              className="continue-shopping-btn"
              onClick={() => navigate('/products')}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;