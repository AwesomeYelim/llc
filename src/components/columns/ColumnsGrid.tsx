"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

interface ColumnItem {
  id: number
  title: string
  content: string
  scripture: string | null
  viewCount: number
  createdAt: string
  sermonDate: string | null
}

type SortKey = "latest" | "oldest" | "views" | "title"

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "latest", label: "최신순" },
  { key: "oldest", label: "오래된순" },
  { key: "views", label: "조회순" },
  { key: "title", label: "제목순" },
]

function getDate(col: ColumnItem) {
  return new Date(col.sermonDate || col.createdAt).getTime()
}

const PAGE_SIZE = 12

export function ColumnsGrid({ columns }: { columns: ColumnItem[] }) {
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortKey>("latest")
  const [currentPage, setCurrentPage] = useState(1)

  const filtered = useMemo(() => {
    let result = [...columns]

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (col) =>
          col.title.toLowerCase().includes(q) ||
          col.scripture?.toLowerCase().includes(q) ||
          col.content.toLowerCase().includes(q)
      )
    }

    switch (sort) {
      case "latest":
        result.sort((a, b) => getDate(b) - getDate(a))
        break
      case "oldest":
        result.sort((a, b) => getDate(a) - getDate(b))
        break
      case "views":
        result.sort((a, b) => b.viewCount - a.viewCount)
        break
      case "title":
        result.sort((a, b) => a.title.localeCompare(b.title, "ko"))
        break
    }

    return result
  }, [columns, search, sort])

  useEffect(() => { setCurrentPage(1) }, [search, sort])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <>
      {/* Search & Sort Bar */}
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 mb-10">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-lg">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#74777f] text-xl">
              search
            </span>
            <input
              type="text"
              placeholder="제목, 성경구절로 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-[#c4c6cf]/30 rounded-xl text-sm text-[#1b1c1a] placeholder:text-[#74777f] focus:outline-none focus:ring-2 focus:ring-[#795900]/30 focus:border-[#795900] transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#74777f] hover:text-[#1b1c1a]"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-[#74777f] shrink-0">정렬</span>
            <div className="flex bg-white border border-[#c4c6cf]/30 rounded-xl overflow-hidden">
              {sortOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSort(opt.key)}
                  className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    sort === opt.key
                      ? "bg-[#022448] text-white"
                      : "text-[#43474e] hover:bg-[#f5f3f0]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results count */}
        {search && (
          <p className="mt-3 text-sm text-[#74777f]">
            {filtered.length > 0
              ? `"${search}" 검색 결과 ${filtered.length}건`
              : `"${search}"에 대한 검색 결과가 없습니다.`}
          </p>
        )}
      </div>

      {/* Grid — uniform layout, no layout shift */}
      {filtered.length > 0 ? (
        <section className="max-w-screen-2xl mx-auto px-6 lg:px-12 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((col) => (
              <Link
                key={col.id}
                href={`/columns/${col.id}`}
                className="group"
              >
                <article className="h-full bg-white rounded-xl border border-[#c4c6cf]/20 p-6 lg:p-8 hover:shadow-lg transition-shadow duration-300 flex flex-col">
                  {col.scripture && (
                    <span className="text-[#795900] text-xs font-bold tracking-widest uppercase mb-3 block">
                      {col.scripture}
                    </span>
                  )}
                  <h3 className="font-serif text-xl lg:text-2xl font-bold text-[#022448] group-hover:text-[#795900] transition-colors leading-snug mb-3 line-clamp-2">
                    {col.title}
                  </h3>
                  <p className="text-[#43474e] text-sm leading-relaxed line-clamp-3 flex-1">
                    {col.content.slice(0, 150)}...
                  </p>
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#e4e2df]">
                    <div className="flex items-center gap-3 text-xs text-[#43474e]">
                      <span>{formatDate(col.sermonDate || col.createdAt)}</span>
                      <span className="flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        {col.viewCount}
                      </span>
                    </div>
                    <span className="text-[#795900] font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      읽기
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="col-span-full flex justify-center items-center gap-2 mt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg text-sm border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                이전
              </button>
              <span className="text-sm text-[#74777f]">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg text-sm border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                다음
              </button>
            </div>
          )}
        </section>
      ) : (
        <div className="text-center py-24 max-w-screen-2xl mx-auto px-6 lg:px-12">
          <span className="material-symbols-outlined text-[#c4c6cf] text-6xl mb-4">article</span>
          <p className="text-[#43474e]">
            {search ? "검색 결과가 없습니다." : "등록된 글이 없습니다."}
          </p>
        </div>
      )}
    </>
  )
}
