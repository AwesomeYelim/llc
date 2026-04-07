export default function ColumnsLoading() {
  return (
    <div className="animate-pulse">
      <header className="max-w-screen-2xl mx-auto px-6 lg:px-12 mb-16">
        <div className="max-w-3xl">
          <div className="h-6 w-24 bg-[#e4e2df] rounded-full mb-4" />
          <div className="h-14 w-72 bg-[#e4e2df] rounded-lg mb-6" />
          <div className="h-6 w-96 bg-[#e4e2df]/60 rounded-lg" />
        </div>
      </header>
      <section className="max-w-screen-2xl mx-auto px-6 lg:px-12 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`bg-white rounded-xl border border-[#c4c6cf]/20 p-6 lg:p-8 ${i === 0 ? "md:col-span-2" : ""}`}
            >
              <div className="h-4 w-32 bg-[#e4e2df] rounded mb-3" />
              <div className="h-8 w-3/4 bg-[#e4e2df] rounded mb-3" />
              <div className="h-4 w-full bg-[#e4e2df]/60 rounded mb-2" />
              <div className="h-4 w-2/3 bg-[#e4e2df]/40 rounded" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
