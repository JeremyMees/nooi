import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { useSeo } from '~/composables/useSeo'
import config from '~~/shared/constants/seo'

const hoisted = vi.hoisted(() => ({
  useHead: vi.fn(),
  useSchemaOrg: vi.fn(),
}))

mockNuxtImport('useHead', () => hoisted.useHead)
mockNuxtImport('useSchemaOrg', () => hoisted.useSchemaOrg)

const { url, name, logo, description } = config.meta

function head() {
  return hoisted.useHead.mock.calls[0]![0]
}

function meta(id: string) {
  return head().meta.find((entry: { id: string }) => entry.id === id)
}

describe('useSeo', () => {
  beforeEach(() => {
    hoisted.useHead.mockClear()
    hoisted.useSchemaOrg.mockClear()
    useSeo()
  })

  it('keeps the site name as the title on every page', () => {
    expect(head().titleTemplate()).toBe(name)
    expect(head().name).toBe(name)
  })

  it('points the canonical link at the site url', () => {
    expect(head().link).toEqual([{ rel: 'canonical', href: url }])
  })

  it('lets search engines index and follow', () => {
    expect(meta('robots').content).toBe('index,follow')
  })

  it('describes the site for search and social', () => {
    expect(meta('description').content).toBe(description)
    expect(meta('og:description').content).toBe(description)
    expect(meta('twitter:description').content).toBe(description)
  })

  it('titles the page for social cards', () => {
    expect(meta('og:title').content).toBe(name)
    expect(meta('twitter:title').content).toBe(name)
  })

  it('shares the logo at a square size', () => {
    expect(meta('og:image').content).toBe(logo)
    expect(meta('twitter:image').content).toBe(logo)
    expect(meta('og:image:width').content).toBe(1200)
    expect(meta('og:image:height').content).toBe(1200)
    expect(meta('og:image:alt').content).toBe(name)
  })

  it('registers the page with schema.org', () => {
    expect(hoisted.useSchemaOrg).toHaveBeenCalledWith([
      expect.objectContaining({ name, url }),
    ])
  })
})
