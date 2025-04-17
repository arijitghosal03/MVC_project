import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import Restaurantpage from './components/Resturantpage';
import Orders from './components/orders.components';
import MenuAdminPage from './components/MenuAdminPage';
import { BrowserRouter, Routes, Route } from "react-router-dom";
function App() {
  return (
    <BrowserRouter>
    <Routes>
        <Route path="/" element={<Restaurantpage />} />
        <Route path="/admin/menu" element={<MenuAdminPage />} />
      </Routes>
      </BrowserRouter>
  );
}

export default App;
