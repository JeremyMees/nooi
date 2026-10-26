export const useAdminStore = defineStore('useAdminStore', () => {
  const supabase = useSupabaseClient<Database>()
  const authenticated = ref<boolean>()

  const events = ref<EventReservation[]>([])

  const defaultOptions = { data: [], loading: true }

  const data = ref<AdminData>({
    events: { ...defaultOptions },
    reservations: { ...defaultOptions },
    rosters: { ...defaultOptions },
  })

  async function checkSession(): Promise<void> {
    const session = await $fetch('/api/admin/session')

    authenticated.value = session.authenticated
  }

  async function login(password: string): Promise<boolean> {
    try {
      await $fetch('/api/admin/login', {
        method: 'POST',
        body: { password },
      })

      authenticated.value = true
    } catch {
      authenticated.value = false
    }

    return authenticated.value
  }

  async function run(
    type: DatabaseTable,
    action: () => Promise<unknown>,
    message: string,
  ): Promise<void> {
    try {
      data.value[type].loading = true
      data.value[type].error = undefined

      await action()
      await fetchData(type)
    } catch {
      data.value[type].error = message
    } finally {
      data.value[type].loading = false
    }
  }

  async function fetchData(
    type: DatabaseTable,
    query: Partial<SbQueryOptions> = {},
  ): Promise<void> {
    try {
      data.value[type].loading = true
      data.value[type].error = undefined

      const day = query.eq?.find(({ field }) => field === 'day')?.value

      const { data: fetchedData, count } = await $fetch<SbQuery<never>>(
        `/api/admin/${type}`,
        {
          query: {
            page: query.page,
            search: query.search || undefined,
            day,
            sortField: query.sort?.field,
            sortOrder: query.sort?.order,
          },
        },
      )

      data.value[type] = {
        ...data.value[type],
        data: fetchedData,
        count,
      }
    } catch (error) {
      data.value[type].error = (error as Error).message
    } finally {
      data.value[type].loading = false
    }
  }

  async function removeData(
    type: DatabaseTable,
    arr: (RosterRow | EventRow | ReservationRow)[],
  ): Promise<void> {
    await run(
      type,
      () =>
        $fetch(`/api/admin/${type}`, {
          method: 'DELETE',
          body: { ids: arr.map(({ id }) => id) },
        }),
      'Error tijdens items verwijderen in database',
    )
  }

  async function createData(
    type: DatabaseTable,
    insert: RosterInsert | EventInsert | ReservationInsert,
  ): Promise<void> {
    await run(
      type,
      () => $fetch(`/api/admin/${type}`, { method: 'POST', body: insert }),
      'Error tijdens toevoegen in database',
    )
  }

  async function updateData(
    id: number,
    type: DatabaseTable,
    payload: RosterUpdate | EventUpdate | ReservationUpdate,
  ): Promise<void> {
    await run(
      type,
      () =>
        $fetch(`/api/admin/${type}/${id}`, { method: 'PATCH', body: payload }),
      'Error tijdens bijwerken in database',
    )
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
    } catch (error) {
      console.error(error)
    }
  }

  return {
    authenticated,
    checkSession,
    login,
    data,
    events,
    fetchData,
    removeData,
    createData,
    updateData,
    getEvents,
  }
})
