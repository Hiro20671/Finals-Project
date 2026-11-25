import React from 'react';
import { Star } from 'lucide-react';

export default function RatingStars({ rating = 5, totalCount = null, size = 16, interactive = false, onRate = null }) {
  const numericRating = Number(rating) || 0;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = starIndex <= numericRating;
          return (
            <button
              key={starIndex}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRate && onRate(starIndex)}
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
            >
              <Star
                size={size}
                className={`${
                  isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                } transition-colors`}
              />
            </button>
          );
        })}
      </div>
      <span className="text-xs font-semibold text-slate-700 ml-1">
        {numericRating.toFixed(1)}
      </span>
      {totalCount !== null && (
        <span className="text-xs text-slate-400">
          ({totalCount})
        </span>
      )}
    </div>
  );
}

