export function useMail() {
  const from = 'Nooi <zin@nooi.be>'

  async function reservationSuccess(body: Pick<Mail, 'to' | 'props'>): Promise<void> {
    try {
      await $fetch('/api/mail', {
        method: 'POST',
        body: {
          from,
          subject: 'Jouw reservatie voor Nooi',
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
          subject: 'Jouw inschrijving bij Nooi',
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
          subject: 'Jouw boeking voor Nooi',
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
