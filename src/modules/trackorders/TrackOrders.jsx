import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { getProductImage } from '../../utils/imageMapper';
import { formatPrice } from '../../utils/currencyFormatter';
import { API_BASE_URL, SOCKET_URL } from '../../config';
import './TrackOrders.css';
import DeliveryMap from './DeliveryMap';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered'];

const TrackOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deliveryCoords, setDeliveryCoords] = useState({}); // { orderId: {lat, lng} }

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    let socket;

    // ── Fetch latest data from database (Fallback/Initial) ──
    const fetchOrders = async () => {
      try {
        if (!token) {
          setError('Please login to track your orders.');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
          const ordersData = data.data || [];
          setOrders(ordersData);

          // Extract last known coordinates from DB
          const initialCoords = {};
          ordersData.forEach(o => {
            if (o.current_lat && o.current_lng) {
              initialCoords[o.id] = { lat: Number(o.current_lat), lng: Number(o.current_lng) };
            }
          });
          setDeliveryCoords(initialCoords);

          // Join rooms for all non-delivered orders
          if (socket) {
            ordersData.forEach(o => {
              if (o.status !== 'delivered') {
                socket.emit('joinOrderRoom', o.id);
              }
            });
          }
        } else {
          setError(data.message || 'Failed to fetch orders.');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
          setError('Server not reachable. Please check your connection.');
        } else {
          setError('Connection error. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    // ── WebSocket for Seamless Live Updates ──
    socket = io(SOCKET_URL, {
      auth: { token },
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socket.on('connect', () => {
      console.log('🔌 Connected to order tracking');
      setIsConnected(true);
      // Fetch orders after socket is ready so we can join rooms
      fetchOrders();
    });

    socket.on('orderStatusUpdate', (data) => {
      console.log('📦 Status update received:', data);
      setOrders(prev =>
        prev.map(order =>
          order.id === data.order_id
            ? { ...order, status: data.status, items: data.order?.items || order.items }
            : order
        )
      );

      // If status changed to shipped, join order room
      if (data.status === 'shipped') {
        socket.emit('joinOrderRoom', data.order_id);
      }
    });

    socket.on('deliveryLocationUpdate', (data) => {
      console.log('📍 Location update received:', data);
      setDeliveryCoords(prev => ({
        ...prev,
        [data.order_id]: data.coords
      }));
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from order tracking');
      setIsConnected(false);
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const getStepIndex = (status) => STATUSES.indexOf(status || 'pending');

  if (loading) {
    return (
      <div className="track-orders-page">
        <div className="track-loading">
          <div className="track-spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="track-orders-page">
        <div className="track-error">
          <span className="track-error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="track-orders-page">
        <div className="track-header">
          <h1>My Orders</h1>
          <p>Track your recent purchases</p>
        </div>
        <div className="track-empty">
          <span style={{ fontSize: '4rem' }}>🛒</span>
          <h2>No Orders Yet</h2>
          <p>Once you place an order, it will appear here for tracking.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="track-orders-page">
      <div className="track-header">
        <h1>My Orders</h1>
        <p>Real-time tracking for all your purchases</p>
      </div>

      <div className="track-list">
        {orders.map((order) => {
          const currentStep = getStepIndex(order.status);
          const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });

          return (
            <div key={order.id} className="track-card">
              {/* Card Header */}
              <div className="track-card-top">
                <div>
                  <span className="track-order-id">Order #ORD-{order.id}</span>
                  <span className="track-order-date">{orderDate}</span>
                </div>
                <div className="track-total">{formatPrice(order.total)}</div>
              </div>

              {/* Items Summary */}
              <div className="track-items-summary">
                <p className="summary-title">Order Summary ({order.items?.length || 0} items)</p>
                <div className="summary-items-list">
                  {(order.items || []).filter(i => i.product_name).map((item, idx) => (
                    <div key={idx} className="track-item-mini">
                      <span>{item.product_name}</span>
                      <span className="qty">× {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div className="timeline">
                {STATUSES.map((status, idx) => {
                  const isCompleted = idx <= currentStep;
                  const isCurrent = idx === currentStep;
                  return (
                    <div key={status} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                      <div className="timeline-dot">
                        {isCompleted ? '✓' : (idx + 1)}
                      </div>
                      {idx < STATUSES.length - 1 && (
                        <div className={`timeline-line ${idx < currentStep ? 'filled' : ''}`}></div>
                      )}
                      <span className="timeline-label">{status}</span>
                    </div>
                  );
                })}
              </div>

              {/* Delivery Map (Live Tracking) */}
              {order.status === 'shipped' && (
                <div className="track-map-section">
                  <div className="section-label" style={{ padding: '0 0 12px', fontSize: '0.85rem', fontWeight: 800, color: '#888', letterSpacing: '1px' }}>
                    📡 LIVE DELIVERY TRACKING
                  </div>
                  <DeliveryMap 
                    deliveryCoords={deliveryCoords[order.id]} 
                    customerAddress={[
                      order.shipping_info?.address,
                      order.shipping_info?.city,
                    ].filter(Boolean).join(', ')}
                  />
                </div>
              )}

              {/* Live Badge */}
              <div className={`track-live-badge ${isConnected ? 'online' : 'offline'}`}>
                <span className={`live-dot ${isConnected ? 'blink' : ''}`}></span>
                {isConnected ? 'Live Tracking Active' : 'Offline - Auto Reconnecting'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrackOrders;
