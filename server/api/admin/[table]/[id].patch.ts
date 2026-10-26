export default defineEventHandler(async event => {
  await requireAdmin(event)

  const table = adminTable(event)
  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id)) {
    throw createError({ status: 400, message: 'Invalid id' })
  }

  const payload = adminPayload(await readBody(event))

  const { error } = await serviceClient()
    .from(table)
    .update(payload as never)
    .eq('id', id)

  if (error) {
    throw createError({ status: 400, message: error.message })
  }

  return { ok: true }
})
