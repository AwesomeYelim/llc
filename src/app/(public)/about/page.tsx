import { Metadata } from "next"
import { generatePageMetadata } from "@/lib/seo"
import prisma from "@/lib/prisma"
import Image from "next/image"
import { GalleryLightbox } from "@/components/about/GalleryLightbox"

export const metadata: Metadata = generatePageMetadata(
  "교회 소개",
  "동남 생명의 빛 교회는 청주시 상당구에 위치한 가족 공동체 교회입니다.",
  "/about"
)

async function getSettings() {
  const settings = await prisma.siteSetting.findMany()
  const map: Record<string, string> = {}
  settings.forEach((s) => (map[s.key] = s.value))
  return map
}

async function getGallery() {
  return prisma.galleryImage.findMany({ orderBy: { sortOrder: "asc" }, take: 12 })
}

export default async function AboutPage() {
  const [settings, gallery] = await Promise.all([getSettings(), getGallery()])

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#022448]/80 to-[#1e3a5f]/90 z-10" />
          <Image
            src="/images/after_worship.png"
            alt="동남 생명의 빛 교회"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative z-20 text-center px-6 max-w-4xl">
          <p className="text-[#ffdfa0] text-sm tracking-widest uppercase mb-4">
            우리의 여정
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl text-white font-serif font-bold leading-tight mb-8">
            빛과 은혜가 머무는
            <br />
            <span className="italic text-[#f6be39]">영혼의 안식처</span>
          </h1>
          <div className="w-12 h-1 mx-auto bg-[#795900]" />
        </div>
      </section>

      {/* History Section - Editorial Layout */}
      <section className="py-24 lg:py-32 px-6 lg:px-12 bg-[#fbf9f6]">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="md:col-span-5 space-y-8">
            <span className="inline-block py-1 px-3 bg-[#eae8e5] rounded-full text-xs text-[#795900] uppercase tracking-wider font-semibold">
              이름을 불러주는 교회
            </span>
            <h2 className="text-3xl md:text-5xl font-serif text-[#022448] leading-tight">
              믿음에 뿌리 내리고,
              <br />
              사랑으로 성장합니다
            </h2>
            <p className="text-[#43474e] leading-relaxed text-lg">
              {settings.church_description ||
                "동남 생명의 빛 교회는 충북 청주시 상당구에 위치한 작지만 따뜻한 가족 공동체 교회입니다. 성도들이 서로의 이름을 불러주며, 하나님의 사랑 안에서 함께 성장하고 있습니다."}
            </p>
          </div>
          <div className="md:col-span-7 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#f5f3f0] p-8 rounded-xl hover:-translate-y-1 transition-transform duration-500">
                <h3 className="text-xl font-serif text-[#022448] mb-4">우리의 기초</h3>
                <p className="text-[#43474e] text-sm leading-relaxed">
                  성경이라는 견고한 반석 위에 세워진 교회로서, 뜨거운 기도와 헌신적인 섬김은 교회의 소중한 유산입니다.
                </p>
              </div>
              <div className="bg-[#f5f3f0] p-8 rounded-xl hover:-translate-y-1 transition-transform duration-500">
                <h3 className="text-xl font-serif text-[#022448] mb-4">함께하는 삶</h3>
                <p className="text-[#43474e] text-sm leading-relaxed">
                  작은 교회이기에 더 깊이 교제하고, 서로의 기쁨과 아픔을 나누며 진정한 가족 공동체를 이루어갑니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spiritual Quote */}
      <section className="py-24 bg-[#f5f3f0]">
        <div className="max-w-3xl mx-auto text-center px-6">
          <div className="w-px h-16 bg-[#795900] mx-auto mb-8" />
          <blockquote className="text-2xl md:text-3xl font-serif italic text-[#022448] leading-relaxed break-keep">
            &ldquo;{settings.vision || "하나님의 일을 성공시켜라"}&rdquo;
          </blockquote>
          <p className="mt-6 text-[#795900] uppercase tracking-widest text-sm font-semibold">
            — 동남 생명의 빛 교회 비전
          </p>
        </div>
      </section>

      {/* Pastor Section */}
      <section className="py-24 lg:py-32 px-6 lg:px-12 bg-[#fbf9f6]">
        <div className="max-w-screen-xl mx-auto">
          <div className="bg-[#e4e2df] rounded-xl overflow-hidden flex flex-col md:flex-row shadow-sm">
            <div className="md:w-1/2 relative h-[400px] md:h-auto bg-[#1e3a5f] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#8aa4cf] text-[120px]">
                person
              </span>
            </div>
            <div className="md:w-1/2 p-8 lg:p-16 flex flex-col justify-center">
              <span className="text-[#795900] font-semibold tracking-widest text-sm mb-4">
                담임 목사 소개
              </span>
              <h2 className="text-3xl md:text-4xl font-serif text-[#022448] mb-6">
                {settings.pastor_name || "홍은익"} 담임목사
              </h2>
              <div className="space-y-4 text-[#43474e] leading-relaxed">
                <p>
                  {settings.pastor_bio ||
                    "홍은익 목사는 말씀 중심의 목회를 통해 성도들이 하나님의 일을 성공시키는 삶을 살도록 인도하고 있습니다. 모든 성도를 이름으로 부르며, 한 영혼 한 영혼을 소중히 여기는 목회를 실천하고 있습니다."}
                </p>
              </div>
              <div className="mt-8">
                <a
                  href="/sermons"
                  className="inline-flex items-center gap-2 bg-[#022448] text-white px-6 py-3 rounded-xl hover:bg-[#1e3a5f] transition-colors"
                >
                  말씀 더 보기
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values - Bento Grid */}
      <section className="py-24 lg:py-32 px-6 lg:px-12 bg-[#f5f3f0]">
        <div className="max-w-screen-xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-serif text-[#022448] mb-4">핵심 가치</h2>
            <p className="text-[#43474e] max-w-xl mx-auto">
              우리 공동체를 지탱하고 모든 결정의 기준이 되는 세 가지 기둥입니다.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Value 1 - Large */}
            <div className="md:col-span-8 relative overflow-hidden rounded-xl bg-[#022448] min-h-[350px] flex items-end">
              <div className="absolute inset-0 bg-gradient-to-t from-[#022448] via-transparent to-transparent" />
              <div className="relative p-8 lg:p-12">
                <span className="text-[#ffdfa0] text-5xl font-serif mb-4 opacity-50 block">01</span>
                <h3 className="text-2xl lg:text-3xl font-serif text-white mb-4">말씀 중심</h3>
                <p className="text-[#adc8f5] max-w-md">
                  우리의 모든 사역은 변치 않는 성경적 진리 위에 서 있습니다. 부단한 말씀 연구와 실천을 통해 참된 지혜를 구합니다.
                </p>
              </div>
            </div>
            {/* Value 2 */}
            <div className="md:col-span-4 bg-white p-8 lg:p-12 rounded-xl flex flex-col justify-between hover:shadow-lg transition-shadow">
              <div>
                <span className="text-[#795900] text-5xl font-serif mb-8 block">02</span>
                <h3 className="text-2xl font-serif text-[#022448] mb-4">가족 공동체</h3>
                <p className="text-[#43474e] text-sm leading-relaxed">
                  교회는 집과 같아야 합니다. 서로의 이름을 불러주며, 세대를 초월한 진실한 관계를 맺습니다.
                </p>
              </div>
              <div className="mt-8">
                <span className="material-symbols-outlined text-4xl text-[#795900]">diversity_3</span>
              </div>
            </div>
            {/* Value 3 */}
            <div className="md:col-span-12 bg-gradient-to-r from-[#795900] to-[#b38a00] p-1 rounded-xl">
              <div className="bg-white h-full w-full rounded-lg p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1">
                  <span className="text-[#795900] text-5xl font-serif mb-4 block">03</span>
                  <h3 className="text-2xl lg:text-3xl font-serif text-[#022448] mb-4">예배의 헌신</h3>
                  <p className="text-[#43474e] max-w-2xl">
                    예배는 일시적인 행사가 아닌 우리의 삶 그 자체입니다. 온 마음을 다해 하나님을 예배하며, 그분의 임재를 경험합니다.
                  </p>
                </div>
                <div className="relative w-32 h-32 md:w-48 md:h-48 flex items-center justify-center shrink-0">
                  <div className="absolute inset-0 border-2 border-dashed border-[#795900] rounded-full animate-[spin_20s_linear_infinite]" />
                  <span
                    className="material-symbols-outlined text-6xl text-[#795900]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    auto_awesome
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="py-24 px-6 lg:px-12 bg-[#fbf9f6]">
          <div className="max-w-screen-xl mx-auto">
            <h2 className="text-3xl font-serif text-[#022448] mb-12 text-center">포토 갤러리</h2>
            <GalleryLightbox images={gallery} />
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 lg:py-32 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto bg-[#022448] rounded-xl p-12 lg:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#795900]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <h2 className="font-serif text-3xl md:text-4xl mb-8 relative z-10">
            생명의 빛을 경험하세요
          </h2>
          <p className="text-[#8aa4cf] text-lg mb-10 max-w-2xl mx-auto relative z-10">
            이번 주일, 저희와 함께 예배드리지 않으시겠습니까?
          </p>
          <div className="flex flex-wrap justify-center gap-6 relative z-10">
            <a
              href="/sermons"
              className="bg-[#795900] text-white px-10 py-4 rounded-xl font-bold hover:bg-[#ffc641] hover:text-[#022448] transition-all"
            >
              예배 안내
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
