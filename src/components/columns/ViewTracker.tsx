"use client"

import { useEffect } from "react"

export function ViewTracker({ id }: { id: number }) {
  useEffect(() => {
    fetch(`/api/columns/${id}/view`, { method: "POST" }).catch(() => {})
  }, [id])
  return null
}
