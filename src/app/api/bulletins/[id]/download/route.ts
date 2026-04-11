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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const isDownload = request.nextUrl.searchParams.get("download") === "1"

  const file = await prisma.bulletinFile.update({
    where: { id: parseInt(id) },
    data: { downloadCount: { increment: 1 } },
  })

  if (isDownload) {
    const fileRes = await fetch(file.fileUrl)
    if (!fileRes.ok) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    return new NextResponse(fileRes.body, {
      headers: {
        "Content-Type": fileRes.headers.get("Content-Type") || "application/octet-stream",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.fileName)}`,
      },
    })
  }

  return NextResponse.json(file)
}
