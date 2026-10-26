import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient<Database> | undefined

export function serviceClient(): SupabaseClient<Database> {
  const { supabaseUrl, supabaseSecretKey } = useRuntimeConfig()

  client ??= createClient<Database>(supabaseUrl, supabaseSecretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  return client
}
