import { Metadata } from "next"
import { generatePageMetadata } from "@/lib/seo"
import prisma from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import { DownloadButton } from "@/components/DownloadButton"

export const metadata: Metadata = generatePageMetadata(
  "찬양 콘티 & 가사 PPT",
  "동남 생명의 빛 교회 찬양 콘티와 가사 PPT를 무료로 다운로드하세요.",
  "/praise"
)

export default async function PraisePage() {
  const contis = await prisma.praiseConti.findMany({
    orderBy: { serviceDate: "desc" },
  })

  const totalDownloads = contis.reduce((sum, c) => sum + c.downloadCount, 0)

  return (
    <div>
      {/* Hero Header */}
      <section className="max-w-screen-2xl mx-auto px-6 lg:px-12 mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-12 h-[1px] bg-[#795900]" />
              <span className="text-sm uppercase tracking-[0.2em] text-[#795900] font-semibold">
                예배 리소스
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-[#022448] mb-6 leading-tight">
              찬양 콘티 & 가사 PPT
            </h1>
            <p className="text-lg text-[#43474e] leading-relaxed max-w-xl">
              매주 예배에서 사용된 찬양 콘티와 가사 PPT를 확인하고 자유롭게 다운로드하세요.
            </p>
          </div>
          <div className="flex items-center gap-4 pb-2">
            <div className="p-4 bg-[#f5f3f0] rounded-xl">
              <span className="text-xs text-[#43474e] block mb-1">총 리소스</span>
              <span className="font-serif text-2xl font-bold text-[#022448]">{contis.length}개</span>
            </div>
            <div className="p-4 bg-[#f5f3f0] rounded-xl">
              <span className="text-xs text-[#43474e] block mb-1">총 다운로드</span>
              <span className="font-serif text-2xl font-bold text-[#022448]">{totalDownloads}회</span>
            </div>
          </div>
        </div>
      </section>

      {/* Spiritual Quote */}
      <section className="max-w-screen-2xl mx-auto px-6 lg:px-12 mb-24 flex justify-center">
        <div className="text-center max-w-3xl">
          <div className="w-[2px] h-12 bg-[#795900] mx-auto mb-6" />
          <blockquote className="font-serif text-xl md:text-2xl italic text-[#022448] leading-relaxed">
            &ldquo;시와 찬송과 신령한 노래를 부르며 너희의 마음으로 주께 노래하며 찬송하라&rdquo;
          </blockquote>
          <cite className="block mt-4 text-[#795900] text-sm font-semibold tracking-widest uppercase not-italic">
            — 에베소서 5:19
          </cite>
        </div>
      </section>

      {/* Table Layout */}
      <section className="max-w-screen-2xl mx-auto px-6 lg:px-12 pb-24">
        <div className="bg-[#f5f3f0] rounded-xl p-2">
          {contis.length > 0 ? (
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
                      다운로드 수
                    </th>
                    <th className="px-6 lg:px-8 pb-4 text-xs uppercase tracking-widest text-[#74777f] font-semibold text-right">
                      다운로드
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {contis.map((conti) => (
                    <tr key={conti.id} className="group hover:bg-white/50 transition-all duration-300">
                      <td className="px-6 lg:px-8 py-8 bg-white first:rounded-l-xl">
                        <div className="font-serif text-xl lg:text-2xl font-bold text-[#022448]">
                          {formatDate(conti.serviceDate).replace(/\d{4}년\s*/, "")}
                        </div>
                        <div className="text-xs text-[#43474e] mt-1">{formatDate(conti.serviceDate).match(/\d{4}년/)?.[0]}</div>
                      </td>
                      <td className="px-6 lg:px-8 py-8 bg-white">
                        <h3 className="font-serif text-lg font-semibold text-[#022448] mb-1">
                          {conti.title}
                        </h3>
                        <p className="text-sm text-[#43474e]">{conti.fileName}</p>
                      </td>
                      <td className="px-6 lg:px-8 py-8 bg-white hidden md:table-cell">
                        <span className="text-[#43474e] text-sm">{conti.downloadCount}회</span>
                      </td>
                      <td className="px-6 lg:px-8 py-8 bg-white last:rounded-r-xl text-right">
                        <DownloadButton
                          fileUrl={conti.fileUrl}
                          fileName={conti.fileName}
                          id={conti.id}
                          endpoint="/api/praise"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-24">
              <span className="material-symbols-outlined text-[#c4c6cf] text-6xl mb-4">music_off</span>
              <p className="text-[#43474e]">등록된 콘티가 없습니다.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
