import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AdminProvider } from './context/AdminContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Clients from './pages/Clients';
import BookTrip from './pages/BookTrip';
import Enquiries from './pages/Enquiries';
import Chat from './pages/Chat';
import MasterRecord from './pages/MasterRecord';
import Brokers from './pages/Brokers';
import ClientDashboardView from './pages/ClientDashboardView';
import Users from './pages/Users';
import Login from './pages/Login';
import './App.css';

const AdminProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Check for auth token in local storage
    const storedAuth = localStorage.getItem('adminAuth');

    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, [location]);

  if (loading) return <div className="p-10 text-center">Loading Admin Panel...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const RoleProtectedRoute = ({ children, restrictedRole }) => {
  const userStr = localStorage.getItem('adminUser');
  const user = userStr ? JSON.parse(userStr) : null;

  if (user && user.role === restrictedRole) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <AdminProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <AdminProtectedRoute>
              <Layout />
            </AdminProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="chats" element={<Chat />} />
            <Route path="enquiries" element={<Enquiries />} />
            <Route path="trips" element={<Orders />} />
            <Route path="trip/:id" element={<OrderDetail />} />
            <Route path="book-trip" element={<BookTrip />} />
            <Route path="clients" element={<Clients />} />
            <Route path="brokers" element={<Brokers />} />
            <Route path="users" element={
              <RoleProtectedRoute restrictedRole="Manager">
                <Users />
              </RoleProtectedRoute>
            } />
            <Route path="master-record" element={
              <RoleProtectedRoute restrictedRole="Manager">
                <MasterRecord />
              </RoleProtectedRoute>
            } />
            <Route path="client-dashboard" element={<ClientDashboardView />} />
          </Route>
        </Routes>
      </Router>
    </AdminProvider>
  );
}

export default App;
