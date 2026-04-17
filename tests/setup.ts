import { vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  default: {
    sermon: { findMany: vi.fn() },
    column: { findMany: vi.fn() },
    praiseConti: { findMany: vi.fn() },
  },
}))
