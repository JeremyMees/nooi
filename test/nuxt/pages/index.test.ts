import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import IndexPage from '~/pages/index.vue'

const hoisted = vi.hoisted(() => ({
  init: vi.fn(),
  unsubscribe: vi.fn(),
}))

mockNuxtImport('useReservationStore', () => () => ({
  init: hoisted.init,
  unsubscribe: hoisted.unsubscribe,
}))

const stubs = { NuxtLayout: { template: '<div><slot /></div>' } }

async function mount() {
  return mountSuspended(IndexPage, { shallow: true, global: { stubs } })
}

describe('index page', () => {
  beforeEach(() => {
    hoisted.init.mockClear()
    hoisted.unsubscribe.mockClear()
  })

  it('starts the reservation store when it opens', async () => {
    await mount()

    expect(hoisted.init).toHaveBeenCalled()
  })

  it('drops the realtime subscription when it closes', async () => {
    const wrapper = await mount()

    wrapper.unmount()

    expect(hoisted.unsubscribe).toHaveBeenCalled()
  })

  it('explains the calendar to the visitor', async () => {
    const wrapper = await mount()

    expect(wrapper.text()).toContain('KALENDER')
  })
})
