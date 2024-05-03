export function getEventColor (theme: EventTheme): string {
  switch (theme) {
    case 'culinary':
      return 'bg-green-100 hover:ring-green-200'
    case 'creative':
      return 'bg-blue-100 hover:bg-blue-200'
    case 'game':
      return 'bg-red-100 hover:bg-red-200'
    case 'lecture':
      return 'bg-yellow-100 hover:bg-yellow-200'
    default:
      return 'bg-purple-100 hover:bg-purple-200'
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
