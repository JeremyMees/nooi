export async function sbFetch<T> (table: 'events' | 'reservations'): Promise<T> {
  const supabase = useSupabaseClient<Database>()

  const { data } = await supabase
    .from(table)
    .select('*')
    .gte('day', (new Date()).toISOString())

  return (data || []) as T
}
