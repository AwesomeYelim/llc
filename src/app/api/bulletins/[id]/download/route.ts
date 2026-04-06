import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const file = await prisma.bulletinFile.update({
    where: { id: parseInt(id) },
    data: { downloadCount: { increment: 1 } },
  })
  return NextResponse.json(file)
}
