import { Metadata } from "next"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { formatDate, serviceTypeLabel } from "@/lib/utils"
import { Badge } from "@/components/ui/Badge"
import Link from "next/link"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const sermon = await prisma.sermon.findUnique({ where: { id: parseInt(id) } })
  if (!sermon) return { title: "설교를 찾을 수 없습니다" }

  return {
    title: sermon.title,
    description: sermon.summary || `${sermon.title} - ${sermon.scripture}`,
  }
}

export default async function SermonDetailPage({ params }: Props) {
  const { id } = await params
  const sermon = await prisma.sermon.findUnique({
    where: { id: parseInt(id) },
    include: { columns: true },
  })

  if (!sermon) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/sermons" className="text-sm text-[#1e3a5f] hover:underline mb-6 inline-block">
        ← 설교 목록
      </Link>

      <div className="mb-6">
        <Badge variant="primary">{serviceTypeLabel(sermon.serviceType)}</Badge>
        {sermon.series && (
          <Badge variant="warning" className="ml-2">{sermon.series}</Badge>
        )}
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">{sermon.title}</h1>
      <p className="text-lg text-[#1e3a5f] font-medium mb-1">{sermon.scripture}</p>
      <p className="text-gray-500 mb-8">{formatDate(sermon.sermonDate)}</p>

      {/* YouTube embed */}
      {sermon.youtubeId && (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-8">
          <iframe
            src={`https://www.youtube.com/embed/${sermon.youtubeId}`}
            title={sermon.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      )}

      {/* Summary */}
      {sermon.summary && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">설교 요약</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{sermon.summary}</p>
        </div>
      )}

      {/* Links */}
      <div className="flex flex-wrap gap-3">
        {sermon.blogUrl && (
          <a
            href={sermon.blogUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
          >
            네이버 블로그에서 읽기 →
          </a>
        )}
        {sermon.youtubeUrl && (
          <a
            href={sermon.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
          >
            유튜브에서 보기 →
          </a>
        )}
      </div>

      {/* Related columns */}
      {sermon.columns.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-4">관련 설교 원고</h2>
          <div className="space-y-3">
            {sermon.columns.map((col) => (
              <Link
                key={col.id}
                href={`/columns/${col.id}`}
                className="block bg-white rounded-lg border border-gray-100 p-4 hover:shadow-sm transition-shadow"
              >
                <p className="font-medium">{col.title}</p>
                {col.scripture && (
                  <p className="text-sm text-gray-500 mt-1">{col.scripture}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
