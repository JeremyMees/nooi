export default defineEventHandler(async event => {
  await requireAdmin(event)

  const table = adminTable(event)
  const options = adminQueryOptions(table, parseAdminQuery(getQuery(event)))

  return sbQuery(serviceClient(), options)
})
