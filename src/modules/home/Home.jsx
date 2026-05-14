import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../../components/Productcard';
import { API_BASE_URL } from '../../config';

// Images
import flower1 from '../../assets/flower1.jpg';
import cake1 from '../../assets/cake1.jpg';
import gift1 from '../../assets/gift1.jpg';
import t1 from '../../assets/t1.jpg';
import f3 from '../../assets/f3.jpg';
import c2 from '../../assets/c2.jpg';
import sc1 from '../../assets/sc1.jpg';
import sc2 from '../../assets/sc2.avif';
import sc3 from '../../assets/sc3.avif';

import Homepage from '../../assets/Homepage.avif';
import img from '../../assets/img.avif';
import card from '../../assets/card.avif';
import plant from '../../assets/plant.avif';
import same from '../../assets/same.avif';
import FlowersCard from '../../assets/Flowers-card.avif';
import International from '../../assets/International.avif';

import birthday from '../../assets/birthday.avif';
import anniversary from '../../assets/anniversary.avif';
import gifthim from '../../assets/gifthim.avif';
import gifther from '../../assets/gifther.avif';

import './Home.css';

const Home = ({ onAddToCart, refreshTrigger, isAdmin, onDeleteSuccess }) => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/home/featured`);
        const data = await response.json();
        setFeaturedProducts(data.data || []);
      } catch (err) {
        console.error('Failed to fetch featured products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, [refreshTrigger]);

  const handleAddToCart = (product) => {
    if (onAddToCart) onAddToCart(product);
    alert(`${product.name} added to cart! 🛒`);
  };

  // Hero Slider
  const HeroSlider = () => {
    const images = [sc1, sc2, sc3];
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }, [images.length]);

    return (
      <>
        <div className='make-every'>
          <h2>Make Every Moment Special!!🌸</h2>
        </div>
        <div className="hero-slider">
          <div
            className="hero-slider-track"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {images.map((img, index) => (
              <img key={index} src={img} alt={`Slide ${index}`} />
            ))}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero-section">
        <HeroSlider />
        <h1 className="hero-title">Fresh Cakes, Beautiful Flowers & Perfect Gifts</h1>
        <p className="hero-subtitle">Your one-stop destination for celebrating life's special moments</p>

        {/* Collections Images */}
        <div className="colloction">
          <img src={FlowersCard} alt="flowers" />
          <img src={Homepage} alt="homepage" />
          <img src={img} alt="img" />
          <img src={card} alt="card" />
          <img src={plant} alt="plant" />
          <img src={same} alt="same" />
          <img src={International} alt="international" />
        </div>

        <div className="colloction-name">
          <h3>Flowers</h3>
          <h3>Cakes</h3>
          <h3>Gifts</h3>
          <h3>Combos</h3>
          <h3>Plants</h3>
          <h3>Same Day Delivery</h3>
          <h3>International Delivery</h3>
        </div>

        <div className="hero-buttons">
          <button className="hero-btn hero-primary-btn" onClick={() => navigate('/products')}>✨ Shop Now</button>
          <button className="hero-btn hero-secondary-btn" onClick={() => navigate('/gifts')}>🎁 View Gifts</button>
        </div>
      </section>

      {/* Shop By Occasions */}
      <section className="shop-love">
        <h2>Shop By Occasions & Relations</h2>
        <p>Surprise Your Loved Ones</p>

        <div className="love-img">
          <div className="love-card">
            <img src={birthday} alt="birthday" />
            <span className="love-card-text">Birthday</span>
          </div>
          <div className="love-card">
            <img src={anniversary} alt="anniversary" />
            <span className="love-card-text">Anniversary</span>
          </div>
          <div className="love-card">
            <img src={gifthim} alt="gift-for-him" />
            <span className="love-card-text">Gift For Him</span>
          </div>
          <div className="love-card">
            <img src={gifther} alt="gift-for-her" />
            <span className="love-card-text">Gift For Her</span>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <h2 className="section-title">Our Collections</h2>
        <div className="categories-grid">
          <div className="category-card" onClick={() => navigate('/products?category=cakes')}>
            <div className="category-header"><img src={cake1} alt="cake" /></div>
            <div className="category-body">
              <h3 className="category-name">Delicious Cakes</h3>
              <p className="category-description">Freshly baked cakes for birthdays, anniversaries, and celebrations. Custom designs available.</p>
              <button className="category-btn">Browse Cakes</button>
            </div>
          </div>




          <div className="category-card" onClick={() => navigate('/products?category=flowers')}>
            <div className="category-header"><img src={flower1} alt="flower" /></div>
            <div className="category-body">
              <h3 className="category-name">Beautiful Flowers</h3>
              <p className="category-description">Hand-picked fresh flowers arranged with care. Perfect for any occasion.</p>
              <button className="category-btn">Browse Flowers</button>
            </div>
          </div>

          <div className="category-card" onClick={() => navigate('/products?category=flowers')}>
            <div className="category-header"><img src={plant} alt="flower" /></div>
            <div className="category-body">
              <h3 className="category-name">Beautiful Flowers</h3>
              <p className="category-description">Hand-picked fresh flowers arranged with care. Perfect for any occasion.</p>
              <button className="category-btn">Browse Flowers</button>
            </div>
          </div>



          <div className="category-card" onClick={() => navigate('/products?category=flowers')}>
            <div className="category-header"><img src={c2} alt="flower" /></div>
            <div className="category-body">
              <h3 className="category-name">Beautiful Flowers</h3>
              <p className="category-description">Hand-picked fresh flowers arranged with care. Perfect for any occasion.</p>
              <button className="category-btn">Browse Flowers</button>
            </div>
          </div>


          <div className="category-card" onClick={() => navigate('/products?category=flowers')}>
            <div className="category-header"><img src={t1} alt="flower" /></div>
            <div className="category-body">
              <h3 className="category-name">Beautiful Flowers</h3>
              <p className="category-description">Hand-picked fresh flowers arranged with care. Perfect for any occasion.</p>
              <button className="category-btn">Browse Flowers</button>
            </div>
          </div>


          <div className="category-card" onClick={() => navigate('/products?category=flowers')}>
            <div className="category-header"><img src={sc3} alt="flower" /></div>
            <div className="category-body">
              <h3 className="category-name">Beautiful Flowers</h3>
              <p className="category-description">Hand-picked fresh flowers arranged with care. Perfect for any occasion.</p>
              <button className="category-btn">Browse Flowers</button>
            </div>
          </div>



          <div className="category-card" onClick={() => navigate('/products?category=flowers')}>
            <div className="category-header"><img src={f3} alt="flower" /></div>
            <div className="category-body">
              <h3 className="category-name">Beautiful Flowers</h3>
              <p className="category-description">Hand-picked fresh flowers arranged with care. Perfect for any occasion.</p>
              <button className="category-btn">Browse Flowers</button>
            </div>
          </div>



          <div className="category-card" onClick={() => navigate('/products?category=flowers')}>
            <div className="category-header"><img src={c2} alt="flower" /></div>
            <div className="category-body">
              <h3 className="category-name">Beautiful Flowers</h3>
              <p className="category-description">Hand-picked fresh flowers arranged with care. Perfect for any occasion.</p>
              <button className="category-btn">Browse Flowers</button>
            </div>
          </div>


          <div className="category-card" onClick={() => navigate('/products?category=flowers')}>
            <div className="category-header"><img src={flower1} alt="flower" /></div>
            <div className="category-body">
              <h3 className="category-name">Beautiful Flowers</h3>
              <p className="category-description">Hand-picked fresh flowers arranged with care. Perfect for any occasion.</p>
              <button className="category-btn">Browse Flowers</button>
            </div>
          </div>


          <div className="category-card" onClick={() => navigate('/products?category=flowers')}>
            <div className="category-header"><img src={flower1} alt="flower" /></div>
            <div className="category-body">
              <h3 className="category-name">Beautiful Flowers</h3>
              <p className="category-description">Hand-picked fresh flowers arranged with care. Perfect for any occasion.</p>
              <button className="category-btn">Browse Flowers</button>
            </div>
          </div>


          <div className="category-card" onClick={() => navigate('/products?category=flowers')}>
            <div className="category-header"><img src={flower1} alt="flower" /></div>
            <div className="category-body">
              <h3 className="category-name">Beautiful Flowers</h3>
              <p className="category-description">Hand-picked fresh flowers arranged with care. Perfect for any occasion.</p>
              <button className="category-btn">Browse Flowers</button>
            </div>
          </div>

          <div className="category-card" onClick={() => navigate('/gifts')}>
            <div className="category-header"><img src={gift1} alt="gift" /></div>
            <div className="category-body">
              <h3 className="category-name">Special Gifts</h3>
              <p className="category-description">Carefully curated gifts including teddy bears, chocolates, and combo bundles.</p>
              <button className="category-btn">Browse Gifts</button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-section">
        <h2 className="section-title">Featured Products</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#fff' }}>Loading featured items... 🌸</div>
        ) : (
          <div className="products-grid">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} isAdmin={isAdmin} onDeleteSuccess={onDeleteSuccess} />
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#aaa', width: '100%', gridColumn: '1/-1' }}>No featured products available.</p>
            )}
          </div>
        )}
        <button className="view-all-btn" onClick={() => navigate('/products')}>View All Products →</button>
      </section>
    </div>
  );
};

export default Home;