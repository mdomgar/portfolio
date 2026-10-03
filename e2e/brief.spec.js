import { expect, test } from '@playwright/test'
import { openStatic } from './helpers.js'

async function mockApi(page, status = 200, body = { ok: true }) {
  const requests = []
  await page.route('**/api/brief', async (route) => {
    requests.push(route.request().postDataJSON())
    await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
  })
  return requests
}

test.describe('brief', () => {
  test('sends a complete brief to the API', async ({ page }) => {
    const requests = await mockApi(page)
    await openStatic(page, '/', '#brief')
    const brief = page.locator('#brief')
    await brief.getByText('Una herramienta', { exact: true }).click()
    await brief.getByRole('button', { name: 'Siguiente' }).click()
    await brief.getByLabel('Tu proyecto').fill('Necesito un panel para dejar de hacer informes a mano cada lunes.')
    await brief.getByText('Sustituir hojas de Excel').click()
    await brief.getByRole('button', { name: 'Siguiente' }).click()
    await brief.getByText('Sin prisa', { exact: true }).click()
    await brief.getByRole('button', { name: 'Siguiente' }).click()
    await brief.getByLabel('Nombre').fill('Ana')
    await brief.getByLabel('Email').fill('ana@example.es')
    await brief.getByRole('checkbox', { name: /política de privacidad/ }).check()
    await brief.getByRole('button', { name: 'Enviar' }).click()
    await expect(brief.getByRole('heading', { name: 'Recibido, Ana. Te respondo en menos de 48 h.' })).toBeVisible()
    expect(requests).toHaveLength(1)
    expect(requests[0]).toMatchObject({
      type: 'tool',
      tags: ['spreadsheets'],
      timeline: 'no-rush',
      name: 'Ana',
      email: 'ana@example.es',
      privacy: true,
      website: '',
    })
    expect(requests[0].elapsedMs).toBeGreaterThan(0)
  })

  test('can be completed with the keyboard only', async ({ page }) => {
    const requests = await mockApi(page)
    await openStatic(page, '/', '#brief')
    await page.getByRole('radio', { name: 'Una web' }).focus()
    await page.keyboard.press('Space')
    await page.keyboard.press('Enter')
    await expect(page.locator('#brief-question')).toHaveText('Cuéntame un poco más')
    await expect(page.locator('#brief-question')).toBeFocused()
    await page.keyboard.press('Tab')
    await page.keyboard.type('Quiero renovar la web de mi taller y añadir citas online.')
    await page.getByRole('button', { name: 'Siguiente' }).focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('#brief-question')).toHaveText('¿Para cuándo?')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Space')
    await page.keyboard.press('Enter')
    await expect(page.locator('#brief-question')).toHaveText('¿Cómo te contacto?')
    await page.keyboard.press('Tab')
    await page.keyboard.type('Luis')
    await page.keyboard.press('Tab')
    await page.keyboard.type('luis@example.es')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Space')
    await page.keyboard.press('Enter')
    await expect(page.getByRole('heading', { name: /^Recibido, Luis\./ })).toBeFocused()
    expect(requests[0]).toMatchObject({ type: 'web', timeline: 'asap', name: 'Luis' })
  })

  test('keeps the answers and recovers after a server error', async ({ page }) => {
    let calls = 0
    await page.route('**/api/brief', async (route) => {
      calls += 1
      await route.fulfill({
        status: calls === 1 ? 500 : 200,
        contentType: 'application/json',
        body: JSON.stringify(calls === 1 ? { error: 'send_failed' } : { ok: true }),
      })
    })
    await openStatic(page, '/', '#brief')
    const brief = page.locator('#brief')
    await brief.getByText('Una app', { exact: true }).click()
    await brief.getByRole('button', { name: 'Siguiente' }).click()
    await brief.getByLabel('Tu proyecto').fill('Una app para que los socios de mi club reserven pista.')
    await brief.getByRole('button', { name: 'Siguiente' }).click()
    await brief.getByText('Lo antes posible', { exact: true }).click()
    await brief.getByRole('button', { name: 'Siguiente' }).click()
    await brief.getByLabel('Nombre').fill('Marta')
    await brief.getByLabel('Email').fill('marta@example.es')
    await brief.getByRole('checkbox', { name: /política de privacidad/ }).check()
    await brief.getByRole('button', { name: 'Enviar' }).click()
    await expect(brief.getByText('No se ha podido enviar. Tus respuestas siguen aquí.')).toBeVisible()
    await expect(brief.getByLabel('Email')).toHaveValue('marta@example.es')
    await brief.getByRole('button', { name: 'Reintentar' }).click()
    await expect(brief.getByRole('heading', { name: /^Recibido, Marta\./ })).toBeVisible()
  })
})
