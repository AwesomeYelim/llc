import { Metadata } from "next"
import { generatePageMetadata } from "@/lib/seo"
import prisma from "@/lib/prisma"
import Image from "next/image"

export const metadata: Metadata = generatePageMetadata(
  "교회 소개",
  "동남생명의빛교회는 청주시 상당구에 위치한 15명 가족 공동체 교회입니다.",
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

  const values = [
    {
      title: "말씀 중심",
      desc: "하나님의 말씀을 삶의 중심에 두고, 말씀대로 살아가는 공동체입니다.",
      icon: "📖",
    },
    {
      title: "가족 공동체",
      desc: "서로의 이름을 불러주며, 가족처럼 따뜻하게 교제하는 교회입니다.",
      icon: "🤝",
    },
    {
      title: "예배 헌신",
      desc: "온 마음을 다해 하나님을 예배하며, 그분의 임재를 경험합니다.",
      icon: "🙏",
    },
  ]

  return (
    <div>
      {/* Hero */}
      <section className="bg-[#1e3a5f] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">교회 소개</h1>
          <p className="text-white/70 text-lg">
            이름을 불러주는 따뜻한 교회, 동남생명의빛교회
          </p>
        </div>
      </section>

      {/* Church intro */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-[#1e3a5f] mb-6">우리 교회</h2>
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
          <p>
            {settings.church_description ||
              "동남생명의빛교회는 충북 청주시 상당구에 위치한 작지만 따뜻한 가족 공동체 교회입니다. 15명의 성도가 서로의 이름을 불러주며, 하나님의 사랑 안에서 함께 성장하고 있습니다."}
          </p>
        </div>
      </section>

      {/* Pastor */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1e3a5f] mb-6">
            담임목사 {settings.pastor_name || "홍은익"}
          </h2>
          <div className="text-gray-700 leading-relaxed">
            <p>
              {settings.pastor_bio ||
                "홍은익 목사는 말씀 중심의 목회를 통해 성도들이 하나님의 일을 성공시키는 삶을 살도록 인도하고 있습니다. 모든 성도를 이름으로 부르며, 한 영혼 한 영혼을 소중히 여기는 목회를 실천하고 있습니다."}
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Values */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">비전 & 핵심가치</h2>
        <p className="text-xl text-[#d4a017] font-semibold mb-8">
          &ldquo;{settings.vision || "하나님의 일을 성공시켜라"}&rdquo;
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((v) => (
            <div
              key={v.title}
              className="bg-white rounded-xl p-6 border border-gray-100 text-center"
            >
              <span className="text-4xl mb-4 block">{v.icon}</span>
              <h3 className="text-lg font-bold text-[#1e3a5f] mb-2">{v.title}</h3>
              <p className="text-sm text-gray-600">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="bg-white py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-8 text-center">
              포토 갤러리
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((img) => (
                <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={img.imageUrl}
                    alt={img.title || "교회 사진"}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
