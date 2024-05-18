import { addMonth, monthDays } from '@formkit/tempo'

export async function sbFetch<T> (options: SbFetchOptions): Promise<T> {
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

export function sbDateFilters (date?: Date): { gte: string, lte: string } {
  const today = date ?? new Date()
  const prev = addMonth(today, -1)
  const next = addMonth(today, 1)

  return {
    gte: `${prev.getFullYear()}-${padDate(prev.getMonth() + 1)}-${padDate(monthDays(prev) - 10)}`,
    lte: `${next.getFullYear()}-${padDate(next.getMonth() + 1)}-${padDate(monthDays(next) - 10)}`
  }
}
