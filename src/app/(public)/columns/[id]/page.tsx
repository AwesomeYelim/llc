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

  // Get recent columns for sidebar
  const recentColumns = await prisma.column.findMany({
    where: { id: { not: column.id } },
    orderBy: { createdAt: "desc" },
    take: 3,
  })

  return (
    <div>
      {/* Editorial Header */}
      <header className="max-w-screen-2xl mx-auto px-6 lg:px-12 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-end">
          <div className="md:col-span-8">
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-[#ffdfa0] text-[#795900] px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                말씀 칼럼
              </span>
              <span className="text-[#43474e] text-sm">
                {formatDate(column.sermon?.sermonDate || column.createdAt)}
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-[#022448] leading-[1.2] mb-8">
              {column.title}
            </h1>
            {column.scripture && (
              <p className="font-serif text-lg md:text-xl text-[#43474e] leading-relaxed italic">
                {column.scripture}
              </p>
            )}
          </div>
          <div className="md:col-span-4 flex flex-col items-start md:items-end gap-4">
            <div className="md:text-right">
              <span className="block text-[#795900] font-bold text-sm uppercase tracking-widest mb-1">
                글쓴이
              </span>
              <span className="block font-serif text-xl font-bold text-[#022448]">
                홍은익 담임목사
              </span>
            </div>
            <div className="flex gap-3">
              <ShareButtons title={column.title} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content + Sidebar */}
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-20 pb-24">
        {/* Article Column */}
        <article className="md:col-span-8 space-y-8">
          <div className="prose prose-lg max-w-none">
            <div
              className="column-content font-serif text-lg leading-[1.9] text-[#1b1c1a]"
              dangerouslySetInnerHTML={{ __html: column.content }}
            />
          </div>

          {/* Author Bio */}
          <section className="mt-16 p-8 lg:p-12 bg-[#f5f3f0] rounded-xl flex flex-col md:flex-row gap-6 items-center">
            <div className="w-24 h-24 rounded-full bg-[#1e3a5f] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#8aa4cf] text-4xl">person</span>
            </div>
            <div>
              <h4 className="font-serif text-xl font-bold text-[#022448] mb-2">
                홍은익 담임목사
              </h4>
              <p className="text-[#43474e] text-sm leading-relaxed">
                동남생명의빛교회 담임목사. 말씀 중심의 목회를 통해 성도들이 하나님의 일을 성공시키는 삶을 살도록 인도합니다.
              </p>
            </div>
          </section>
        </article>

        {/* Sidebar */}
        <aside className="md:col-span-4 space-y-12">
          {/* Related Sermon */}
          {column.sermon && (
            <div className="bg-[#022448] p-8 lg:p-10 rounded-xl text-white">
              <span className="text-[#ffdfa0] text-xs font-bold tracking-widest uppercase block mb-4">
                관련 설교
              </span>
              <h3 className="font-serif text-2xl font-bold mb-4">{column.sermon.title}</h3>
              <p className="text-[#8aa4cf] text-sm mb-6">{column.sermon.scripture}</p>
              <Link
                href={`/sermons/${column.sermon.id}`}
                className="w-full block py-3 border border-[#8aa4cf]/30 rounded-xl font-bold text-center hover:bg-white hover:text-[#022448] transition-all"
              >
                설교 영상 보기
              </Link>
            </div>
          )}

          {/* Reflection Prompt */}
          <div className="p-[1px] border border-[#c4c6cf]/30 rounded-xl">
            <div className="bg-white p-6 lg:p-8 rounded-xl text-center">
              <span className="material-symbols-outlined text-4xl text-[#795900] mb-4">edit_note</span>
              <h4 className="font-serif text-lg font-bold text-[#022448] mb-3">
                묵상 질문
              </h4>
              <p className="font-serif text-sm text-[#43474e] italic leading-relaxed">
                &ldquo;오늘 이 말씀을 통해 하나님이 당신에게 말씀하시는 것은 무엇인가요?&rdquo;
              </p>
            </div>
          </div>

          {/* Recent Columns */}
          {recentColumns.length > 0 && (
            <div className="space-y-6">
              <h4 className="font-serif text-xl font-bold text-[#022448] border-b-2 border-[#795900] inline-block pb-1">
                다른 칼럼
              </h4>
              <div className="space-y-6">
                {recentColumns.map((col) => (
                  <Link key={col.id} href={`/columns/${col.id}`} className="group block">
                    <h5 className="font-serif text-base font-bold text-[#022448] group-hover:text-[#795900] transition-colors leading-snug">
                      {col.title}
                    </h5>
                    <p className="text-xs text-[#43474e] mt-2">
                      {formatDate(col.createdAt)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back to list */}
          <Link
            href="/columns"
            className="flex items-center gap-2 text-[#022448] font-bold hover:text-[#795900] transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            모든 칼럼 보기
          </Link>
        </aside>
      </div>
    </div>
  )
}
