import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Clock,
  DollarSign,
  Gift,
  ArrowRightLeft,
  ShieldCheck,
  User,
  MessageSquare,
  AlertTriangle,
  ChevronLeft,
  Share2,
  CheckCircle,
  X,
  Edit,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StatusBadge from '../components/StatusBadge';
import RatingStars from '../components/RatingStars';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function MaterialDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [meetupLocation, setMeetupLocation] = useState('');
  const [borrowDays, setBorrowDays] = useState(14);
  const [offeredMaterialId, setOfferedMaterialId] = useState('');
  const [offeredMaterialDesc, setOfferedMaterialDesc] = useState('');
  const [myOwnMaterials, setMyOwnMaterials] = useState([]);

  // Report Form state
  const [reportReason, setReportReason] = useState('Inappropriate content');
  const [reportDetails, setReportDetails] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/marketplace/listings/${id}/`);
        setListing(res.data);
      } catch (err) {
        setError('Listing could not be found or has been removed.');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  // Load user's own materials if exchange is proposed
  useEffect(() => {
    if (isAuthenticated && listing?.listing_type === 'EXCHANGE') {
      const fetchMyMaterials = async () => {
        try {
          const res = await api.get('/marketplace/listings/my/');
          const items = res.data.results || res.data;
          setMyOwnMaterials(items.map((it) => it.material));
        } catch (e) {
          console.error(e);
        }
      };
      fetchMyMaterials();
    }
  }, [isAuthenticated, listing]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto px-4 py-20 text-center">
          <AlertTriangle size={48} className="text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800">{error || 'Item not found'}</h2>
          <Link
            to="/marketplace"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
          >
            <ChevronLeft size={16} />
            Back to Marketplace
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const { material } = listing;
  const owner = listing.owner;
  const isOwner = user?.id === owner?.id;

  const handleTransactionRequest = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const reqTypeMap = {
        SALE: 'BUY',
        LEND: 'BORROW',
        DONATION: 'DONATION',
        EXCHANGE: 'EXCHANGE',
      };

      const payload = {
        listing: listing.id,
        request_type: reqTypeMap[listing.listing_type],
        message: requestMessage,
        meetup_location: meetupLocation,
        offered_material: offeredMaterialId || null,
        offered_material_description: offeredMaterialDesc,
      };

      await api.post('/transactions/requests/create/', payload);

      setActionSuccess('Your request has been successfully submitted to the student owner!');
      setShowRequestModal(false);
      setRequestMessage('');
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Failed to submit request.';
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await api.post('/marketplace/reports/', {
        reported_listing: listing.id,
        reported_user: owner.id,
        reason: reportReason,
        details: reportDetails,
      });
      setShowReportModal(false);
      setActionSuccess('Report submitted to system moderators. Thank you for keeping our campus exchange safe.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link to="/" className="hover:text-brand-700">Home</Link>
          <span>/</span>
          <Link to="/marketplace" className="hover:text-brand-700">Marketplace</Link>
          <span>/</span>
          <span className="text-slate-800 font-medium truncate max-w-xs">{material.title}</span>
        </div>

        {/* Success Alert Banner */}
        {actionSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle size={16} className="text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess('')}><X size={15} /></button>
          </div>
        )}

        {/* Error Alert Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle size={16} className="text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')}><X size={15} /></button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Product Image Gallery */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm aspect-4/3">
              <img
                src={material.primary_image_url}
                alt={material.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <StatusBadge status={listing.status} size="lg" />
              </div>
            </div>

            {/* Safety Notice Box */}
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 flex items-start gap-3">
              <ShieldCheck size={18} className="text-brand-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Campus Safe Exchange Policy</span>
                <span className="text-blue-800/80">
                  Always meet in populated campus areas (such as university libraries or student unions) during daylight hours.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Listing Details & Actions */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Category & Subject Tag */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-md text-xs font-bold uppercase bg-brand-50 text-brand-700 border border-brand-200">
                  {material.subject_code}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {material.category_name}
                </span>
                <span className="text-slate-300">•</span>
                <StatusBadge status={material.condition} size="sm" />
              </div>

              {/* Title & Author */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {material.title}
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  By <span className="font-semibold text-slate-800">{material.author}</span>
                  {material.edition && ` • ${material.edition}`}
                  {material.publication_year && ` (${material.publication_year})`}
                </p>
                <p className="text-xs text-brand-700 font-medium mt-1">
                  Course: {material.course_name}
                </p>
              </div>

              {/* Pricing & Terms Box */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                      Exchange Agreement
                    </span>
                    <div className="mt-1 flex items-baseline gap-2">
                      {listing.listing_type === 'SALE' && (
                        <>
                          <span className="text-3xl font-black text-slate-900">
                            ${Number(listing.price).toFixed(2)}
                          </span>
                          <span className="text-xs text-slate-500">one-time payment</span>
                        </>
                      )}
                      {listing.listing_type === 'LEND' && (
                        <div>
                          <span className="text-2xl font-black text-brand-700">
                            Free Lending
                          </span>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Allowed window: <span className="font-bold text-slate-800">{listing.lending_period_days} Days</span>
                            {Number(listing.lending_deposit) > 0 && ` • $${Number(listing.lending_deposit).toFixed(2)} refundable deposit`}
                          </p>
                        </div>
                      )}
                      {listing.listing_type === 'DONATION' && (
                        <span className="text-2xl font-black text-amber-600">
                          100% Free Academic Donation
                        </span>
                      )}
                      {listing.listing_type === 'EXCHANGE' && (
                        <div>
                          <span className="text-xl font-black text-indigo-700">
                            Book-for-Book Trade
                          </span>
                          <p className="text-xs text-slate-600 mt-1">
                            Owner looking for: <span className="font-semibold text-slate-900">{listing.exchange_preferences || 'Open to relevant course materials'}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <StatusBadge status={listing.listing_type} size="md" />
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Material Description & Notes
                </h3>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-white p-4 rounded-xl border border-slate-200/80">
                  {material.description}
                </p>
              </div>

              {/* Material Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-400 block">Condition</span>
                  <span className="font-semibold text-slate-800">{listing.condition_display}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-400 block">ISBN</span>
                  <span className="font-semibold text-slate-800">{material.isbn || 'N/A'}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-400 block">Subject Code</span>
                  <span className="font-semibold text-slate-800">{material.subject_code}</span>
                </div>
              </div>

              {/* Owner / Student Profile Card */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={owner.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${owner.username}`}
                    alt={owner.full_name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{owner.full_name || owner.username}</h4>
                    <p className="text-xs text-slate-500">{owner.degree_program} • {owner.university}</p>
                    <div className="mt-1">
                      <RatingStars rating={owner.average_rating || 5} totalCount={owner.total_reviews_count} />
                    </div>
                  </div>
                </div>

                {!isOwner && (
                  <Link
                    to={`/student/messages?user=${owner.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-brand-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                  >
                    <MessageSquare size={14} />
                    <span className="hidden sm:inline">Message Student</span>
                  </Link>
                )}
              </div>

            </div>

            {/* Bottom Actions CTA */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
              {isOwner ? (
                <div className="flex items-center gap-3 w-full">
                  <Link
                    to={`/student/listings/edit/${listing.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    <Edit size={16} />
                    <span>Edit This Listing</span>
                  </Link>
                  <Link
                    to="/student/listings"
                    className="py-3 px-4 bg-white border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50"
                  >
                    Manage My Listings
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 flex-1">
                    {listing.status === 'AVAILABLE' ? (
                      <button
                        onClick={() => setShowRequestModal(true)}
                        className="flex-1 py-3 px-6 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-brand-500/20 transition-all text-center"
                      >
                        {listing.listing_type === 'SALE' && 'Request to Purchase'}
                        {listing.listing_type === 'LEND' && 'Request to Borrow'}
                        {listing.listing_type === 'DONATION' && 'Claim Free Donation'}
                        {listing.listing_type === 'EXCHANGE' && 'Propose Book Exchange'}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex-1 py-3 px-6 rounded-xl bg-slate-200 text-slate-500 font-bold text-xs uppercase cursor-not-allowed"
                      >
                        Item Currently {listing.status_display}
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => setShowReportModal(true)}
                    className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Report Listing"
                  >
                    <AlertTriangle size={18} />
                  </button>
                </>
              )}
            </div>

          </div>

        </div>
      </main>

      {/* Request Transaction Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowRequestModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {listing.listing_type === 'SALE' && 'Purchase Request'}
                {listing.listing_type === 'LEND' && 'Borrowing Request'}
                {listing.listing_type === 'DONATION' && 'Claim Donation'}
                {listing.listing_type === 'EXCHANGE' && 'Propose Exchange'}
              </h3>
              <button onClick={() => setShowRequestModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTransactionRequest} className="mt-4 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="font-semibold text-slate-800">{material.title}</span>
                <p className="text-slate-500 mt-0.5">Offered by {owner.full_name || owner.username}</p>
              </div>

              {/* If Exchange: Pick offered material or describe */}
              {listing.listing_type === 'EXCHANGE' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Your Material to Swap (Optional)
                  </label>
                  <select
                    value={offeredMaterialId}
                    onChange={(e) => setOfferedMaterialId(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="">-- Or describe below --</option>
                    {myOwnMaterials.map((mat) => (
                      <option key={mat.id} value={mat.id}>
                        {mat.title} ({mat.subject_code})
                      </option>
                    ))}
                  </select>

                  <div className="mt-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Exchange Trade Details / What you offer
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Offering my Calculus 2 book and Physics 1 reviewer in exchange..."
                      value={offeredMaterialDesc}
                      onChange={(e) => setOfferedMaterialDesc(e.target.value)}
                      className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>
              )}

              {/* Meetup location */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Proposed Meetup Spot on Campus
                </label>
                <input
                  type="text"
                  placeholder="e.g. Main Library 1st Floor, College Canteen, Student Lounge"
                  value={meetupLocation}
                  onChange={(e) => setMeetupLocation(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                  required
                />
              </div>

              {/* Note / Message */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message to Owner
                </label>
                <textarea
                  rows={3}
                  placeholder="Hi! I would like to request this item. My schedule is free Mondays and Wednesdays afternoon..."
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                  required
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 text-xs font-semibold text-white bg-brand-700 hover:bg-brand-800 rounded-xl shadow-xs"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowReportModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 z-10">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="text-rose-500" size={18} />
              <span>Report Academic Material</span>
            </h3>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg"
                >
                  <option value="Inappropriate content">Inappropriate / Unrelated content</option>
                  <option value="Incorrect or misleading details">Incorrect or misleading book details</option>
                  <option value="Counterfeit or pirated material">Prohibited or pirated edition</option>
                  <option value="Suspicious student behavior">Unresponsive or suspicious user</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Details for Moderators</label>
                <textarea
                  rows={3}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Please specify why this material violates academic marketplace rules..."
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 py-2 text-xs font-semibold bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

