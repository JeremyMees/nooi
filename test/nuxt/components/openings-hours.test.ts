import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import OpeningsHours from '~/components/OpeningsHours.vue'
import { mockRoster } from '~~/test/mock'

let roster: RosterRow[]

mockNuxtImport('useRosterStore', () => () => ({
  fetchRoster: () => Promise.resolve(roster),
}))

async function mount() {
  const wrapper = await mountSuspended(OpeningsHours)
  await flushPromises()
  return wrapper
}

describe('OpeningsHours', () => {
  beforeEach(() => {
    roster = [
      { ...mockRoster, id: 1, status: 'game', start: '18:00', end: '20:00' },
      { ...mockRoster, id: 2, status: 'game', start: '20:00', end: '23:00' },
    ]
  })

  it('matches snapshot', async () => {
    const wrapper = await mount()

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders the opening hours block when there are game rosters', async () => {
    const wrapper = await mount()

    expect(wrapper.find('[test-id="openings-hours"]').exists()).toBe(true)
  })

  it('formats and lists each game roster time range', async () => {
    const wrapper = await mount()

    const text = wrapper.find('[test-id="openings-hours-text"]').text()

    expect(text).toContain('18:00 - 20:00')
    expect(text).toContain('20:00 - 23:00')
  })

  it('ignores non-game rosters', async () => {
    roster = [
      { ...mockRoster, id: 1, status: 'game', start: '18:00', end: '20:00' },
      {
        ...mockRoster,
        id: 2,
        status: 'occupied',
        start: '20:00',
        end: '23:00',
      },
    ]

    const wrapper = await mount()
    const text = wrapper.find('[test-id="openings-hours-text"]').text()

    expect(text).toContain('18:00 - 20:00')
    expect(text).not.toContain('20:00 - 23:00')
  })

  it('does not render the block when there are no game rosters', async () => {
    roster = [
      {
        ...mockRoster,
        id: 1,
        status: 'occupied',
        start: '18:00',
        end: '20:00',
      },
    ]

    const wrapper = await mount()

    expect(wrapper.find('[test-id="openings-hours"]').exists()).toBe(false)
  })
})
