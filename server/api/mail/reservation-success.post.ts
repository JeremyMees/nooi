import Template from '~~/emails/ReservationSuccess.vue'

export default defineEventHandler(async event => {
  const { props, to } = await readBody(event)

  if (!props || !to) {
    throw new Error('Missing required fields')
  }

  const { error } = await sendMail({
    to,
    subject: 'Jouw reservatie voor Nooi',
    template: Template,
    props,
  })

  if (error) {
    throw new Error(error)
  }

  return { message: 'Email sent' }
})
