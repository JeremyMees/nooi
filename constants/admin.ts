export const values: AdminConstants = {
  reservations: {
    title: 'Reservaties',
    table: [
      { header: 'Type', field: 'type' },
      { header: 'Naam', field: 'name' },
      { header: 'Email', field: 'email' },
      { header: 'Nummer', field: 'number' },
      { header: 'Start', field: 'start' },
      { header: 'Einde', field: 'end' },
      { header: 'Plaatsen', field: 'spots' },
      { header: 'Exclusief', field: 'exclusive' },
      { header: 'Event', field: 'event' },
    ],
    filter: ['name', 'event.name', 'type'],
  },
  events: {
    title: 'Evenementen',
    table: [
      { header: 'Naam', field: 'name' },
      { header: 'Plaatsen', field: 'spots' },
      { header: 'Reservaties', field: 'reservations' },
      { header: 'Start', field: 'start' },
      { header: 'Einde', field: 'end' },
    ],
    filter: ['name'],
  },
  rosters: {
    title: 'Uurroosters',
    table: [
      { header: 'Status', field: 'status' },
      { header: 'Start', field: 'start' },
      { header: 'Einde', field: 'end' },
      { header: 'Min Plaatsen', field: 'minSpots' },
    ],
    filter: ['status'],
  },
}
