import { Metadata } from "next"
import { generatePageMetadata } from "@/lib/seo"
import prisma from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import { formatDate, serviceTypeLabel, getYoutubeThumbnail } from "@/lib/utils"
import { Badge } from "@/components/ui/Badge"

export const metadata: Metadata = generatePageMetadata(
  "설교 영상",
  "동남생명의빛교회 설교 영상을 온라인으로 시청하세요.",
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
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[#1e3a5f] mb-2">설교 영상</h1>
      <p className="text-gray-500 mb-8">하나님의 말씀을 통해 은혜를 나눕니다.</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/sermons"
          className={`px-4 py-2 rounded-full text-sm transition-colors ${
            !serviceType ? "bg-[#1e3a5f] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          전체
        </Link>
        {["SUNDAY_MAIN", "WEDNESDAY", "FRIDAY", "SPECIAL"].map((type) => (
          <Link
            key={type}
            href={`/sermons?serviceType=${type}`}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              serviceType === type ? "bg-[#1e3a5f] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {serviceTypeLabel(type)}
          </Link>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sermons.map((sermon) => (
          <Link
            key={sermon.id}
            href={`/sermons/${sermon.id}`}
            className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow group"
          >
            <div className="relative aspect-video bg-gray-100">
              {sermon.youtubeId ? (
                <Image
                  src={getYoutubeThumbnail(sermon.youtubeId)}
                  alt={sermon.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-300 text-4xl">
                  🎬
                </div>
              )}
              <div className="absolute top-3 left-3">
                <Badge variant="primary">{serviceTypeLabel(sermon.serviceType)}</Badge>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                {sermon.title}
              </h3>
              <p className="text-sm text-gray-500">{sermon.scripture}</p>
              <p className="text-xs text-gray-400 mt-2">{formatDate(sermon.sermonDate)}</p>
            </div>
          </Link>
        ))}
      </div>

      {sermons.length === 0 && (
        <p className="text-center text-gray-400 py-20">등록된 설교가 없습니다.</p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/sermons?page=${p}${serviceType ? `&serviceType=${serviceType}` : ""}`}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm ${
                p === page ? "bg-[#1e3a5f] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
