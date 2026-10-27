import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import { nuxtAliases, nuxtAutoImports } from './test/unit/nuxt-env.ts'

const ignoredLogs = [/^<Suspense>/, /Failed to load messages for locale/]

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [vue(), nuxtAutoImports()],
        resolve: { alias: nuxtAliases },
        test: {
          name: 'unit',
          include: ['test/unit/**/*.{test,spec}.ts'],
          environment: 'node',
        },
      },
      await defineVitestProject({
        resolve: {
          alias: {
            '/assets': resolve(import.meta.dirname, 'app/assets'),
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
    coverage: {
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
      exclude: [
        'test/**',
        'app/assets/**',
        'app/app.vue',
        'app/plugins/**',
        'formkit/**',
        'emails/**',
      ],
    },
  },
})
