import { Resend } from 'resend'
import { render } from '@vue-email/render'
import Template from '~~/emails/EventSuccess.vue'

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
      subject: 'Jouw reservatie voor Nooi',
      to,
      html,
    })

    return { message: 'Email sent' }
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    throw new Error(message, { cause: error })
  }
})
