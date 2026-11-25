import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  CheckSquare,
  Clock,
  ShoppingBag,
  Flag,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get('/dashboard/admin/');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-400">Loading system metrics and analytics...</p>
      </div>
    );
  }

  const overview = data?.overview || {};
  const charts = data?.charts || {};
  const activities = data?.recent_activities || [];

  // Metric cards
  const statsList = [
    { title: 'Registered Students', value: overview.total_students || 0, icon: Users, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
    { title: 'Academic Materials', value: overview.total_materials || 0, icon: BookOpen, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { title: 'Active Listings', value: overview.active_listings || 0, icon: Layers, color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' },
    { title: 'Pending Moderations', value: overview.pending_approvals || 0, icon: CheckSquare, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { title: 'Borrowing Records', value: overview.total_borrowing_transactions || 0, icon: Clock, color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
    { title: 'Completed Transactions', value: overview.total_completed_transactions || 0, icon: ShoppingBag, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
    { title: 'Reported Flags', value: overview.reported_listings || 0, icon: Flag, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  ];

  // Chart 1: Monthly Registrations (Bar)
  const regMonths = charts.monthly_registrations || [];
  const barChartData = {
    labels: regMonths.map((m) => m.month),
    datasets: [
      {
        label: 'New Student Registrations',
        data: regMonths.map((m) => m.count),
        backgroundColor: '#3b82f6',
        borderRadius: 8,
      },
    ],
  };

  // Chart 2: Popular Categories (Doughnut)
  const popCats = charts.popular_categories || [];
  const doughnutData = {
    labels: popCats.map((c) => c.name),
    datasets: [
      {
        data: popCats.map((c) => c.count),
        backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6'],
        borderWidth: 0,
      },
    ],
  };

  // Chart 3: Monthly Transactions (Line)
  const transMonths = charts.monthly_transactions || [];
  const lineChartData = {
    labels: transMonths.map((m) => m.month),
    datasets: [
      {
        label: 'Marketplace Requests & Transactions',
        data: transMonths.map((m) => m.count),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.35,
        fill: true,
      },
    ],
  };

  // Chart 4: Transaction Types (Pie)
  const typeMap = charts.type_distribution || {};
  const pieData = {
    labels: ['For Sale', 'For Lending', 'Donation', 'Exchange'],
    datasets: [
      {
        data: [
          typeMap.SALE || 0,
          typeMap.LEND || 0,
          typeMap.DONATION || 0,
          typeMap.EXCHANGE || 0,
        ],
        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#6366f1'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { size: 11 } },
      },
    },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#94a3b8', font: { size: 10 } },
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Campus Exchange Control Panel
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor marketplace circulation, approve user materials, and oversee student borrowing activity.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
        {statsList.map((st) => {
          const Icon = st.icon;
          return (
            <div
              key={st.title}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 line-clamp-1">
                  {st.title}
                </span>
                <div className={`p-1.5 rounded-lg border ${st.color}`}>
                  <Icon size={14} />
                </div>
              </div>
              <span className="text-2xl font-black text-white mt-2">
                {st.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* 4 Interactive Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Monthly Registrations */}
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users size={15} className="text-blue-400" />
              <span>Monthly Registered Students</span>
            </h3>
          </div>
          <div className="h-64">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>

        {/* Chart 2: Popular Academic Categories */}
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={15} className="text-emerald-400" />
              <span>Most Popular Academic Categories</span>
            </h3>
          </div>
          <div className="h-64">
            <Doughnut data={doughnutData} options={pieOptions} />
          </div>
        </div>

        {/* Chart 3: Monthly Transactions */}
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp size={15} className="text-emerald-400" />
              <span>Monthly Marketplace Transactions</span>
            </h3>
          </div>
          <div className="h-64">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        {/* Chart 4: Transaction Types */}
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity size={15} className="text-amber-400" />
              <span>Distribution of Transaction Types</span>
            </h3>
          </div>
          <div className="h-64">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>

      </div>

      {/* Recent Platform Activities Feed */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock size={15} className="text-amber-400" />
            <span>Recent Platform Activities & Exchanges</span>
          </h3>
          <span className="text-[11px] text-slate-400">Live transaction stream</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {activities.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No transactions recorded yet.</p>
          ) : (
            activities.map((act) => (
              <div key={act.id} className="py-3.5 flex items-center justify-between text-xs gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                  <div>
                    <span className="font-bold text-white">{act.user}</span>
                    <span className="text-slate-400 ml-1.5">{act.action}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={act.status} size="sm" />
                  <span className="text-[10px] text-slate-400">
                    {new Date(act.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

