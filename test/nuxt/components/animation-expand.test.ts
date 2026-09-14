import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AnimationExpand from '~/components/animation/Expand.vue'
import { setup } from '~~/test/mock'

function element() {
  const el = document.createElement('div')
  document.body.appendChild(el)
  return el
}

async function mount(props: { height?: string } = {}) {
  return mountSuspended(AnimationExpand, { props })
}

describe('AnimationExpand', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0)
      return 0
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  // enter() resets styles with `style.x = null`, which browsers coerce to ''
  // but happy-dom ignores, so only the scheduling is verifiable here.
  it('schedules the expansion on the next frame', async () => {
    const frame = vi.fn((cb: FrameRequestCallback) => {
      cb(0)
      return 0
    })
    vi.stubGlobal('requestAnimationFrame', frame)
    const wrapper = await mount()

    expect(() => setup(wrapper).enter(element())).not.toThrow()
    expect(frame).toHaveBeenCalledTimes(1)
  })

  it('releases the height once the expansion finished', async () => {
    const wrapper = await mount()
    const el = element()

    setup(wrapper).afterEnter(el)

    expect(el.style.height).toBe('auto')
  })

  it('settles on the height given as a prop', async () => {
    const wrapper = await mount({ height: '120px' })
    const el = element()

    setup(wrapper).afterEnter(el)

    expect(el.style.height).toBe('120px')
  })

  it('collapses the height to zero on leave', async () => {
    const wrapper = await mount()
    const el = element()
    el.style.height = '80px'

    setup(wrapper).leave(el)

    expect(el.style.height).toBe('0px')
  })
})
