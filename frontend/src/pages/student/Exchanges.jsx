import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightLeft, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';

export default function Exchanges() {
  const [incomingProposals, setIncomingProposals] = useState([]);
  const [outgoingProposals, setOutgoingProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [incRes, outRes] = await Promise.all([
        api.get('/transactions/requests/?role=received&type=EXCHANGE'),
        api.get('/transactions/requests/?role=sent&type=EXCHANGE'),
      ]);

      setIncomingProposals(incRes.data.results || incRes.data || []);
      setOutgoingProposals(outRes.data.results || outRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProposalAction = async (id, action) => {
    try {
      await api.post(`/transactions/requests/${id}/action/`, { action });
      setActionMessage(`Exchange proposal ${action.toLowerCase()}ed.`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Book-for-Book Exchanges
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review peer trade offers and propose exchanging books for required course subjects.
        </p>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
          {actionMessage}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-400">Loading exchange offers...</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Incoming exchange proposals */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              Exchange Offers Received ({incomingProposals.length})
            </h2>

            {incomingProposals.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
                No active exchange proposals received yet.
              </div>
            ) : (
              <div className="space-y-4">
                {incomingProposals.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={item.status} size="sm" />
                        <h3 className="font-bold text-slate-900 text-sm">
                          Your Item: {item.listing_details?.material?.title}
                        </h3>
                      </div>

                      {/* Trade Offer Display */}
                      <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs">
                        <span className="font-bold text-indigo-900 block mb-0.5">Offered in Exchange:</span>
                        {item.offered_material_details ? (
                          <span className="font-semibold text-slate-800">
                            {item.offered_material_details.title} ({item.offered_material_details.subject_code})
                          </span>
                        ) : (
                          <span className="text-slate-700 italic">
                            {item.offered_material_description || 'Student specified trade offer below'}
                          </span>
                        )}
                        <p className="text-slate-600 mt-1">"{item.message}"</p>
                      </div>

                      <p className="text-[11px] text-slate-400">
                        Proposed by {item.requester_name || item.requester_username} • Meetup: {item.meetup_location || 'Campus'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to={`/student/messages?user=${item.requester}`}
                        className="p-2 text-slate-600 hover:text-indigo-700 hover:bg-slate-100 rounded-lg"
                        title="Chat about exchange terms"
                      >
                        <MessageSquare size={16} />
                      </Link>

                      {item.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleProposalAction(item.id, 'ACCEPT')}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-xs"
                          >
                            Accept Trade
                          </button>
                          <button
                            onClick={() => handleProposalAction(item.id, 'REJECT')}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-semibold text-xs rounded-lg"
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {item.status === 'COMPLETED' && (
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                          Exchange Completed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing proposals */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              Exchange Proposals You Sent ({outgoingProposals.length})
            </h2>

            {outgoingProposals.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
                You haven't proposed any book exchanges yet.
              </div>
            ) : (
              <div className="space-y-3">
                {outgoingProposals.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={item.status} size="sm" />
                        <span className="font-bold text-slate-900">
                          {item.listing_details?.material?.title}
                        </span>
                      </div>
                      <p className="text-slate-500">
                        Owner: {item.owner_name || item.owner_username}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/student/messages?user=${item.owner}`}
                        className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-semibold"
                      >
                        Message
                      </Link>
                      {item.status === 'PENDING' && (
                        <button
                          onClick={() => handleProposalAction(item.id, 'CANCEL')}
                          className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

