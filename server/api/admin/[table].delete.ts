export default defineEventHandler(async event => {
  await requireAdmin(event)

  const table = adminTable(event)
  const { ids } = (await readBody(event)) ?? {}

  if (
    !Array.isArray(ids) ||
    !ids.length ||
    !ids.every(id => Number.isInteger(id))
  ) {
    throw createError({ status: 400, message: 'Invalid ids' })
  }

  const { error } = await serviceClient().from(table).delete().in('id', ids)

  if (error) {
    throw createError({ status: 400, message: error.message })
  }

  return { ok: true }
})
