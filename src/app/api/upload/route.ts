import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // If Vercel Blob token is available, use it
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import("@vercel/blob")
      const blob = await put(file.name, file, {
        access: "public",
      })
      return NextResponse.json({
        url: blob.url,
        fileName: file.name,
        fileSize: file.size,
      })
    }

    // Fallback: save to public directory (development only)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fs = await import("fs/promises")
    const path = await import("path")

    const uploadDir = path.join(process.cwd(), "public", "uploads")
    await fs.mkdir(uploadDir, { recursive: true })

    const uniqueName = `${Date.now()}-${file.name}`
    const filePath = path.join(uploadDir, uniqueName)
    await fs.writeFile(filePath, buffer)

    return NextResponse.json({
      url: `/uploads/${uniqueName}`,
      fileName: file.name,
      fileSize: file.size,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
