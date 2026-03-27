import { Resend } from 'resend'
import { render } from '@vue-email/render'
import Template from '~~/emails/BookingSuccess.vue'

export default defineEventHandler(async (event) => {
  const { resendApiKey } = useRuntimeConfig()
  const body = await readBody(event)

  const { props, to } = body

  if (!props || !to) {
    throw new Error('Missing required fields')
  }

  try {
    const resend = new Resend(resendApiKey)
    const html = await render(Template, props)

    await resend.emails.send({
      from: 'Nooi <zin@nooi.be>',
      subject: 'Jouw boeking voor Nooi',
      to,
      html,
    })

    return { message: 'Email sent' }
  }
  catch (error) {
    const message = (error as Error).message

    throw new Error(message)
  }
})
