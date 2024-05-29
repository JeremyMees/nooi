import { Resend } from 'resend'
import { useCompiler } from '#vue-email'

export default defineEventHandler(async (event) => {
  const { resendApiKey } = useRuntimeConfig()
  const body = await readBody(event)

  const { props, from, to, subject, template } = body

  if (!props || !from || !to || !subject || !template) {
    throw new Error('Missing required fields')
  }

  try {
    const resend = new Resend(resendApiKey)

    const compiled = await useCompiler(template, { props })

    await resend.emails.send({ from, to, subject, html: compiled.html })

    return { message: 'Email sent' }
  }
  catch (error) {
    const message = (error as Error).message

    throw new Error(message)
  }
})
