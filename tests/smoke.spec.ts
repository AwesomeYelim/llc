import { test, expect } from '@playwright/test'

// Helper: assert page loads without server error
async function assertPageLoads(page: import('@playwright/test').Page, path: string) {
  const response = await page.goto(path)
  expect(response?.status()).toBe(200)
  await expect(page.locator('text=Internal Server Error')).not.toBeVisible()
}

// ─── Public page smoke tests ───────────────────────────────────────

test.describe('Public pages smoke tests', () => {
  test('/ loads with heading and navbar', async ({ page }) => {
    await assertPageLoads(page, '/')
    // Heading with church name
    await expect(page.locator('text=동남').first()).toBeVisible({ timeout: 10000 })
    // Navbar should be visible
    await expect(page.locator('nav').first()).toBeVisible()
  })

  test('/sermons loads with sermon cards that have thumbnails', async ({ page }) => {
    await assertPageLoads(page, '/sermons')
    // Wait for sermon cards to appear
    const cards = page.locator('a[href*="/sermons/"]')
    await expect(cards.first()).toBeVisible({ timeout: 10000 })
    // Each sermon card should have an img (youtube thumbnail)
    for (const card of await cards.all()) {
      await expect(card.locator('img')).toBeVisible({ timeout: 5000 })
    }
  })

  test('/search?q=은혜 shows results section', async ({ page }) => {
    await assertPageLoads(page, '/search?q=은혜')
    // Results section should be visible
    await expect(page.locator('section').first()).toBeVisible({ timeout: 10000 })
  })

  test('/praise loads with table data', async ({ page }) => {
    await assertPageLoads(page, '/praise')
    // Table with praise data should be visible
    await expect(page.locator('table').first()).toBeVisible({ timeout: 10000 })
  })

  test('/bulletin loads without error', async ({ page }) => {
    await assertPageLoads(page, '/bulletin')
  })

  test('/calendar loads with calendar grid', async ({ page }) => {
    await assertPageLoads(page, '/calendar')
    // Calendar grid should be visible
    await expect(page.locator('[class*="grid"], table, [role="grid"]').first()).toBeVisible({ timeout: 10000 })
  })

  test('/about loads with hero section', async ({ page }) => {
    await assertPageLoads(page, '/about')
    // Hero section or main content should be visible
    await expect(page.locator('section').first()).toBeVisible({ timeout: 10000 })
  })

  test('/prayer loads with prayer form', async ({ page }) => {
    await assertPageLoads(page, '/prayer')
    // Prayer form should be visible
    await expect(page.locator('form, textarea, [class*="prayer"]').first()).toBeVisible({ timeout: 10000 })
  })

  test('/columns loads without error', async ({ page }) => {
    await assertPageLoads(page, '/columns')
  })
})

// ─── Admin pages ────────────────────────────────────────────────────

test.describe('Admin pages', () => {
  test('/admin redirects to login', async ({ page }) => {
    await page.goto('/admin')
    // Should redirect to login page or show login form
    await page.waitForURL(/\/admin\/login/, { timeout: 10000 }).catch(() => {
      // If no redirect, check for login form presence
    })
    const url = page.url()
    const hasLoginForm = await page.locator('form').count() > 0
    expect(url.includes('/admin/login') || hasLoginForm).toBeTruthy()
  })
})

// ─── Regression tests ───────────────────────────────────────────────

test.describe('Regression tests', () => {
  // Bug #1 regression: search sermons must have youtubeId
  test('search sermons all have youtube thumbnails', async ({ page }) => {
    await page.goto('/search?q=예수')
    // If sermon section exists, all sermon items should have an img element
    const sermonSection = page.locator('section').filter({ hasText: '설교 영상' })
    const count = await sermonSection.count()
    if (count > 0) {
      const links = sermonSection.locator('a')
      for (const link of await links.all()) {
        // Every sermon card should have an img (thumbnail)
        await expect(link.locator('img')).toBeVisible({ timeout: 5000 })
      }
    }
  })

  // Bug #2 regression: PageViewTracker fires on navigation
  test('page view tracker fires API call', async ({ page }) => {
    const requestPromise = page.waitForRequest(
      req => req.url().includes('/api/page-views'),
      { timeout: 10000 }
    )
    await page.goto('/')
    await requestPromise // throws if no request within 10s
  })
})
