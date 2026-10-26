import { beforeEach, describe, expect, it } from 'vitest'
import { mockEvent } from '~~/test/unit/stubs/api-event'
import { mockRuntimeConfig } from '~~/test/unit/stubs/runtime-config'
import { mockChain, mockFrom } from '~~/test/unit/stubs/supabase'
import { expireSession, retrieveSession } from '~~/test/unit/stubs/stripe'
import handler from '~~/server/api/stripe/status.get'

const event = () => mockEvent({ query: { id: 'cs_123' } })

beforeEach(() => {
  mockRuntimeConfig({})
  retrieveSession.mockReset()
  expireSession.mockReset()
})

describe('GET /api/stripe/status', () => {
  it('rejects a missing session id', async () => {
    await expect(handler(mockEvent())).rejects.toMatchObject({
      statusCode: 400,
    })
    expect(retrieveSession).not.toHaveBeenCalled()
  })

  it('rejects something that is not a checkout session id', async () => {
    await expect(
      handler(mockEvent({ query: { id: 'pi_123' } })),
    ).rejects.toMatchObject({ statusCode: 400 })
  })

  it('reports a paid session without exposing its details', async () => {
    retrieveSession.mockResolvedValue({
      payment_status: 'paid',
      customer_details: { email: 'jef@example.com' },
    })

    await expect(handler(event())).resolves.toEqual({ paid: true })
    expect(retrieveSession).toHaveBeenCalledWith('cs_123')
  })

  it('expires an open unpaid session and removes its unpaid reservation', async () => {
    retrieveSession.mockResolvedValue({
      payment_status: 'unpaid',
      status: 'open',
      metadata: { reservation: '2599' },
    })
    const chain = mockChain({ data: null, error: null })
    mockFrom({ reservations: chain })

    await expect(handler(event())).resolves.toEqual({ paid: false })

    expect(expireSession).toHaveBeenCalledWith('cs_123')
    expect(chain.delete).toHaveBeenCalled()
    expect(chain.eq).toHaveBeenCalledWith('id', 2599)
    expect(chain.eq).toHaveBeenCalledWith('paymentNeeded', true)
  })

  it('does not expire a session that is no longer open', async () => {
    retrieveSession.mockResolvedValue({
      payment_status: 'unpaid',
      status: 'expired',
      metadata: {},
    })

    await expect(handler(event())).resolves.toEqual({ paid: false })
    expect(expireSession).not.toHaveBeenCalled()
  })
})
