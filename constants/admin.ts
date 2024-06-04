export const values: AdminConstants = {
  title: {
    reservations: 'Reservaties',
    events: 'Evenementen',
    rosters: 'Uurroosters',
  },
  table: {
    reservations: [
      { header: 'Type', field: 'type' },
      { header: 'Naam', field: 'name' },
      { header: 'Email', field: 'email' },
      { header: 'Nummer', field: 'number' },
      { header: 'Exclusief', field: 'exclusive' },
      { header: 'Event', field: 'event' },
    ],
    events: [
      { header: 'Naam', field: 'name' },
      { header: 'Plaatsen', field: 'spots' },
      { header: 'Reservaties', field: 'reservations' },
      { header: 'Start', field: 'start' },
      { header: 'Einde', field: 'end' },
    ],
    rosters: [
      { header: 'Status', field: 'status' },
      { header: 'Start', field: 'start' },
      { header: 'Einde', field: 'end' },
      { header: 'Min Plaatsen', field: 'minSpots' },
    ],
  },
  filter: {
    reservations: ['name', 'event.name', 'type'],
    events: ['name'],
    rosters: ['status'],
  },
}
