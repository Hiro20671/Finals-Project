import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BookOpen, ChevronLeft, AlertCircle } from 'lucide-react';
import api from '../../api/client';

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    subject_code: '',
    course_name: '',
    edition: '',
    description: '',
    condition: 'GOOD',
    listing_type: 'SALE',
    price: '0.00',
    lending_period_days: 14,
    lending_deposit: '0.00',
    exchange_preferences: '',
    status: 'AVAILABLE',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, listingRes] = await Promise.all([
          api.get('/marketplace/categories/'),
          api.get(`/marketplace/listings/${id}/`),
        ]);

        setCategories(catsRes.data.results || catsRes.data || []);
        const l = listingRes.data;
        setFormData({
          title: l.material.title,
          author: l.material.author,
          category: l.material.category || '',
          subject_code: l.material.subject_code,
          course_name: l.material.course_name,
          edition: l.material.edition || '',
          description: l.material.description,
          condition: l.material.condition,
          listing_type: l.listing_type,
          price: l.price,
          lending_period_days: l.lending_period_days,
          lending_deposit: l.lending_deposit,
          exchange_preferences: l.exchange_preferences || '',
          status: l.status,
        });
      } catch (err) {
        setError('Failed to load listing for editing.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.patch(`/marketplace/listings/${id}/`, formData);
      navigate('/student/listings');
    } catch (err) {
      setError('Failed to update listing.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-slate-400">Loading listing details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
        <Link to="/student/listings" className="text-slate-400 hover:text-slate-600">
          <ChevronLeft size={16} />
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Edit Listing</h1>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2.5 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Author</label>
            <input
              type="text"
              name="author"
              required
              value={formData.author}
              onChange={handleChange}
              className="w-full p-2.5 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Code</label>
            <input
              type="text"
              name="subject_code"
              required
              value={formData.subject_code}
              onChange={handleChange}
              className="w-full p-2.5 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Condition</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full p-2.5 text-xs border border-slate-200 rounded-xl"
            >
              <option value="NEW">Brand New / Pristine</option>
              <option value="GOOD">Good Condition</option>
              <option value="FAIR">Fair Condition</option>
              <option value="USED">Heavily Used</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Listing Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2.5 text-xs border border-slate-200 rounded-xl"
            >
              <option value="AVAILABLE">Available</option>
              <option value="PENDING">Pending Transaction</option>
              <option value="BORROWED">Currently Borrowed</option>
              <option value="SOLD">Sold</option>
              <option value="DONATED">Donated</option>
              <option value="EXCHANGED">Exchanged</option>
              <option value="UNAVAILABLE">Unavailable / Reserved</option>
            </select>
          </div>

          {formData.listing_type === 'SALE' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Selling Price ($)</label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl"
              />
            </div>
          )}

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2.5 text-xs border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
          <Link
            to="/student/listings"
            className="px-4 py-2 text-xs font-semibold bg-slate-100 rounded-xl"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 rounded-xl shadow-xs"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

