import { expect, test } from '@playwright/test'
import { addDetachment, addUpgrade, createPlaywrightTestList, detachmentCard } from './helpers'

test('creates and deletes a Playwright test list from the home page', async ({ page }) => {
  await createPlaywrightTestList(page, 'Delete Me')
  await page.goto('/')

  const listCard = page.locator('.list-card').filter({ hasText: 'Delete Me' })
  await expect(listCard).toBeVisible()

  page.once('dialog', (dialog) => dialog.accept())
  await listCard.getByRole('button', { name: 'Delete list' }).click()

  await expect(page.getByText('Delete Me')).not.toBeVisible()
  await expect(
    page.getByText('No army lists yet. Create your first list to get started!'),
  ).toBeVisible()
})

test('covers list editor mutations with the Playwright test army', async ({ page }) => {
  await createPlaywrightTestList(page, 'Mutation Coverage')

  await addDetachment(page, 'Mutable Detachment')
  await addDetachment(page, 'Support Detachment', 'Support')

  await expect(page.locator('.detachment-card').nth(0)).toContainText('Mutable Detachment')
  await expect(page.locator('.detachment-card').nth(1)).toContainText('Support Detachment')

  await detachmentCard(page, 'Support Detachment').getByRole('button', { name: 'Move up' }).click()
  await expect(page.locator('.detachment-card').nth(0)).toContainText('Support Detachment')

  await detachmentCard(page, 'Support Detachment')
    .getByRole('button', { name: 'Move down' })
    .click()
  await expect(page.locator('.detachment-card').nth(0)).toContainText('Mutable Detachment')

  const mutableCard = detachmentCard(page, 'Mutable Detachment')
  const baseUnitsPanel = mutableCard.locator('details').first()
  const baseTankPanel = baseUnitsPanel.locator('.unit').filter({ hasText: 'Test Tank' }).first()

  await baseTankPanel.locator('input.amount').fill('3')
  await expect(mutableCard).toContainText('3 Test Tank')

  await baseTankPanel.getByRole('combobox').selectOption('Plasma Cannon')
  await expect(baseTankPanel.getByRole('combobox')).toHaveValue('Plasma Cannon')

  await addUpgrade(mutableCard, 'Test Support Upgrade')
  const addUpgradePanel = mutableCard
    .locator('details')
    .filter({ hasText: 'Test Support Upgrade' })
    .first()
  const supportDronePanel = addUpgradePanel
    .locator('.unit')
    .filter({ hasText: 'Support Drone' })
    .first()
  const missileDronePanel = addUpgradePanel
    .locator('.unit')
    .filter({ hasText: 'Missile Drone' })
    .first()

  await supportDronePanel.locator('input.amount').fill('1')
  await missileDronePanel.locator('input.amount').fill('1')
  await expect(addUpgradePanel).toContainText('1xSupport Drone')
  await expect(addUpgradePanel).toContainText('1xMissile Drone')

  await supportDronePanel.getByRole('combobox').selectOption('Melta Pod')
  await expect(supportDronePanel.getByRole('combobox')).toHaveValue('Melta Pod')

  await addUpgrade(mutableCard, 'Test Retrofit')
  const replaceUpgradePanel = mutableCard
    .locator('details')
    .filter({ hasText: 'Test Retrofit' })
    .first()
  const eliteTankPanel = replaceUpgradePanel
    .locator('.unit')
    .filter({ hasText: 'Test Tank → Elite Test Tank' })
    .first()

  await eliteTankPanel.locator('input.amount').fill('2')
  await expect(replaceUpgradePanel).toContainText('2xElite Test Tank')

  await eliteTankPanel.getByRole('combobox').selectOption('Heavy Plasma')
  await expect(eliteTankPanel.getByRole('combobox')).toHaveValue('Heavy Plasma')

  await addUpgrade(mutableCard, 'Test Commander')
  const characterUpgradePanel = mutableCard
    .locator('details')
    .filter({ hasText: 'Test Commander' })
    .first()
  await characterUpgradePanel.getByRole('combobox').selectOption('Test Supreme Commander')
  await expect(characterUpgradePanel.getByRole('combobox')).toHaveValue('Test Supreme Commander')

  await characterUpgradePanel.getByRole('button', { name: 'Remove' }).click()
  await expect(mutableCard.locator('details').filter({ hasText: 'Test Commander' })).toHaveCount(0)

  await detachmentCard(page, 'Support Detachment')
    .getByRole('button', { name: /Remove detachment|Remove/ })
    .click()
  await expect(page.locator('.detachment-card')).toHaveCount(1)
  await expect(page.locator('.detachment-card').first()).toContainText('Mutable Detachment')
})
