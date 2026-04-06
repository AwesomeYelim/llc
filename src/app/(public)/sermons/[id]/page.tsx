import { Metadata } from "next"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { formatDate, serviceTypeLabel } from "@/lib/utils"
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
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 pb-24">
      {/* Back link */}
      <Link
        href="/sermons"
        className="inline-flex items-center gap-2 text-[#022448] hover:text-[#795900] transition-colors mb-8"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        설교 목록
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 bg-[#d5e3ff] text-[#022448] rounded-full text-xs font-bold">
            {serviceTypeLabel(sermon.serviceType)}
          </span>
          {sermon.series && (
            <span className="px-3 py-1 bg-[#ffdfa0] text-[#795900] rounded-full text-xs font-bold">
              {sermon.series}
            </span>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#022448] mb-4 leading-tight">
          {sermon.title}
        </h1>
        <div className="flex items-center gap-4 text-[#43474e]">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-base">menu_book</span>
            {sermon.scripture}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-base">calendar_today</span>
            {formatDate(sermon.sermonDate)}
          </span>
        </div>
      </div>

      {/* YouTube embed */}
      {sermon.youtubeId && (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-10 shadow-lg">
          <iframe
            src={`https://www.youtube.com/embed/${sermon.youtubeId}`}
            title={sermon.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {/* Summary */}
          {sermon.summary && (
            <div className="bg-white rounded-xl border border-[#c4c6cf]/20 p-8 mb-8">
              <h2 className="font-serif text-xl font-bold text-[#022448] mb-4">설교 요약</h2>
              <p className="text-[#43474e] leading-relaxed whitespace-pre-line">{sermon.summary}</p>
            </div>
          )}

          {/* Related columns */}
          {sermon.columns.length > 0 && (
            <div>
              <h2 className="font-serif text-xl font-bold text-[#022448] mb-4">관련 설교 원고</h2>
              <div className="space-y-3">
                {sermon.columns.map((col) => (
                  <Link
                    key={col.id}
                    href={`/columns/${col.id}`}
                    className="block bg-white rounded-xl border border-[#c4c6cf]/20 p-6 hover:shadow-md hover:border-[#795900]/20 transition-all group"
                  >
                    <h3 className="font-serif font-bold text-[#022448] group-hover:text-[#795900] transition-colors">
                      {col.title}
                    </h3>
                    {col.scripture && (
                      <p className="text-sm text-[#43474e] mt-1">{col.scripture}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* External Links */}
          <div className="bg-[#f5f3f0] rounded-xl p-8">
            <h3 className="font-serif text-lg font-bold text-[#022448] mb-4">외부 링크</h3>
            <div className="space-y-3">
              {sermon.youtubeUrl && (
                <a
                  href={sermon.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-[#795900]">play_circle</span>
                  <span className="text-sm font-medium text-[#022448]">유튜브에서 보기</span>
                </a>
              )}
              {sermon.blogUrl && (
                <a
                  href={sermon.blogUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-[#795900]">edit_note</span>
                  <span className="text-sm font-medium text-[#022448]">네이버 블로그</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
