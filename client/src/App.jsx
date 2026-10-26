import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Browse from './pages/Browse';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';
import ListingDetail from './pages/ListingDetail';
import DonorDashboard from './pages/DonorDashboard';
import UserInterests from './pages/UserInterests';
import Recommendations from './pages/Recommendations';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C241E] selection:bg-[#E2EBD8] selection:text-[#1B3B2B]">
          <Routes>
            {/* Landing Page with Editorial Design */}
            <Route 
              path="/" 
              element={
                <>
                  <Navbar />
                  <Home />
                </>
              } 
            />

            {/* Authentication */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Public Marketplace Catalog */}
            <Route
              path="/browse"
              element={
                <>
                  <Navbar />
                  <Browse />
                </>
              }
            />

            {/* Listing Detail (Public) */}
            <Route
              path="/listings/:id"
              element={
                <>
                  <Navbar />
                  <ListingDetail />
                </>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/interests"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <UserInterests />
                </ProtectedRoute>
              }
            />

            <Route
              path="/recommendations"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Recommendations />
                </ProtectedRoute>
              }
            />

            <Route
              path="/create-listing"
              element={
                <ProtectedRoute allowedRoles={['donor', 'admin']}>
                  <Navbar />
                  <CreateListing />
                </ProtectedRoute>
              }
            />

            <Route
              path="/edit-listing/:id"
              element={
                <ProtectedRoute allowedRoles={['donor', 'admin']}>
                  <Navbar />
                  <EditListing />
                </ProtectedRoute>
              }
            />

            <Route
              path="/donor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['donor', 'admin']}>
                  <Navbar />
                  <DonorDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
