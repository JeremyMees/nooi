import { monthDays } from '@formkit/tempo'

export const useAdminStore = defineStore('useAdminStore', () => {
  const supabase = useSupabaseClient<Database>()

  const needsAuth = ref<boolean>(import.meta.dev ? false : true)
  const events = ref<EventReservation[]>([])

  const defaultOptions = { data: [], loading: true }

  const data = ref<AdminData>({
    events: { ...defaultOptions },
    reservations: { ...defaultOptions },
    rosters: { ...defaultOptions },
  })

  async function fetchData(type: DatabaseTable, query: Partial<SbQueryOptions> = {}): Promise<void> {
    try {
      data.value[type].loading = true
      data.value[type].error = undefined

      const options: SbQueryOptions = {
        table: type,
        page: 0,
        perPage: 10,
        ...query,
      }

      if (type === 'events') {
        options.select = '*, reservations:reservations(id, spots)'
      }
      else if (type === 'reservations') {
        options.select = '*, event(name)'
      }

      const { data: fetchedData, count } = await sbQuery<RosterRow[]>(options)

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

  async function removeData(type: DatabaseTable, arr: (RosterRow | EventRow | ReservationRow)[]): Promise<void> {
    try {
      data.value[type].loading = true
      data.value[type].error = undefined

      const { error } = await supabase.from(type)
        .delete()
        .in('id', arr.map((item: any) => item.id))

      if (error) {
        data.value[type].error = 'Error tijdens items verwijderen in database'
      }
      else {
        fetchData(type)
      }
    }
    catch (error) {
      data.value[type].error = (error as Error).message
    }
    finally {
      data.value[type].loading = false
    }
  }

  async function createData(type: DatabaseTable, insert: RosterInsert | EventInsert | ReservationInsert): Promise<void> {
    try {
      data.value[type].loading = true
      data.value[type].error = undefined

      const { error } = await supabase.from(type).insert([insert] as never[])

      if (error) {
        data.value[type].error = 'Error tijdens toevoegen in database'
      }
      else {
        fetchData(type)
      }
    }
    catch (error) {
      data.value[type].error = (error as Error).message
    }
    finally {
      data.value[type].loading = false
    }
  }

  async function updateData(
    id: number,
    type: DatabaseTable,
    payload: RosterUpdate | EventUpdate | ReservationUpdate,
  ): Promise<void> {
    try {
      data.value[type].loading = true
      data.value[type].error = undefined

      const { error } = await supabase.from(type).update(payload).eq('id', id)

      if (error) {
        data.value[type].error = 'Error tijdens bijwerken in database'
      }
      else {
        fetchData(type)
      }
    }
    catch (error) {
      data.value[type].error = (error as Error).message
    }
    finally {
      data.value[type].loading = false
    }
  }

  async function getEvents(): Promise<void> {
    try {
      const day = formatDay(new Date())

      const { data } = await supabase
        .from('events')
        .select('*, reservations:reservations(id, spots)')
        .gte('day', day)
        .order('day', { ascending: true })

      if (data) {
        events.value = data
      }
    }
    catch (error) {
      console.error(error)
    }
  }

  return {
    needsAuth,
    data,
    events,
    fetchData,
    removeData,
    createData,
    updateData,
    getEvents,
  }
})
