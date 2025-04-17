import React, { useState } from 'react';
import './Navbar.css'; // Import the CSS file

const Navbar = ({ setShowLocationModal, setShowAboutModal, setShowReservationModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const handleOrderScroll = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
    setIsOpen(false);
  };
  
  return (
    <>
      {/* Hamburger button - always visible */}
      <button 
        className="hamburger-btn"
        onClick={toggleNavbar}
        aria-label="Toggle navigation menu"
      >
        <div className={`hamburger-icon ${isOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
      
      {/* Animated navbar */}
      <div className={`navbar ${isOpen ? 'open' : ''}`}>
        {/* Logo section */}
        <div className="logo-section">
          <div className="logo-icon">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path d="M12 3C8.13 3 5 6.13 5 10C5 13.63 8.13 16.63 12 16.63C15.87 16.63 19 13.63 19 10C19 6.13 15.87 3 12 3Z" fill="white"/>
              <path d="M8 14L8 21L12 19L16 21L16 14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="logo-text">CMF</div>
        </div>
        
        {/* Menu items */}
        <div className="menu-items">
          <button 
            className="menu-button"
            onClick={() => {
              setShowLocationModal(true);
              setIsOpen(false);
            }}
          >
            Locations
          </button>
          <button 
            className="menu-button"
            onClick={() => {
              setShowAboutModal(true);
              setIsOpen(false);
            }}
          >
            About Us
          </button>
          <div 
            className="menu-item"
            onClick={() => {
              window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
              });
            }}
          >
            Contact Us
          </div>
          <button 
            className="menu-button order-button"
            onClick={handleOrderScroll}
          >
            Order your Food
          </button>
          <button 
            className="menu-button book-button"
            onClick={() => {
              setShowReservationModal(true);
              setIsOpen(false);
            }}
          >
            Book A Table
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;