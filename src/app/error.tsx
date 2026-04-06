"use client"

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbf9f6] px-6">
      <div className="text-center">
        <span className="material-symbols-outlined text-[#c4c6cf] text-[80px] mb-6">error</span>
        <h1 className="text-4xl font-serif font-bold text-[#022448] mb-4">오류가 발생했습니다</h1>
        <p className="text-[#43474e] mb-8">잠시 후 다시 시도해주세요.</p>
        <button
          onClick={() => reset()}
          className="px-8 py-3 bg-[#022448] text-white rounded-xl font-bold hover:bg-[#1e3a5f] transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  )
}
