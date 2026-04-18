import { Metadata } from "next"
import { generatePageMetadata } from "@/lib/seo"
import prisma from "@/lib/prisma"
import { PraiseGrid } from "@/components/praise/PraiseGrid"

export const metadata: Metadata = generatePageMetadata(
  "찬양 콘티 & 가사 PPT",
  "동남 생명의 빛 교회 찬양 콘티와 가사 PPT를 무료로 다운로드하세요.",
  "/praise"
)

export default async function PraisePage() {
  const [contis, total, totalDownloadsResult] = await Promise.all([
    prisma.praiseConti.findMany({
      orderBy: { serviceDate: "desc" },
    }),
    prisma.praiseConti.count(),
    prisma.praiseConti.aggregate({ _sum: { downloadCount: true } }),
  ])

  const totalDownloads = totalDownloadsResult._sum.downloadCount || 0

  // Serialize for client component
  const serialized = contis.map((c) => ({
    id: c.id,
    title: c.title,
    serviceDate: c.serviceDate.toISOString(),
    fileName: c.fileName,
    fileUrl: c.fileUrl,
    fileSize: c.fileSize,
    downloadCount: c.downloadCount,
    musicalKey: c.musicalKey,
    theme: c.theme,
    season: c.season,
  }))

  return (
    <div>
      {/* Hero Header */}
      <header className="max-w-screen-2xl mx-auto px-6 lg:px-12 mb-16">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-12 h-[1px] bg-[#795900]" />
            <span className="text-sm uppercase tracking-[0.2em] text-[#795900] font-semibold">
              예배 리소스
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-[#022448] mb-6 leading-tight text-balance">
            찬양 콘티 & 가사 PPT
          </h1>
          <p className="text-lg text-[#43474e] leading-relaxed mb-6">
            매주 예배에서 사용된 찬양 콘티와 가사 PPT를 확인하고 자유롭게 다운로드하세요.
            코드별, 메세지별, 절기별로 찾아보세요.
          </p>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-[#f5f3f0] rounded-xl">
              <span className="text-xs text-[#43474e] block mb-1">총 리소스</span>
              <span className="font-serif text-2xl font-bold text-[#022448]">{total}개</span>
            </div>
            <div className="p-4 bg-[#f5f3f0] rounded-xl">
              <span className="text-xs text-[#43474e] block mb-1">총 다운로드</span>
              <span className="font-serif text-2xl font-bold text-[#022448]">{totalDownloads}회</span>
            </div>
          </div>
        </div>
      </header>

      {/* Spiritual Quote */}
      <section className="max-w-screen-2xl mx-auto px-6 lg:px-12 mb-24 flex justify-center">
        <div className="text-center max-w-3xl">
          <div className="w-[2px] h-12 bg-[#795900] mx-auto mb-6" />
          <blockquote className="font-serif text-xl md:text-2xl italic text-[#022448] leading-relaxed text-balance break-keep">
            &ldquo;시와 찬송과 신령한 노래를 부르며 너희의 마음으로 주께 노래하며 찬송하라&rdquo;
          </blockquote>
          <cite className="block mt-4 text-[#795900] text-sm font-semibold tracking-widest uppercase not-italic">
            — 에베소서 5:19
          </cite>
        </div>
      </section>

      {/* Filterable Grid */}
      <section className="max-w-screen-2xl mx-auto px-6 lg:px-12 pb-24">
        <PraiseGrid contis={serialized} />
      </section>
    </div>
  )
}
