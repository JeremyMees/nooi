import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import {
  calcPages,
  generateRange,
  sbDateFilters,
  sbFetch,
  sbQuery,
} from '~/utils/supabase'
import { formatDay, padDate } from '~~/shared/utils/date-helpers'
import { createSupabaseMock } from '~~/test/mock'

beforeAll(() => {
  vi.stubGlobal('padDate', padDate)
  vi.stubGlobal('formatDay', formatDay)
})

afterAll(() => {
  vi.unstubAllGlobals()
})

describe('generateRange', () => {
  it('starts at zero for the first page', () => {
    expect(generateRange(0, 10)).toEqual({ from: 0, to: 9 })
  })

  it('offsets by page * perPage for later pages', () => {
    expect(generateRange(2, 10)).toEqual({ from: 20, to: 29 })
  })

  it('sizes the range to perPage', () => {
    expect(generateRange(1, 25)).toEqual({ from: 25, to: 49 })
  })
})

describe('calcPages', () => {
  it('rounds up to the next whole page', () => {
    expect(calcPages(25, 10)).toBe(3)
  })

  it('returns a single page when the count fits exactly', () => {
    expect(calcPages(20, 10)).toBe(2)
  })

  it('treats a null or zero count as one page', () => {
    expect(calcPages(null, 10)).toBe(1)
    expect(calcPages(0, 10)).toBe(1)
  })
})

describe('sbDateFilters', () => {
  it('produces a window from the previous month to the next month', () => {
    const { gte, lte } = sbDateFilters(new Date(2026, 6, 15))

    expect(gte).toBe('2026-06-20')
    expect(lte).toBe('2026-08-21')
  })

  it('returns zero-padded YYYY-MM-DD strings', () => {
    const { gte, lte } = sbDateFilters(new Date(2026, 0, 15))

    expect(gte).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(lte).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('defaults to now when no date is supplied', () => {
    const { gte, lte } = sbDateFilters()

    expect(gte).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(lte).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('sbFetch', () => {
  it('selects from the requested table and returns the data', async () => {
    const rows = [{ id: 1 }, { id: 2 }]
    const supabase = createSupabaseMock({ data: rows })

    const result = await sbFetch(supabase, { table: 'events' })

    expect(supabase.from).toHaveBeenCalledWith('events')
    expect(supabase.select).toHaveBeenCalledWith('*')
    expect(result).toEqual(rows)
  })

  it('uses a custom select string when provided', async () => {
    const supabase = createSupabaseMock({ data: [] })

    await sbFetch(supabase, { table: 'events', select: 'id,name' })

    expect(supabase.select).toHaveBeenCalledWith('id,name')
  })

  it('falls back to an empty array when data is null', async () => {
    const supabase = createSupabaseMock({ data: null })

    const result = await sbFetch(supabase, { table: 'events' })

    expect(result).toEqual([])
  })

  it('applies day range filters when a date is given', async () => {
    const supabase = createSupabaseMock({ data: [] })

    await sbFetch(supabase, { table: 'rosters', date: new Date(2026, 6, 15) })

    expect(supabase.gte).toHaveBeenCalledWith('day', '2026-06-20')
    expect(supabase.lte).toHaveBeenCalledWith('day', '2026-08-21')
  })

  it('does not apply day filters when no date is given', async () => {
    const supabase = createSupabaseMock({ data: [] })

    await sbFetch(supabase, { table: 'events' })

    expect(supabase.gte).not.toHaveBeenCalled()
    expect(supabase.lte).not.toHaveBeenCalled()
  })

  it('applies an equality filter when provided', async () => {
    const supabase = createSupabaseMock({ data: [] })

    await sbFetch(supabase, {
      table: 'reservations',
      eq: { field: 'event', value: 5 },
    })

    expect(supabase.eq).toHaveBeenCalledWith('event', 5)
  })
})

describe('sbQuery', () => {
  it('returns the data and count from the query', async () => {
    const rows = [{ id: 1 }, { id: 2 }]
    const supabase = createSupabaseMock({ data: rows, count: 42, error: null })

    const result = await sbQuery(supabase, { table: 'events' })

    expect(result).toEqual({ data: rows, count: 42 })
  })

  it('selects with an exact count and filters out past days', async () => {
    const supabase = createSupabaseMock({ data: [], count: 0 })

    await sbQuery(supabase, { table: 'events' })

    expect(supabase.select).toHaveBeenCalledWith('*', { count: 'exact' })
    expect(supabase.gte).toHaveBeenCalledWith('day', expect.any(String))
  })

  it('defaults a null count to zero', async () => {
    const supabase = createSupabaseMock({ data: [], count: null })

    const result = await sbQuery(supabase, { table: 'events' })

    expect(result.count).toBe(0)
  })

  it('throws when the query returns an error', async () => {
    const supabase = createSupabaseMock({ error: new Error('boom') })

    await expect(sbQuery(supabase, { table: 'events' })).rejects.toThrow('boom')
  })

  it('applies each equality filter', async () => {
    const supabase = createSupabaseMock({ data: [], count: 0 })

    await sbQuery(supabase, {
      table: 'reservations',
      eq: [
        { field: 'type', value: 'reservation' },
        { field: 'exclusive', value: true },
      ],
    })

    expect(supabase.eq).toHaveBeenCalledWith('type', 'reservation')
    expect(supabase.eq).toHaveBeenCalledWith('exclusive', true)
  })

  it('builds an OR search query for a fuzzy search', async () => {
    const supabase = createSupabaseMock({ data: [], count: 0 })

    await sbQuery(supabase, {
      table: 'reservations',
      search: 'jan',
      fuzzy: true,
      fields: ['name', 'email'],
    })

    expect(supabase.or).toHaveBeenCalledWith(
      'name.ilike.*jan*,email.ilike.*jan*',
    )
  })

  it('escapes wildcard characters in the search term', async () => {
    const supabase = createSupabaseMock({ data: [], count: 0 })

    await sbQuery(supabase, {
      table: 'reservations',
      search: '50%_off',
      fuzzy: true,
      fields: ['name'],
    })

    expect(supabase.or).toHaveBeenCalledWith('name.ilike.*50\\%\\_off*')
  })

  it('orders by day, start and id by default', async () => {
    const supabase = createSupabaseMock({ data: [], count: 0 })

    await sbQuery(supabase, { table: 'events' })

    expect(supabase.order).toHaveBeenCalledWith(
      'day',
      { ascending: true },
      { nullsFirst: false },
    )
    expect(supabase.order).toHaveBeenCalledWith('start', { ascending: true })
    expect(supabase.order).toHaveBeenCalledWith('id', { ascending: true })
  })

  it('orders by a custom descending field when sort is provided', async () => {
    const supabase = createSupabaseMock({ data: [], count: 0 })

    await sbQuery(supabase, {
      table: 'events',
      sort: { field: 'name', order: 'desc' },
    })

    expect(supabase.order).toHaveBeenCalledWith(
      'name',
      { ascending: false },
      { nullsFirst: false },
    )
  })

  it('paginates with a range when page and perPage are numbers', async () => {
    const supabase = createSupabaseMock({ data: [], count: 0 })

    await sbQuery(supabase, { table: 'events', page: 2, perPage: 10 })

    expect(supabase.range).toHaveBeenCalledWith(20, 29)
  })

  it('does not paginate when page and perPage are absent', async () => {
    const supabase = createSupabaseMock({ data: [], count: 0 })

    await sbQuery(supabase, { table: 'events' })

    expect(supabase.range).not.toHaveBeenCalled()
  })
})
