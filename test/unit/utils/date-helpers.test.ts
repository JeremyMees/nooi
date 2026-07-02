import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  addMonth,
  afterTime,
  beforeTime,
  dateInPast,
  daysInMonth,
  formatDateUrl,
  formatDay,
  formatHour,
  formatHourText,
  getCalenderDays,
  getDaysOfWeek,
  getMonths,
  getYesterday,
  isAfterDeadline,
  isBeforeDeadline,
  isValidDateString,
  padDate,
  roundTime,
  sameMonth,
  sameTime,
  sameYear,
  splitTime,
} from '~~/shared/utils/date-helpers'

describe('padDate', () => {
  it('pads single digits to two characters', () => {
    expect(padDate(1)).toBe('01')
    expect(padDate(9)).toBe('09')
  })

  it('leaves two-digit numbers unchanged', () => {
    expect(padDate(12)).toBe('12')
    expect(padDate(31)).toBe('31')
  })
})

describe('formatDay', () => {
  it('formats a date as YYYY-MM-DD with padding', () => {
    expect(formatDay(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('pads both month and day', () => {
    expect(formatDay(new Date(2026, 8, 9))).toBe('2026-09-09')
  })
})

describe('formatDateUrl', () => {
  it('reverses a dashed date into day-month-year', () => {
    expect(formatDateUrl('2026-07-10')).toBe('10-07-2026')
  })
})

describe('formatHour', () => {
  it('pads hours and minutes', () => {
    expect(formatHour('9:5')).toBe('09:05')
  })

  it('keeps two-digit values', () => {
    expect(formatHour('19:30')).toBe('19:30')
  })

  it('defaults missing minutes to 00', () => {
    expect(formatHour('8')).toBe('08:00')
  })
})

describe('formatHourText', () => {
  it('omits minutes when they are zero', () => {
    expect(formatHourText('19:00')).toBe('19u')
  })

  it('includes padded minutes when present', () => {
    expect(formatHourText('19:05')).toBe('19u05')
  })
})

describe('splitTime', () => {
  it('splits an hh:mm string into numbers', () => {
    expect(splitTime('14:30')).toEqual({ hour: 14, minutes: 30 })
  })

  it('defaults missing parts to zero', () => {
    expect(splitTime('')).toEqual({ hour: 0, minutes: 0 })
    expect(splitTime('9')).toEqual({ hour: 9, minutes: 0 })
  })
})

describe('roundTime', () => {
  it('rounds minutes at or below 15 down to the hour', () => {
    expect(roundTime('10:00')).toBe('10:00')
    expect(roundTime('10:15')).toBe('10:00')
  })

  it('rounds minutes at or above 45 up to the next hour', () => {
    expect(roundTime('10:45')).toBe('11:00')
    expect(roundTime('10:59')).toBe('11:00')
  })

  it('rounds midday-ish minutes to the half hour', () => {
    expect(roundTime('10:30')).toBe('10:30')
    expect(roundTime('10:20')).toBe('10:30')
  })

  it('wraps 23:xx rounding up to 00:00', () => {
    expect(roundTime('23:50')).toBe('00:00')
  })

  it('returns the placeholder for malformed input', () => {
    expect(roundTime('10')).toBe('_')
    expect(roundTime('')).toBe('_')
  })
})

describe('addMonth', () => {
  it('increments the month within the same year', () => {
    expect(addMonth({ year: 2026, month: 5 }, 1)).toEqual({
      year: 2026,
      month: 6,
    })
  })

  it('rolls over into the next year when passing December', () => {
    expect(addMonth({ year: 2026, month: 12 }, 1)).toEqual({
      year: 2027,
      month: 1,
    })
  })

  it('rolls back into the previous year when going below January', () => {
    expect(addMonth({ year: 2026, month: 1 }, -1)).toEqual({
      year: 2025,
      month: 12,
    })
  })

  it('preserves an existing day field', () => {
    expect(addMonth({ year: 2026, month: 5, day: 15 }, 1)).toEqual({
      year: 2026,
      month: 6,
      day: 15,
    })
  })
})

describe('daysInMonth', () => {
  it('returns the number of days for a given month (0-indexed)', () => {
    expect(daysInMonth(2026, 0)).toBe(31) // January
    expect(daysInMonth(2026, 1)).toBe(28) // February (non-leap)
    expect(daysInMonth(2024, 1)).toBe(29) // February (leap year)
    expect(daysInMonth(2026, 3)).toBe(30) // April
  })
})

describe('sameYear', () => {
  it('is true when the years match', () => {
    expect(sameYear({ year: 2026, month: 5 }, new Date(2026, 2, 1))).toBe(true)
  })

  it('is false when the years differ', () => {
    expect(sameYear({ year: 2026, month: 5 }, new Date(2025, 2, 1))).toBe(false)
  })
})

describe('sameMonth', () => {
  it('is true when month and year match', () => {
    expect(sameMonth({ year: 2026, month: 2 }, new Date(2026, 2, 15))).toBe(
      true,
    )
  })

  it('is false when the month differs', () => {
    expect(sameMonth({ year: 2026, month: 2 }, new Date(2026, 3, 15))).toBe(
      false,
    )
  })

  it('is false when only the month matches but the year differs', () => {
    expect(sameMonth({ year: 2026, month: 2 }, new Date(2025, 2, 15))).toBe(
      false,
    )
  })
})

describe('isBeforeDeadline', () => {
  it('is true before the deadline', () => {
    expect(isBeforeDeadline(new Date(2026, 6, 1), new Date(2026, 6, 10))).toBe(
      true,
    )
  })

  it('is true on the deadline day', () => {
    expect(isBeforeDeadline(new Date(2026, 6, 10), new Date(2026, 6, 10))).toBe(
      true,
    )
  })

  it('is false after the deadline', () => {
    expect(isBeforeDeadline(new Date(2026, 6, 11), new Date(2026, 6, 10))).toBe(
      false,
    )
  })
})

describe('isAfterDeadline', () => {
  it('is true after the deadline', () => {
    expect(isAfterDeadline(new Date(2026, 6, 11), new Date(2026, 6, 10))).toBe(
      true,
    )
  })

  it('is false on the deadline day', () => {
    expect(isAfterDeadline(new Date(2026, 6, 10), new Date(2026, 6, 10))).toBe(
      false,
    )
  })

  it('is false before the deadline', () => {
    expect(isAfterDeadline(new Date(2026, 6, 1), new Date(2026, 6, 10))).toBe(
      false,
    )
  })
})

describe('beforeTime', () => {
  it('compares plain times', () => {
    expect(beforeTime('10:00', '12:00')).toBe(true)
    expect(beforeTime('12:00', '10:00')).toBe(false)
  })

  it('compares minutes when hours are equal', () => {
    expect(beforeTime('10:15', '10:30')).toBe(true)
    expect(beforeTime('10:30', '10:15')).toBe(false)
  })

  it('is false for equal times', () => {
    expect(beforeTime('10:00', '10:00')).toBe(false)
  })

  it('treats after-midnight hours as later than the evening', () => {
    expect(beforeTime('23:00', '01:00')).toBe(true)
    expect(beforeTime('01:00', '23:00')).toBe(false)
  })
})

describe('afterTime', () => {
  it('compares plain times', () => {
    expect(afterTime('12:00', '10:00')).toBe(true)
    expect(afterTime('10:00', '12:00')).toBe(false)
  })

  it('compares minutes when hours are equal', () => {
    expect(afterTime('10:30', '10:15')).toBe(true)
  })

  it('is false for equal times', () => {
    expect(afterTime('10:00', '10:00')).toBe(false)
  })
})

describe('sameTime', () => {
  it('is true for identical times', () => {
    expect(sameTime('10:30', '10:30')).toBe(true)
  })

  it('is false for different times', () => {
    expect(sameTime('10:30', '10:31')).toBe(false)
  })
})

describe('getMonths', () => {
  it('returns twelve month names', () => {
    expect(getMonths()).toHaveLength(12)
  })
})

describe('getDaysOfWeek', () => {
  it('returns seven weekday names', () => {
    expect(getDaysOfWeek()).toHaveLength(7)
  })

  it('starts the week on Monday and ends on Sunday (Dutch locale)', () => {
    const days = getDaysOfWeek()

    expect(days[0]).toBe('ma')
    expect(days[6]).toBe('zo')
  })
})

describe('getCalenderDays', () => {
  it('always returns a full 42-tile grid', () => {
    expect(getCalenderDays({ year: 2026, month: 6 })).toHaveLength(42)
  })

  it('marks the correct number of tiles as belonging to the current month', () => {
    const tiles = getCalenderDays({ year: 2026, month: 6 })
    const currentMonthTiles = tiles.filter(t => t.currentMonth)

    expect(currentMonthTiles).toHaveLength(31)
  })

  it('numbers the current-month tiles from 1 to the last day', () => {
    const tiles = getCalenderDays({ year: 2026, month: 1 })
    const dates = tiles.filter(t => t.currentMonth).map(t => t.date)

    expect(dates[0]).toBe(1)
    expect(dates[dates.length - 1]).toBe(28)
  })
})

describe('now-based helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 2, 12, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('dateInPast', () => {
    it('is true for a date well before today', () => {
      expect(dateInPast(new Date(2026, 5, 1))).toBe(true)
    })

    it('is false for today', () => {
      expect(dateInPast(new Date(2026, 6, 2))).toBe(false)
    })

    it('is false for a future date', () => {
      expect(dateInPast(new Date(2026, 6, 10))).toBe(false)
    })
  })

  describe('getYesterday', () => {
    it('returns the day before today', () => {
      expect(formatDay(getYesterday())).toBe('2026-07-01')
    })
  })

  describe('isValidDateString', () => {
    it('accepts a well-formed future date string', () => {
      expect(isValidDateString('2026-08-01')).toBe(true)
    })

    it('rejects a string that is not 10 characters', () => {
      expect(isValidDateString('2026-8-1')).toBe(false)
    })

    it('rejects an unparseable date', () => {
      expect(isValidDateString('not-a-date')).toBe(false)
    })

    it('rejects a date in the past', () => {
      expect(isValidDateString('2020-01-01')).toBe(false)
    })
  })
})
