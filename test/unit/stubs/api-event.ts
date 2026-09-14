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

  return {
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
      res: { setHeader: () => {}, getHeader: () => undefined },
    },
    _requestBody: body,
  } as unknown as H3Event
}
