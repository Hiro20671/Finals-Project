import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Star,
  CheckCircle,
  MessageSquare,
  X,
  AlertCircle,
} from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import RatingStars from '../../components/RatingStars';
import { useAuth } from '../../context/AuthContext';

export default function TransactionHistory() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');

  // Review Modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transactions/requests/?status=COMPLETED');
      setTransactions(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const openReviewModal = (tx) => {
    setSelectedTx(tx);
    setRatingValue(5);
    setReviewComment('');
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTx) return;

    setSubmittingReview(true);
    try {
      const reviewedUser = selectedTx.owner === user?.id ? selectedTx.requester : selectedTx.owner;

      await api.post('/marketplace/reviews/', {
        transaction_request: selectedTx.id,
        reviewed_user: reviewedUser,
        rating: ratingValue,
        comment: reviewComment,
      });

      setActionSuccess('Rating & Feedback published to student profile!');
      setReviewModalOpen(false);
      fetchHistory();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Transaction History & Ratings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review all your completed campus book purchases, borrowings, donations, and trades.
        </p>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess('')}><X size={15} /></button>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-400">Loading history...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <History size={36} className="text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No completed transactions yet.</h3>
          <p className="text-xs text-slate-500 mt-1">
            Once you finalize a purchase, return a borrowed book, or complete an exchange, it will show here!
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100 text-xs">
            {transactions.map((tx) => {
              const otherPersonName = tx.owner === user?.id ? (tx.requester_name || tx.requester_username) : (tx.owner_name || tx.owner_username);
              const otherPersonId = tx.owner === user?.id ? tx.requester : tx.owner;

              return (
                <div key={tx.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status="COMPLETED" size="sm" />
                      <StatusBadge status={tx.request_type} size="sm" />
                      <h4 className="font-bold text-slate-900 text-sm">
                        {tx.listing_details?.material?.title}
                      </h4>
                    </div>

                    <p className="text-slate-500">
                      Transacted with: <span className="font-semibold text-slate-800">{otherPersonName}</span>
                      {tx.agreed_price > 0 && ` • Amount: $${Number(tx.agreed_price).toFixed(2)}`}
                      {tx.completed_at && ` • Completed: ${new Date(tx.completed_at).toLocaleDateString()}`}
                    </p>

                    {tx.owner_notes && (
                      <p className="text-[11px] text-slate-400 italic">
                        Notes: "{tx.owner_notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openReviewModal(tx)}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Star size={14} className="fill-white" />
                      <span>Leave Feedback</span>
                    </button>
                    <Link
                      to={`/student/messages?user=${otherPersonId}`}
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                      title="Send Message"
                    >
                      <MessageSquare size={16} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Leave Feedback Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setReviewModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-xl max-w-md w-full p-6 z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Rate & Review Transaction
              </h3>
              <button onClick={() => setReviewModalOpen(false)}><X size={16} /></button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-2">
                  Overall Experience Rating
                </label>
                <div className="flex items-center justify-center p-3 bg-amber-50/50 rounded-2xl border border-amber-200">
                  <RatingStars
                    rating={ratingValue}
                    size={26}
                    interactive={true}
                    onRate={(val) => setRatingValue(val)}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Written Feedback
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="How was the condition of the material? Was the student punctual and responsive during campus meetup?..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-xl shadow-xs"
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

