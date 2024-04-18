export default {
  darkMode: 'selector',
  content: [
    './app.vue',
    './components/*.{vue,js}',
    'presets/**/*.{js,vue,ts}'
  ],
  theme: {
    extend: {
      fontFamily: {
        mukta: ['Mukta', 'sans-serif'],
        madi: ['MsMadi', 'sans-serif']
      },
      colors: {
        white: '#FEFDF7',
        black: '#0F0E0A',
        primary: {
          DEFAULT: 'rgb(var(--primary-500))',
          50: 'rgb(var(--primary-50))',
          100: 'rgb(var(--primary-100))',
          200: 'rgb(var(--primary-200))',
          300: 'rgb(var(--primary-300))',
          400: 'rgb(var(--primary-400))',
          500: 'rgb(var(--primary-500))',
          600: 'rgb(var(--primary-600))',
          700: 'rgb(var(--primary-700))',
          800: 'rgb(var(--primary-800))',
          900: 'rgb(var(--primary-900))',
          950: 'rgb(var(--primary-950))'
        },
        secondary: '#C35200',
        surface: {
          DEFAULT: 'rgb(var(--surface-500))',
          0: 'rgb(var(--surface-0))',
          50: 'rgb(var(--surface-50))',
          100: 'rgb(var(--surface-100))',
          200: 'rgb(var(--surface-200))',
          300: 'rgb(var(--surface-300))',
          400: 'rgb(var(--surface-400))',
          500: 'rgb(var(--surface-500))',
          600: 'rgb(var(--surface-600))',
          700: 'rgb(var(--surface-700))',
          800: 'rgb(var(--surface-800))',
          900: 'rgb(var(--surface-900))',
          950: 'rgb(var(--surface-950))'
        }
      }
    }
  }
}
