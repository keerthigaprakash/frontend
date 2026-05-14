import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL, SOCKET_URL } from '../../config';
import DeliveryMap from '../trackorders/DeliveryMap';
import './Orders.css';

const DELIVERY_STATUSES = ['pending', 'shipped', 'delivered'];

const DeliveryOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trackingOrderId, setTrackingOrderId] = useState(null); // which order is broadcasting GPS
  const socketRef = useRef(null);

  // ── Connect Socket ────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    socketRef.current = io(SOCKET_URL, { auth: { token } });

    socketRef.current.on('connect', () => {
      console.log('🚚 Delivery socket connected');
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // ── Fetch Assigned Orders ─────────────────────────────────────
  const fetchAssignedOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/orders/assigned`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch assigned orders.');
      }
    } catch {
      setError('Connection error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssignedOrders(); }, []);

  // ── Update Order Status ───────────────────────────────────────
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        // If marked as shipped → start broadcasting GPS for this order
        if (newStatus === 'shipped') {
          setTrackingOrderId(orderId);
        } else if (newStatus === 'delivered') {
          setTrackingOrderId(null);
        }
      } else {
        alert(data.message || 'Failed to update status.');
      }
    } catch {
      alert('Failed to update status. Please try again.');
    }
  };

  // ── Socket emitter function to pass to map ────────────────────
  const socketEmit = (event, payload) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, payload);
    }
  };

  // ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="admin-orders-page">
        <div className="orders-loading">
          <div className="spinner"></div>
          <p>Loading your assignments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-orders-page">
        <div className="orders-error">
          <span style={{ fontSize: '3rem' }}>🔌</span>
          <h2>Connection Issue</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-orders-page">
      <div className="orders-header">
        <h1>My Deliveries</h1>
        <p>Live GPS tracking — your customers can see you move in real-time</p>
      </div>

      {orders.length === 0 ? (
        <div className="orders-empty">
          <span style={{ fontSize: '5rem' }}>📦</span>
          <h2>No Assignments Yet</h2>
          <p>When an admin assigns you an order, it will appear here.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order, index) => {
            const shipping = order.shipping_info || {};
            const address = [shipping.address, shipping.city, shipping.zip]
              .filter(Boolean).join(', ') || 'N/A';
            const isTracking = trackingOrderId === order.id;

            return (
              <div key={order.id} className="order-card" style={{ animationDelay: `${index * 0.1}s` }}>
                {/* Header */}
                <div className="order-card-banner">
                  <div className="banner-left">
                    <span className="order-id-tag">ORDER #ORD-{order.id}</span>
                    {isTracking && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: 'rgba(76,175,80,0.2)', padding: '4px 12px',
                        borderRadius: '50px', fontSize: '12px', fontWeight: 700, color: '#4CAF50',
                      }}>
                        <span style={{
                          width: '8px', height: '8px', borderRadius: '50%',
                          background: '#4CAF50', animation: 'blink 1s infinite',
                        }}></span>
                        GPS LIVE
                      </div>
                    )}
                  </div>
                  <span className="order-card-timestamp">
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>

                <div className="order-card-body">
                  {/* Customer Info */}
                  <div className="customer-panel">
                    <div className="section-label"><span>👤</span> CUSTOMER</div>
                    <div className="customer-info-box">
                      <div className="info-item">
                        <label>Name</label>
                        <span>{shipping.fullName || order.customer_name || 'Guest'}</span>
                      </div>
                      <div className="info-item">
                        <label>Delivery Address</label>
                        <span>{address}</span>
                      </div>
                      {shipping.phone && (
                        <div className="info-item">
                          <label>Phone</label>
                          <span>{shipping.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status + Items */}
                  <div className="logistics-panel">
                    <div className="section-label"><span>🚦</span> UPDATE STATUS</div>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
                      {DELIVERY_STATUSES.map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(order.id, status)}
                          style={{
                            padding: '10px 20px',
                            borderRadius: '50px',
                            border: '2px solid',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: '13px',
                            transition: 'all 0.25s',
                            borderColor: order.status === status ? getStatusColor(status) : '#e0d5eb',
                            background: order.status === status ? getStatusColor(status) : 'white',
                            color: order.status === status ? 'white' : '#666',
                            boxShadow: order.status === status ? `0 4px 12px ${getStatusColor(status)}55` : 'none',
                          }}
                        >
                          {status === 'shipped' ? '🚚 Out for Delivery' : status === 'delivered' ? '✅ Delivered' : '⏳ Pending'}
                        </button>
                      ))}
                    </div>

                    <div className="section-label"><span>📦</span> ITEMS</div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {(order.items || []).map((item, idx) => (
                        <li key={idx} style={{
                          padding: '10px 15px',
                          background: '#fdfbff',
                          borderRadius: '10px',
                          marginBottom: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontWeight: 600,
                          fontSize: '14px',
                        }}>
                          <span>{item.product_name || 'Product'}</span>
                          <span style={{ color: '#8e44ad' }}>× {item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Live GPS Map — shown when status is 'shipped' */}
                {order.status === 'shipped' && (
                  <div style={{ padding: '0 30px 30px' }}>
                    <div className="section-label" style={{ marginBottom: '15px', paddingTop: '10px' }}>
                      <span>📡</span> LIVE GPS BROADCAST
                      <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#8e44ad', fontWeight: 600 }}>
                        Your location is shared with the customer
                      </span>
                    </div>
                    <DeliveryMap
                      customerAddress={address}
                      socketEmitter={socketEmit}
                      orderId={order.id}
                      deliveryCoords={null}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return '#FF9800';
    case 'shipped': return '#2196F3';
    case 'delivered': return '#4CAF50';
    default: return '#9E9E9E';
  }
};

export default DeliveryOrders;
