import {
  expect,
  test,
} from '@playwright/test'

test('Double-clicking character renders Optimizer with character in focus.', async ({ page }) => {
  await page.goto('/#showcase')

  // dbl-click kafka TEXT
  await page.getByRole('menuitem', { name: 'Characters' }).click()
  await page.locator('#characterGrid').getByText('Kafka').dblclick()
  await expect(page.locator('#optimizerGridContainer')).toBeVisible()
  await expect(page.getByRole('main')).toContainText('Kafka')
  // chacater passives rendered
  await expect(page.getByRole('main')).toContainText('E1 DoT vulnerability')
  // lightcone passives rendered
  await expect(page.getByRole('main')).toContainText('Enemy shocked / wind sheared')
  // enemy options rendered
  await expect(page.getByRole('main')).toContainText('Enemy configurations')
  // optimizer options rendered
  await expect(page.getByRole('main')).toContainText('Boost main stat')

  // nav back to characters
  await page.getByRole('menuitem', { name: 'Characters' }).click()

  // dbl-click on blade image
  await page.locator('div').filter({ hasText: /^5⚰️ Blade$/ }).getByRole('img').dblclick()
  await expect(page.getByRole('main')).toContainText('Blade')
  await expect(page.getByRole('main')).toContainText('Hellscape state')
  await expect(page.getByRole('main')).toContainText('HP% lost total')
  await expect(page.getByRole('main')).toContainText('Boost main stat')
})
