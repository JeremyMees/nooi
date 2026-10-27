import { vi } from 'vitest'
import './storage'

const hoisted = vi.hoisted(() => ({
  send: vi.fn(),
}))

export const { send } = hoisted

vi.mock('resend', () => ({
  Resend: vi.fn(function (this: { emails: { send: typeof hoisted.send } }) {
    this.emails = { send: hoisted.send }
  }),
}))

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
