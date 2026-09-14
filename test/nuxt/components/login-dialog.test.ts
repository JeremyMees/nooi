import { beforeEach, describe, expect, it } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import LoginDialog from '~/components/LoginDialog.vue'

let authCookie: string | undefined

mockNuxtImport('useAdminStore', () => () => ({
  get authCookie() {
    return authCookie
  },
  set authCookie(value: string | undefined) {
    authCookie = value
  },
}))

const stubs = {
  Dialog: {
    props: ['visible', 'header'],
    template:
      '<div v-if="visible"><span test-id="login-header">{{ header }}</span><slot /></div>',
  },
  FormKit: true,
}

async function mount() {
  return mountSuspended(LoginDialog, { global: { stubs } })
}

describe('LoginDialog', () => {
  beforeEach(() => {
    authCookie = undefined
  })

  it('matches snapshot', async () => {
    const wrapper = await mount()

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('shows the login dialog when not authenticated', async () => {
    const wrapper = await mount()

    expect(wrapper.find('[test-id="login-header"]').text()).toBe(
      'Inloggen op admin paneel',
    )
    expect(wrapper.findComponent({ name: 'FormKit' }).exists()).toBe(true)
  })

  it('hides the dialog once authenticated', async () => {
    authCookie = 'authenticated'

    const wrapper = await mount()

    expect(wrapper.find('[test-id="login-header"]').exists()).toBe(false)
  })

  it('validates against the configured admin password', async () => {
    const { adminPassword } = useRuntimeConfig().public

    // The default FormKit stub drops its slot, so render one that keeps it.
    const wrapper = await mountSuspended(LoginDialog, {
      global: {
        stubs: {
          ...stubs,
          FormKit: { template: '<div v-bind="$attrs"><slot /></div>' },
        },
      },
    })

    expect(wrapper.find('[name="password"]').attributes('validation')).toBe(
      `required|is:${adminPassword}`,
    )
  })

  it('marks the session authenticated when the form is submitted', async () => {
    const wrapper = await mount()

    await wrapper.findComponent({ name: 'FormKit' }).vm.$emit('submit')

    expect(authCookie).toBe('authenticated')
  })
})
