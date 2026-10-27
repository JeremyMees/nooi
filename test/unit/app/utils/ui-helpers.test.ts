import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  addQuery,
  calculateCellClick,
  generateCellBg,
  getReservedSpots,
  getStatus,
  getType,
  removeQuery,
  translateStatus,
} from '~/utils/ui-helpers'
import { mockRosters } from '~~/test/mock'

describe('getReservedSpots', () => {
  it('sums the spots of every reservation', () => {
    expect(
      getReservedSpots([
        { id: 1, spots: 2 },
        { id: 2, spots: 5 },
      ]),
    ).toBe(7)
  })

  it('returns zero for an empty list', () => {
    expect(getReservedSpots([])).toBe(0)
  })
})

describe('translateStatus', () => {
  it('translates full to bezet', () => {
    expect(translateStatus('full')).toBe('bezet')
  })

  it('translates game to open spelcafé', () => {
    expect(translateStatus('game')).toBe('open spelcafé')
  })

  it('falls back to reservatie mogelijk', () => {
    expect(translateStatus('reservation')).toBe('reservatie mogelijk')
  })
})

describe('getType', () => {
  it('maps event to evenement', () => {
    expect(getType('event')).toBe('evenement')
  })

  it('maps game to reservering', () => {
    expect(getType('game')).toBe('reservering')
  })

  it('falls back to vehuur for unknown types', () => {
    expect(getType('reservation')).toBe('vehuur')
  })
})

describe('getStatus', () => {
  it('maps reservation to Reservatie', () => {
    expect(getStatus('reservation')).toBe('Reservatie')
  })

  it('maps game to Open spelcafé', () => {
    expect(getStatus('game')).toBe('Open spelcafé')
  })

  it('falls back to Bezet', () => {
    expect(getStatus('occupied')).toBe('Bezet')
  })
})

describe('calculateCellClick', () => {
  const makeCell = (height: number, top: number) =>
    ({
      offsetHeight: height,
      getBoundingClientRect: () => ({ y: top }),
    }) as unknown as HTMLButtonElement

  it('returns the index of the segment the click landed in', () => {
    const cell = makeCell(100, 200)
    expect(calculateCellClick({ y: 210 } as MouseEvent, cell, 4)).toBe(0)
    expect(calculateCellClick({ y: 260 } as MouseEvent, cell, 4)).toBe(2)
    expect(calculateCellClick({ y: 295 } as MouseEvent, cell, 4)).toBe(3)
  })

  it('returns 0 when there is a single segment', () => {
    const cell = makeCell(100, 200)
    expect(calculateCellClick({ y: 250 } as MouseEvent, cell, 1)).toBe(0)
  })
})

describe('generateCellBg', () => {
  it('returns an empty string when there is no roster', () => {
    expect(generateCellBg([])).toBe('')
  })

  it('builds a linear gradient for a single roster row', () => {
    const bg = generateCellBg([mockRosters[0]!])

    expect(bg).toContain('linear-gradient(to bottom')
    expect(bg).not.toContain('repeating-linear-gradient')
  })

  it('uses the game colour by default and the occupied/reservation colours by status', () => {
    const bg = generateCellBg(mockRosters)

    expect(bg).toContain('#53A688')
    expect(bg).toContain('#315546')
    expect(bg).toContain('#C35200')
  })

  it('prepends the striped background when lines is true', () => {
    const bg = generateCellBg([mockRosters[0]!], true)

    expect(bg).toContain('repeating-linear-gradient')
  })

  it('splits the gradient into equal parts per roster row', () => {
    const bg = generateCellBg(mockRosters)

    expect(bg).toContain('0%')
    expect(bg).toContain('100%')
  })
})

describe('removeQuery / addQuery', () => {
  const push = vi.fn()
  let query: Record<string, unknown>

  beforeEach(() => {
    query = { date: '2026-07-10', type: 'game', keep: 'me' }
    push.mockClear()
    vi.stubGlobal('useRouter', () => ({ push }))
    vi.stubGlobal('useRoute', () => ({ query }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('removes the named keys from the query', () => {
    removeQuery(['date', 'type'])

    expect(push).toHaveBeenCalledWith({ query: { keep: 'me' } })
  })

  it('leaves other keys untouched when removing an absent key', () => {
    removeQuery(['missing'])

    expect(push).toHaveBeenCalledWith({ query })
  })

  it('merges new values into the existing query', () => {
    addQuery({ status: 'info' })

    expect(push).toHaveBeenCalledWith({
      query: { date: '2026-07-10', type: 'game', keep: 'me', status: 'info' },
    })
  })

  it('overwrites an existing key with the new value', () => {
    addQuery({ type: 'reservation' })

    expect(push).toHaveBeenCalledWith({
      query: expect.objectContaining({ type: 'reservation' }),
    })
  })
})
