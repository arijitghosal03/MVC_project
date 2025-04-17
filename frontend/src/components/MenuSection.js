import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronDown, 
  faChevronUp, 
  faHeart, 
  faInfoCircle, 
  faPlus 
} from '@fortawesome/free-solid-svg-icons';
import './MenuSection.css';

const MenuSection = ({ 
  menuItems, 
  menuCategories, 
  addToCart, 
  toggleFavorite, 
  favorites, 
  setShowDetails 
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter menu items based on search and category
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Render star rating
  const renderStarRating = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? 'filled' : ''}`}>★</span>
      );
    }
    return <div className="star-rating">{stars}</div>;
  };

  return (
    <div className="menu-section">
      {/* Hero Banner */}
      <div className="menu-hero">
        <div className="menu-hero-content">
          <div className="menu-hero-text">
            <h1 className="hero-tagline">
              SOMETHING<br />
              FOR<br />
              EVERYONE
            </h1>
            <Button variant="primary" className="nutrition-btn">
              Nutrition Info
            </Button>
          </div>
          <div className="menu-hero-image">
            <img 
              src="/images/pho-bowl.png" 
              alt="Pho bowl"
              className="hero-pho-image" 
            />
          </div>
          <div className="menu-hero-text right-text">
            <h2 className="nutrition-tagline">
              Nutritious<br />
              Bone<br />
              Broths
            </h2>
            <p className="broth-info">Simmered for a minimum of 12 hours</p>
          </div>
        </div>
      </div>

      {/* Menu Container */}
      <Container className="menu-items-container">
        <div className="menu-header">
          <h2 className="section-title">Our Menu</h2>
          <div className="search-filter-container">
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <Button
              className="filter-toggle"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <FontAwesomeIcon
                icon={isFilterOpen ? faChevronUp : faChevronDown}
              />
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="menu-filters"
            >
              <Button
                className={`category-btn ${selectedCategory === "All" ? "active" : ""}`}
                onClick={() => setSelectedCategory("All")}
              >
                All
              </Button>
              {menuCategories.map((category) => (
                <Button
                  key={category}
                  className={`category-btn ${selectedCategory === category ? "active" : ""}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Menu Items Grid */}
        <Row className="menu-grid">
          <AnimatePresence>
            {filteredMenuItems.length === 0 ? (
              <Col xs={12}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="no-results"
                >
                  <h4>No items found</h4>
                  <p>Try adjusting your search or filters</p>
                </motion.div>
              </Col>
            ) : (
              filteredMenuItems.map((item) => (
                <Col key={item.id} xs={12} md={6} lg={4}>
                  <motion.div
                    className="menu-card"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="menu-item">
                      <div className="item-image-container">
                        <img
                          src={`/uploads/${item.image}`}
                          alt={item.name}
                          className="item-image"
                        />
                        <div className="item-actions">
                          <button
                            className="action-btn info-btn"
                            onClick={() => setShowDetails(item.id)}
                          >
                            <FontAwesomeIcon icon={faInfoCircle} />
                          </button>
                          <button
                            className={`action-btn favorite-btn ${
                              favorites.includes(item.id) ? "active" : ""
                            }`}
                            onClick={() => toggleFavorite(item.id)}
                          >
                            <FontAwesomeIcon icon={faHeart} />
                          </button>
                        </div>
                      </div>
                      <div className="item-content">
                        <div className="item-header">
                          <h3 className="item-title">{item.name}</h3>
                          <span className="item-price">₹{item.price}</span>
                        </div>
                        <div className="item-rating">
                          {renderStarRating(item.rating)}
                          <span className="rating-count">({item.rating})</span>
                        </div>
                        <p className="item-description">{item.description}</p>
                        {item.specials && item.specials.length > 0 && (
                          <div className="item-specials">
                            {item.specials.map((special, idx) => (
                              <span key={idx} className="special-tag">
                                {special}
                              </span>
                            ))}
                          </div>
                        )}
                        <Button
                          className="add-to-cart-btn"
                          onClick={() => addToCart(item)}
                        >
                          <FontAwesomeIcon icon={faPlus} className="btn-icon" />
                          Add to Order
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </Col>
              ))
            )}
          </AnimatePresence>
        </Row>
      </Container>
    </div>
  );
};

export default MenuSection;