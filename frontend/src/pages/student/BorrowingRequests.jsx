import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Clock,
  BookOpen,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  MessageSquare,
} from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';

export default function BorrowingRequests() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'borrowed'; // 'borrowed', 'lending', 'incoming'

  const [borrowedRecords, setBorrowedRecords] = useState([]);
  const [lendingRecords, setLendingRecords] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  // Accept modal state
  const [selectedReq, setSelectedReq] = useState(null);
  const [acceptDays, setAcceptDays] = useState(14);
  const [acceptNotes, setAcceptNotes] = useState('');
  const [acceptMeetup, setAcceptMeetup] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [borrowedRes, lendingRes, requestsRes] = await Promise.all([
        api.get('/transactions/borrowings/?role=borrower'),
        api.get('/transactions/borrowings/?role=lender'),
        api.get('/transactions/requests/?role=received&type=BORROW'),
      ]);

      setBorrowedRecords(borrowedRes.data.results || borrowedRes.data || []);
      setLendingRecords(lendingRes.data.results || lendingRes.data || []);
      setIncomingRequests(requestsRes.data.results || requestsRes.data || []);
    } catch (err) {
      console.error('Failed to load borrowing records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConfirmReturn = async (recordId) => {
    if (!window.confirm('Confirm that the physical book has been returned to you in good condition?')) return;
    try {
      await api.post(`/transactions/borrowings/${recordId}/return/`);
      setActionMessage('Return confirmed! Material is now returned and marked Available again.');
      fetchData();
    } catch (err) {
      console.error('Failed to confirm return:', err);
    }
  };

  const handleAcceptRequest = async (e) => {
    e.preventDefault();
    if (!selectedReq) return;

    try {
      await api.post(`/transactions/requests/${selectedReq.id}/action/`, {
        action: 'ACCEPT',
        days: acceptDays,
        notes: acceptNotes,
        meetup_location: acceptMeetup,
      });

      setActionMessage('Borrowing request accepted! Handover record is now active.');
      setSelectedReq(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectRequest = async (reqId) => {
    const reason = prompt('Optional rejection note for student:');
    try {
      await api.post(`/transactions/requests/${reqId}/action/`, {
        action: 'REJECT',
        notes: reason || '',
      });
      setActionMessage('Request declined.');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Borrowing & Lending Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Track books you borrowed for coursework, materials you are currently lending, and approve incoming borrowing requests.
        </p>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')}>×</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-bold gap-6">
        <button
          onClick={() => setSearchParams({ tab: 'borrowed' })}
          className={`pb-3 relative transition-colors ${
            currentTab === 'borrowed'
              ? 'text-brand-700 border-b-2 border-brand-700'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Books I Borrowed ({borrowedRecords.length})
        </button>

        <button
          onClick={() => setSearchParams({ tab: 'lending' })}
          className={`pb-3 relative transition-colors ${
            currentTab === 'lending'
              ? 'text-brand-700 border-b-2 border-brand-700'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Books I am Lending ({lendingRecords.length})
        </button>

        <button
          onClick={() => setSearchParams({ tab: 'incoming' })}
          className={`pb-3 relative transition-colors ${
            currentTab === 'incoming'
              ? 'text-brand-700 border-b-2 border-brand-700'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Borrow Requests Received ({incomingRequests.filter((r) => r.status === 'PENDING').length})
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-400">Loading records...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: Books I Borrowed */}
          {currentTab === 'borrowed' && (
            <div className="space-y-4">
              {borrowedRecords.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                  <Clock size={36} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">No books currently borrowed.</p>
                  <Link
                    to="/marketplace?listing_type=LEND"
                    className="mt-3 inline-block px-3 py-1.5 bg-brand-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Find Books to Borrow
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {borrowedRecords.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <StatusBadge status={item.status} size="sm" />
                          <span className="text-[11px] text-slate-400">
                            Borrowed: {new Date(item.borrowed_date).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="font-bold text-slate-900 text-sm">{item.listing_title}</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Lender: <span className="font-semibold text-slate-700">{item.lender_name || item.lender_username}</span>
                        </p>

                        <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs flex items-center justify-between">
                          <span className="text-slate-600 flex items-center gap-1.5">
                            <Calendar size={14} className="text-brand-600" />
                            Return Due: {new Date(item.expected_return_date).toLocaleDateString()}
                          </span>
                          {item.is_overdue && (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded">
                              OVERDUE
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                        <Link
                          to={`/student/messages?user=${item.lender}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                        >
                          <MessageSquare size={14} />
                          Message Lender
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Books I am Lending */}
          {currentTab === 'lending' && (
            <div className="space-y-4">
              {lendingRecords.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                  <BookOpen size={36} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">You are not lending out any books right now.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lendingRecords.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <StatusBadge status={item.status} size="sm" />
                          <span className="text-[11px] text-slate-400">
                            Lent out: {new Date(item.borrowed_date).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="font-bold text-slate-900 text-sm">{item.listing_title}</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Borrower: <span className="font-semibold text-slate-700">{item.borrower_name || item.borrower_username}</span>
                        </p>

                        <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs flex items-center justify-between">
                          <span className="text-slate-600">
                            Expected Return: {new Date(item.expected_return_date).toLocaleDateString()}
                          </span>
                          {item.status === 'RETURNED' ? (
                            <span className="text-emerald-700 font-bold text-xs">Returned & Restored</span>
                          ) : (
                            <span className="text-blue-700 font-semibold text-xs">Currently with student</span>
                          )}
                        </div>
                      </div>

                      {item.status !== 'RETURNED' && (
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <Link
                            to={`/student/messages?user=${item.borrower}`}
                            className="p-2 text-slate-600 hover:text-slate-900"
                            title="Chat with borrower"
                          >
                            <MessageSquare size={16} />
                          </Link>
                          <button
                            onClick={() => handleConfirmReturn(item.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                          >
                            <CheckCircle size={14} />
                            <span>Confirm Book Returned</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Incoming Borrow Requests */}
          {currentTab === 'incoming' && (
            <div className="space-y-4">
              {incomingRequests.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                  <p className="text-xs text-slate-500">No incoming borrowing requests right now.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {incomingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={req.status} size="sm" />
                          <span className="text-xs font-bold text-slate-900">{req.listing_details?.material?.title}</span>
                        </div>
                        <p className="text-xs text-slate-600">
                          Requested by <span className="font-semibold text-slate-800">{req.requester_name || req.requester_username}</span>
                        </p>
                        <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100 max-w-xl">
                          "{req.message}"
                        </p>
                        {req.meetup_location && (
                          <p className="text-[11px] text-slate-500">
                            Suggested Meetup: <span className="font-medium text-slate-700">{req.meetup_location}</span>
                          </p>
                        )}
                      </div>

                      {req.status === 'PENDING' && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setSelectedReq(req)}
                            className="px-3.5 py-1.5 bg-brand-700 hover:bg-brand-800 text-white font-semibold text-xs rounded-lg shadow-xs"
                          >
                            Accept & Set Dates
                          </button>
                          <button
                            onClick={() => handleRejectRequest(req.id)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-semibold text-xs rounded-lg"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Accept & Set Return Date Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setSelectedReq(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 z-10 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Accept Borrow Request for "{selectedReq.listing_details?.material?.title}"
            </h3>

            <form onSubmit={handleAcceptRequest} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Agreed Return Window (Days from today)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={acceptDays}
                  onChange={(e) => setAcceptDays(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Confirmed Meetup Spot
                </label>
                <input
                  type="text"
                  value={acceptMeetup}
                  onChange={(e) => setAcceptMeetup(e.target.value)}
                  placeholder="e.g. Science Library ground floor"
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Note to Student
                </label>
                <textarea
                  rows={2}
                  value={acceptNotes}
                  onChange={(e) => setAcceptNotes(e.target.value)}
                  placeholder="See you tomorrow at 10 AM..."
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReq(null)}
                  className="flex-1 py-2 bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-brand-700 text-white rounded-lg font-semibold"
                >
                  Confirm Acceptance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

