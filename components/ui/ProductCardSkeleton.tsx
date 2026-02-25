import React from 'react';

const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="w-full h-48 bg-gray-300" />

      <div className="p-4">
        {/* Title skeleton */}
        <div className="h-4 bg-gray-300 rounded mb-2 w-3/4" />

        {/* Price skeleton */}
        <div className="h-4 bg-gray-300 rounded mb-4 w-1/3" />

        {/* Description skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-gray-300 rounded w-full" />
          <div className="h-3 bg-gray-300 rounded w-full" />
          <div className="h-3 bg-gray-300 rounded w-2/3" />
        </div>

        {/* Action button skeleton */}
        <div className="h-10 bg-gray-300 rounded" />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;