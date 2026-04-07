import { Metadata } from "next"
import { generatePageMetadata } from "@/lib/seo"
import { unstable_cache } from "next/cache"
import prisma from "@/lib/prisma"
import { ColumnsGrid } from "@/components/columns/ColumnsGrid"

const getColumns = unstable_cache(
  async () => {
    const columns = await prisma.column.findMany({
      orderBy: { createdAt: "desc" },
      include: { sermon: { select: { sermonDate: true } } },
    })
    // Strip HTML and serialize for client component
    return columns.map((col) => ({
      id: col.id,
      title: col.title,
      content: col.content.replace(/<[^>]*>/g, ""),
      scripture: col.scripture,
      viewCount: col.viewCount,
      createdAt: col.createdAt.toISOString(),
      sermonDate: col.sermon?.sermonDate?.toISOString() || null,
    }))
  },
  ["columns-list"],
  { revalidate: 300, tags: ["columns"] }
)

export const metadata: Metadata = generatePageMetadata(
  "설교 칼럼",
  "동남 생명의 빛 교회 설교 원고와 설교 요약을 만나보세요.",
  "/columns"
)

export default async function ColumnsPage() {
  const columns = await getColumns()

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

      <ColumnsGrid columns={columns} />
    </div>
  )
}
