import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const sermon = await prisma.sermon.findUnique({
    where: { id: parseInt(id) },
    include: { columns: true },
  })

  if (!sermon) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(sermon)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  const sermon = await prisma.sermon.update({
    where: { id: parseInt(id) },
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

  return NextResponse.json(sermon)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await prisma.sermon.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true })
}
