export function getEventColor (theme: EventTheme): string {
  switch (theme) {
    case 'culinary':
      return 'bg-green-100 hover:bg-green-200 group-hover:bg-green-200'
    case 'creative':
      return 'bg-blue-100 hover:bg-blue-200 group-hover:bg-blue-200'
    case 'game':
      return 'bg-red-100 hover:bg-red-200 group-hover:bg-red-200'
    case 'lecture':
      return 'bg-yellow-100 hover:bg-yellow-200 group-hover:bg-yellow-200'
    default:
      return 'bg-purple-100 hover:bg-purple-200 group-hover:bg-purple-200'
  }
}

export function getEventBorder (theme: EventTheme): string {
  switch (theme) {
    case 'culinary':
      return 'ring-green-200'
    case 'creative':
      return 'ring-blue-200'
    case 'game':
      return 'ring-red-200'
    case 'lecture':
      return 'ring-yellow-200'
    default:
      return 'ring-purple-200'
  }
}

export function getEventLines (theme: EventTheme): string {
  switch (theme) {
    case 'culinary':
      return 'lines-green'
    case 'creative':
      return 'lines-blue'
    case 'game':
      return 'lines-red'
    case 'lecture':
      return 'lines-yellow'
    default:
      return 'lines-purple'
  }
}

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
