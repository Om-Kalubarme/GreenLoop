import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-[#5A524C]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#0A5C36] mb-3" />
        <p className="text-sm font-medium">Verifying authentication session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-[#FDFBF7] border border-[#EAE3D2] rounded-2xl shadow-sm text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-[#FCEBE6] text-[#B72B15] flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-[#D9381E]" />
        </div>
        <h2 className="text-xl font-serif font-bold text-[#1A261D] mb-2">Access Restricted</h2>
        <p className="text-sm text-[#5A524C] mb-6">
          This section is exclusively for {allowedRoles.join(' or ')} accounts. Your current role is <strong>{user.role}</strong>.
        </p>
        <Navigate to="/" replace />
      </div>
    );
  }

  return children;
}
