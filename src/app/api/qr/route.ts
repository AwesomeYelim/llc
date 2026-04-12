import { NextRequest, NextResponse } from "next/server"
import QRCode from "qrcode"

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url")
  if (!url) return NextResponse.json({ error: "url parameter required" }, { status: 400 })

  try {
    // Validate URL
    new URL(url)
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
  }

  const buffer = await QRCode.toBuffer(url, {
    type: "png",
    width: 300,
    margin: 2,
    color: {
      dark: "#022448",
      light: "#ffffff",
    },
  })

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  })
}
