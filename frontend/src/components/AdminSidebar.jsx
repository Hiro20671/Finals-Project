import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  LayoutDashboard,
  CheckSquare,
  Users,
  Tags,
  Flag,
  Compass,
  LogOut,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminSidebar({ onCloseMobile }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Listing Moderation', path: '/admin/moderation', icon: CheckSquare },
    { name: 'Student Users', path: '/admin/users', icon: Users },
    { name: 'Categories & Subjects', path: '/admin/categories', icon: Tags },
    { name: 'Reports & Safety', path: '/admin/reports', icon: Flag },
    { name: 'Public Marketplace', path: '/marketplace', icon: Compass },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col h-full border-r border-slate-800">
      {/* Admin Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-rose-600 flex items-center justify-center text-white shadow-md">
          <Shield size={20} />
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-white tracking-wide">
            ADMIN PORTAL
          </h4>
          <p className="text-[10px] text-slate-400 font-medium">
            System Administration
          </p>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 font-semibold border-l-2 border-amber-500'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`
              }
            >
              <Icon size={16} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Sign Out */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          <span>Exit Admin Portal</span>
        </button>
      </div>
    </aside>
  );
}

