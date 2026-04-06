import { Metadata } from "next"
import { generatePageMetadata } from "@/lib/seo"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

export const metadata: Metadata = generatePageMetadata(
  "블로그",
  "동남생명의빛교회 설교 요약 블로그",
  "/blog"
)

export default async function BlogPage() {
  const sermons = await prisma.sermon.findMany({
    where: { summary: { not: null } },
    orderBy: { sermonDate: "desc" },
    take: 20,
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[#1e3a5f] mb-2">블로그</h1>
      <p className="text-gray-500 mb-8">설교 요약과 묵상을 나눕니다.</p>

      <div className="space-y-6">
        {sermons.map((sermon) => (
          <Link
            key={sermon.id}
            href={`/blog/${sermon.id}`}
            className="block bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {sermon.title}
                </h2>
                <p className="text-sm text-[#1e3a5f] font-medium mb-2">
                  {sermon.scripture}
                </p>
                {sermon.summary && (
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {sermon.summary}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-3">
                  {formatDate(sermon.sermonDate)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {sermons.length === 0 && (
        <p className="text-center text-gray-400 py-20">등록된 글이 없습니다.</p>
      )}
    </div>
  )
}
