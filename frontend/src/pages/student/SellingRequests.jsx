import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ShoppingBag,
  DollarSign,
  CheckCircle,
  XCircle,
  MessageSquare,
  MapPin,
  Clock,
} from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';

export default function SellingRequests() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'incoming'; // 'incoming' or 'my_orders'

  const [incomingRequests, setIncomingRequests] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [incRes, ordRes] = await Promise.all([
        api.get('/transactions/requests/?role=received&type=BUY'),
        api.get('/transactions/requests/?role=sent&type=BUY'),
      ]);

      setIncomingRequests(incRes.data.results || incRes.data || []);
      setMyOrders(ordRes.data.results || ordRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (id, action, promptMessage) => {
    let notes = '';
    if (promptMessage) {
      notes = prompt(promptMessage) || '';
    }

    try {
      await api.post(`/transactions/requests/${id}/action/`, {
        action,
        notes,
      });
      setActionMessage(`Transaction updated (${action}).`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Selling & Purchase Requests
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Coordinate book sales, accept buyer requests, and mark items as sold once cash handover is completed.
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
          onClick={() => setSearchParams({ tab: 'incoming' })}
          className={`pb-3 relative transition-colors ${
            currentTab === 'incoming'
              ? 'text-brand-700 border-b-2 border-brand-700'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Purchase Requests Received ({incomingRequests.length})
        </button>

        <button
          onClick={() => setSearchParams({ tab: 'my_orders' })}
          className={`pb-3 relative transition-colors ${
            currentTab === 'my_orders'
              ? 'text-brand-700 border-b-2 border-brand-700'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          My Purchase Requests ({myOrders.length})
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-400">Loading purchase records...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: Incoming purchase requests on my books */}
          {currentTab === 'incoming' && (
            <div className="space-y-4">
              {incomingRequests.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                  <ShoppingBag size={36} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">No purchase requests received yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {incomingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={req.status} size="sm" />
                          <h3 className="font-bold text-slate-900 text-sm">
                            {req.listing_details?.material?.title}
                          </h3>
                        </div>

                        <p className="text-xs text-slate-600">
                          Buyer: <span className="font-semibold text-slate-800">{req.requester_name || req.requester_username}</span>
                          {' • '}
                          Agreed Price: <span className="font-bold text-emerald-700">${Number(req.agreed_price).toFixed(2)}</span>
                        </p>

                        <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-lg max-w-xl">
                          "{req.message}"
                        </p>

                        {req.meetup_location && (
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin size={13} className="text-slate-400" />
                            <span>Meetup: {req.meetup_location}</span>
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          to={`/student/messages?user=${req.requester}`}
                          className="p-2 text-slate-600 hover:text-brand-700 hover:bg-slate-100 rounded-lg"
                          title="Message Buyer"
                        >
                          <MessageSquare size={16} />
                        </Link>

                        {req.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleAction(req.id, 'ACCEPT')}
                              className="px-3.5 py-1.5 bg-brand-700 hover:bg-brand-800 text-white font-semibold text-xs rounded-lg shadow-xs"
                            >
                              Accept Request
                            </button>
                            <button
                              onClick={() => handleAction(req.id, 'REJECT', 'Reason for declining (optional):')}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-semibold text-xs rounded-lg"
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {req.status === 'ACCEPTED' && (
                          <button
                            onClick={() => handleAction(req.id, 'COMPLETE')}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1"
                          >
                            <CheckCircle size={14} />
                            <span>Mark Sold & Completed</span>
                          </button>
                        )}

                        {req.status === 'COMPLETED' && (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                            Sold & Handover Done
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: My purchase requests sent to other sellers */}
          {currentTab === 'my_orders' && (
            <div className="space-y-4">
              {myOrders.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                  <p className="text-xs font-semibold text-slate-700">You haven't requested to buy any materials yet.</p>
                  <Link
                    to="/marketplace?listing_type=SALE"
                    className="mt-3 inline-block px-3 py-1.5 bg-brand-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Browse Books for Sale
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={ord.status} size="sm" />
                          <h3 className="font-bold text-slate-900 text-sm">
                            {ord.listing_details?.material?.title}
                          </h3>
                        </div>

                        <p className="text-xs text-slate-600">
                          Seller: <span className="font-semibold text-slate-800">{ord.owner_name || ord.owner_username}</span>
                          {' • '}
                          Price: <span className="font-bold text-slate-900">${Number(ord.agreed_price).toFixed(2)}</span>
                        </p>

                        {ord.owner_notes && (
                          <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            Seller remarks: "{ord.owner_notes}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          to={`/student/messages?user=${ord.owner}`}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <MessageSquare size={14} />
                          Message Seller
                        </Link>

                        {ord.status === 'PENDING' && (
                          <button
                            onClick={() => handleAction(ord.id, 'CANCEL')}
                            className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold"
                          >
                            Cancel Request
                          </button>
                        )}

                        {ord.status === 'COMPLETED' && (
                          <Link
                            to={`/student/history`}
                            className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold"
                          >
                            Leave Rating
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

