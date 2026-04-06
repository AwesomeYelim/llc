import { Metadata } from "next"
import { generatePageMetadata } from "@/lib/seo"
import prisma from "@/lib/prisma"
import { formatDate, formatFileSize } from "@/lib/utils"
import { DownloadButton } from "@/components/DownloadButton"

export const metadata: Metadata = generatePageMetadata(
  "찬양 콘티",
  "동남생명의빛교회 찬양 콘티를 무료로 다운로드하세요.",
  "/praise"
)

export default async function PraisePage() {
  const contis = await prisma.praiseConti.findMany({
    orderBy: { serviceDate: "desc" },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[#1e3a5f] mb-2">찬양 콘티</h1>
      <p className="text-gray-500 mb-8">예배에 사용된 찬양 콘티를 무료로 다운로드하세요.</p>

      <div className="space-y-4">
        {contis.map((conti) => (
          <div
            key={conti.id}
            className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between gap-4"
          >
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{conti.title}</h3>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <span>{formatDate(conti.serviceDate)}</span>
                <span>{formatFileSize(conti.fileSize)}</span>
                <span>{conti.downloadCount}회 다운로드</span>
              </div>
            </div>
            <DownloadButton
              fileUrl={conti.fileUrl}
              fileName={conti.fileName}
              id={conti.id}
              endpoint="/api/praise"
            />
          </div>
        ))}
      </div>

      {contis.length === 0 && (
        <p className="text-center text-gray-400 py-20">등록된 콘티가 없습니다.</p>
      )}
    </div>
  )
}
