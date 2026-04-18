import 'dotenv/config'
import { put } from '@vercel/blob'
import { PrismaClient } from '@prisma/client'
import {
  readFileSync, statSync, readdirSync,
  existsSync, mkdirSync, writeFileSync, unlinkSync,
} from 'fs'
import { join, basename } from 'path'
import { execSync } from 'child_process'
import os from 'os'

const prisma = new PrismaClient()

const KEYNOTE_DIR = join(
  os.homedir(),
  'Library/Mobile Documents/com~apple~Keynote/Documents/콘티& 악보'
)
const TEMP_DIR = '/tmp/sync-keynote'

// "(G,D)제목.key" → "G,D"
function parseMusicalKey(filename) {
  const m = filename.match(/^\(([^)]+)\)/)
  return m ? m[1] : null
}

// "(G,D)제목.key" → "제목"
function parseTitle(filename) {
  const name = basename(filename, '.key')
  return name.replace(/^\([^)]+\)\s*/, '').trim() || name
}

// .key → PDF (AppleScript via osascript)
function exportToPdf(keyPath, pdfPath) {
  const script = `
tell application "Keynote"
  set theDoc to open POSIX file ${JSON.stringify(keyPath)}
  delay 3
  export theDoc to POSIX file ${JSON.stringify(pdfPath)} as PDF with properties {PDF image quality:Best}
  close theDoc saving no
end tell`

  const scriptFile = join(TEMP_DIR, 'export.applescript')
  writeFileSync(scriptFile, script)

  try {
    execSync(`osascript ${JSON.stringify(scriptFile)}`, { timeout: 120_000 })
    return existsSync(pdfPath)
  } catch (e) {
    console.error('  AppleScript 오류:', e.stderr?.toString()?.trim() || e.message)
    return false
  } finally {
    if (existsSync(scriptFile)) unlinkSync(scriptFile)
  }
}

async function main() {
  if (!existsSync(TEMP_DIR)) mkdirSync(TEMP_DIR, { recursive: true })

  // DB에 이미 있는 파일명
  const existing = await prisma.praiseConti.findMany({ select: { fileName: true } })
  const existingNames = new Set(existing.map((e) => e.fileName))

  // .key 파일 목록
  let files
  try {
    files = readdirSync(KEYNOTE_DIR).filter(
      (f) => f.endsWith('.key') && !f.startsWith('.')
    )
  } catch {
    console.error('폴더 없음:', KEYNOTE_DIR)
    process.exit(1)
  }

  const newFiles = files.filter((f) => !existingNames.has(basename(f, '.key') + '.pdf'))

  if (newFiles.length === 0) {
    console.log('새 파일 없음')
    await prisma.$disconnect()
    return
  }

  console.log(`새 파일 ${newFiles.length}개 발견\n`)

  let added = 0
  for (const file of newFiles) {
    const pdfName = basename(file, '.key') + '.pdf'
    const keyPath = join(KEYNOTE_DIR, file)
    const pdfPath = join(TEMP_DIR, pdfName)

    // 생성일 = 예배일
    const serviceDate = statSync(keyPath).birthtime

    console.log(`[${added + 1}/${newFiles.length}] ${file}`)
    console.log(`  변환 중 (.key → PDF)...`)

    const ok = exportToPdf(keyPath, pdfPath)
    if (!ok) {
      console.error(`  변환 실패 — skip\n`)
      continue
    }

    console.log(`  업로드 중...`)
    const buffer = readFileSync(pdfPath)
    const blob = await put(`praise/${pdfName}`, buffer, {
      access: 'public',
      contentType: 'application/pdf',
    })

    const musicalKey = parseMusicalKey(file)
    const title = parseTitle(file)

    await prisma.praiseConti.create({
      data: {
        title,
        serviceDate,
        fileName: pdfName,
        fileUrl: blob.url,
        fileSize: buffer.length,
        musicalKey,
        theme: null,
        season: null,
        downloadCount: 0,
      },
    })

    console.log(`  ✓ "${title}" | 키: ${musicalKey ?? '없음'} | 날짜: ${serviceDate.toLocaleDateString('ko-KR')}\n`)
    unlinkSync(pdfPath)
    added++
  }

  console.log(`완료: ${added}개 추가됨`)
  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
