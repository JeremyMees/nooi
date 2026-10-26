import type { H3Event } from 'h3'

export function mockEvent({
  method = 'GET',
  body,
  path = '/',
  headers = {},
  query,
}: {
  method?: string
  body?: unknown
  path?: string
  headers?: Record<string, string>
  query?: Record<string, string>
} = {}): H3Event {
  const search = query ? `?${new URLSearchParams(query)}` : ''
  const responseHeaders = new Map<string, unknown>()

  return {
    __is_event__: true,
    path: `${path}${search}`,
    method,
    context: {},
    node: {
      req: {
        url: `${path}${search}`,
        method,
        headers: {
          ...(body !== undefined && { 'content-type': 'application/json' }),
          ...headers,
        },
        socket: { remoteAddress: '127.0.0.1' },
      },
      res: {
        setHeader: (name: string, value: unknown) =>
          responseHeaders.set(name.toLowerCase(), value),
        getHeader: (name: string) => responseHeaders.get(name.toLowerCase()),
        removeHeader: (name: string) =>
          responseHeaders.delete(name.toLowerCase()),
        appendHeader: (name: string, value: string) =>
          responseHeaders.set(name.toLowerCase(), [
            ...[responseHeaders.get(name.toLowerCase()) ?? []].flat(),
            value,
          ]),
      },
    },
    _requestBody: body,
  } as unknown as H3Event
}

export function mockCronEvent(): H3Event {
  return mockEvent({ headers: { authorization: 'Bearer cron_test' } })
}
