export const useAdminStore = defineStore('useAdminStore', () => {
  const supabase = useSupabaseClient()

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
      data.value[type].error = undefined

      const options: SbQueryOptions = {
        table: type,
        eq: { field: 'day', value: data.value[type].date },
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

  async function removeData(type: DatabaseTable, arr: any[]): Promise<void> {
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

  return {
    needsAuth,
    data,
    fetchData,
    removeData,
  }
})
