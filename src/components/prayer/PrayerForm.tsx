"use client"

import { useState } from "react"

export function PrayerForm() {
  const [name, setName] = useState("")
  const [content, setContent] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/prayer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, content, isAnonymous }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "오류가 발생했습니다.")
      }

      setDone(true)
      setName("")
      setContent("")
      setIsAnonymous(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="bg-[#f5f3f0] rounded-xl p-8 text-center">
        <span className="material-symbols-outlined text-[#795900] text-5xl mb-4 block">
          favorite
        </span>
        <h3 className="font-serif text-xl text-[#022448] mb-2">기도 제목이 전달되었습니다</h3>
        <p className="text-[#43474e] text-sm mb-6">
          함께 기도하겠습니다. 주님의 은혜가 임하길 소망합니다.
        </p>
        <button
          onClick={() => setDone(false)}
          className="text-sm text-[#795900] underline underline-offset-4 hover:text-[#022448] transition-colors"
        >
          다른 기도 제목 올리기
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Anonymous toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div
          onClick={() => setIsAnonymous(!isAnonymous)}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            isAnonymous ? "bg-[#795900]" : "bg-[#c4c6cf]"
          }`}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              isAnonymous ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </div>
        <span className="text-sm text-[#43474e]">익명으로 제출</span>
      </label>

      {!isAnonymous && (
        <div>
          <label className="block text-sm font-medium text-[#022448] mb-1.5">이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="성함을 입력하세요"
            className="w-full px-4 py-3 bg-white border border-[#e4e2df] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#022448]/20 focus:border-[#022448]"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[#022448] mb-1.5">
          기도 제목 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="기도 제목을 나눠주세요. 함께 기도하겠습니다."
          required
          rows={6}
          className="w-full px-4 py-3 bg-white border border-[#e4e2df] rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#022448]/20 focus:border-[#022448]"
        />
        <p className="text-xs text-[#74777f] mt-1">{content.length}자</p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="w-full py-3 bg-[#022448] text-white rounded-xl font-medium hover:bg-[#1e3a5f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "제출 중..." : "기도 요청 드리기"}
      </button>

      <p className="text-xs text-[#74777f] text-center leading-relaxed">
        제출된 기도 제목은 담임목사님과 교역자들만 확인하며,
        <br />
        익명이 아닌 경우 응답된 기도는 홈페이지에 공개될 수 있습니다.
      </p>
    </form>
  )
}
