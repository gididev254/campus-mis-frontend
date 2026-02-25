import React from 'react';

const TableSkeleton = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Table header skeleton */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="grid grid-cols-12 gap-4">
          <div className="h-5 bg-gray-300 rounded col-span-1" />
          <div className="h-5 bg-gray-300 rounded col-span-4" />
          <div className="h-5 bg-gray-300 rounded col-span-2" />
          <div className="h-5 bg-gray-300 rounded col-span-2" />
          <div className="h-5 bg-gray-300 rounded col-span-2" />
          <div className="h-5 bg-gray-300 rounded col-span-1" />
        </div>
      </div>

      {/* Table body skeleton */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Checkbox column */}
              <div className="h-5 bg-gray-300 rounded col-span-1" />

              {/* Avatar/name column */}
              <div className="col-span-4 flex items-center space-x-3">
                <div className="h-10 w-10 bg-gray-300 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-24" />
                  <div className="h-3 bg-gray-300 rounded w-32" />
                </div>
              </div>

              {/* Status column */}
              <div className="col-span-2">
                <div className="h-6 bg-gray-300 rounded-full w-16" />
              </div>

              {/* Date column */}
              <div className="col-span-2">
                <div className="h-4 bg-gray-300 rounded w-20" />
              </div>

              {/* Amount column */}
              <div className="col-span-2">
                <div className="h-4 bg-gray-300 rounded w-16" />
              </div>

              {/* Actions column */}
              <div className="col-span-1">
                <div className="h-8 bg-gray-300 rounded w-8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableSkeleton;