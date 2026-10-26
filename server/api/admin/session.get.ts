export default defineEventHandler(async event => {
  return { authenticated: await isAdmin(event) }
})
