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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const isDownload = request.nextUrl.searchParams.get("download") === "1"

  // Increment download count
  const conti = await prisma.praiseConti.update({
    where: { id: parseInt(id) },
    data: { downloadCount: { increment: 1 } },
  })

  if (isDownload) {
    const fileRes = await fetch(conti.fileUrl)
    if (!fileRes.ok) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    return new NextResponse(fileRes.body, {
      headers: {
        "Content-Type": fileRes.headers.get("Content-Type") || "application/octet-stream",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(conti.fileName)}`,
      },
    })
  }

  return NextResponse.json(conti)
}
