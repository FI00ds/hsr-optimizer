import {
  expect,
  test,
} from '@playwright/test'

test('Add new relic from RelicsTab', async ({ page }) => {
  await page.goto('/#showcase')

  // nav to RelicsTab
  await page.getByRole('menuitem', { name: 'Relics' }).click()
  await expect(page.getByRole('main')).toContainText('Add New Relic')
  await page.getByRole('button', { name: 'Add New Relic' }).click()

  // assert empty form state
  await page.locator('#equippedBy').click()
  await page.getByTitle('None').locator('div').click()
  await expect(page.getByRole('dialog')).toContainText('None')

  // add "hands"
  await page.locator('label:nth-child(2) > span:nth-child(2) > .ant-image > .ant-image-img').click()
  await page.getByRole('dialog').getByText('Passerby of Wandering Cloud').click()

  // add "Musketeer of Wild Wheat"
  await page.getByText('Musketeer of Wild Wheat').nth(3).click()
  await expect(page.getByRole('dialog')).toContainText('Musketeer of Wild Wheat')

  // set to +12
  await page.getByRole('dialog').getByText('+15').click()
  await page.getByTitle('+12').locator('div').click()

  // assert main stat is flat atk
  await expect(page.getByRole('dialog')).toContainText('ATK')

  // set substats
  await page.locator('#substatType0').click()
  await page.locator('#substatType0').fill('crit dmg')
  await page.locator('#substatType0').press('Enter')
  await page.locator('#substatValue0').fill('10')

  await page.locator('#substatType1').click()
  await page.locator('#substatType1').fill('effect hit rate')
  await page.locator('#substatType1').press('Enter')
  await page.locator('#substatValue1').fill('10')

  await page.locator('#substatType2').click()
  await page.locator('#substatType2').fill('atk%')
  await page.locator('#substatType2').press('Enter')
  await page.locator('#substatValue2').fill('10')

  await page.locator('#substatType3').click()
  await page.locator('#substatType3').fill('def%')
  await page.locator('#substatType3').press('Enter')
  await page.locator('#substatValue3').fill('10')

  await page.getByRole('button', { name: 'Submit' }).click()

  // assert relic added

  await expect(page.locator('#RELICS div').locator('.ant-card-body')).toContainText('+12')
  await expect(page.locator('#RELICS div').locator('.ant-card-body')).toContainText('+12ATK293ATK %10.0%DEF %10.0%CRIT DMG10.0%Effect HIT10.0%')
  await expect(page.locator('#RELICS div').locator('.ant-card-body')).toContainText('ATK293')
  await expect(page.locator('#RELICS div').locator('.ant-card-body')).toContainText('CRIT DMG10.0%')
  await expect(page.locator('#RELICS div').locator('.ant-card-body')).toContainText('Effect HIT10.0%')
  await expect(page.locator('#RELICS div').locator('.ant-card-body')).toContainText('ATK %10.0%')
  await expect(page.locator('#RELICS div').locator('.ant-card-body')).toContainText('DEF %10.0%')

  // // re-edit relic - assert values carried over
  await page.locator('#RELICS div').locator('.ant-card-body').click()
  await expect(page.getByRole('dialog').locator('div').filter({ hasText: 'Equipped' }).first()).toBeVisible()
  await expect(page.getByRole('dialog')).toContainText('None')
  await expect(page.getByRole('dialog')).toContainText('Musketeer of Wild Wheat')
  await expect(page.getByRole('dialog')).toContainText('+12+35 ★')
  await expect(page.getByRole('dialog')).toContainText('CRIT DMG')
  await expect(page.getByRole('dialog')).toContainText('Effect Hit Rate')
  await expect(page.getByRole('dialog')).toContainText('ATK%')
  await expect(page.getByRole('dialog')).toContainText('DEF%')

  // close/re-save
  await page.getByRole('button', { name: 'Submit' }).click()
})
