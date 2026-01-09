import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import BookTruck from './pages/BookTruck';
import Trips from './pages/Trips';
import Chat from './pages/Chat';
import Account from './pages/Account';
import Login from './pages/Login';

import { AppProvider } from './context/AppContext';
import EnquiryDetail from './pages/EnquiryDetail';
import TripDetail from './pages/TripDetail';
import SharedTrip from './pages/SharedTrip';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  // const isAuth = localStorage.getItem('isLoggedIn') === 'true';
  // if (!isAuth) {
  //   return <Navigate to="/login" replace />;
  // }
  return children;
};

// Redirect root to login if not auth
const RootRedirect = () => {
  // const isAuth = localStorage.getItem('isLoggedIn') === 'true';
  // return isAuth ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
  return <Navigate to="/dashboard" replace />;
}

function App() {
  useEffect(() => {
    // Check for impersonation token from Admin Panel
    const params = new URLSearchParams(window.location.search);
    const impersonateId = params.get('impersonate');
    if (impersonateId) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify({ id: impersonateId, name: 'Client View' }));
      // Redirect to dashboard
      window.location.href = '/dashboard';
    }
  }, []);

  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="book" element={<BookTruck />} />
            <Route path="enquiry/:id" element={<EnquiryDetail />} />
            <Route path="trips" element={<Trips />} />
            <Route path="trip/:id" element={<TripDetail />} />
            <Route path="chat" element={<Chat />} />
            <Route path="account" element={<Account />} />
          </Route>

          {/* Public Tracking Route */}
          <Route path="/track/:id" element={<SharedTrip />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
