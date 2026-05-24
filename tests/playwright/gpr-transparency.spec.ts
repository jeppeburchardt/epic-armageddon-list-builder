import { expect, test } from '@playwright/test'

const MAX_DISPLAYED_NEIGHBOURS = 5

test('opens a unit GPR page from list reference', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()

  await page.getByRole('button', { name: /New List|Create List/ }).first().click()
  await page.getByLabel('List Name').fill('GPR Transparency Test')
  await page.getByLabel('Army', { exact: true }).selectOption({ label: 'Legiones Astartes' })
  await page.getByRole('button', { name: 'Create', exact: true }).click()

  await page.getByRole('link', { name: 'Reference' }).click()
  await page.getByRole('link', { name: 'Tactical Squad' }).first().click()

  await expect(page).toHaveURL(/\/reference\/unit\/Tactical%20Squad\/gpr$/)
  await expect(page.getByRole('heading', { name: 'Tactical Squad' })).toBeVisible()
  await expect(page.getByText('Cost: 40 pts')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Nearest neighbours' })).toBeVisible()
  await expect(page.locator('.neighbour-list li')).toHaveCount(MAX_DISPLAYED_NEIGHBOURS)
  await expect(page.getByText('Mean:')).toBeVisible()
  await expect(page.getByText('Average (training):')).toBeVisible()
})
