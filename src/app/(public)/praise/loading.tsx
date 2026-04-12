import { Skeleton } from "@/components/ui/Skeleton"

export default function PraiseLoading() {
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
        <div className="mb-8 space-y-3">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>
        </div>
        <div className="bg-[#f5f3f0] rounded-xl p-2 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl px-8 py-8 flex items-center gap-8">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-6 w-48" />
              <div className="ml-auto flex gap-2">
                <Skeleton className="h-9 w-16 rounded-lg" />
                <Skeleton className="h-9 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
