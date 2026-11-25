import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, ShieldOff, UserX, UserCheck } from 'lucide-react';
import api from '../../api/client';
import RatingStars from '../../components/RatingStars';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const url = search ? `/auth/admin/users/?search=${encodeURIComponent(search)}` : '/auth/admin/users/';
      const res = await api.get(url);
      setUsers(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    try {
      await api.post(`/auth/admin/users/${userId}/status/`, {
        account_status: nextStatus,
      });
      setActionSuccess(`User status changed to ${nextStatus}.`);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAdmin = async (userId, isStaff) => {
    try {
      await api.post(`/auth/admin/users/${userId}/status/`, {
        is_admin: !isStaff,
      });
      setActionSuccess(`User admin privileges updated.`);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Registered Student Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Oversee student accounts, view ratings, and suspend violating accounts.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by student ID, name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 text-white text-xs border border-slate-800 rounded-xl focus:outline-none focus:border-amber-500"
          />
          <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
        </form>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl">
          {actionSuccess}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading student accounts...</div>
      ) : (
        <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Program & Year</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((u) => {
                  const prof = u.student_profile || {};
                  const isSuspended = prof.account_status === 'SUSPENDED';

                  return (
                    <tr key={u.id} className="hover:bg-slate-900/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prof.display_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.username}`}
                            alt=""
                            className="w-8 h-8 rounded-full border border-slate-700"
                          />
                          <div>
                            <span className="font-bold text-white block">
                              {u.first_name ? `${u.first_name} ${u.last_name}` : u.username}
                            </span>
                            <span className="text-[10px] text-slate-400">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-300">
                        {prof.student_id_number || 'N/A'}
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        <span className="block font-medium">{prof.degree_program || 'Student'}</span>
                        <span className="text-[10px] text-slate-500">{prof.year_level}</span>
                      </td>

                      <td className="py-3 px-4">
                        <RatingStars rating={prof.average_rating || 5} totalCount={prof.total_reviews_count} size={13} />
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.is_staff || prof.role === 'ADMIN'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {u.is_staff ? 'Admin' : 'Student'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isSuspended
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {prof.account_status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Toggle Suspend/Activate */}
                          <button
                            onClick={() => handleToggleStatus(u.id, prof.account_status)}
                            className={`p-1.5 rounded-lg border ${
                              isSuspended
                                ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                : 'border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                            }`}
                            title={isSuspended ? 'Reactivate Student' : 'Suspend Account'}
                          >
                            {isSuspended ? <UserCheck size={15} /> : <UserX size={15} />}
                          </button>

                          {/* Toggle Admin */}
                          <button
                            onClick={() => handleToggleAdmin(u.id, u.is_staff)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg"
                            title={u.is_staff ? 'Demote from Admin' : 'Promote to Admin'}
                          >
                            <Shield size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

