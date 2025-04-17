import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Modal,
  Form,
  ListGroup,
} from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import MenuAdminPage from "./MenuAdminPage";
import CartModal from "./CartModal";
import Navbar from "./Navbar";
import LocationModal from "./LocationModal";
import {
  faUtensils,
  faUserCog,
  faWineGlassAlt,
  faCookieBite,
  faMugHot,
  faSearch,
  faPepperHot,
  
  faShoppingCart,
  faPlus,
  faMinus,
  faHeart,
  faInfoCircle,
  faStar,
  faStarHalfAlt,
  faMapMarkerAlt,
  faClock,
  faPhone,
  faChevronUp,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const Resturantpage = () => {
  // State management
  const [menuCategories, setMenuCategories] = useState([
    "Appetizers",
    "Main Courses",
    "Desserts",
    "Beverages",
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    table: "",
    specialRequests: "",
  });
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showDetails, setShowDetails] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [reservationInfo, setReservationInfo] = useState({
    name: "",
    date: "",
    time: "",
    guests: "2",
    phone: "",
    email: "",
    specialRequests: "",
  });
  const[isOpen, setIsOpen] = useState(false);
  const toggleNavbar = () => setIsOpen(!isOpen);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState({
    rating: 5,
    comment: "",
    name: "",
    email: "",
  });
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activePromo, setActivePromo] = useState(0);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Refs for animations
  const headerRef = useRef(null);
  const menuRef = useRef(null);
  const promoRef = useRef(null);

  // Load menu items and setup animations on component mount
  useEffect(() => {
    // Simulate loading delay
    setTimeout(() => {
      fetchMenuItems();
      setIsLoading(false);
    }, 4500);

    // Header parallax effect
    if (headerRef.current) {
      gsap.to(headerRef.current, {
        backgroundPositionY: "30%",
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    // Automatic promo carousel
    const promoInterval = setInterval(() => {
      setActivePromo((prev) => (prev + 1) % 3);
    }, 5000);

    return () => {
      clearInterval(promoInterval);
    };
  }, []);

  // Effect for menu item animations
  useEffect(() => {
    if (!isLoading && menuRef.current) {
      const menuCards = menuRef.current.querySelectorAll(".menu-card");

      gsap.fromTo(
        menuCards,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.5,
          ease: "power3.out",
        }
      );
    }
  }, [isLoading, selectedCategory]);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/menu-items");

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log(data);
      // Transform API data structure if needed to match your frontend expectations
      const formattedMenuItems = data.map((item) => ({
        id: item.id, // MongoDB ObjectId will be here
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        image: item.image, // Fallback image if none provided
        rating: item.rating || 4.0, // Default rating if not in API
        specials: item.specials || [], // Default empty array if not in API
        isAvailable: item.isAvailable,
      }));

      setMenuItems(formattedMenuItems);
    } catch (err) {
      console.error("Failed to fetch menu items:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter menu items by category and search query
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Add item to cart with animation
  const addToCart = (item) => {
    // Show notification
    setNotificationMessage(`${item.name} added to your order!`);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);

    const existingItem = cart.find((cartItem) => cartItem.id === item.id);

    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    const existingItem = cart.find((item) => item.id === itemId);

    if (existingItem.quantity === 1) {
      setCart(cart.filter((item) => item.id !== itemId));
    } else {
      setCart(
        cart.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
        )
      );
    }
  };

  // Toggle favorite status
  const toggleFavorite = (itemId) => {
    if (favorites.includes(itemId)) {
      setFavorites(favorites.filter((id) => id !== itemId));
    } else {
      setFavorites([...favorites, itemId]);
      // Show notification
      const item = menuItems.find((item) => item.id === itemId);
      setNotificationMessage(`${item.name} added to your favorites!`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
    }
  };

  // Calculate total price
  const calculateTotal = () => {
    return cart
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };



  // Handle form input changes
  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;

    if (formType === "checkout") {
      setCustomerInfo({
        ...customerInfo,
        [name]: value,
      });
    } else if (formType === "reservation") {
      setReservationInfo({
        ...reservationInfo,
        [name]: value,
      });
    } else if (formType === "feedback") {
      setFeedback({
        ...feedback,
        [name]: value,
      });
    }
  };

  // Handle reservation submission
 const submitReservation = async () => {
    try {
      // Format the data to match the backend model
      const reservationData = {
        name: reservationInfo.name,
        date: reservationInfo.date,
        time: reservationInfo.time,
        guests: reservationInfo.guests,
        phone: reservationInfo.phone,
        email: reservationInfo.email,
        specialRequests: reservationInfo.specialRequests,
        // Status will be set to "Pending" by default in the backend
      };

      console.log("Sending reservation data:", reservationData);
      
      // Send the data to the backend API
      const response = await axios.post('http://localhost:5000/api/reservation-info', reservationData);
      
      console.log("Reservation response:", response.data);
      
      // Close the modal and show success notification
      setShowReservationModal(false);
      setNotificationMessage(
        "Reservation confirmed! We look forward to seeing you."
      );
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      console.error("Error submitting reservation:", error);
      setNotificationMessage(
        "Error submitting reservation. Please try again."
      );
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  // Handle feedback submission
  const submitFeedback = () => {
    console.log("Feedback Data:", feedback);
    // This would normally send to your backend
    setShowFeedbackModal(false);
    setNotificationMessage("Thank you for your feedback!");
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Handle order submission
  const submitOrder = () => {
    const orderData = {
      items: cart.map((item) => ({
        item: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      server: "Pending Assignment", // Will be assigned by staff
      table: customerInfo.table,
      specialRequests: customerInfo.specialRequests,
      customerName: customerInfo.name,
      total: calculateTotal(),
    };
    console.log("Order Data:", orderData);
    // Send to your backend API
    axios
      .post("http://localhost:5000/order/create", orderData)
      .then((response) => {
        if (response.status === 200) {
          setOrderNumber(
            response.data._id || Math.floor(1000 + Math.random() * 9000)
          );
          setOrderConfirmed(true);
          setCart([]);
          setShowCheckout(false);
        }
      })
      .catch((error) => console.error("Error placing order:", error));
  };
  // Render star rating
  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FontAwesomeIcon
          key={`star-${i}`}
          icon={faStar}
          className="text-warning"
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <FontAwesomeIcon
          key="half-star"
          icon={faStarHalfAlt}
          className="text-warning"
        />
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FontAwesomeIcon
          key={`empty-${i}`}
          icon={faStar}
          className="text-muted"
        />
      );
    }

    return stars;
  };

  // Render loading spinner
  const renderLoader = () => (
  <motion.div
    className="hello-parent"
    style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    }}
    initial={{ opacity: 1 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 5000 }}
  >
    <svg className="hello-word" width="365" height="365" viewBox="0 0 365 365">
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        id="H-letter"
      >
        <motion.line
          className="H-left-stroke"
          x1="17"
          y1="0"
          x2="17"
          y2="124"
          stroke="#fff"
          fill="none"
          strokeWidth="34"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        />
        <motion.line
          className="H-mid-stroke"
          x1="33"
          y1="62"
          x2="68"
          y2="62"
          stroke="#fff"
          fill="none"
          strokeWidth="34"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        />
        <motion.line
          className="H-right-stroke"
          x1="84"
          y1="0"
          x2="84"
          y2="124"
          stroke="#fff"
          fill="none"
          strokeWidth="34"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        />
      </motion.g>

      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        id="E-letter"
      >
        <motion.line
          className="E-left-stroke"
          x1="138"
          y1="0"
          x2="138"
          y2="124"
          stroke="#fff"
          fill="none"
          strokeWidth="34"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        />
        <motion.line
          className="E-top-stroke"
          x1="154"
          y1="17"
          x2="201"
          y2="17"
          stroke="#fff"
          fill="none"
          strokeWidth="34"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        />
        <motion.line
          className="E-mid-stroke"
          x1="154"
          y1="62"
          x2="196"
          y2="62"
          stroke="#fff"
          fill="none"
          strokeWidth="34"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        />
        <motion.line
          className="E-bottom-stroke"
          x1="154"
          y1="107"
          x2="201"
          y2="107"
          stroke="#fff"
          fill="none"
          strokeWidth="34"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        />
      </motion.g>

      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        id="L-one-letter"
      >
        <motion.line
          className="L-one-long-stroke"
          x1="17"
          y1="153"
          x2="17"
          y2="277"
          stroke="#fff"
          fill="none"
          strokeWidth="34"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
        />
        <motion.line
          className="L-one-short-stroke"
          x1="33"
          y1="260"
          x2="77"
          y2="260"
          stroke="#fff"
          fill="none"
          strokeWidth="34"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4 }}
        />
      </motion.g>

      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.6 }}
        id="L-two-letter"
      >
        <motion.line
          className="L-two-long-stroke"
          x1="104"
          y1="153"
          x2="104"
          y2="277"
          stroke="#fff"
          fill="none"
          strokeWidth="34"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8 }}
        />
        <motion.line
          className="L-two-short-stroke"
          x1="120"
          y1="260"
          x2="164"
          y2="260"
          stroke="#fff"
          fill="none"
          strokeWidth="34"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
        />
      </motion.g>

      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.2 }}
        id="O-letter"
      >
        <motion.circle
          className="O-stroke"
          cx="231"
          cy="215"
          r="48"
          stroke="#fff"
          fill="none"
          strokeWidth="31"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.4 }}
        />
      </motion.g>

      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.6 }}
        id="red-dot"
      >
        <motion.circle
          className="red-dot"
          cx="325"
          cy="260"
          r="20"
          fill="#FF5851"
          stroke="none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.8 }}
        />

        <motion.line
          x1="325"
          y1="260"
          x2="325"
          y2="260"
          stroke="#FF5851"
          className="red-dot"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4 }}
        />
      </motion.g>
    </svg>
  </motion.div>
);


  return (
    <div className="restaurant-page">
      {isLoading ? (
        renderLoader()
      ) : (
        <>
          {/* Admin Navigation Button */}
          <motion.div
            className="admin-button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              zIndex: 1000,
            }}
          >
          </motion.div>

          {/* Floating cart button */}
          <motion.div
            className="floating-cart"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => setShowCart(true)}
          >
            <FontAwesomeIcon icon={faShoppingCart} />
            {cart.length > 0 && (
              <Badge bg="warning" text="dark" pill className="cart-badge">
                {cart.reduce((total, item) => total + item.quantity, 0)}
              </Badge>
            )}
          </motion.div>

          {/* Notification toast */}
          <AnimatePresence>
            {showNotification && (
              <motion.div
                className="notification-toast"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
              >
                {notificationMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hero section with parallax effect */}
          <div className="hero-section" style={{ 
  backgroundImage: "url('https://as1.ftcdn.net/v2/jpg/03/24/73/92/1000_F_324739203_keeq8udvv0P2h1MLYJ0GLSlTBagoXS48.jpg')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
  height: '100vh',
  width: '100%'
}}>
  {/* Red overlay for the background */}
  <div style={{ 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    width: '100%', 
    height: '100%', 
    backgroundColor: '#E31837', 
    opacity: 0.85,
    zIndex: 1 
  }}></div>
  
  {/* Navigation Bar */}
  <div className="relative">
      {/* Hamburger button - always visible */}
      <button 
        className="fixed top-6 right-6 z-50 p-2 rounded-full bg-gray-800 focus:outline-none"
        onClick={toggleNavbar}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
          {isOpen ? (
            // X icon when menu is open
            <>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </>
          ) : (
            // Hamburger icon when menu is closed
            <>
              <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </>
          )}
        </svg>
      </button>
      
      {/* Animated navbar */}
      <Navbar 
        setShowLocationModal={setShowLocationModal}
        setShowAboutModal={setShowAboutModal}
        setShowReservationModal={setShowReservationModal}
      />
    </div>
  
  {/* Main Content */}
  <div style={{ 
    position: 'relative',
    zIndex: 5,
    height: 'calc(100% - 20px)',
    display: 'flex',
    alignItems: 'center'
  }}>
    <div style={{ 
      paddingLeft: '50px',
      width: '70%',
      color: '#EAE0D5',
    }}>
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ 
          fontSize: '10rem', 
          fontWeight: 'bold', 
          lineHeight: '0.9',
          fontFamily: '"Impact", sans-serif',
          color: '#EAE0D5',
          textTransform: 'uppercase',
          letterSpacing: '3px'
        }}
      >
        COOK<br />
        MY FOOD
      </motion.h1>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        style={{
          minWidth: '1000px',
          fontSize: '2.0 rem',
          fontWeight: 400,
          fontFamily: '"Lato", sans-serif',
        }}
      >
        <h4> We offer online food ordering and resturant reservation services</h4>
      </motion.div>
       
  </div>
    
   
    <Link to="/admin/menu">
      <div style={{ 
        position: 'absolute',
        right: '50px',
        bottom: '50px',
        width: '70px',
        height: '70px',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 6
      }}>
        <div style={{ 
          width: '60px',
          height: '60px',
          backgroundColor: 'white',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM6.5 12H17.5C18.33 12 19 12.67 19 13.5V20.5C19 21.33 18.33 22 17.5 22H6.5C5.67 22 5 21.33 5 20.5V13.5C5 12.67 5.67 12 6.5 12Z" fill="#212529"/>
          </svg>
        </div>
      </div>
    </Link>
  </div>
</div>


        <Container className="menu-container position-relative">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
    className="position-relative z-index-2"
  >
    <div className="menu-header mb-5">
      <h2 className="menu-title">SOMETHING<br />FOR<br />EVERYONE</h2>
      <div className="search-filter-container mt-4">
        <div className="search-wrapper">
          <Form.Control
            type="text"
            placeholder="Search our menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
        </div>
        <Button
          variant="primary"
          className="filter-toggle-btn"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <span>Filter</span>
          <FontAwesomeIcon
            icon={isFilterOpen ? faChevronUp : faChevronDown}
            className="ms-2"
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
          className="menu-filters mb-5"
        >
          <div className="d-flex flex-wrap">
            <Button
              variant={selectedCategory === "All" ? "primary" : "outline-primary"}
              className="me-3 mb-2 category-btn"
              onClick={() => setSelectedCategory("All")}
            >
              All
            </Button>
            {menuCategories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "primary" : "outline-primary"}
                className="me-3 mb-2 category-btn"
                onClick={() => setSelectedCategory(category)}
              >
                <FontAwesomeIcon
                  icon={
                    category === "Appetizers"
                      ? faUtensils
                      : category === "Main Courses"
                      ? faUtensils
                      : category === "Desserts"
                      ? faCookieBite
                      : faMugHot
                  }
                  className="me-2"
                />
                {category}
              </Button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>

  {/* Menu items with enhanced animations */}
  <Row xs={1} md={2} lg={3} className="g-5 mb-5" ref={menuRef}>
    <AnimatePresence>
      {filteredMenuItems.length === 0 ? (
        <Col xs={12}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-5"
          >
            <h4 className="empty-title">No items found</h4>
            <p className="empty-subtitle">
              Try adjusting your search or filters
            </p>
          </motion.div>
        </Col>
      ) : (
        filteredMenuItems.map((item, index) => (
          <Col key={item.id}>
            <motion.div
              className="menu-card h-100"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: index * 0.1,
                type: "spring", 
                stiffness: 100,
                damping: 15
              }}
              whileHover={{ 
                y: -15, 
                scale: 1.03,
                transition: { type: "spring", stiffness: 300 }
              }}
            >
              <Card className="h-100 menu-item-card">
                <div className="card-img-wrapper">
                  <Card.Img variant="top" src={`/uploads/${item.image}`} />
                  <motion.div 
                    className="menu-item-badge"
                    initial={{ rotate: -15 }}
                    animate={{ rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      delay: 0.2 + index * 0.1
                    }}
                  >
                    {item.specials.includes("New") && (
                      <span>NEW</span>
                    )}
                    {item.specials.includes("Popular") && (
                      <span>POPULAR</span>
                    )}
                  </motion.div>
                  <div className="card-actions">
                    <button
                      className="action-btn view-btn"
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
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <Card.Title className="menu-item-title">
                      {item.name}
                    </Card.Title>
                    <Badge
                      bg="primary"
                      className="price-badge"
                    >
                      ₹{item.price}
                    </Badge>
                  </div>
                  <div className="rating mb-3">
                    {renderStarRating(item.rating)}
                    <small className="ms-1">({item.rating})</small>
                  </div>
                  <Card.Text className="menu-item-desc">
                    {item.description}
                  </Card.Text>
                  {item.specials.length > 0 && (
                    <div className="specials mb-3">
                      {item.specials.map((special, idx) => (
                        <Badge
                          key={idx}
                          bg="light"
                          text="dark"
                          className="me-2 special-badge"
                        >
                          {special}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="dietary-info">
                    {item.glutenFree && (
                      <span className="dietary-badge gluten-free">GF</span>
                    )}
                    {item.vegan && (
                      <span className="dietary-badge vegan">VG</span>
                    )}
                    {item.spicy && (
                      <span className="dietary-badge spicy">
                        <FontAwesomeIcon icon={faPepperHot} />
                      </span>
                    )}
                  </div>
                </Card.Body>
                <Card.Footer className="border-0">
                  <Button
                    variant="primary"
                    className="w-100 add-to-cart-btn"
                    onClick={() => addToCart(item)}
                  >
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    Add to Order
                  </Button>
                </Card.Footer>
              </Card>
            </motion.div>
          </Col>
        ))
      )}
    </AnimatePresence>
  </Row>

  


           {/*About Modal*/}
           <Modal
  show={showAboutModal}
  onHide={() => setShowAboutModal(false)}
  centered
  className="about-modal"
>
  <Modal.Header
    closeButton
    style={{
      backgroundColor: '#fff',
      borderBottom: '2px solid #E31837',
    }}
  >
    <Modal.Title style={{ color: '#E31837', fontWeight: 'bold' }}>
      About Us
    </Modal.Title>
  </Modal.Header>

  <Modal.Body style={{ backgroundColor: '#fff', color: '#212529' }}>
    <p>
      At <strong>CMF</strong>, we bring flavors to life with our passionately
      curated menu and warm hospitality. Nestled in the heart of the city, CMF
      is where good food meets good vibes. From signature dishes to locally
      inspired tastes, we’re here to serve joy on every plate.
    </p>
    <p>
      Whether you're grabbing a quick bite, celebrating with family, or just
      treating yourself – you're always welcome at CMF.
    </p>

  </Modal.Body>

  <Modal.Footer
    style={{
      backgroundColor: '#fff',
      borderTop: '2px solid #E31837',
    }}
  >
    <Button
      variant="outline-danger"
      onClick={() => setShowAboutModal(false)}
    >
      Close
    </Button>
  </Modal.Footer>
</Modal>

            {/* Footer with social links */}
            <footer className="py-5 bg-black text-white">
  <Container>
    <Row className="mb-5">
      <Col md={4} className="mb-4 mb-md-0">
  <h5 className="text-white mb-4">Connect With Us</h5>
  <div className="d-flex">
    <a href="https://www.instagram.com/" className="me-3" style={{ display: 'inline-block', width: '40px', height: '40px', lineHeight: '40px', textAlign: 'center', borderRadius: '50%', transition: 'all 0.3s ease' }}
    
      onMouseOut={(e) => {e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#FF3A4B';}}>
      <svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 24 24" id="instagram"><path fill="#FF3A4B" d="M17.34,5.46h0a1.2,1.2,0,1,0,1.2,1.2A1.2,1.2,0,0,0,17.34,5.46Zm4.6,2.42a7.59,7.59,0,0,0-.46-2.43,4.94,4.94,0,0,0-1.16-1.77,4.7,4.7,0,0,0-1.77-1.15,7.3,7.3,0,0,0-2.43-.47C15.06,2,14.72,2,12,2s-3.06,0-4.12.06a7.3,7.3,0,0,0-2.43.47A4.78,4.78,0,0,0,3.68,3.68,4.7,4.7,0,0,0,2.53,5.45a7.3,7.3,0,0,0-.47,2.43C2,8.94,2,9.28,2,12s0,3.06.06,4.12a7.3,7.3,0,0,0,.47,2.43,4.7,4.7,0,0,0,1.15,1.77,4.78,4.78,0,0,0,1.77,1.15,7.3,7.3,0,0,0,2.43.47C8.94,22,9.28,22,12,22s3.06,0,4.12-.06a7.3,7.3,0,0,0,2.43-.47,4.7,4.7,0,0,0,1.77-1.15,4.85,4.85,0,0,0,1.16-1.77,7.59,7.59,0,0,0,.46-2.43c0-1.06.06-1.4.06-4.12S22,8.94,21.94,7.88ZM20.14,16a5.61,5.61,0,0,1-.34,1.86,3.06,3.06,0,0,1-.75,1.15,3.19,3.19,0,0,1-1.15.75,5.61,5.61,0,0,1-1.86.34c-1,.05-1.37.06-4,.06s-3,0-4-.06A5.73,5.73,0,0,1,6.1,19.8,3.27,3.27,0,0,1,5,19.05a3,3,0,0,1-.74-1.15A5.54,5.54,0,0,1,3.86,16c0-1-.06-1.37-.06-4s0-3,.06-4A5.54,5.54,0,0,1,4.21,6.1,3,3,0,0,1,5,5,3.14,3.14,0,0,1,6.1,4.2,5.73,5.73,0,0,1,8,3.86c1,0,1.37-.06,4-.06s3,0,4,.06a5.61,5.61,0,0,1,1.86.34A3.06,3.06,0,0,1,19.05,5,3.06,3.06,0,0,1,19.8,6.1,5.61,5.61,0,0,1,20.14,8c.05,1,.06,1.37.06,4S20.19,15,20.14,16ZM12,6.87A5.13,5.13,0,1,0,17.14,12,5.12,5.12,0,0,0,12,6.87Zm0,8.46A3.33,3.33,0,1,1,15.33,12,3.33,3.33,0,0,1,12,15.33Z"></path></svg>
    </a>
    <a href="https://www.linkedin.com/in/arijit-ghosal-b80257214/" className="me-3" style={{ display: 'inline-block', width: '40px', height: '40px', lineHeight: '40px', textAlign: 'center', color: '#FF3A4B', transition: 'all 0.3s ease' }}
    
      onMouseOut={(e) => {e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#FF3A4B';}}>
      <svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 24 24" id="linkedin-alt"><path fill="#FF3A4B" d="M17.5,8.999a5.41868,5.41868,0,0,0-2.56543.64453A.99918.99918,0,0,0,14,8.999H10a.99943.99943,0,0,0-1,1v12a.99942.99942,0,0,0,1,1h4a.99942.99942,0,0,0,1-1v-5.5a1,1,0,1,1,2,0v5.5a.99942.99942,0,0,0,1,1h4a.99942.99942,0,0,0,1-1v-7.5A5.50685,5.50685,0,0,0,17.5,8.999Zm3.5,12H19v-4.5a3,3,0,1,0-6,0v4.5H11v-10h2v.70313a1.00048,1.00048,0,0,0,1.78125.625A3.48258,3.48258,0,0,1,21,14.499Zm-14-12H3a.99943.99943,0,0,0-1,1v12a.99942.99942,0,0,0,1,1H7a.99942.99942,0,0,0,1-1v-12A.99943.99943,0,0,0,7,8.999Zm-1,12H4v-10H6ZM5.01465,1.542A3.23283,3.23283,0,1,0,4.958,7.999h.02832a3.23341,3.23341,0,1,0,.02832-6.457ZM4.98633,5.999H4.958A1.22193,1.22193,0,0,1,3.58887,4.77051c0-.7461.55957-1.22852,1.42578-1.22852A1.2335,1.2335,0,0,1,6.41113,4.77051C6.41113,5.5166,5.85156,5.999,4.98633,5.999Z"></path></svg>
    </a>
    <a href="https://web.whatsapp.com/" className="me-3" style={{ display: 'inline-block', width: '40px', height: '40px', lineHeight: '40px', textAlign: 'center', borderRadius: '50%', color: '#FF3A4B', transition: 'all 0.3s ease' }}
     
      onMouseOut={(e) => {e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#FF3A4B';}}>
      <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" viewBox="0 0 24 24" id="whatsapp"><path fill="#FF3A4B" d="M16.6 14c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.7-.3-1.4-.7-2-1.2-.5-.5-1-1.1-1.4-1.7-.1-.2 0-.4.1-.5.1-.1.2-.3.4-.4.1-.1.2-.3.2-.4.1-.1.1-.3 0-.4-.1-.1-.6-1.3-.8-1.8-.1-.7-.3-.7-.5-.7h-.5c-.2 0-.5.2-.6.3-.6.6-.9 1.3-.9 2.1.1.9.4 1.8 1 2.6 1.1 1.6 2.5 2.9 4.2 3.7.5.2.9.4 1.4.5.5.2 1 .2 1.6.1.7-.1 1.3-.6 1.7-1.2.2-.4.2-.8.1-1.2l-.4-.2m2.5-9.1C15.2 1 8.9 1 5 4.9c-3.2 3.2-3.8 8.1-1.6 12L2 22l5.3-1.4c1.5.8 3.1 1.2 4.7 1.2 5.5 0 9.9-4.4 9.9-9.9.1-2.6-1-5.1-2.8-7m-2.7 14c-1.3.8-2.8 1.3-4.4 1.3-1.5 0-2.9-.4-4.2-1.1l-.3-.2-3.1.8.8-3-.2-.3c-2.4-4-1.2-9 2.7-11.5S16.6 3.7 19 7.5c2.4 3.9 1.3 9-2.6 11.4"></path></svg>
    </a>
    <a href="https://www.youtube.com/" className="me-3" style={{ display: 'inline-block', width: '40px', height: '40px', lineHeight: '40px', textAlign: 'center', borderRadius: '50%', transition: 'all 0.3s ease' }}
     
      onMouseOut={(e) => {e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#FF3A4B';}}>
      <svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 24 24" id="youtube"><path fill="#FF3A4B" d="M23,9.71a8.5,8.5,0,0,0-.91-4.13,2.92,2.92,0,0,0-1.72-1A78.36,78.36,0,0,0,12,4.27a78.45,78.45,0,0,0-8.34.3,2.87,2.87,0,0,0-1.46.74c-.9.83-1,2.25-1.1,3.45a48.29,48.29,0,0,0,0,6.48,9.55,9.55,0,0,0,.3,2,3.14,3.14,0,0,0,.71,1.36,2.86,2.86,0,0,0,1.49.78,45.18,45.18,0,0,0,6.5.33c3.5.05,6.57,0,10.2-.28a2.88,2.88,0,0,0,1.53-.78,2.49,2.49,0,0,0,.61-1,10.58,10.58,0,0,0,.52-3.4C23,13.69,23,10.31,23,9.71ZM9.74,14.85V8.66l5.92,3.11C14,12.69,11.81,13.73,9.74,14.85Z"></path></svg>
    </a>
   
  </div>
</Col>
      
      <Col md={4} className="mb-4 mb-md-0">
        <h5 className="text-white mb-4">Hours</h5>
        <p className="mb-2">Monday - Thursday: 11AM - 10PM</p>
        <p className="mb-2">Friday - Saturday: 11AM - 11PM</p>
        <p className="mb-2">Sunday: 11AM - 9PM</p>
      </Col>
      
      <Col md={4}>
        <h5 className="text-white mb-4">Newsletter</h5>
        <div className="newsletter-signup">
          <p className="mb-3">Join our mailing list for news and promotions</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            // API call to store email in database that will later connect to MongoDB
            fetch('https://api.example.com/newsletter-signup', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email: e.target.email.value }),
            })
            .then(response => response.json())
            .then(data => {
              alert('Thank you for subscribing!');
              e.target.reset();
            })
            .catch(error => console.error('Error:', error));
          }}>
            <div className="d-flex">
              <input 
                type="email" 
                name="email" 
                className="form-control bg-dark text-white border-danger me-2" 
                placeholder="Your email" 
                required 
              />
              <Button 
                type="submit" 
                style={{ 
                  backgroundColor: '#FF3A4B', 
                  border: 'none', 
                  transition: 'all 0.3s ease',
                  fontWeight: 'bold'
                }}
                className="text-white"
                onMouseOver={(e) => e.target.style.backgroundColor = '#d62d3c'} 
                onMouseOut={(e) => e.target.style.backgroundColor = '#FF3A4B'}
              >
                SIGN UP
              </Button>
            </div>
          </form>
        </div>
      </Col>
    </Row>

    <Row className="pt-4 border-top border-danger">
      <Col xs={12} className="d-flex flex-wrap justify-content-between align-items-center">
        <div className="d-flex flex-wrap">
          <a href="#" className="me-4 mb-3 mb-md-0 text-decoration-none text-white hover-effect" 
             style={{ transition: 'color 0.3s ease' }}
             onMouseOver={(e) => e.target.style.color = '#FF3A4B'} 
             onMouseOut={(e) => e.target.style.color = 'white'}>
            TERMS & CONDITIONS
          </a>
          <a href="#" className="me-4 mb-3 mb-md-0 text-decoration-none text-white hover-effect" 
             style={{ transition: 'color 0.3s ease' }}
             onMouseOver={(e) => e.target.style.color = '#FF3A4B'} 
             onMouseOut={(e) => e.target.style.color = 'white'}>
            PRIVACY
          </a>
          <a href="#" className="me-4 mb-3 mb-md-0 text-decoration-none text-white hover-effect" 
             style={{ transition: 'color 0.3s ease' }}
             onMouseOver={(e) => e.target.style.color = '#FF3A4B'} 
             onMouseOut={(e) => e.target.style.color = 'white'}>
            COOKIES POLICY
          </a>
        </div>
        <div className="mt-3 mt-md-0">
          <p className="mb-0">©PROJECT2025 | CMF By Arijit Ghosal<a href="#" className="text-white fw-bold" style={{ textDecoration: 'none' }}></a></p>
        </div>
      </Col>
    </Row>
  </Container>
  
  <div className="scroll-to-top" style={{ 
    position: 'absolute', 
    right: '50%', 
    transform: 'translateX(50%)',
    marginTop: '-25px'
  }}>
    <Button 
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      style={{ 
        backgroundColor: '#FF3A4B', 
        border: 'none', 
        borderRadius: '50%', 
        width: '50px', 
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.3s ease, background-color 0.3s ease'
      }}
      className="p-0"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="arrow-circle-up"><path fill="#fff" d="M12.71,8.29a1,1,0,0,0-.33-.21,1,1,0,0,0-.76,0,1,1,0,0,0-.33.21l-3,3a1,1,0,0,0,1.42,1.42L11,11.41V15a1,1,0,0,0,2,0V11.41l1.29,1.3a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42ZM12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"></path></svg>
    </Button>
  </div>
  
  {/* Decorative curved line at bottom */}
  <div className="position-relative mt-5">
    <svg viewBox="0 0 1440 120" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <path 
        fill="#FF3A4B" 
        fillOpacity="0.7"
        d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
      ></path>
    </svg>
  </div>
</footer>
          </Container>

          {/* Item Details Modal */}
          <Modal
  show={showDetails !== null}
  onHide={() => setShowDetails(null)}
  centered
  dialogClassName="japan-style-modal"
  contentClassName="rounded-4 shadow-lg border-0"
>
  {showDetails &&
    (() => {
      const item = menuItems.find((i) => i.id === showDetails);
      return (
        <>
          <Modal.Header className="bg-danger text-white position-relative py-4 px-4 border-0">
            <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10">
              {/* SVG Wave Pattern */}
              <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1440 320" className="w-100 h-100">
                <path fill="#ffffff" fillOpacity="0.1" d="M0,256L48,245.3C96,235,192,213,288,192C384,171,480,149,576,144C672,139,768,149,864,165.3C960,181,1056,203,1152,192C1248,181,1344,139,1392,117.3L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
              </svg>
            </div>
            <Modal.Title className="z-1 fw-bold fs-3">{item.name}</Modal.Title>
            <Button
              variant=""
              onClick={() => setShowDetails(null)}
              className="btn-close btn-close-white z-1"
            />
          </Modal.Header>

          <Modal.Body className="px-4 pb-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center mb-4 position-relative border border-danger rounded-4 p-2">
                <img
                  src={`/uploads/${item.image}`}
                  alt={item.name}
                  className="img-fluid rounded-3"
                />
                <div className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none">
                  {/* Optional SVG corners or overlays */}
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
                  {renderStarRating(item.rating)}
                  <span className="ms-2 fw-medium text-muted">({item.rating})</span>
                </div>
                <div className="bg-danger text-white px-3 py-1 rounded-pill fw-bold">
                ₹{item.price.toLocaleString("ja-JP")}
                </div>
              </div>

              {item.specials.length > 0 && (
                <div className="mb-3 d-flex flex-wrap gap-2">
                  {item.specials.map((special, idx) => (
                    <Badge key={idx} bg="danger" className="text-white rounded-pill px-3 py-1 text-sm">
                      {special}
                    </Badge>
                  ))}
                </div>
              )}

              <h5 className="text-danger fw-bold mb-2"> ~~ <span className="ms-2 text-dark">Description</span></h5>
              <p className="text-muted">{item.description}</p>
            </motion.div>
          </Modal.Body>

          <Modal.Footer className="px-4 pb-4 border-0 d-flex flex-column gap-2">
            <Button
              variant="outline-danger"
              onClick={() => toggleFavorite(item.id)}
              className="w-100 d-flex align-items-center justify-content-center gap-2 fw-semibold"
            >
              <FontAwesomeIcon
                icon={faHeart}
                className={favorites.includes(item.id) ? "text-danger" : ""}
              />
              {favorites.includes(item.id) ? "Remove from Favorites" : "Add to Favorites"}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                addToCart(item);
                setShowDetails(null);
              }}
              className="w-100 fw-bold"
            >
              Add to Order
            </Button>
          </Modal.Footer>
        </>
      );
    })()}
</Modal>
<CartModal
        show={showCart}
        onHide={() => setShowCart(false)}
        cart={cart}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
        calculateTotal={calculateTotal}
        setShowCheckout={setShowCheckout}
      />

          {/* Checkout Modal with enhanced UI */}
          <Modal
  show={showCheckout}
  onHide={() => setShowCheckout(false)}
  className="checkout-modal"
  centered
>
  <Modal.Header closeButton className="border-0">
    <Modal.Title className="w-100 text-center">Complete Your Order</Modal.Title>
  </Modal.Header>
  <Modal.Body className="px-4 py-3">
    <Form>
      <div className="form-step active">
        <h5 className="text-danger mb-4 text-center fw-bold">Customer Information</h5>
        <div className="form-container">
          <Form.Group className="mb-4 form-group-animate">
            <Form.Label style={{ color: "rgb(5, 166, 128)"}}>Your Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={customerInfo.name}
              onChange={(e) => handleInputChange(e, "checkout")}
              placeholder="Enter your name"
              className="custom-input"
              required
            />
          </Form.Group>
          <Form.Group className="mb-4 form-group-animate">
            <Form.Label style={{color: "rgb(5, 166, 128)"}}>Table Number</Form.Label>
            <Form.Control
              type="text"
              name="table"
              value={customerInfo.table}
              onChange={(e) => handleInputChange(e, "checkout")}
              placeholder="Enter your table number"
              className="custom-input"
              required
            />
          </Form.Group>
          <Form.Group className="mb-4 form-group-animate">
            <Form.Label style={{color: "rgb(5, 166, 128)"}}>Special Requests (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="specialRequests"
              value={customerInfo.specialRequests}
              onChange={(e) => handleInputChange(e, "checkout")}
              placeholder="Any allergies or special instructions?"
              className="custom-input"
            />
          </Form.Group>
        </div>
      </div>

      <div className="order-summary p-4 rounded mb-4">
        <h5 className="text-danger mb-3">Order Summary</h5>
        <div className="summary-container">
          <ListGroup variant="flush" className="summary-items">
            {cart.map((item) => (
              <ListGroup.Item
                key={item.id}
                className="d-flex justify-content-between border-bottom py-2 summary-item-animate"
              >
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </ListGroup.Item>
            ))}
          </ListGroup>
          
          <div className="d-flex justify-content-between mt-3 summary-total-animate">
            <span>Subtotal</span>
            <span>₹{calculateTotal()}</span>
          </div>
          <div className="d-flex justify-content-between summary-total-animate">
            <span>Tax (10%)</span>
            <span>₹{(calculateTotal() * 0.1).toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between fw-bold mt-3 summary-total-animate">
            <span>Total</span>
            <span className="total-price">
              ₹{(parseFloat(calculateTotal()) * 1.1).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      
    </Form>
  </Modal.Body>
  <Modal.Footer className="border-0 justify-content-center">
    <Button
      variant="outline-secondary"
      onClick={() => setShowCheckout(false)}
      className="btn-back me-3"
    >
      Back to Cart
    </Button>
    <Button
      variant="danger"
      disabled={!customerInfo.name || !customerInfo.table}
      onClick={submitOrder}
      className="btn-place-order"
    >
      {isLoading ? (
        <span>
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
          Processing...
        </span>
      ) : (
        "Place Order"
      )}
    </Button>
  </Modal.Footer>
</Modal>
          {/* Order Confirmation Modal with enhanced UI */}
          <Modal
            show={orderConfirmed}
            onHide={() => setOrderConfirmed(false)}
            centered
            className="confirmation-modal"
          >
            <Modal.Body className="text-center py-5">
              
              <div className="confirmation-icon mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                >
                  <div className="check-circle">
                  <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" viewBox="0 0 24 24" id="check-circle"><path fill="#fff" d="M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10C22,6.5,17.5,2,12,2z M16.2,10.3l-4.8,4.8c-0.4,0.4-1,0.4-1.4,0l0,0l-2.2-2.2c-0.4-0.4-0.4-1,0-1.4c0.4-0.4,1-0.4,1.4,0c0,0,0,0,0,0l1.5,1.5l4.1-4.1c0.4-0.4,1-0.4,1.4,0C16.6,9.3,16.6,9.9,16.2,10.3z"></path></svg>
                  </div>
                </motion.div>
              </div>
              
              <h3 className="mb-3 text-dark">Thank You, {customerInfo.name}!</h3>
              <p className="mb-2 text-dark">
                Your order has been received and is being prepared.
              </p>
              <div className="order-number mt-4 mb-4">
                <p className="text-muted mb-1">Your order number</p>
                <h2 className="text-warning">#{orderNumber}</h2>
              </div>
              <p className="text-muted mb-4 text-dark">
                You can check the status of your order with your server.
              </p>
              <Button
                variant="warning"
                onClick={() => setOrderConfirmed(false)}
              >
                Continue Browsing
              </Button>
            </Modal.Body>
          </Modal>

          {/* Reservation Modal */}
          <Modal
            show={showReservationModal}
            onHide={() => setShowReservationModal(false)}
            centered
            className="reservation-modal"
          >
            <Modal.Header closeButton>
              <Modal.Title>Reserve a Table</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={reservationInfo.name}
                        onChange={(e) => handleInputChange(e, "reservation")}
                        placeholder="Your name"
                        className="custom-input bg-white"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={reservationInfo.phone}
                        onChange={(e) => handleInputChange(e, "reservation")}
                        placeholder="Your phone number"
                        className="custom-input bg-white"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={reservationInfo.email}
                    onChange={(e) => handleInputChange(e, "reservation")}
                    placeholder="Your email address"
                    className="custom-input bg-white"
                    required
                  />
                </Form.Group>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="date"
                        value={reservationInfo.date}
                        onChange={(e) => handleInputChange(e, "reservation")}
                        className="custom-input bg-white"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Time</Form.Label>
                      <Form.Control
                        type="time"
                        name="time"
                        value={reservationInfo.time}
                        onChange={(e) => handleInputChange(e, "reservation")}
                        className="custom-input bg-white"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>Number of Guests</Form.Label>
                  <Form.Select
                    name="guests"
                    value={reservationInfo.guests}
                    onChange={(e) => handleInputChange(e, "reservation")}
                    className="custom-input bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "Guest" : "Guests"}
                      </option>
                    ))}
                    <option value="9+">9+ Guests</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Special Requests (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="specialRequests"
                    value={reservationInfo.specialRequests}
                    onChange={(e) => handleInputChange(e, "reservation")}
                    placeholder="Any special requests or occasions"
                    className="custom-input bg-white"
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="outline-light"
                onClick={() => setShowReservationModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="warning"
                disabled={
                  !reservationInfo.name ||
                  !reservationInfo.date ||
                  !reservationInfo.time
                }
                onClick={submitReservation}
              >
                Confirm Reservation
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Feedback Modal */}
          <Modal
            show={showFeedbackModal}
            onHide={() => setShowFeedbackModal(false)}
            centered
            className="feedback-modal"
          >
            <Modal.Header closeButton>
              <Modal.Title>Share Your Experience</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-4 text-center">
                  <Form.Label>How would you rate your experience?</Form.Label>
                  <div className="rating-selector">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`rating-star ${
                          star <= feedback.rating ? "active" : ""
                        }`}
                        onClick={() =>
                          setFeedback({ ...feedback, rating: star })
                        }
                      >
                        <FontAwesomeIcon icon={faStar} />
                      </button>
                    ))}
                  </div>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Your Feedback</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="comment"
                    value={feedback.comment}
                    onChange={(e) => handleInputChange(e, "feedback")}
                    placeholder="Tell us about your dining experience"
                    className="custom-input"
                  />
                </Form.Group>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Name (Optional)</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={feedback.name}
                        onChange={(e) => handleInputChange(e, "feedback")}
                        placeholder="Your name"
                        className="custom-input"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email (Optional)</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={feedback.email}
                        onChange={(e) => handleInputChange(e, "feedback")}
                        placeholder="Your email"
                        className="custom-input"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="outline-light"
                onClick={() => setShowFeedbackModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="warning"
                disabled={!feedback.comment}
                onClick={submitFeedback}
              >
                Submit Feedback
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Location Modal */}
          <LocationModal 
  show={showLocationModal} 
  onHide={() => setShowLocationModal(false)}
  setShowReservationModal={setShowReservationModal}
/>
        </>
      )}

      {/* CSS Styles */}
      <style jsx>{`
        /* Dark theme with yellow accents */
       /* Dark theme with yellow accents - Enhanced with animations */
:root {
  --dark-bg: #121212;
  --dark-card: #1e1e1e;
  --dark-accent: #222222;
  --yellow-primary: #ffc107;
  --yellow-secondary: #ffdb58;
  --text-light: #e0e0e0;
  --text-muted: #909090;
  --overlay-dark: rgba(0, 0, 0, 0.7);
  --shadow-soft: 0 8px 20px rgba(0, 0, 0, 0.3);
  --shadow-strong: 0 10px 30px rgba(0, 0, 0, 0.5);
  --transition-fast: 0.2s ease;
  --transition-medium: 0.3s ease;
  --transition-slow: 0.5s ease;
}

/* Global Styles with smooth page transitions */
body {
  background-color: var(--dark-bg);
  color: var(--text-light);
  font-family: "Poppins", sans-serif;
  transition: background-color var(--transition-medium);
  overflow-x: hidden;
}

.restaurant-page {
  background-color: var(--dark-bg);
  min-height: 100vh;
  overflow-x: hidden;
  animation: fadeIn 0.8s ease forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Enhanced Loading Animation */
.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.spinner-border.text-warning {
  width: 3rem;
  height: 3rem;
  animation: spin 1.2s linear infinite, pulse 1.5s ease-in-out infinite alternate;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0% { transform: scale(1) rotate(0deg); }
  100% { transform: scale(1.15) rotate(360deg); }
}



.parallax-bg {
  background-attachment: fixed;
  animation: subtleZoom 30s infinite alternate;
}

@keyframes subtleZoom {
  0% { background-size: 100%; }
  100% { background-size: 110%; }
}

.hero-content {
  position: relative;
  z-index: 2;
  animation: slideUp 0.8s ease-out forwards;
  animation-delay: 0.3s;
  opacity: 0;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.separator {
  width: 60px;
  height: 3px;
  background-color: var(--yellow-primary);
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}

.separator::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  100% { left: 100%; }
}

.restaurant-info {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 2rem;
  animation: fadeIn 1s ease forwards;
  animation-delay: 0.6s;
  opacity: 0;
}

.info-item {
  display: flex;
  align-items: center;
  transition: transform var(--transition-medium);
}

.info-item:hover {
  transform: translateY(-5px);
}

/* Promo Carousel with smooth transitions */
.promo-carousel {
  background-color: var(--dark-accent);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-soft);
}

.promo-item {
  background-color: rgba(0, 0, 0, 0.3);
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: transform 0.8s ease, opacity 0.8s ease;
}

.promo-item.active {
  animation: fadeScale 0.5s ease forwards;
}

@keyframes fadeScale {
  from {
    opacity: 0.7;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.promo-dots {
  position: relative;
  z-index: 3;
}

.promo-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  border: none;
  padding: 0;
  transition: all var(--transition-fast);
  transform: scale(1);
}

.promo-dot:hover {
  transform: scale(1.2);
}

.promo-dot.active {
  background-color: var(--yellow-primary);
  box-shadow: 0 0 10px var(--yellow-primary);
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(255, 193, 7, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0); }
}

/* Menu Navigation with smooth animations */
.menu-container {
  position: relative;
  animation: fadeIn 0.6s ease forwards;
}

.section-title {
  position: relative;
  display: inline-block;
  padding-bottom: 0.5rem;
  margin-bottom: 2rem;
  overflow: hidden;
}

.section-title::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background-color: var(--yellow-primary);
  transition: width var(--transition-medium);
}

.section-title:hover::after {
  width: 100%;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.search-filter-container {
  display: flex;
  gap: 0.5rem;
  transition: all var(--transition-medium);
}

.search-input {
  background-color: var(--dark-accent);
  border: 1px solid #333;
  color: var(--text-light);
  transition: all var(--transition-medium);
  border-radius: 20px;
  padding-left: 15px;
}

.search-input:focus {
  box-shadow: 0 0 15px rgba(255, 193, 7, 0.3);
  border-color: var(--yellow-primary);
  width: 110%;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.menu-filters {
  overflow: hidden;
  white-space: nowrap;
  position: relative;
}

.menu-filters::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 30px;
  background: linear-gradient(90deg, transparent, var(--dark-bg));
  pointer-events: none;
}

.category-btn {
  border-radius: 20px;
  transition: all var(--transition-medium);
  background-color: var(--dark-accent);
  border: 1px solid #333;
  color: var(--text-muted);
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  position: relative;
  overflow: hidden;
}

.category-btn:hover, .category-btn.active {
  background-color: var(--yellow-primary);
  color: black;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(255, 193, 7, 0.3);
}

.category-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1) translate(-50%, -50%);
  transform-origin: 50% 50%;
}

.category-btn:focus:not(:active)::after {
  animation: ripple 0.8s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0) translate(-50%, -50%);
    opacity: 1;
  }
  100% {
    transform: scale(20) translate(-50%, -50%);
    opacity: 0;
  }
}

/* Menu Items with enhanced hover effects */
.menu-card {
  transition: transform var(--transition-medium), box-shadow var(--transition-medium);
  border-radius: 8px;
  margin-bottom: 2rem;
  opacity: 0;
  animation: fadeInUp 0.5s ease forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-item-card {
  background-color: var(--dark-card);
  border: none;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow-soft);
  transition: all var(--transition-medium);
  height: 100%;
}

.menu-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-strong);
}

.menu-card:hover .menu-item-card {
  box-shadow: 0 0 20px rgba(255, 193, 7, 0.15);
}

.card-img-wrapper {
  position: relative;
  overflow: hidden;
}

.card-img-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  z-index: 1;
  opacity: 0;
  transition: opacity var(--transition-medium);
}

.menu-card:hover .card-img-wrapper::before {
  opacity: 1;
}

.card-img-wrapper img {
  transition: transform var(--transition-slow);
  height: 200px;
  object-fit: cover;
  width: 100%;
}

.menu-card:hover .card-img-wrapper img {
  transform: scale(1.1) rotate(2deg);
}

.card-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  opacity: 0;
  transform: translateX(10px);
  transition: all var(--transition-medium);
  z-index: 2;
}

.menu-card:hover .card-actions {
  opacity: 1;
  transform: translateX(0);
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--dark-bg);
  color: var(--text-light);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-medium);
  position: relative;
  overflow: hidden;
}

.action-btn:hover {
  background-color: var(--yellow-primary);
  color: black;
  transform: scale(1.15) rotate(5deg);
}

.action-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1) translate(-50%, -50%);
  transform-origin: 50% 50%;
}

.action-btn:active::after {
  animation: ripple 0.8s ease-out;
}

.action-btn.favorite-btn.active {
  background-color: #dc3545;
  color: white;
  animation: heartbeat 1s ease;
}

@keyframes heartbeat {
  0% { transform: scale(1); }
  25% { transform: scale(1.3); }
  50% { transform: scale(1); }
  75% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.menu-item-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-light);
  margin-bottom: 0.5rem;
  transition: color var(--transition-medium);
}

.menu-card:hover .menu-item-title {
  color: var(--yellow-primary);
}

.menu-item-desc {
  color: var(--text-muted);
  font-size: 0.9rem;
  transition: color var(--transition-medium);
}

.menu-card:hover .menu-item-desc {
  color: var(--text-light);
}

.price-badge {
  font-weight: 600;
  font-size: 1rem;
  padding: 0.5rem 0.75rem;
  background-color: var(--dark-accent);
  transition: all var(--transition-medium);
}

.menu-card:hover .price-badge {
  background-color: var(--yellow-primary);
  color: black;
  transform: scale(1.05);
}

.special-badge {
  border-radius: 4px;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  position: relative;
  overflow: hidden;
}

.special-badge::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
  transform: rotate(30deg);
  animation: shimmerBadge 2s infinite;
}

@keyframes shimmerBadge {
  0% { transform: translateX(-100%) rotate(30deg); }
  100% { transform: translateX(100%) rotate(30deg); }
}

.add-to-cart-btn {
  border-radius: 4px;
  font-weight: 500;
  transition: all var(--transition-medium);
  background-color: var(--dark-accent);
  color: var(--text-light);
  border: 1px solid #333;
  position: relative;
  overflow: hidden;
}

.add-to-cart-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: var(--transition-medium);
}

.add-to-cart-btn:hover {
  background-color: var(--yellow-primary);
  color: black;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.add-to-cart-btn:hover::before {
  animation: shine 1.5s infinite;
}

@keyframes shine {
  100% { left: 100%; }
}

/* Floating Cart Button with bounce effect */
.floating-cart {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  background-color: var(--yellow-primary);
  color: black;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: var(--shadow-soft);
  cursor: pointer;
  z-index: 1000;
  transition: all var(--transition-medium);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.floating-cart:hover {
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(255, 193, 7, 0.5);
}

.floating-cart:active {
  animation: press 0.2s ease-out;
}

@keyframes press {
  0% { transform: scale(1.1); }
  50% { transform: scale(0.9); }
  100% { transform: scale(1.1); }
}

.cart-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* Notification Toast with slide effect */
.notification-toast {
  position: fixed;
  bottom: -100px;
  right: 30px;
  background-color: var(--dark-card);
  color: var(--text-light);
  padding: 1rem 1.5rem;
  border-left: 4px solid var(--yellow-primary);
  border-radius: 4px;
  box-shadow: var(--shadow-soft);
  z-index: 1000;
  animation: slideUp 0.3s forwards, fadeOut 0.3s forwards 3s;
}

@keyframes slideUp {
  to { bottom: 100px; }
}

@keyframes fadeOut {
  to { opacity: 0; visibility: hidden; }
}

/* Enhanced Modal Designs */
.cart-modal .modal-content,
.checkout-modal .modal-content,
.confirmation-modal .modal-content,
.reservation-modal .modal-content,
.feedback-modal .modal-content,
.menu-detail-modal .modal-content,
.location-modal .modal-content {
  margin: 30px auto;
  border: none;
  border-radius: 10px; /* fixed typo */
  transform: scale(0.9);
  opacity: 0;
  animation: modalFadeIn 0.3s ease forwards;
  box-shadow: var(--shadow-strong);
}
@keyframes modalFadeIn {
  to { transform: scale(1); opacity: 1; }
}

.modal-header {
  border-bottom-color: #333;
  position: relative;
}

.modal-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(to right, var(--yellow-primary), transparent);
}

.modal-footer {
  border-top-color: #333;
  position: relative;
}

.modal-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(to right, var(--yellow-primary), transparent);
}

.cart-items {
  max-height: 400px;
  overflow-y: auto;
  perspective: 800px;
}

.cart-item {
  background-color: transparent;
  border-bottom: 1px solid #333;
  padding: 1rem 0;
  transition: all var(--transition-medium);
  transform-origin: top center;
  animation: itemAppear 0.3s forwards;
}

@keyframes itemAppear {
  from { 
    opacity: 0;
    transform: rotateX(-30deg);
  }
  to { 
    opacity: 1;
    transform: rotateX(0);
  }
}

.cart-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.cart-item-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  transition: all var(--transition-medium);
}

.cart-item:hover .cart-item-img {
  transform: scale(1.1);
  box-shadow: 0 0 10px rgba(255, 193, 7, 0.3);
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.quantity-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 4px;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.quantity-btn:hover {
  background-color: var(--yellow-primary);
  color: black;
  transform: scale(1.1);
}

.quantity-btn:active {
  transform: scale(0.95);
}

.quantity {
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

.cart-summary {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
  transition: all var(--transition-medium);
  transform: translateY(10px);
  opacity: 0;
  animation: fadeUpDelay 0.5s forwards;
  animation-delay: 0.3s;
}

@keyframes fadeUpDelay {
  to { transform: translateY(0); opacity: 1; }
}

.total-row {
  border-top: 1px solid #333;
  padding-top: 0.75rem;
  margin-top: 0.75rem;
  color: var(--yellow-primary);
  animation: highlight 1s ease infinite alternate;
}

@keyframes highlight {
  from { color: var(--yellow-primary); }
  to { color: var(--yellow-secondary); }
}

/* Checkout Form Styling with focus effects */
.custom-input {
margin-top: 1rem;
  margin-left: 10px;
  margin-right: 10px;
  background-color: var(--dark-bg);
  border: 1px solid #333;
  color: var(--text-dark);
  padding: 0.75rem;
  border-radius: 8px;
  transition: all var(--transition-medium);
}

.custom-input:focus {
  background-color: var(--dark-bg);
  color: var(--text-light);
  border-color: var(--yellow-primary);
  box-shadow: 0 0 0 0.25rem rgba(255, 193, 7, 0.25);
  transform: translateY(-2px);
}

.order-summary {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: var(--shadow-soft);
  transition: all var(--transition-medium);
}

.order-summary:hover {
  box-shadow: 0 0 15px rgba(255, 193, 7, 0.15);
}

.summary-items {
  max-height: 200px;
  overflow-y: auto;
}

/* Confirmation Modal with celebration effects */
.confirmation-icon {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
}

.check-circle {
  width: 80px;
  height: 80px;
  background-color: var(--yellow-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: black;
  animation: successPulse 2s ease-in-out infinite, spin360 0.5s ease;
}

@keyframes successPulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.7); }
  70% { box-shadow: 0 0 0 15px rgba(255, 193, 7, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0); }
}

@keyframes spin360 {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.order-number {
  background-color: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.order-number::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%);
  transform: rotate(30deg);
  animation: shimmerBadge 2s infinite;
}

/* Enhanced Feedback Modal */
.rating-selector {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin: 1rem 0;
}

.rating-star {
  background-color: transparent;
  border: none;
  color: #666;
  font-size: 2rem;
  cursor: pointer;
  transition: transform 0.3s ease, color 0.3s ease;
}

.rating-star:hover {
  transform: scale(1.3) rotate(5deg);
}

.rating-star.active {
  color: var(--yellow-primary);
  animation: starPop 0.3s ease;
}

@keyframes starPop {
  0% { transform: scale(1); }
  50% { transform: scale(1.4); }
  100% { transform: scale(1.2); }
}

/* Location Modal with map effects */
.location-map {
  width: 100%;
  height: 400px;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  box-shadow: var(--shadow-soft);
  transition: all var(--transition-medium);
}

.location-map:hover {
  box-shadow: 0 0 20px rgba(255, 193, 7, 0.2);
  transform: scale(1.01);
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--dark-bg);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 4px;
  transition: all var(--transition-medium);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--yellow-primary);
}

/* Page transition effects */
.page-enter {
  opacity: 0;
  transform: translateY(20px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.5s, transform 0.5s;
}

.page-exit {
  opacity: 1;
  transform: translateY(0);
}

.page-exit-active {
  opacity: 0;
  transform: translateY(-20px);
  transition: opacity 0.5s, transform 0.5s;
}

/* Food Category Filter Pills Animation */
.filter-pills-container {
  position: relative;
  overflow-x: auto;
  padding: 10px 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.filter-pills-container::-webkit-scrollbar {
  display: none;
}

.category-pill {
  display: inline-block;
  padding: 8px 16px;
  margin-right: 10px;
  background: var(--dark-accent);
  border-radius: 20px;
  color: var(--text-muted);
  font-size: 14px;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #333;
}

.category-pill:hover {
  background: rgba(255, 193, 7, 0.2);
  color: var(--yellow-primary);
  transform: translateY(-3px);
}

.category-pill.active {
  background: var(--yellow-primary);
  color: black;
  font-weight: 600;
  box-shadow: 0 0 12px rgba(255, 193, 7, 0.4);
  transform: translateY(-3px);
}

/* Food Item Staggered Animation */
.menu-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
/* Checkout Modal Styles */
.checkout-modal .modal-content {
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: none;
  overflow: hidden;
}

.checkout-modal .modal-header {
  background-color: #fff;
  padding: 20px;
}

.checkout-modal .modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.checkout-modal .modal-header .btn-close {
  background-color: #f8f8f8;
  border-radius: 50%;
  padding: 8px;
  opacity: 1;
  transition: all 0.3s ease;
}

.checkout-modal .modal-header .btn-close:hover {
  background-color: #e8e8e8;
  transform: rotate(90deg);
}

/* Form Styles */
.checkout-modal .custom-input {
  border-radius: 8px;
  border: 2px solid #ececec;
  padding: 12px 15px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.checkout-modal .custom-input:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

.checkout-modal .form-label {
  font-weight: 500;
  margin-bottom: 8px;
  color: #555;
}

/* Price Section */
.checkout-modal .price-section {
  text-align: center;
  padding: 15px 0;
  background-color: #f9f9f9;
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.checkout-modal .price-section:hover {
  transform: translateY(-5px);
}

.checkout-modal .currency-symbol {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-right: 5px;
}

.checkout-modal .order-price {
  font-size: 2.5rem;
  font-weight: 700;
  color: #dc3545;
}

/* Order Summary */
.checkout-modal .order-summary {
  background-color: #f9f9f9;
  border-radius: 12px;
  transition: all 0.3s ease;
  border-left: 4px solid #dc3545;
}

.checkout-modal .order-summary:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.checkout-modal .summary-items {
  max-height: 200px;
  overflow-y: auto;
}

.checkout-modal .summary-items::-webkit-scrollbar {
  width: 5px;
}

.checkout-modal .summary-items::-webkit-scrollbar-thumb {
  background-color: #dc3545;
  border-radius: 10px;
}

.checkout-modal .total-price {
  color: #dc3545;
  font-size: 1.2rem;
}

/* Delivery Option */
.checkout-modal .delivery-option {
  background-color: #f9f9f9;
  border-radius: 12px;
  border-left: 4px solid #007bff;
  transition: all 0.3s ease;
}

.checkout-modal .delivery-option:hover {
  transform: translateY(-5px);
}

.checkout-modal .clock-icon {
  font-size: 1.5rem;
  color: #007bff;
  animation: pulse 2s infinite;
}

/* Buttons */
.checkout-modal .btn-back {
  border-radius: 30px;
  padding: 10px 20px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.checkout-modal .btn-place-order {
  border-radius: 30px;
  padding: 10px 25px;
  font-weight: 600;
  background-color: #dc3545;
  border: none;
  box-shadow: 0 4px 6px rgba(220, 53, 69, 0.2);
  transition: all 0.3s ease;
}

.checkout-modal .btn-place-order:hover:not(:disabled) {
  background-color: #c82333;
  transform: translateY(-3px);
  box-shadow: 0 6px 10px rgba(220, 53, 69, 0.3);
}

.checkout-modal .btn-place-order:disabled {
  background-color: #e9a7ad;
  cursor: not-allowed;
}

/* Animations */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.form-group-animate {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.5s forwards;
}

.form-group-animate:nth-child(1) {
  animation-delay: 0.1s;
}

.form-group-animate:nth-child(2) {
  animation-delay: 0.2s;
}

.form-group-animate:nth-child(3) {
  animation-delay: 0.3s;
}

.summary-item-animate {
  opacity: 0;
  transform: translateX(-20px);
  animation: fadeInLeft 0.5s forwards;
}

.summary-item-animate:nth-child(1) {
  animation-delay: 0.1s;
}

.summary-item-animate:nth-child(2) {
  animation-delay: 0.2s;
}

.summary-item-animate:nth-child(3) {
  animation-delay: 0.3s;
}

.summary-item-animate:nth-child(4) {
  animation-delay: 0.4s;
}

.summary-total-animate {
  opacity: 0;
  transform: translateY(10px);
  animation: fadeInUp 0.5s forwards;
}

.summary-total-animate:nth-child(1) {
  animation-delay: 0.5s;
}

.summary-total-animate:nth-child(2) {
  animation-delay: 0.6s;
}

.summary-total-animate:nth-child(3) {
  animation-delay: 0.7s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Modal animation */
.modal.fade .modal-dialog {
  transform: scale(0.8);
  opacity: 0;
  transition: all 0.3s ease;
}

.modal.show .modal-dialog {
  transform: scale(1);
  opacity: 1;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .checkout-modal .modal-content {
    border-radius: 10px;
  }
  
  .checkout-modal .order-price {
    font-size: 2rem;
  }
  
  .checkout-modal .modal-body {
    padding: 15px;
    
  }
}
.menu-items-grid > div {
  opacity: 0;
}
.menu-items-grid > div:nth-child(1) { animation: fadeInStaggered 0.5s ease 0.1s forwards; }
.menu-items-grid > div:nth-child(2) { animation: fadeInStaggered 0.5s ease 0.2s forwards; }
.menu-items-grid > div:nth-child(3) { animation: fadeInStaggered 0.5s ease 0.3s forwards; }
.menu-items-grid > div:nth-child(4) { animation: fadeInStaggered 0.5s ease 0.4s forwards; }
.menu-items-grid > div:nth-child(5) { animation: fadeInStaggered 0.5s ease 0.5s forwards; }
.menu-items-grid > div:nth-child(6) { animation: fadeInStaggered 0.5s ease 0.6s forwards; }
.menu-items-grid > div:nth-child(7) { animation: fadeInStaggered 0.5s ease 0.7s forwards; }
.menu-items-grid > div:nth-child(8) { animation: fadeInStaggered 0.5s ease 0.8s forwards; }

@keyframes fadeInStaggered {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Swiggy-like skeleton loading effect */
.skeleton-loader {
  background: linear-gradient(90deg, var(--dark-accent) 25%, var(--dark-card) 50%, var(--dark-accent) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

@keyframes loading {
  0% { background-position: -100% 0; }
  100% { background-position: 100% 0; }
}

.skeleton-card {
  background-color: var(--dark-card);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow-soft);
  height: 100%;
}

.skeleton-img {
  height: 200px;
  width: 100%;
}

.skeleton-title {
  height: 20px;
  width: 70%;
  margin: 15px 15px 10px;
}

.skeleton-desc {
  height: 15px;
  width: 90%;
  margin: 10px 15px;
}

.skeleton-price {
  height: 25px;
  width: 40%;
  margin: 15px;
}

/* Card hover spotlight effect */
.spotlight-effect {
  position: relative;
  overflow: hidden;
}

.spotlight-effect::before {
  content: '';
  position: absolute;
  top: -100%;
  left: -100%;
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%);
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
}

.spotlight-effect:hover::before {
  opacity: 1;
}

.spotlight-effect:hover {
  --x: 0px;
  --y: 0px;
}

/* Food arrival animation */
.arrival-animation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  opacity: 0;
  pointer-events: none;
  animation: arrivalFade 4s forwards;
}

@keyframes arrivalFade {
  0% { opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; }
}

.arrival-content {
  text-align: center;
  animation: arrivalZoom 3s forwards;
}

@keyframes arrivalZoom {
  0% { transform: scale(0.8); opacity: 0; }
  20% { transform: scale(1); opacity: 1; }
  80% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.2); opacity: 0; }
}

.arrival-icon {
  font-size: 5rem;
  color: var(--yellow-primary);
  margin-bottom: 1rem;
  animation: arrivalSpin 2s ease-in-out infinite;
}

@keyframes arrivalSpin {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(10deg); }
  75% { transform: rotate(-10deg); }
  100% { transform: rotate(0deg); }
}

/* Food Categories Section */
.categories-section {
  padding: 3rem 0;
  position: relative;
  overflow: hidden;
}

.category-card {
  background-color: var(--dark-card);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-soft);
  transition: all var(--transition-medium);
  position: relative;
  height: 180px;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-10px);
  box-shadow: var(--shadow-strong);
}

.category-img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  transition: all var(--transition-slow);
}

.category-card:hover .category-img {
  transform: scale(1.1);
  filter: brightness(1.1);
}

.category-name {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: linear-gradient(to top, var(--dark-card), transparent);
  color: var(--text-light);
  font-weight: 600;
  transition: all var(--transition-medium);
}

.category-card:hover .category-name {
  color: var(--yellow-primary);
  padding-bottom: 1.5rem;
}

/* Popular dishes carousel */
.popular-dishes {
  position: relative;
  padding: 3rem 0;
}

.popular-slider {
  position: relative;
  overflow: visible;
}

.popular-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background-color: var(--dark-card);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-light);
  box-shadow: var(--shadow-soft);
  cursor: pointer;
  transition: all var(--transition-medium);
  z-index: 5;
}
  .japan-style-modal .modal-content {
  background-color: #fff8f5;
  border-radius: 1.5rem;
  overflow: hidden;
}

.japan-style-modal .modal-header {
  position: relative;
  overflow: hidden;
}

.japan-style-modal .btn-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
}


.popular-nav:hover {
  background-color: var(--yellow-primary);
  color: black;
  transform: translateY(-50%) scale(1.1);
}

.popular-prev {
  left: -20px;
}

.popular-next {
  right: -20px;
}

/* Animated cart indicator */
.cart-indicator {
  position: fixed;
  width: 15px;
  height: 15px;
  background-color: var(--yellow-primary);
  border-radius: 50%;
  pointer-events: none;
  z-index: 2000;
  opacity: 0;
}

.cart-indicator.active {
  animation: flyToCart 0.8s cubic-bezier(0.65, 0.05, 0.36, 1) forwards;
}

@keyframes flyToCart {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(var(--end-x), var(--end-y)) scale(0.5);
  }
}

/* Food customization accordion */
.customization-accordion {
  background-color: var(--dark-accent);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.customization-header {
  padding: 0.75rem 1rem;
  background-color: rgba(0, 0, 0, 0.2);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all var(--transition-medium);
}

.customization-header:hover {
  background-color: rgba(255, 193, 7, 0.1);
}

.customization-body {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}

.customization-body.open {
  max-height: 500px;
}

.customization-content {
  padding: 1rem;
}

.option-group {
  margin-bottom: 1rem;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  transition: all var(--transition-fast);
}

.option-item:hover {
  transform: translateX(5px);
}

/* Review section animations */
.review-card {
  background-color: var(--dark-card);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: var(--shadow-soft);
  transition: all var(--transition-medium);
  margin: 1rem 0.5rem;
  position: relative;
  overflow: hidden;
}

.review-card::before {
  content: '"';
  position: absolute;
  top: -15px;
  left: 10px;
  font-size: 8rem;
  color: rgba(255, 193, 7, 0.1);
  font-family: Georgia, serif;
  line-height: 1;
  pointer-events: none;
}

.review-card:hover {
  transform: translateY(-10px);
  box-shadow: var(--shadow-strong);
}
  .menu-container {
    padding: 5rem 1rem;
    overflow: hidden;
  }
  
  .menu-title {
    font-size: 3.5rem;
    font-weight: 900;
    color:rgb(5, 166, 128);
    line-height: 0.9;
    margin-bottom: 2rem;
    text-transform: uppercase;
    letter-spacing: -1px;
  }
  
  .search-filter-container {
    display: flex;
    gap: 1rem;
    align-items: center;
    max-width: 600px;
  }
  
  .search-wrapper {
    flex: 1;
    position: relative;
  }
  
  .search-input {
    border-radius: 50px;
    padding: 0.75rem 1.5rem;
    border: 2px solidrgb(18, 169, 133);
    font-size: 1rem;
  }
  
  .search-icon {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    color:rgb(17, 167, 132);
  }
  
  .filter-toggle-btn {
    border-radius: 50px;
    padding: 0.75rem 1.5rem;
    background-color: #E3131B;
    border: none;
    font-weight: 600;
  }
  
  .category-btn {
    border-radius: 50px;
    padding: 0.6rem 1.2rem;
    font-weight: 500;
    border-width: 2px;
  }
  
  .menu-item-card {
    border-radius: 16px;
    overflow: hidden;
    border: none;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    background: #fff;
    height: 100%;
  }
  
  .card-img-wrapper {
    position: relative;
    overflow: hidden;
  }
  
  .card-img-wrapper img {
    height: 220px;
    object-fit: cover;
    width: 100%;
    transition: transform 0.5s ease;
  }
  
  .menu-card:hover .card-img-wrapper img {
    transform: scale(1.1);
  }
  
  .card-actions {
    position: absolute;
    top: 15px;
    right: 15px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .action-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    color: #333;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .action-btn:hover {
    background: #fff;
    transform: scale(1.1);
  }
  
  .favorite-btn.active {
    color: #E3131B;
  }
  
  .menu-item-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: #005D48;
  }
  
  .price-badge {
    background-color: #E3131B !important;
    border-radius: 50px;
    padding: 0.5rem 1rem;
    font-size: 1.1rem;
    font-weight: 700;
  }
  
  .rating {
    color: #ffc107;
    font-size: 0.9rem;
  }
  
  .menu-item-desc {
    color: #555;
    font-size: 0.95rem;
    margin-bottom: 1rem;
  }
  
  .special-badge {
    border-radius: 50px;
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
    font-weight: 500;
  }
  
  .dietary-info {
    display: flex;
    gap: 10px;
    margin-bottom: 1rem;
  }
  
  .dietary-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    font-size: 0.8rem;
    font-weight: 600;
  }
  
  .gluten-free {
    background: #c5e1a5;
    color: #33691e;
  }
  
  .vegan {
    background: #64dd17;
    color: #fff;
  }
  
  .spicy {
    background: #ff8a80;
    color: #d50000;
  }
  
  .add-to-cart-btn {
    border-radius: 50px;
    padding: 0.75rem;
    background-color: #E3131B;
    border: none;
    font-weight: 600;
    transition: all 0.3s ease;
  }
  
  .add-to-cart-btn:hover {
    background-color: #c8121a;
    transform: translateY(-2px);
  }
  
  .menu-item-badge {
    position: absolute;
    top: 15px;
    left: 15px;
    z-index: 2;
  }
  
  .menu-item-badge span {
    display: inline-block;
    background: #E3131B;
    color: white;
    padding: 0.3rem 0.8rem;
    font-weight: 700;
    font-size: 0.75rem;
    border-radius: 50px;
    margin-right: 5px;
  }
  
  .featured-items-section {
    margin-top: 6rem;
    padding: 2rem 0;
    position: relative;
  }
  
  .featured-title {
    font-size: 2.5rem;
    font-weight: 900;
    color: #005D48;
    margin-bottom: 2rem;
    text-transform: uppercase;
  }
  
  .featured-badge {
    position: absolute;
    top: 5px;
    right: 20px;
    font-size: 1.8rem;
    font-weight: 800;
    color: #005D48;
    transform: rotate(-5deg);
  }
  
  .featured-item-card {
    text-align: center;
    padding: 1rem;
  }
  
  .featured-img-wrapper {
    width: 180px;
    height: 180px;
    margin: 0 auto 1rem;
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid #005D48;
  }
  
  .featured-img-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .featured-item-card h4 {
    font-weight: 700;
    color: #005D48;
    margin-bottom: 1rem;
  }
  
  .empty-title {
    color: #E3131B;
    font-weight: 700;
  }
  
  .empty-subtitle {
    color: #555;
  }
  
  /* Animated floating food items */
  .floating-food-elements {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 1;
    overflow: hidden;
    pointer-events: none;
  }
  
  .floating-food-item {
    position: absolute;
    border-radius: 50%;
    object-fit: cover;
    opacity: 0.6;
  }
  
  .float-1 {
    top: 10%;
    right: -50px;
    animation: float1 20s infinite ease-in-out;
  }
  
  .float-2 {
    top: 40%;
    left: -30px;
    animation: float2 25s infinite ease-in-out;
  }
  
  .float-3 {
    bottom: 5%;
    right: 15%;
    animation: float3 18s infinite ease-in-out;
  }
  
  @keyframes float1 {
    0% { transform: translate(0, 0) rotate(0deg); }
    25% { transform: translate(-20px, 50px) rotate(5deg); }
    50% { transform: translate(-40px, 20px) rotate(10deg); }
    75% { transform: translate(-20px, -30px) rotate(5deg); }
    100% { transform: translate(0, 0) rotate(0deg); }
  }
  
  @keyframes float2 {
    0% { transform: translate(0, 0) rotate(0deg); }
    33% { transform: translate(40px, 20px) rotate(-8deg); }
    66% { transform: translate(20px, 40px) rotate(-4deg); }
    100% { transform: translate(0, 0) rotate(0deg); }
  }
  
  @keyframes float3 {
    0% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(-30px, -20px) rotate(5deg); }
    100% { transform: translate(0, 0) rotate(0deg); }
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .menu-title {
      font-size: 2.5rem;
    }
    
    .search-filter-container {
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .search-wrapper {
      width: 100%;
    }
    
    .filter-toggle-btn {
      width: 100%;
    }
    
    .featured-badge {
      position: relative;
      right: auto;
      top: auto;
      margin-bottom: 1rem;
      text-align: center;
      transform: none;
    }

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.reviewer-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--dark-bg);
  transition: all var(--transition-medium);
}

.review-card:hover .reviewer-avatar {
  border-color: var(--yellow-primary);
  transform: scale(1.1);
}

.review-stars {
  color: var(--yellow-primary);
  animation: starsTwinkle 4s ease infinite;
}

@keyframes starsTwinkle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Special offers section */
.offer-badge {
  position: absolute;
  top: 15px;
  left: -30px;
  background-color: var(--yellow-primary);
  color: black;
  padding: 0.5rem 2rem;
  transform: rotate(-45deg);
  font-weight: 600;
  font-size: 0.8rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.offer-countdown {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin: 1rem 0;
}

.countdown-box {
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  padding: 0.5rem;
  min-width: 50px;
  text-align: center;
}

.countdown-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--yellow-primary);
}

.countdown-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
}

/* Order tracking animation */
.tracking-stages {
  display: flex;
  justify-content: space-between;
  margin: 2rem 0;
  position: relative;
}
html, body, .hello-parent {
  height: 100%;
  width: 100%;
  margin: 0;
}

.hello-parent {
  display: flex;
  background: #fff;
  background: -webkit-radial-gradient(#fff, #eaeaea); 
  background: -o-radial-gradient(#fff, #eaeaea); 
  background: -moz-radial-gradient(#fff, #eaeaea);
  background: radial-gradient(#fff, #eaeaea); 
}

.hello-word {
  margin:auto;
}
/* H Animation */

.H-left-stroke {
  stroke-dasharray: 124px;
  stroke-dashoffset: 124px;
  animation: H-left-move 20s ease forwards;
}

.H-mid-stroke {
  stroke-dasharray: 37px;
  stroke-dashoffset: 37px;
  animation: H-mid-move 9s ease forwards;
}

.H-right-stroke {
  stroke-dasharray: 124px;
  stroke-dashoffset: 124px;
  animation: H-right-move 13s ease forwards;
}

@keyframes H-left-move {
  0% {
    stroke-dashoffset: 124px;
  }
  5% {
    stroke-dashoffset: 0px;
  }
  100% {
    stroke-dashoffset: 0px;
  }
}

@keyframes H-mid-move {
  0% {
    stroke-dashoffset: 37px;
  }
  5% {
    stroke-dashoffset: 37px;
  }
  10% {
    stroke-dashoffset: 0px;
  }
  100% {
    stroke-dashoffset: 0px;
  }
}

@keyframes H-right-move {
  0% {
    stroke-dashoffset: 124px;
  }
  5% {
    stroke-dashoffset: 124px;
  }
  10% {
    stroke-dashoffset: 0px;
  }
  100% {
    stroke-dashoffset: 0px;
  }
}

/* E Animation */

.E-left-stroke {
  stroke-dasharray: 124px;
  stroke-dashoffset: 124px;
  animation: E-left-move 20s ease forwards;
}

.E-top-stroke {
  stroke-dasharray: 47px;
  stroke-dashoffset: 47px;
  animation: E-top-move 10s ease forwards;
}

.E-mid-stroke {
  stroke-dasharray: 42px;
  stroke-dashoffset: 42px;
  animation: E-mid-move 10s ease forwards;
}

.E-bottom-stroke {
  stroke-dasharray: 47px;
  stroke-dashoffset: 47px;
  animation: E-bottom-move 10s ease forwards;
}

@keyframes E-left-move {
  0% {
    stroke-dashoffset: 124px;
  }
  2% {
    stroke-dashoffset: 124px;
  }
  6% {
    stroke-dashoffset: 0px;
  }
  100% {
    stroke-dashoffset: 0px;
  }
}

@keyframes E-top-move {
  0% {
    stroke-dashoffset: 47px;
  }
  6% {
    stroke-dashoffset: 47px;
  }
  11% {
    stroke-dashoffset: 0px;
  }
  100% {
    stroke-dashoffset: 0px;
  }
}

@keyframes E-mid-move {
  0% {
    stroke-dashoffset: 42px;
  }
  8% {
    stroke-dashoffset: 42px;
  }
  13% {
    stroke-dashoffset: 0px;
  }
  100% {
    stroke-dashoffset: 0px;
  }
}

@keyframes E-bottom-move {
  0% {
    stroke-dashoffset: 47px;
  }
  11% {
    stroke-dashoffset: 47px;
  }
  16% {
    stroke-dashoffset: 0px;
  }
  100% {
    stroke-dashoffset: 0px;
  }
}

/* L One Animation */

.L-one-long-stroke {
  stroke-dasharray: 124px;
  stroke-dashoffset: 124px;
  animation: L-one-long-move 20s ease forwards;
}

.L-one-short-stroke {
  stroke-dasharray: 44px;
  stroke-dashoffset: 44px;
  animation: L-one-short-move 10s ease forwards;
}

@keyframes L-one-long-move {
  0% {
    stroke-dashoffset: 124px;
  }
  2% {
    stroke-dashoffset: 124px;
  }
  7% {
    stroke-dashoffset: 0px;
  }
  100% {
    stroke-dashoffset: 0px;
  }
}

@keyframes L-one-short-move {
  0% {
    stroke-dashoffset: 44px;
  }
  13% {
    stroke-dashoffset: 44px;
  }
  18% {
    stroke-dashoffset: 0px;
  }
  100% {
    stroke-dashoffset: 0px;
  }
}

/* L Two Animation */

.L-two-long-stroke {
  stroke-dasharray: 124px;
  stroke-dashoffset: 124px;
  animation: L-two-long-move 20s ease forwards;
}

.L-two-short-stroke {
  stroke-dasharray: 44px;
  stroke-dashoffset: 44px;
  animation: L-two-short-move 10s ease forwards;
}

@keyframes L-two-long-move {
  0% {
    stroke-dashoffset: 124px;
  }
  3% {
    stroke-dashoffset: 124px;
  }
  8% {
    stroke-dashoffset: 0px;
  }
  100% {
    stroke-dashoffset: 0px;
  }
}

@keyframes L-two-short-move {
  0% {
    stroke-dashoffset: 44px;
  }
  15% {
    stroke-dashoffset: 44px;
  }
  20% {
    stroke-dashoffset: 0px;
  }
  100% {
    stroke-dashoffset: 0px;
  }
}

/* O Animation */

.O-stroke {
  stroke-dasharray: 302px;
  stroke-dashoffset: 302px;
  animation: O-move 20s ease forwards;
}

@keyframes O-move {
  0% {
    stroke-dashoffset: 302px;
  }
  4% {
    stroke-dashoffset: 302px;
  }
  9% {
    stroke-dashoffset: 0px;
  }
  100% {
    stroke-dashoffset: 0px;
  }
}

/* Red Dot Animation */

.red-dot {
  stroke-width: 44px;
  stroke-linecap: round;
  animation: red-dot-grow 8s ease-out forwards;
}

@keyframes red-dot-grow {
  0% {
    stroke-width: 0px;
  }
  15% {
    stroke-width: 0px;
  }
  20% {
    stroke-width: 44px;
  }
  100% {
    stroke-width: 44px;
  }
}
.tracking-stages::before {
  content: '';
  position: absolute;
  top: 25px;
  left: 50px;
  right: 50px;
  height: 3px;
  background-color: #333;
  z-index: 1;
}

.tracking-stage {
  position: relative;
  z-index: 2;
  text-align: center;
  flex: 1;
}

.stage-dot {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--dark-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.5rem;
  color: var(--text-muted);
  border: 3px solid #333;
  transition: all var(--transition-medium);
}

.stage-dot.active {
  background-color: var(--yellow-primary);
  color: black;
  border-color: var(--yellow-primary);
  animation: pulse 2s infinite;
}

.stage-dot.completed {
  background-color: #28a745;
  color: white;
  border-color: #28a745;
}

.stage-label {
  color: var(--text-muted);
  font-size: 0.8rem;
  transition: all var(--transition-medium);
}

.stage-label.active {
  color: var(--yellow-primary);
  font-weight: 600;
}

.stage-label.completed {
  color: #28a745;
  font-weight: 600;
}

/* Interactive dish preview */
.dish-preview {
  position: relative;
  height: 300px;
  width: 300px;
  margin: 0 auto;
  perspective: 1000px;
}

.dish-preview-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.8s;
  transform-style: preserve-3d;
}

.dish-preview:hover .dish-preview-inner {
  transform: rotateY(180deg);
}

.dish-front, .dish-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 8px;
  overflow: hidden;
}

.dish-front {
  background-color: var(--dark-card);
}

.dish-back {
  background-color: var(--dark-card);
  transform: rotateY(180deg);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.dish-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Chef recommendations */
.chef-recommendation {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  margin: 2rem 0;
}

.chef-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: rgba(0, 0, 0, 0.7);
  border: 2px solid var(--yellow-primary);
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.chef-badge-inner {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--yellow-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: black;
  font-size: 1.5rem;
}

.chef-badge-icon {
  animation: chefSpin 10s linear infinite;
}

@keyframes chefSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Mobile responsive enhancements */
@media (max-width: 768px) {
  .hero-section {
    padding: 5rem 0;
  }
  
  .menu-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .search-filter-container {
    width: 100%;
  }
  
  .search-input {
    width: 100%;
  }
  
  .floating-cart {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
    bottom: 20px;
    right: 20px;
  }
  
  .category-btn {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }
  
  .popular-nav {
    width: 30px;
    height: 30px;
  }
  
  .popular-prev {
    left: -10px;
  }
  
  .popular-next {
    right: -10px;
  }
  
  .review-card::before {
    font-size: 5rem;
  }
}

/* Dark mode toggle animation */
.theme-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--dark-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  box-shadow: var(--shadow-soft);
  transition: all var(--transition-medium);
}

.theme-toggle:hover {
  transform: rotate(30deg);
  background-color: var(--yellow-primary);
  color: black;
}

.theme-icon {
  font-size: 1.2rem;
  transition: transform 0.5s ease;
}

.theme-toggle:hover .theme-icon {
  transform: rotate(180deg);
}

/* Swiggy-like food detail page animations */
.dish-detail-header {
  height: 300px;
  position: relative;
  overflow: hidden;
}

.dish-detail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 10s ease;
}

.dish-detail-header:hover .dish-detail-img {
  transform: scale(1.2);
}

.dish-detail-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8));
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 2rem;
}

.dish-detail-title {
  font-size: 2rem;
  color: white;
  margin-bottom: 0.5rem;
  animation: slideInFromBottom 0.5s ease;
}

@keyframes slideInFromBottom {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dish-meta {
  display: flex;
  gap: 1rem;
  color: var(--text-muted);
  animation: slideInFromBottom 0.5s ease 0.2s forwards;
  opacity: 0;
}

.dish-tabs {
  margin: 2rem 0;
  border-bottom: 1px solid #333;
}

.dish-tab {
  padding: 1rem 1.5rem;
  color: var(--text-muted);
  cursor: pointer;
  position: relative;
  transition: all var(--transition-medium);
}

.dish-tab::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 0;
  height: 3px;
  background-color: var(--yellow-primary);
  transition: width var(--transition-medium);
}

.dish-tab:hover {
  color: var(--text-light);
}

.dish-tab.active {
  color: var(--yellow-primary);
}

.dish-tab.active::after {
  width: 100%;
}

/* Food delivery blob animation */
.delivery-animation-container {
  position: relative;
  height: 300px;
  width: 100%;
  overflow: hidden;
}

.delivery-blob {
  position: absolute;
  background-color: var(--yellow-primary);
  border-radius: 50%;
  filter: blur(50px);
  opacity: 0.6;
  animation: blobMove 15s infinite alternate;
}

.blob-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 20%;
  animation-delay: 0s;
}

.blob-2 {
  width: 150px;
  height: 150px;
  top: 40%;
  left: 60%;
  animation-delay: 5s;
}

.blob-3 {
  width: 100px;
  height: 100px;
  top: 70%;
  left: 30%;
  animation-delay: 7s;
}

@keyframes blobMove {
  0% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.2);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.8);
  }
  100% {
    transform: translate(20px, 30px) scale(1.1);
  }
}

.delivery-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding-top: 50px;
}

.delivery-icon {
  font-size: 4rem;
  color: white;
  margin-bottom: 1rem;
  animation: floatIcon 3s ease infinite;
}

@keyframes floatIcon {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}
        }
      `}</style>
    </div>
  );
};

export default Resturantpage;
