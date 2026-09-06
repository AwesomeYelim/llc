import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import {
  readFileSync, statSync, readdirSync,
  existsSync, mkdirSync, writeFileSync, unlinkSync, copyFileSync,
} from 'fs'
import { join, basename } from 'path'
import { execSync } from 'child_process'
import os from 'os'
import { nearestSunday, kstDateString } from './lib/service-date.mjs'
import { fileKey } from './lib/filename.mjs'

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

// 파일시스템/AppleScript에서 문제되는 문자 제거 (콜론은 macOS 경로 구분자)
function sanitizeFilename(name) {
  return name.replace(/:/g, '_')
}

// Keynote Creator Studio 앱 실행 보장
function ensureKeynoteRunning() {
  try {
    execSync('pgrep -f "Keynote Creator Studio"', { stdio: 'ignore' })
    return // 이미 실행 중
  } catch {}

  console.log('  Keynote Creator Studio 실행 중...')
  // -g: 백그라운드 실행 (포커스 안 뺏음), -ApplePersistenceIgnoreState: 이전 창 복원 방지
  execSync('open -ga "Keynote Creator Studio" --args -ApplePersistenceIgnoreState YES', { timeout: 15000 })

  // 최대 30초 대기하며 실행 확인
  for (let i = 0; i < 30; i++) {
    execSync('sleep 1')
    try {
      execSync('pgrep -f "Keynote Creator Studio"', { stdio: 'ignore' })
      // 프로세스 확인 후 AppleScript로 앱이 실제로 응답하는지 검증
      try {
        execSync(`osascript -e 'tell application "Keynote Creator Studio" to get name'`, { timeout: 5000, stdio: 'ignore' })
        execSync('sleep 2')
        // 앱 숨기기 (창이 화면에 보이지 않도록)
        try {
          execSync(`osascript -e 'tell application "System Events" to set visible of process "Keynote Creator Studio" to false'`, { stdio: 'ignore' })
        } catch {}
        console.log('  앱 준비 완료')
        return
      } catch {}
    } catch {}
  }
  throw new Error('Keynote Creator Studio 시작 실패 (30초 초과)')
}

// .key → PDF (AppleScript via osascript)
function exportToPdf(keyPath, pdfPath) {
  // AppleScript은 POSIX 경로에서도 콜론을 경로 구분자로 해석 → 파일명에 콜론 있으면 임시 복사본 사용
  let workKeyPath = keyPath
  let tempKeyCopy = null
  if (basename(keyPath).includes(':')) {
    tempKeyCopy = join(TEMP_DIR, sanitizeFilename(basename(keyPath)))
    try {
      copyFileSync(keyPath, tempKeyCopy)
      workKeyPath = tempKeyCopy
    } catch (e) {
      console.error('  임시 복사 실패:', e.message)
      return false
    }
  }

  const script = `
with timeout of 240 seconds
  tell application "Keynote Creator Studio"
    try
      close every document saving no
    end try
  end tell
  tell application "System Events"
    set visible of process "Keynote Creator Studio" to false
  end tell
  tell application "Keynote Creator Studio"
    set theDoc to open POSIX file ${JSON.stringify(workKeyPath)}
    delay 8
    try
      export theDoc to POSIX file ${JSON.stringify(pdfPath)} as PDF with properties {PDF image quality:Best}
    end try
    try
      close every document saving no
    end try
  end tell
  tell application "System Events"
    set visible of process "Keynote Creator Studio" to false
  end tell
end timeout`

  const scriptFile = join(TEMP_DIR, `export_${Date.now()}.applescript`)
  writeFileSync(scriptFile, script)

  try {
    execSync(`osascript ${JSON.stringify(scriptFile)}`, { timeout: 300_000 })
    return existsSync(pdfPath)
  } catch (e) {
    console.error('  AppleScript 오류:', e.stderr?.toString()?.trim() || e.message)
    return false
  } finally {
    try { unlinkSync(scriptFile) } catch {}
    if (tempKeyCopy) try { unlinkSync(tempKeyCopy) } catch {}
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

  // DB에 이미 있는 파일명 + createdAt (수정 감지용)
  const existing = await prisma.praiseConti.findMany({ select: { id: true, fileName: true, createdAt: true } })
  const existingMap = new Map(existing.map((e) => [fileKey(sanitizeFilename(e.fileName)), e]))

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
    const pdfName = sanitizeFilename(basename(f, '.key')) + '.pdf'
    const record = existingMap.get(fileKey(pdfName))
    if (!record) return true  // DB에 없음 → 새 파일
    // DB에 있어도 .key 수정 시간이 더 최신이면 재동기화
    const mtime = statSync(join(KEYNOTE_DIR, f)).mtime
    return mtime > record.createdAt
  })

  if (newFiles.length === 0) {
    console.log('새 파일 없음')
    await prisma.$disconnect()
    return
  }

  // 새 파일이 있을 때만 Keynote 실행
  ensureKeynoteRunning()

  console.log(`처리할 파일 ${newFiles.length}개 발견 (신규 또는 수정)\n`)

  let added = 0
  for (const file of newFiles) {
    const pdfName = sanitizeFilename(basename(file, '.key')) + '.pdf'
    const keyPath = join(KEYNOTE_DIR, file)
    const pdfPath = join(TEMP_DIR, pdfName)

    // 콘티는 주일 예배를 위해 만들어지므로, 생성일이 속한 주일을 예배일로 쓴다.
    // birthtime 을 그대로 넣으면 토요일 같은 평일 날짜가 그대로 노출된다.
    const serviceDate = nearestSunday(statSync(keyPath).birthtime)

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
    const existing = existingMap.get(fileKey(pdfName))

    if (existing) {
      // 수정된 파일 → 업데이트
      await prisma.praiseConti.update({
        where: { id: existing.id },
        data: { title, fileUrl, fileSize: buffer.length, musicalKey, createdAt: new Date() },
      })
      console.log(`  ↻ (수정) "${title}" | 키: ${musicalKey ?? '없음'}\n`)
    } else {
      // 신규 파일 → 생성
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
      console.log(`  ✓ "${title}" | 키: ${musicalKey ?? '없음'} | 예배일: ${kstDateString(serviceDate)}\n`)
    }
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
