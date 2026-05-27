import { test, expect } from '@playwright/test'
import { addDetachment, createPlaywrightTestList, detachmentCard } from './helpers'

test.describe('List Creation', () => {
  test('creates a new list and shows the detachment with its default composition', async ({
    page,
  }) => {
    await test.step('Create a new Playwright Test Army list', async () => {
      await createPlaywrightTestList(page, 'Playwright Army List')
    })

    await test.step('Add a detachment', async () => {
      await addDetachment(page, 'Mutable Detachment')
    })

    await test.step('Verify the detachment card shows the default unit composition', async () => {
      await expect(detachmentCard(page, 'Mutable Detachment')).toContainText('1 Test Tank')
    })
  })
})
