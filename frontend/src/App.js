import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import Restaurantpage from './components/Resturantpage';
import Orders from './components/orders.components';
import MenuAdminPage from './components/MenuAdminPage';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from './components/AuthContext';
import LoginPage from './components/LoginPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Restaurantpage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected admin route */}
          <Route path="/admin" element={
            
              <MenuAdminPage />

          } />
          
        
          
          {/* Catch any undefined routes and redirect to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;