export default defineEventHandler(async event => {
  const { password } = (await readBody(event)) ?? {}

  if (!passwordMatches(password)) {
    throw createError({ status: 401, message: 'Wrong password' })
  }

  const session = await adminSession(event)
  await session.update({ admin: true })

  return { authenticated: true }
})
