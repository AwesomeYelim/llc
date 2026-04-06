import { Metadata } from "next"
import { generatePageMetadata } from "@/lib/seo"
import prisma from "@/lib/prisma"
import { formatDate, formatFileSize } from "@/lib/utils"
import { Badge } from "@/components/ui/Badge"

export const metadata: Metadata = generatePageMetadata(
  "주보 & 예배 PPT",
  "동남생명의빛교회 주보와 예배 PPT를 확인하세요.",
  "/bulletin"
)

export default async function BulletinPage() {
  const bulletins = await prisma.bulletin.findMany({
    include: { files: true },
    orderBy: { serviceDate: "desc" },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[#1e3a5f] mb-2">주보 & 예배 PPT</h1>
      <p className="text-gray-500 mb-8">주보와 예배 PPT를 다운로드하세요.</p>

      <div className="space-y-4">
        {bulletins.map((bulletin) => (
          <div
            key={bulletin.id}
            className="bg-white rounded-xl border border-gray-100 p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <h3 className="font-semibold text-gray-900">{bulletin.title}</h3>
              <Badge variant={bulletin.bulletinType === "PPT" ? "warning" : "primary"}>
                {bulletin.bulletinType === "PPT" ? "PPT" : "주보"}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mb-3">{formatDate(bulletin.serviceDate)}</p>
            <div className="space-y-2">
              {bulletin.files.map((file) => (
                <a
                  key={file.id}
                  href={file.fileUrl}
                  download={file.fileName}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📄</span>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{file.fileName}</p>
                      <p className="text-xs text-gray-400">{formatFileSize(file.fileSize)}</p>
                    </div>
                  </div>
                  <span className="text-sm text-[#1e3a5f] font-medium">다운로드</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {bulletins.length === 0 && (
        <p className="text-center text-gray-400 py-20">등록된 주보/PPT가 없습니다.</p>
      )}
    </div>
  )
}
