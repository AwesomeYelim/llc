import { NextRequest, NextResponse } from "next/server"
import { revalidateTag, revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { notifyIndexNow } from "@/lib/indexnow"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "12")
  const serviceType = searchParams.get("serviceType")
  const series = searchParams.get("series")

  const where: Record<string, unknown> = {}
  if (serviceType) where.serviceType = serviceType
  if (series) where.series = series

  const [data, total] = await Promise.all([
    prisma.sermon.findMany({
      where,
      orderBy: { sermonDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.sermon.count({ where }),
  ])

  return NextResponse.json({
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const sermon = await prisma.sermon.create({
    data: {
      title: body.title,
      scripture: body.scripture,
      sermonDate: new Date(body.sermonDate),
      serviceType: body.serviceType,
      youtubeUrl: body.youtubeUrl || null,
      youtubeId: body.youtubeId || null,
      blogUrl: body.blogUrl || null,
      summary: body.summary || null,
      series: body.series || null,
      tags: body.tags || null,
    },
  })

  revalidateTag("home")
  revalidatePath("/sermons")
  notifyIndexNow([`/sermons/${sermon.id}`])
  return NextResponse.json(sermon, { status: 201 })
}
