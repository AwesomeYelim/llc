"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function PageViewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    fetch("/api/page-views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, referrer: document.referrer || null }),
    }).catch(() => {})
  }, [pathname])

  return null
}
