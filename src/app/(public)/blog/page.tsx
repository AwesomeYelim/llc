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
    <div>
      {/* Hero Header */}
      <header className="max-w-screen-2xl mx-auto px-6 lg:px-12 mb-16">
        <div className="max-w-3xl">
          <span className="text-[#795900] font-semibold tracking-widest text-xs uppercase mb-4 block">
            설교 요약
          </span>
          <h1 className="text-4xl md:text-6xl font-bold font-serif text-[#022448] leading-tight mb-6">
            블로그
          </h1>
          <p className="text-[#43474e] text-lg leading-relaxed">
            설교 요약과 묵상을 나눕니다. 말씀의 은혜를 다시 한번 되새겨 보세요.
          </p>
        </div>
      </header>

      <section className="max-w-screen-2xl mx-auto px-6 lg:px-12 pb-24">
        <div className="space-y-6">
          {sermons.map((sermon) => (
            <Link
              key={sermon.id}
              href={`/blog/${sermon.id}`}
              className="block bg-white rounded-xl border border-[#c4c6cf]/20 p-6 lg:p-8 hover:shadow-md hover:border-[#795900]/20 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <span className="text-[#795900] text-xs font-bold tracking-widest uppercase mb-2 block">
                    {sermon.scripture}
                  </span>
                  <h2 className="text-xl lg:text-2xl font-serif font-bold text-[#022448] mb-3 group-hover:text-[#795900] transition-colors">
                    {sermon.title}
                  </h2>
                  {sermon.summary && (
                    <p className="text-[#43474e] text-sm leading-relaxed line-clamp-3">
                      {sermon.summary}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-4 text-xs text-[#43474e]">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">calendar_today</span>
                      {formatDate(sermon.sermonDate)}
                    </span>
                    {sermon.blogUrl && (
                      <span className="flex items-center gap-1 text-[#795900]">
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                        네이버 블로그
                      </span>
                    )}
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#c4c6cf] group-hover:text-[#795900] transition-colors shrink-0">
                  arrow_forward
                </span>
              </div>
            </Link>
          ))}
        </div>

        {sermons.length === 0 && (
          <div className="text-center py-24">
            <span className="material-symbols-outlined text-[#c4c6cf] text-6xl mb-4">article</span>
            <p className="text-[#43474e]">등록된 글이 없습니다.</p>
          </div>
        )}
      </section>
    </div>
  )
}
