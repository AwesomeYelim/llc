import { Metadata } from "next"
import { generatePageMetadata } from "@/lib/seo"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

export const metadata: Metadata = generatePageMetadata(
  "설교 칼럼",
  "동남 생명의 빛 교회 설교 원고와 설교 요약을 만나보세요.",
  "/columns"
)

export default async function ColumnsPage() {
  const columns = await prisma.column.findMany({
    orderBy: { createdAt: "desc" },
    include: { sermon: { select: { sermonDate: true } } },
  })

  return (
    <div>
      {/* Hero Header */}
      <header className="max-w-screen-2xl mx-auto px-6 lg:px-12 mb-16">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-[#ffdfa0] text-[#795900] px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
              말씀 칼럼
            </span>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-[#022448] leading-tight mb-6">
            설교 칼럼
          </h1>
          <p className="font-serif text-lg md:text-xl text-[#43474e] leading-relaxed italic max-w-2xl">
            말씀의 깊이를 칼럼으로 만나보세요. 은혜의 말씀이 삶으로 이어지는 여정입니다.
          </p>
        </div>
      </header>

      {/* Columns Grid */}
      {columns.length > 0 && (
        <section className="max-w-screen-2xl mx-auto px-6 lg:px-12 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {columns.map((col, i) => (
              <Link
                key={col.id}
                href={`/columns/${col.id}`}
                className={`group ${i === 0 ? "md:col-span-2" : ""}`}
              >
                <article
                  className={`bg-white rounded-xl border border-[#c4c6cf]/20 overflow-hidden hover:shadow-lg transition-all duration-500 ${
                    i === 0 ? "p-8 lg:p-12" : "p-6 lg:p-8"
                  }`}
                >
                  {col.scripture && (
                    <span className="text-[#795900] text-xs font-bold tracking-widest uppercase mb-3 block">
                      {col.scripture}
                    </span>
                  )}
                  <h3
                    className={`font-serif font-bold text-[#022448] group-hover:text-[#795900] transition-colors leading-snug ${
                      i === 0 ? "text-2xl lg:text-4xl mb-4" : "text-xl lg:text-2xl mb-3"
                    }`}
                  >
                    {col.title}
                  </h3>
                  <p className={`text-[#43474e] leading-relaxed line-clamp-3 ${i === 0 ? "text-base lg:text-lg" : "text-sm"}`}>
                    {col.content.replace(/<[^>]*>/g, "").slice(0, i === 0 ? 300 : 150)}...
                  </p>
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#e4e2df]">
                    <span className="text-xs text-[#43474e]">
                      {formatDate(col.sermon?.sermonDate || col.createdAt)}
                    </span>
                    <span className="text-[#795900] font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      읽기
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {columns.length === 0 && (
        <div className="text-center py-24 max-w-screen-2xl mx-auto px-6 lg:px-12">
          <span className="material-symbols-outlined text-[#c4c6cf] text-6xl mb-4">article</span>
          <p className="text-[#43474e]">등록된 글이 없습니다.</p>
        </div>
      )}
    </div>
  )
}
