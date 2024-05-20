import type { FormKitNode } from '@formkit/core'
import { sameDay } from '@formkit/tempo'

const date_open = function (_node: FormKitNode, value: string): boolean {
  return value === 'true'
}

const date_valid = function (_node: FormKitNode, day: string): boolean {
  const now = new Date()

  if (sameDay(new Date(day), now)) {
    return false
  }

  return true
}

const time_after = function (node: FormKitNode, start: string): boolean {
  const { value } = node as FormKitNode<string>

  if (!start || !value) {
    return false
  }

  return afterTime(value, start) || sameTime(value, start)
}

const time_before = function (node: FormKitNode, end: string): boolean {
  const { value } = node as FormKitNode<string>

  if (!end || !value) {
    return false
  }

  return beforeTime(value, end)
}

const time_slot = function (node: FormKitNode, minTime: number, start: string): boolean {
  const { value } = node as FormKitNode<string>

  if (!start || !value) {
    return true
  }

  const { hour: nodeHour, minutes: nodeMinutes } = splitTime(value)
  const nodeTime = nodeHour + (nodeMinutes / 100)

  const { hour: startHour, minutes: startMinutes } = splitTime(start)
  const startTime = startHour + (startMinutes / 100)

  const timeDifference = nodeTime - startTime

  return timeDifference >= minTime
}

export const rules = {
  date_open,
  date_valid,
  time_after,
  time_before,
  time_slot
}

export function checkTimeValid (node: FormKitNode, rosters: RosterRow[]): boolean {
  const { value } = node as FormKitNode<string>

  if (!value || !rosters.length) {
    return false
  }

  let valid = false

  rosters.forEach(({ start, end }) => {
    const validStart = beforeTime(value, end) || sameTime(value, end)
    const validEnd = afterTime(value, start) || sameTime(value, start)

    if (validStart && validEnd) {
      valid = true
    }
  })

  return valid
}
