import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { notifyIndexNow } from "@/lib/indexnow"

const CHANNEL_ID = "UC-ycCN7v6gzWxuOvM6BWJAg"
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`

interface VideoEntry {
  videoId: string
  title: string
  published: string
}

function parseXML(xml: string): VideoEntry[] {
  const entries: VideoEntry[] = []
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
  let match

  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1]
    const videoId = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1] ?? ""
    const title = entry.match(/<title>(.*?)<\/title>/)?.[1] ?? ""
    const published = entry.match(/<published>(.*?)<\/published>/)?.[1] ?? ""

    if (videoId && title) {
      entries.push({ videoId, title, published })
    }
  }

  return entries
}

async function syncYoutube() {
  const res = await fetch(RSS_URL, { next: { revalidate: 0 } })
  if (!res.ok) throw new Error(`YouTube RSS fetch failed: ${res.status}`)

  const xml = await res.text()
  const videos = parseXML(xml)

  let synced = 0
  let skipped = 0
  const newPaths: string[] = []

  for (const video of videos) {
    const existing = await prisma.sermon.findFirst({
      where: { youtubeId: video.videoId },
    })

    if (existing) {
      skipped++
      continue
    }

    const scriptureMatch = video.title.match(/([가-힣]+\s*\d+[:\s]*\d+[-~]?\d*)/)

    const sermon = await prisma.sermon.create({
      data: {
        title: video.title.trim(),
        scripture: scriptureMatch?.[1] ?? "",
        sermonDate: new Date(video.published),
        serviceType: "SUNDAY_MAIN",
        youtubeUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
        youtubeId: video.videoId,
      },
    })
    newPaths.push(`/sermons/${sermon.id}`)
    synced++
  }

  if (newPaths.length > 0) {
    notifyIndexNow(newPaths)
    revalidatePath("/sermons")
  }

  return { success: true, synced, skipped, total: videos.length }
}

// Vercel Cron (매일 자동)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await syncYoutube()
    return NextResponse.json(result)
  } catch (error) {
    console.error("YouTube cron sync error:", error)
    return NextResponse.json({ error: "Sync failed" }, { status: 500 })
  }
}

// 관리자 수동 동기화
export async function POST() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await syncYoutube()
    return NextResponse.json(result)
  } catch (error) {
    console.error("YouTube sync error:", error)
    return NextResponse.json(
      { error: "동기화 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
