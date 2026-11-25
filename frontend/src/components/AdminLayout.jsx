import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex bg-slate-900 text-slate-100">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-64 max-w-xs flex-1 flex flex-col">
            <AdminSidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Admin Top Header */}
        <header className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-wide">
              Administrator Control Center
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-amber-500/20 text-amber-300 font-semibold px-2.5 py-1 rounded-full border border-amber-500/30">
              Admin Mode
            </span>
            <div className="flex items-center gap-2">
              <img
                src={user?.student_profile?.display_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username}`}
                alt="Admin"
                className="w-8 h-8 rounded-full border border-amber-500/50"
              />
              <span className="text-xs font-semibold text-slate-300 hidden sm:inline">
                {user?.username}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

