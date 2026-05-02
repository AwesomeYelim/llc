import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const id = parseInt(searchParams.get("id") || "")
  const mode = searchParams.get("mode") // "download" | "view"

  if (!id || isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  const conti = mode === "download"
    ? await prisma.praiseConti.update({
        where: { id },
        data: { downloadCount: { increment: 1 } },
      })
    : await prisma.praiseConti.findUniqueOrThrow({ where: { id } })

  if (mode === "download") revalidatePath("/praise")

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
