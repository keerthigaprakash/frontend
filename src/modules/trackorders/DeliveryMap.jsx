import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Circle, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './TrackOrders.css';

// Fix default icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
L.Marker.prototype.options.icon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// ─── Custom Icons ──────────────────────────────────────────────
const deliveryIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      position: relative;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        position: absolute;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: rgba(33, 150, 243, 0.15);
        animation: deliveryPulse 1.8s ease-out infinite;
      "></div>
      <div style="
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: linear-gradient(135deg, #2196F3, #1565C0);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        box-shadow: 0 4px 15px rgba(33,150,243,0.5);
        position: relative;
        z-index: 2;
        border: 3px solid white;
      ">🚚</div>
    </div>
    <style>
      @keyframes deliveryPulse {
        0% { transform: scale(1); opacity: 0.8; }
        100% { transform: scale(2.5); opacity: 0; }
      }
    </style>
  `,
  iconSize: [56, 56],
  iconAnchor: [28, 28],
});

const storeIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      width: 44px; height: 44px; border-radius: 50%;
      background: white; border: 3px solid #FF4DA6;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; box-shadow: 0 4px 12px rgba(255,77,166,0.4);
    ">🏪</div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

const destIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
      <div style="
        width: 44px; height: 44px; border-radius: 50%;
        background: white; border: 3px solid #4CAF50;
        display: flex; align-items: center; justify-content: center;
        font-size: 22px; box-shadow: 0 4px 12px rgba(76,175,80,0.4);
      ">🏠</div>
      <div style="width:3px;height:14px;background:#4CAF50;"></div>
    </div>
  `,
  iconSize: [44, 58],
  iconAnchor: [22, 58],
});

// ─── Smooth Map Controller ────────────────────────────────────────
const LiveMapController = ({ coords, autoFollow }) => {
  const map = useMap();
  const prevCoordsRef = useRef(null);

  useEffect(() => {
    if (!coords || !autoFollow) return;

    const prev = prevCoordsRef.current;
    if (prev) {
      const dist = map.distance([prev.lat, prev.lng], [coords.lat, coords.lng]);
      if (dist < 3) return;
    }

    map.panTo([coords.lat, coords.lng], {
      animate: true,
      duration: 0.8,
      easeLinearity: 0.25,
      noMoveStart: true,
    });
    prevCoordsRef.current = coords;
  }, [coords, autoFollow, map]);

  return null;
};

// Fits the map to show both store and destination simultaneously
const BoundsController = ({ storeCoords, destCoords, active }) => {
  const map = useMap();
  useEffect(() => {
    if (!active || !storeCoords || !destCoords) return;
    const bounds = L.latLngBounds(
      [storeCoords.lat, storeCoords.lng],
      [destCoords.lat, destCoords.lng]
    );
    map.fitBounds(bounds, { padding: [100, 40, 40, 40], animate: true, duration: 1.2 });
  }, [active, storeCoords, destCoords, map]);
  return null;
};

// Flies to a specific point when a button is clicked
const FlyToController = ({ target }) => {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], 16, { animate: true, duration: 1.2 });
    }
  }, [target, map]);
  return null;
};

// ─── Animated Marker (smoothly lerps between positions) ──────────
const AnimatedDeliveryMarker = ({ coords }) => {
  const markerRef = useRef(null);
  const animFrameRef = useRef(null);
  const prevRef = useRef(null);

  useEffect(() => {
    if (!coords || !markerRef.current) return;

    const target = L.latLng(coords.lat, coords.lng);

    if (!prevRef.current) {
      markerRef.current.setLatLng(target);
      prevRef.current = target;
      return;
    }

    const start = markerRef.current.getLatLng();
    const startTime = performance.now();
    const DURATION = 800;

    const animate = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / DURATION, 1);
      const ease = 1 - Math.pow(1 - t, 3);

      const lat = start.lat + (target.lat - start.lat) * ease;
      const lng = start.lng + (target.lng - start.lng) * ease;
      markerRef.current.setLatLng([lat, lng]);

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        prevRef.current = target;
      }
    };

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [coords]);

  if (!coords) return null;

  return (
    <Marker
      ref={markerRef}
      position={[coords.lat, coords.lng]}
      icon={deliveryIcon}
    >
      <Popup>
        <b style={{ color: '#2196F3' }}>🚚 Delivery in Progress</b><br />
        Lat: {coords.lat.toFixed(5)}<br />
        Lng: {coords.lng.toFixed(5)}
      </Popup>
    </Marker>
  );
};

// ─── Main DeliveryMap Component ──────────────────────────────────
const DeliveryMap = ({ deliveryCoords, customerAddress, socketEmitter = null, orderId = null }) => {
  const storeCoords = { lat: 11.0018, lng: 77.0282 };

  const [destCoords, setDestCoords] = useState({ lat: 11.0168, lng: 76.9558 });
  const [liveCoords, setLiveCoords] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [pathHistory, setPathHistory] = useState([storeCoords]);
  const [autoFollow, setAutoFollow] = useState(false);
  const [fitAll, setFitAll] = useState(true);
  const [flyTarget, setFlyTarget] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('waiting');
  const watchIdRef = useRef(null);

  const activeCoords = liveCoords || deliveryCoords;

  // Routing States
  const [fullRoutePath, setFullRoutePath] = useState([]);
  const [remainingPath, setRemainingPath] = useState([]);
  const [nextInstruction, setNextInstruction] = useState(null);

  // ── Route Fetcher (OSRM) ───────────────────────────────────────
  const fetchRoadRoute = async (start, end, isFull = false) => {
    try {
      const query = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&steps=true`;
      const res = await fetch(query);
      const data = await res.json();
      
      if (data.code === 'Ok' && data.routes?.[0]) {
        const route = data.routes[0];
        const coords = route.geometry.coordinates.map(c => [c[1], c[0]]); // GeoJSON is [lng, lat]
        
        if (isFull) {
          setFullRoutePath(coords);
        } else {
          setRemainingPath(coords);
          // Extract next instruction
          const nextStep = route.legs?.[0]?.steps?.[1]; // Step 0 is usually "Depart"
          if (nextStep) {
            setNextInstruction({
              text: nextStep.maneuver.instruction,
              type: nextStep.maneuver.type,
              modifier: nextStep.maneuver.modifier,
              distance: Math.round(nextStep.distance)
            });
          }
        }
      }
    } catch (err) {
      console.error('Routing Error:', err);
    }
  };

  // ── Geocode destination ────────────────────────────────────────
  useEffect(() => {
    if (!customerAddress) return;

    const formatQuery = (raw) => {
      let q = raw.replace(/[\n\r]/g, ', ').replace(/\s+/g, ' ').trim();
      if (!/bus stand/i.test(q)) q += ' Bus Stand';
      if (!/tamil nadu/i.test(q)) q += ', Tamil Nadu';
      if (!/india/i.test(q)) q += ', India';
      return q;
    };

    const isValid = (item) => {
      const dn = (item.display_name || '').toLowerCase();
      const state = (item.address?.state || '').toLowerCase();
      return (
        (state.includes('tamil nadu') || dn.includes('tamil nadu')) &&
        (dn.includes('india') || (item.address?.country || '').toLowerCase().includes('india'))
      );
    };

    const geocode = async () => {
      try {
        const q = encodeURIComponent(formatQuery(customerAddress));
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${q}&addressdetails=1&countrycodes=in&limit=5`
        );
        const data = await res.json();
        const match = Array.isArray(data) ? data.find(isValid) : null;
        if (match) {
          setDestCoords({ lat: parseFloat(match.lat), lng: parseFloat(match.lon) });
        }
      } catch (e) {
        console.error('Geocode error:', e);
      }
    };

    geocode();
  }, [customerAddress]);

  // ── Fetch Initial Full Route ───────────────────────────────────
  useEffect(() => {
    if (storeCoords && destCoords) {
      fetchRoadRoute(storeCoords, destCoords, true);
    }
  }, [destCoords]);

  // ── Fetch Remaining Route Dynamically ──────────────────────────
  useEffect(() => {
    if (activeCoords && destCoords) {
      fetchRoadRoute(activeCoords, destCoords, false);
    }
  }, [activeCoords, destCoords]);

  // ── Device GPS Watcher ─────────────────────────────────────────
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setGpsStatus('error');
      return;
    }

    setGpsStatus('waiting');

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setAccuracy(Math.round(pos.coords.accuracy));
        setLiveCoords(newCoords);
        setGpsStatus('active');

        if (socketEmitter && orderId) {
          socketEmitter('updateDeliveryLocation', {
            orderId,
            lat: newCoords.lat,
            lng: newCoords.lng,
          });
        }
      },
      (err) => {
        console.warn('GPS Error:', err.message);
        setGpsStatus('error');
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );

    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [socketEmitter, orderId]);

  // ── Accumulate Path History ────────────────────────────────────
  useEffect(() => {
    if (!activeCoords) return;
    setPathHistory((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.lat === activeCoords.lat && last.lng === activeCoords.lng) return prev;
      const updated = [...prev, activeCoords];
      return updated.length > 200 ? updated.slice(updated.length - 200) : updated;
    });
  }, [activeCoords]);

  const handleFlyStore    = () => { setFlyTarget(storeCoords); setAutoFollow(false); setFitAll(false); };
  const handleFlyDest     = () => { setFlyTarget(destCoords);  setAutoFollow(false); setFitAll(false); };
  const handleFollowDriver = () => { setAutoFollow(true);  setFitAll(false); setFlyTarget(null); };
  const handleFitAll      = () => { setFitAll(true); setAutoFollow(false); setFlyTarget(null); };

  // Re-fit when destination updates (after geocode resolves)
  useEffect(() => { setFitAll(true); }, [destCoords]);

  const initialCenter = [
    (storeCoords.lat + destCoords.lat) / 2,
    (storeCoords.lng + destCoords.lng) / 2,
  ];

  const gpsClass =
    gpsStatus === 'active'  ? 'gps-active'  :
    gpsStatus === 'error'   ? 'gps-error'   : 'gps-waiting';

  const getManeuverIcon = (mod) => {
    if (!mod) return '⬆️';
    const m = mod.toLowerCase();
    if (m.includes('left')) return '⬅️';
    if (m.includes('right')) return '➡️';
    if (m.includes('sharp')) return '🔄';
    if (m.includes('slight')) return '↗️';
    return '⬆️';
  };

  return (
    <div className="delivery-map-wrapper">

      {/* ── Controls Bar — always rendered above the map, never hidden ── */}
      <div className="map-controls-bar">

        {/* From: Store */}
        <button className="map-route-btn from" onClick={handleFlyStore}>
          <span style={{ fontSize: '20px' }}>🏪</span>
          <div>
            <div className="btn-label">From</div>
            <div className="btn-value" style={{ color: '#FF4DA6' }}>Bloom &amp; Bliss</div>
          </div>
        </button>

        <span className="map-arrow">→</span>

        {/* To: Destination */}
        <button className="map-route-btn to" onClick={handleFlyDest}>
          <span style={{ fontSize: '20px' }}>🏠</span>
          <div>
            <div className="btn-label">To</div>
            <div className="btn-value" style={{ color: '#4CAF50' }}>
              {customerAddress || 'Customer'}
            </div>
          </div>
        </button>

        {/* Turn-by-Turn Instruction Badge */}
        {nextInstruction && (
          <div className="map-instruction-pill" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(33, 150, 243, 0.1)',
            padding: '8px 14px',
            borderRadius: '12px',
            border: '1px solid rgba(33, 150, 243, 0.2)',
            fontSize: '12px',
            fontWeight: '700',
            color: '#1565C0',
            flexShrink: 0
          }}>
            <span style={{fontSize: '16px'}}>{getManeuverIcon(nextInstruction.modifier)}</span>
            <div style={{display: 'flex', flexDirection: 'column'}}>
              <span style={{fontSize: '10px', color: '#888', textTransform: 'uppercase'}}>In {nextInstruction.distance}m</span>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{nextInstruction.text}</span>
            </div>
          </div>
        )}

        {/* Overview */}
        <button
          className={`map-action-btn ${fitAll ? 'overview-active' : 'inactive'}`}
          onClick={handleFitAll}
        >
          🗺️ Overview
        </button>

        {/* Follow Driver */}
        <button
          className={`map-action-btn ${autoFollow ? 'follow-active' : 'inactive'}`}
          onClick={handleFollowDriver}
        >
          {autoFollow ? '📡 Following' : '🎯 Follow Driver'}
        </button>

        {/* GPS Status */}
        <div className={`map-gps-status ${gpsClass}`}>
          <span className={`gps-dot ${gpsStatus === 'active' ? 'blink-gps' : ''}`} />
          {gpsStatus === 'active' ? `GPS ±${accuracy}m` : gpsStatus === 'error' ? 'GPS Off' : 'GPS…'}
        </div>
      </div>

      {/* ── Map Canvas ── */}
      <div className="map-canvas">
        <MapContainer
          center={initialCenter}
          zoom={15}
          scrollWheelZoom
          zoomControl={false}
          style={{ height: '100%', width: '100%' }}
        >
          <ZoomControl position="bottomright" />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Store Marker */}
          <Marker position={[storeCoords.lat, storeCoords.lng]} icon={storeIcon}>
            <Popup>
              <strong style={{ color: '#FF4DA6' }}>🏪 Bloom &amp; Bliss Store</strong><br />
              Singanallur, Coimbatore<br />
              <em>Order dispatch point</em>
            </Popup>
          </Marker>

          {/* Destination Marker */}
          <Marker position={[destCoords.lat, destCoords.lng]} icon={destIcon}>
            <Popup>
              <strong style={{ color: '#4CAF50' }}>🏠 Delivery Destination</strong><br />
              {customerAddress || 'Customer Location'}<br />
              <em>Your order arrives here</em>
            </Popup>
          </Marker>

          {/* GPS Accuracy Circle */}
          {liveCoords && accuracy && (
            <Circle
              center={[liveCoords.lat, liveCoords.lng]}
              radius={accuracy}
              pathOptions={{
                color: '#2196F3',
                fillColor: '#2196F3',
                fillOpacity: 0.08,
                weight: 1.5,
                dashArray: '5, 5',
              }}
            />
          )}

          {/* Animated Delivery Truck Marker */}
          {activeCoords && <AnimatedDeliveryMarker coords={activeCoords} />}

          {/* Planned road route: store → destination */}
          {fullRoutePath.length > 0 && (
            <Polyline
              positions={fullRoutePath}
              pathOptions={{ color: '#2196F3', weight: 4, opacity: 0.2, dashArray: '5, 10' }}
            />
          )}

          {/* Traveled trail (Past) */}
          {pathHistory.length > 1 && (
            <Polyline
              positions={pathHistory.map((p) => [p.lat, p.lng])}
              pathOptions={{ color: '#9E9E9E', weight: 4, opacity: 0.6, lineCap: 'round', lineJoin: 'round' }}
            />
          )}

          {/* Active Navigation Route (Future Road Path) - THE BLUE LINE */}
          {remainingPath.length > 0 && (
            <Polyline
              positions={remainingPath}
              pathOptions={{ color: '#2196F3', weight: 6, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }}
            />
          )}

          {/* Fit-all bounds */}
          <BoundsController storeCoords={storeCoords} destCoords={destCoords} active={fitAll} />

          {/* Auto-follow driver */}
          <LiveMapController coords={autoFollow ? activeCoords : null} autoFollow={autoFollow} />

          {/* Fly to individual marker */}
          {flyTarget && <FlyToController target={flyTarget} />}
        </MapContainer>
      </div>
    </div>
  );
};

export default DeliveryMap;
