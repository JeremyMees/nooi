import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import CalendarCell from '~/components/CalendarCell.vue'
import { mockEventReservation, mockRoster } from '~~/test/mock'

let open: boolean
let dayRoster: RosterRow[]

mockNuxtImport('useRosterStore', () => () => ({
  checkIfOpen: () => open,
  getDayRoster: () => dayRoster,
}))

mockNuxtImport('useToast', () => () => ({ add: vi.fn() }))

const futureDay = {
  key: '2026-07-10',
  date: 10,
  dateFull: new Date(2026, 6, 10),
  currentMonth: true,
  today: false,
}

const pastDay = {
  key: '2026-06-01',
  date: 1,
  dateFull: new Date(2026, 5, 1),
  currentMonth: true,
  today: false,
}

describe('CalendarCell', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 2, 12, 0, 0))
    open = true
    dayRoster = [
      { ...mockRoster, id: 1, status: 'game', start: '18:00', end: '20:00' },
      { ...mockRoster, id: 2, status: 'game', start: '20:00', end: '23:00' },
    ]
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('matches snapshot', async () => {
    const wrapper = await mountSuspended(CalendarCell, {
      props: { day: futureDay, events: [] },
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders the day number', async () => {
    const wrapper = await mountSuspended(CalendarCell, {
      props: { day: futureDay, events: [] },
    })

    expect(wrapper.find('[test-id="cell-date"]').text()).toBe('10')
  })

  it('lists the game opening hours for an open future day', async () => {
    const wrapper = await mountSuspended(CalendarCell, {
      props: { day: futureDay, events: [] },
    })

    expect(wrapper.findAll('[test-id="cell-hours-item"]')).toHaveLength(2)
    expect(wrapper.find('[test-id="cell-hours"]').text()).toContain('18u - 20u')
  })

  it('does not list opening hours for a past day', async () => {
    const wrapper = await mountSuspended(CalendarCell, {
      props: { day: pastDay, events: [] },
    })

    expect(wrapper.find('[test-id="cell-hours"]').exists()).toBe(false)
  })

  it('renders an event tag for each event', async () => {
    const wrapper = await mountSuspended(CalendarCell, {
      props: {
        day: futureDay,
        events: [
          { ...mockEventReservation, id: 1, start: '19:00' },
          { ...mockEventReservation, id: 2, start: '20:00' },
        ],
      },
    })

    expect(wrapper.findAll('[test-id="event-tag"]')).toHaveLength(2)
  })

  it('applies a background gradient from the roster', async () => {
    const wrapper = await mountSuspended(CalendarCell, {
      props: { day: futureDay, events: [] },
    })

    expect(
      wrapper.find('[test-id="calendar-cell"]').attributes('style'),
    ).toContain('linear-gradient')
  })

  it('marks past days as not clickable', async () => {
    const wrapper = await mountSuspended(CalendarCell, {
      props: { day: pastDay, events: [] },
    })

    expect(wrapper.find('[test-id="calendar-cell"]').classes()).toContain(
      'cursor-not-allowed',
    )
  })

  it('marks closed days as not clickable', async () => {
    open = false

    const wrapper = await mountSuspended(CalendarCell, {
      props: { day: futureDay, events: [] },
    })

    expect(wrapper.find('[test-id="calendar-cell"]').classes()).toContain(
      'cursor-not-allowed',
    )
  })

  it('does not mark an open future day as not clickable', async () => {
    const wrapper = await mountSuspended(CalendarCell, {
      props: { day: futureDay, events: [] },
    })

    expect(wrapper.find('[test-id="calendar-cell"]').classes()).not.toContain(
      'cursor-not-allowed',
    )
  })
})
