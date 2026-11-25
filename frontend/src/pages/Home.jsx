import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Gift,
  DollarSign,
  ArrowRightLeft,
  Users,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  Layers,
  FileCheck,
  FileText,
  Bookmark,
  FlaskConical,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MaterialCard from '../components/MaterialCard';
import api from '../api/client';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const [featuredListings, setFeaturedListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, listingsRes] = await Promise.all([
          api.get('/marketplace/categories/'),
          api.get('/marketplace/listings/?ordering=-created_at'),
        ]);

        const cats = catsRes.data.results || catsRes.data;
        const allListings = listingsRes.data.results || listingsRes.data;

        setCategories(cats);
        setRecentListings(allListings.slice(0, 4));
        setFeaturedListings(allListings.slice(0, 6));
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() || selectedType !== 'ALL') {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (selectedType !== 'ALL') params.append('listing_type', selectedType);
      navigate(`/marketplace?${params.toString()}`);
    } else {
      navigate('/marketplace');
    }
  };

  const categoryIcons = {
    Textbooks: BookOpen,
    'Reviewers & Board Prep': FileCheck,
    'Lecture Notes & Summaries': FileText,
    'Study Guides & Solutions': Bookmark,
    'Reference Materials & Handbooks': Layers,
    'Laboratory Manuals & Workbooks': FlaskConical,
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950 text-white overflow-hidden py-16 sm:py-24">
        {/* Subtle decorative mesh grid */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <GraduationCap size={15} />
            <span>The University Peer-to-Peer Academic Exchange</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Exchange, Lend & Find Academic Books{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-brand-300 to-indigo-300">
              Affordably
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Stop overpaying for semester textbooks. Connect directly with fellow students to buy, borrow, donate, or exchange second-hand reviewers, notes, and study guides.
          </p>

          {/* Hero Search Box with Transaction Type Pills */}
          <div className="mt-8 max-w-3xl mx-auto bg-white/10 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border border-white/15 shadow-2xl">
            <form onSubmit={handleHeroSearch} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Enter textbook title, subject code (e.g. CS101, MATH21), or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-400"
                />
              </div>

              {/* Transaction Type Filter Dropdown inside search */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-white/90 text-slate-800 text-xs font-semibold px-3 py-2.5 rounded-xl border-none focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="ALL">All Transaction Types</option>
                <option value="SALE">For Sale</option>
                <option value="LEND">For Lending (Borrow)</option>
                <option value="DONATION">Free Donation</option>
                <option value="EXCHANGE">For Exchange</option>
              </select>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-xl transition-all shadow-md hover:shadow-brand-500/20 shrink-0"
              >
                <span>Search</span>
                <ArrowRight size={16} />
              </button>
            </form>

            {/* Quick Keyword tags */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
              <span className="text-slate-400">Popular:</span>
              <button onClick={() => navigate('/marketplace?search=Algorithms')} className="hover:text-white underline">Algorithms</button>
              <span>•</span>
              <button onClick={() => navigate('/marketplace?search=Calculus')} className="hover:text-white underline">Calculus</button>
              <span>•</span>
              <button onClick={() => navigate('/marketplace?search=CPA')} className="hover:text-white underline">CPA Reviewer</button>
              <span>•</span>
              <button onClick={() => navigate('/marketplace?search=Physiology')} className="hover:text-white underline">Medical Physiology</button>
              <span>•</span>
              <button onClick={() => navigate('/marketplace?search=Chemistry')} className="hover:text-white underline">Chemistry Notes</button>
            </div>
          </div>

          {/* Key Stat Badges */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-2xl font-black text-white">100%</div>
              <div className="text-xs text-slate-400 mt-0.5">Verified Students</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-2xl font-black text-brand-400">0%</div>
              <div className="text-xs text-slate-400 mt-0.5">Hidden Platform Fees</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-2xl font-black text-emerald-400">4 Ways</div>
              <div className="text-xs text-slate-400 mt-0.5">Lend, Sell, Donate, Trade</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-2xl font-black text-amber-400">Campus</div>
              <div className="text-xs text-slate-400 mt-0.5">Safe Local Handover</div>
            </div>
          </div>

        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
              Four Flexible Pathways
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              How Academic Exchange Works
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Every course and student budget is different. Choose the exchange option that fits your needs:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* 1. Lend & Borrow */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <RotateCcw size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900">Borrow & Lend</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Borrow expensive textbooks for a set period (e.g., 14 to 30 days) during exam season. Return it cleanly when done!
              </p>
            </div>

            {/* 2. Buy & Sell */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <DollarSign size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900">Buy & Sell</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Purchase verified second-hand reviewers at a steep discount from upperclassmen. Coordinate payment and meetup directly.
              </p>
            </div>

            {/* 3. Donate */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <Gift size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900">Donate Materials</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Pay it forward! Senior students can offer old review materials, handwritten summary kits, and flashcards 100% free.
              </p>
            </div>

            {/* 4. Exchange */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
                <ArrowRightLeft size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900">Book Exchange</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Swap one completed course textbook for another subject you need this semester. Zero cash required.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Browse by Category Section */}
      <section id="categories" className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
                Academic Subjects & Formats
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Browse by Category
              </h2>
            </div>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-800"
            >
              <span>Explore All Materials</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => {
              const IconComponent = categoryIcons[cat.name] || BookOpen;
              return (
                <Link
                  key={cat.id}
                  to={`/marketplace?category=${cat.slug}`}
                  className="group p-5 bg-white rounded-2xl border border-slate-200 hover:border-brand-400 hover:shadow-md transition-all flex flex-col items-center text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition-all">
                    <IconComponent size={22} />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-brand-700 transition-colors">
                    {cat.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 mt-1">
                    {cat.materials_count || 0} available
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured / Recent Listings */}
      <section className="py-16 sm:py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
                Latest On Campus
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Recently Added Academic Materials
              </h2>
            </div>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-800"
            >
              <span>View Full Catalog</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-slate-400">Loading academic materials...</p>
            </div>
          ) : recentListings.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200">
              <BookOpen size={36} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No listings available yet.</p>
              <p className="text-xs text-slate-500 mt-1">Be the first student to post a reviewer!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentListings.map((listing) => (
                <MaterialCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}

          {/* Big CTA Banner */}
          <div className="mt-16 bg-gradient-to-r from-brand-900 via-slate-900 to-blue-950 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
            <div className="max-w-xl text-center md:text-left">
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                Have books or reviewers sitting on your shelf?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Help fellow students ace their classes this semester while earning extra allowance or trading for books you need. It takes less than 2 minutes to upload!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                to="/student/listings/create"
                className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-bold text-xs uppercase tracking-wider text-center shadow-md transition-all"
              >
                Post Your Material
              </Link>
              <Link
                to="/register"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs uppercase tracking-wider text-center transition-all"
              >
                Create Account
              </Link>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}

