const name = 'Kalender – Nooi'
const url = 'https://nooi.be'
const description = 'inspirerende ontmoetingsplek in het hart van Diest.'
const logo = `${url}/logo.png`

export default {
  schema: {
    organization: { name, url, logo },
    website: { name, url, description, defaultLocale: 'nl' },
  },
  meta: {
    url,
    name,
    logo,
    description,
  },
}
