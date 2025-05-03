// components/ui/star-rating.jsx
import React from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({ value = 0, onChange, size = 'default', readOnly = false }) => {
  const handleClick = (rating) => {
    if (readOnly) return;
    onChange(rating);
  };

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => handleClick(rating)}
          className={`p-1 focus:outline-none ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
          disabled={readOnly}
          aria-label={`Rate ${rating} out of 5 stars`}
        >
          <Star
            className={`${
              rating <= value
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            } ${
              size === 'small' ? 'h-4 w-4' : size === 'large' ? 'h-6 w-6' : 'h-5 w-5'
            }`}
          />
        </button>
      ))}
      {!readOnly && (
        <span className="ml-2 text-sm text-gray-500">
          {value > 0 ? `${value}/5` : 'Select rating'}
        </span>
      )}
    </div>
  );
};