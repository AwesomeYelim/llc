import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

const BLOG_ID = "hey0190"
const RSS_URL = `https://rss.blog.naver.com/${BLOG_ID}`

interface BlogPost {
  title: string
  link: string
  description: string
  pubDate: string
  category: string
}

function parseCDATA(text: string): string {
  return text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim()
}

function parseRSS(xml: string): BlogPost[] {
  const posts: BlogPost[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match

  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1]
    const title = parseCDATA(item.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "")
    const link = parseCDATA(item.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? "")
    const description = parseCDATA(
      item.match(/<description>([\s\S]*?)<\/description>/)?.[1] ?? ""
    )
    const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() ?? ""
    const category = parseCDATA(
      item.match(/<category>([\s\S]*?)<\/category>/)?.[1] ?? ""
    )

    if (title && link) {
      posts.push({ title, link, description, pubDate, category })
    }
  }

  return posts
}

function cleanBlogUrl(url: string): string {
  return url.replace(/\?fromRss.*$/, "")
}

function cleanDescription(desc: string): string {
  return desc
    .replace(/<[^>]*>/g, "")
    .replace(/&[a-z]+;/gi, " ")
    .trim()
    .slice(0, 500)
}

function extractScripture(text: string): string {
  const match = text.match(/본문\s*[:：]\s*([^\n(]+)/i)
  if (match) return match[1].trim()

  const bibleMatch = text.match(
    /([가-힣]{1,3}\s*\d{1,3}\s*[:\s]\s*\d{1,3}[-~]?\s*\d{0,3})/
  )
  return bibleMatch?.[1]?.trim() ?? ""
}

async function syncBlog() {
  const res = await fetch(RSS_URL, { next: { revalidate: 0 } })
  if (!res.ok) throw new Error(`Blog RSS fetch failed: ${res.status}`)

  const xml = await res.text()
  const posts = parseRSS(xml)

  const sermonPosts = posts.filter(
    (p) => p.category === "설교" || p.category === ""
  )

  let synced = 0
  let skipped = 0

  for (const post of sermonPosts) {
    const blogUrl = cleanBlogUrl(post.link)

    const existing = await prisma.sermon.findFirst({
      where: { blogUrl },
    })

    if (existing) {
      if (!existing.summary && post.description) {
        await prisma.sermon.update({
          where: { id: existing.id },
          data: { summary: cleanDescription(post.description) },
        })
      }
      skipped++
      continue
    }

    // 같은 제목 매칭 시 blogUrl + summary 업데이트
    const cleanTitle = post.title.replace(/[""]/g, "").trim()
    const titleMatch = await prisma.sermon.findFirst({
      where: { title: { contains: cleanTitle } },
    })

    if (titleMatch) {
      await prisma.sermon.update({
        where: { id: titleMatch.id },
        data: {
          blogUrl,
          summary: cleanDescription(post.description),
        },
      })
      synced++
      continue
    }

    const scripture = extractScripture(post.description)
    const pubDate = post.pubDate ? new Date(post.pubDate) : new Date()

    await prisma.sermon.create({
      data: {
        title: cleanTitle,
        scripture,
        sermonDate: pubDate,
        serviceType: "SUNDAY_MAIN",
        blogUrl,
        summary: cleanDescription(post.description),
      },
    })
    synced++
  }

  return { success: true, synced, skipped, total: sermonPosts.length }
}

// Vercel Cron (매일 자동)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await syncBlog()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Blog cron sync error:", error)
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
    const result = await syncBlog()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Blog sync error:", error)
    return NextResponse.json(
      { error: "동기화 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
