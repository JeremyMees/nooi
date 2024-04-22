export const info: (Info|undefined)[] = [
  undefined,
  undefined,
  {
    open: { hour: 9 },
    close: { hour: 23 },
    minSpots: 4
  },
  undefined,
  {
    open: { hour: 11 },
    close: { hour: 23 },
    minSpots: 2
  },
  {
    open: { hour: 11 },
    close: { hour: 23 },
    minSpots: 4
  },
  {
    open: { hour: 11 },
    close: { hour: 20 },
    minSpots: 2
  }
]

export const maxSpots = 70

export const minTimeSlot = 1

export const minTimeSlotRental = 3

export const themeOptions = [
  { label: 'Culinair', value: 'culinary' },
  { label: 'Creatief', value: 'creative' },
  { label: 'Spel', value: 'game' },
  { label: 'Lezing', value: 'lecture' },
  { label: 'Markt', value: 'market' }
]
