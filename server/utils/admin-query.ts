import type { SupabaseClient } from '@supabase/supabase-js'

export async function sbQuery<T>(
  supabase: SupabaseClient<Database>,
  options: SbQueryOptions,
): Promise<SbQuery<T>> {
  const { table, select, page, perPage, search, eq, fuzzy, fields, sort } =
    options

  let query = supabase
    .from(table)
    .select(select || '*', { count: 'exact' })
    .gte('day', formatDay(new Date()))

  if (eq && eq.length) {
    eq.forEach(eq => {
      query = query.eq(eq.field, eq.value)
    })
  }

  if (search && fuzzy) {
    query = query.or(sbOrQuery(fields || ['title'], search))
  }

  if (!sort || (sort && sort.field === 'day')) {
    query = query
      .order('day', {
        ascending: sort ? sort.order === 'asc' : true,
        nullsFirst: false,
      })
      .order('start', { ascending: true })
      .order('id', { ascending: true })
  } else if (sort) {
    query = query.order(sort.field, {
      ascending: sort.order === 'asc',
      nullsFirst: false,
    })
  }

  if (typeof page === 'number' && typeof perPage === 'number') {
    const { from, to } = generateRange(page, perPage)
    query = query.range(from, to)
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
    const escapedSearch = search
      .replace(/[,()]/g, ' ')
      .replace(/([%_])/g, '\\$1')
    queryString += `${i ? ',' : ''}${key}.ilike.*${escapedSearch}*`
  })

  return queryString
}

export function generateRange(page: number, perPage: number): SbRange {
  const from = page ? page * perPage : 0
  const to = page ? from + perPage - 1 : perPage - 1

  return { from, to }
}
