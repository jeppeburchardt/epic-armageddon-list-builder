import { test, expect } from '@playwright/test'
import { addDetachment, createPlaywrightTestList, detachmentCard } from './helpers'

test.describe('Mobile View Improvements', () => {
  test.describe('Special rules as articles', () => {
    test.beforeEach(async ({ page }) => {
      await createPlaywrightTestList(page, 'Mobile Special Rules')
      await page.getByRole('link', { name: 'Reference' }).click()
      await expect(page).toHaveURL(/\/reference$/)
    })

    test('renders unit special rules as articles with headings and paragraphs', async ({
      page,
    }) => {
      const section = page.locator('.army-section').filter({ hasText: 'Unit Special Rules' })
      await expect(section.getByRole('heading', { name: 'Unit Special Rules' })).toBeVisible()

      const walkerArticle = section.locator('article.special-rule').filter({ hasText: 'Walker' })
      await expect(walkerArticle).toHaveCount(1)
      await expect(walkerArticle.getByRole('heading', { name: 'Walker' })).toBeVisible()
      await expect(walkerArticle.locator('p')).toContainText('dangerous terrain')
    })

    test('does not render the unit special rules as a table', async ({ page }) => {
      const section = page.locator('.army-section').filter({ hasText: 'Unit Special Rules' })
      await expect(section.locator('table')).toHaveCount(0)
    })
  })

  test.describe('Unit instance editor rows', () => {
    test.beforeEach(async ({ page }) => {
      await createPlaywrightTestList(page, 'Mobile Instance Editor')
      await addDetachment(page, 'Mutable Detachment')
    })

    test('renders one row per instance when weapons are configured individually', async ({
      page,
    }) => {
      const card = detachmentCard(page, 'Mutable Detachment')

      await test.step('Increase Test Tank count to 2', async () => {
        await card.getByRole('button', { name: 'Increase Test Tank count' }).click()
        await expect(card.getByLabel('Increase Test Tank count')).toBeVisible()
      })

      await test.step('Disable shared weapon options to edit each instance', async () => {
        await card.getByText('use same weapon options').click()
      })

      const editors = card.locator('.unit-instance-editor')
      await expect(editors).toHaveCount(2)

      await test.step('Each row exposes the turret weapon choice', async () => {
        for (let i = 0; i < 2; i++) {
          const row = editors.nth(i)
          await expect(row.locator('.slot-name')).toContainText('Turret')
          await expect(row.locator('select')).toBeVisible()
        }
      })
    })

    test('per-instance weapon selection is independent across rows', async ({ page }) => {
      const card = detachmentCard(page, 'Mutable Detachment')
      await card.getByRole('button', { name: 'Increase Test Tank count' }).click()
      await card.getByText('use same weapon options').click()

      const editors = card.locator('.unit-instance-editor')
      await editors.nth(0).locator('select').selectOption({ label: 'Plasma Cannon (+10pts)' })

      await expect(editors.nth(0).locator('select')).toHaveValue('Plasma Cannon')
      await expect(editors.nth(1).locator('select')).toHaveValue('Battle Cannon')
    })
  })
})
