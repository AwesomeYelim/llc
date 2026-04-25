"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function BulletinSyncButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const router = useRouter()

  const handleSync = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/sync/bulletin", { method: "POST" })
      const data = await res.json()
      if (data.success) {
        setResult(data.synced > 0 ? `${data.synced}건 동기화 완료` : "새 항목 없음")
        if (data.synced > 0) router.refresh()
      } else {
        setResult(`오류: ${data.error || "알 수 없는 오류"}`)
      }
    } catch {
      setResult("요청 실패")
    } finally {
      setLoading(false)
      setTimeout(() => setResult(null), 4000)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {result && (
        <span className={`text-xs ${result.startsWith("오류") || result === "요청 실패" ? "text-red-500" : "text-green-600"}`}>
          {result}
        </span>
      )}
      <button
        onClick={handleSync}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        <span className={`material-symbols-outlined text-base ${loading ? "animate-spin" : ""}`}>
          {loading ? "progress_activity" : "sync"}
        </span>
        {loading ? "동기화 중..." : "Drive 동기화"}
      </button>
    </div>
  )
}
