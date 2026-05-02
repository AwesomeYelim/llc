import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

/**
 * 주보 캐시 갱신 엔드포인트
 * 로컬 sync 스크립트(scripts/sync-bulletin.js) 실행 후 호출됩니다.
 */
export async function POST() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  revalidatePath("/bulletin")
  return NextResponse.json({ success: true })
}
