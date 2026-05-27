import { test, expect } from '@playwright/test'
import { resetLists } from './helpers'

const MAX_DISPLAYED_NEIGHBOURS = 5

test.describe('GPR Transparency', () => {
  test('opens a unit GPR page from the list reference view', async ({ page }) => {
    await test.step('Create a Legiones Astartes list', async () => {
      await resetLists(page)
      await page
        .getByRole('button', { name: /New List|Create List/ })
        .first()
        .click()
      await page.getByLabel('List Name').fill('GPR Transparency Test')
      await page.getByLabel('Army', { exact: true }).selectOption({ label: 'Legiones Astartes' })
      await page.getByRole('button', { name: 'Create', exact: true }).click()
      await expect(page).toHaveURL(/\/[^/]+\/edit$/)
    })

    await test.step('Navigate to the Reference tab and open a unit GPR page', async () => {
      await page.getByRole('link', { name: 'Reference' }).click()
      await page.getByRole('link', { name: 'Tactical Squad' }).first().click()
    })

    await test.step('Verify the GPR page shows unit stats and neighbours', async () => {
      await expect(page).toHaveURL(/\/reference\/unit\/Tactical%20Squad\/gpr$/)
      await expect(page.getByRole('heading', { name: 'Tactical Squad' })).toBeVisible()
      await expect(page.getByText('Cost: 40 pts')).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Nearest neighbours' })).toBeVisible()
      await expect(page.locator('.neighbour-list li')).toHaveCount(MAX_DISPLAYED_NEIGHBOURS)
      await expect(page.getByText('Mean:')).toBeVisible()
      await expect(page.getByText('Average (training):')).toBeVisible()
    })
  })
})
