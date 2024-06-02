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

  return { reservationSuccess }
}
