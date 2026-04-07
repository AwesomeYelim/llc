import { Metadata } from "next"
import { generatePageMetadata } from "@/lib/seo"
import prisma from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import { formatDate, serviceTypeLabel, getYoutubeThumbnail } from "@/lib/utils"

export const metadata: Metadata = generatePageMetadata(
  "설교 영상",
  "동남 생명의 빛 교회 설교 영상을 온라인으로 시청하세요.",
  "/sermons"
)

export default async function SermonsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; serviceType?: string }>
}) {
  const { page: pageStr, serviceType } = await searchParams
  const page = parseInt(pageStr || "1")
  const limit = 12

  const where: Record<string, unknown> = {}
  if (serviceType) where.serviceType = serviceType

  const [sermons, total] = await Promise.all([
    prisma.sermon.findMany({
      where,
      orderBy: { sermonDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.sermon.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div>
      {/* Hero Header */}
      <header className="max-w-screen-2xl mx-auto px-6 lg:px-12 mb-16">
        <div className="max-w-3xl">
          <span className="text-[#795900] font-semibold tracking-widest text-xs uppercase mb-4 block">
            아카이브
          </span>
          <h1 className="text-4xl md:text-6xl font-bold font-serif text-[#022448] leading-tight mb-6">
            설교 라이브러리
          </h1>
          <p className="text-[#43474e] text-lg lg:text-xl leading-relaxed">
            하나님의 말씀을 통해 은혜를 나눕니다. 영적 성장과 성경적 진리를 위한 메시지들을 만나보세요.
          </p>
        </div>
      </header>

      {/* Filters */}
      <section className="max-w-screen-2xl mx-auto px-6 lg:px-12 mb-12">
        <div className="bg-[#f5f3f0] rounded-xl p-6 lg:p-8 flex flex-wrap gap-3 items-center">
          <span className="text-sm font-semibold text-[#022448] mr-4">예배 종류</span>
          <Link
            href="/sermons"
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              !serviceType
                ? "bg-[#022448] text-white"
                : "bg-white text-[#43474e] hover:bg-[#eae8e5]"
            }`}
          >
            전체
          </Link>
          {["SUNDAY_MAIN", "WEDNESDAY", "FRIDAY", "SPECIAL"].map((type) => (
            <Link
              key={type}
              href={`/sermons?serviceType=${type}`}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                serviceType === type
                  ? "bg-[#022448] text-white"
                  : "bg-white text-[#43474e] hover:bg-[#eae8e5]"
              }`}
            >
              {serviceTypeLabel(type)}
            </Link>
          ))}
        </div>
      </section>

      {/* Sermon Grid */}
      <section className="max-w-screen-2xl mx-auto px-6 lg:px-12 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 lg:gap-y-16 gap-x-8 lg:gap-x-12">
          {sermons.map((sermon) => (
            <Link key={sermon.id} href={`/sermons/${sermon.id}`} className="group cursor-pointer block">
              <div className="relative aspect-video rounded-xl overflow-hidden mb-6 bg-[#eae8e5]">
                {sermon.youtubeId ? (
                  <Image
                    src={getYoutubeThumbnail(sermon.youtubeId)}
                    alt={sermon.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="material-symbols-outlined text-[#c4c6cf] text-6xl">play_circle</span>
                  </div>
                )}
                {/* Play overlay */}
                <div className="absolute inset-0 bg-[#022448]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-16 h-16 bg-[#fbf9f6]/90 rounded-full flex items-center justify-center text-[#022448] shadow-xl">
                    <span
                      className="material-symbols-outlined text-4xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      play_arrow
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-[#795900] text-xs font-bold tracking-widest uppercase mb-2 block">
                {serviceTypeLabel(sermon.serviceType)}
                {sermon.series && ` · ${sermon.series}`}
              </span>
              <h3 className="text-xl lg:text-2xl font-bold font-serif text-[#022448] mb-3 leading-snug group-hover:text-[#795900] transition-colors">
                {sermon.title}
              </h3>
              <div className="flex items-center text-[#43474e] text-sm gap-4">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">menu_book</span>
                  {sermon.scripture}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">calendar_today</span>
                  {formatDate(sermon.sermonDate)}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {sermons.length === 0 && (
          <div className="text-center py-24">
            <span className="material-symbols-outlined text-[#c4c6cf] text-6xl mb-4">search_off</span>
            <p className="text-[#43474e]">등록된 설교가 없습니다.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-24 flex justify-center items-center gap-3">
            {page > 1 && (
              <Link
                href={`/sermons?page=${page - 1}${serviceType ? `&serviceType=${serviceType}` : ""}`}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-[#f5f3f0] text-[#022448] hover:bg-[#022448] hover:text-white transition-all"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/sermons?page=${p}${serviceType ? `&serviceType=${serviceType}` : ""}`}
                className={`w-12 h-12 flex items-center justify-center rounded-full font-bold transition-all ${
                  p === page
                    ? "bg-[#022448] text-white"
                    : "bg-[#f5f3f0] text-[#022448] hover:bg-[#022448] hover:text-white"
                }`}
              >
                {p}
              </Link>
            ))}
            {page < totalPages && (
              <Link
                href={`/sermons?page=${page + 1}${serviceType ? `&serviceType=${serviceType}` : ""}`}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-[#f5f3f0] text-[#022448] hover:bg-[#022448] hover:text-white transition-all"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
