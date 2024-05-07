export function translateTheme (theme: EventTheme): string {
  switch (theme) {
    case 'culinary':
      return 'culinair'
    case 'creative':
      return 'creatief'
    case 'game':
      return 'spel'
    case 'lecture':
      return 'lezing'
    default:
      return 'markt'
  }
}

export function translateStatus (status: CalendarStatus): string {
  switch (status) {
    case 'full':
      return 'bezet'
    case 'game':
      return 'open spelcafé'
    default:
      return 'reservatie mogelijk'
  }
}

export function removeQuery (names: string[]): void {
  const router = useRouter()
  const route = useRoute()

  const query = { ...route.query }

  names.forEach(name => delete query[name])

  router.push({ query })
}

export function addQuery (values: Record<string, any>): void {
  const router = useRouter()
  const route = useRoute()

  router.push({
    query: {
      ...route.query,
      ...values
    }
  })
}
