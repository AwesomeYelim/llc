// ──────────────────────────────────────────────
// 예배일(주일) 날짜 계산 — 항상 KST 기준
//
// 한국은 1988년 이후 서머타임이 없어 UTC+09:00 고정이므로 상수 오프셋으로 계산한다.
// Date를 KST 자정으로 만들어 저장해야, UTC로 도는 서버(Vercel)에서 포맷할 때
// 하루가 밀리지 않는다.
// ──────────────────────────────────────────────

export const KST_OFFSET_MS = 9 * 60 * 60 * 1000

/** Date → KST 기준 { year, month(1-12), day } */
export function kstYmd(date) {
  const d = new Date(new Date(date).getTime() + KST_OFFSET_MS)
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() }
}

/** KST 자정 Date. month는 1-12, 범위를 벗어난 day/month는 Date.UTC가 알아서 넘긴다. */
export function kstMidnight(year, month, day) {
  return new Date(Date.UTC(year, month - 1, day) - KST_OFFSET_MS)
}

/** KST 기준 요일 (0=일 … 6=토) */
export function kstDayOfWeek(date) {
  return new Date(new Date(date).getTime() + KST_OFFSET_MS).getUTCDay()
}

/** YYYY-MM-DD (KST 기준) */
export function kstDateString(date) {
  const { year, month, day } = kstYmd(date)
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/**
 * 가장 가까운 주일의 KST 자정.
 * 일~수는 직전 주일, 목~토는 다음 주일로 붙인다.
 * (콘티 파일은 주일 예배 전후로 마지막 수정되므로 그 주의 주일에 속한다)
 */
export function nearestSunday(date) {
  const { year, month, day } = kstYmd(date)
  const dow = kstDayOfWeek(date)
  const shift = dow <= 3 ? -dow : 7 - dow
  return kstMidnight(year, month, day + shift)
}

/**
 * 해당 월의 N번째 주일 (KST 자정).
 * 교회 폴더 규칙상 그 달에 N번째 주일이 없으면 다음 달로 이어진다.
 * 예) 2026년 1월 주일은 4/11/18/25 뿐이므로 202601_5 → 2026-02-01(주일)
 */
export function nthSundayOfMonth(year, month, n) {
  const firstDow = new Date(Date.UTC(year, month - 1, 1)).getUTCDay()
  const firstSunday = firstDow === 0 ? 1 : 8 - firstDow
  return kstMidnight(year, month, firstSunday + (n - 1) * 7)
}

/** 해당 월의 마지막 날 (KST 자정) — 송구영신처럼 주차가 아닌 라벨용 */
export function lastDayOfMonth(year, month) {
  return kstMidnight(year, month + 1, 0)
}

/**
 * 주보 폴더명 → 예배일.
 * `sun_YYYYMM_N` / `YYYYMM_N` → 그 달의 N번째 주일
 * `sun_YYYYMM_송구영신` 등 숫자가 아닌 라벨 → 그 달의 마지막 날
 */
export function parseBulletinFolderDate(folderName) {
  const m = folderName.replace(/^sun_/i, '').match(/^(\d{4})(\d{2})_(\d+|.+)$/)
  if (!m) return null
  const year = parseInt(m[1])
  const month = parseInt(m[2])
  const weekNum = parseInt(m[3])
  return isNaN(weekNum) ? lastDayOfMonth(year, month) : nthSundayOfMonth(year, month, weekNum)
}
