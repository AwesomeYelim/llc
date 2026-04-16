import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
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
  revalidatePath("/praise")
  return NextResponse.json({ success: true })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const mode = request.nextUrl.searchParams.get("download") === "1" ? "download"
    : request.nextUrl.searchParams.get("view") === "1" ? "view"
    : null

  // Increment download count only for actual downloads
  const conti = mode === "download"
    ? await prisma.praiseConti.update({
        where: { id: parseInt(id) },
        data: { downloadCount: { increment: 1 } },
      })
    : await prisma.praiseConti.findUniqueOrThrow({ where: { id: parseInt(id) } })

  if (mode) {
    const fileRes = await fetch(conti.fileUrl)
    if (!fileRes.ok) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const disposition = mode === "download"
      ? `attachment; filename*=UTF-8''${encodeURIComponent(conti.fileName)}`
      : `inline; filename*=UTF-8''${encodeURIComponent(conti.fileName)}`

    return new NextResponse(fileRes.body, {
      headers: {
        "Content-Type": fileRes.headers.get("Content-Type") || "application/pdf",
        "Content-Disposition": disposition,
      },
    })
  }

  return NextResponse.json(conti)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const conti = await prisma.praiseConti.update({
    where: { id: parseInt(id) },
    data: {
      title: body.title,
      serviceDate: body.serviceDate ? new Date(body.serviceDate) : undefined,
      musicalKey: body.musicalKey || null,
      theme: body.theme || null,
      season: body.season || null,
    },
  })

  revalidatePath("/praise")
  return NextResponse.json(conti)
}
