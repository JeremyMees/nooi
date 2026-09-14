import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockEvent } from '~~/test/unit/stubs/api-event'
import { mockRuntimeConfig } from '~~/test/unit/stubs/runtime-config'
import { mockChain, mockFrom } from '~~/test/unit/stubs/supabase'
import handler from '~~/server/api/clean-up.get'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-09-14T00:00:00Z'))
  mockRuntimeConfig({})
})

describe('GET /api/clean-up', () => {
  it('looks for unpaid reservations older than thirty days', async () => {
    const chain = mockChain({ data: [], error: null })
    const from = mockFrom({ reservations: chain })

    await handler(mockEvent())

    expect(from).toHaveBeenCalledWith('reservations')
    expect(chain.lte).toHaveBeenCalledWith('created_at', '2026-08-15')
    expect(chain.eq).toHaveBeenCalledWith('paymentNeeded', true)
  })

  it('reports when there is nothing to clean up', async () => {
    mockFrom({ reservations: mockChain({ data: [], error: null }) })

    await expect(handler(mockEvent())).resolves.toBe('No clean up needed')
  })

  it('deletes every stale reservation it finds', async () => {
    const chain = mockChain({
      data: [{ id: 1 }, { id: 2 }, { id: 3 }],
      error: null,
    })
    mockFrom({ reservations: chain })

    await expect(handler(mockEvent())).resolves.toBe(
      'Removed 3 items from the database',
    )
    expect(chain.delete).toHaveBeenCalledTimes(3)
    expect(chain.eq).toHaveBeenCalledWith('id', 1)
    expect(chain.eq).toHaveBeenCalledWith('id', 3)
  })

  it('reports a failed fetch instead of throwing', async () => {
    mockFrom({
      reservations: mockChain({ data: null, error: { message: 'boom' } }),
    })

    await expect(handler(mockEvent())).resolves.toBe(
      'Error while fetching reservations',
    )
  })
})
