"use client"

import { useRouter } from "next/navigation"
import { Pagination } from "@/components/ui/Pagination"

interface SermonPaginationProps {
  currentPage: number
  totalPages: number
  serviceType?: string
}

export function SermonPagination({ currentPage, totalPages, serviceType }: SermonPaginationProps) {
  const router = useRouter()

  function handlePageChange(page: number) {
    const params = new URLSearchParams()
    params.set("page", String(page))
    if (serviceType) params.set("serviceType", serviceType)
    router.push(`/sermons?${params.toString()}`)
  }

  return (
    <div className="mt-24">
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
