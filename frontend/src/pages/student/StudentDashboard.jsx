import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  DollarSign,
  Clock,
  ShoppingBag,
  CheckCircle,
  Gift,
  ArrowRightLeft,
  AlertCircle,
  PlusCircle,
  MessageSquare,
  ChevronRight,
  Bell,
  Calendar,
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activeBorrowings, setActiveBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, borrowRes] = await Promise.all([
          api.get('/dashboard/student/'),
          api.get('/transactions/borrowings/?role=borrower&status=ACTIVE'),
        ]);

        setStats(statsRes.data);
        setActiveBorrowings(borrowRes.data.results || borrowRes.data || []);
      } catch (err) {
        console.error('Error fetching student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-400">Loading student dashboard...</p>
      </div>
    );
  }

  const metricCards = [
    {
      title: 'Active Listings',
      count: stats?.active_listings_count || 0,
      icon: BookOpen,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      link: '/student/listings',
    },
    {
      title: 'Items For Sale',
      count: stats?.my_selling_listings || 0,
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      link: '/student/listings?listing_type=SALE',
    },
    {
      title: 'Borrowing Requests',
      count: stats?.my_borrowing_requests || 0,
      icon: Clock,
      color: 'bg-sky-50 text-sky-700 border-sky-200',
      link: '/student/borrowing',
    },
    {
      title: 'Lending Requests',
      count: stats?.my_lending_requests || 0,
      icon: BookOpen,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      link: '/student/borrowing?tab=incoming',
    },
    {
      title: 'Purchase Requests',
      count: stats?.my_purchase_requests || 0,
      icon: ShoppingBag,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      link: '/student/selling',
    },
    {
      title: 'Completed Exchanges',
      count: stats?.my_completed_transactions || 0,
      icon: CheckCircle,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      link: '/student/history',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-900 to-blue-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div>
          <span className="text-xs font-semibold text-brand-300 uppercase tracking-widest block mb-1">
            Student Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {user?.first_name || user?.username}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            {user?.student_profile?.degree_program} • {user?.student_profile?.year_level} ({user?.student_profile?.university})
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/student/listings/create"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-500 hover:bg-brand-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
          >
            <PlusCircle size={15} />
            <span>Post Material</span>
          </Link>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
          >
            <span>Browse Catalog</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metricCards.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.title}
              to={m.link}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-brand-400 shadow-xs hover:shadow-sm transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 line-clamp-1">
                  {m.title}
                </span>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${m.color}`}>
                  <Icon size={14} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-900 group-hover:text-brand-700 transition-colors">
                  {m.count}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two Column Layout: Active Borrowings & Recent Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Active Books in Possession */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-brand-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Books Currently in Your Hand
              </h2>
            </div>
            <Link
              to="/student/borrowing"
              className="text-xs font-semibold text-brand-600 hover:text-brand-800"
            >
              View All
            </Link>
          </div>

          {activeBorrowings.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <BookOpen size={36} className="mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-medium text-slate-600">You have no active borrowed books.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Need a textbook for midterms? Check out the marketplace!</p>
              <Link
                to="/marketplace?listing_type=LEND"
                className="mt-3 inline-block px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Browse Books for Lending
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeBorrowings.map((rec) => {
                const isOverdue = rec.is_overdue;
                const dueDate = new Date(rec.expected_return_date);
                const daysLeft = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));

                return (
                  <div
                    key={rec.id}
                    className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                      isOverdue
                        ? 'bg-rose-50/60 border-rose-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{rec.listing_title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Lender: <span className="font-semibold text-slate-700">{rec.lender_name || rec.lender_username}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-[11px]">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar size={12} />
                          Return by: {dueDate.toLocaleDateString()}
                        </span>
                        {isOverdue ? (
                          <span className="font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded">
                            OVERDUE! Return to student ASAP
                          </span>
                        ) : (
                          <span className="font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                            {daysLeft} days remaining
                          </span>
                        )}
                      </div>
                    </div>

                    <Link
                      to={`/student/messages?user=${rec.lender}`}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg shrink-0"
                    >
                      Contact Lender
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Notifications Feed */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900">
                Recent Platform Alerts
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">Activity stream</span>
          </div>

          <div className="space-y-3">
            {stats?.recent_notifications?.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No recent alerts.</p>
            ) : (
              stats?.recent_notifications?.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-xl text-xs border ${
                    !n.is_read ? 'bg-blue-50/70 border-blue-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <p className="font-bold text-slate-900">{n.title}</p>
                  <p className="text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

