import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import {
  readFileSync, statSync, readdirSync,
  existsSync, mkdirSync, writeFileSync, unlinkSync,
} from 'fs'
import { join, basename } from 'path'
import { execSync } from 'child_process'
import os from 'os'

const prisma = new PrismaClient()

const FILE_SERVER_HOST = '138.2.119.220'
const FILE_SERVER_USER = 'ubuntu'
const FILE_SERVER_PATH = '/var/www/assets'
const FILE_SERVER_BASE_URL = 'http://138.2.119.220/assets'

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

// Keynote Creator Studio 앱 실행 보장
function ensureKeynoteRunning() {
  try {
    execSync('pgrep -f "Keynote Creator Studio"', { stdio: 'ignore' })
    return // 이미 실행 중
  } catch {}

  console.log('  Keynote Creator Studio 실행 중...')
  // --args -NSQuitWhenLastWindowClosed NO: 복원 창 없이 실행
  execSync('open -a "Keynote Creator Studio" --args -ApplePersistenceIgnoreState YES', { timeout: 15000 })

  // 최대 20초 대기하며 실행 확인
  for (let i = 0; i < 20; i++) {
    execSync('sleep 1')
    try {
      execSync('pgrep -f "Keynote Creator Studio"', { stdio: 'ignore' })
      execSync('sleep 3') // 완전 로드 대기
      console.log('  앱 준비 완료')
      return
    } catch {}
  }
  throw new Error('Keynote Creator Studio 시작 실패 (20초 초과)')
}

// .key → PDF (AppleScript via osascript)
function exportToPdf(keyPath, pdfPath) {
  const script = `
tell application "Keynote Creator Studio"
  set theDoc to open POSIX file ${JSON.stringify(keyPath)}
  delay 5
  try
    export theDoc to POSIX file ${JSON.stringify(pdfPath)} as PDF with properties {PDF image quality:Best}
  end try
  try
    close theDoc saving no
  end try
end tell`

  const scriptFile = join(TEMP_DIR, `export_${Date.now()}.applescript`)
  writeFileSync(scriptFile, script)

  try {
    execSync(`osascript ${JSON.stringify(scriptFile)}`, { timeout: 120_000 })
    return existsSync(pdfPath)
  } catch (e) {
    console.error('  AppleScript 오류:', e.stderr?.toString()?.trim() || e.message)
    return false
  } finally {
    try { unlinkSync(scriptFile) } catch {}
  }
}

function uploadToServer(localPath, remoteName) {
  const remotePath = `${FILE_SERVER_PATH}/praise/${remoteName}`
  execSync(
    `ssh ${FILE_SERVER_USER}@${FILE_SERVER_HOST} "mkdir -p ${FILE_SERVER_PATH}/praise"`,
    { timeout: 15000 }
  )
  execSync(
    `scp "${localPath}" ${FILE_SERVER_USER}@${FILE_SERVER_HOST}:"${remotePath}"`,
    { timeout: 60000 }
  )
  return `${FILE_SERVER_BASE_URL}/praise/${encodeURIComponent(remoteName)}`
}

async function main() {
  if (!existsSync(TEMP_DIR)) mkdirSync(TEMP_DIR, { recursive: true })

  ensureKeynoteRunning()

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

  const newFiles = files.filter((f) => {
    // 제목 없는 기본 파일 (Presentation N) 스킵
    const title = parseTitle(f)
    if (/^Presentation\s*\d*$/i.test(title)) return false
    return !existingNames.has(basename(f, '.key') + '.pdf')
  })

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

    let fileUrl
    try {
      fileUrl = uploadToServer(pdfPath, pdfName)
    } catch (e) {
      console.error(`  업로드 실패 — skip\n`, e.message)
      unlinkSync(pdfPath)
      continue
    }

    const musicalKey = parseMusicalKey(file)
    const title = parseTitle(file)

    await prisma.praiseConti.create({
      data: {
        title,
        serviceDate,
        fileName: pdfName,
        fileUrl,
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

  // 혹시 열린 문서 있으면 전부 닫기
  try {
    execSync(`osascript -e 'tell application "Keynote Creator Studio" to close every document saving no'`, { timeout: 15000 })
  } catch {}

  console.log(`완료: ${added}개 추가됨`)
  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
