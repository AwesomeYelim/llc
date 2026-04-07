import { unstable_cache } from "next/cache"
import prisma from "@/lib/prisma"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Hero } from "@/components/landing/Hero"
import { BrandMessage } from "@/components/landing/BrandMessage"
import { ServiceTimes } from "@/components/landing/ServiceTimes"
import { RecentSermons } from "@/components/landing/RecentSermons"
import { KakaoMap } from "@/components/landing/KakaoMap"
import { QuickLinks } from "@/components/landing/QuickLinks"
import { CTA } from "@/components/landing/CTA"
import { JsonLd } from "@/components/seo/JsonLd"

const getHomeData = unstable_cache(
  async () => {
    const [settingsArr, sermons] = await Promise.all([
      prisma.siteSetting.findMany(),
      prisma.sermon.findMany({
        where: { youtubeId: { not: null } },
        orderBy: { sermonDate: "desc" },
        take: 3,
      }),
    ])
    const settings: Record<string, string> = {}
    settingsArr.forEach((s) => (settings[s.key] = s.value))
    return { settings, sermons }
  },
  ["home-data"],
  { revalidate: 300, tags: ["home"] }
)

export default async function HomePage() {
  const { settings, sermons } = await getHomeData()

  return (
    <>
      <JsonLd />
      <Navbar />
      <main>
        <Hero />
        <BrandMessage />
        <ServiceTimes settings={settings} />
        <RecentSermons sermons={sermons} />
        <QuickLinks
          youtubeUrl={settings.youtube_url}
          blogUrl={settings.blog_url}
        />
        <KakaoMap address={settings.church_address || "충북 청주시 상당구 중고개로125번길 29"} />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
