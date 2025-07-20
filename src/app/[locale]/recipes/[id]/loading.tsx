export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white py-8">
      {/* Back Button Skeleton */}
      <div className="h-10 w-48 mb-6 bg-gradient-to-r from-gray-200 via-gray-200 to-gray-300 shadow-lg rounded animate-pulse" />

      {/* Recipe Header Skeleton */}
      <div className="mb-8">
        <div className="h-64 md:h-80 rounded-xl mb-6 bg-gradient-to-r from-gray-200 via-gray-200 to-gray-300 shadow-lg animate-pulse" />
        <div className="flex flex-wrap gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-12 w-32 bg-gradient-to-r from-gray-200 via-gray-200 to-gray-300 shadow-lg rounded animate-pulse"
            />
          ))}
        </div>
        <div className="h-24 rounded-xl mb-6 bg-gradient-to-r from-gray-200 via-gray-200 to-gray-300 shadow-lg animate-pulse" />
      </div>

      {/* Ingredients Skeleton */}
      <div className="shadow-lg border-0 mb-8 rounded-xl bg-white">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 rounded-t-xl p-4">
          <div className="h-6 w-32 bg-gradient-to-r from-gray-200 via-gray-200 to-gray-300 shadow-lg rounded animate-pulse" />
        </div>
        <div className="p-6 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-12 w-full bg-gradient-to-r from-gray-200 via-gray-200 to-gray-300 shadow-lg rounded animate-pulse"
            />
          ))}
        </div>
      </div>

      {/* Action Buttons Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="h-12 flex-1 bg-gradient-to-r from-gray-200 via-gray-200 to-gray-300 shadow-lg rounded animate-pulse" />
        <div className="h-12 flex-1 bg-gradient-to-r from-gray-200 via-gray-200 to-gray-300 shadow-lg rounded animate-pulse" />
      </div>

      {/* Similar Recipes Skeleton */}
      <div className="mt-12">
        <div className="h-8 w-48 mb-6 bg-gradient-to-r from-gray-200 via-gray-200 to-gray-300 shadow-lg rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="shadow-lg border-0 rounded-xl bg-white">
              <div className="h-48 rounded-t-lg bg-gradient-to-r from-gray-200 via-gray-200 to-gray-300 shadow-lg animate-pulse" />
              <div className="p-4">
                <div className="h-4 w-full mb-2 bg-gradient-to-r from-gray-200 via-gray-200 to-gray-300 shadow-lg rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gradient-to-r from-gray-200 via-gray-200 to-gray-300 shadow-lg rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
