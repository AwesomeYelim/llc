import { Metadata } from "next"
import { generatePageMetadata } from "@/lib/seo"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

export const metadata: Metadata = generatePageMetadata(
  "설교 칼럼",
  "동남생명의빛교회 설교 원고를 뉴스 칼럼 스타일로 읽어보세요.",
  "/columns"
)

export default async function ColumnsPage() {
  const columns = await prisma.column.findMany({
    orderBy: { createdAt: "desc" },
    include: { sermon: { select: { sermonDate: true } } },
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[#1e3a5f] mb-2" style={{ fontFamily: "var(--font-serif)" }}>
        설교 칼럼
      </h1>
      <p className="text-gray-500 mb-8">말씀의 깊이를 칼럼으로 만나보세요.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {columns.map((col, i) => (
          <Link
            key={col.id}
            href={`/columns/${col.id}`}
            className={`group ${i === 0 ? "md:col-span-2" : ""}`}
          >
            <article
              className={`bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow ${
                i === 0 ? "p-8" : "p-6"
              }`}
            >
              <h2
                className={`font-bold text-gray-900 group-hover:text-[#1e3a5f] transition-colors ${
                  i === 0 ? "text-2xl mb-3" : "text-lg mb-2"
                }`}
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {col.title}
              </h2>
              {col.scripture && (
                <p className="text-sm text-[#d4a017] font-medium mb-2">{col.scripture}</p>
              )}
              <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                {col.content.replace(/<[^>]*>/g, "").slice(0, 200)}...
              </p>
              <p className="text-xs text-gray-400 mt-3">
                {formatDate(col.sermon?.sermonDate || col.createdAt)}
              </p>
            </article>
          </Link>
        ))}
      </div>

      {columns.length === 0 && (
        <p className="text-center text-gray-400 py-20">등록된 칼럼이 없습니다.</p>
      )}
    </div>
  )
}
