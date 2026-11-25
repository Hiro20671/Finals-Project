import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  BookOpen,
  Filter,
} from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';

export default function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionMessage, setActionMessage] = useState('');

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'ALL'
        ? '/marketplace/listings/my/'
        : `/marketplace/listings/my/?status=${statusFilter}`;
      const res = await api.get(url);
      setListings(res.data.results || res.data || []);
    } catch (err) {
      console.error('Failed to load my listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, [statusFilter]);

  const toggleAvailability = async (listing) => {
    const nextStatus = listing.status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
    try {
      await api.patch(`/marketplace/listings/${listing.id}/`, {
        status: nextStatus,
      });
      setActionMessage(`Listing status marked as ${nextStatus}.`);
      fetchMyListings();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this listing?')) return;
    try {
      await api.delete(`/marketplace/listings/${id}/`);
      setActionMessage('Listing deleted successfully.');
      setListings((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Failed to delete listing:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            My Posted Materials
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your books, reviewers, status availability, and pricing.
          </p>
        </div>

        <Link
          to="/student/listings/create"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs transition-colors shrink-0"
        >
          <PlusCircle size={16} />
          <span>Post New Material</span>
        </Link>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')} className="text-emerald-600 font-bold">×</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        {['ALL', 'AVAILABLE', 'BORROWED', 'PENDING', 'SOLD', 'DONATED', 'EXCHANGED', 'UNAVAILABLE'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
              statusFilter === s
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {s === 'ALL' ? 'All Listings' : s}
          </button>
        ))}
      </div>

      {/* Table / Cards */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-400">Loading your materials...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <BookOpen size={40} className="text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No materials listed under this filter.</h3>
          <p className="text-xs text-slate-500 mt-1">Ready to share a book or reviewer?</p>
          <Link
            to="/student/listings/create"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-brand-700 text-white text-xs font-semibold rounded-lg"
          >
            <PlusCircle size={14} />
            Add First Listing
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Material</th>
                  <th className="py-3.5 px-4">Subject & Type</th>
                  <th className="py-3.5 px-4">Price / Terms</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Approval</th>
                  <th className="py-3.5 px-4">Views</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Material info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.material.primary_image_url}
                          alt={item.material.title}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <Link
                            to={`/materials/${item.id}`}
                            className="font-bold text-slate-900 hover:text-brand-700 line-clamp-1"
                          >
                            {item.material.title}
                          </Link>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {item.material.author}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Subject & Type */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700 block">
                        {item.material.subject_code}
                      </span>
                      <StatusBadge status={item.listing_type} size="sm" />
                    </td>

                    {/* Price / Terms */}
                    <td className="py-3.5 px-4">
                      {item.listing_type === 'SALE' && (
                        <span className="font-bold text-slate-900">
                          ${Number(item.price).toFixed(2)}
                        </span>
                      )}
                      {item.listing_type === 'LEND' && (
                        <span className="font-medium text-blue-700">
                          {item.lending_period_days} Days Max
                        </span>
                      )}
                      {item.listing_type === 'DONATION' && (
                        <span className="font-bold text-amber-600">Free</span>
                      )}
                      {item.listing_type === 'EXCHANGE' && (
                        <span className="font-semibold text-indigo-700">Swap</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.status} size="sm" />
                    </td>

                    {/* Approval */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.approval_status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.approval_status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {item.approval_status}
                      </span>
                    </td>

                    {/* Views */}
                    <td className="py-3.5 px-4 font-medium text-slate-500">
                      {item.views_count}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Toggle Availability */}
                        <button
                          onClick={() => toggleAvailability(item)}
                          className={`p-1.5 rounded-lg border text-xs ${
                            item.status === 'AVAILABLE'
                              ? 'text-amber-700 border-amber-200 bg-amber-50 hover:bg-amber-100'
                              : 'text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                          }`}
                          title={item.status === 'AVAILABLE' ? 'Mark as Unavailable / Reserved' : 'Mark as Available'}
                        >
                          {item.status === 'AVAILABLE' ? <XCircle size={15} /> : <CheckCircle size={15} />}
                        </button>

                        {/* Edit */}
                        <Link
                          to={`/student/listings/edit/${item.id}`}
                          className="p-1.5 text-slate-600 hover:text-brand-700 hover:bg-slate-100 rounded-lg border border-slate-200"
                          title="Edit Listing"
                        >
                          <Edit size={15} />
                        </Link>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteListing(item.id)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg border border-rose-200"
                          title="Delete Listing"
                        >
                          <Trash2 size={15} />
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

