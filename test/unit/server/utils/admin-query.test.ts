import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { generateRange, sbQuery } from '~~/server/utils/admin-query'
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

    expect(supabase.order).toHaveBeenCalledWith('day', {
      ascending: true,
      nullsFirst: false,
    })
    expect(supabase.order).toHaveBeenCalledWith('start', { ascending: true })
    expect(supabase.order).toHaveBeenCalledWith('id', { ascending: true })
  })

  it('orders by a custom descending field when sort is provided', async () => {
    const supabase = createSupabaseMock({ data: [], count: 0 })

    await sbQuery(supabase, {
      table: 'events',
      sort: { field: 'name', order: 'desc' },
    })

    expect(supabase.order).toHaveBeenCalledWith('name', {
      ascending: false,
      nullsFirst: false,
    })
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
