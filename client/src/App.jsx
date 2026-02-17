import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts & Pages
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ScanQR from './pages/ScanQr'; 
import Profile from './pages/Profile';
import Activity from './pages/Activity';
import Emergency from './pages/Emergency';
import TestQrGenerator from './pages/TestQrGenerator';
import EditProfile from './pages/EditProfile';
import Notifications from './pages/Notifications';
import ChangePassword from './pages/ChangePassword';
import Help from './pages/Help';
import About from './pages/About';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Flow Awal: Login -> Scan Masuk */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        
        {/* Halaman Generator QR (Untuk Testing/Admin) */}
        <Route path="/test-qr" element={<TestQrGenerator />} />
        
        {/* Halaman Scan Masuk (Tanpa Bottom Bar) */}
        <Route path="/scan-masuk" element={<ScanQR type="masuk" />} />
        
        {/* Halaman Scan Pulang (Tanpa Bottom Bar, Full Screen) */}
        <Route path="/scan-pulang" element={<ScanQR type="pulang" />} />

        {/* Flow Utama: Pakai Bottom Bar (MainLayout) */}
        <Route element={<MainLayout />}>
           <Route path="/dashboard" element={<Dashboard />} />
           <Route path="/profile" element={<Profile />} />
           <Route path="/activity" element={<Activity />} />
           <Route path="/emergency" element={<Emergency />} />
           <Route path="/profile/edit" element={<EditProfile />} />
           <Route path="/notifications" element={<Notifications />} />
           <Route path="/change-password" element={<ChangePassword />} />
           <Route path="/help" element={<Help />} />
           <Route path="/about" element={<About />} />
        </Route>

      </Routes>
    </Router>
  );
}