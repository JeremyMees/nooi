export async function sbFetch<T> (options: SbFetchOptions): Promise<T> {
  const supabase = useSupabaseClient<Database>()

  const { data } = await supabase
    .from(options.table)
    .select(options.select || '*')
    .gte('day', (new Date()).toISOString())

  return (data || []) as T
}
