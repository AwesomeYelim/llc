import { Skeleton } from "@/components/ui/Skeleton"

export default function SermonsLoading() {
  return (
    <div>
      <header className="max-w-screen-2xl mx-auto px-6 lg:px-12 mb-16">
        <div className="max-w-3xl space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-14 w-80" />
          <Skeleton className="h-6 w-96" />
          <div className="flex gap-4">
            <Skeleton className="h-16 w-28" />
            <Skeleton className="h-16 w-28" />
          </div>
        </div>
      </header>
      <section className="max-w-screen-2xl mx-auto px-6 lg:px-12 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#e4e2df] overflow-hidden">
              <Skeleton className="h-48 w-full rounded-none" />
              <div className="p-6 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
