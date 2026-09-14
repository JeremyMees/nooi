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

const hoisted = vi.hoisted(() => ({
  toastAdd: vi.fn(),
  addQuery: vi.fn(),
  removeQuery: vi.fn(),
}))

mockNuxtImport('useToast', () => () => ({ add: hoisted.toastAdd }))
mockNuxtImport('addQuery', () => hoisted.addQuery)
mockNuxtImport('removeQuery', () => hoisted.removeQuery)

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
    hoisted.toastAdd.mockClear()
    hoisted.addQuery.mockClear()
    hoisted.removeQuery.mockClear()
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

  describe('clicking a day', () => {
    async function click(day = futureDay) {
      const wrapper = await mountSuspended(CalendarCell, {
        props: { day, events: [] },
      })
      await wrapper.find('button').trigger('click')
      return wrapper
    }

    it('starts a game booking for an open evening', async () => {
      dayRoster = [{ ...mockRoster, id: 1, status: 'game', day: '2026-07-10' }]

      await click()

      expect(hoisted.addQuery).toHaveBeenCalledWith({
        date: '2026-07-10',
        type: 'game',
        rosterIndex: 0,
      })
    })

    it('starts a reservation when the slot is bookable', async () => {
      dayRoster = [
        { ...mockRoster, id: 1, status: 'reservation', day: '2026-07-10' },
      ]

      await click()

      expect(hoisted.addQuery).toHaveBeenCalledWith({
        date: '2026-07-10',
        type: 'reservation',
        rosterIndex: 0,
      })
    })

    it('refuses an occupied slot with an explanation', async () => {
      dayRoster = [
        { ...mockRoster, id: 1, status: 'occupied', day: '2026-07-10' },
      ]

      await click()

      expect(hoisted.toastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ summary: 'Bezet!' }),
      )
      expect(hoisted.removeQuery).toHaveBeenCalledWith([
        'date',
        'type',
        'rosterIndex',
      ])
      expect(hoisted.addQuery).not.toHaveBeenCalled()
    })

    it('refuses a same-day booking', async () => {
      const today = {
        key: '2026-07-02',
        date: 2,
        dateFull: new Date(2026, 6, 2),
        currentMonth: true,
        today: true,
      }
      dayRoster = [{ ...mockRoster, id: 1, status: 'game', day: '2026-07-02' }]

      await click(today)

      expect(hoisted.toastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ summary: 'Vandaag reserveren gaat niet' }),
      )
      expect(hoisted.addQuery).not.toHaveBeenCalled()
    })

    it('ignores a day in the past', async () => {
      await click(pastDay)

      expect(hoisted.addQuery).not.toHaveBeenCalled()
      expect(hoisted.toastAdd).not.toHaveBeenCalled()
    })

    it('ignores a day the cafe is closed', async () => {
      open = false

      await click()

      expect(hoisted.addQuery).not.toHaveBeenCalled()
    })

    it('ignores a day without any roster line', async () => {
      dayRoster = []

      await click()

      expect(hoisted.addQuery).not.toHaveBeenCalled()
    })
  })
})
