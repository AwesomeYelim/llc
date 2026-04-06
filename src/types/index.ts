import { ServiceType, BulletinType } from "@prisma/client"

export type { ServiceType, BulletinType }

export interface SermonWithColumn {
  id: number
  title: string
  scripture: string
  sermonDate: Date
  serviceType: ServiceType
  youtubeUrl: string | null
  youtubeId: string | null
  blogUrl: string | null
  summary: string | null
  series: string | null
  tags: string | null
  columns: ColumnItem[]
}

export interface ColumnItem {
  id: number
  title: string
  content: string
  scripture: string | null
  sermonId: number | null
  coverImageUrl: string | null
  createdAt: Date
}

export interface BulletinWithFiles {
  id: number
  title: string
  serviceDate: Date
  bulletinType: BulletinType
  files: BulletinFileItem[]
}

export interface BulletinFileItem {
  id: number
  fileName: string
  fileUrl: string
  fileSize: number
  downloadCount: number
}

export interface SiteSettings {
  [key: string]: string
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
}
