import { Metadata } from "next"
import { notFound } from "next/navigation"
import { unstable_cache } from "next/cache"
import prisma from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import { ShareButtons } from "@/components/ShareButtons"
import { ViewTracker } from "@/components/columns/ViewTracker"
import { ReadingProgress } from "@/components/columns/ReadingProgress"
import { generatePageMetadata, columnJsonLd } from "@/lib/seo"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"

interface Props {
  params: Promise<{ id: string }>
}

const getColumn = unstable_cache(
  async (id: number) => {
    return prisma.column.findUnique({
      where: { id },
      include: { sermon: true },
    })
  },
  ["column-detail"],
  { revalidate: 300, tags: ["columns"] }
)

const getRecentColumns = unstable_cache(
  async (excludeId: number) => {
    return prisma.column.findMany({
      where: { id: { not: excludeId } },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        title: true,
        scripture: true,
        content: true,
        createdAt: true,
      },
    })
  },
  ["recent-columns"],
  { revalidate: 300, tags: ["columns"] }
)

export async function generateStaticParams() {
  const columns = await prisma.column.findMany({ select: { id: true } })
  return columns.map((col) => ({ id: String(col.id) }))
}

export const revalidate = 300

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const column = await getColumn(parseInt(id))
  if (!column) return { title: "칼럼을 찾을 수 없습니다" }

  return generatePageMetadata(
    column.title,
    column.content.replace(/<[^>]*>/g, "").slice(0, 160),
    `/columns/${id}`,
    { ogImage: column.coverImageUrl || undefined }
  )
}

/**
 * 성경 인용/숫자 패턴에 하이라이트 span을 추가하는 HTML 후처리기
 * - bible-verse 절 번호: 8:31 → <span class="verse-num">8:31</span>
 * - 괄호 인용: (마 5:38) → <span class="verse-ref">(마 5:38)</span>
 * - 대괄호 인용: [요10:27] → <span class="verse-ref">[요10:27]</span>
 * - 원문자: ①②③ → <span class="step-num">①</span>
 * - 빈 단락(ZWS) 제거
 */
function processColumnContent(html: string): string {
  return html
    // 빈 단락(zero-width space, 공백) 제거
    .replace(/<p>[\u200B\s]*<\/p>/g, "")
    // bible-verse 절 번호 강조 (예: 8:31)
    .replace(
      /<p class="bible-verse">(\d+:\d+)\s*/g,
      '<p class="bible-verse"><span class="verse-num">$1</span> '
    )
    // 괄호 성경 인용: (마 5:38), (골 2:6, 개정) 등
    .replace(
      /\(([가-힣]{1,4}[\s]?\d+:\d+[^)]{0,20})\)/g,
      '<span class="verse-ref">($1)</span>'
    )
    // 대괄호 성경 인용: [요10:27], [고전14:1] 등
    .replace(
      /\[([가-힣]{0,4}\d+:\d+[^\]]{0,20})\]/g,
      '<span class="verse-ref">[$1]</span>'
    )
    // 원문자 ①-⑳ 하이라이트
    .replace(/([①-⑳⓵-⓾])/g, '<span class="step-num">$1</span>')
}

/** 본문에서 첫 번째 의미 있는 문장 추출 (pull quote용) */
function extractPullQuote(html: string): string {
  const text = html.replace(/<[^>]*>/g, "").trim()
  const sentences = text.split(/[.!?]\s+/)
  const quote = sentences.find(
    (s) => s.length > 30 && s.length < 120 && /하나님|주님|예수|은혜|사랑|믿음|복음/.test(s)
  )
  return quote ? quote.trim() : ""
}

export default async function ColumnDetailPage({ params }: Props) {
  const { id } = await params
  const column = await getColumn(parseInt(id))

  if (!column) notFound()

  const recentColumns = await getRecentColumns(column.id)

  const processedContent = processColumnContent(column.content)
  const plainText = column.content.replace(/<[^>]*>/g, "")
  const pullQuote = extractPullQuote(column.content)

  // 본문을 앞/뒤로 분할 (pull quote 삽입 위치)
  const paragraphs = processedContent.split("</p>")
  const splitAt = Math.min(Math.floor(paragraphs.length * 0.3), 15)
  const contentBefore = paragraphs.slice(0, splitAt).join("</p>") + (splitAt < paragraphs.length ? "</p>" : "")
  const contentAfter = paragraphs.slice(splitAt).join("</p>")

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(columnJsonLd(column)) }}
      />
      <ReadingProgress />
      <ViewTracker id={column.id} />
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12 pt-4">
        <Breadcrumbs
          items={[
            { name: "칼럼", path: "/columns" },
            { name: column.title, path: `/columns/${column.id}` },
          ]}
        />
      </div>

      {/* Hero Section */}
      <header>
        {column.coverImageUrl ? (
          /* 커버 이미지 있을 때 — 매거진 스타일 */
          <div className="relative h-[50vh] min-h-[400px] lg:h-[60vh] overflow-hidden">
            <Image
              src={column.coverImageUrl}
              alt={column.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <div className="absolute inset-0 flex items-end">
              <div className="max-w-screen-xl mx-auto w-full px-6 lg:px-12 pb-12 lg:pb-16">
                <span className="inline-block bg-[#795900] text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6">
                  말씀 칼럼
                </span>
                <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.15] max-w-4xl break-keep">
                  {column.title}
                </h1>
              </div>
            </div>
          </div>
        ) : (
          /* 커버 이미지 없을 때 — 에디토리얼 헤더 */
          <div className="max-w-screen-xl mx-auto px-6 lg:px-12 pt-10 pb-10 lg:pt-14 lg:pb-12">
            <span className="inline-block bg-[#795900] text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6">
              말씀 칼럼
            </span>
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-[#022448] leading-[1.2] max-w-4xl break-keep">
              {column.title}
            </h1>
          </div>
        )}

        {/* Meta bar */}
        <div className="bg-[#f5f3f0] border-b border-[#e4e2df]">
          <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#022448] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#ffdfa0] text-lg">person</span>
                </div>
                <div>
                  <span className="font-bold text-[#022448]">홍은익 담임목사</span>
                  <span className="text-[#43474e] ml-2 text-xs">
                    {formatDate(column.sermon?.sermonDate || column.createdAt)}
                  </span>
                </div>
              </div>
              {column.scripture && (
                <span className="flex items-center gap-1 text-[#795900] font-semibold text-sm">
                  <span className="material-symbols-outlined text-base">menu_book</span>
                  {column.scripture}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#43474e]">
                {Math.ceil(plainText.length / 500)}분 읽기
              </span>
              <ShareButtons title={column.title} />
            </div>
          </div>
        </div>
      </header>

      {/* Article Body */}
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
        <article className="max-w-3xl mx-auto">
          {/* Scripture highlight */}
          {column.scripture && (
            <div className="mb-12 pl-6 border-l-4 border-[#795900]">
              <p className="font-serif text-lg md:text-xl text-[#43474e] italic leading-relaxed">
                {column.scripture}
              </p>
            </div>
          )}

          {/* First part of content */}
          <div
            className="column-content column-content-first font-serif text-[1.1rem] md:text-lg leading-[2] text-[#2a2a2a]"
            dangerouslySetInnerHTML={{ __html: contentBefore }}
          />

          {/* Pull Quote */}
          {pullQuote && (
            <blockquote className="my-16 py-12 border-y-2 border-[#795900]/20 text-center px-4">
              <p className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-[#022448] leading-snug max-w-2xl mx-auto break-keep">
                &ldquo;{pullQuote}&rdquo;
              </p>
              <cite className="block mt-6 text-sm text-[#795900] font-bold not-italic tracking-widest uppercase">
                — 홍은익 담임목사
              </cite>
            </blockquote>
          )}

          {/* Rest of content */}
          <div
            className="column-content font-serif text-[1.1rem] md:text-lg leading-[2] text-[#2a2a2a]"
            dangerouslySetInnerHTML={{ __html: contentAfter }}
          />

          {/* Bottom Share */}
          <div className="mt-16 pt-8 border-t border-[#e4e2df] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#43474e]">이 글 공유하기</span>
              <ShareButtons title={column.title} />
            </div>
            {column.sermon?.blogUrl && (
              <a
                href={column.sermon.blogUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#795900] font-semibold hover:underline flex items-center gap-1"
              >
                네이버 블로그 원문
                <span className="material-symbols-outlined text-base">open_in_new</span>
              </a>
            )}
          </div>

          {/* Author Bio */}
          <section className="mt-12 p-8 lg:p-10 bg-[#f5f3f0] rounded-2xl flex flex-col sm:flex-row gap-6 items-center">
            <div className="w-20 h-20 rounded-full bg-[#022448] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#ffdfa0] text-3xl">person</span>
            </div>
            <div>
              <h4 className="font-serif text-xl font-bold text-[#022448] mb-2">홍은익 담임목사</h4>
              <p className="text-[#43474e] text-sm leading-relaxed">
                동남 생명의 빛 교회 담임목사. 말씀 중심의 목회를 통해 성도들의 영적 성장을 인도합니다.
              </p>
            </div>
          </section>
        </article>
      </div>

      {/* Related Columns */}
      {recentColumns.length > 0 && (
        <section className="bg-[#f5f3f0] py-16 lg:py-20 px-6 lg:px-12">
          <div className="max-w-screen-xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <h3 className="font-serif text-2xl lg:text-3xl font-bold text-[#022448]">
                다른 칼럼 읽기
              </h3>
              <Link
                href="/columns"
                className="text-[#795900] font-bold text-sm hover:underline flex items-center gap-1"
              >
                전체 보기
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentColumns.map((col) => (
                <Link
                  key={col.id}
                  href={`/columns/${col.id}`}
                  className="group bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                >
                  {col.scripture && (
                    <span className="text-[#795900] text-xs font-bold tracking-widest uppercase mb-3 block">
                      {col.scripture}
                    </span>
                  )}
                  <h4 className="font-serif text-lg font-bold text-[#022448] group-hover:text-[#795900] transition-colors leading-snug mb-3 line-clamp-2">
                    {col.title}
                  </h4>
                  <p className="text-[#43474e] text-sm leading-relaxed line-clamp-2">
                    {col.content.replace(/<[^>]*>/g, "").slice(0, 80)}...
                  </p>
                  <span className="mt-4 text-[#795900] text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    읽기
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
