import { Metadata } from "next"
import { generatePageMetadata } from "@/lib/seo"
import prisma from "@/lib/prisma"
import { formatDate, formatFileSize } from "@/lib/utils"
import { QRButton } from "@/components/ui/QRButton"

export const metadata: Metadata = generatePageMetadata(
  "주보 & 예배 PPT",
  "동남 생명의 빛 교회 주보와 예배 PPT를 확인하세요.",
  "/bulletin"
)

export default async function BulletinPage() {
  const bulletins = await prisma.bulletin.findMany({
    include: { files: true },
    orderBy: { serviceDate: "desc" },
  })

  return (
    <div>
      {/* Hero Header */}
      <header className="max-w-screen-2xl mx-auto px-6 lg:px-12 mb-16">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-12 h-[1px] bg-[#795900]" />
            <span className="text-sm uppercase tracking-[0.2em] text-[#795900] font-semibold">
              예배 자료
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-[#022448] mb-6 leading-tight text-balance">
            주보 & 예배 PPT
          </h1>
          <p className="text-lg text-[#43474e] leading-relaxed">
            주보와 예배 PPT를 다운로드하세요.
          </p>
        </div>
      </header>

      <section className="max-w-screen-2xl mx-auto px-6 lg:px-12 pb-24">
        <div className="bg-[#f5f3f0] rounded-xl p-2">
          {bulletins.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left">
                    <th className="px-6 lg:px-8 pb-4 text-xs uppercase tracking-widest text-[#74777f] font-semibold">날짜</th>
                    <th className="px-6 lg:px-8 pb-4 text-xs uppercase tracking-widest text-[#74777f] font-semibold">제목</th>
                    <th className="px-6 lg:px-8 pb-4 text-xs uppercase tracking-widest text-[#74777f] font-semibold text-right">다운로드</th>
                  </tr>
                </thead>
                <tbody>
                  {bulletins.map((bulletin) => (
                    <tr key={bulletin.id} className="group hover:bg-white/50 transition-all">
                      <td className="px-6 lg:px-8 py-8 bg-white first:rounded-l-xl">
                        <div className="font-serif text-xl font-bold text-[#022448]">
                          {formatDate(bulletin.serviceDate).replace(/\d{4}년\s*/, "")}
                        </div>
                      </td>
                      <td className="px-6 lg:px-8 py-8 bg-white">
                        <h3 className="font-serif text-lg font-semibold text-[#022448]">{bulletin.title}</h3>
                      </td>
                      <td className="px-6 lg:px-8 py-8 bg-white last:rounded-r-xl">
                        <div className="flex justify-end gap-2 flex-wrap">
                          {bulletin.files.map((file) => (
                            <div key={file.id} className="flex items-center gap-2">
                              <QRButton url={file.fileUrl} title={bulletin.title} />
                              <a
                                href={`/api/bulletins/${file.id}/download?download=1`}
                                download={file.fileName}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#022448] text-white text-sm font-medium hover:bg-[#1e3a5f] transition-colors"
                              >
                                <span className="material-symbols-outlined text-sm">download</span>
                                {file.fileName.endsWith(".zip") ? "주보+PPT" : file.fileName.split(".").pop()?.toUpperCase()}
                                <span className="text-white/60 text-xs">({formatFileSize(file.fileSize)})</span>
                              </a>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-24">
              <span className="material-symbols-outlined text-[#c4c6cf] text-6xl mb-4">description</span>
              <p className="text-[#43474e]">등록된 주보/PPT가 없습니다.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
