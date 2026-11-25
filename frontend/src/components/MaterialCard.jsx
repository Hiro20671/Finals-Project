import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, User, Eye, ArrowRightLeft, Gift, Clock, DollarSign } from 'lucide-react';
import StatusBadge from './StatusBadge';
import RatingStars from './RatingStars';

export default function MaterialCard({ listing }) {
  const { material } = listing;
  const owner = listing.owner || {};

  const typeConfig = {
    SALE: { label: 'For Sale', icon: DollarSign, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    LEND: { label: `Lend (${listing.lending_period_days}d)`, icon: Clock, color: 'text-blue-700 bg-blue-50 border-blue-200' },
    DONATION: { label: 'Donation', icon: Gift, color: 'text-amber-700 bg-amber-50 border-amber-200' },
    EXCHANGE: { label: 'Exchange', icon: ArrowRightLeft, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  };

  const currentType = typeConfig[listing.listing_type] || typeConfig.SALE;
  const TypeIcon = currentType.icon;

  return (
    <div className="group bg-white rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden hover:border-brand-300">
      {/* Top Image & Badges */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
        <img
          src={material.primary_image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600'}
          alt={material.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Condition Badge top-left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <StatusBadge status={material.condition} size="sm" />
        </div>

        {/* Listing Type top-right */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border shadow-sm ${currentType.color} backdrop-blur-md bg-white/95`}>
            <TypeIcon size={12} />
            {currentType.label}
          </span>
        </div>

        {/* Status overlay if not available */}
        {listing.status !== 'AVAILABLE' && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
            <StatusBadge status={listing.status} size="lg" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Subject & Category */}
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span className="bg-brand-50 text-brand-700 font-semibold px-2 py-0.5 rounded border border-brand-100">
              {material.subject_code}
            </span>
            <span className="truncate max-w-[150px] text-slate-500">
              {material.category_name || 'Academic Material'}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors">
            {material.title}
          </h3>

          {/* Author & Edition */}
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            By <span className="font-medium text-slate-700">{material.author}</span>
            {material.edition && ` • ${material.edition}`}
          </p>

          {/* Course Name */}
          <p className="text-xs text-slate-600 mt-2 line-clamp-1 italic">
            Course: {material.course_name}
          </p>
        </div>

        {/* Footer Area: Price / Free & Owner Info */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              {listing.listing_type === 'SALE' && (
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-slate-900">
                    ${Number(listing.price).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">one-time</span>
                </div>
              )}
              {listing.listing_type === 'LEND' && (
                <div>
                  <div className="text-sm font-bold text-brand-700">
                    Free Lending
                  </div>
                  {Number(listing.lending_deposit) > 0 && (
                    <span className="text-[10px] text-slate-500">
                      ${Number(listing.lending_deposit).toFixed(2)} returnable deposit
                    </span>
                  )}
                </div>
              )}
              {listing.listing_type === 'DONATION' && (
                <span className="text-sm font-bold text-amber-600">
                  100% Free Donation
                </span>
              )}
              {listing.listing_type === 'EXCHANGE' && (
                <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  Trade / Exchange
                </span>
              )}
            </div>

            {/* Views counter */}
            <div className="flex items-center gap-1 text-slate-400 text-xs">
              <Eye size={13} />
              <span>{listing.views_count}</span>
            </div>
          </div>

          {/* Owner info & CTA button */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={owner.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${owner.username}`}
                alt={owner.full_name}
                className="w-7 h-7 rounded-full object-cover border border-slate-200"
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-800 truncate">
                  {owner.full_name || owner.username}
                </p>
                <div className="scale-90 origin-left -mt-0.5">
                  <RatingStars rating={owner.average_rating || 5} />
                </div>
              </div>
            </div>

            <Link
              to={`/materials/${listing.id}`}
              className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-brand-700 transition-colors shadow-xs shrink-0"
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

