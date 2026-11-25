import React, { useState, useEffect } from 'react';
import { Flag, CheckCircle, Clock, AlertTriangle, MessageSquare } from 'lucide-react';
import api from '../../api/client';

export default function ReportsManagement() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const url = filter === 'ALL' ? '/marketplace/admin/reports/' : `/marketplace/admin/reports/?status=${filter}`;
      const res = await api.get(url);
      setReports(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const handleResolve = async (id, status) => {
    const adminNotes = prompt('Add administrator resolution notes:') || 'Resolved by admin';
    try {
      await api.post(`/marketplace/admin/reports/${id}/resolve/`, {
        status,
        admin_notes: adminNotes,
      });
      setActionSuccess(`Report marked as ${status}.`);
      fetchReports();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Safety & Report Moderation
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review community reports regarding inaccurate material descriptions or student conduct.
        </p>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl">
          {actionSuccess}
        </div>
      )}

      {/* Status filters */}
      <div className="flex gap-2 text-xs">
        {['ALL', 'PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              filter === st
                ? 'bg-rose-500 text-white'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="p-12 text-center bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400">
          No reports found under this filter. Campus marketplace is healthy!
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="p-5 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    rep.status === 'PENDING'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : rep.status === 'RESOLVED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {rep.status}
                  </span>
                  <span className="font-bold text-white text-sm">{rep.reason}</span>
                </div>

                <p className="text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  "{rep.details}"
                </p>

                <p className="text-[11px] text-slate-400">
                  Reported by: <span className="text-slate-300 font-semibold">{rep.reporter_username}</span>
                  {rep.listing_title && ` • Item: ${rep.listing_title}`}
                  {` • ${new Date(rep.created_at).toLocaleDateString()}`}
                </p>

                {rep.admin_notes && (
                  <p className="text-[11px] text-amber-300">
                    Admin note: {rep.admin_notes}
                  </p>
                )}
              </div>

              {rep.status !== 'RESOLVED' && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleResolve(rep.id, 'RESOLVED')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs"
                  >
                    Resolve Report
                  </button>
                  <button
                    onClick={() => handleResolve(rep.id, 'DISMISSED')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

