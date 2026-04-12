import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")

  const where: Record<string, unknown> = {}
  if (category) where.category = category

  const images = await prisma.galleryImage.findMany({
    where,
    orderBy: { sortOrder: "asc" },
  })

  return NextResponse.json(images)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const image = await prisma.galleryImage.create({
    data: {
      imageUrl: body.imageUrl,
      title: body.title || null,
      category: body.category || null,
      sortOrder: body.sortOrder || 0,
    },
  })

  revalidatePath("/about")
  return NextResponse.json(image, { status: 201 })
}
