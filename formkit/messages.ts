export const messages = {
  nl: {
    validation: {
      date_open: 'Wij zijn niet open op deze dag',
      time_valid: 'Dit tijdstip is al voorbij',
      time_after: ({ args }: any) => `Je kan pas boeken vanaf ${formatHour(args[0])}`,
      time_before: ({ args }: any) => `Wij sluiten om ${formatHour(args[0])}`,
      time_break: ({ args }: any) => `Wij zijn gesloten tussen ${formatHour(args[0])} en ${formatHour(args[1])}`,
      time_slot: ({ args }: any) => `Reservatie mag minimum ${args[0]} uur zijn`
    }
  }
}
