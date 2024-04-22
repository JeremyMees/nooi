import type { FormKitNode } from '@formkit/core'
import { info } from '~/constants/info'

const date_open = function (node: FormKitNode): boolean {
  const { value } = node as FormKitNode<string>

  return !!info[getDayOfWeek(value)]
}

const time_after = function (node: FormKitNode, day: string): boolean {
  const { value } = node as FormKitNode<string>
  const opening = info[getDayOfWeek(day)]

  if (!opening) {
    return false
  }

  const [hour, minutes] = value.split(':')

  const afterHour = +hour >= opening.open.hour
  const afterMinutes = +minutes >= (opening.open.minute || 0)

  return afterHour || (hour === opening.open.hour.toString() && afterMinutes)
}

const time_before = function (node: FormKitNode, day: string): boolean {
  const { value } = node as FormKitNode<string>
  const opening = info[getDayOfWeek(day)]

  if (!opening) {
    return false
  }

  const [hour, minutes] = value.split(':')

  const beforeHour = +hour < opening.close.hour
  const beforeMinutes = +minutes <= (opening.close.minute || 0)

  return beforeHour || (hour === opening.close.hour.toString() && beforeMinutes)
}

const time_slot = function (node: FormKitNode, minTime: number, start: string): boolean {
  const { value } = node as FormKitNode<string>

  const [nodeHour, nodeMinutes] = value.split(':')
  const nodeTime = +nodeHour + (+nodeMinutes / 100)

  const [startHour, startMinutes] = start.split(':')
  const startTime = +startHour + (+startMinutes / 100)

  const timeDifference = nodeTime - startTime

  return timeDifference >= minTime
}

export const rules = {
  date_open,
  time_after,
  time_before,
  time_slot
}
