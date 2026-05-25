import { expect, test } from '@playwright/test'
import { addDetachment, createPlaywrightTestList, detachmentCard } from './helpers'

test('creates a Playwright test list and adds a mutable detachment', async ({ page }) => {
  await createPlaywrightTestList(page, 'Playwright Army List')
  await addDetachment(page, 'Mutable Detachment')

  await expect(detachmentCard(page, 'Mutable Detachment')).toContainText('1 Test Tank')
})
