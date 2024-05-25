import config from '@/constants/seo'

export function useSeo() {
  const {
    url,
    name,
    logo,
    description,
  } = config.meta

  const head = computed(() => ({
    titleTemplate: () => name,
    name,
    link: [
      {
        rel: 'canonical',
        href: url,
      },
    ],
    meta: [
      {
        id: 'description',
        name: 'description',
        content: description,
      },
      {
        id: 'robots',
        name: 'robots',
        content: 'index,follow',
      },
      {
        id: 'twitter:title',
        name: 'twitter:title',
        content: name,
      },
      {
        id: 'twitter:description',
        name: 'twitter:description',
        content: description,
      },
      {
        id: 'twitter:image',
        name: 'twitter:image',
        content: logo,
      },
      {
        id: 'og:image',
        property: 'og:image',
        content: logo,
      },
      {
        id: 'og:title',
        property: 'og:title',
        content: name,
      },
      {
        id: 'og:description',
        property: 'og:description',
        content: description,
      },
    ],
  }))

  useHead(head.value)

  useSchemaOrg([defineWebPage({ name, url })])
}
