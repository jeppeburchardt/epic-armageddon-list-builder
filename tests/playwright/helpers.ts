import { expect, type Locator, type Page } from '@playwright/test'

export const PLAYWRIGHT_TEST_ARMY_NAME = 'Playwright Test Army'

export async function resetLists(page: Page): Promise<void> {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
}

export async function createPlaywrightTestList(
  page: Page,
  listName = 'Playwright Test List',
): Promise<void> {
  await resetLists(page)
  await page
    .getByRole('button', { name: /New List|Create List/ })
    .first()
    .click()
  await page.getByLabel('List Name').fill(listName)
  await page.getByLabel('Army', { exact: true }).selectOption({ label: PLAYWRIGHT_TEST_ARMY_NAME })
  await page.getByRole('button', { name: 'Create', exact: true }).click()
  await expect(page).toHaveURL(/\/[^/]+\/edit$/)
}

export async function addDetachment(
  page: Page,
  detachmentName: string,
  groupName?: string,
): Promise<void> {
  await page.getByRole('button', { name: 'Add Detachment' }).click()
  const dialog = page.getByRole('dialog', { name: 'Add Detachment' })
  if (groupName) {
    await dialog.getByRole('button', { name: groupName, exact: true }).click()
  }
  await dialog.locator('.det-option').filter({ hasText: detachmentName }).click()
  await dialog.getByRole('button', { name: 'Add', exact: true }).click()
}

export function detachmentCard(page: Page, detachmentName: string): Locator {
  return page.locator('.detachment-card').filter({ hasText: detachmentName }).first()
}

export async function addUpgrade(card: Locator, upgradeName: string): Promise<void> {
  await card
    .getByRole('button', { name: /Add Upgrade|Add/, exact: false })
    .first()
    .click()
  const dialog = card.page().getByRole('dialog', { name: 'Add Upgrade' })
  await dialog.locator('.upgrade-option').filter({ hasText: upgradeName }).click()
  await dialog.getByRole('button', { name: 'Add', exact: true }).click()
}
