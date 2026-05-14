import React from 'react';
import './FloatingAddButton.css';

const FloatingAddButton = ({ onClick }) => {
  return (
    <button className="floating-add-btn" onClick={onClick} title="Add New Product">
      <span className="plus-icon">+</span>
      <span className="btn-text">Add Item</span>
    </button>
  );
};

export default FloatingAddButton;
