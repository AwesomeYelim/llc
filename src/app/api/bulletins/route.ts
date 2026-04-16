import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "12")
  const type = searchParams.get("type")

  const where: Record<string, unknown> = {}
  if (type) where.bulletinType = type

  const [data, total] = await Promise.all([
    prisma.bulletin.findMany({
      where,
      include: { files: true },
      orderBy: { serviceDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.bulletin.count({ where }),
  ])

  return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / limit) })
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const bulletin = await prisma.bulletin.create({
    data: {
      title: body.title,
      serviceDate: new Date(body.serviceDate),
      bulletinType: body.bulletinType,
      files: {
        create: (body.files || []).map((f: { fileName: string; fileUrl: string; fileSize: number }) => ({
          fileName: f.fileName,
          fileUrl: f.fileUrl,
          fileSize: f.fileSize,
        })),
      },
    },
    include: { files: true },
  })

  revalidatePath("/bulletin")
  return NextResponse.json(bulletin, { status: 201 })
}
