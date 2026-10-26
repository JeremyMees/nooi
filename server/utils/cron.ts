import type { H3Event } from 'h3'

export function requireCron(event: H3Event): void {
  const { cronSecret } = useRuntimeConfig()

  if (
    !cronSecret ||
    getHeader(event, 'authorization') !== `Bearer ${cronSecret}`
  ) {
    throw createError({ status: 401, message: 'Unauthorized' })
  }
}
