import { test, expect } from '@playwright/test'
import {
  addDetachment,
  addUpgrade,
  createPlaywrightTestList,
  detachmentCard,
  resetLists,
} from './helpers'

test.describe('List Home Management', () => {
  test.beforeEach(async ({ page }) => {
    await resetLists(page)
  })

  test('shows a created list on the home page', async ({ page }) => {
    await test.step('Create the list', async () => {
      await createPlaywrightTestList(page, 'Delete Me')
    })

    await test.step('Navigate to home and confirm the list card is visible', async () => {
      await page.goto('/')
      await expect(page.locator('.list-card').filter({ hasText: 'Delete Me' })).toContainText(
        'Delete Me',
      )
    })
  })

  test('deletes a list and shows the empty state', async ({ page }) => {
    await test.step('Create the list', async () => {
      await createPlaywrightTestList(page, 'Delete Me')
      await page.goto('/')
    })

    await test.step('Delete the list', async () => {
      const listCard = page.locator('.list-card').filter({ hasText: 'Delete Me' })
      page.once('dialog', (dialog) => dialog.accept())
      await listCard.getByRole('button', { name: 'Delete list' }).click()
    })

    await test.step('Verify the list is removed and the empty state is displayed', async () => {
      await expect(page.getByText('Delete Me')).not.toBeVisible()
      await expect(
        page.getByText('No army lists yet. Create your first list to get started!'),
      ).toBeVisible()
    })
  })
})

test.describe('Detachment Ordering', () => {
  test.beforeEach(async ({ page }) => {
    await createPlaywrightTestList(page, 'Ordering Test')
    await addDetachment(page, 'Mutable Detachment')
    await addDetachment(page, 'Support Detachment', 'Support')
  })

  test('moves a detachment up', async ({ page }) => {
    await detachmentCard(page, 'Support Detachment')
      .getByRole('button', { name: 'Move up' })
      .click()
    await expect(page.locator('.detachment-card').nth(0)).toContainText('Support Detachment')
    await expect(page.locator('.detachment-card').nth(1)).toContainText('Mutable Detachment')
  })

  test('moves a detachment down', async ({ page }) => {
    await detachmentCard(page, 'Support Detachment')
      .getByRole('button', { name: 'Move up' })
      .click()
    await detachmentCard(page, 'Support Detachment')
      .getByRole('button', { name: 'Move down' })
      .click()
    await expect(page.locator('.detachment-card').nth(0)).toContainText('Mutable Detachment')
    await expect(page.locator('.detachment-card').nth(1)).toContainText('Support Detachment')
  })

  test('removes a detachment', async ({ page }) => {
    await detachmentCard(page, 'Support Detachment')
      .getByRole('button', { name: /Remove detachment|Remove/ })
      .click()
    await expect(page.locator('.detachment-card')).toHaveCount(1)
    await expect(page.locator('.detachment-card').first()).toContainText('Mutable Detachment')
  })
})

test.describe('Unit Counts and Weapon Selections', () => {
  test.beforeEach(async ({ page }) => {
    await createPlaywrightTestList(page, 'Unit Test')
    await addDetachment(page, 'Mutable Detachment')
  })

  test('changes the base unit count', async ({ page }) => {
    const card = detachmentCard(page, 'Mutable Detachment')
    const baseTankPanel = card
      .locator('details')
      .first()
      .locator('.unit')
      .filter({ hasText: 'Test Tank' })
      .first()

    await baseTankPanel.locator('input.amount').fill('3')
    await expect(card).toContainText('3 Test Tank')
  })

  test('clamps the base unit count to detachment min and max', async ({ page }) => {
    const card = detachmentCard(page, 'Mutable Detachment')
    const baseTankAmountInput = card
      .locator('details')
      .first()
      .locator('.unit')
      .filter({ hasText: 'Test Tank' })
      .first()
      .locator('input.amount')

    await baseTankAmountInput.fill('99')
    await expect(baseTankAmountInput).toHaveValue('3')
    await expect(card).toContainText('3 Test Tank')

    await baseTankAmountInput.fill('0')
    await expect(baseTankAmountInput).toHaveValue('1')
    await expect(card).toContainText('1 Test Tank')
  })

  test('selects a weapon for a base unit', async ({ page }) => {
    const card = detachmentCard(page, 'Mutable Detachment')
    const baseTankPanel = card
      .locator('details')
      .first()
      .locator('.unit')
      .filter({ hasText: 'Test Tank' })
      .first()

    await baseTankPanel.getByRole('combobox').selectOption('Plasma Cannon')
    await expect(baseTankPanel.getByRole('combobox')).toHaveValue('Plasma Cannon')
  })
})

test.describe('Upgrades', () => {
  test.beforeEach(async ({ page }) => {
    await createPlaywrightTestList(page, 'Upgrade Test')
    await addDetachment(page, 'Mutable Detachment')
  })

  test('applies an add-type upgrade and sets unit counts and weapons', async ({ page }) => {
    const card = detachmentCard(page, 'Mutable Detachment')

    await test.step('Add the upgrade', async () => {
      await addUpgrade(card, 'Test Support Upgrade')
    })

    const upgradePanel = card.locator('details').filter({ hasText: 'Test Support Upgrade' }).first()
    const supportDronePanel = upgradePanel
      .locator('.unit')
      .filter({ hasText: 'Support Drone' })
      .first()
    const missileDronePanel = upgradePanel
      .locator('.unit')
      .filter({ hasText: 'Missile Drone' })
      .first()

    await test.step('Set unit counts', async () => {
      await supportDronePanel.locator('input.amount').fill('1')
      await missileDronePanel.locator('input.amount').fill('1')
      await expect(upgradePanel).toContainText('1 Support Drone')
      await expect(upgradePanel).toContainText('1 Missile Drone')
    })

    await test.step('Select a weapon for the Support Drone', async () => {
      await supportDronePanel.getByRole('combobox').selectOption('Melta Pod')
      await expect(supportDronePanel.getByRole('combobox')).toHaveValue('Melta Pod')
    })
  })

  test('applies a replace-type upgrade and sets count and weapon', async ({ page }) => {
    const card = detachmentCard(page, 'Mutable Detachment')

    await test.step('Add the upgrade', async () => {
      await addUpgrade(card, 'Test Retrofit')
    })

    const upgradePanel = card.locator('details').filter({ hasText: 'Test Retrofit' }).first()
    const eliteTankPanel = upgradePanel
      .locator('.unit')
      .filter({ hasText: 'Test Tank → Elite Test Tank' })
      .first()

    await test.step('Set replacement count', async () => {
      await eliteTankPanel.locator('input.amount').fill('2')
      await expect(upgradePanel).toContainText('2 Elite Test Tank')
    })

    await test.step('Select a weapon for the Elite Test Tank', async () => {
      await eliteTankPanel.getByRole('combobox').selectOption('Heavy Plasma')
      await expect(eliteTankPanel.getByRole('combobox')).toHaveValue('Heavy Plasma')
    })
  })

  test('applies a character upgrade and selects a character', async ({ page }) => {
    const card = detachmentCard(page, 'Mutable Detachment')

    await test.step('Add the upgrade', async () => {
      await addUpgrade(card, 'Test Commander')
    })

    const upgradePanel = card.locator('details').filter({ hasText: 'Test Commander' }).first()

    await test.step('Select a character name', async () => {
      await upgradePanel.getByRole('combobox').selectOption('Test Supreme Commander')
      await expect(upgradePanel.getByRole('combobox')).toHaveValue('Test Supreme Commander')
    })
  })

  test('removes an applied upgrade', async ({ page }) => {
    const card = detachmentCard(page, 'Mutable Detachment')

    await test.step('Add the upgrade', async () => {
      await addUpgrade(card, 'Test Commander')
    })

    const upgradePanel = card.locator('details').filter({ hasText: 'Test Commander' }).first()

    await test.step('Remove the upgrade', async () => {
      await upgradePanel.getByRole('button', { name: 'Remove' }).click()
    })

    await expect(card.locator('details').filter({ hasText: 'Test Commander' })).toHaveCount(0)
  })
})
