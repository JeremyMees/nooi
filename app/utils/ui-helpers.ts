export function countSpots(data: Record<string, any>): number {
  return data.reservations.reduce((acc: number, curr: Record<string, number>) => acc + curr.spots, 0)
}

export function translateStatus(status: CalendarStatus): string {
  switch (status) {
    case 'full':
      return 'bezet'
    case 'game':
      return 'open spelcafé'
    default:
      return 'reservatie mogelijk'
  }
}

export function getType(type: string): string {
  switch (type) {
    case 'event':
      return 'evenement'
    case 'game':
      return 'reservering'
    default:
      return 'vehuur'
  }
}

export function getStatus(type: string): string {
  switch (type) {
    case 'reservation':
      return 'Reservatie'
    case 'game':
      return 'Open spelcafé'
    default:
      return 'Bezet'
  }
}

export function removeQuery(names: string[]): void {
  const router = useRouter()
  const route = useRoute()

  const query = { ...route.query }

  names.forEach(name => delete query[name])

  router.push({ query })
}

export function addQuery(values: Record<string, any>): void {
  const router = useRouter()
  const route = useRoute()

  router.push({
    query: {
      ...route.query,
      ...values,
    },
  })
}

export function getReservedSpots(arr: EventReservation['reservations']): number {
  return arr.reduce((acc, { spots }) => acc + spots, 0)
}

export function calculateCellClick(event: MouseEvent, cell: HTMLButtonElement, max: number): number {
  const { y: yEvent, target } = event
  const { y: yCell } = cell.getBoundingClientRect()
  const height = (target as HTMLElement)?.offsetHeight
  const start = Math.round(yEvent) - Math.round(yCell)
  const part = height / max

  return Math.floor(start / part)
}

export function generateCellBg(rosters: RosterRow[], lines = false): string {
  const striped = 'repeating-linear-gradient(-50deg,#e6e4e120,#e6e4e120 10px,#e6e4e110 10px,#e6e4e110 20px)'
  const rosterItems = rosters.length

  if (!rosterItems) {
    return ''
  }

  const parts = 100 / rosterItems
  let bg = ''

  rosters.forEach((row: RosterRow, i: number) => {
    const partStart = rosterItems > 1 ? `${parts * i}%` : '0%'
    const partEnd = rosterItems > 1 ? `${parts * (i + 1)}%` : '100%'
    let color = '#53A688' // game default color

    if (row.status === 'occupied') {
      color = '#C35200'
    }
    else if (row.status === 'reservation') {
      color = '#315546'
    }

    bg += `${color} ${partStart}, ${color} ${partEnd} ${i !== rosterItems - 1 ? ', ' : ''}`
  })

  return `${lines ? `${striped}, ` : ''}linear-gradient(to bottom, ${bg})`
}
