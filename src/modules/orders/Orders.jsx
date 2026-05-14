import React, { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { getProductImage } from '../../utils/imageMapper';
import { formatPrice } from '../../utils/currencyFormatter';
import { API_BASE_URL, SOCKET_URL } from '../../config';
import './Orders.css';
import DeliveryMap from '../trackorders/DeliveryMap';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered'];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [deliveryPersonnel, setDeliveryPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deliveryCoords, setDeliveryCoords] = useState({});
  const [socket, setSocket] = useState(null);

  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem('token');
    setError('');
    setLoading(true);
    
    try {
      if (!token) {
        setError('Authentication token missing. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/orders/all`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('You do not have permission to access admin data. Please contact support.');
        } else if (response.status === 401) {
          throw new Error('Your session has expired. Please log in again.');
        } else {
          throw new Error(`Server returned error: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();

      if (data.success) {
        const ordersData = data.data || [];
        setOrders(ordersData);
        
        // Extract last known coordinates
        const initialCoords = {};
        ordersData.forEach(o => {
          if (o.current_lat && o.current_lng) {
            initialCoords[o.id] = { lat: Number(o.current_lat), lng: Number(o.current_lng) };
          }
        });
        setDeliveryCoords(initialCoords);
      } else {
        setError(data.message || 'Failed to fetch orders from the system.');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'A connection error occurred while fetching orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDeliveryPersonnel = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/orders/delivery-personnel`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setDeliveryPersonnel(data.data || []);
    } catch (err) {
      console.error('Error fetching personnel:', err);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login as an admin to view this page.');
      setLoading(false);
      return;
    }

    const socketInstance = io(SOCKET_URL, {
      auth: { token },
      reconnectionAttempts: 5
    });

    setSocket(socketInstance);
    fetchOrders();
    fetchDeliveryPersonnel();

    socketInstance.on('connect', () => {
      console.log('🔌 Admin socket connected');
    });

    socketInstance.on('orderStatusUpdate', (data) => {
      setOrders(prev => prev.map(o => o.id === data.order_id ? { ...o, status: data.status } : o));
      if (data.status === 'shipped') {
        socketInstance.emit('joinOrderRoom', data.order_id);
      }
    });

    socketInstance.on('deliveryLocationUpdate', (data) => {
      setDeliveryCoords(prev => ({
        ...prev,
        [data.order_id]: data.coords
      }));
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [fetchOrders, fetchDeliveryPersonnel]);

  // Sync rooms when orders load/change
  useEffect(() => {
    if (socket && orders.length > 0) {
      orders.forEach(o => {
        if (o.status === 'shipped') {
          socket.emit('joinOrderRoom', o.id);
        }
      });
    }
  }, [orders.length, socket]);

  const handleAssign = async (orderId, deliveryPersonId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/orders/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId, deliveryPersonId })
      });
      const data = await response.json();
      if (data.success) {
        fetchOrders();
      } else {
        alert(data.message || 'Failed to assign delivery.');
      }
    } catch (err) {
      alert('Network error while assigning delivery.');
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
      } else {
        alert(data.message || 'Failed to cancel order.');
      }
    } catch (err) {
      alert('Network error while canceling order.');
    }
  };

  if (loading) {
    return (
      <div className="admin-orders-page">
        <div className="orders-loading">
          <div className="spinner"></div>
          <p>Syncing Command Center Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-orders-page">
        <div className="orders-error">
          <span className="error-icon">🚫</span>
          <h2>Access or Connection Issue</h2>
          <p className="error-description">{error}</p>
          <button className="retry-btn" onClick={fetchOrders}>
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="admin-orders-page">
        <div className="orders-header">
          <h1>Command Center</h1>
          <p>Analytics & Order Management Dashboard</p>
        </div>
        <div className="orders-empty">
          <span className="empty-icon">📭</span>
          <h2>No data found</h2>
          <p>The system is currently empty. No orders have been placed yet.</p>
          <button className="retry-btn" onClick={fetchOrders} style={{ marginTop: '20px' }}>
            Check for Updates
          </button>
        </div>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, order) => {
    const productsSum = (order.items || []).reduce((iSum, item) => iSum + (Number(item.price) * (item.quantity || 1)), 0);
    return sum + productsSum;
  }, 0);
  const totalItems = orders.reduce((sum, order) => sum + (order.items?.length || 0), 0);

  return (
    <div className="admin-orders-page">
      <div className="orders-header">
        <h1>Command Center</h1>
        <p>Real-time order fulfillment & customer analytics</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-label">Gross Revenue</span>
            <span className="stat-number">{formatPrice(totalRevenue, true)}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <span className="stat-label">Total Orders</span>
            <span className="stat-number">{orders.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🍰</div>
          <div className="stat-info">
            <span className="stat-label">Items Sold</span>
            <span className="stat-number">{totalItems}</span>
          </div>
        </div>
      </div>

      <div className="orders-list">
        {orders.map((order, index) => {
          const shipping = order.shipping_info || {};
          const customerName = shipping.fullName || order.customer_name || 'Guest User';
          const address = [shipping.address, shipping.city, shipping.zip].filter(Boolean).join(', ') || 'N/A';
          const itemSubtotal = (order.items || []).reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0);
          const orderDate = order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', {
            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
          }) : 'Unknown Date';

          const currentStep = STATUSES.indexOf(order.status || 'pending');

          return (
            <div key={order.id} className="order-card" style={{ animationDelay: `${index * 0.15}s` }}>
              <div className="order-card-banner">
                <div className="banner-left">
                  <span className="order-id-tag">ORDER #ORD-{order.id}</span>
                  <div className="order-actions-inline">
                    <button className="admin-action-btn cancel" onClick={() => handleCancelOrder(order.id)}>✖</button>
                  </div>
                </div>
                <span className="order-card-timestamp">{orderDate}</span>
              </div>

              <div className="order-card-body">
                <div className="customer-panel">
                  <div className="section-label"><span>👤</span> CUSTOMER PROFILE</div>
                  <div className="customer-info-box">
                    <div className="info-item"><label>Full Name</label><span>{customerName}</span></div>
                    {order.customer_email && <div className="info-item"><label>Contact Email</label><span>{order.customer_email}</span></div>}
                    <div className="info-item"><label>Delivery Address</label><span>{address}</span></div>
                    {shipping.phone && <div className="info-item"><label>Phone Number</label><span>{shipping.phone}</span></div>}
                  </div>
                </div>

                <div className="logistics-panel">
                  <div className="section-label"><span>🚚</span> DELIVERY ASSIGNMENT</div>
                  <div className="assignment-box">
                    <label>Assign Delivery Person</label>
                    <div className="assignment-control-v2">
                      <select value={order.delivery_person_id || ""} onChange={(e) => handleAssign(order.id, e.target.value)}>
                        <option value="">Select Personnel...</option>
                        {deliveryPersonnel.map(p => <option key={p.id} value={p.id}>{p.name} ({p.email})</option>)}
                      </select>
                      {order.delivery_person_id && <div className="assigned-status"><span className="status-dot online"></span>ASSIGNED</div>}
                    </div>
                  </div>

                  <div className="section-label mt-4"><span>📦</span> MANIFEST ITEMS</div>
                  <table className="order-table">
                    <thead><tr><th>Product</th><th>Qty</th><th style={{ textAlign: 'right' }}>Price</th></tr></thead>
                    <tbody>
                      {(order.items || []).map((item, idx) => (
                        <tr key={idx} className="item-row">
                          <td className="item-name-cell">
                            <div className="item-with-thumb">
                              <img src={getProductImage(item.product_image)} alt={item.product_name} className="item-thumb-mini" />
                              {item.product_name || 'Legacy Product'}
                            </div>
                          </td>
                          <td style={{ fontWeight: 600, color: '#666' }}>× {item.quantity}</td>
                          <td className="item-price-cell">{formatPrice(item.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="status-timeline-container">
                <div className="section-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                  <span>📡 LIVE TRACKING & LOGISTICS</span>
                </div>
                {order.status === 'shipped' && (
                  <div className="track-map-section">
                    <DeliveryMap deliveryCoords={deliveryCoords[order.id]} customerAddress={address} />
                  </div>
                )}
                <div className="admin-timeline">
                  {STATUSES.map((status, idx) => (
                    <div key={status} className={`admin-timeline-step ${idx <= currentStep ? 'completed' : ''} ${idx === currentStep ? 'current' : ''} clickable`} onClick={() => handleStatusUpdate(order.id, status)}>
                      <div className="admin-timeline-dot">{idx <= currentStep ? '✓' : (idx + 1)}</div>
                      {idx < STATUSES.length - 1 && <div className={`admin-timeline-line ${idx < currentStep ? 'filled' : ''}`}></div>}
                      <span className="admin-timeline-label">{status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-card-footer">
                <div className="footer-stat"><span className="stat-label">Order Total</span><span className="stat-value">{formatPrice(itemSubtotal)}</span></div>
                <div className="order-status-badge" data-status={order.status || 'pending'}>{order.status?.toUpperCase() || 'PENDING'}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
