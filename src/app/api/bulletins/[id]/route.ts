import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await prisma.bulletin.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true })
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const bulletin = await prisma.bulletin.findUnique({
    where: { id: parseInt(id) },
    include: { files: true },
  })

  if (!bulletin) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(bulletin)
}
