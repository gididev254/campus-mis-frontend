import React from 'react';

interface PageSkeletonProps {
  headers?: boolean;
  title?: boolean;
  cards?: number;
  stats?: boolean;
  tables?: boolean;
  tableRows?: number;
}

const PageSkeleton: React.FC<PageSkeletonProps> = ({
  headers = true,
  title = true,
  cards = 6,
  stats = true,
  tables = false,
  tableRows = 5
}) => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeletons */}
      {headers && (
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 bg-gray-300 rounded w-1/3" />
          <div className="h-10 bg-gray-300 rounded w-1/4" />
        </div>
      )}

      {/* Title skeleton */}
      {title && <div className="h-10 bg-gray-300 rounded mb-6" />}

      {/* Stats skeleton */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-5 bg-gray-300 rounded w-24 mb-2" />
              <div className="h-8 bg-gray-300 rounded w-16" />
            </div>
          ))}
        </div>
      )}

      {/* Main content area */}
      <div className="space-y-4">
        {/* Card skeletons */}
        {cards > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: cards }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-6 bg-gray-300 rounded mb-4" />
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-300 rounded w-full" />
                  <div className="h-4 bg-gray-300 rounded w-5/6" />
                </div>
                <div className="h-4 bg-gray-300 rounded w-1/3" />
              </div>
            ))}
          </div>
        )}

        {/* Table skeleton */}
        {tables && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-3 border-b">
              <div className="h-5 bg-gray-300 rounded w-20" />
            </div>
            <div className="divide-y divide-gray-200">
              {Array.from({ length: tableRows }).map((_, rowIndex) => (
                <div key={rowIndex} className="px-6 py-4">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="h-5 bg-gray-300 rounded col-span-1" />
                    <div className="col-span-4 flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gray-300 rounded-full" />
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-24" />
                        <div className="h-3 bg-gray-300 rounded w-32" />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="h-6 bg-gray-300 rounded-full w-16" />
                    </div>
                    <div className="col-span-2">
                      <div className="h-4 bg-gray-300 rounded w-20" />
                    </div>
                    <div className="col-span-2">
                      <div className="h-4 bg-gray-300 rounded w-16" />
                    </div>
                    <div className="col-span-1">
                      <div className="h-8 bg-gray-300 rounded w-8" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageSkeleton;