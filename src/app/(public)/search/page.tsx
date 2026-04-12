import { Metadata } from "next"
import Link from "next/link"
import { generatePageMetadata } from "@/lib/seo"
import prisma from "@/lib/prisma"

export const metadata: Metadata = generatePageMetadata(
  "통합 검색",
  "동남 생명의 빛 교회 설교, 칼럼, 찬양 통합 검색",
  "/search"
)

interface SearchResult {
  sermons: Array<{ id: number; title: string; scripture: string; sermonDate: string; youtubeId: string | null }>
  columns: Array<{ id: number; title: string; scripture: string | null; createdAt: string; coverImageUrl: string | null }>
  praise: Array<{ id: number; title: string; serviceDate: string; musicalKey: string | null; theme: string | null }>
}

async function search(q: string): Promise<SearchResult> {
  if (!q || q.length < 2) return { sermons: [], columns: [], praise: [] }

  const [sermons, columns, praise] = await Promise.all([
    prisma.sermon.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { scripture: { contains: q, mode: "insensitive" } },
          { summary: { contains: q, mode: "insensitive" } },
          { series: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { sermonDate: "desc" },
      take: 10,
      select: { id: true, title: true, scripture: true, sermonDate: true, youtubeId: true },
    }),
    prisma.column.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
          { scripture: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, title: true, scripture: true, createdAt: true, coverImageUrl: true },
    }),
    prisma.praiseConti.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { fileName: { contains: q, mode: "insensitive" } },
          { theme: { contains: q, mode: "insensitive" } },
          { season: { contains: q, mode: "insensitive" } },
          { musicalKey: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { serviceDate: "desc" },
      take: 10,
      select: { id: true, title: true, serviceDate: true, musicalKey: true, theme: true },
    }),
  ])

  return {
    sermons: sermons.map((s) => ({ ...s, sermonDate: s.sermonDate.toISOString() })),
    columns: columns.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() })),
    praise: praise.map((p) => ({ ...p, serviceDate: p.serviceDate.toISOString() })),
  }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
}

function highlight(text: string, q: string) {
  if (!q) return text
  const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
  return text.replace(regex, "**$1**")
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const q = params.q?.trim() ?? ""
  const results = await search(q)
  const total = results.sermons.length + results.columns.length + results.praise.length

  return (
    <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-24">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-12 h-[1px] bg-[#795900]" />
          <span className="text-sm uppercase tracking-[0.2em] text-[#795900] font-semibold">통합 검색</span>
        </div>
        <h1 className="font-serif text-3xl md:text-5xl font-bold text-[#022448] mb-4">
          {q ? `"${q}" 검색 결과` : "검색"}
        </h1>
        {q && (
          <p className="text-[#43474e]">
            총 <span className="font-bold text-[#022448]">{total}건</span> 결과
          </p>
        )}
      </div>

      {/* Search form */}
      <form method="GET" action="/search" className="mb-12">
        <div className="relative max-w-2xl">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#74777f]">
            search
          </span>
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="설교, 칼럼, 찬양 검색..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-[#e4e2df] rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#022448]/20 focus:border-[#022448]"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#022448] text-white rounded-lg text-sm hover:bg-[#1e3a5f] transition-colors"
          >
            검색
          </button>
        </div>
      </form>

      {!q && (
        <div className="text-center py-24 text-[#43474e]">
          <span className="material-symbols-outlined text-[#c4c6cf] text-6xl mb-4 block">search</span>
          검색어를 입력하세요.
        </div>
      )}

      {q && total === 0 && (
        <div className="text-center py-24 text-[#43474e]">
          <span className="material-symbols-outlined text-[#c4c6cf] text-6xl mb-4 block">search_off</span>
          &ldquo;{q}&rdquo;에 대한 검색 결과가 없습니다.
        </div>
      )}

      {/* Results */}
      <div className="space-y-12">
        {/* Sermons */}
        {results.sermons.length > 0 && (
          <section>
            <h2 className="font-serif text-xl text-[#022448] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#795900]">play_circle</span>
              설교 영상 ({results.sermons.length})
            </h2>
            <div className="space-y-2">
              {results.sermons.map((s) => (
                <Link
                  key={s.id}
                  href={`/sermons/${s.id}`}
                  className="flex items-start gap-4 p-4 bg-white rounded-xl border border-[#e4e2df] hover:border-[#795900]/30 hover:shadow-sm transition-all group"
                >
                  {s.youtubeId && (
                    <img
                      src={`https://img.youtube.com/vi/${s.youtubeId}/mqdefault.jpg`}
                      alt=""
                      className="w-24 h-16 object-cover rounded-lg shrink-0"
                    />
                  )}
                  <div>
                    <p className="font-serif font-semibold text-[#022448] group-hover:text-[#795900] transition-colors">
                      {s.title}
                    </p>
                    <p className="text-sm text-[#74777f] mt-1">{s.scripture} · {formatDate(s.sermonDate)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Columns */}
        {results.columns.length > 0 && (
          <section>
            <h2 className="font-serif text-xl text-[#022448] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#795900]">article</span>
              설교 칼럼 ({results.columns.length})
            </h2>
            <div className="space-y-2">
              {results.columns.map((c) => (
                <Link
                  key={c.id}
                  href={`/columns/${c.id}`}
                  className="flex items-start gap-4 p-4 bg-white rounded-xl border border-[#e4e2df] hover:border-[#795900]/30 hover:shadow-sm transition-all group"
                >
                  <div>
                    <p className="font-serif font-semibold text-[#022448] group-hover:text-[#795900] transition-colors">
                      {c.title}
                    </p>
                    <p className="text-sm text-[#74777f] mt-1">
                      {c.scripture && `${c.scripture} · `}{formatDate(c.createdAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Praise */}
        {results.praise.length > 0 && (
          <section>
            <h2 className="font-serif text-xl text-[#022448] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#795900]">music_note</span>
              찬양 콘티 ({results.praise.length})
            </h2>
            <div className="space-y-2">
              {results.praise.map((p) => (
                <Link
                  key={p.id}
                  href="/praise"
                  className="flex items-start gap-4 p-4 bg-white rounded-xl border border-[#e4e2df] hover:border-[#795900]/30 hover:shadow-sm transition-all group"
                >
                  <div>
                    <p className="font-serif font-semibold text-[#022448] group-hover:text-[#795900] transition-colors">
                      {p.title}
                    </p>
                    <p className="text-sm text-[#74777f] mt-1">
                      {formatDate(p.serviceDate)}
                      {p.musicalKey && ` · ${p.musicalKey} key`}
                      {p.theme && ` · ${p.theme}`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
