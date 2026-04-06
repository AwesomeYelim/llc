"use client"

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#1e3a5f] mb-4">오류가 발생했습니다</h1>
        <p className="text-gray-600 mb-8">잠시 후 다시 시도해주세요.</p>
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2a4a73] transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  )
}
