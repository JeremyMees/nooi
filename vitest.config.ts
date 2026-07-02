import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'
import { resolve } from 'node:path'

export default defineConfig({
  test: {
    projects: [
      {
        resolve: {
          alias: {
            '~': resolve(__dirname, 'app'),
            '~~': resolve(__dirname),
            '@@': resolve(__dirname),
            '#shared': resolve(__dirname, 'shared'),
          },
        },
        test: {
          name: 'unit',
          include: ['test/unit/**/*.{test,spec}.ts'],
          environment: 'node',
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/**/*.{test,spec}.ts'],
          environment: 'nuxt',
        },
      }),
    ],
  },
})
