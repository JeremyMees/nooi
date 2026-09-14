import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'
import { resolve } from 'node:path'

const ignoredLogs = [/^<Suspense>/, /Failed to load messages for locale/]

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
        resolve: {
          alias: {
            '/assets': resolve(__dirname, 'app/assets'),
          },
        },
        test: {
          name: 'nuxt',
          include: ['test/nuxt/**/*.{test,spec}.ts'],
          environment: 'nuxt',
        },
      }),
    ],
    onConsoleLog: l => {
      return !ignoredLogs.some(p => p.test(l))
    },
  },
})
