import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>🌸 About Us</h3>
          <p>
            Keerthi Cakes & Flowers is your one-stop destination for fresh cakes, beautiful flowers, and perfect gifts. We deliver happiness with every order!
          </p>
          <div className="footer-social">
            <div className="social-icon">📘</div>
            <div className="social-icon">📷</div>
            <div className="social-icon">🐦</div>
            <div className="social-icon">📧</div>
          </div>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#cakes">Cakes</a></li>
            <li><a href="#flowers">Flowers</a></li>
            <li><a href="#gifts">Gifts</a></li>
            <li><a href="#cart">Cart</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact Info</h3>
          <p>📍 Address: 123 Flower Lane, Garden City, GC 12345</p>
          <p>📞 Phone: +1 (555) 123-4567</p>
          <p>📧 Email: hello@keerthicakes.com</p>
          <p>⏰ Hours: 9 AM - 9 PM (Monday - Sunday)</p>
        </div>

        <div className="footer-section">
          <h3>Policies</h3>
          <ul className="footer-links">
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#terms">Terms & Conditions</a></li>
            <li><a href="#shipping">Shipping Info</a></li>
            <li><a href="#returns">Returns & Exchanges</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Keerthi Cakes & Flowers. All rights reserved. Made with 💝 for you.</p>
      </div>
    </footer>
  );
};

export default Footer;
