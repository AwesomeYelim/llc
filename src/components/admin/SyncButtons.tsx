"use client"

import { useState } from "react"

interface SyncResult {
  success: boolean
  synced: number
  skipped: number
  total: number
  error?: string
}

function SyncButton({
  label,
  icon,
  endpoint,
}: {
  label: string
  icon: string
  endpoint: string
}) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SyncResult | null>(null)

  async function handleSync() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(endpoint, { method: "POST" })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ success: false, synced: 0, skipped: 0, total: 0, error: "네트워크 오류" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleSync}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <span>{icon}</span>
        )}
        {loading ? "동기화 중..." : label}
      </button>
      {result && (
        <span
          className={`text-xs ${result.success ? "text-emerald-600" : "text-red-500"}`}
        >
          {result.success
            ? `${result.synced}개 동기화, ${result.skipped}개 이미 존재 (총 ${result.total}개)`
            : result.error || "오류 발생"}
        </span>
      )}
    </div>
  )
}

export function SyncButtons() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h2 className="text-lg font-semibold mb-2">콘텐츠 동기화</h2>
      <p className="text-sm text-gray-500 mb-4">
        유튜브, 네이버 블로그, Google Drive에서 최신 콘텐츠를 가져옵니다. 매일 자동 실행되며, 수동으로도 실행 가능합니다.
      </p>
      <div className="flex flex-wrap gap-3">
        <SyncButton
          label="유튜브 동기화"
          icon="🎬"
          endpoint="/api/sync/youtube"
        />
        <SyncButton
          label="블로그 동기화"
          icon="📝"
          endpoint="/api/sync/blog"
        />
        <SyncButton
          label="Google Drive 동기화"
          icon="📁"
          endpoint="/api/sync/drive"
        />
      </div>
    </div>
  )
}
