import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

/**
 * 주보 캐시 갱신 엔드포인트
 * 파일서버 sync 스크립트 실행 후 호출됩니다.
 * 세션 인증 또는 BULLETIN_SYNC_SECRET 토큰 인증 모두 허용.
 */
export async function POST(request: NextRequest) {
  const token = request.headers.get("x-sync-secret")
  const syncSecret = process.env.BULLETIN_SYNC_SECRET

  if (token && syncSecret && token === syncSecret) {
    revalidatePath("/bulletin")
    return NextResponse.json({ success: true })
  }

  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  revalidatePath("/bulletin")
  return NextResponse.json({ success: true })
}
