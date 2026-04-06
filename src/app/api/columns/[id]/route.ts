import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const column = await prisma.column.findUnique({
    where: { id: parseInt(id) },
    include: { sermon: true },
  })

  if (!column) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(column)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  const column = await prisma.column.update({
    where: { id: parseInt(id) },
    data: {
      title: body.title,
      content: body.content,
      scripture: body.scripture || null,
      sermonId: body.sermonId ? parseInt(body.sermonId) : null,
      coverImageUrl: body.coverImageUrl || null,
    },
  })

  return NextResponse.json(column)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await prisma.column.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true })
}
