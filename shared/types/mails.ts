export interface Mail {
  props: Record<string, any>
  from: string
  to: string
  subject: string
  template: string
}

export interface ReminderOutcome {
  id: number
  name: string
  email: string
  reason?: string
}

export interface ReminderReport {
  date: string
  total: number
  sent: ReminderOutcome[]
  failed: ReminderOutcome[]
  skipped: ReminderOutcome[]
}
