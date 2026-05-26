import { expect, test } from '@playwright/test'
import { addDetachment, addUpgrade, createPlaywrightTestList, detachmentCard } from './helpers'

test('base units details panel is collapsed by default', async ({ page }) => {
  await createPlaywrightTestList(page, 'Details Default State')
  await addDetachment(page, 'Mutable Detachment')

  const card = detachmentCard(page, 'Mutable Detachment')
  const baseUnitsPanel = card.locator('details').first()

  await expect(baseUnitsPanel).not.toHaveAttribute('open')
})

test('base units details panel toggles open and closed on click', async ({ page }) => {
  await createPlaywrightTestList(page, 'Details Toggle')
  await addDetachment(page, 'Mutable Detachment')

  const card = detachmentCard(page, 'Mutable Detachment')
  const baseUnitsPanel = card.locator('details').first()
  const summary = baseUnitsPanel.locator('summary')

  await expect(baseUnitsPanel).not.toHaveAttribute('open')

  await summary.click()
  await expect(baseUnitsPanel).toHaveAttribute('open', '')

  await summary.click()
  await expect(baseUnitsPanel).not.toHaveAttribute('open')
})

test('toggle indicator is present in base units and upgrade panel summaries', async ({ page }) => {
  await createPlaywrightTestList(page, 'Toggle Indicator')
  await addDetachment(page, 'Mutable Detachment')

  const card = detachmentCard(page, 'Mutable Detachment')
  const baseUnitsPanel = card.locator('details').first()

  await expect(baseUnitsPanel.locator('summary .toggle-indicator')).toBeVisible()

  await addUpgrade(card, 'Test Support Upgrade')
  const upgradePanel = card.locator('details').filter({ hasText: 'Test Support Upgrade' }).first()
  await expect(upgradePanel.locator('summary .toggle-indicator')).toBeVisible()
})

test('expanding one detachment does not expand others', async ({ page }) => {
  await createPlaywrightTestList(page, 'Independent Detachments')
  await addDetachment(page, 'Mutable Detachment')
  await addDetachment(page, 'Support Detachment', 'Support')

  const mutableCard = detachmentCard(page, 'Mutable Detachment')
  const supportCard = detachmentCard(page, 'Support Detachment')

  const mutablePanel = mutableCard.locator('details').first()
  const supportPanel = supportCard.locator('details').first()

  await mutablePanel.locator('summary').click()

  await expect(mutablePanel).toHaveAttribute('open', '')
  await expect(supportPanel).not.toHaveAttribute('open')
})

test('upgrade details panel has toggle indicator and can be toggled', async ({ page }) => {
  await createPlaywrightTestList(page, 'Upgrade Panel Default State')
  await addDetachment(page, 'Mutable Detachment')

  const card = detachmentCard(page, 'Mutable Detachment')
  await addUpgrade(card, 'Test Support Upgrade')

  const upgradePanel = card.locator('details').filter({ hasText: 'Test Support Upgrade' }).first()

  await expect(upgradePanel.locator('summary .toggle-indicator')).toBeVisible()

  await upgradePanel.locator('summary').click()
  await expect(upgradePanel).not.toHaveAttribute('open')

  await upgradePanel.locator('summary').click()
  await expect(upgradePanel).toHaveAttribute('open', '')
})
