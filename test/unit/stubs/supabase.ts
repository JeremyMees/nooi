import { vi } from 'vitest'

const hoisted = vi.hoisted(() => ({
  serverSupabaseClient: vi.fn(),
  serverSupabaseServiceRole: vi.fn(),
}))

export const { serverSupabaseClient, serverSupabaseServiceRole } = hoisted

vi.mock('#supabase/server', () => hoisted)

const CHAIN_METHODS = [
  'select',
  'insert',
  'update',
  'upsert',
  'delete',
  'eq',
  'neq',
  'gt',
  'gte',
  'lt',
  'lte',
  'is',
  'in',
  'or',
  'order',
  'limit',
  'range',
  'single',
  'maybeSingle',
] as const

export type SupabaseChain = Record<
  (typeof CHAIN_METHODS)[number],
  ReturnType<typeof vi.fn>
> & {
  then: PromiseLike<unknown>['then']
}

export function mockChain(result: Record<string, unknown>): SupabaseChain {
  const chain = {} as SupabaseChain

  for (const method of CHAIN_METHODS) {
    chain[method] = vi.fn(() => chain)
  }

  chain.then = (resolve, reject) =>
    Promise.resolve(result).then(resolve, reject)

  return chain
}

export function mockFrom(
  tables: Record<string, SupabaseChain | SupabaseChain[]>,
) {
  const queues = new Map(
    Object.entries(tables).map(([table, value]) => [
      table,
      Array.isArray(value)
        ? { chains: [...value], repeat: false }
        : { chains: [value], repeat: true },
    ]),
  )

  const from = vi.fn((table: string) => {
    const queue = queues.get(table)

    if (!queue) throw new Error(`No mock configured for table "${table}"`)

    const chain = queue.repeat ? queue.chains[0] : queue.chains.shift()

    if (!chain) {
      throw new Error(
        `Mock for table "${table}" was called more times than configured`,
      )
    }

    return chain
  })

  const client = { from }

  serverSupabaseClient.mockResolvedValue(client)
  serverSupabaseServiceRole.mockReturnValue(client)

  return from
}
