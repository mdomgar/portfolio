import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Brief from './Brief'
import { BRIEF_DRAFT_KEY } from '../lib/briefDraft'

const json = (status, body) => () => Promise.resolve(new Response(JSON.stringify(body), { status }))

beforeEach(() => {
  window.sessionStorage.clear()
  vi.stubGlobal('fetch', vi.fn(json(200, { ok: true })))
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const next = (user) => user.click(screen.getByRole('button', { name: /Siguiente/ }))
const question = () => document.getElementById('brief-question')

async function fillAll(user) {
  await user.click(screen.getByRole('radio', { name: 'Una web' }))
  await next(user)
  await user.type(screen.getByLabelText('Tu proyecto'), 'Una web para mi peluquería con reservas online.')
  await user.click(screen.getByRole('checkbox', { name: 'Necesito reservas' }))
  await next(user)
  await user.click(screen.getByRole('radio', { name: 'En 1–3 meses' }))
  await next(user)
  await user.type(screen.getByLabelText('Nombre'), 'Ana')
  await user.type(screen.getByLabelText('Email'), 'ana@example.es')
  await user.click(screen.getByRole('checkbox', { name: /política de privacidad/ }))
}

describe('Brief', () => {
  it('asks what to build first and will not move on without an answer', async () => {
    const user = userEvent.setup()
    render(<Brief />)
    expect(question()).toHaveTextContent('¿Qué quieres construir?')
    await next(user)
    expect(question()).toHaveTextContent('¿Qué quieres construir?')
    expect(screen.getByText('Elige una opción.')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Una web' })).toHaveFocus()
  })

  it('shows the hint and the quick tags that fit the chosen type', async () => {
    const user = userEvent.setup()
    render(<Brief />)
    await user.click(screen.getByRole('radio', { name: 'Una app' }))
    await next(user)
    expect(screen.getByText('¿Quién la usaría y qué tendría que poder hacer?')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Con notificaciones' })).toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: 'Necesito reservas' })).not.toBeInTheDocument()
  })

  it('asks for a bit more detail when the description is too short', async () => {
    const user = userEvent.setup()
    render(<Brief />)
    await user.click(screen.getByRole('radio', { name: 'Una herramienta' }))
    await next(user)
    await user.type(screen.getByLabelText('Tu proyecto'), 'Un Excel')
    expect(screen.getByText('8 / 2000 caracteres')).toBeInTheDocument()
    await next(user)
    expect(screen.getByText('Cuéntame un poco más (mínimo 20 caracteres).')).toBeInTheDocument()
  })

  it('moves the focus to each new question and announces it', async () => {
    const user = userEvent.setup()
    render(<Brief />)
    await user.click(screen.getByRole('radio', { name: 'Una web' }))
    await next(user)
    expect(question()).toHaveTextContent('Cuéntame un poco más')
    expect(question()).toHaveFocus()
    expect(screen.getByText('Paso 2 de 4: Cuéntame un poco más')).toBeInTheDocument()
    expect(document.querySelector('.brief-step')).toHaveAttribute('data-direction', 'forward')
  })

  it('advances with Enter, without animation', async () => {
    const user = userEvent.setup()
    render(<Brief />)
    await user.click(screen.getByRole('radio', { name: 'Una web' }))
    await user.keyboard('{Enter}')
    expect(question()).toHaveTextContent('Cuéntame un poco más')
    expect(document.querySelector('.brief-step')).toHaveAttribute('data-direction', 'none')
  })

  it('walks through the four steps and sends the brief', async () => {
    const user = userEvent.setup()
    render(<Brief />)
    await fillAll(user)
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(await screen.findByRole('heading', { name: 'Recibido, Ana. Te respondo en menos de 48 h.' })).toHaveFocus()
    expect(fetch).toHaveBeenCalledTimes(1)
    const [url, options] = fetch.mock.calls[0]
    expect(url).toBe('/api/brief')
    expect(JSON.parse(options.body)).toMatchObject({
      type: 'web',
      tags: ['booking'],
      timeline: '1-3m',
      name: 'Ana',
      email: 'ana@example.es',
      privacy: true,
      website: '',
      elapsedMs: expect.any(Number),
    })
    expect(screen.getByText('Una web · Necesito reservas')).toBeInTheDocument()
    expect(screen.getByText('En 1–3 meses')).toBeInTheDocument()
    expect(window.sessionStorage.getItem(BRIEF_DRAFT_KEY)).toBeNull()
  })

  it('keeps a draft for the session and restores it', async () => {
    window.sessionStorage.setItem(
      BRIEF_DRAFT_KEY,
      JSON.stringify({ type: 'tool', details: 'Paso los pedidos a mano a un Excel cada lunes.' }),
    )
    const user = userEvent.setup()
    render(<Brief />)
    expect(await screen.findByRole('radio', { name: 'Una herramienta' })).toBeChecked()
    await next(user)
    expect(screen.getByLabelText('Tu proyecto')).toHaveValue('Paso los pedidos a mano a un Excel cada lunes.')
    await user.type(screen.getByLabelText('Tu proyecto'), ' Y facturas.')
    expect(JSON.parse(window.sessionStorage.getItem(BRIEF_DRAFT_KEY)).details).toMatch(/Y facturas\.$/)
  })

  it('keeps the answers and offers a retry and my email when sending fails', async () => {
    fetch.mockImplementationOnce(json(500, { error: 'send_failed' }))
    const user = userEvent.setup()
    render(<Brief />)
    await fillAll(user)
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(await screen.findByText('No se ha podido enviar. Tus respuestas siguen aquí.')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveValue('ana@example.es')
    expect(screen.getByRole('link', { name: 'miguelangelespeluy@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:miguelangelespeluy@gmail.com',
    )
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByRole('heading', { name: /^Recibido, Ana\./ })).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('never sends twice while a request is in flight', async () => {
    fetch.mockImplementation(() => new Promise(() => {}))
    const user = userEvent.setup()
    render(<Brief />)
    await fillAll(user)
    const submit = screen.getByRole('button', { name: 'Enviar' })
    await user.click(submit)
    await user.click(submit)
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Enviando…' })).toBeDisabled()
  })

  it('explains the rate limit', async () => {
    fetch.mockImplementationOnce(json(429, { error: 'rate_limited' }))
    const user = userEvent.setup()
    render(<Brief />)
    await fillAll(user)
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(
      await screen.findByText('Has enviado varios mensajes seguidos. Espera un rato o escríbeme directamente.'),
    ).toBeInTheDocument()
  })

  it('takes the visitor to the field the server rejected', async () => {
    fetch.mockImplementationOnce(json(400, { error: 'invalid', fields: ['details'] }))
    const user = userEvent.setup()
    render(<Brief />)
    await fillAll(user)
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    await waitFor(() => expect(question()).toHaveTextContent('Cuéntame un poco más'))
    expect(screen.getByText('Revisa este campo.')).toBeInTheDocument()
    expect(screen.getByLabelText('Tu proyecto')).toHaveFocus()
  })

  it('works when sessionStorage is blocked', async () => {
    for (const method of ['getItem', 'setItem', 'removeItem']) {
      vi.spyOn(Storage.prototype, method).mockImplementation(() => {
        throw new Error('SecurityError')
      })
    }
    const user = userEvent.setup()
    render(<Brief />)
    await fillAll(user)
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(await screen.findByRole('heading', { name: /^Recibido, Ana\./ })).toBeInTheDocument()
  })

  it('never sends twice when two clicks land in the same tick', async () => {
    fetch.mockImplementation(() => new Promise(() => {}))
    const user = userEvent.setup()
    render(<Brief />)
    await fillAll(user)
    const submit = screen.getByRole('button', { name: 'Enviar' })
    act(() => {
      submit.click()
      submit.click()
    })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('asks to choose when the timeline is left empty', async () => {
    const user = userEvent.setup()
    render(<Brief />)
    await user.click(screen.getByRole('radio', { name: 'Una web' }))
    await next(user)
    await user.type(screen.getByLabelText('Tu proyecto'), 'Una web para mi peluquería con reservas online.')
    await next(user)
    await next(user)
    expect(screen.getByText('Elige una opción.')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Lo antes posible' })).toHaveFocus()
  })

  it('shows a generic message next to a field the server rejected', async () => {
    fetch.mockImplementationOnce(json(400, { error: 'invalid', fields: ['email'] }))
    const user = userEvent.setup()
    render(<Brief />)
    await fillAll(user)
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(await screen.findByText('Revisa este campo.')).toBeInTheDocument()
    expect(screen.getByText('Revisa los campos marcados.')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveFocus()
  })

  it('offers a retry and my email when the server rejects without naming a field', async () => {
    fetch.mockImplementationOnce(json(400, { error: 'invalid', fields: [] }))
    const user = userEvent.setup()
    render(<Brief />)
    await fillAll(user)
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(await screen.findByText('No se ha podido enviar. Tus respuestas siguen aquí.')).toBeInTheDocument()
    expect(screen.queryByText('Revisa este campo.')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'miguelangelespeluy@gmail.com' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByRole('heading', { name: /^Recibido, Ana./ })).toBeInTheDocument()
  })

  it('clears the stored answers once the brief is sent', async () => {
    const user = userEvent.setup()
    render(<Brief />)
    await fillAll(user)
    expect(window.sessionStorage.getItem(BRIEF_DRAFT_KEY)).not.toBeNull()
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    await screen.findByRole('heading', { name: /^Recibido, Ana./ })
    expect(window.sessionStorage.getItem(BRIEF_DRAFT_KEY)).toBeNull()
  })

  it('offers the other ways to reach me next to the form', () => {
    render(<Brief />)
    expect(screen.getByRole('button', { name: 'Copiar email' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/mdomgar')
  })
})
