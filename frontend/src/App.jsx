import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import StudentLayout from './components/StudentLayout';
import AdminLayout from './components/AdminLayout';

// Public Pages
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import MaterialDetail from './pages/MaterialDetail';
import Login from './pages/Login';
import Register from './pages/Register';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyListings from './pages/student/MyListings';
import CreateListing from './pages/student/CreateListing';
import EditListing from './pages/student/EditListing';
import BorrowingRequests from './pages/student/BorrowingRequests';
import SellingRequests from './pages/student/SellingRequests';
import Donations from './pages/student/Donations';
import Exchanges from './pages/student/Exchanges';
import Messages from './pages/student/Messages';
import TransactionHistory from './pages/student/TransactionHistory';
import Profile from './pages/student/Profile';
import Settings from './pages/student/Settings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import MaterialModeration from './pages/admin/MaterialModeration';
import UserManagement from './pages/admin/UserManagement';
import CategoriesManagement from './pages/admin/CategoriesManagement';
import ReportsManagement from './pages/admin/ReportsManagement';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/materials/:id" element={<MaterialDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Student Portal Routes */}
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<Navigate to="/student/dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="listings" element={<MyListings />} />
              <Route path="listings/create" element={<CreateListing />} />
              <Route path="listings/edit/:id" element={<EditListing />} />
              <Route path="borrowing" element={<BorrowingRequests />} />
              <Route path="selling" element={<SellingRequests />} />
              <Route path="donations" element={<Donations />} />
              <Route path="exchanges" element={<Exchanges />} />
              <Route path="messages" element={<Messages />} />
              <Route path="history" element={<TransactionHistory />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Administrator Portal Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="moderation" element={<MaterialModeration />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="categories" element={<CategoriesManagement />} />
              <Route path="reports" element={<ReportsManagement />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

