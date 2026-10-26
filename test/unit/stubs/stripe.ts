import { vi } from 'vitest'

const hoisted = vi.hoisted(() => ({
  createSession: vi.fn(),
  retrieveSession: vi.fn(),
  expireSession: vi.fn(),
}))

export const { createSession, retrieveSession, expireSession } = hoisted

vi.mock('stripe', () => ({
  Stripe: vi.fn(function (this: { checkout: unknown }) {
    this.checkout = {
      sessions: {
        create: hoisted.createSession,
        retrieve: hoisted.retrieveSession,
        expire: hoisted.expireSession,
      },
    }
  }),
}))
