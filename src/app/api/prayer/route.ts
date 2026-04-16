import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const adminOnly = req.nextUrl.searchParams.get("admin") === "1"
  const session = await auth()

  if (adminOnly && !session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const prayers = await prisma.prayerRequest.findMany({
    where: adminOnly ? {} : { isAnonymous: false },
    orderBy: { createdAt: "desc" },
    take: adminOnly ? 100 : 20,
  })

  return NextResponse.json(prayers)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!body.content?.trim()) {
    return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 })
  }

  const prayer = await prisma.prayerRequest.create({
    data: {
      name: body.isAnonymous ? "익명" : (body.name?.trim() || "익명"),
      content: body.content.trim(),
      isAnonymous: body.isAnonymous ?? false,
    },
  })

  return NextResponse.json(prayer, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const id = req.nextUrl.searchParams.get("id")
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  await prisma.prayerRequest.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}
