import { Metadata } from "next"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { ShareButtons } from "@/components/ShareButtons"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const column = await prisma.column.findUnique({ where: { id: parseInt(id) } })
  if (!column) return { title: "칼럼을 찾을 수 없습니다" }
  return {
    title: column.title,
    description: column.content.replace(/<[^>]*>/g, "").slice(0, 160),
  }
}

export default async function ColumnDetailPage({ params }: Props) {
  const { id } = await params
  const column = await prisma.column.findUnique({
    where: { id: parseInt(id) },
    include: { sermon: true },
  })

  if (!column) notFound()

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/columns" className="text-sm text-[#1e3a5f] hover:underline mb-6 inline-block">
        ← 칼럼 목록
      </Link>

      <article>
        <header className="mb-8 pb-6 border-b border-gray-200">
          <h1
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {column.title}
          </h1>
          {column.scripture && (
            <p className="text-lg text-[#d4a017] font-medium mb-2">{column.scripture}</p>
          )}
          <p className="text-gray-500 text-sm">
            {formatDate(column.sermon?.sermonDate || column.createdAt)} | 동남생명의빛교회
          </p>
        </header>

        {/* Column content - newspaper style */}
        <div
          className="column-content"
          dangerouslySetInnerHTML={{ __html: column.content }}
        />

        {/* Share */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <ShareButtons title={column.title} />
        </div>

        {/* Related sermon */}
        {column.sermon && (
          <div className="mt-8 bg-[#faf8f5] rounded-xl p-6">
            <p className="text-sm text-gray-500 mb-2">관련 설교</p>
            <Link
              href={`/sermons/${column.sermon.id}`}
              className="text-[#1e3a5f] font-semibold hover:underline"
            >
              {column.sermon.title}
            </Link>
          </div>
        )}
      </article>
    </div>
  )
}
