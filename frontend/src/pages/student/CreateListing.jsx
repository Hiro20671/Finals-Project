import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  Upload,
  DollarSign,
  Clock,
  Gift,
  ArrowRightLeft,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import api from '../../api/client';

export default function CreateListing() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    subject_code: '',
    course_name: '',
    edition: '',
    publication_year: '',
    isbn: '',
    description: '',
    condition: 'GOOD',
    listing_type: 'SALE',
    price: '0.00',
    lending_period_days: 14,
    lending_deposit: '0.00',
    exchange_preferences: '',
    image_url: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/marketplace/categories/');
        setCategories(res.data.results || res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });

      if (imageFile) {
        data.append('image', imageFile);
      }

      await api.post('/marketplace/listings/create/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/student/listings');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data ? JSON.stringify(err.response.data) : 'Failed to publish listing.';
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/student/listings" className="text-slate-400 hover:text-slate-600">
              <ChevronLeft size={16} />
            </Link>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Post Academic Material
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Offer textbooks, lecture notes, or board exam reviewers to fellow students.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        
        {/* Step 1: Material Basic Info */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-700 pb-2 border-b border-slate-100 flex items-center gap-2">
            <BookOpen size={16} />
            <span>1. Academic Material Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Book / Reviewer Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Introduction to Algorithms or Practical Auditing Problems"
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Author(s) or Creator *
              </label>
              <input
                type="text"
                name="author"
                required
                value={formData.author}
                onChange={handleChange}
                placeholder="e.g. Cormen, Leiserson or Valix"
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-brand-500"
              >
                <option value="">-- Select Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject Code * (e.g. CS101, MATH53)
              </label>
              <input
                type="text"
                name="subject_code"
                required
                value={formData.subject_code}
                onChange={handleChange}
                placeholder="e.g. CS201, BIO12, ACC301"
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Course / Subject Name *
              </label>
              <input
                type="text"
                name="course_name"
                required
                value={formData.course_name}
                onChange={handleChange}
                placeholder="e.g. Data Structures and Algorithms"
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Edition (Optional)
              </label>
              <input
                type="text"
                name="edition"
                value={formData.edition}
                onChange={handleChange}
                placeholder="e.g. 4th Edition (2022)"
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Material Condition *
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-brand-500"
              >
                <option value="NEW">Brand New / Pristine</option>
                <option value="GOOD">Good Condition (Minimal Notes)</option>
                <option value="FAIR">Fair Condition (Readable, Minor Wear)</option>
                <option value="USED">Heavily Used / Highlighted</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detailed Description & Material Notes *
              </label>
              <textarea
                name="description"
                required
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe page quality, markings, binding, included solutions, or tips for buyers/borrowers..."
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Transaction Pathways */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-700 pb-2 border-b border-slate-100 flex items-center gap-2">
            <DollarSign size={16} />
            <span>2. Exchange Terms & Transaction Pathway</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { type: 'SALE', label: 'For Sale', desc: 'Sell for cash upon meetup' },
              { type: 'LEND', label: 'For Lending', desc: 'Lend temporarily for exams' },
              { type: 'DONATION', label: 'Free Donation', desc: 'Give freely to juniors' },
              { type: 'EXCHANGE', label: 'Book Exchange', desc: 'Swap for another book' },
            ].map((pathway) => (
              <label
                key={pathway.type}
                className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all ${
                  formData.listing_type === pathway.type
                    ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="listing_type"
                  value={pathway.type}
                  checked={formData.listing_type === pathway.type}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="block text-xs font-bold text-slate-900">{pathway.label}</span>
                <span className="block text-[10px] text-slate-500 mt-0.5">{pathway.desc}</span>
              </label>
            ))}
          </div>

          {/* Conditional Fields based on listing type */}
          {formData.listing_type === 'SALE' && (
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200">
              <label className="block text-xs font-semibold text-emerald-900 mb-1">
                Selling Price ($ USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.50"
                name="price"
                required
                value={formData.price}
                onChange={handleChange}
                placeholder="15.00"
                className="w-full sm:w-48 p-2.5 text-xs bg-white border border-emerald-300 rounded-xl focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          )}

          {formData.listing_type === 'LEND' && (
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-blue-900 mb-1">
                  Allowed Borrowing Duration (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  name="lending_period_days"
                  value={formData.lending_period_days}
                  onChange={handleChange}
                  className="w-full p-2.5 text-xs bg-white border border-blue-300 rounded-xl focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-blue-900 mb-1">
                  Refundable Security Deposit ($ Optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.00"
                  name="lending_deposit"
                  value={formData.lending_deposit}
                  onChange={handleChange}
                  className="w-full p-2.5 text-xs bg-white border border-blue-300 rounded-xl focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {formData.listing_type === 'EXCHANGE' && (
            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-200">
              <label className="block text-xs font-semibold text-indigo-900 mb-1">
                What books or subjects are you looking to receive in trade?
              </label>
              <input
                type="text"
                name="exchange_preferences"
                value={formData.exchange_preferences}
                onChange={handleChange}
                placeholder="e.g. Looking for Integral Calculus or Physics 2 reviewer"
                className="w-full p-2.5 text-xs bg-white border border-indigo-300 rounded-xl focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Step 3: Material Image */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-700 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Upload size={16} />
            <span>3. Product Image</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Upload Actual Book Photo (JPG/PNG)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
              />

              <div className="mt-3">
                <span className="text-[11px] text-slate-400 block mb-1">Or provide Image URL:</span>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full p-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-200 rounded-2xl h-44 bg-slate-50">
              {previewUrl || formData.image_url ? (
                <img
                  src={previewUrl || formData.image_url}
                  alt="Preview"
                  className="max-h-full max-w-full object-contain rounded-lg shadow-xs"
                />
              ) : (
                <div className="text-center text-slate-400 text-xs">
                  <Upload size={24} className="mx-auto mb-1 text-slate-300" />
                  <span>Image preview will appear here</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link
            to="/student/listings"
            className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all"
          >
            {submitting ? 'Publishing Material...' : 'Publish Listing'}
          </button>
        </div>

      </form>
    </div>
  );
}

