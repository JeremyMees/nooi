import type { FormKitNode } from '@formkit/core'
import { sameDay } from '@formkit/tempo'

const date_open = function (_node: FormKitNode, value: string): boolean {
  return value === 'true'
}

const time_valid = function (node: FormKitNode, day: string): boolean {
  const { value } = node as FormKitNode<string>
  const now = new Date()

  if (sameDay(new Date(day), now)) {
    const { hour, minutes } = splitTime(value)
    const nodeTime = hour + (minutes / 100)
    const nowTime = now.getHours() + (now.getMinutes() / 100)

    return nowTime < nodeTime
  }

  return true
}

const time_after = function (node: FormKitNode, start: string): boolean {
  const { value } = node as FormKitNode<string>

  if (!start || !value) {
    return false
  }

  return afterTime(value, start)
}

const time_before = function (node: FormKitNode, end: string): boolean {
  const { value } = node as FormKitNode<string>

  if (!end || !value) {
    return false
  }

  return beforeTime(value, end)
}

const time_break = function (node: FormKitNode, startNoon?: string, endNoon?: string, start?: string): boolean {
  const { value } = node as FormKitNode<string>

  if (!value) {
    return false
  }

  if (!startNoon || !endNoon) {
    return true
  }

  const afterNoonBreak = afterTime(value, startNoon) && afterTime(value, endNoon)
  const beforeNoonBreak = beforeTime(value, startNoon) && beforeTime(value, endNoon)

  if (start) {
    const startBeforeBreak = beforeTime(start, startNoon) && beforeTime(start, endNoon)

    return startBeforeBreak && afterNoonBreak
      ? false
      : afterNoonBreak || beforeNoonBreak
  }

  return afterNoonBreak || beforeNoonBreak
}

const time_slot = function (node: FormKitNode, minTime: number, start: string): boolean {
  const { value } = node as FormKitNode<string>

  const { hour: nodeHour, minutes: nodeMinutes } = splitTime(value)
  const nodeTime = nodeHour + (nodeMinutes / 100)

  const { hour: startHour, minutes: startMinutes } = splitTime(start)
  const startTime = startHour + (startMinutes / 100)

  const timeDifference = nodeTime - startTime

  return timeDifference >= minTime
}

export const rules = {
  date_open,
  time_valid,
  time_after,
  time_before,
  time_break,
  time_slot
}
