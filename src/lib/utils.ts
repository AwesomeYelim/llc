import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 예배일은 항상 한국 시간 기준이다.
// getFullYear/getMonth/getDate는 실행 환경의 로컬 시간을 따르므로,
// UTC로 동작하는 서버(Vercel)에서는 KST 자정(= 전날 15:00Z)으로 저장된
// 주일 날짜가 하루 앞인 토요일로 밀린다. 항상 KST로 포맷한다.
const KST_TIME_ZONE = "Asia/Seoul"

function kstParts(date: Date | string): { year: number; month: number; day: number } {
  // en-CA 로캘은 YYYY-MM-DD 형식을 보장한다.
  const [year, month, day] = new Intl.DateTimeFormat("en-CA", {
    timeZone: KST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date(date))
    .split("-")
    .map(Number)
  return { year, month, day }
}

export function formatDate(date: Date | string): string {
  const { year, month, day } = kstParts(date)
  return `${year}년 ${month}월 ${day}일`
}

export function formatDateShort(date: Date | string): string {
  const { year, month, day } = kstParts(date)
  return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")}`
}

/** <input type="date"> 에 넣을 YYYY-MM-DD (KST 기준) */
export function toDateInputValue(date: Date | string = new Date()): string {
  const { year, month, day } = kstParts(date)
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export function extractYoutubeId(url: string): string | null {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?\s]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
}

export function serviceTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    SUNDAY_MAIN: "주일예배",
    SUNDAY_SCHOOL: "주일학교",
    WEDNESDAY: "수요예배",
    FRIDAY: "금요예배",
    SPECIAL: "특별예배",
  }
  return labels[type] || type
}

export function getYoutubeThumbnail(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
}
