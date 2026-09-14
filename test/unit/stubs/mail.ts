import { vi } from 'vitest'

const hoisted = vi.hoisted(() => ({
  send: vi.fn(),
  render: vi.fn(async () => '<html>rendered</html>'),
}))

export const { send, render } = hoisted

vi.mock('resend', () => ({
  Resend: vi.fn(function (this: { emails: { send: typeof hoisted.send } }) {
    this.emails = { send: hoisted.send }
  }),
}))

vi.mock('@vue-email/render', () => ({ render: hoisted.render }))

export function mockSend(...results: { data?: unknown; error?: unknown }[]) {
  send.mockReset()

  if (!results.length) {
    send.mockResolvedValue({ data: { id: 'email-id' }, error: null })
    return
  }

  for (const result of results) {
    send.mockResolvedValueOnce({ data: null, error: null, ...result })
  }
}
