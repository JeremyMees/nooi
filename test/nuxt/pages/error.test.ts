import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ErrorPage from '~/error.vue'

const stubs = {
  UApp: { template: '<div><slot /></div>' },
  NuxtLayout: { template: '<div><slot /></div>' },
  UError: {
    props: ['error', 'clear', 'redirect'],
    template:
      '<div><p test-id="status">{{ error.statusMessage }}</p><p test-id="message">{{ error.message }}</p><p test-id="clear">{{ clear.label }} {{ redirect }}</p></div>',
  },
}

async function mount(statusCode: number) {
  return mountSuspended(ErrorPage, {
    props: { error: { statusCode, statusMessage: 'Server Error' } as never },
    global: { stubs },
  })
}

describe('error page', () => {
  it('explains a missing page in Dutch', async () => {
    const wrapper = await mount(404)

    expect(wrapper.find('[test-id="status"]').text()).toBe(
      'Deze pagina bestaat niet',
    )
  })

  it('never shows the raw server message', async () => {
    const wrapper = await mount(500)

    expect(wrapper.find('[test-id="status"]').text()).toBe('Er ging iets mis')
    expect(wrapper.text()).not.toContain('Server Error')
  })

  it('offers a way back to the calendar', async () => {
    const wrapper = await mount(404)

    expect(wrapper.find('[test-id="clear"]').text()).toBe(
      'Terug naar de kalender /',
    )
  })
})
