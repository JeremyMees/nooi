export const values: AdminConstants = {
  reservations: {
    title: 'Reservaties',
    table: [
      { header: 'Type', field: 'type' },
      { header: 'Naam', field: 'name' },
      { header: 'Email', field: 'email' },
      { header: 'Nummer', field: 'number' },
      { header: 'Dag', field: 'day' },
      { header: 'Start', field: 'start' },
      { header: 'Einde', field: 'end' },
      { header: 'Plaatsen', field: 'spots' },
      { header: 'Exclusief', field: 'exclusive' },
      { header: 'Event', field: 'event' },
    ],
    filter: ['name'],
  },
  events: {
    title: 'Evenementen',
    table: [
      { header: 'Naam', field: 'name' },
      { header: 'Plaatsen', field: 'spots' },
      { header: 'Reservaties', field: 'reservations' },
      { header: 'Dag', field: 'day' },
      { header: 'Start', field: 'start' },
      { header: 'Einde', field: 'end' },
    ],
    filter: ['name'],
  },
  rosters: {
    title: 'Uurroosters',
    table: [
      { header: 'Status', field: 'status' },
      { header: 'Dag', field: 'day' },
      { header: 'Start', field: 'start' },
      { header: 'Einde', field: 'end' },
      { header: 'Min Plaatsen', field: 'minSpots' },
      { header: 'Reservering', field: 'allowReservation' },
    ],
    filter: [],
  },
}
