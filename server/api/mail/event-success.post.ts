import { Resend } from 'resend'
import { useCompiler } from '#vue-email'

export default defineEventHandler(async (event) => {
  const { resendApiKey } = useRuntimeConfig()
  const body = await readBody(event)

  const { props, to } = body

  if (!props || !to) {
    throw new Error('Missing required fields')
  }

  try {
    const resend = new Resend(resendApiKey)

    const compiled = await useCompiler('EventSuccess.vue', { props })

    await resend.emails.send({
      from: 'Nooi <zin@nooi.be>',
      subject: 'Jouw inschrijving bij Nooi',
      to,
      html: compiled.html,
    })

    return { message: 'Email sent' }
  }
  catch (error) {
    const message = (error as Error).message

    throw new Error(message)
  }
})
