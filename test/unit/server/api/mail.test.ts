import { beforeEach, describe, expect, it } from 'vitest'
import { mockEvent } from '~~/test/unit/stubs/api-event'
import { mockRuntimeConfig } from '~~/test/unit/stubs/runtime-config'
import { mockSend, render, send } from '~~/test/unit/stubs/mail'
import bookingSuccess from '~~/server/api/mail/booking-success.post'
import eventSuccess from '~~/server/api/mail/event-success.post'
import reservationSuccess from '~~/server/api/mail/reservation-success.post'
import BookingTemplate from '~~/emails/BookingSuccess.vue'
import EventTemplate from '~~/emails/EventSuccess.vue'
import ReservationTemplate from '~~/emails/ReservationSuccess.vue'

const endpoints = [
  [
    'booking-success',
    bookingSuccess,
    'Jouw boeking voor Nooi',
    BookingTemplate,
  ],
  ['event-success', eventSuccess, 'Jouw inschrijving bij Nooi', EventTemplate],
  [
    'reservation-success',
    reservationSuccess,
    'Jouw reservatie voor Nooi',
    ReservationTemplate,
  ],
] as const

const props = {
  name: 'Jef Van Laer',
  date: 'maandag 14 september 2026',
  time: '19:00',
}

beforeEach(() => {
  mockRuntimeConfig({ resendApiKey: 're_test' })
  mockSend()
})

describe.each(endpoints)('POST /api/mail/%s', (_name, handler, subject) => {
  it('sends the mail to the given recipient', async () => {
    const body = { to: 'jef@example.com', props }

    await expect(handler(mockEvent({ method: 'POST', body }))).resolves.toEqual(
      {
        message: 'Email sent',
      },
    )

    expect(render).toHaveBeenCalledWith(expect.anything(), props)
    expect(send).toHaveBeenCalledWith({
      from: 'Nooi <zin@nooi.be>',
      subject,
      to: 'jef@example.com',
      html: '<html>rendered</html>',
    })
  })

  it('throws when the recipient is missing', async () => {
    const event = mockEvent({ method: 'POST', body: { props } })

    await expect(handler(event)).rejects.toThrow('Missing required fields')
    expect(send).not.toHaveBeenCalled()
  })

  it('throws when the props are missing', async () => {
    const event = mockEvent({ method: 'POST', body: { to: 'jef@example.com' } })

    await expect(handler(event)).rejects.toThrow('Missing required fields')
    expect(send).not.toHaveBeenCalled()
  })

  it('rethrows when Resend raises', async () => {
    send.mockRejectedValue(new Error('network down'))
    const event = mockEvent({
      method: 'POST',
      body: { to: 'jef@example.com', props },
    })

    await expect(handler(event)).rejects.toThrow('network down')
  })

  it('throws when Resend reports an error on the result', async () => {
    mockSend({ error: { message: 'suppressed recipient' } })
    const event = mockEvent({
      method: 'POST',
      body: { to: 'jef@example.com', props },
    })

    await expect(handler(event)).rejects.toThrow('suppressed recipient')
  })
})
