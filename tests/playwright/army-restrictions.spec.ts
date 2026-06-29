import { test, expect } from '@playwright/test'
import { addDetachment, createPlaywrightTestList } from './helpers'

// Playwright Test Army restrictions (src/data/armies/playwright-test-army.json):
//   min 10% of points on Core detachments, max 1% of points on Support detachments
// At the default 3000pt list, that's a 300pts floor for Core and a 30pts ceiling for Support.

test.describe('Army Restrictions', () => {
  test.beforeEach(async ({ page }) => {
    await createPlaywrightTestList(page, 'Restrictions Test')
  })

  test('warns on min/max group percentage violations and clears once satisfied', async ({
    page,
  }) => {
    const warning = page.locator('.validation-message')

    await test.step('Empty list violates the Core minimum', async () => {
      await expect(warning).toContainText(
        'Core detachments cost 0pts — min 10% of 3000pts (300pts)',
      )
    })

    await test.step('Adding the Mutable Detachment satisfies the Core minimum', async () => {
      await addDetachment(page, 'Mutable Detachment', 'Core')
      await expect(warning).toContainText('List is valid')
    })

    await test.step('Adding the Support Detachment exceeds the Support maximum', async () => {
      await addDetachment(page, 'Support Detachment', 'Support')
      await expect(warning).toContainText(
        'Support detachments cost 50pts — max 1% of 3000pts (30pts)',
      )
    })
  })
})
