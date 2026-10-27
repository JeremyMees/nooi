import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, type VueWrapper } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { Time } from '@internationalized/date'
import FormTimeInput from '~/components/form/TimeInput.vue'
import { isPopoverOpen, openPopover, popoverStub } from '~~/test/mock'

describe('FormTimeInput', () => {
  it('shows the time on a 24 hour clock', async () => {
    const wrapper = await mountSuspended(FormTimeInput, {
      props: { modelValue: '19:30' },
    })

    expect(wrapper.text()).toContain('19')
    expect(wrapper.text()).not.toMatch(/AM|PM/)
  })

  describe('clock picker', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    async function mountPicker(modelValue?: string) {
      const wrapper = await mountSuspended(FormTimeInput, {
        props: { modelValue },
        global: { stubs: popoverStub },
      })
      await openPopover(wrapper)
      return wrapper
    }

    const hour = (wrapper: VueWrapper, index: number) =>
      wrapper.findAll('[test-id="time-input-hour"]')[index]!

    const minute = (wrapper: VueWrapper, index: number) =>
      wrapper.findAll('[test-id="time-input-minute"]')[index]!

    it('lists every hour of the day and the half hours', async () => {
      const wrapper = await mountPicker()

      const hours = wrapper.findAll('[test-id="time-input-hour"]')
      const minutes = wrapper.findAll('[test-id="time-input-minute"]')

      expect(hours).toHaveLength(24)
      expect(hours[0]!.text()).toBe('00')
      expect(hours[23]!.text()).toBe('23')
      expect(minutes.map(minute => minute.text())).toEqual(['00', '30'])
    })

    it('marks the current hour', async () => {
      const wrapper = await mountPicker('19:30')

      expect(
        wrapper
          .find('[test-id="time-input-hour"][data-selected="true"]')
          .text(),
      ).toBe('19')
    })

    it('starts at the top of the hour when nothing was picked yet', async () => {
      const wrapper = await mountPicker()

      await hour(wrapper, 18).trigger('click')

      expect(wrapper.emitted('update:modelValue')).toEqual([['18:00']])
    })

    it('keeps the minutes when the hour changes', async () => {
      const wrapper = await mountPicker('19:30')

      await hour(wrapper, 8).trigger('click')

      expect(wrapper.emitted('update:modelValue')).toEqual([['08:30']])
    })

    it('stays open after an hour so the minutes can be picked', async () => {
      const wrapper = await mountPicker('19:00')

      await hour(wrapper, 20).trigger('click')
      await flushPromises()

      expect(isPopoverOpen(wrapper)).toBe(true)
    })

    it('closes once the minutes are picked', async () => {
      const wrapper = await mountPicker('19:00')

      await minute(wrapper, 1).trigger('click')
      await flushPromises()

      expect(isPopoverOpen(wrapper)).toBe(false)
    })

    it('scrolls the current hour into view when it opens', async () => {
      const scrollIntoView = vi
        .spyOn(Element.prototype, 'scrollIntoView')
        .mockImplementation(() => {})
      const wrapper = await mountSuspended(FormTimeInput, {
        props: { modelValue: '19:30' },
        global: { stubs: popoverStub },
      })

      await openPopover(wrapper)

      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'center' })
      expect(scrollIntoView.mock.contexts[0]).toBe(hour(wrapper, 19).element)
    })

    it('keeps the hour when the minutes change', async () => {
      const wrapper = await mountPicker('18:00')

      await minute(wrapper, 1).trigger('click')

      expect(wrapper.emitted('update:modelValue')).toEqual([['18:30']])
    })
  })

  describe('rounding to the half hour on blur', () => {
    async function blurWith(modelValue: string) {
      const wrapper = await mountSuspended(FormTimeInput, {
        props: { modelValue },
      })

      wrapper
        .findComponent({ name: 'UInputTime' })
        .vm.$emit('blur', new FocusEvent('blur'))
      await flushPromises()

      return wrapper.emitted('update:modelValue')
    }

    it.each([
      ['19:10', '19:00'],
      ['19:20', '19:30'],
      ['19:50', '20:00'],
      ['23:50', '00:00'],
    ])('rounds %s to %s', async (typed, expected) => {
      expect(await blurWith(typed)).toEqual([[expected]])
    })

    it('leaves a half hour alone', async () => {
      expect(await blurWith('19:30')).toBeUndefined()
    })

    it('does not round while the minutes are still being typed', async () => {
      const wrapper = await mountSuspended(FormTimeInput, {
        props: { modelValue: '19:00' },
      })

      wrapper
        .findComponent({ name: 'UInputTime' })
        .vm.$emit('update:modelValue', new Time(19, 4))
      await flushPromises()

      expect(wrapper.emitted('update:modelValue')).toEqual([['19:04']])
    })
  })

  it('reads a database time with seconds', async () => {
    const wrapper = await mountSuspended(FormTimeInput, {
      props: { modelValue: '08:00:00' },
    })

    expect(
      wrapper.findComponent({ name: 'UInputTime' }).props('modelValue'),
    ).toEqual(new Time(8, 0))
  })

  it('hands back the picked time as hours and minutes', async () => {
    const wrapper = await mountSuspended(FormTimeInput, {
      props: { modelValue: undefined },
    })

    wrapper
      .findComponent({ name: 'UInputTime' })
      .vm.$emit('update:modelValue', new Time(9, 30))
    await flushPromises()

    expect(wrapper.emitted('update:modelValue')).toEqual([['09:30']])
  })

  it('hands back nothing when the time is cleared', async () => {
    const wrapper = await mountSuspended(FormTimeInput, {
      props: { modelValue: '09:30' },
    })

    wrapper
      .findComponent({ name: 'UInputTime' })
      .vm.$emit('update:modelValue', undefined)
    await flushPromises()

    expect(wrapper.emitted('update:modelValue')).toEqual([[undefined]])
  })
})
