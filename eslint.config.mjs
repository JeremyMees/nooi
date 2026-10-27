// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    ignores: ['*.md', '**/*.md'],
  },
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      'vue/html-self-closing': [
        'warn',
        { html: { void: 'always', normal: 'always', component: 'always' } },
      ],
      'no-console': [
        'error',
        {
          allow: ['info', 'warn', 'trace', 'error'],
        },
      ],
    },
  },
  {
    files: ['test/mock/index.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
)
