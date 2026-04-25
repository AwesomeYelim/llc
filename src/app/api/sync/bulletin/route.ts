import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { google } from "googleapis"
import { put } from "@vercel/blob"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

/**
 * 폴더명 파싱: sun_202604_4 → { year: 2026, month: 4, nth: 4 }
 * sun = 주일(Sunday), YYYYMM = 연월, N = 해당 월 N번째 주일
 */
function parseFolderName(name: string): { year: number; month: number; nth: number } | null {
  const match = name.match(/^sun_(\d{4})(\d{2})_(\d+)$/i)
  if (!match) return null
  return {
    year: parseInt(match[1]),
    month: parseInt(match[2]),
    nth: parseInt(match[3]),
  }
}

/** N번째 주일 날짜 계산 */
function getNthSunday(year: number, month: number, nth: number): Date {
  const firstDay = new Date(Date.UTC(year, month - 1, 1))
  const dayOfWeek = firstDay.getUTCDay() // 0 = Sunday
  const daysToFirstSunday = (7 - dayOfWeek) % 7
  const firstSunday = new Date(Date.UTC(year, month - 1, 1 + daysToFirstSunday))
  return new Date(Date.UTC(
    firstSunday.getUTCFullYear(),
    firstSunday.getUTCMonth(),
    firstSunday.getUTCDate() + (nth - 1) * 7,
  ))
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
  return syncBulletin()
}

export async function POST() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return syncBulletin()
}

async function syncBulletin() {
  try {
    const folderId = process.env.GOOGLE_DRIVE_BULLETIN_FOLDER_ID
    if (!folderId) {
      return NextResponse.json({ success: false, error: "GOOGLE_DRIVE_BULLETIN_FOLDER_ID not set" })
    }

    const drive = getDriveClient()

    // 1. 주보 폴더 내 하위 폴더 목록 (sun_YYYYMM_N 패턴)
    const folderRes = await drive.files.list({
      q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: "files(id, name)",
      orderBy: "name desc",
      pageSize: 100,
    })
    const folders = folderRes.data.files || []

    let synced = 0
    let skipped = 0

    for (const folder of folders) {
      if (!folder.name || !folder.id) continue

      const parsed = parseFolderName(folder.name)
      if (!parsed) continue // sun_YYYYMM_N 패턴 아니면 무시

      const serviceDate = getNthSunday(parsed.year, parsed.month, parsed.nth)
      const folderLabel = `${parsed.year}년 ${parsed.month}월 ${parsed.nth}번째 주일`

      // 이미 동일한 serviceDate의 주보가 있으면 스킵
      const exists = await prisma.bulletin.findFirst({
        where: { serviceDate },
      })
      if (exists) {
        skipped++
        continue
      }

      // 2. 폴더 내 파일 목록
      const fileRes = await drive.files.list({
        q: `'${folder.id}' in parents and trashed = false`,
        fields: "files(id, name, size, mimeType)",
        pageSize: 50,
      })
      const files = fileRes.data.files || []
      if (files.length === 0) continue

      // 3. 각 파일 Vercel Blob에 업로드
      const uploadedFiles: { fileName: string; fileUrl: string; fileSize: number }[] = []

      for (const file of files) {
        if (!file.id || !file.name) continue

        const download = await drive.files.get(
          { fileId: file.id, alt: "media" },
          { responseType: "arraybuffer" }
        )
        const buffer = Buffer.from(download.data as ArrayBuffer)

        const blob = await put(`bulletin/${folder.name}/${file.name}`, buffer, {
          access: "public",
          contentType: file.mimeType || "application/octet-stream",
        })

        uploadedFiles.push({
          fileName: file.name,
          fileUrl: blob.url,
          fileSize: parseInt(file.size || "0") || buffer.length,
        })
      }

      if (uploadedFiles.length === 0) continue

      // 4. DB에 Bulletin + BulletinFile 생성
      await prisma.bulletin.create({
        data: {
          title: `${folderLabel} 주보`,
          serviceDate,
          bulletinType: "BULLETIN",
          files: {
            create: uploadedFiles,
          },
        },
      })

      synced++
    }

    if (synced > 0) {
      revalidatePath("/bulletin")
    }

    return NextResponse.json({ success: true, synced, skipped, total: folders.length })
  } catch (error) {
    console.error("Bulletin sync error:", error)
    return NextResponse.json({
      success: false,
      synced: 0,
      skipped: 0,
      total: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
