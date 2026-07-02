import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import BigCalendar from '~/components/BigCalendar.vue'

const shownDate = ref({ month: 6, year: 2026 })
const store = { shownDate, events: [] as EventRow[] }

mockNuxtImport('useReservationStore', () => () => store)
mockNuxtImport('storeToRefs', () => (s: typeof store) => s)

async function mount() {
  return mountSuspended(BigCalendar, {
    global: { stubs: { CalendarCell: true } },
  })
}

describe('BigCalendar', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 2, 12, 0, 0))
    shownDate.value = { month: 6, year: 2026 }
    store.events = []
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('matches snapshot', async () => {
    const wrapper = await mount()

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('shows the current month and year in Dutch', async () => {
    const wrapper = await mount()

    expect(wrapper.find('[test-id="calendar-month"]').text()).toBe('juli 2026')
  })

  it('renders a full 42-cell month grid', async () => {
    const wrapper = await mount()

    expect(wrapper.findAll('calendar-cell-stub')).toHaveLength(42)
  })

  it('renders the seven weekday headers', async () => {
    const wrapper = await mount()

    expect(wrapper.text()).toContain('ma')
    expect(wrapper.text()).toContain('zo')
  })

  it('renders a legend with the three statuses', async () => {
    const wrapper = await mount()

    const legend = wrapper.findAll('[test-id="calendar-legend-item"]')

    expect(legend).toHaveLength(3)
    expect(wrapper.text()).toContain('bezet')
    expect(wrapper.text()).toContain('reservatie mogelijk')
    expect(wrapper.text()).toContain('open spelcafé')
  })

  it('advances to the next month when clicking the next button', async () => {
    const wrapper = await mount()

    await wrapper.find('[aria-label="Volgende maand"]').trigger('click')

    expect(shownDate.value).toEqual({ month: 7, year: 2026 })
  })

  it('rolls over the year when advancing past December', async () => {
    shownDate.value = { month: 11, year: 2026 }

    const wrapper = await mount()

    await wrapper.find('[aria-label="Volgende maand"]').trigger('click')

    expect(shownDate.value).toEqual({ month: 0, year: 2027 })
  })

  it('disables the previous-month button on the current month', async () => {
    const wrapper = await mount()

    expect(
      wrapper.find('[aria-label="Vorige maand"]').attributes('disabled'),
    ).toBeDefined()
  })
})
