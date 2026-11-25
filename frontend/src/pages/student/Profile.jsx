import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  Star,
  Mail,
  Phone,
  Building,
  Upload,
  CheckCircle,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import RatingStars from '../../components/RatingStars';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const profile = user?.student_profile || {};

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    student_id_number: profile.student_id_number || '',
    university: profile.university || '',
    college: profile.college || '',
    degree_program: profile.degree_program || '',
    year_level: profile.year_level || '1st Year',
    contact_number: profile.contact_number || '',
    bio: profile.bio || '',
  });

  const [profilePicFile, setProfilePicFile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user?.id) {
      const fetchReviews = async () => {
        try {
          const res = await api.get(`/marketplace/users/${user.id}/reviews/`);
          setReviews(res.data.results || res.data || []);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingReviews(false);
        }
      };
      fetchReviews();
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const data = new FormData();
      Object.keys(formData).forEach((k) => data.append(k, formData[k]));
      if (profilePicFile) {
        data.append('profile_picture', profilePicFile);
      }

      await api.put('/auth/me/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await refreshUser();
      setSuccessMsg('Student profile updated successfully!');
    } catch (err) {
      setErrorMsg('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group">
          <img
            src={profile.display_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username}`}
            alt="Profile Avatar"
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-md ring-2 ring-brand-500/30"
          />
          <label className="absolute bottom-0 right-0 p-2 bg-brand-700 hover:bg-brand-800 text-white rounded-full shadow-md cursor-pointer transition-colors">
            <Upload size={14} />
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => setProfilePicFile(e.target.files[0])}
            />
          </label>
        </div>

        <div className="text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                @{user?.username} • ID: {profile.student_id_number || 'Unset'}
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 py-1.5 px-3 rounded-2xl flex items-center justify-center gap-2">
              <RatingStars rating={profile.average_rating || 5} totalCount={profile.total_reviews_count || 0} size={18} />
            </div>
          </div>

          <p className="text-xs text-slate-600 mt-3 max-w-xl italic">
            "{profile.bio || 'No bio written yet. Share what subjects you love or study!'}"
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle size={15} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle size={15} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-700 pb-2 border-b border-slate-100">
          Edit Profile Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full p-2.5 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full p-2.5 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Student ID #</label>
            <input
              type="text"
              name="student_id_number"
              value={formData.student_id_number}
              onChange={handleChange}
              className="w-full p-2.5 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Year Level</label>
            <select
              name="year_level"
              value={formData.year_level}
              onChange={handleChange}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
            >
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="5th Year+">5th Year+</option>
              <option value="Graduate">Graduate</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Degree Program / Major</label>
            <input
              type="text"
              name="degree_program"
              value={formData.degree_program}
              onChange={handleChange}
              className="w-full p-2.5 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">College / Department</label>
            <input
              type="text"
              name="college"
              value={formData.college}
              onChange={handleChange}
              className="w-full p-2.5 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
            <input
              type="text"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
              className="w-full p-2.5 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">University / Campus</label>
            <input
              type="text"
              name="university"
              value={formData.university}
              onChange={handleChange}
              className="w-full p-2.5 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Bio / About Me</label>
            <textarea
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              className="w-full p-2.5 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-colors"
          >
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>

      {/* Peer Reviews on My Transactions */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Star size={16} className="text-amber-500 fill-amber-500" />
          <span>Peer Reviews & Ratings ({reviews.length})</span>
        </h3>

        {reviews.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No peer reviews received yet. Complete a book transaction to receive feedback!
          </p>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={rev.reviewer_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${rev.reviewer_name}`}
                      alt={rev.reviewer_name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200"
                    />
                    <span className="font-bold text-slate-900">{rev.reviewer_name}</span>
                  </div>
                  <RatingStars rating={rev.rating} size={14} />
                </div>
                <p className="text-slate-700 italic">"{rev.comment}"</p>
                <span className="text-[10px] text-slate-400 mt-2 block">
                  {new Date(rev.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

