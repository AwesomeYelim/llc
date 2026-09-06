import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import {
  nearestSunday,
  parseBulletinFolderDate,
  kstDateString,
  kstDayOfWeek,
} from './lib/service-date.mjs'

// ──────────────────────────────────────────────
// 예배일(serviceDate) 백필
//
// 과거 데이터에 두 가지 문제가 섞여 있다.
//  1) 주보: "N번째 주일"이 그 달에 없을 때 말일로 잘라내서 토요일이 저장됨
//     (202505_5, 202601_5, 202602_5). 규칙상 다음 달로 이어져야 한다.
//  2) 콘티: 예배일에 .key 파일의 수정일/생성일이 그대로 들어가 평일 날짜가 노출됨.
//
// 더불어 저장 시각 규약이 UTC 자정과 KST 자정으로 섞여 있어 KST 자정으로 통일한다.
// 기본은 dry-run. 실제 반영은 --apply 를 붙인다.
// ──────────────────────────────────────────────

const prisma = new PrismaClient()
const APPLY = process.argv.includes('--apply')
const W = ['일', '월', '화', '수', '목', '금', '토']

const label = (d) => `${kstDateString(d)}(${W[kstDayOfWeek(d)]})`
const sameInstant = (a, b) => a.getTime() === b.getTime()

async function planBulletins() {
  const rows = await prisma.bulletin.findMany({
    include: { files: { select: { fileName: true } } },
    orderBy: { serviceDate: 'asc' },
  })

  const changes = []
  const skipped = []

  for (const b of rows) {
    // 폴더명 규칙(sun_YYYYMM_N)이 유일한 정답지이므로 파일명에서 다시 계산한다.
    const fileName = b.files[0]?.fileName
    const folder = fileName?.replace(/\.zip$/i, '')
    const next = folder ? parseBulletinFolderDate(folder) : null

    if (!next) {
      skipped.push({ id: b.id, title: b.title, reason: fileName ? `파일명 파싱 불가: ${fileName}` : '첨부 파일 없음' })
      continue
    }
    if (!sameInstant(next, b.serviceDate)) {
      changes.push({ id: b.id, title: b.title, from: b.serviceDate, to: next, folder })
    }
  }

  // 같은 파일명이 여러 주보 레코드에 걸린 경우 알려만 준다 (자동 삭제하지 않음)
  const byFile = new Map()
  for (const b of rows) {
    const f = b.files[0]?.fileName
    if (!f) continue
    byFile.set(f, [...(byFile.get(f) ?? []), b.id])
  }
  const dupes = [...byFile.entries()].filter(([, ids]) => ids.length > 1)

  return { changes, skipped, dupes, total: rows.length }
}

async function planContis() {
  const rows = await prisma.praiseConti.findMany({ orderBy: { serviceDate: 'asc' } })
  const changes = []

  for (const c of rows) {
    const next = nearestSunday(c.serviceDate)
    if (!sameInstant(next, c.serviceDate)) {
      changes.push({ id: c.id, title: c.title, from: c.serviceDate, to: next })
    }
  }
  return { changes, total: rows.length }
}

function report(name, { changes, total }) {
  const moved = changes.filter((c) => kstDateString(c.from) !== kstDateString(c.to))
  console.log(`\n${name}: 전체 ${total}건, 변경 ${changes.length}건 (날짜 자체가 바뀌는 건 ${moved.length}건)`)
  for (const c of moved) {
    console.log(`  #${String(c.id).padEnd(4)} ${label(c.from)} → ${label(c.to)}  ${c.title}`)
  }
  const normalizedOnly = changes.length - moved.length
  if (normalizedOnly > 0) console.log(`  (그 외 ${normalizedOnly}건은 달력상 날짜는 그대로, 저장 시각만 KST 자정으로 통일)`)
}

async function main() {
  console.log(APPLY ? '⚠️  --apply: 실제로 DB를 수정합니다.' : 'ℹ️  dry-run 입니다. 반영하려면 --apply 를 붙이세요.')

  const bulletins = await planBulletins()
  const contis = await planContis()

  report('📋 주보', bulletins)
  if (bulletins.skipped.length) {
    console.log('  건너뜀:')
    for (const s of bulletins.skipped) console.log(`    #${s.id} ${s.title} — ${s.reason}`)
  }
  if (bulletins.dupes.length) {
    console.log('  ⚠️  파일명 중복 (수동 확인 필요, 삭제하지 않음):')
    for (const [f, ids] of bulletins.dupes) console.log(`    ${f} → id ${ids.join(', ')}`)
  }

  report('🎵 찬양 콘티', contis)

  if (!APPLY) {
    console.log('\n반영하려면: node scripts/fix-service-dates.mjs --apply')
    return
  }

  // 트랜잭션으로 한 번에 반영 — 중간에 실패하면 전부 롤백
  await prisma.$transaction([
    ...bulletins.changes.map((c) =>
      prisma.bulletin.update({ where: { id: c.id }, data: { serviceDate: c.to } })
    ),
    ...contis.changes.map((c) =>
      prisma.praiseConti.update({ where: { id: c.id }, data: { serviceDate: c.to } })
    ),
  ])
  console.log(`\n✓ 주보 ${bulletins.changes.length}건, 콘티 ${contis.changes.length}건 반영 완료`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
