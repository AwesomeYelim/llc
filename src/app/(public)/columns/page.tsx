import { Metadata } from "next"
import { generatePageMetadata } from "@/lib/seo"
import prisma from "@/lib/prisma"
import { ColumnsGrid } from "@/components/columns/ColumnsGrid"

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

  // Strip HTML and serialize for client component
  const serialized = columns.map((col) => ({
    id: col.id,
    title: col.title,
    content: col.content.replace(/<[^>]*>/g, ""),
    scripture: col.scripture,
    viewCount: col.viewCount,
    createdAt: col.createdAt.toISOString(),
    sermonDate: col.sermon?.sermonDate?.toISOString() || null,
  }))

  return (
    <div>
      {/* Hero Header */}
      <header className="max-w-screen-2xl mx-auto px-6 lg:px-12 mb-16">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-12 h-[1px] bg-[#795900]" />
            <span className="text-sm uppercase tracking-[0.2em] text-[#795900] font-semibold">
              말씀 칼럼
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-[#022448] mb-6 leading-tight text-balance">
            설교 칼럼
          </h1>
          <p className="text-lg text-[#43474e] leading-relaxed">
            말씀의 깊이를 칼럼으로 만나보세요. 은혜의 말씀이 삶으로 이어지는 여정입니다.
          </p>
        </div>
      </header>

      <ColumnsGrid columns={serialized} />
    </div>
  )
}
