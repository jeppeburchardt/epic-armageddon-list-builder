import { test, expect } from '@playwright/test'
import { createPlaywrightTestList } from './helpers'

test.describe('GPR Transparency', () => {
  test('shows GPR data for a unit that has it', async ({ page }) => {
    await test.step('Create a Playwright Test Army list', async () => {
      await createPlaywrightTestList(page, 'GPR Transparency Test')
    })

    await test.step('Navigate to the Reference tab and open Test Tank GPR page', async () => {
      await page.getByRole('link', { name: 'Reference' }).click()
      await page.getByRole('link', { name: 'Test Tank' }).first().click()
    })

    await test.step('Verify the GPR page shows unit stats and GPR data', async () => {
      await expect(page).toHaveURL(/\/reference\/unit\/Test%20Tank\/gpr$/)
      await expect(page.getByRole('heading', { name: 'Test Tank' })).toBeVisible()
      await expect(page.getByText('Cost: 100 pts')).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Nearest neighbours' })).toBeVisible()
      await expect(page.getByText('Elite Test Tank')).toBeVisible()
      await expect(page.getByText('Support Platform')).toBeVisible()
      await expect(page.getByText('Mean: 98.50')).toBeVisible()
      await expect(page.getByText('Average (training): 95.00')).toBeVisible()
      await expect(page.getByText('Uncertainty (1σ): 7.25')).toBeVisible()
    })
  })

  test('shows empty state for a unit without GPR data', async ({ page }) => {
    await test.step('Create a Playwright Test Army list', async () => {
      await createPlaywrightTestList(page, 'GPR Empty State Test')
    })

    await test.step('Navigate to the Reference tab and open Support Platform GPR page', async () => {
      await page.getByRole('link', { name: 'Reference' }).click()
      await page.getByRole('link', { name: 'Support Platform' }).first().click()
    })

    await test.step('Verify the GPR page shows empty-state messages', async () => {
      await expect(page).toHaveURL(/\/reference\/unit\/Support%20Platform\/gpr$/)
      await expect(page.getByRole('heading', { name: 'Support Platform' })).toBeVisible()
      await expect(page.getByText('Cost: 50 pts')).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Nearest neighbours' })).toBeVisible()
      await expect(page.getByText('No neighbour data available.')).toBeVisible()
      await expect(page.getByText('No GPR data available for this unit.')).toBeVisible()
    })
  })
})
