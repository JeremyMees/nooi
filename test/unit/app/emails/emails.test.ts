import { beforeAll, describe, expect, it } from 'vitest'
import '~~/test/unit/stubs/storage'
import { loadNuxtConfig } from '@nuxt/kit'
import { render } from '@maizzle/framework'
import { fillEmailTemplate } from '~~/server/utils/email'
import { reportValues } from '~~/server/utils/reminders'

type Compiled = { html: string; text: string }

const maizzleConfig = loadNuxtConfig({ envName: 'test' }).then(
  ({ maizzle }) => ({
    ...maizzle,
    vite: {
      cacheDir: `node_modules/.cache/maizzle-vitest-${process.env.VITEST_POOL_ID}`,
    },
  }),
)

async function compile(template: EmailTemplate): Promise<Compiled> {
  const { html, plaintext } = await render(
    `app/emails/${template}.vue`,
    await maizzleConfig,
  )

  return { html, text: plaintext ?? '' }
}

function fill(compiled: Compiled, values: MailProps): Compiled {
  return {
    html: fillEmailTemplate(compiled.html, values, 'html'),
    text: fillEmailTemplate(compiled.text, values, 'text').replace(/\s+/g, ' '),
  }
}

const values: MailProps = {
  name: 'Jef Van Laer',
  date: 'vrijdag 10 juli 2026',
  time: '19:00',
}

describe.each([
  ['BookingSuccess', 'We hebben je boeking goed ontvangen'],
  ['ReservationSuccess', 'We hebben je reservatie goed ontvangen'],
  [
    'EventSuccess',
    'We hebben je inschrijving voor Minipainting goed ontvangen',
  ],
  ['Reminder', 'Graag herinneren wij je aan je inschrijving voor Minipainting'],
] as const)('%s email', (template, opening) => {
  let compiled: Compiled

  beforeAll(async () => {
    compiled = await compile(template)
  }, 60_000)

  it('matches snapshot', () => {
    expect(compiled.html).toMatchSnapshot()
  })

  it('inlines every style', () => {
    expect(compiled.html).not.toMatch(/ class="/)
  })

  it('greets the guest and states the booking', () => {
    const { text } = fill(compiled, { ...values, event: 'Minipainting' })

    expect(text).toContain('Hallo Jef Van Laer,')
    expect(text).toContain(opening)
    expect(text).toContain('vrijdag 10 juli 2026 om 19:00.')
  })

  it('leaves out the hour when there is none', () => {
    const { text } = fill(compiled, {
      ...values,
      time: '',
      event: 'Minipainting',
    })

    expect(text).toContain('vrijdag 10 juli 2026.')
    expect(text).not.toContain('2026 om')
  })

  it('escapes what the guest typed', () => {
    const { html } = fill(compiled, {
      ...values,
      name: '<script>alert(1)</script>',
      event: 'Minipainting',
    })

    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).not.toContain('<script>alert(1)')
  })

  it('ends with the Nooi address and socials', () => {
    const { text } = fill(compiled, { ...values, event: 'Minipainting' })

    expect(text).toContain('Schotelstraat 3, 3290 Diest')
    expect(text).toContain('https://www.instagram.com/nooidiest/')
  })
})

describe('Reminder email without an event', () => {
  it('reminds of the booking instead', async () => {
    const { text } = fill(await compile('Reminder'), values)

    expect(text).toContain('Graag herinneren wij je aan je boeking bij ons op')
    expect(text).not.toContain('inschrijving')
  }, 60_000)
})

describe('ReminderReport email', () => {
  let compiled: Compiled

  const report: ReminderReport = {
    date: 'dinsdag 15 september 2026',
    total: 3,
    sent: [{ id: 1, name: 'Jef Van Laer', email: 'jef@example.com' }],
    failed: [
      {
        id: 2,
        name: 'An <b>Peeters</b>',
        email: 'an@example.com',
        reason: 'suppressed recipient',
      },
    ],
    skipped: [{ id: 3, name: 'Piet Janssens', email: '' }],
  }

  function fillReport(values: ReminderReport): Compiled {
    const filled = reportValues(values)

    return {
      html: fillEmailTemplate(compiled.html, filled, 'html'),
      text: fillEmailTemplate(compiled.text, filled, 'text').replace(
        /\s+/g,
        ' ',
      ),
    }
  }

  beforeAll(async () => {
    compiled = await compile('ReminderReport')
  }, 60_000)

  it('matches snapshot', () => {
    expect(compiled.html).toMatchSnapshot()
  })

  it('inlines every style', () => {
    expect(compiled.html).not.toMatch(/ class="/)
  })

  it('puts the date in the title and the counts in the summary', () => {
    const { html, text } = fillReport(report)

    expect(html).toContain(
      '<title>Herinneringen dinsdag 15 september 2026</title>',
    )
    expect(text).toContain(
      '3 reservatie(s) gevonden · 1 verstuurd · 1 mislukt · 1 overgeslagen',
    )
  })

  it('lists every outcome with its reason', () => {
    const { text } = fillReport(report)

    expect(text).toContain('Mislukt')
    expect(text).toContain('#2 suppressed recipient')
    expect(text).toContain('Overgeslagen (geen geldig e-mailadres)')
    expect(text).toContain('Piet Janssens · #3')
    expect(text).toContain('Verstuurd Jef Van Laer · jef@example.com · #1')
  })

  it('escapes names in the html', () => {
    const { html } = fillReport(report)

    expect(html).toContain('An &lt;b&gt;Peeters&lt;/b&gt;')
    expect(html).not.toContain('<b>Peeters</b>')
  })

  it('leaves out empty sections', () => {
    const { text } = fillReport({ ...report, failed: [], skipped: [] })

    expect(text).not.toContain('Mislukt')
    expect(text).not.toContain('Overgeslagen')
    expect(text).toContain('Verstuurd')
  })

  it('says so on a day without reservations', () => {
    const { text } = fillReport({
      ...report,
      total: 0,
      sent: [],
      failed: [],
      skipped: [],
    })

    expect(text).toContain(
      'Er waren vandaag geen reservaties om aan te herinneren.',
    )
    expect(text).not.toContain('Verstuurd')
  })
})
