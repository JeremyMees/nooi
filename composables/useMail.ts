export function useMail() {
  const from = 'Nooi <zin@nooi.be>'

  async function reservationSuccess(body: Pick<Mail, 'to' | 'props'>): Promise<void> {
    try {
      await $fetch('/api/mail', {
        method: 'POST',
        body: {
          from,
          subject: 'Reservatie Nooi',
          template: 'ReservationSuccess.vue',
          ...body,
        },
      })
    }
    catch (error) {
      console.error(error)
    }
  }

  async function eventSuccess(body: Pick<Mail, 'to' | 'props'>): Promise<void> {
    try {
      await $fetch('/api/mail', {
        method: 'POST',
        body: {
          from,
          subject: 'Event reservatie Nooi',
          template: 'EventSuccess.vue',
          ...body,
        },
      })
    }
    catch (error) {
      console.error(error)
    }
  }

  async function bookingSuccess(body: Pick<Mail, 'to' | 'props'>): Promise<void> {
    try {
      await $fetch('/api/mail', {
        method: 'POST',
        body: {
          from,
          subject: 'Boeking Nooi',
          template: 'BookingSuccess.vue',
          ...body,
        },
      })
    }
    catch (error) {
      console.error(error)
    }
  }

  return {
    reservationSuccess,
    eventSuccess,
    bookingSuccess,
  }
}
