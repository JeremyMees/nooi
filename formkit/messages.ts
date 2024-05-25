export const messages = {
  nl: {
    validation: {
      date_open: 'Wij zijn niet open op deze dag',
      date_valid: 'Je kan niet op dezelfde dag reserven. Gelieve hiervoor te bellen als je toch zou willen reserveren',
      time_valid: 'Wij zijn niet open op dit uur',
      time_after: ({ args }: any) => `Je kan pas boeken vanaf ${formatHour(args[0])}`,
      time_before: ({ args }: any) => `Wij sluiten om ${formatHour(args[0])}`,
      time_slot: ({ args }: any) => `Reservatie mag minimum ${args[0]} uur zijn`,
    },
  },
}
