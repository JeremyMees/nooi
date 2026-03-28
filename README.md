# Nooi — Kalender & Reservatiesysteem

Calendar and booking app for Nooi, a community meeting space in Diest. Lives at `kalender.nooi.be`.

## Stack

- **Nuxt 4**
- **Supabase** — database (rosters, events, reservations) + realtime
- **Stripe** — payments for paid events
- **Resend** — transactional emails
- **Upstash QStash** — scheduled reminder emails
- **PrimeVue** + **Tailwind CSS** — UI
- **FormKit** — forms
- **Vercel** — hosting

## Pages

- `/` — public calendar with booking flows (game, reservation, event)
- `/admin` — password-protected CRUD dashboard

## Notes

- Supabase realtime keeps calendar in sync without polling
- QStash sends reminder emails 2 days before a reservation at 08:00 UTC
- `GET /api/clean-up` removes stale unpaid reservations (run via cron)
