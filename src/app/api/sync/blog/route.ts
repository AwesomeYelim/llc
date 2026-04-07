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

function extractPostId(url: string): string {
  const match = url.match(/\/(\d+)(?:\?|$)/)
  return match?.[1] ?? ""
}

function extractScripture(text: string): string {
  const match = text.match(/본문\s*[:：]\s*([^\n(]+)/i)
  if (match) return match[1].trim()
  return ""
}

async function fetchBlogContent(postId: string): Promise<string> {
  const viewUrl = `https://blog.naver.com/PostView.naver?blogId=${BLOG_ID}&logNo=${postId}&redirect=Dlog&widgetTypeCall=true`
  const res = await fetch(viewUrl)
  if (!res.ok) return ""

  const html = await res.text()

  // 텍스트 단락 추출
  const paragraphs: string[] = []
  const re = /<p class="se-text-paragraph[^"]*"[^>]*>([\s\S]*?)<\/p>/g
  let match
  while ((match = re.exec(html)) !== null) {
    let text = match[1]
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .trim()
    if (text) paragraphs.push(text)
  }

  if (paragraphs.length === 0) return ""

  // HTML로 포맷팅 (가독성 좋게)
  return paragraphs
    .map((p) => {
      // 성경 구절 (숫자:숫자 패턴) → 강조
      if (/^\d+:\d+/.test(p)) {
        return `<p class="bible-verse">${p}</p>`
      }
      // 소제목 느낌 (짧고 번호 포함)
      if (/^\d+\.\s/.test(p) && p.length < 100) {
        return `<h3>${p}</h3>`
      }
      // 일반 단락
      return `<p>${p}</p>`
    })
    .join("\n")
}

async function syncBlog() {
  const res = await fetch(RSS_URL, { next: { revalidate: 0 } })
  if (!res.ok) throw new Error(`Blog RSS fetch failed: ${res.status}`)

  const xml = await res.text()
  const posts = parseRSS(xml)

  // 설교 카테고리만
  const sermonPosts = posts.filter((p) => p.category === "설교")

  let synced = 0
  let skipped = 0

  for (const post of sermonPosts) {
    const blogUrl = cleanBlogUrl(post.link)
    const postId = extractPostId(blogUrl)
    const cleanTitle = post.title.replace(/[""]/g, "").replace(/^제목\s*[:：]\s*/, "").trim()

    // 이미 Column에 같은 제목이 있으면 스킵
    const existingColumn = await prisma.column.findFirst({
      where: {
        OR: [
          { title: cleanTitle },
          { title: { contains: cleanTitle.slice(0, 20) } },
        ],
      },
    })

    if (existingColumn) {
      skipped++
      continue
    }

    // 전체 본문 스크래핑
    const content = postId ? await fetchBlogContent(postId) : ""
    if (!content) {
      skipped++
      continue
    }

    const scripture = extractScripture(post.description)
    const pubDate = post.pubDate ? new Date(post.pubDate) : new Date()

    // Sermon 레코드 찾기 또는 생성
    let sermon = await prisma.sermon.findFirst({
      where: {
        OR: [
          { blogUrl },
          { title: { contains: cleanTitle.slice(0, 15) } },
        ],
      },
    })

    if (!sermon) {
      sermon = await prisma.sermon.create({
        data: {
          title: cleanTitle,
          scripture,
          sermonDate: pubDate,
          serviceType: "SUNDAY_MAIN",
          blogUrl,
          summary: post.description.replace(/<[^>]*>/g, "").slice(0, 500),
        },
      })
    } else if (!sermon.blogUrl) {
      await prisma.sermon.update({
        where: { id: sermon.id },
        data: { blogUrl },
      })
    }

    // Column 생성
    await prisma.column.create({
      data: {
        title: cleanTitle,
        content,
        scripture,
        sermonId: sermon.id,
      },
    })

    synced++
  }

  return { success: true, synced, skipped, total: sermonPosts.length }
}

// Vercel Cron
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
