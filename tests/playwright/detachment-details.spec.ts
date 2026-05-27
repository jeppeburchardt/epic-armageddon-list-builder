import { test, expect } from '@playwright/test'
import { addDetachment, addUpgrade, createPlaywrightTestList, detachmentCard } from './helpers'

test.describe('Detachment Details Panels', () => {
  test.beforeEach(async ({ page }) => {
    await createPlaywrightTestList(page, 'Details Tests')
    await addDetachment(page, 'Mutable Detachment')
  })

  test.describe('Base units panel', () => {
    test('is open by default', async ({ page }) => {
      const baseUnitsPanel = detachmentCard(page, 'Mutable Detachment').locator('details').first()
      await expect(baseUnitsPanel).toHaveAttribute('open', '')
    })

    test('collapses on first click and expands on second click', async ({ page }) => {
      const baseUnitsPanel = detachmentCard(page, 'Mutable Detachment').locator('details').first()
      const summary = baseUnitsPanel.locator('summary')

      await expect(baseUnitsPanel).toHaveAttribute('open', '')

      await summary.click()
      await expect(baseUnitsPanel).not.toHaveAttribute('open')

      await summary.click()
      await expect(baseUnitsPanel).toHaveAttribute('open', '')
    })

    test('has a toggle indicator in its summary', async ({ page }) => {
      const baseUnitsPanel = detachmentCard(page, 'Mutable Detachment').locator('details').first()
      await expect(baseUnitsPanel.locator('summary .toggle-indicator')).toBeVisible()
    })
  })

  test('toggling one detachment panel does not affect others', async ({ page }) => {
    await addDetachment(page, 'Support Detachment', 'Support')

    const mutableCard = detachmentCard(page, 'Mutable Detachment')
    const supportCard = detachmentCard(page, 'Support Detachment')
    const mutablePanel = mutableCard.locator('details').first()
    const supportPanel = supportCard.locator('details').first()

    await expect(mutablePanel).toHaveAttribute('open', '')
    await expect(supportPanel).toHaveAttribute('open', '')

    await mutablePanel.locator('summary').click()

    await expect(mutablePanel).not.toHaveAttribute('open')
    await expect(supportPanel).toHaveAttribute('open', '')
  })

  test.describe('Upgrade panel', () => {
    test('is open when added, has a toggle indicator, and can be toggled', async ({ page }) => {
      const card = detachmentCard(page, 'Mutable Detachment')
      await addUpgrade(card, 'Test Support Upgrade')

      const upgradePanel = card
        .locator('details')
        .filter({ hasText: 'Test Support Upgrade' })
        .first()

      await expect(upgradePanel.locator('summary .toggle-indicator')).toBeVisible()
      await expect(upgradePanel).toHaveAttribute('open', '')

      await upgradePanel.locator('summary').click()
      await expect(upgradePanel).not.toHaveAttribute('open')

      await upgradePanel.locator('summary').click()
      await expect(upgradePanel).toHaveAttribute('open', '')
    })
  })
})
