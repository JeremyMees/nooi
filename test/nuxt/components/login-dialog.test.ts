import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import LoginDialog from '~/components/LoginDialog.vue'

let authenticated: boolean | undefined

const login = vi.hoisted(() => vi.fn())

mockNuxtImport('useAdminStore', () => () => ({
  get authenticated() {
    return authenticated
  },
  login,
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
    authenticated = false
    login.mockReset()
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

  it('stays hidden while the session is still being checked', async () => {
    authenticated = undefined

    const wrapper = await mount()

    expect(wrapper.find('[test-id="login-header"]').exists()).toBe(false)
  })

  it('hides the dialog once authenticated', async () => {
    authenticated = true

    const wrapper = await mount()

    expect(wrapper.find('[test-id="login-header"]').exists()).toBe(false)
  })

  it('never ships the admin password to the browser', () => {
    expect(useRuntimeConfig().public).not.toHaveProperty('adminPassword')
  })

  it('logs in with the submitted password', async () => {
    login.mockResolvedValue(true)
    const wrapper = await mount()

    await wrapper
      .findComponent({ name: 'FormKit' })
      .vm.$emit('submit', { password: 'hunter22' })

    expect(login).toHaveBeenCalledWith('hunter22')
    expect(wrapper.find('[test-id="login-error"]').exists()).toBe(false)
  })

  it('tells the admin when the password is wrong', async () => {
    login.mockResolvedValue(false)
    const wrapper = await mountSuspended(LoginDialog, {
      global: {
        stubs: {
          ...stubs,
          FormKit: {
            name: 'FormKit',
            emits: ['submit'],
            template: '<div><slot /></div>',
          },
        },
      },
    })

    await wrapper
      .findComponent({ name: 'FormKit' })
      .vm.$emit('submit', { password: 'admin' })
    await new Promise(resolve => setTimeout(resolve))

    expect(wrapper.find('[test-id="login-error"]').exists()).toBe(true)
  })
})
