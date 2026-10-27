export type MailProps = {
  name: string
  date: string
  time: string
  event?: string
}

export type RawEmailValue = { html: string; text: string }

export type EmailValue = string | RawEmailValue

export type ReportValues = {
  date: string
  total: string
  sentCount: string
  failedCount: string
  skippedCount: string
  nothingToDo?: string
  failedList: RawEmailValue
  skippedList: RawEmailValue
  sentList: RawEmailValue
}

export type EmailValues = {
  BookingSuccess: MailProps
  EventSuccess: MailProps
  ReservationSuccess: MailProps
  Reminder: MailProps
  ReminderReport: ReportValues
}

export type EmailTemplate = keyof EmailValues

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
