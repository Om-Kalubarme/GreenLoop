import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
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
import Settings from './pages/Settings';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#FAF6EE] text-[#1A261D] selection:bg-[#CEEAD8] selection:text-[#0A5C36]">
          <Routes>
            {/* Homepage Dashboard with Sidebar Layout */}
            <Route path="/" element={<Home />} />

            {/* Authentication */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Marketplace Catalog */}
            <Route path="/browse" element={<Browse />} />
            <Route path="/marketplace" element={<Navigate to="/browse" replace />} />

            {/* Listing Detail */}
            <Route
              path="/listings/:id"
              element={<ListingDetail />}
            />

            {/* Redirect /dashboard to the new GreenLoop dashboard */}
            <Route path="/dashboard" element={<Navigate to="/" replace />} />

            <Route
              path="/interests"
              element={
                <ProtectedRoute>
                  <UserInterests />
                </ProtectedRoute>
              }
            />

            <Route
              path="/recommendations"
              element={
                <ProtectedRoute>
                  <Recommendations />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route path="/account" element={<Navigate to="/settings" replace />} />

            <Route
              path="/create-listing"
              element={
                <ProtectedRoute>
                  <CreateListing />
                </ProtectedRoute>
              }
            />

            <Route
              path="/edit-listing/:id"
              element={
                <ProtectedRoute>
                  <EditListing />
                </ProtectedRoute>
              }
            />

            <Route path="/donor/dashboard" element={<Navigate to="/?view=my-listings" replace />} />
            <Route path="/donor-dashboard" element={<Navigate to="/?view=my-listings" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
