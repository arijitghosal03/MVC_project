import React, { useState, useEffect } from 'react';
import './MenuAdminPage.css';
import { Link} from 'react-router-dom';
import { useAuth } from './AuthContext';

const MenuAdminPage = () => {
  const { user, logout } = useAuth();
  useEffect(() => {
    // Execute logout function when component mounts
    logout();
  }, [logout]);
  // State management
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([
    'Appetizers', 'Main Courses', 'Desserts', 'Beverages'
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Appetizers',
    image: null,
    rating: 4.0,
    specials: []
  });
  const [selectedSpecials, setSelectedSpecials] = useState([]);
  const [availableSpecials, setAvailableSpecials] = useState([
    'Vegetarian', 'Popular', 'Chef\'s Choice', 'Healthy', 'Premium', 'Spicy', 'Gluten-Free'
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('menu');
  const [reservations, setReservations] = useState([]);
  const [orders, setOrders] = useState([]);
  // Fetch menu items on component mount
  useEffect(() => {
    fetchMenuItems();
  }, []);
  useEffect(() => {
    fetchReservations();
  }, []);
  useEffect(() => {
    fetchOrders();  
  }, []);
  const styles = {
    mainContent: {
      padding: '1.5rem',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    sectionTitle: {
      fontSize: '1.75rem',
      marginBottom: '1.5rem',
      fontWeight: 600,
      color: '#333',
      borderBottom: '2px solid #e0e0e0',
      paddingBottom: '0.75rem',
    },
    ordersContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '1.5rem',
    },
    orderCard: {
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    orderHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem 1rem',
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #e9ecef',
    },
    orderStatus: (status) => {
      const baseStyle = {
        padding: '0.25rem 0.75rem',
        borderRadius: '999px',
        fontSize: '0.875rem',
        fontWeight: 600,
        textTransform: 'uppercase',
      };
      
      switch (status.toLowerCase()) {
        case 'new':
          return { ...baseStyle, backgroundColor: '#e3f2fd', color: '#0d47a1' };
        case 'preparing':
          return { ...baseStyle, backgroundColor: '#fff8e1', color: '#ff8f00' };
        case 'ready':
          return { ...baseStyle, backgroundColor: '#e8f5e9', color: '#2e7d32' };
        case 'delivered':
          return { ...baseStyle, backgroundColor: '#eeeeee', color: '#424242' };
        default:
          return { ...baseStyle, backgroundColor: '#f5f5f5', color: '#757575' };
      }
    },
    orderDate: {
      fontSize: '0.8125rem',
      color: '#6c757d',
    },
    orderInfo: {
      padding: '1rem',
      borderBottom: '1px solid #e9ecef',
    },
    infoRow: {
      marginBottom: '0.5rem',
      display: 'flex',
      gap: '0.5rem',
    },
    infoLabel: {
      minWidth: '80px',
      color: '#495057',
      fontWeight: 'bold',
    },
    orderId: {
      fontFamily: 'monospace',
      color: '#666',
      fontSize: '0.875rem',
    },
    specialRequests: {
      marginTop: '0.5rem',
      paddingTop: '0.5rem',
      borderTop: '1px dashed #dee2e6',
      fontStyle: 'italic',
    },
    orderItems: {
      padding: '1rem',
    },
    itemsHeading: {
      marginTop: 0,
      marginBottom: '0.75rem',
      fontSize: '1rem',
      color: '#343a40',
    },
    itemsList: {
      listStyle: 'none',
      padding: 0,
      margin: '0 0 1rem 0',
    },
    itemRow: {
      padding: '0.5rem 0',
      borderBottom: '1px solid #f2f2f2',
    },
    itemDetails: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    itemName: {
      fontWeight: 500,
    },
    itemMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    itemQuantity: {
      color: '#6c757d',
      fontSize: '0.875rem',
    },
    itemPrice: {
      fontWeight: 600,
      color: '#212529',
    },
    orderTotal: {
      marginTop: '1rem',
      paddingTop: '1rem',
      borderTop: '2px solid #e9ecef',
      textAlign: 'right',
      fontSize: '1.125rem',
    },
    loadingSpinner: {
      textAlign: 'center',
      padding: '2rem',
      color: '#6c757d',
    },
    noData: {
      textAlign: 'center',
      padding: '2rem',
      color: '#6c757d',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px dashed #dee2e6',
    }
  };

  // Filter and sort items when search query or sort config changes
  useEffect(() => {
    let result = [...(menuItems || [])]; 
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredItems(result);
  }, [menuItems, searchQuery, sortConfig]);
  const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    if (response.status === 401) {
      // Token expired or invalid - logout
      logout();
      throw new Error('Authentication expired');
    }
    
    return response;
  };
  const fetchMenuItems = async () => {
    try {
      setIsLoading(true);
      
      // FIX: Using proper API URL with error handling
      const API_URL = 'http://localhost:5000/menu-items';
      const response = await fetchWithAuth(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setMenuItems(data);
      setFilteredItems(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      showNotification('Failed to load menu items', 'danger');
      // Set empty array to prevent further errors
      setMenuItems([]);
      setFilteredItems([]);
      setIsLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      
      // FIX: Using proper API URL with error handling
      const API_URL = 'http://localhost:5000/api/reservations';
      const response = await fetchWithAuth(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setReservations(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      showNotification('Failed to load reservations', 'danger');
      // Set empty array to prevent further errors
      setReservations([]);
      setIsLoading(false);
    }
  };
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'new': return 'status-new';
      case 'preparing': return 'status-preparing';
      case 'ready': return 'status-ready';
      case 'delivered': return 'status-delivered';
      default: return 'status-default';
    }
  };

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      
      const API_URL = 'http://localhost:5000/orders';
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setOrders(data || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showNotification('Failed to load orders', 'danger');
      setOrders([]);
      setIsLoading(false);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'price') {
      const regex = /^\d*\.?\d{0,2}$/;
      if (value === '' || regex.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
    } else if (name === 'rating') {
      setFormData({ ...formData, [name]: parseFloat(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSpecialToggle = (special) => {
    if (selectedSpecials.includes(special)) {
      setSelectedSpecials(selectedSpecials.filter(s => s !== special));
    } else {
      setSelectedSpecials([...selectedSpecials, special]);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showNotification('Image size should be less than 5MB', 'warning');
        return;
      }
      setFormData({ ...formData, image: file });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Appetizers',
      image: null,
      rating: 4.0,
      specials: []
    });
    setSelectedSpecials([]);
    setEditingItem(null);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.name || !formData.description || !formData.price) {
      showNotification('Please fill in all required fields', 'danger');
      setIsSubmitting(false);
      return;
    }

    try {
      // FIX: Using proper API URL and headers
      const API_URL = `http://localhost:5000/menu-items${editingItem ? `/${editingItem._id}` : ''}`;
      const method = editingItem ? 'PUT' : 'POST';
      console.log('API URL:', API_URL);
      console.log('Method:', method);
      // Create FormData object for file upload
      const itemData = new FormData();
      itemData.append('id', formData.id);
      itemData.append('name', formData.name);
      itemData.append('description', formData.description);
      itemData.append('price', parseFloat(formData.price));
      itemData.append('category', formData.category);
      itemData.append('rating', formData.rating);
      itemData.append('specials', JSON.stringify(selectedSpecials));
      
      if (formData.image && typeof formData.image === 'object') {
        itemData.append('image', formData.image);
      }

      // FIX: Proper fetch request
      const response = await fetch(API_URL, {
        method: method,
        body: itemData,
        // Don't set Content-Type header for FormData
      });

      // Check for various response content types
      let responseData;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
        try {
          // Try to parse text as JSON in case the content-type header is wrong
          responseData = JSON.parse(responseData);
        } catch (e) {
          // Keep as text if it's not JSON
        }
      }

      if (!response.ok) {
        const errorMessage = 
          (typeof responseData === 'object' && responseData.message) 
            ? responseData.message 
            : (typeof responseData === 'string' ? responseData : 'Failed to save menu item');
        throw new Error(errorMessage);
      }

      showNotification(editingItem ? 'Item updated successfully' : 'Item added successfully', 'success');
      // fetchMenuItems();
      resetForm();
      setShowAddItemModal(false);
    } catch (error) {
      console.error('Error saving menu item:', error);
      showNotification(error.message || 'Failed to save menu item', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    console.log('Editing item:', item);
    setEditingItem(item);
    setFormData({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: item.image,
      rating: item.rating
    });
    setSelectedSpecials(item.specials || []);
    setShowAddItemModal(true);
    console.log(item);
    // Removed the premature API call from here as it should happen on form submission
  };
  
  // This function should be called when the edit form is submitted
  const handleEditSubmit = async () => {
    setIsSubmitting(true);
    console.log(formData);
    try {
      const API_URL = `http://localhost:5000/menu-items/${formData.id}`;
      console.log('API URL:', API_URL);
      const response = await fetch(API_URL, {
        method: 'PUT', // Changed from POST to PUT for updates
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          image: formData.image,
          rating: formData.rating,
          specials: selectedSpecials
        })
      });
  
      if (!response.ok) {
        throw new Error('Failed to update menu item');
      }
  
      showNotification('Item updated successfully', 'success');
      fetchMenuItems(); // Uncomment this to refresh the menu items
      resetForm();
      setShowAddItemModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating menu item:', error);
      showNotification('Failed to update menu item', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        // FIX: Proper API URL and headers
        const API_URL = `http://localhost:5000/menu-items/${id}`;
        console.log('API URL:', API_URL);
        const response = await fetch(API_URL, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete menu item');
        }

        showNotification('Item deleted successfully', 'success');
        // fetchMenuItems();
      } catch (error) {
        console.error('Error deleting menu item:', error);
        showNotification('Failed to delete menu item', 'danger');
      }
    }
  };

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory('');
      showNotification('Category added successfully', 'success');
    } else if (categories.includes(newCategory)) {
      showNotification('Category already exists', 'warning');
    }
    setIsEditingCategory(false);
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "↕";
    return sortConfig.direction === 'asc' ? "↑" : "↓";
  };

  return (
    <div className="restaurant-admin">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <h2>CMF</h2>
        </div>
        <nav className="nav-menu">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Dashboard</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => setActiveTab('menu')}
          >
            <span className="nav-icon">🍽️</span>
            <span className="nav-text">Menu</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <span className="nav-icon">📋</span>
            <span className="nav-text">Orders</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'reservations' ? 'active' : ''}`}
            onClick={() => setActiveTab('reservations')}
          >
            <span className="nav-icon">📅</span>
            <span className="nav-text">Reservations</span>
          </button>
        
        </nav>
        <div className="user-menu">
          <div className="user-info">
            <div className="user-avatar">JD</div>
            <div className="user-details">
        <p className="user-name">{user?.username || 'Admin User'}</p>
        <p className="user-role">{user?.role || 'Admin'}</p>
      </div>
    </div>
    <button onClick={logout} className="logout-button">
      Logout
    </button>
  </div>
        
        <Link to="/">
        <div className="back-button" style={{fontWeight: 'bold', color: '#fff'}}>&larr; Back</div>
        </Link>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="admin-header">
          <h1>{activeTab === 'menu' ? 'Menu Management' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <div className="header-actions">
            {activeTab === 'menu' && (
              <button 
                className="btn-primary"
                onClick={() => setShowAddItemModal(true)}
              >
                Add Item
              </button>
            )}
          </div>
        </header>

        {/* Notifications */}
        {notification && (
          <div className={`notification notification-${notification.type}`}>
            {notification.message}
            <button 
              className="notification-close"
              onClick={() => setNotification(null)}
            >
              ×
            </button>
          </div>
        )}

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            <div className="dashboard-stats">
              <div className="stat-card">
                <h3>Today's Orders</h3>
                <p className="stat-number">{menuItems.length}</p>
              </div>
              <div className="stat-card">
                <h3>Revenue</h3>
                <p className="stat-number">₹{menuItems.reduce((total, item) => total + item.price, 0)}</p>
              </div>
              <div className="stat-card">
                <h3>Reservations</h3>
                <p className="stat-number">{reservations.length}</p>
              </div>
              <div className="stat-card">
                <h3>Menu Items</h3>
                <p className="stat-number">{menuItems.length}</p>
              </div>
            </div>
            <div className="placeholder-content">
              <p>Dashboard statistics and charts will be displayed here.</p>
            </div>
          </div>
        )}

        {/* Menu Management */}
        {activeTab === 'menu' && (
          <div className="menu-content">
            {/* Categories Section */}
            <div className="card categories-card">
              <div className="card-header">
                <h2>Categories</h2>
                <button 
                  className="btn-text"
                  onClick={() => setIsEditingCategory(!isEditingCategory)}
                >
                  {isEditingCategory ? 'Cancel' : 'Edit Categories'}
                </button>
              </div>
              <div className="card-body">
                <div className="categories-container">
                  {categories.map((category, index) => (
                    <span 
                      key={index} 
                      className="category-badge"
                    >
                      {category}
                    </span>
                  ))}
                </div>
                {isEditingCategory && (
                  <div className="category-form">
                    <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category name"
                      className="form-input"
                    />
                    <button 
                      className="btn-secondary"
                      onClick={handleAddCategory}
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Menu Items Section */}
            <div className="card menu-items-card">
              <div className="card-header">
                <div className="search-filter">
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>
              <div className="card-body">
                {isLoading ? (
                  <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading menu items...</p>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="empty-results">
                    <p>No menu items found. Try adjusting your search or add a new item.</p>
              </div>
            ) : (
                  <div className="table-container">
                    <table className="menu-items-table">
                  <thead>
                    <tr>
                          <th onClick={() => handleSort('name')} className="sortable-header">
                            Item {getSortIcon('name')}
                          </th>
                      <th>Description</th>
                          <th onClick={() => handleSort('price')} className="sortable-header">
                            Price {getSortIcon('price')}
                          </th>
                          <th onClick={() => handleSort('category')} className="sortable-header">
                            Category {getSortIcon('category')}
                          </th>
                      <th>Specials</th>
                          <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                        {filteredItems.map((item) => (
                          <tr key={item._id} className="menu-item-row">
                            <td>
                              <div className="item-name">
                                {item.name}
                          </div>
                        </td>
                        <td>
                              <p className="item-description">
                            {item.description}
                          </p>
                        </td>
                            <td className="item-price">₹{item.price.toFixed(2)}</td>
                            <td>
                              <span className="category-badge small">
                                {item.category}
                              </span>
                            </td>
                            <td>
                              <div className="specials-container">
                            {item.specials && item.specials.map((special, index) => (
                                  <span 
                                    key={index} 
                                    className="special-badge"
                                  >
                                    {special}
                                  </span>
                            ))}
                          </div>
                        </td>
                            <td className="actions-cell">
                              <button 
                                className="btn-icon edit"
                                onClick={() => handleEdit(item)} 
                              >
                                ✏️
                              </button>
                              <button 
                                className="btn-icon delete"
                                onClick={() => {
                                  console.log('Deleting item with id:', item.id);
                                  handleDelete(item.id);
                                }
                                  
                                }
                              >
                                🗑️
                              </button>
                        </td>
                          </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
              </div>
            </div>
          </div>
        )}
     {activeTab === 'orders' && (
        <div className="orders-tab">
          <h3 className="section-title">Orders</h3>
          
          {isLoading ? (
            <div className="loading-spinner">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="no-data">No orders found</div>
          ) : (
            <div className="orders-container">
              {orders.map(order => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <span className={`order-status ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="order-date">
                      {new Date(order.createdat?.$date || order.createdat).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="order-info">
                    <div className="info-row">
                      <strong>Order ID:</strong> 
                      <span className="order-id">{order._id?.$oid || order._id}</span>
                    </div>
                    <div className="info-row">
                      <strong>Customer:</strong> {order.customername}
                    </div>
                    <div className="info-row">
                      <strong>Table:</strong> {order.table}
                    </div>
                    <div className="info-row">
                      <strong>Server:</strong> {order.server}
                    </div>
                    {order.specialrequests && (
                      <div className="info-row special-requests">
                        <strong>Special Requests:</strong> {order.specialrequests}
                      </div>
                    )}
                  </div>
                  
                  <div className="order-items">
                    <h4>Items:</h4>
                    <ul className="items-list">
                      {order.items && order.items.map((item, index) => (
                        <li key={index} className="item-row">
                          <div className="item-details">
                            <span className="item-name">{item.items}</span>
                            <div className="item-meta">
                              <span className="item-quantity">x{item.quantity}</span>
                              <span className="item-price">₹{item.price}</span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="order-total">
                      <strong>Total:</strong> ₹{order.totalprice || 
                        order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    {activeTab === 'reservations' && (
  <div className="reservations-tab">
    <h3 className="section-title">Reservations</h3>
    
    {isLoading ? (
      <div className="loading-spinner">Loading reservations...</div>
    ) : reservations.length === 0 ? (
      <div className="no-data">No reservations found</div>
    ) : (
      <div className="reservations-container">
        {reservations.map(reservation => (
          <div key={reservation._id.$oid || reservation._id} className="reservation-card">
            <div className="reservation-header">
             
              <span className="reservation-date">
                {new Date(reservation.createdat?.$date || reservation.createdat).toLocaleString()}
              </span>
            </div>
            
            <div className="reservation-info">
              <div className="info-row">
                <strong>Reservation ID:</strong> 
                <span className="reservation-id">{reservation._id.$oid || reservation._id}</span>
              </div>
              <div className="info-row">
                <strong>Customer:</strong> {reservation.name}
              </div>
              <div className="info-row">
                <strong>Date:</strong> {reservation.date}
              </div>
              <div className="info-row">
                <strong>Time:</strong> {reservation.time}
              </div>
              <div className="info-row">
                <strong>Guests:</strong> {reservation.guests}
              </div>
              <div className="info-row">
                <strong>Phone:</strong> {reservation.phone}
              </div>
              <div className="info-row">
                <strong>Email:</strong> {reservation.email}
              </div>
              {reservation.specialrequests && (
                <div className="info-row special-requests">
                  <strong>Special Requests:</strong> {reservation.specialrequests}
                </div>
              )}
            </div>
            
          </div>
        ))}
      </div>
    )}
  </div>
)}
    </main>
      {/* Add/Edit Item Modal */}
      {showAddItemModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
              <button 
                className="modal-close"
                onClick={() => { setShowAddItemModal(false); resetForm(); }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="item-form">
                <div className="form-group">
                  <label>Item Name *</label>
                  <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                    placeholder="Enter dish name"
                required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the menu item"
                required
                    className="form-textarea"
                    rows="3"
                  ></textarea>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Price (₹) *</label>
                    <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                      placeholder="Price in INR"
                required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                      className="form-select"
              >
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Rating</label>
                  <div className="rating-container">
                    <input
                      type="range"
                min="1"
                max="5"
                step="0.1"
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                      className="rating-slider"
                    />
                    <div className="rating-value">
                      {parseFloat(formData.rating).toFixed(1)}/5 ⭐
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Image</label>
                  <div className="image-upload">
                    <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                      className="file-input"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="upload-label">
                      {formData.image ? 'Change Image' : 'Upload Image'}
                    </label>
                    {formData.image && (
                      <div className="image-preview-name">
                        {typeof formData.image === 'object' ? formData.image.name : 'Current image'}
                      </div>
                    )}
                  </div>
              </div>

                <div className="form-group">
                  <label>Specials</label>
                  <div className="specials-selector">
                {availableSpecials.map((special, index) => (
                      <button
                    key={index}
                        type="button"
                        className={`special-toggle ${selectedSpecials.includes(special) ? 'active' : ''}`}
                    onClick={() => handleSpecialToggle(special)}
                  >
                    {special}
                      </button>
                ))}
              </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="button"
                    className="btn-secondary"
                    onClick={() => { setShowAddItemModal(false); resetForm(); }}
                    disabled={isSubmitting}
                  >
                Cancel
                  </button>
                  <button 
    className="btn btn-primary" 
    onClick={handleEditSubmit} 
    disabled={isSubmitting}
  >
    {isSubmitting ? 'Saving...' : 'Save Changes'}
  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuAdminPage;