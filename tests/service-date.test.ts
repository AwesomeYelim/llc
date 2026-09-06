import { describe, it, expect } from 'vitest'
import { formatDate, formatDateShort, toDateInputValue } from '@/lib/utils'
import {
  nearestSunday,
  nthSundayOfMonth,
  parseBulletinFolderDate,
  kstDateString,
  kstDayOfWeek,
} from '../scripts/lib/service-date.mjs'

// 실서버에는 UTC 자정(구 sync-local)과 KST 자정(현 파일서버 cron) 두 규약이 섞여 있다.
// 어느 쪽이든 의도한 주일로 표시돼야 한다.
const KST_MIDNIGHT_SUN = '2026-09-05T15:00:00.000Z' // = 2026-09-06(일) 00:00 KST
const UTC_MIDNIGHT_SUN = '2026-09-06T00:00:00.000Z' // = 2026-09-06(일) 09:00 KST

describe('formatDate — 실행 환경 타임존과 무관하게 KST 기준', () => {
  it('KST 자정으로 저장된 주일을 토요일로 밀지 않는다', () => {
    expect(formatDate(KST_MIDNIGHT_SUN)).toBe('2026년 9월 6일')
    expect(formatDateShort(KST_MIDNIGHT_SUN)).toBe('2026.09.06')
  })

  it('UTC 자정으로 저장된 옛 레코드도 같은 날짜로 표시한다', () => {
    expect(formatDate(UTC_MIDNIGHT_SUN)).toBe('2026년 9월 6일')
  })

  it('toDateInputValue 는 KST 기준 YYYY-MM-DD 를 돌려준다', () => {
    expect(toDateInputValue(KST_MIDNIGHT_SUN)).toBe('2026-09-06')
    expect(toDateInputValue(UTC_MIDNIGHT_SUN)).toBe('2026-09-06')
  })

  it('KST 로 날짜가 넘어가는 경계(UTC 15:00)를 정확히 잡는다', () => {
    expect(formatDate('2026-09-05T14:59:59.000Z')).toBe('2026년 9월 5일')
    expect(formatDate('2026-09-05T15:00:00.000Z')).toBe('2026년 9월 6일')
  })
})

describe('nthSundayOfMonth / parseBulletinFolderDate', () => {
  it('그 달의 N번째 주일을 돌려준다', () => {
    expect(kstDateString(parseBulletinFolderDate('sun_202609_1'))).toBe('2026-09-06')
    expect(kstDateString(parseBulletinFolderDate('202508_5'))).toBe('2025-08-31')
    expect(kstDateString(parseBulletinFolderDate('202603_5'))).toBe('2026-03-29')
  })

  it('그 달에 N번째 주일이 없으면 다음 달로 이어진다 (말일로 자르지 않는다)', () => {
    // 2026년 1월 주일은 4/11/18/25 뿐 → 5주는 2월 1일
    expect(kstDateString(parseBulletinFolderDate('202601_5'))).toBe('2026-02-01')
    expect(kstDateString(parseBulletinFolderDate('202602_5'))).toBe('2026-03-01')
    expect(kstDateString(parseBulletinFolderDate('202505_5'))).toBe('2025-06-01')
  })

  it('주차가 아닌 라벨(송구영신)은 그 달 말일', () => {
    expect(kstDateString(parseBulletinFolderDate('202512_송구영신'))).toBe('2025-12-31')
  })

  it('형식에 맞지 않으면 null', () => {
    expect(parseBulletinFolderDate('아무거나')).toBeNull()
  })

  it('2025~2027년 모든 1~5주가 항상 주일이다', () => {
    for (let y = 2025; y <= 2027; y++) {
      for (let m = 1; m <= 12; m++) {
        for (let n = 1; n <= 5; n++) {
          expect(kstDayOfWeek(nthSundayOfMonth(y, m, n))).toBe(0)
        }
      }
    }
  })
})

describe('nearestSunday', () => {
  // 일~수는 직전 주일, 목~토는 다음 주일
  const cases: Array<[string, string]> = [
    ['2026-08-16T03:00:00.000Z', '2026-08-16'], // 일 → 그대로
    ['2026-08-17T09:44:55.000Z', '2026-08-16'], // 월 → 직전
    ['2026-08-18T09:00:00.000Z', '2026-08-16'], // 화 → 직전
    ['2026-08-19T09:00:00.000Z', '2026-08-16'], // 수 → 직전
    ['2026-08-20T09:00:00.000Z', '2026-08-23'], // 목 → 다음
    ['2026-08-21T09:00:00.000Z', '2026-08-23'], // 금 → 다음
    ['2026-08-22T09:00:00.000Z', '2026-08-23'], // 토 → 다음
  ]

  it.each(cases)('%s → %s', (input, expected) => {
    expect(kstDateString(nearestSunday(input))).toBe(expected)
  })

  it('연말/연초 경계를 넘어서도 주일을 유지한다', () => {
    // 2025-01-01(수) → 직전 주일이라 전년도로 넘어간다
    expect(kstDateString(nearestSunday('2024-12-31T18:00:00.000Z'))).toBe('2024-12-29')
    // 2026-12-31(목) → 다음 주일이라 다음 해로 넘어간다
    expect(kstDateString(nearestSunday('2026-12-31T05:00:00.000Z'))).toBe('2027-01-03')
  })

  it('결과는 항상 주일이고 3일을 넘게 움직이지 않는다', () => {
    const start = Date.UTC(2025, 0, 1)
    for (let i = 0; i < 800; i++) {
      const d = new Date(start + i * 86_400_000 + 37 * 60_000)
      const snapped = nearestSunday(d)
      expect(kstDayOfWeek(snapped)).toBe(0)
      expect(Math.abs(snapped.getTime() - d.getTime())).toBeLessThan(4 * 86_400_000)
    }
  })
})
