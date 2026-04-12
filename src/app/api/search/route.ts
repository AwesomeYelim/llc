import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim()
  if (!q || q.length < 2) {
    return NextResponse.json({ sermons: [], columns: [], praise: [] })
  }

  const [sermons, columns, praise] = await Promise.all([
    prisma.sermon.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { scripture: { contains: q, mode: "insensitive" } },
          { summary: { contains: q, mode: "insensitive" } },
          { series: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { sermonDate: "desc" },
      take: 10,
      select: { id: true, title: true, scripture: true, sermonDate: true, youtubeId: true },
    }),
    prisma.column.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
          { scripture: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, title: true, scripture: true, createdAt: true, coverImageUrl: true },
    }),
    prisma.praiseConti.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { fileName: { contains: q, mode: "insensitive" } },
          { theme: { contains: q, mode: "insensitive" } },
          { season: { contains: q, mode: "insensitive" } },
          { musicalKey: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { serviceDate: "desc" },
      take: 10,
      select: { id: true, title: true, serviceDate: true, musicalKey: true, theme: true },
    }),
  ])

  return NextResponse.json({
    sermons: sermons.map((s) => ({ ...s, sermonDate: s.sermonDate.toISOString() })),
    columns: columns.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() })),
    praise: praise.map((p) => ({ ...p, serviceDate: p.serviceDate.toISOString() })),
  })
}
