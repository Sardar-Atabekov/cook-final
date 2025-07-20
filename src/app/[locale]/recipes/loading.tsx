export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-10 w-2/3 max-w-xl bg-slate-200 rounded-lg animate-pulse mb-4" />
          <div className="flex gap-4 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-8 w-28 bg-slate-200 rounded-full animate-pulse"
                style={{ animationDelay: `${100 * i}ms` }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters sidebar skeleton */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="space-y-6">
              <div className="h-8 w-2/3 bg-slate-200 rounded-lg animate-pulse" />
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-white rounded-lg shadow border border-slate-200 animate-pulse"
                />
              ))}
            </div>
          </div>
          {/* Main grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 animate-pulse"
                  style={{ animationDelay: `${200 + i * 30}ms` }}
                >
                  <div className="w-full h-40 bg-gradient-to-r from-slate-200 to-slate-300 rounded-t-xl" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-full" />
                    <div className="flex justify-between pt-2">
                      <div className="h-3 bg-slate-200 rounded w-16" />
                      <div className="h-3 bg-slate-200 rounded w-12" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
