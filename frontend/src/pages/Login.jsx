import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Lock, User, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const loggedInUser = await login(username, password);
      if (loggedInUser.is_staff || loggedInUser.student_profile?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid username or password. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (userType) => {
    if (userType === 'student') {
      setUsername('maria.santos');
      setPassword('student123');
    } else {
      setUsername('admin');
      setPassword('admin123');
    }
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background radial gradient */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 to-blue-500 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
            <BookOpen size={26} />
          </div>
          <span className="text-2xl font-black text-white">
            Acad<span className="text-brand-400">ex</span>
          </span>
        </Link>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Welcome to Campus Exchange
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Sign in to access your student dashboard and academic marketplace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-100">
          
          {/* Quick Demo Fill Pills for Testing */}
          <div className="mb-6 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <span className="font-bold text-slate-700 block mb-2 text-center uppercase tracking-wider text-[10px]">
              Quick-Fill Test Credentials
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fillDemo('student')}
                className="flex-1 py-1.5 px-2 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold rounded-lg text-center transition-colors border border-brand-200"
              >
                Student Demo
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="flex-1 py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold rounded-lg text-center transition-colors border border-amber-200"
              >
                Admin Demo
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Username or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. maria.santos or student@univ.edu"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <User className="absolute left-3.5 top-3 text-slate-400" size={15} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <Lock className="absolute left-3.5 top-3 text-slate-400" size={15} />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In to Account'}</span>
              <ArrowRight size={15} />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-brand-700 hover:underline">
              Register as a Student
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

