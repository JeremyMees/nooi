import { Resend } from 'resend'
import { useCompiler } from '#vue-email'

const resend = new Resend(process.env.RESEND_API_KEY)

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { props, from, to, subject, template } = body

  if (!props || !from || !to || !subject || !template) {
    throw new Error('Missing required fields')
  }

  try {
    const compiled = await useCompiler(template, { props })

    await resend.emails.send({ from, to, subject, html: compiled.html })

    return { message: 'Email sent' }
  }
  catch (error) {
    throw new Error('Error sending email')
  }
})
