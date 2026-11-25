import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  X,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  BookOpen,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MaterialCard from '../components/MaterialCard';
import api from '../api/client';

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters state from searchParams
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const listingType = searchParams.get('listing_type') || '';
  const condition = searchParams.get('condition') || '';
  const ordering = searchParams.get('ordering') || '-created_at';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';

  const [localSearch, setLocalSearch] = useState(search);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/marketplace/categories/');
        setCategories(res.data.results || res.data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch listings whenever query parameters change
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(searchParams);
        const res = await api.get(`/marketplace/listings/?${params.toString()}`);
        const data = res.data;
        if (data.results) {
          setListings(data.results);
          setTotalCount(data.count);
        } else {
          setListings(data);
          setTotalCount(data.length);
        }
      } catch (err) {
        console.error('Failed to load listings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [searchParams]);

  const updateParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    setSearchParams(nextParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', localSearch.trim());
  };

  const clearAllFilters = () => {
    setLocalSearch('');
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(
    search || category || listingType || condition || minPrice || maxPrice
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-slate-900 text-white py-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Academic Marketplace
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Explore textbooks, board exam reviewers, notes, and study kits posted by university peers.
              </p>
            </div>

            {/* Quick Search bar */}
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search title, subject code, author..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-800 text-white rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500 placeholder:text-slate-400"
              />
              <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
            </form>
          </div>

          {/* Category Chips Bar */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
            <button
              onClick={() => updateParam('category', '')}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                !category
                  ? 'bg-brand-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => updateParam('category', cat.slug)}
                className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                  category === cat.slug
                    ? 'bg-brand-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Body: Sidebar Filters + Material Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                  <SlidersHorizontal size={15} />
                  <span>Filters</span>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-[11px] text-brand-600 hover:text-brand-800 font-semibold flex items-center gap-1"
                  >
                    <RotateCcw size={11} />
                    Reset
                  </button>
                )}
              </div>

              {/* Transaction Type Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Transaction Type
                </label>
                <div className="space-y-1.5 text-xs">
                  {[
                    { label: 'All Types', value: '' },
                    { label: 'For Sale', value: 'SALE' },
                    { label: 'For Lending (Borrow)', value: 'LEND' },
                    { label: 'Free Donation', value: 'DONATION' },
                    { label: 'Exchange / Swap', value: 'EXCHANGE' },
                  ].map((t) => (
                    <label key={t.value} className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-brand-700">
                      <input
                        type="radio"
                        name="listing_type"
                        checked={listingType === t.value}
                        onChange={() => updateParam('listing_type', t.value)}
                        className="text-brand-600 focus:ring-brand-500 rounded"
                      />
                      <span>{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Material Condition */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Condition
                </label>
                <div className="space-y-1.5 text-xs">
                  {[
                    { label: 'Any Condition', value: '' },
                    { label: 'Brand New / Pristine', value: 'NEW' },
                    { label: 'Good Condition', value: 'GOOD' },
                    { label: 'Fair Condition', value: 'FAIR' },
                    { label: 'Heavily Used / Highlighted', value: 'USED' },
                  ].map((c) => (
                    <label key={c.value} className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-brand-700">
                      <input
                        type="radio"
                        name="condition"
                        checked={condition === c.value}
                        onChange={() => updateParam('condition', c.value)}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      <span>{c.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Price Range ($)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => updateParam('min_price', e.target.value)}
                    className="w-1/2 p-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => updateParam('max_price', e.target.value)}
                    className="w-1/2 p-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

            </div>
          </aside>

          {/* Right Product Grid Area */}
          <div className="flex-1">
            {/* Top Toolbar: Result count, Mobile Filter Button, Ordering */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-700"
                >
                  <Filter size={14} />
                  <span>Filter</span>
                </button>
                <p className="text-xs text-slate-500">
                  Showing <span className="font-bold text-slate-900">{listings.length}</span> of {totalCount} items
                </p>
              </div>

              {/* Sort by dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 hidden sm:inline">Sort by:</span>
                <select
                  value={ordering}
                  onChange={(e) => updateParam('ordering', e.target.value)}
                  className="bg-white border border-slate-200 text-slate-700 text-xs font-medium py-1.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="-created_at">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popular">Most Viewed</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Listings Grid */}
            {loading ? (
              <div className="py-24 text-center">
                <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs text-slate-400">Loading academic materials...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 p-8">
                <BookOpen size={40} className="text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No matching materials found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try adjusting your search keywords, clearing your filters, or browsing other subject categories.
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <MaterialCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}

