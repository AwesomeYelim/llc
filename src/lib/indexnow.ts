import { SITE_URL } from "./seo"

const INDEXNOW_KEY = process.env.INDEXNOW_KEY
const KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`

const ENDPOINTS = [
  "https://searchadvisor.naver.com/indexnow",
  "https://api.indexnow.org/indexnow",
]

/**
 * 검색엔진에 URL 변경을 알린다 (fire-and-forget).
 * INDEXNOW_KEY 환경변수가 없으면 자동 skip.
 */
export function notifyIndexNow(urlPaths: string[]) {
  if (!INDEXNOW_KEY || urlPaths.length === 0) return

  const urlList = urlPaths.map((p) => `${SITE_URL}${p}`)

  for (const endpoint of ENDPOINTS) {
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: new URL(SITE_URL).host,
        key: INDEXNOW_KEY,
        keyLocation: KEY_LOCATION,
        urlList,
      }),
    }).catch(() => {
      // fire-and-forget: 실패해도 무시
    })
  }
}
