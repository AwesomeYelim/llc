import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  const body = await request.json()

  await prisma.pageView.create({
    data: {
      path: body.path,
      referrer: body.referrer || null,
    },
  })

  return NextResponse.json({ success: true })
}
