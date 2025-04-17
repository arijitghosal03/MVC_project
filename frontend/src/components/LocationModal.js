import React, { useEffect, useState } from 'react';
import { Modal, Row, Col, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhone, faClock, faParking, faSubway, faBus, faDirections } from '@fortawesome/free-solid-svg-icons';
import { GoogleMap, useLoadScript, MarkerF, InfoWindowF } from '@react-google-maps/api';

// Map container styles
const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '400px',
};

// Kolkata Park Street area coordinates
const center = { lat: 22.5553, lng: 88.3508 }; // Park Street, Kolkata coordinates

// Nearby locations data
const nearbyLocationsData = [
  { id: 1, name: 'Indian Museum', type: 'attraction', position: { lat: 22.5575, lng: 88.3503 } },
  { id: 2, name: 'St. Xavier\'s College', type: 'educational', position: { lat: 22.5561, lng: 88.3491 } },
  { id: 3, name: 'Park Street Metro', type: 'transport', position: { lat: 22.5548, lng: 88.3523 } },
  { id: 4, name: 'Quest Mall', type: 'shopping', position: { lat: 22.5537, lng: 88.3515 } }
];

const LocationModal = ({ show, onHide, setShowReservationModal }) => {
  const [currentTab, setCurrentTab] = useState('info');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [nearbyLocations, setNearbyLocations] = useState([]);
  
  // Load Google Maps API using the key from .env
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  // Simulate loading nearby attractions data with smooth animation
  useEffect(() => {
    if (show) {
      setNearbyLocations([]);
      setMapLoaded(false);
      
      // Simulate an API fetch with a loading animation
      const timer = setTimeout(() => {
        setMapLoaded(true);
      }, 800);
      
      // Add locations gradually for a smooth animation effect
      nearbyLocationsData.forEach((location, index) => {
        setTimeout(() => {
          setNearbyLocations(prev => [...prev, location]);
        }, 1000 + (index * 200));
      });
      
      return () => clearTimeout(timer);
    }
  }, [show]);

  // Map loading and error handling
  const renderMap = () => {
    if (loadError) return <div className="text-center p-4">Error loading maps</div>;
    if (!isLoaded) return <div className="text-center p-4">Loading maps...</div>;

    return (
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={15}
        center={center}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: true,
          styles: [
            {
              featureType: "poi.business",
              stylers: [{ visibility: "simplified" }],
            },
          ],
        }}
      >
        {/* Main Restaurant Marker */}
        <MarkerF
          position={center}
          icon={{
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new window.google.maps.Size(40, 40),
            origin: new window.google.maps.Point(0, 0),
            anchor: new window.google.maps.Point(20, 40),
          }}
          onClick={() => setSelectedMarker({
            id: 'restaurant',
            name: 'Cook My Food',
            position: center,
            type: 'restaurant'
          })}
          animation={window.google.maps.Animation.DROP}
        />
        
        {/* Nearby Location Markers */}
        {nearbyLocations.map(place => (
          <MarkerF
            key={place.id}
            position={place.position}
            icon={{
              url: place.type === 'transport' 
                ? 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                : place.type === 'attraction'
                  ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
                  : 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
              scaledSize: new window.google.maps.Size(32, 32),
              origin: new window.google.maps.Point(0, 0),
              anchor: new window.google.maps.Point(16, 32),
            }}
            onClick={() => setSelectedMarker(place)}
            animation={window.google.maps.Animation.DROP}
          />
        ))}
        
        {/* Info Windows */}
        {selectedMarker && (
          <InfoWindowF
            position={selectedMarker.position}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="info-window p-1">
              <h6 className="mb-1">{selectedMarker.name}</h6>
              <p className="mb-0 small">
                {selectedMarker.id === 'restaurant' ? (
                  <>
                    5/1 Park Street, Kolkata<br />
                    <button 
                      className="btn btn-sm btn-link p-0 text-success" 
                      onClick={() => setCurrentTab('directions')}
                    >
                      Get directions
                    </button>
                  </>
                ) : (
                  selectedMarker.type === 'transport' ? 'Transit Station' :
                  selectedMarker.type === 'attraction' ? 'Popular Attraction' :
                  selectedMarker.type === 'shopping' ? 'Shopping Center' : 
                  'Nearby Location'
                )}
              </p>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
    );
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="lg" 
      centered 
      className="location-modal"
      contentClassName="rounded-lg overflow-hidden border-0 shadow-lg"
    >
      <div className="modal-header border-0 bg-gradient-dark text-white py-3" 
        style={{ 
          background: 'linear-gradient(135deg, #1e3932 0%, #0c5d46 70%, #097054 100%)',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
      >
        <h4 className="modal-title fw-bold d-flex align-items-center">
          <FontAwesomeIcon 
            icon={faMapMarkerAlt} 
            className="me-2 bounce-animation" 
            style={{ 
              color: '#e01e37', 
              filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.5))'
            }} 
          />
          Our Location
        </h4>
        <button type="button" className="btn-close btn-close-white" onClick={onHide} aria-label="Close"></button>
      </div>
      
      <div className="location-tabs d-flex" style={{ background: '#1e3932' }}>
        <button 
          className={`tab-button flex-grow-1 py-2 text-center border-0 transition-all ${currentTab === 'info' ? 'active' : ''}`}
          style={{ 
            background: currentTab === 'info' ? '#fff' : 'transparent',
            color: currentTab === 'info' ? '#1e3932' : '#fff',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            marginRight: '2px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}
          onClick={() => setCurrentTab('info')}
        >
          Restaurant Info
        </button>
        <button 
          className={`tab-button flex-grow-1 py-2 text-center border-0 transition-all ${currentTab === 'directions' ? 'active' : ''}`}
          style={{ 
            background: currentTab === 'directions' ? '#fff' : 'transparent',
            color: currentTab === 'directions' ? '#1e3932' : '#fff',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            marginLeft: '2px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}
          onClick={() => setCurrentTab('directions')}
        >
          Directions & Parking
        </button>
      </div>
      
      <Modal.Body className="p-0">
        <Row className="g-0">
          <Col md={6} className="order-md-2">
            <div className="location-map h-100" style={{ minHeight: '400px', position: 'relative' }}>
              {!mapLoaded && (
                <div className="loading-overlay d-flex justify-content-center align-items-center" 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    zIndex: 1000
                  }}>
                  <div className="spinner-grow text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}
              
              {renderMap()}
            </div>
          </Col>
          
          <Col md={6} className="order-md-1">
            <div className="location-content p-4" 
              style={{ 
                backgroundColor: '#f8f5f0', 
                height: '100%',
                boxShadow: 'inset -2px 0 8px rgba(0,0,0,0.05)'
              }}
            >
              {currentTab === 'info' ? (
                <div className="location-details fade-in">
                  <div className="mb-4 pb-3 border-bottom border-2" style={{ borderColor: '#1e3932' }}>
                    <h4 className="mb-1" style={{ color: '#1e3932' }}>Cook My Food</h4>
                    <p className="address mb-2 d-flex align-items-start">
                      <FontAwesomeIcon 
                        icon={faMapMarkerAlt} 
                        className="me-2 mt-1 pulse-animation" 
                        style={{ color: '#e01e37' }}
                      />
                      <span style={{ color: '#000' }}>
                        Park Street<br />
                        Kolkata, West Bengal 700016
                      </span>
                    </p>
                    <p className="phone mb-0 d-flex align-items-center">
                      <FontAwesomeIcon 
                        icon={faPhone} 
                        className="me-2" 
                        style={{ color: '#e01e37' }}
                      />
                      <a href="tel:03322345678" 
                        style={{ 
                          color: '#1e3932', 
                          textDecoration: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        className="hover-effect"
                      >
                        (033) 2234-5678
                      </a>
                    </p>
                  </div>
                  
                  <div className="hours-section mb-4 pb-3 border-bottom border-2 slide-in" style={{ borderColor: '#1e3932' }}>
                    <h5 className="d-flex align-items-center" style={{ color: '#1e3932' }}>
                      <FontAwesomeIcon icon={faClock} className="me-2" style={{ color: '#e01e37' }} />
                      Hours of Operation
                    </h5>
                    <div className="hours-grid">
                      <div className="d-flex justify-content-between py-1 hover-highlight">
                        <span className="day fw-bold" style={{ color: '#000' }}>Monday - Thursday:</span>
                        <span className="time" style={{ color: '#000' }}>11AM - 10PM</span>
                      </div>
                      <div className="d-flex justify-content-between py-1 hover-highlight" style={{ backgroundColor: 'rgba(224, 30, 55, 0.05)' }}>
                        <span className="day fw-bold" style={{ color: '#000' }}>Friday - Saturday:</span>
                        <span className="time" style={{ color: '#000' }}>11AM - 11PM</span>
                      </div>
                      <div className="d-flex justify-content-between py-1 hover-highlight">
                        <span className="day fw-bold" style={{ color: '#000' }}>Sunday:</span>
                        <span className="time" style={{ color: '#000' }}>11AM - 9PM</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="amenities-section mb-4 fade-in-up">
                    <h5 style={{ color: '#1e3932' }}>Restaurant Features</h5>
                    <div className="d-flex flex-wrap">
                      <span className="badge bg-light text-dark m-1 p-2 badge-hover">95% Bengali Cuisine</span>
                      <span className="badge bg-light text-dark m-1 p-2 badge-hover">Budget Dining Experience</span>
                      <span className="badge bg-light text-dark m-1 p-2 badge-hover">Outdoor Seating</span>
                      <span className="badge bg-light text-dark m-1 p-2 badge-hover">Free WiFi</span>
                      <span className="badge bg-light text-dark m-1 p-2 badge-hover">Takeaway Available</span>
                    </div>
                  </div>
                  
                  <div className="cta-buttons d-grid gap-2 slide-in-up">
                    <Button 
                      variant="danger" 
                      size="lg" 
                      className="reserveBtn btn-animation" 
                      onClick={() => {
                        onHide();
                        setShowReservationModal(true);
                      }}
                      style={{ 
                        backgroundColor: '#e01e37', 
                        borderColor: '#e01e37',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Book A Table
                    </Button>
                    <Button 
                      variant="outline-success" 
                      onClick={() => setCurrentTab('directions')}
                      className="btn-outline-animation"
                      style={{ 
                        color: '#1e3932', 
                        borderColor: '#1e3932',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Get Directions
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="directions-details fade-in">
                  <h5 className="mb-3" style={{ color: '#1e3932' }}>Getting Here</h5>
                  
                  <div className="direction-method mb-3 pb-3 border-bottom hover-card">
                    <h6 className="d-flex align-items-center" style={{ color: '#e01e37' }}>
                      <FontAwesomeIcon icon={faDirections} className="me-2" />
                      By Car
                    </h6>
                    <p style={{ color: '#000' }}>Our restaurant is conveniently located on Park Street near the crossing with Free School Street. Look for our signage next to the Park Street Metro station.</p>
                  </div>
                  
                  <div className="direction-method mb-3 pb-3 border-bottom hover-card">
                    <h6 className="d-flex align-items-center" style={{ color: '#e01e37' }}>
                      <FontAwesomeIcon icon={faParking} className="me-2" />
                      Parking
                    </h6>
                    <p style={{ color: '#000' }}>Valet parking available. Public parking available at Park Street Plaza (100m) and New Market Parking Lot (500m). Street parking is limited but available.</p>
                  </div>
                  
                  <div className="direction-method mb-3 pb-3 border-bottom hover-card">
                    <h6 className="d-flex align-items-center" style={{ color: '#e01e37' }}>
                      <FontAwesomeIcon icon={faSubway} className="me-2" />
                      By Metro
                    </h6>
                    <p style={{ color: '#000' }}>Take the Blue Line to Park Street Metro Station. Our restaurant is a 2-minute walk from Exit A of the station.</p>
                  </div>
                  
                  <div className="direction-method mb-4 hover-card">
                    <h6 className="d-flex align-items-center" style={{ color: '#e01e37' }}>
                      <FontAwesomeIcon icon={faBus} className="me-2" />
                      By Bus
                    </h6>
                    <p style={{ color: '#000' }}>Bus routes 32, 44, 215, and 230 all stop within one block of our location at Park Street Bus Stop.</p>
                  </div>
                  
                  <div className="action-buttons d-flex flex-wrap gap-2 slide-in-up">
                    <Button 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      variant="outline-success"
                      className="flex-grow-1 btn-outline-animation"
                      style={{ color: '#1e3932', borderColor: '#1e3932' }}
                    >
                      <FontAwesomeIcon icon={faDirections} className="me-2" />
                      Google Maps
                    </Button>
                    <Button 
                      href={`https://waze.com/ul?ll=${center.lat},${center.lng}&navigate=yes`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      variant="outline-success"
                      className="flex-grow-1 btn-outline-animation"
                      style={{ color: '#1e3932', borderColor: '#1e3932' }}
                    >
                      <FontAwesomeIcon icon={faDirections} className="me-2" />
                      Waze
                    </Button>
                    <Button 
                      href={`https://maps.apple.com/?q=${center.lat},${center.lng}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      variant="outline-success"
                      className="flex-grow-1 btn-outline-animation"
                      style={{ color: '#1e3932', borderColor: '#1e3932' }}
                    >
                      <FontAwesomeIcon icon={faDirections} className="me-2" />
                      Apple Maps
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Modal.Body>
      
      <Modal.Footer className="border-0 bg-light">
        <Button 
          variant="success" 
          onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`, '_blank')}
          className="btn-animation"
          style={{ backgroundColor: '#1e3932', borderColor: '#1e3932' }}
        >
          <FontAwesomeIcon icon={faDirections} className="me-2" />
          Get Directions
        </Button>
        <Button 
          variant="danger" 
          onClick={onHide}
          className="btn-animation"
          style={{ backgroundColor: '#e01e37', borderColor: '#e01e37' }}
        >
          Close
        </Button>
      </Modal.Footer>

      {/* CSS for animations */}
      <style jsx global>{`
        .fade-in {
          animation: fadeIn 0.5s ease-in;
        }
        
        .fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .slide-in {
          animation: slideIn 0.5s ease-out;
        }
        
        .slide-in-up {
          animation: slideInUp 0.7s ease-out;
        }
        
        .hover-highlight:hover {
          background-color: rgba(30, 57, 50, 0.1);
          transition: all 0.3s ease;
        }
        
        .hover-card {
          transition: all 0.3s ease;
          border-radius: 6px;
          padding: 10px;
          margin-left: -10px;
          margin-right: -10px;
        }
        
        .hover-card:hover {
          background-color: rgba(30, 57, 50, 0.05);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .badge-hover {
          transition: all 0.2s ease;
        }
        
        .badge-hover:hover {
          transform: scale(1.05);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .btn-animation:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        
        .btn-outline-animation:hover {
          background-color: rgba(30, 57, 50, 0.1);
          transform: translateY(-2px);
        }
        
        .hover-effect:hover {
          color: #e01e37 !important;
          text-decoration: underline !important;
        }
        
        .bounce-animation {
          animation: bounce 2s infinite;
        }
        
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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
        
        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: translateX(-20px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInUp {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
          40% {transform: translateY(-5px);}
          60% {transform: translateY(-3px);}
        }
        
        @keyframes pulse {
          0% {transform: scale(1);}
          50% {transform: scale(1.1);}
          100% {transform: scale(1);}
        }
      `}</style>
    </Modal>
  );
};

export default LocationModal;