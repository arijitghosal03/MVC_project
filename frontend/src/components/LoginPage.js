import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import anime from 'animejs'; // Fixed import statement
import './LoginPage.css';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Refs for animations
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const headerRef = useRef(null);
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const buttonRef = useRef(null);
  const svgRef = useRef(null);
  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);
  const noodlesRef = useRef(null);
  const steamRef = useRef(null);
  const particlesRef = useRef(null);
  
  const particles = [];
  for (let i = 0; i < 15; i++) {
    particles.push(i);
  }
  
  useEffect(() => {
    // Animation 1: Entrance animation for the card
    anime({
      targets: cardRef.current,
      translateY: [50, 0],
      opacity: [0, 1],
      duration: 1200,
      easing: 'easeOutElastic(1, .5)'
    });
    
    // Animation 2: Header text reveal
    if (headerRef.current) {
      const elements = headerRef.current.querySelectorAll('h2, p');
      if (elements.length > 0) {
        anime({
          targets: elements,
          translateY: [20, 0],
          opacity: [0, 1],
          delay: anime.stagger(150, {start: 300}),
          easing: 'easeOutSine'
        });
      }
    }
    
    // Animation 3: Form fields entrance
    anime({
      targets: [usernameRef.current, passwordRef.current],
      translateX: [-30, 0],
      opacity: [0, 1],
      delay: anime.stagger(150, {start: 600}),
      easing: 'easeOutQuad'
    });
    
    // Animation 4: Button entrance
    anime({
      targets: buttonRef.current,
      scale: [0.8, 1],
      opacity: [0, 1],
      delay: 900,
      easing: 'easeOutBack'
    });
    
    // Animation 5: Background gradient animation using safe approach
    if (containerRef.current) {
      anime({
        targets: containerRef.current,
        background: [
          'linear-gradient(135deg, #dc1a22 0%, #9c1418 100%)',
          'linear-gradient(225deg, #dc1a22 0%, #9c1418 100%)',
          'linear-gradient(315deg, #dc1a22 0%, #9c1418 100%)',
          'linear-gradient(45deg, #dc1a22 0%, #9c1418 100%)'
        ],
        duration: 10000,
        easing: 'easeInOutQuad',
        direction: 'alternate',
        loop: true
      });
    }
    
    // Animation 6: Steam animation with null check
    if (steamRef.current) {
      const steamElements = steamRef.current.querySelectorAll('path');
      if (steamElements.length > 0) {
        anime({
          targets: steamElements,
          translateY: [0, -15],
          opacity: [0.7, 0],
          easing: 'easeInOutSine',
          duration: 1500,
          delay: anime.stagger(200),
          loop: true
        });
      }
    }
    
    // Animation 7: Noodles wiggle with null check
    if (noodlesRef.current) {
      const noodleElements = noodlesRef.current.querySelectorAll('path');
      if (noodleElements.length > 0) {
        anime({
          targets: noodleElements,
          translateX: (el, i) => [2 * (i % 2 ? 1 : -1), 0],
          easing: 'easeInOutSine',
          duration: 1200,
          delay: anime.stagger(100),
          loop: true,
          direction: 'alternate'
        });
      }
    }
    
    // Animation 8: Floating particles with null check
    if (particlesRef.current) {
      const particleElements = particlesRef.current.querySelectorAll('circle');
      if (particleElements.length > 0) {
        anime({
          targets: particleElements,
          translateY: (el) => [anime.random(10, 30), anime.random(-30, -60)],
          translateX: (el) => [anime.random(-20, 20), anime.random(-20, 20)],
          scale: [1, 0.5],
          opacity: [0.6, 0],
          easing: 'easeOutQuad',
          duration: (el) => anime.random(1000, 3000),
          delay: anime.stagger(100, {from: 'center'}),
          loop: true
        });
      }
    }
    
    // Animation 9: Input field focus animation
    const inputFields = [usernameRef.current, passwordRef.current].filter(Boolean);
    inputFields.forEach(input => {
      input.addEventListener('focus', () => {
        anime({
          targets: input,
          borderColor: ['#ffffff', '#ffcc00'],
          boxShadow: ['0 0 0 rgba(255,204,0,0)', '0 0 8px rgba(255,204,0,0.6)'],
          duration: 800,
          easing: 'easeOutQuad'
        });
      });
      
      input.addEventListener('blur', () => {
        anime({
          targets: input,
          borderColor: ['#ffcc00', '#ffffff'],
          boxShadow: ['0 0 8px rgba(255,204,0,0.6)', '0 0 0 rgba(255,204,0,0)'],
          duration: 800,
          easing: 'easeOutQuad'
        });
      });
    });
    
    // Animation 10: Eye tracking for the SVG character
    const handleMouseMove = (e) => {
      if (leftEyeRef.current && rightEyeRef.current) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        const svgRect = svgRef.current?.getBoundingClientRect();
        if (!svgRect) return;
        
        const leftEyeRect = leftEyeRef.current.getBoundingClientRect();
        const rightEyeRect = rightEyeRef.current.getBoundingClientRect();
        
        const leftEyeCenterX = leftEyeRect.left + leftEyeRect.width / 2;
        const leftEyeCenterY = leftEyeRect.top + leftEyeRect.height / 2;
        const rightEyeCenterX = rightEyeRect.left + rightEyeRect.width / 2;
        const rightEyeCenterY = rightEyeRect.top + rightEyeRect.height / 2;
        
        // Calculate angle and distance for eye movement
        const leftDx = mouseX - leftEyeCenterX;
        const leftDy = mouseY - leftEyeCenterY;
        const rightDx = mouseX - rightEyeCenterX;
        const rightDy = mouseY - rightEyeCenterY;
        
        // Limit eye movement
        const maxEyeMove = 3;
        
        // Apply eye movement with anime.js
        anime({
          targets: leftEyeRef.current,
          translateX: Math.max(Math.min(leftDx / 20, maxEyeMove), -maxEyeMove),
          translateY: Math.max(Math.min(leftDy / 20, maxEyeMove), -maxEyeMove),
          duration: 200,
          easing: 'easeOutQuad'
        });
        
        anime({
          targets: rightEyeRef.current,
          translateX: Math.max(Math.min(rightDx / 20, maxEyeMove), -maxEyeMove),
          translateY: Math.max(Math.min(rightDy / 20, maxEyeMove), -maxEyeMove),
          duration: 200,
          easing: 'easeOutQuad'
        });
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      // Clean up any other event listeners here if needed
    };
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
    
    // Animation: input typing effect
    anime({
      targets: e.target,
      scale: [1, 1.02, 1],
      duration: 300,
      easing: 'easeInOutQuad'
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Button press animation
    anime({
      targets: buttonRef.current,
      scale: [1, 0.95, 1],
      duration: 400,
      easing: 'easeInOutQuad'
    });
    
    setIsLoading(true);
    setError('');
    try {
      // Actual API call to your backend endpoint
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Username: credentials.username,
          Password: credentials.password
        })
      });
      console.log(credentials)
      const data = await response.json();
      console.log(data);
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      // Success animation
      anime({
        targets: cardRef.current,
        translateY: [0, -20],
        opacity: [1, 0],
        duration: 800,
        easing: 'easeInOutQuad',
        complete: () => {
          navigate('/admin'); // ✅ Proper usage here
        }
      });
    } catch (error) {
      setError(error.message || 'An error occurred during login');
      
      // Error animation
      anime({
        targets: cardRef.current,
        translateX: [0, -10, 10, -10, 10, 0],
        duration: 600,
        easing: 'easeInOutQuad'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="login-container" ref={containerRef}>
      <div className="login-card" ref={cardRef}>
        <div className="login-header" ref={headerRef}>
          <h2>Sign in to Admin Portal</h2>
         
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="svg-container">
          <svg ref={svgRef} width="150" height="150" viewBox="0 0 200 200" className="character-svg">
            {/* Face */}
            <circle cx="100" cy="100" r="50" fill="#fff" />
            
            {/* Eyes */}
            <g className="eyes">
              <circle cx="80" cy="85" r="12" fill="#f4f4f4" stroke="#333" strokeWidth="1" />
              <circle cx="120" cy="85" r="12" fill="#f4f4f4" stroke="#333" strokeWidth="1" />
              <circle ref={leftEyeRef} cx="80" cy="85" r="5" fill="#333" className="pupil" />
              <circle ref={rightEyeRef} cx="120" cy="85" r="5" fill="#333" className="pupil" />
            </g>
            
            {/* Mouth */}
            <path d="M85,115 Q100,130 115,115" fill="none" stroke="#333" strokeWidth="2" />
            
            {/* Bowl */}
            <path d="M60,140 Q100,160 140,140 V160 Q100,180 60,160 Z" fill="#dc1a22" />
            <path d="M60,140 Q100,125 140,140" fill="none" stroke="#333" strokeWidth="2" />
            
            {/* Noodles */}
            <g ref={noodlesRef} className="noodles">
              <path d="M80,145 Q90,155 85,165" fill="none" stroke="#fff" strokeWidth="2" />
              <path d="M90,145 Q100,158 95,165" fill="none" stroke="#fff" strokeWidth="2" />
              <path d="M100,145 Q110,155 105,165" fill="none" stroke="#fff" strokeWidth="2" />
              <path d="M110,145 Q120,158 115,165" fill="none" stroke="#fff" strokeWidth="2" />
              <path d="M120,145 Q110,155 115,165" fill="none" stroke="#fff" strokeWidth="2" />
            </g>
            
            {/* Steam */}
            <g ref={steamRef} className="steam">
              <path d="M85,135 Q90,125 95,135" fill="none" stroke="#fff" strokeWidth="1" strokeOpacity="0.7" />
              <path d="M100,135 Q105,122 110,135" fill="none" stroke="#fff" strokeWidth="1" strokeOpacity="0.7" />
              <path d="M115,135 Q120,125 125,135" fill="none" stroke="#fff" strokeWidth="1" strokeOpacity="0.7" />
            </g>
          </svg>
          
          {/* Floating particles */}
          <svg ref={particlesRef} className="particles" width="150" height="150" viewBox="0 0 200 200">
            {particles.map((i) => (
              <circle
                key={i}
                cx={70 + Math.random() * 60}
                cy={130 + Math.random() * 10}
                r={1 + Math.random() * 3}
                fill="#fff"
                opacity="0.6"
              />
            ))}
          </svg>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              ref={usernameRef}
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              ref={passwordRef}
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button 
            ref={buttonRef}
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;