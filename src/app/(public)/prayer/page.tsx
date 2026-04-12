import { Metadata } from "next"
import { generatePageMetadata } from "@/lib/seo"
import { PrayerForm } from "@/components/prayer/PrayerForm"

export const metadata: Metadata = generatePageMetadata(
  "기도 요청",
  "기도 제목을 나누고 함께 기도해드립니다.",
  "/prayer"
)

export default async function PrayerPage() {
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

      <div className="max-w-2xl">
        <PrayerForm />
      </div>
    </div>
  )
}
