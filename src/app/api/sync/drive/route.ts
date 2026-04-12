import { NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import { put } from "@vercel/blob"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { notifyIndexNow } from "@/lib/indexnow"

const SEASON_KEYWORDS: Record<string, string> = {
  "성탄": "성탄절", "크리스마스": "성탄절",
  "부활": "부활절",
  "추수감사": "추수감사절", "추수": "추수감사절",
  "사순": "사순절", "고난": "고난주간",
  "대림": "대림절", "강림": "강림절",
  "종려": "종려주일", "성령강림": "성령강림절", "오순": "성령강림절",
  "맥추": "맥추감사절", "송구영신": "송구영신",
}

function parseFilename(name: string) {
  const match = name.match(/^\(([A-Ga-g♭♯#b,\s]+)(?::([^)]+))?\)/)
  let musicalKey: string | null = null
  let theme: string | null = null
  let season: string | null = null

  if (match) {
    musicalKey = match[1].replace(/\s/g, "").toUpperCase()
    if (match[2]) theme = match[2].trim()
  }

  const lowerName = name.toLowerCase()
  for (const [keyword, seasonName] of Object.entries(SEASON_KEYWORDS)) {
    if (lowerName.includes(keyword.toLowerCase())) {
      season = seasonName
      break
    }
  }

  return { musicalKey, theme, season }
}

function getDriveClient() {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!keyJson) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY not set")

  const key = JSON.parse(keyJson)
  const jwtAuth = new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  })
  return google.drive({ version: "v3", auth: jwtAuth })
}

// Vercel Cron (GET) or Admin manual (POST)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return syncDrive()
}

export async function POST() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return syncDrive()
}

async function syncDrive() {
  try {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID
    if (!folderId) {
      return NextResponse.json({ success: false, error: "GOOGLE_DRIVE_FOLDER_ID not set" })
    }

    const drive = getDriveClient()

    const files: { id?: string | null; name?: string | null; size?: string | null; mimeType?: string | null; createdTime?: string | null }[] = []
    let pageToken: string | undefined
    do {
      const res = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: "nextPageToken, files(id, name, size, mimeType, createdTime)",
        orderBy: "createdTime desc",
        pageSize: 100,
        pageToken,
      })
      files.push(...(res.data.files || []))
      pageToken = res.data.nextPageToken || undefined
    } while (pageToken)

    const existing = await prisma.praiseConti.findMany({
      select: { fileName: true },
    })
    const existingNames = new Set(existing.map((e) => e.fileName))

    let synced = 0
    let skipped = 0

    for (const file of files) {
      if (!file.name || !file.id) continue

      // Check both original and PDF name for dedup
      const pdfName = file.name.replace(/\.key$/i, ".pdf")
      if (existingNames.has(file.name) || existingNames.has(pdfName)) {
        skipped++
        continue
      }

      const download = await drive.files.get(
        { fileId: file.id, alt: "media" },
        { responseType: "arraybuffer" }
      )

      const buffer = Buffer.from(download.data as ArrayBuffer)

      const blob = await put(`praise/${file.name}`, buffer, {
        access: "public",
        contentType: file.mimeType || "application/octet-stream",
      })

      // Extract date from filename or use createdTime
      const dateMatch = file.name.match(/(\d{4})[\.\-_]?(\d{1,2})[\.\-_]?(\d{1,2})/)
      let serviceDate: Date
      if (dateMatch) {
        serviceDate = new Date(`${dateMatch[1]}-${dateMatch[2].padStart(2, "0")}-${dateMatch[3].padStart(2, "0")}`)
      } else {
        serviceDate = file.createdTime ? new Date(file.createdTime) : new Date()
      }

      // Parse category info from filename
      const { musicalKey, theme, season } = parseFilename(file.name)

      await prisma.praiseConti.create({
        data: {
          title: file.name
            .replace(/\.[^.]+$/, "")
            .replace(/^\([^)]*\)\s*/, "")
            .replace(/\[찬\]\s*/g, "")
            .replace(/\+/g, " + ")
            .replace(/\s+/g, " ")
            .trim(),
          serviceDate,
          fileName: file.name,
          fileUrl: blob.url,
          fileSize: parseInt(file.size || "0") || buffer.length,
          musicalKey,
          theme,
          season,
        },
      })

      synced++
    }

    if (synced > 0) notifyIndexNow(["/praise"])

    return NextResponse.json({
      success: true,
      synced,
      skipped,
      total: files.length,
    })
  } catch (error) {
    console.error("Drive sync error:", error)
    return NextResponse.json({
      success: false,
      synced: 0,
      skipped: 0,
      total: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
