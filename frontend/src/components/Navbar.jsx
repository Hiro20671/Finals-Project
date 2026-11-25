import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Bell,
  MessageSquare,
  User,
  LogOut,
  LayoutDashboard,
  Shield,
  Menu,
  X,
  PlusCircle,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close popups on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-900 via-brand-700 to-blue-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <BookOpen size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-brand-700 transition-colors">
                Acad<span className="text-brand-600">ex</span>
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                Academic Exchange
              </span>
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search by title, subject (e.g. CS101), author, or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
            />
            <Search className="absolute left-3.5 top-2.5 text-slate-400" size={17} />
          </form>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/marketplace" className="hover:text-brand-700 transition-colors">
              Marketplace
            </Link>
            <Link to="/#categories" className="hover:text-brand-700 transition-colors">
              Categories
            </Link>
            <Link to="/#how-it-works" className="hover:text-brand-700 transition-colors">
              How It Works
            </Link>
          </nav>

          {/* Right Action Icons & User Account */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {isAuthenticated ? (
              <>
                {/* Quick Add Listing CTA (for Students) */}
                {!isAdmin && (
                  <Link
                    to="/student/listings/create"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-brand-700 hover:bg-brand-800 text-white shadow-xs transition-colors"
                  >
                    <PlusCircle size={15} />
                    <span>Post Material</span>
                  </Link>
                )}

                {/* Direct Messages Shortcut */}
                <Link
                  to="/student/messages"
                  title="Messages"
                  className="p-2 text-slate-600 hover:text-brand-700 hover:bg-slate-100 rounded-full transition-colors relative"
                >
                  <MessageSquare size={19} />
                </Link>

                {/* Notifications Bell Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-slate-600 hover:text-brand-700 hover:bg-slate-100 rounded-full transition-colors relative"
                    title="Notifications"
                  >
                    <Bell size={19} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-800">Notifications</h4>
                          {unreadCount > 0 && (
                            <span className="text-xs bg-brand-100 text-brand-800 font-semibold px-2 py-0.5 rounded-full">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => markAsRead()}
                            className="text-xs text-brand-600 hover:text-brand-800 font-medium flex items-center gap-1"
                          >
                            <CheckCircle size={13} />
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.slice(0, 8).map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => {
                                markAsRead(notif.id);
                                if (notif.action_url) navigate(notif.action_url);
                                setShowNotifications(false);
                              }}
                              className={`p-3.5 text-left text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                                !notif.is_read ? 'bg-blue-50/50' : ''
                              }`}
                            >
                              <p className="font-semibold text-slate-900">{notif.title}</p>
                              <p className="text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(notif.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Avatar Menu Dropdown */}
                <div className="relative" ref={userRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-brand-500/20 transition-all focus:outline-none"
                  >
                    <img
                      src={user?.student_profile?.display_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username}`}
                      alt={user?.username}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                  </button>

                  {/* User Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
                        </p>
                        <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-brand-50 text-brand-700">
                          {isAdmin ? 'Administrator' : user?.student_profile?.degree_program || 'Student'}
                        </span>
                      </div>

                      {isAdmin ? (
                        <>
                          <Link
                            to="/admin"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <Shield size={16} className="text-brand-600" />
                            Admin Dashboard
                          </Link>
                          <Link
                            to="/admin/moderation"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <BookOpen size={16} className="text-slate-500" />
                            Listing Moderation
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/student/dashboard"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <LayoutDashboard size={16} className="text-brand-600" />
                            Student Dashboard
                          </Link>
                          <Link
                            to="/student/listings"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <BookOpen size={16} className="text-slate-500" />
                            My Listings
                          </Link>
                          <Link
                            to="/student/profile"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <User size={16} className="text-slate-500" />
                            My Profile & Reviews
                          </Link>
                        </>
                      )}

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-brand-700 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-brand-700 hover:bg-brand-800 text-white shadow-xs transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-100 flex flex-col gap-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
              <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
            </form>
            <Link
              to="/marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-700 py-1"
            >
              Marketplace
            </Link>
            <Link
              to="/#categories"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-700 py-1"
            >
              Categories
            </Link>
            {isAuthenticated ? (
              <Link
                to={isAdmin ? '/admin' : '/student/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-brand-700 py-1"
              >
                Go to {isAdmin ? 'Admin Portal' : 'Student Dashboard'}
              </Link>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-semibold border border-slate-200 rounded-lg"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-semibold bg-brand-700 text-white rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

