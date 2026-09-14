import { describe, expect, it } from 'vitest'
import {
  brusselsDay,
  reminderOutcome,
  reminderProps,
  reportKey,
  reportRecipients,
  reportSubject,
  splitReminders,
} from '~~/server/utils/reminders'
import type { ReminderReport } from '~~/shared/types/mails'
import type { ReservationWithEvent } from '~~/shared/types/supabase'

function reservation(
  overrides: Partial<ReservationWithEvent> = {},
): ReservationWithEvent {
  return {
    id: 1,
    created_at: '2026-07-13T09:23:14.486025+00',
    day: '2026-09-14',
    start: '19:00:00',
    end: '22:00:00',
    email: 'jef@example.com',
    name: 'Jef Van Laer',
    number: '0496264466',
    info: null,
    exclusive: false,
    paymentIdentifier: 'pi_123',
    paymentNeeded: false,
    spots: 1,
    type: 'event',
    event: { name: 'Mini painting' },
    ...overrides,
  }
}

describe('brusselsDay', () => {
  it('returns the Brussels date during summer time', () => {
    expect(brusselsDay(new Date('2026-09-14T06:00:00Z'))).toBe('2026-09-14')
  })

  it('returns the Brussels date during winter time', () => {
    expect(brusselsDay(new Date('2026-12-14T06:00:00Z'))).toBe('2026-12-14')
  })

  it('rolls over to the next day after Brussels midnight', () => {
    expect(brusselsDay(new Date('2026-09-14T22:30:00Z'))).toBe('2026-09-15')
  })
})

describe('splitReminders', () => {
  it('keeps reservations with a valid email address', () => {
    const rows = [reservation({ id: 1 }), reservation({ id: 2 })]

    expect(splitReminders(rows)).toEqual({ recipients: rows, skipped: [] })
  })

  it('skips reservations without an email address', () => {
    const withEmail = reservation({ id: 1 })
    const withoutEmail = reservation({ id: 2, email: null })

    expect(splitReminders([withEmail, withoutEmail])).toEqual({
      recipients: [withEmail],
      skipped: [withoutEmail],
    })
  })

  it('skips reservations with a malformed email address', () => {
    const malformed = reservation({ id: 3, email: 'not-an-email' })

    expect(splitReminders([malformed])).toEqual({
      recipients: [],
      skipped: [malformed],
    })
  })

  it('returns empty results for an empty list', () => {
    expect(splitReminders([])).toEqual({ recipients: [], skipped: [] })
  })
})

describe('reminderProps', () => {
  it('formats the date and time for the template', () => {
    expect(reminderProps(reservation())).toEqual({
      name: 'Jef Van Laer',
      date: 'maandag 14 september 2026',
      time: '19:00',
      event: 'Mini painting',
    })
  })

  it('leaves the event undefined for a plain reservation', () => {
    expect(reminderProps(reservation({ event: null })).event).toBeUndefined()
  })
})

describe('reminderOutcome', () => {
  it('describes a successful send without a reason', () => {
    expect(reminderOutcome(reservation())).toEqual({
      id: 1,
      name: 'Jef Van Laer',
      email: 'jef@example.com',
    })
  })

  it('includes the reason when one is given', () => {
    expect(reminderOutcome(reservation(), 'rate_limit_exceeded')).toEqual({
      id: 1,
      name: 'Jef Van Laer',
      email: 'jef@example.com',
      reason: 'rate_limit_exceeded',
    })
  })

  it('falls back to an empty string when there is no email', () => {
    expect(reminderOutcome(reservation({ email: null })).email).toBe('')
  })
})

describe('reportRecipients', () => {
  it('splits a comma separated list and trims whitespace', () => {
    expect(reportRecipients('a@nooi.be,  b@nooi.be ')).toEqual([
      'a@nooi.be',
      'b@nooi.be',
    ])
  })

  it('drops malformed addresses', () => {
    expect(reportRecipients('a@nooi.be,nope,,b@nooi.be')).toEqual([
      'a@nooi.be',
      'b@nooi.be',
    ])
  })

  it('returns an empty list when the variable is unset', () => {
    expect(reportRecipients()).toEqual([])
    expect(reportRecipients('')).toEqual([])
  })
})

describe('reportSubject and reportKey', () => {
  const report: ReminderReport = {
    date: 'maandag 14 september 2026',
    total: 3,
    sent: [{ id: 1, name: 'Jef', email: 'jef@example.com' }],
    failed: [{ id: 2, name: 'Tom', email: 'tom@example.com', reason: 'boom' }],
    skipped: [{ id: 3, name: 'Tim', email: '' }],
  }

  it('summarises the run in the subject', () => {
    expect(reportSubject(report)).toBe(
      'Herinneringen maandag 14 september 2026: 1 verstuurd, 1 mislukt',
    )
  })

  it('builds a key from the day and the counts', () => {
    expect(reportKey('2026-09-14', report)).toBe(
      'reminder-report/2026-09-14-1-1-1',
    )
  })

  it('changes the key when the results change', () => {
    const rerun = { ...report, sent: [...report.sent, report.sent[0]!] }

    expect(reportKey('2026-09-14', rerun)).not.toBe(
      reportKey('2026-09-14', report),
    )
  })
})
