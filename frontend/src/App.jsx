import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import Listings from './pages/Listings';
import ListingDetail from './pages/ListingDetail';
import SavedListings from './pages/SavedListings';
import Rentals from './pages/Rentals';
import Projects from './pages/Projects';
import Analytics from './pages/Analytics';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="/listings" replace />} />
          <Route path="listings" element={<Listings />} />
          <Route path="listings/:id" element={<ListingDetail />} />
          <Route path="saved" element={<SavedListings />} />
          <Route path="rentals" element={<Rentals />} />
          <Route path="projects" element={<Projects />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
