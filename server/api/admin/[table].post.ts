export default defineEventHandler(async event => {
  await requireAdmin(event)

  const table = adminTable(event)
  const payload = adminPayload(await readBody(event))

  const { error } = await serviceClient()
    .from(table)
    .insert(payload as never)

  if (error) {
    throw createError({ status: 400, message: error.message })
  }

  return { ok: true }
})
