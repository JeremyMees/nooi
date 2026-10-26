import { createHash, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import { values } from '~~/shared/constants/admin'

const tables: DatabaseTable[] = ['events', 'reservations', 'rosters']
const perPage = 10

interface AdminSession {
  admin?: boolean
}

function sessionConfig() {
  const { appSecret } = useRuntimeConfig()

  if (!appSecret || appSecret.length < 32) {
    throw createError({
      status: 500,
      message: 'NUXT_APP_SECRET must be at least 32 characters',
    })
  }

  return {
    name: 'nooi-admin',
    password: appSecret,
    maxAge: 60 * 60 * 24 * 7,
    cookie: { httpOnly: true, secure: !import.meta.dev, sameSite: 'strict' },
  } as const
}

function digest(value: string): Buffer {
  return createHash('sha256').update(value).digest()
}

export function passwordMatches(input: unknown): boolean {
  const { adminPassword } = useRuntimeConfig()

  if (!adminPassword || typeof input !== 'string') {
    return false
  }

  return timingSafeEqual(digest(input), digest(adminPassword))
}

export async function adminSession(event: H3Event) {
  return useSession<AdminSession>(event, sessionConfig())
}

export async function isAdmin(event: H3Event): Promise<boolean> {
  const session = await adminSession(event)

  return session.data.admin === true
}

export async function requireAdmin(event: H3Event): Promise<void> {
  if (!(await isAdmin(event))) {
    throw createError({ status: 401, message: 'Unauthorized' })
  }
}

export function adminTable(event: H3Event): DatabaseTable {
  const table = getRouterParam(event, 'table') as DatabaseTable

  if (!tables.includes(table)) {
    throw createError({ status: 404, message: 'Unknown table' })
  }

  return table
}

export interface AdminQuery {
  page?: number
  search?: string
  day?: string
  sort?: SbSort
}

export function adminQueryOptions(
  table: DatabaseTable,
  query: AdminQuery,
): SbQueryOptions {
  const eq: SbEq[] = query.day ? [{ field: 'day', value: query.day }] : []
  const options: SbQueryOptions = {
    table,
    page: query.page ?? 0,
    perPage,
    fuzzy: true,
    search: query.search,
    fields: values[table].filter,
    sort: query.sort,
    eq,
  }

  if (table === 'events') {
    options.select = '*, reservations:reservations(id, spots)'
    eq.push({ field: 'reservations.paymentNeeded', value: false })
  } else if (table === 'reservations') {
    options.select = '*, event(id, name)'
    eq.push({ field: 'paymentNeeded', value: false })
  }

  return options
}

export function parseAdminQuery(query: Record<string, unknown>): AdminQuery {
  const page = Number(query.page)
  const { search, day, sortField, sortOrder } = query

  return {
    page: Number.isInteger(page) && page >= 0 ? page : 0,
    search: typeof search === 'string' && search ? search : undefined,
    day:
      typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day)
        ? day
        : undefined,
    sort:
      typeof sortField === 'string' && /^[a-zA-Z]+$/.test(sortField)
        ? { field: sortField, order: sortOrder === 'desc' ? 'desc' : 'asc' }
        : undefined,
  }
}

export function adminPayload(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createError({ status: 400, message: 'Invalid payload' })
  }

  const { id, created_at, reservations, ...payload } = body as Record<
    string,
    unknown
  >

  return payload
}
