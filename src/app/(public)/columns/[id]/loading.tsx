export default function ColumnDetailLoading() {
  return (
    <div className="bg-white animate-pulse">
      {/* Hero skeleton */}
      <div className="relative h-[50vh] min-h-[400px] lg:h-[60vh] bg-gradient-to-br from-[#022448] via-[#1e3a5f] to-[#0a3060]">
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-screen-xl mx-auto w-full px-6 lg:px-12 pb-12 lg:pb-16">
            <div className="h-6 w-24 bg-white/20 rounded-full mb-6" />
            <div className="h-12 w-3/4 bg-white/20 rounded-lg mb-3" />
            <div className="h-12 w-1/2 bg-white/10 rounded-lg" />
          </div>
        </div>
      </div>
      {/* Meta bar skeleton */}
      <div className="bg-[#f5f3f0] border-b border-[#e4e2df]">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#e4e2df]" />
          <div className="h-4 w-40 bg-[#e4e2df] rounded" />
          <div className="h-4 w-24 bg-[#e4e2df]/60 rounded ml-auto" />
        </div>
      </div>
      {/* Content skeleton */}
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-16">
        <div className="max-w-3xl mx-auto space-y-4">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="h-4 bg-[#e4e2df]/50 rounded"
              style={{ width: `${70 + Math.random() * 30}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
