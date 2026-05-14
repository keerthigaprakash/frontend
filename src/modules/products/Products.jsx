import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/Productcard';
import { API_BASE_URL } from '../../config';
import './Products.css';
import ch1 from '../../assets/ch1.jpg';
import ch2 from '../../assets/ch2.jpg';
import img from '../../assets/img.avif';
import f2 from '../../assets/f2.jpg';
import f3 from '../../assets/f3.jpg';
import f4 from '../../assets/f4.jpg';
import f5 from '../../assets/f5.jpg';
import cake1 from '../../assets/cake1.jpg';
import cake2 from '../../assets/cake2.jpg';
import cakeHome from '../../assets/cake-home.avif';
import c1 from '../../assets/c1.jpg';
import c2 from '../../assets/c2.jpg';
import t2 from '../../assets/t2.jpg';



const Products = ({ onAddToCart, refreshTrigger, isAdmin, onDeleteSuccess }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      const category = searchParams.get('category') || '';
      setSelectedCategory(category);
      setLoading(true);

      try {
        const url = category && category !== 'all'
          ? `${API_BASE_URL}/home/products?category=${category}`
          : `${API_BASE_URL}/home/products`;
        
        const response = await fetch(url, { signal: controller.signal });
        const data = await response.json();
        setProducts(data.data || []);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Failed to fetch products:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    return () => controller.abort();
  }, [searchParams, refreshTrigger]);


  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSearchParams({ category });
  };

  const handleAddToCart = (product) => {
    if (onAddToCart) {
      onAddToCart(product);
    }
    alert(`${product.name} added to cart! 🛒`);
  };

  return (
    <div className="products-page">
      <div className="products-container">
        <div className="products-header">
          <h1 className="products-title">Our Products</h1>
        </div>

        {loading ? (
          <div className="loading-message">Loading products... 🍰</div>
        ) : products.length > 0 ? (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                isAdmin={isAdmin}
                onDeleteSuccess={onDeleteSuccess}
              />
            ))}
          </div>
        ) : (
          <div className="no-products">
            <p>No products found in this category. 🎂 🌹 🎁</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
