import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbf9f6] px-6">
      <div className="text-center">
        <span className="material-symbols-outlined text-[#c4c6cf] text-[80px] mb-6">search_off</span>
        <h1 className="text-6xl font-serif font-bold text-[#022448] mb-4">404</h1>
        <p className="text-xl text-[#43474e] mb-8">페이지를 찾을 수 없습니다</p>
        <Link
          href="/"
          className="px-8 py-3 bg-[#022448] text-white rounded-xl font-bold hover:bg-[#1e3a5f] transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}
