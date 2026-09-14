import { beforeEach, describe, expect, it } from 'vitest'
import { mockEvent } from '~~/test/unit/stubs/api-event'
import { mockRuntimeConfig } from '~~/test/unit/stubs/runtime-config'
import { retrieveSession } from '~~/test/unit/stubs/stripe'
import handler from '~~/server/api/stripe/status.get'

beforeEach(() => {
  mockRuntimeConfig({})
  retrieveSession.mockReset()
  retrieveSession.mockResolvedValue({ id: 'cs_123', status: 'complete' })
})

describe('GET /api/stripe/status', () => {
  it('retrieves the session named in the query', async () => {
    const event = mockEvent({ query: { id: 'cs_123' } })

    await expect(handler(event)).resolves.toEqual({
      id: 'cs_123',
      status: 'complete',
    })
    expect(retrieveSession).toHaveBeenCalledWith('cs_123')
  })

  it('passes a missing id straight through to Stripe', async () => {
    await handler(mockEvent())

    expect(retrieveSession).toHaveBeenCalledWith(undefined)
  })
})
