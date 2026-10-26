import { beforeEach, describe, expect, it } from 'vitest'
import { mockEvent } from '~~/test/unit/stubs/api-event'
import { mockRuntimeConfig } from '~~/test/unit/stubs/runtime-config'
import { mockChain, mockFrom } from '~~/test/unit/stubs/supabase'
import handler from '~~/server/api/calendar.get'

const event = {
  id: 9,
  name: 'Minipainting',
  reservations: [{ id: 1, spots: 2 }],
}
const roster = { id: 4, day: '2026-09-14', status: 'game' }

function request(query: Record<string, string>) {
  return mockEvent({ query })
}

beforeEach(() => {
  mockRuntimeConfig({})
})

describe('GET /api/calendar', () => {
  it.each([
    [{}],
    [{ year: '2026' }],
    [{ year: '2026', month: '12' }],
    [{ year: 'abc', month: '8' }],
    [{ year: '2026', month: '8', event: 'x' }],
  ])('rejects the query %o', async query => {
    const from = mockFrom({})

    await expect(handler(request(query))).rejects.toMatchObject({
      statusCode: 400,
    })
    expect(from).not.toHaveBeenCalled()
  })

  it('returns the events and rosters around the shown month', async () => {
    const events = mockChain({ data: [event], error: null })
    const rosters = mockChain({ data: [roster], error: null })
    mockFrom({ events, rosters })

    await expect(
      handler(request({ year: '2026', month: '8' })),
    ).resolves.toEqual({ events: [event], rosters: [roster] })

    expect(events.gte).toHaveBeenCalledWith('day', '2026-08-21')
    expect(events.lte).toHaveBeenCalledWith('day', '2026-10-21')
    expect(rosters.gte).toHaveBeenCalledWith('day', '2026-08-21')
    expect(rosters.lte).toHaveBeenCalledWith('day', '2026-10-21')
  })

  it('only counts confirmed reservations and never selects contact details', async () => {
    const events = mockChain({ data: [], error: null })
    mockFrom({ events, rosters: mockChain({ data: [], error: null }) })

    await handler(request({ year: '2026', month: '8' }))

    expect(events.select).toHaveBeenCalledWith(
      '*, reservations:reservations(id, spots)',
    )
    expect(events.eq).toHaveBeenCalledWith('reservations.paymentNeeded', false)
  })

  it('adds a linked event that falls outside the shown month', async () => {
    const other = { ...event, id: 12 }
    mockFrom({
      events: [
        mockChain({ data: [event], error: null }),
        mockChain({ data: other, error: null }),
      ],
      rosters: mockChain({ data: [], error: null }),
    })

    const calendar = await handler(
      request({ year: '2026', month: '8', event: '12' }),
    )

    expect(calendar.events.map(({ id }) => id)).toEqual([9, 12])
  })

  it('does not fetch a linked event that is already shown', async () => {
    const from = mockFrom({
      events: mockChain({ data: [event], error: null }),
      rosters: mockChain({ data: [], error: null }),
    })

    await handler(request({ year: '2026', month: '8', event: '9' }))

    expect(from).toHaveBeenCalledTimes(2)
  })

  it('surfaces a 500 when the database fails', async () => {
    mockFrom({
      events: mockChain({ data: null, error: { message: 'down' } }),
      rosters: mockChain({ data: [], error: null }),
    })

    await expect(
      handler(request({ year: '2026', month: '8' })),
    ).rejects.toMatchObject({
      statusCode: 500,
      message: 'Could not load calendar: down',
    })
  })
})
