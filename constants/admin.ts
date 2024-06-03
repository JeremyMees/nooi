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
    ],
    events: [
      { header: 'Naam', field: 'name' },
      { header: 'Dag', field: 'day' },
      { header: 'Plaatsen', field: 'spots' },
      { header: 'Reservaties', field: 'reservations.length' },
      { header: 'Start', field: 'start' },
      { header: 'Einde', field: 'end' },
    ],
    rosters: [
      { header: 'Status', field: 'status' },
    ],
  },
}
