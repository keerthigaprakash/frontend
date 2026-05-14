import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductImage } from '../../utils/imageMapper';
import { formatPrice } from '../../utils/currencyFormatter';
import { API_BASE_URL } from '../../config';
import './Checkout.css';

const Checkout = ({ cartItems = [], user, onOrderSuccess }) => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    distance: '', // distance in km
    specialInstructions: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Tiered shipping logic
  const calculateShipping = () => {
    const dist = Number(formData.distance);
    if (!dist || dist <= 4) return 0;       // 1-4 km free
    return (dist - 4) * 20;                // 5km → 20, 6km → 40, etc.
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);
    const tax = subtotal * 0.05;
    const shipping = calculateShipping();
    return (subtotal + tax + shipping).toFixed(2);
  };

  const handlePlaceOrder = async () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.zipCode || !formData.distance) {
      alert('Please fill in all required fields!');
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        items: cartItems,
        total: calculateTotal(),
        shipping_info: {
          ...formData,
          paymentMethod,
          shippingCost: calculateShipping()
        }
      };

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Order placed successfully! 🎉\nOrder ID: ${data.data.id}`);
        onOrderSuccess(); // Clear cart
        navigate('/');
      } else {
        alert('Failed to place order: ' + data.message);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        alert('Server not reachable. Please check your connection.');
      } else {
        alert('Error connecting to server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const subtotalValue = cartItems.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);
  const subtotal = subtotalValue.toFixed(2);
  const tax = (subtotalValue * 0.05).toFixed(2);
  const shipping = calculateShipping();
  const total = calculateTotal();

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1 className="checkout-title">🛍️ Checkout</h1>

        <div className="checkout-content">
          {/* Checkout Form */}
          <form className="checkout-form">
            <div className="form-section">
              <h3>📦 Shipping Information</h3>

              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Enter your full name" required />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email" required />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Enter your phone number" required />
              </div>

              <div className="form-group">
                <label htmlFor="address">Street Address *</label>
                <textarea id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Enter your full address" required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input type="text" id="city" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" required />
                </div>

                <div className="form-group">
                  <label htmlFor="zipCode">Zip Code *</label>
                  <input type="text" id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleInputChange} placeholder="Zip Code" required />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="distance">Distance (km) *</label>
                <input type="number" id="distance" name="distance" value={formData.distance} onChange={handleInputChange} placeholder="Enter distance in km" min="0" required />
              </div>
            </div>

            {/* Delivery Instructions */}
            <div className="form-section">
              <h3>📝 Delivery Instructions (Optional)</h3>
              <div className="form-group">
                <textarea name="specialInstructions" value={formData.specialInstructions} onChange={handleInputChange} placeholder="Any special delivery instructions..." />
              </div>
            </div>

            {/* Payment Method */}
            <div className="form-section">
              <h3>💳 Payment Method</h3>
              <div className="payment-options">
                <button type="button" className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`} onClick={() => setPaymentMethod('cod')}>💵 Cash on Delivery</button>
                <button type="button" className={`payment-option ${paymentMethod === 'online' ? 'selected' : ''}`} onClick={() => setPaymentMethod('online')}>💳 Online Payment</button>
              </div>
              
              {paymentMethod === 'online' && (
                <div style={{ marginTop: '20px', textAlign: 'center', padding: '20px', border: '2px dashed var(--primary-pink)', borderRadius: '10px', background: 'rgba(255, 192, 203, 0.1)' }}>
                  <p style={{ marginBottom: '15px', fontWeight: 'bold', color: 'var(--dark-purple)' }}>Scan QR to Pay {formatPrice(total)}</p>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=bloombliss@upi&pn=BloomAndBliss&am=${total}`} alt="Payment QR Code" style={{ borderRadius: '10px' }} />
                  <p style={{ marginTop: '15px', fontSize: '13px', color: '#666' }}>Use any UPI app (GPay, PhonePe, Paytm, etc.)</p>
                </div>
              )}
            </div>

            <button type="button" className="place-order-btn" onClick={handlePlaceOrder} disabled={loading}>
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </form>

          {/* Order Summary */}
          <div className="order-summary">
            <h2 className="summary-header">📋 Order Summary</h2>

            <div style={{ marginBottom: '20px', maxHeight: '300px', overflowY: 'auto' }}>
              {cartItems.map((item) => (
                <div key={item.id} className="summary-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', padding: '10px', borderRadius: '8px', background: 'var(--light-lavender)' }}>
                  <img src={getProductImage(item.image)} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }} />
                  <span style={{ flex: 1 }}>{item.name} × {item.quantity}</span>
                  <span>{formatPrice(Number(item.price) * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="summary-item"><span>Subtotal</span><span>{formatPrice(subtotalValue)}</span></div>
            <div className="summary-item"><span>Tax (5%)</span><span>{formatPrice(subtotalValue * 0.05)}</span></div>
            <div className="summary-item"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>

            <div className="summary-total"><span>Total:</span><span>{formatPrice(total)}</span></div>

            <div style={{
              marginTop: '20px',
              padding: '15px',
              background: 'var(--primary-lavender)',
              borderRadius: '10px',
              textAlign: 'center',
              color: 'var(--dark-purple)',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              {paymentMethod === 'cod' ? '💵 Pay at delivery' : '🔒 Secure online payment'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;