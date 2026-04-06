"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export function DeleteButton({ id, endpoint }: { id: number; endpoint: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return
    setLoading(true)
    try {
      await fetch(`${endpoint}/${id}`, { method: "DELETE" })
      router.refresh()
    } catch (error) {
      console.error("Delete error:", error)
      alert("삭제에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      {loading ? "삭제중..." : "삭제"}
    </button>
  )
}
