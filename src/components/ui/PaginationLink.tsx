"use client"

import { useRouter } from "next/navigation"
import { Pagination } from "./Pagination"

interface PaginationLinkProps {
  currentPage: number
  totalPages: number
  basePath: string
}

export function PaginationLink({ currentPage, totalPages, basePath }: PaginationLinkProps) {
  const router = useRouter()

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={(page) => {
        const params = new URLSearchParams()
        if (page > 1) params.set("page", String(page))
        const qs = params.toString()
        router.push(qs ? `${basePath}?${qs}` : basePath)
      }}
    />
  )
}
