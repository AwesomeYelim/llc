import { Metadata } from "next"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { generatePageMetadata, sermonJsonLd } from "@/lib/seo"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const sermon = await prisma.sermon.findUnique({ where: { id: parseInt(id) } })
  if (!sermon) return { title: "글을 찾을 수 없습니다" }

  return generatePageMetadata(
    sermon.title,
    sermon.summary || sermon.title,
    `/blog/${id}`
  )
}

export default async function BlogDetailPage({ params }: Props) {
  const { id } = await params
  const sermon = await prisma.sermon.findUnique({
    where: { id: parseInt(id) },
  })

  if (!sermon || !sermon.summary) notFound()

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sermonJsonLd(sermon)) }}
      />
      <Breadcrumbs
        items={[
          { name: "블로그", path: "/blog" },
          { name: sermon.title, path: `/blog/${sermon.id}` },
        ]}
      />

      <article>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{sermon.title}</h1>
        <p className="text-lg text-[#1e3a5f] font-medium mb-1">{sermon.scripture}</p>
        <p className="text-gray-500 mb-8">{formatDate(sermon.sermonDate)}</p>

        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
          {sermon.summary}
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 flex flex-wrap gap-3">
          {sermon.blogUrl && (
            <a
              href={sermon.blogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
            >
              네이버 블로그에서 읽기 →
            </a>
          )}
          {sermon.youtubeUrl && (
            <Link
              href={`/sermons/${sermon.id}`}
              className="px-5 py-2.5 bg-[#1e3a5f] text-white rounded-lg text-sm hover:bg-[#2a4a73]"
            >
              설교 영상 보기
            </Link>
          )}
        </div>
      </article>
    </div>
  )
}
