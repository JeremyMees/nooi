# Nooi — Kalender & Reservatiesysteem

Calendar and booking app for Nooi, a community meeting space in Diest. Lives at
`kalender.nooi.be`.

## Stack

- **Nuxt 4**
- **Supabase** — database (rosters, events, reservations)
- **Stripe** — payments for paid events
- **Resend** — transactional emails
- **Nuxt UI** + **Tailwind CSS** — UI
- **Zod Mini** — form validation
- **Vercel** — hosting and cron jobs

## Pages

- `/` — public calendar with booking flows (game, reservation, event)
- `/admin` — password-protected CRUD dashboard

## Notes

- The calendar refreshes every minute and when the tab becomes visible again
- `GET /api/reminders` sends reminder emails the day before a reservation
  (Vercel cron, daily at 06:00 UTC)
- `GET /api/clean-up` removes unpaid reservations older than 30 days (Vercel
  cron, daily at 00:00 UTC)
- Both cron endpoints require `Authorization: Bearer $CRON_SECRET`
