import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const year = req.nextUrl.searchParams.get("year")
  const month = req.nextUrl.searchParams.get("month")

  let where = {}
  if (year && month) {
    const start = new Date(Number(year), Number(month) - 1, 1)
    const end = new Date(Number(year), Number(month), 0, 23, 59, 59)
    where = { startDate: { gte: start, lte: end } }
  }

  const events = await prisma.event.findMany({
    where,
    orderBy: { startDate: "asc" },
  })

  return NextResponse.json(events)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const event = await prisma.event.create({
    data: {
      title: body.title,
      description: body.description,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      isAllDay: body.isAllDay ?? true,
      eventType: body.eventType ?? "general",
    },
  })

  revalidatePath("/calendar")
  return NextResponse.json(event, { status: 201 })
}
