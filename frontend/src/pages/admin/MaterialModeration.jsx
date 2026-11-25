import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';

export default function MaterialModeration() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchListings = async () => {
    try {
      setLoading(true);
      const url = filter === 'ALL'
        ? '/marketplace/admin/listings/'
        : `/marketplace/admin/listings/?approval_status=${filter}`;
      const res = await api.get(url);
      setListings(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [filter]);

  const handleAction = async (id, action) => {
    let reason = '';
    if (action === 'REJECT') {
      reason = prompt('Enter rejection remark for student:') || 'Violates academic exchange guidelines';
    } else if (action === 'REMOVE') {
      if (!window.confirm('Permanently delete this listing from database?')) return;
    }

    try {
      await api.post(`/marketplace/admin/listings/${id}/action/`, {
        action,
        reason,
      });
      setActionSuccess(`Listing ${action.toLowerCase()}ed.`);
      fetchListings();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Academic Material Moderation
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review student uploads, approve verified course materials, and remove inappropriate listings.
        </p>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl">
          {actionSuccess}
        </div>
      )}

      {/* Filter Chips */}
      <div className="flex gap-2 text-xs">
        {['ALL', 'APPROVED', 'PENDING', 'REJECTED'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              filter === f
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {f} Listings
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading listings for moderation...</div>
      ) : listings.length === 0 ? (
        <div className="p-12 text-center bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400">
          No listings under this moderation filter.
        </div>
      ) : (
        <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Material</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Approval</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {listings.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-900/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={l.material.primary_image_url}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-white block line-clamp-1">{l.material.title}</span>
                          <span className="text-[10px] text-slate-400">{l.material.author}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-300">
                      {l.material.subject_code}
                    </td>

                    <td className="py-3 px-4 text-slate-400">
                      {l.owner?.full_name || l.owner?.username}
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={l.listing_type} size="sm" />
                    </td>

                    <td className="py-3 px-4 font-bold text-white">
                      ${Number(l.price).toFixed(2)}
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={l.status} size="sm" />
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          l.approval_status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : l.approval_status === 'REJECTED'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {l.approval_status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {l.approval_status !== 'APPROVED' && (
                          <button
                            onClick={() => handleAction(l.id, 'APPROVE')}
                            className="p-1.5 text-emerald-400 hover:bg-emerald-500/20 rounded-lg"
                            title="Approve Listing"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}

                        {l.approval_status !== 'REJECTED' && (
                          <button
                            onClick={() => handleAction(l.id, 'REJECT')}
                            className="p-1.5 text-amber-400 hover:bg-amber-500/20 rounded-lg"
                            title="Reject Listing"
                          >
                            <XCircle size={16} />
                          </button>
                        )}

                        <button
                          onClick={() => handleAction(l.id, 'REMOVE')}
                          className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg"
                          title="Permanently Remove"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

