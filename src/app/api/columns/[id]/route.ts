import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { notifyIndexNow } from "@/lib/indexnow"

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

  revalidatePath("/columns")
  notifyIndexNow([`/columns/${id}`])
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
  revalidatePath("/columns")
  return NextResponse.json({ success: true })
}
