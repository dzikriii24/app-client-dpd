import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Outlet adalah tempat konten (Dashboard/Profile) dirender */}
      <div className="pb-24"> 
        <Outlet />
      </div>
      
      {/* Bottom Bar selalu nempel di bawah */}
      <BottomNav />
    </div>
  );
}