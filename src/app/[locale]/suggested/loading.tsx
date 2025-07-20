export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header skeleton */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div
              className="h-12 w-12 bg-slate-200 rounded-full animate-pulse mr-3"
              style={{ animationDelay: '0ms' }}
            />
            <div
              className="h-8 w-64 bg-slate-200 rounded animate-pulse"
              style={{ animationDelay: '100ms' }}
            />
          </div>
          <div
            className="h-6 w-96 bg-slate-200 rounded animate-pulse mx-auto mb-6"
            style={{ animationDelay: '200ms' }}
          />

          {/* Tabs skeleton */}
          <div className="flex justify-center gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-10 w-24 bg-slate-200 rounded animate-pulse"
                style={{ animationDelay: `${300 + i * 100}ms` }}
              />
            ))}
          </div>
        </div>

        {/* Recipes grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-slate-200 animate-pulse"
              style={{ animationDelay: `${600 + i * 100}ms` }}
            >
              <div className="w-full h-48 bg-gradient-to-r from-slate-200 to-slate-300 rounded-t-xl" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-3/4" />
                <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-full" />
                <div className="flex justify-between pt-2">
                  <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-16" />
                  <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional sections skeleton */}
        <div className="mt-16">
          <div className="h-8 w-64 bg-slate-200 rounded animate-pulse mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div
                      key={j}
                      className="bg-white rounded-lg shadow-sm border border-slate-200 animate-pulse"
                    >
                      <div className="w-full h-32 bg-gradient-to-r from-slate-200 to-slate-300 rounded-t-lg" />
                      <div className="p-3">
                        <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-3/4 mb-2" />
                        <div className="h-2 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
