import { vi } from 'vitest'

const hoisted = vi.hoisted(() => ({
  createSession: vi.fn(),
  retrieveSession: vi.fn(),
}))

export const { createSession, retrieveSession } = hoisted

vi.mock('stripe', () => ({
  Stripe: vi.fn(function (this: { checkout: unknown }) {
    this.checkout = {
      sessions: {
        create: hoisted.createSession,
        retrieve: hoisted.retrieveSession,
      },
    }
  }),
}))
