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
  await prisma.praiseConti.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true })
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Increment download count
  const conti = await prisma.praiseConti.update({
    where: { id: parseInt(id) },
    data: { downloadCount: { increment: 1 } },
  })

  return NextResponse.json(conti)
}
