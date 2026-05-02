"use client"

import { useState, useMemo, useEffect } from "react"
import { DownloadButton } from "@/components/DownloadButton"
import { QRButton } from "@/components/ui/QRButton"
import { Pagination } from "@/components/ui/Pagination"
import { formatDate } from "@/lib/utils"

interface ContiItem {
  id: number
  title: string
  serviceDate: string
  fileName: string
  fileUrl: string
  fileSize: number
  downloadCount: number
  musicalKey: string | null
  theme: string | null
  season: string | null
}

type FilterType = "all" | "key" | "theme"
type SortKey = "latest" | "title" | "key"

const PAGE_SIZE = 12

// musicalKey 파싱: "D,A:소망" → { keys: ["D","A"], theme: "소망" }
function parseKey(raw: string | null): { keys: string[]; theme: string | null } {
  if (!raw) return { keys: [], theme: null }
  const colonIdx = raw.indexOf(":")
  if (colonIdx === -1) return { keys: raw.split(",").map((k) => k.trim()), theme: null }
  return {
    keys: raw.substring(0, colonIdx).split(",").map((k) => k.trim()),
    theme: raw.substring(colonIdx + 1).trim() || null,
  }
}

export function PraiseGrid({ contis }: { contis: ContiItem[] }) {
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [selectedValue, setSelectedValue] = useState<string>("")
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortKey>("latest")
  const [currentPage, setCurrentPage] = useState(1)

  // Extract unique values for each filter type
  const filterOptions = useMemo(() => {
    const keys = new Set<string>()
    const themes = new Set<string>()

    contis.forEach((c) => {
      const parsed = parseKey(c.musicalKey)
      parsed.keys.forEach((k) => { if (k) keys.add(k) })
      if (parsed.theme) themes.add(parsed.theme)
      // DB theme 필드도 반영
      if (c.theme) c.theme.split(",").forEach((t) => { if (t.trim()) themes.add(t.trim()) })
    })

    return {
      key: Array.from(keys).sort(),
      theme: Array.from(themes).sort(),
    }
  }, [contis])

  // Filter + sort
  const filtered = useMemo(() => {
    let result = [...contis]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.fileName.toLowerCase().includes(q) ||
          (c.theme && c.theme.toLowerCase().includes(q))
      )
    }

    if (selectedValue && filterType !== "all") {
      result = result.filter((c) => {
        const parsed = parseKey(c.musicalKey)
        switch (filterType) {
          case "key":
            return parsed.keys.includes(selectedValue)
          case "theme":
            return (
              parsed.theme === selectedValue ||
              c.theme?.split(",").some((t) => t.trim() === selectedValue)
            )
          default:
            return true
        }
      })
    }

    switch (sort) {
      case "latest":
        result.sort((a, b) => {
          const dateDiff = new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime()
          return dateDiff !== 0 ? dateDiff : b.id - a.id
        })
        break
      case "title":
        result.sort((a, b) => a.title.localeCompare(b.title, "ko"))
        break
      case "key":
        result.sort((a, b) => {
          const ka = parseKey(a.musicalKey).keys[0] ?? "zzz"
          const kb = parseKey(b.musicalKey).keys[0] ?? "zzz"
          return ka.localeCompare(kb, "en")
        })
        break
    }

    return result
  }, [contis, search, filterType, selectedValue, sort])

  // Reset to page 1 when filter/sort changes
  useEffect(() => { setCurrentPage(1) }, [search, filterType, selectedValue, sort])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const filterTabs: { type: FilterType; label: string; icon: string }[] = [
    { type: "all", label: "전체", icon: "apps" },
    { type: "key", label: "코드별", icon: "music_note" },
    { type: "theme", label: "메세지별", icon: "bookmark" },
  ]

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "latest", label: "최신순" },
    { key: "title", label: "제목순" },
    { key: "key", label: "코드순" },
  ]

  return (
    <div>
      {/* Filter Bar */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#74777f] text-xl">
            search
          </span>
          <input
            type="text"
            placeholder="찬양곡 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#022448]/20 focus:border-[#022448]"
          />
        </div>

        {/* Filter Tabs + Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.type}
                onClick={() => {
                  setFilterType(tab.type)
                  setSelectedValue("")
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
                  filterType === tab.type
                    ? "bg-[#022448] text-white"
                    : "bg-[#f5f3f0] text-[#43474e] hover:bg-[#e8e6e3]"
                }`}
              >
                <span className="material-symbols-outlined text-base">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-[#74777f]">정렬</span>
            <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
              {sortOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSort(opt.key)}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
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

        {/* Sub-filters (tags) */}
        {filterType !== "all" && filterOptions[filterType].length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedValue("")}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                !selectedValue
                  ? "bg-[#795900] text-white"
                  : "bg-white text-[#43474e] border border-gray-200 hover:bg-gray-50"
              }`}
            >
              전체
            </button>
            {filterOptions[filterType].map((val) => (
              <button
                key={val}
                onClick={() => setSelectedValue(val)}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                  selectedValue === val
                    ? "bg-[#795900] text-white"
                    : "bg-white text-[#43474e] border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {filterType === "key" ? `${val} key` : val}
              </button>
            ))}
          </div>
        )}

        {/* Result count */}
        <p className="text-xs text-[#74777f]">
          {filtered.length}개 결과
          {(search || selectedValue) && ` (전체 ${contis.length}개)`}
        </p>
      </div>

      {/* Table */}
      <div className="bg-[#f5f3f0] rounded-xl p-2">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left">
                  <th className="px-6 lg:px-8 pb-4 text-xs uppercase tracking-widest text-[#74777f] font-semibold">
                    날짜
                  </th>
                  <th className="px-6 lg:px-8 pb-4 text-xs uppercase tracking-widest text-[#74777f] font-semibold">
                    제목
                  </th>
                  <th className="px-6 lg:px-8 pb-4 text-xs uppercase tracking-widest text-[#74777f] font-semibold hidden md:table-cell">
                    태그
                  </th>
                  <th className="px-6 lg:px-8 pb-4 text-xs uppercase tracking-widest text-[#74777f] font-semibold hidden md:table-cell">
                    다운로드 수
                  </th>
                  <th className="px-6 lg:px-8 pb-4 text-xs uppercase tracking-widest text-[#74777f] font-semibold text-right">
                    다운로드
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((conti) => (
                  <tr key={conti.id} className="group hover:bg-white/50 transition-all duration-300">
                    <td className="px-6 lg:px-8 py-8 bg-white first:rounded-l-xl">
                      <div className="font-serif text-xl lg:text-2xl font-bold text-[#022448]">
                        {formatDate(conti.serviceDate).replace(/\d{4}년\s*/, "")}
                      </div>
                      <div className="text-xs text-[#43474e] mt-1">
                        {formatDate(conti.serviceDate).match(/\d{4}년/)?.[0]}
                      </div>
                    </td>
                    <td className="px-6 lg:px-8 py-8 bg-white max-w-[200px] md:max-w-md">
                      <h3 className="font-serif text-lg font-semibold text-[#022448] mb-1 break-words">
                        {conti.title}
                      </h3>
                      <p className="text-sm text-[#43474e] break-all truncate">{conti.fileName}</p>
                    </td>
                    <td className="px-6 lg:px-8 py-8 bg-white hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(() => {
                          const parsed = parseKey(conti.musicalKey)
                          return (
                            <>
                              {parsed.keys.map((k) => (
                                <span key={k} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                                  {k} key
                                </span>
                              ))}
                              {parsed.theme && (
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-full">
                                  {parsed.theme}
                                </span>
                              )}
                              {conti.theme && (
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-full">
                                  {conti.theme}
                                </span>
                              )}
                              {conti.season && (
                                <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">
                                  {conti.season}
                                </span>
                              )}
                            </>
                          )
                        })()}
                      </div>
                    </td>
                    <td className="px-6 lg:px-8 py-8 bg-white hidden md:table-cell">
                      <span className="text-[#43474e] text-sm">{conti.downloadCount}회</span>
                    </td>
                    <td className="px-6 lg:px-8 py-8 bg-white last:rounded-r-xl text-right">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <QRButton url={conti.fileUrl} title={conti.title} />
                        <a
                          href={`/api/praise/file?id=${conti.id}&mode=view`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 px-4 py-2 border border-[#1e3a5f] text-[#1e3a5f] rounded-lg text-sm hover:bg-[#1e3a5f]/5 transition-colors"
                        >
                          보기
                        </a>
                        <DownloadButton
                          fileUrl={conti.fileUrl}
                          fileName={conti.fileName}
                          id={conti.id}
                          endpoint="/api/praise"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-24">
            <span className="material-symbols-outlined text-[#c4c6cf] text-6xl mb-4">search_off</span>
            <p className="text-[#43474e]">
              {search ? `"${search}" 검색 결과가 없습니다.` : "해당 조건에 맞는 콘티가 없습니다."}
            </p>
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}
