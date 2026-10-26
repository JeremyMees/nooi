import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { calcPages, sbDateFilters, sbFetch } from '~/utils/supabase'
import { formatDay, padDate } from '~~/shared/utils/date-helpers'
import { createSupabaseMock } from '~~/test/mock'

beforeAll(() => {
  vi.stubGlobal('padDate', padDate)
  vi.stubGlobal('formatDay', formatDay)
})

afterAll(() => {
  vi.unstubAllGlobals()
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
