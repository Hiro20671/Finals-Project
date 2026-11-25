import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  BookOpen,
  Clock,
  ShoppingBag,
  Gift,
  ArrowRightLeft,
  MessageSquare,
  History,
  User,
  Settings,
  LogOut,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function StudentSidebar({ onCloseMobile }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Marketplace', path: '/marketplace', icon: Compass },
    { name: 'My Listings', path: '/student/listings', icon: BookOpen },
    { name: 'Borrowing Requests', path: '/student/borrowing', icon: Clock },
    { name: 'Selling Requests', path: '/student/selling', icon: ShoppingBag },
    { name: 'Donations', path: '/student/donations', icon: Gift },
    { name: 'Exchanges', path: '/student/exchanges', icon: ArrowRightLeft },
    { name: 'Messages', path: '/student/messages', icon: MessageSquare },
    { name: 'Transaction History', path: '/student/history', icon: History },
    { name: 'My Profile', path: '/student/profile', icon: User },
    { name: 'Settings', path: '/student/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800">
      {/* User Mini Profile Header */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <img
            src={user?.student_profile?.display_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username}`}
            alt={user?.username}
            className="w-10 h-10 rounded-full object-cover border-2 border-brand-500/40"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-white truncate">
              {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
            </h4>
            <p className="text-[11px] text-slate-400 truncate">
              {user?.student_profile?.degree_program || 'Student'}
            </p>
          </div>
        </div>

        {/* Quick Post Button */}
        <NavLink
          to="/student/listings/create"
          onClick={onCloseMobile}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition-colors shadow-sm"
        >
          <PlusCircle size={15} />
          <span>Post New Material</span>
        </NavLink>
      </div>

      {/* Nav list */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600/20 text-brand-400 font-semibold border-l-2 border-brand-500'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Icon size={16} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Logout button at bottom */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

