import { describe, it, expect, vi, beforeEach } from 'vitest'
import prisma from '@/lib/prisma'
import { GET } from '@/app/api/search/route'
import { NextRequest } from 'next/server'

// Helper to create a NextRequest with query params
function createRequest(query: string): NextRequest {
  return new NextRequest(`http://localhost:3000/api/search?q=${encodeURIComponent(query)}`)
}

describe('GET /api/search', () => {
  beforeEach(() => {
    vi.mocked(prisma.sermon.findMany).mockReset()
    vi.mocked(prisma.column.findMany).mockReset()
    vi.mocked(prisma.praiseConti.findMany).mockReset()
  })

  it('returns sermons, columns, and praise for valid query', async () => {
    const mockSermons = [
      {
        id: 1,
        title: '은혜의 말씀',
        scripture: '요한복음 3:16',
        sermonDate: new Date('2024-01-01'),
        youtubeId: 'abc123',
        tags: '은혜',
      },
    ]
    const mockColumns = [
      {
        id: 1,
        title: '은혜 칼럼',
        scripture: '시편 23편',
        createdAt: new Date('2024-01-01'),
        coverImageUrl: null,
      },
    ]
    const mockPraise = [
      {
        id: 1,
        title: '은혜 찬양',
        serviceDate: new Date('2024-01-01'),
        musicalKey: 'C',
        theme: '은혜',
      },
    ]

    vi.mocked(prisma.sermon.findMany).mockResolvedValue(mockSermons as never)
    vi.mocked(prisma.column.findMany).mockResolvedValue(mockColumns as never)
    vi.mocked(prisma.praiseConti.findMany).mockResolvedValue(mockPraise as never)

    const response = await GET(createRequest('은혜'))
    const data = await response.json()

    expect(data.sermons).toHaveLength(1)
    expect(data.columns).toHaveLength(1)
    expect(data.praise).toHaveLength(1)
    expect(data.sermons[0].title).toBe('은혜의 말씀')
    expect(data.columns[0].title).toBe('은혜 칼럼')
    expect(data.praise[0].title).toBe('은혜 찬양')
  })

  it('all sermons in result have youtubeId (regression bug #1)', async () => {
    const mockSermons = [
      {
        id: 1,
        title: '설교1',
        scripture: '',
        sermonDate: new Date('2024-01-01'),
        youtubeId: 'vid1',
        tags: '',
      },
      {
        id: 2,
        title: '설교2',
        scripture: '',
        sermonDate: new Date('2024-01-02'),
        youtubeId: 'vid2',
        tags: '',
      },
    ]

    vi.mocked(prisma.sermon.findMany).mockResolvedValue(mockSermons as never)
    vi.mocked(prisma.column.findMany).mockResolvedValue([])
    vi.mocked(prisma.praiseConti.findMany).mockResolvedValue([])

    const response = await GET(createRequest('설교'))
    const data = await response.json()

    // Every sermon should have a youtubeId
    for (const sermon of data.sermons) {
      expect(sermon.youtubeId).toBeTruthy()
    }
  })

  it('short query (1 char) returns empty arrays', async () => {
    const response = await GET(createRequest('가'))
    const data = await response.json()

    expect(data.sermons).toEqual([])
    expect(data.columns).toEqual([])
    expect(data.praise).toEqual([])

    // Prisma should not be called for short queries
    expect(prisma.sermon.findMany).not.toHaveBeenCalled()
    expect(prisma.column.findMany).not.toHaveBeenCalled()
    expect(prisma.praiseConti.findMany).not.toHaveBeenCalled()
  })

  it('empty query returns empty arrays', async () => {
    const response = await GET(createRequest(''))
    const data = await response.json()

    expect(data.sermons).toEqual([])
    expect(data.columns).toEqual([])
    expect(data.praise).toEqual([])

    // Prisma should not be called for empty queries
    expect(prisma.sermon.findMany).not.toHaveBeenCalled()
    expect(prisma.column.findMany).not.toHaveBeenCalled()
    expect(prisma.praiseConti.findMany).not.toHaveBeenCalled()
  })
})
