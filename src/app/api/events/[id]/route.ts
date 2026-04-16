import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const event = await prisma.event.update({
    where: { id: Number(id) },
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
  return NextResponse.json(event)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await prisma.event.delete({ where: { id: Number(id) } })
  revalidatePath("/calendar")
  return NextResponse.json({ success: true })
}
