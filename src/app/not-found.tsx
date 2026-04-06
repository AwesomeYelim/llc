import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#1e3a5f] mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">페이지를 찾을 수 없습니다</p>
        <Link
          href="/"
          className="px-6 py-3 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2a4a73] transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}
