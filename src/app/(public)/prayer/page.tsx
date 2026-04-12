import { Metadata } from "next"
import { generatePageMetadata } from "@/lib/seo"
import prisma from "@/lib/prisma"
import { PrayerForm } from "@/components/prayer/PrayerForm"

export const metadata: Metadata = generatePageMetadata(
  "기도 요청",
  "기도 제목을 나누고 함께 기도해드립니다.",
  "/prayer"
)

export default async function PrayerPage() {
  const answered = await prisma.prayerRequest.findMany({
    where: { isAnonymous: false, isAnswered: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  return (
    <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-24">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-12 h-[1px] bg-[#795900]" />
          <span className="text-sm uppercase tracking-[0.2em] text-[#795900] font-semibold">
            기도 요청
          </span>
        </div>
        <h1 className="font-serif text-3xl md:text-5xl font-bold text-[#022448] mb-4">
          함께 기도해드립니다
        </h1>
        <p className="text-[#43474e] text-lg max-w-xl">
          기도 제목을 남겨주세요. 담임목사님과 교우들이 함께 기도합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Submit form */}
        <PrayerForm />

        {/* Answered prayers */}
        <div>
          <h2 className="font-serif text-xl text-[#022448] mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#795900]">check_circle</span>
            응답된 기도
          </h2>
          {answered.length > 0 ? (
            <div className="space-y-4">
              {answered.map((p) => (
                <div key={p.id} className="bg-[#f5f3f0] rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-[#795900] bg-[#ffdfa0]/30 px-2 py-0.5 rounded-full">
                      응답됨
                    </span>
                    <span className="text-xs text-[#74777f]">{p.name}</span>
                  </div>
                  <p className="text-[#43474e] text-sm leading-relaxed">{p.content}</p>
                  <p className="text-xs text-[#74777f] mt-2">
                    {new Date(p.createdAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-[#43474e] bg-[#f5f3f0] rounded-xl">
              <span className="material-symbols-outlined text-[#c4c6cf] text-5xl mb-3 block">
                favorite
              </span>
              기도 응답 사례가 쌓이고 있습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
