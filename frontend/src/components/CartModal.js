import React, { useState, useEffect } from 'react';
import { Modal, Button, ListGroup } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingCart, 
  faPlus, 
  faMinus, 
  faTrash,
  faGift
} from '@fortawesome/free-solid-svg-icons';
import './CartModal.css'; // We'll define this styling below

const CartModal = ({ 
  show, 
  onHide, 
  cart, 
  addToCart, 
  removeFromCart, 
  calculateTotal,
  setShowCheckout
}) => {
  const [animateItems, setAnimateItems] = useState(false);

  useEffect(() => {
    if (show) {
      setTimeout(() => {
        setAnimateItems(true);
      }, 300);
    } else {
      setAnimateItems(false);
    }
  }, [show]);

  const modalVariants = {
    hidden: { 
      x: "100%", 
      opacity: 0 
    },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }
    },
    exit: { 
      x: "100%", 
      opacity: 0,
      transition: { 
        ease: "easeInOut" 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: i => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3
      }
    }),
    exit: { opacity: 0, x: -100 }
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="cart-modal-overlay">
          <motion.div
            className="custom-cart-modal"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="modal-header">
              <h3 className="modal-title">
                <FontAwesomeIcon icon={faShoppingCart} className="cart-icon me-2" />
                Your Basket
                <span className="item-count">{cart.length} items</span>
              </h3>
              <button className="close-button" onClick={onHide}>×</button>
            </div>
            
            <div className="modal-body">
              {cart.length === 0 ? (
                <motion.div 
                  className="empty-cart-container"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="empty-cart-icon">
                    <FontAwesomeIcon icon={faShoppingCart} />
                  </div>
                  <h4>Your basket is empty</h4>
                  <p>Add some delicious items to get started!</p>
                  <Button 
                    variant="success" 
                    className="browse-menu-btn"
                    onClick={onHide}
                  >
                    Browse Menu
                  </Button>
                </motion.div>
              ) : (
                <div className="cart-items-container">
                  <AnimatePresence>
                    {cart.map((item, index) => (
                      <motion.div
                        key={item.id}
                        custom={index}
                        variants={itemVariants}
                        initial="hidden"
                        animate={animateItems ? "visible" : "hidden"}
                        exit="exit"
                        className="cart-item"
                      >
                        <div className="cart-item-image">
                          <img src={`/uploads/${item.image}`} alt={item.name} />
                        </div>
                        
                        <div className="cart-item-details">
                          <h5>{item.name}</h5>
                          <p className="item-price">₹{item.price.toFixed(2)} each</p>
                          {item.specialInstruction && (
                            <p className="special-instruction">{item.specialInstruction}</p>
                          )}
                        </div>
                        
                        <div className="quantity-control">
                          <button 
                            className="quantity-btn minus"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <FontAwesomeIcon icon={faMinus} />
                          </button>
                          <span className="quantity">{item.quantity}</span>
                          <button 
                            className="quantity-btn plus"
                            onClick={() => addToCart(item)}
                          >
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                        </div>
                        
                        <div className="item-total">
                        ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                        
                        <button 
                          className="remove-btn"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  <motion.div 
                    className="cart-summary"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="summary-row">
                      <span>Subtotal</span>
                      <span>₹{calculateTotal()}</span>
                    </div>
                    <div className="summary-row">
                      <span>Taxes (20%)</span>
                      <span>₹{(calculateTotal() * 0.2)}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total</span>
                      <span>₹{(calculateTotal() * 1.2)}</span>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
            
            <motion.div 
              className="modal-footer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Button 
                variant="outline-light" 
                className="continue-btn"
                onClick={onHide}
              >
                Continue Shopping
              </Button>
              <Button 
                variant="success" 
                className="checkout-btn"
                disabled={cart.length === 0}
                onClick={() => {
                  setShowCheckout(true);
                  onHide(); 
                  // Handle checkout logic
                }}
              >
                Proceed to Checkout
              </Button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartModal;