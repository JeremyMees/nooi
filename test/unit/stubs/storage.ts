import { vi } from 'vitest'

const templates = [
  'BookingSuccess',
  'EventSuccess',
  'ReservationSuccess',
  'Reminder',
]

const compiled = {
  html: '<p>{{ name }}|{{ date }}|{{#time}}{{ time }}{{/time}}|{{#event}}{{ event }}{{/event}}</p>',
  text: '{{ name }}|{{ date }}|{{#time}}{{ time }}{{/time}}|{{#event}}{{ event }}{{/event}}',
}

const report = {
  html: '<p>{{ date }}|{{ sentCount }}|{{{ sentList }}}</p>',
  text: '{{ date }}|{{ sentCount }}|{{{ sentList }}}',
}

const hoisted = vi.hoisted(() => {
  const store = new Map<string, unknown>()

  return {
    store,
    useStorage: vi.fn((_base?: string) => ({
      getItem: vi.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
    })),
  }
})

export const { useStorage } = hoisted

vi.mock('nitropack/runtime', () => ({ useStorage }))

export function mockStorage(): void {
  hoisted.store.clear()

  for (const template of templates) {
    hoisted.store.set(`emails:${template}.html`, compiled.html)
    hoisted.store.set(`emails:${template}.txt`, compiled.text)
  }

  hoisted.store.set('emails:ReminderReport.html', report.html)
  hoisted.store.set('emails:ReminderReport.txt', report.text)
}

export function setStorageItem(key: string, value: unknown): void {
  hoisted.store.set(key, value)
}

mockStorage()
