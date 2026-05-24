import { expect, test } from '@playwright/test'

test('creates a Legiones Astartes list and adds Tactical Detachment', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()

  await page.getByRole('button', { name: /New List|Create List/ }).first().click()
  await page.getByLabel('List Name').fill('Legiones Astartes Test List')
  await page.getByLabel('Army', { exact: true }).selectOption({ label: 'Legiones Astartes' })
  await page.getByRole('button', { name: 'Create', exact: true }).click()

  await expect(page).toHaveURL(/\/[^/]+\/edit$/)
  await expect(page.getByText('Legiones Astartes Test List')).toBeVisible()

  await page.getByRole('button', { name: 'Add Detachment' }).click()
  await page.getByRole('button', { name: /Tactical Detachment/ }).click()
  await page.getByRole('button', { name: 'Add', exact: true }).click()

  await expect(page.getByRole('heading', { name: /Tactical Detachment/ })).toBeVisible()
})
