import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gift, PlusCircle, CheckCircle, Heart, MessageSquare } from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';

export default function Donations() {
  const [donatedListings, setDonatedListings] = useState([]);
  const [incomingClaims, setIncomingClaims] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [listingsRes, incRes, myRes] = await Promise.all([
        api.get('/marketplace/listings/my/?listing_type=DONATION'),
        api.get('/transactions/requests/?role=received&type=DONATION'),
        api.get('/transactions/requests/?role=sent&type=DONATION'),
      ]);

      setDonatedListings(listingsRes.data.results || listingsRes.data || []);
      setIncomingClaims(incRes.data.results || incRes.data || []);
      setMyClaims(myRes.data.results || myRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClaimAction = async (id, action) => {
    try {
      await api.post(`/transactions/requests/${id}/action/`, { action });
      setActionMessage(`Donation request ${action.toLowerCase()}ed.`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Academic Donations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Offer free textbooks and notes to help juniors, and view requests on donated materials.
          </p>
        </div>

        <Link
          to="/student/listings/create"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs transition-colors shrink-0"
        >
          <Gift size={15} />
          <span>Donate a Material</span>
        </Link>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
          {actionMessage}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-400">Loading donation records...</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Section: Incoming Donation Claims */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Heart size={16} className="text-rose-500" />
              <span>Donation Requests from Students</span>
            </h2>

            {incomingClaims.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
                No students currently requesting your donated materials.
              </div>
            ) : (
              <div className="space-y-3">
                {incomingClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={claim.status} size="sm" />
                        <span className="font-bold text-slate-900 text-sm">
                          {claim.listing_details?.material?.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Requested by student <span className="font-semibold text-slate-800">{claim.requester_name || claim.requester_username}</span>
                      </p>
                      <p className="text-xs text-slate-500 italic mt-1 bg-slate-50 p-2 rounded-lg">
                        "{claim.message}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {claim.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleClaimAction(claim.id, 'ACCEPT')}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg"
                          >
                            Grant Donation
                          </button>
                          <button
                            onClick={() => handleClaimAction(claim.id, 'REJECT')}
                            className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold text-xs rounded-lg"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {claim.status === 'COMPLETED' && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                          Donation Handed Over
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: My Donated Listings */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              Materials You Offered for Free
            </h2>

            {donatedListings.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
                You haven't posted any donated materials yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donatedListings.map((item) => (
                  <div key={item.id} className="p-4 bg-white rounded-2xl border border-slate-200 flex gap-4">
                    <img
                      src={item.material.primary_image_url}
                      alt={item.material.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.material.title}</h4>
                      <p className="text-[11px] text-slate-500">{item.material.subject_code} • {item.material.author}</p>
                      <div className="mt-2">
                        <StatusBadge status={item.status} size="sm" />
                      </div>
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

