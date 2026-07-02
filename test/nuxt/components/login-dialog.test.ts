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
})
