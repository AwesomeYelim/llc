import { NextRequest, NextResponse } from "next/server"
import { revalidateTag, revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { notifyIndexNow } from "@/lib/indexnow"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")

  const [data, total] = await Promise.all([
    prisma.column.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { sermon: { select: { title: true, sermonDate: true } } },
    }),
    prisma.column.count(),
  ])

  return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / limit) })
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const column = await prisma.column.create({
    data: {
      title: body.title,
      content: body.content,
      scripture: body.scripture || null,
      sermonId: body.sermonId ? parseInt(body.sermonId) : null,
      coverImageUrl: body.coverImageUrl || null,
    },
  })

  revalidateTag("columns")
  revalidatePath("/columns")
  notifyIndexNow([`/columns/${column.id}`])
  return NextResponse.json(column, { status: 201 })
}
