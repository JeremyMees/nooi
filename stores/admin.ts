export const useAdminStore = defineStore('useAdminStore', () => {
  const needsAuth = ref<boolean>(true)

  const defaultOptions = {
    data: [],
    loading: true,
    date: formatDay(new Date()),
  }

  const data = ref<AdminData>({
    events: { ...defaultOptions },
    reservations: { ...defaultOptions },
    rosters: { ...defaultOptions },
  })

  async function fetchData(type: DatabaseTable): Promise<void> {
    try {
      data.value[type].loading = true

      let response

      if (type === 'events') {
        response = await sbQuery<EventReservation[]>({
          table: 'events',
          select: '*, reservations:reservations(id, spots)',
        })
      }
      else if (type === 'reservations') {
        response = await sbQuery<ReservationRow[]>({
          table: 'reservations',
          select: '*, event(name)',
        })
      }
      else {
        response = await sbQuery<RosterRow[]>({ table: 'rosters' })
      }

      const { data: fetchedData, count } = response

      data.value[type] = {
        ...data.value[type],
        data: fetchedData as any[],
        count,
      }
    }
    catch (error) {
      data.value[type].error = (error as Error).message
    }
    finally {
      data.value[type].loading = false
    }
  }

  return {
    needsAuth,
    data,
    fetchData,
  }
})
