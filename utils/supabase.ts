import { addMonth, monthDays } from '@formkit/tempo'

export async function sbFetch<T>(options: SbFetchOptions): Promise<T> {
  const supabase = useSupabaseClient<Database>()
  const { table, select, date } = options

  let query = supabase.from(table).select(select || '*')

  if (date) {
    const { gte, lte } = sbDateFilters(date)

    query = query.gte('day', gte).lte('day', lte)
  }

  const { data } = await query

  return (data || []) as T
}

export function sbDateFilters(date?: Date): { gte: string, lte: string } {
  const today = date ?? new Date()
  const prev = addMonth(today, -1)
  const next = addMonth(today, 1)

  return {
    gte: `${prev.getFullYear()}-${padDate(prev.getMonth() + 1)}-${padDate(monthDays(prev) - 10)}`,
    lte: `${next.getFullYear()}-${padDate(next.getMonth() + 1)}-${padDate(monthDays(next) - 10)}`,
  }
}

export async function sbQuery<T>(options: SbQueryOptions): Promise<SbQuery<T>> {
  const supabase = useSupabaseClient()

  const { table, select, page, perPage, search, eq, fuzzy, fields } = options

  let query = supabase
    .from(table)
    .select(select || '*', { count: 'exact' })

  if (typeof page === 'number' && typeof perPage === 'number') {
    const { from, to } = generateRange(page, perPage)

    query = query.range(from, to)
  }

  if (eq) {
    query = query.eq(eq.field, eq.value)
  }

  if (search && fuzzy) {
    query = query.or(sbOrQuery(fields || ['title'], search))
  }

  const { data, error, count } = await query

  if (error) {
    throw error
  }

  return {
    data: data as T[],
    count: count || 0,
  }
}

function sbOrQuery(keys: string[], search: string): string {
  let queryString = ''

  keys.forEach((key: string, i: number) => {
    const escapedSearch = search.replace(/([%_])/g, '\\$1')
    queryString += `${i ? ',' : ''}${key}.ilike.*${escapedSearch}*`
  })

  return queryString
}

export function generateRange(page: number, perPage: number): SbRange {
  const from = page ? page * perPage : 0
  const to = page ? from + perPage - 1 : perPage - 1

  return { from, to }
}

export function calcPages(count: number | null, perPage: number): number {
  return Math.ceil((count || 1) / perPage)
}
