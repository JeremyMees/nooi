import { describe, expect, it } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { CalendarDate } from '@internationalized/date'
import FormDateInput from '~/components/form/DateInput.vue'
import { isPopoverOpen, openPopover, popoverStub } from '~~/test/mock'

describe('FormDateInput', () => {
  it('reads a database date', async () => {
    const wrapper = await mountSuspended(FormDateInput, {
      props: { modelValue: '2026-07-10' },
    })

    expect(
      wrapper.findComponent({ name: 'UInputDate' }).props('modelValue'),
    ).toEqual(new CalendarDate(2026, 7, 10))
  })

  it('reads a date that carries a time', async () => {
    const wrapper = await mountSuspended(FormDateInput, {
      props: { modelValue: '2026-07-10T18:00:00Z' },
    })

    expect(
      wrapper.findComponent({ name: 'UInputDate' }).props('modelValue'),
    ).toEqual(new CalendarDate(2026, 7, 10))
  })

  it('hands back nothing when the date is cleared', async () => {
    const wrapper = await mountSuspended(FormDateInput, {
      props: { modelValue: '2026-07-10' },
    })

    wrapper
      .findComponent({ name: 'UInputDate' })
      .vm.$emit('update:modelValue', undefined)
    await flushPromises()

    expect(wrapper.emitted('update:modelValue')).toEqual([[undefined]])
  })

  it('hands back the picked day as a date string', async () => {
    const wrapper = await mountSuspended(FormDateInput, {
      props: { modelValue: undefined },
    })

    wrapper
      .findComponent({ name: 'UInputDate' })
      .vm.$emit('update:modelValue', new CalendarDate(2026, 9, 1))
    await flushPromises()

    expect(wrapper.emitted('update:modelValue')).toEqual([['2026-09-01']])
  })

  describe('calendar', () => {
    async function mountCalendar() {
      const wrapper = await mountSuspended(FormDateInput, {
        props: { modelValue: '2026-07-10' },
        global: { stubs: popoverStub },
      })
      await openPopover(wrapper)
      return wrapper
    }

    it('starts the week on monday', async () => {
      const wrapper = await mountCalendar()

      expect(
        wrapper.findComponent({ name: 'UCalendar' }).props('weekStartsOn'),
      ).toBe(1)
    })

    it('closes and hands back the day that is clicked', async () => {
      const wrapper = await mountCalendar()

      wrapper
        .findComponent({ name: 'UCalendar' })
        .vm.$emit('update:modelValue', new CalendarDate(2026, 7, 14))
      await flushPromises()

      expect(wrapper.emitted('update:modelValue')).toEqual([['2026-07-14']])
      expect(isPopoverOpen(wrapper)).toBe(false)
    })
  })
})
